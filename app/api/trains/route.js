import { NextResponse } from 'next/server';
import staticData from '../../../public/data.json'; 

// ==========================================
// 🛡️ 記憶體安全與全域快取防護區
// ==========================================
const apiCache = new Map();
const fetchPromises = new Map();
const GLOBAL_CACHE_KEY = 'ALL_STATIONS_LIVE_BOARD';

// 1. 動態讀取有效車站名單（啟動時只計算一次）
let VALID_STATIONS = new Set();
try {
  const allStations = [
    ...(staticData.Northbound?.stations || []),
    ...(staticData.Southbound?.stations || [])
  ];
  VALID_STATIONS = new Set(allStations);
} catch (e) {
  console.error("解析 data.json 失敗，使用預設白名單防護", e);
  VALID_STATIONS = new Set(["桃園", "基隆", "臺北", "板橋"]);
}

// 2. Token 記憶體管理（捕捉 401 強制刷新）
let tokenCache = { token: null, expiresAt: 0 };

async function getTdxToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && tokenCache.token && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const clientId = process.env.TDX_CLIENT_ID;
  const clientSecret = process.env.TDX_CLIENT_SECRET;

  // 🛡️ 漏洞修補 #1：防止無憑證時仍繼續執行後續邏輯
  if (!clientId || !clientSecret) {
    console.error('[TDX Auth] 環境變數 TDX_CLIENT_ID / TDX_CLIENT_SECRET 未設定，拒絕請求');
    return null;
  }

  const authUrl = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });

  try {
    const res = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) throw new Error(`Failed to fetch TDX token: ${res.status}`);
    const data = await res.json();
    
    // 🛡️ 漏洞修補 #2：驗證 Token 回應欄位是否合法，防止格式異常造成 undefined 快取
    if (!data.access_token || typeof data.access_token !== 'string' || !data.expires_in) {
      throw new Error('TDX token response has invalid shape');
    }

    tokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in - 60) * 1000
    };
    return data.access_token;
  } catch (error) {
    console.error('Error fetching TDX token:', error);
    // 🛡️ 漏洞修補 #3：Token 取得失敗時清除舊快取，避免用過期 Token 重試
    tokenCache = { token: null, expiresAt: 0 };
    return null;
  }
}

export async function GET(request) {
  // ========================================
  // 🛡️ 第一道防線：來源驗證 (Host + Referer)
  // ========================================
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // 精確白名單（Exact Match），全面禁止萬用字元與模糊匹配
  const allowedHosts = new Set(
    process.env.ALLOWED_HOSTS
      ? process.env.ALLOWED_HOSTS.split(',').map(h => h.trim())
      : ['localhost:3000', 'taiwan-train-live.web.app', 'lpes104047.web.app', 'tra-pass.vercel.app']
  );

  if (process.env.NODE_ENV === 'production') {
    const isHostAllowed = host && allowedHosts.has(host);

    let isValidReferer = true;
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        isValidReferer = allowedHosts.has(refererUrl.host);
      } catch {
        isValidReferer = false;
      }
    }

    if (!isHostAllowed || !isValidReferer) {
      console.warn(`[Security Block] Access Denied for referer: ${referer}, host: ${host}`);
      return NextResponse.json({ error: 'Forbidden: Access Denied' }, { status: 403 });
    }
  }

  // ========================================
  // 🛡️ 第二道防線：輸入驗證
  // ========================================
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const bypass = searchParams.get('bypass') === 'true';

  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    // 🛡️ 漏洞修補 #4：在每個 API 回應中明確加上 X-Content-Type-Options，防止 MIME sniffing
    'X-Content-Type-Options': 'nosniff',
  };

  // 🛡️ 漏洞修補 #5：origin 需同時通過「非空」、「非陣列」、「白名單比對」三道驗證，
  //                  防止攻擊者傳入 origin[]=... 等陣列型 query string 繞過比對
  if (!origin || typeof origin !== 'string' || !VALID_STATIONS.has(origin)) {
    return NextResponse.json({ error: 'Invalid origin station' }, { status: 400, headers: noCacheHeaders });
  }

  // ========================================
  // 🛡️ 第三道防線：速率限制與全域快取
  // ========================================
  const nowMs = Date.now();
  const cachedData = apiCache.get(GLOBAL_CACHE_KEY);

  if (cachedData) {
    const timeDiff = nowMs - cachedData.timestamp;

    // 🛡️【20 秒絕對極限防護】：無論 bypass 參數，距離上次 TDX 請求 < 20 秒絕對不放行
    if (timeDiff < 20000) {
      return NextResponse.json({ data: cachedData.data[origin] || {} }, { headers: noCacheHeaders });
    }

    // 🛡️【180 秒常規快取】：bypass=false 時，3 分鐘內直接回傳快取資料
    if (!bypass && timeDiff < 180000) {
      return NextResponse.json({ data: cachedData.data[origin] || {} }, { headers: noCacheHeaders });
    }
  }

  // ========================================
  // 🛡️ 第四道防線：防快取擊穿 Promise 鎖
  // ========================================
  if (fetchPromises.has(GLOBAL_CACHE_KEY)) {
    try {
      const globalData = await fetchPromises.get(GLOBAL_CACHE_KEY);
      return NextResponse.json({ data: (globalData || {})[origin] || {} }, { headers: noCacheHeaders });
    } catch {
      // 即使等待中的 Promise 失敗，也不向外傳播，直接降回快取兜底
    }
  }

  // ========================================
  // 🌟 核心：向 TDX 取得全台即時動態
  // ========================================
  const fetchTask = (async () => {
    let token = await getTdxToken();
    if (!token) return {};

    const tdxUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard?$format=JSON`;

    let res = await fetch(tdxUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000)
    });

    if (res.status === 401) {
      token = await getTdxToken(true);
      // 🛡️ 漏洞修補 #6：Token 刷新失敗（null）時提早 throw，避免帶 undefined Token 繼續請求
      if (!token) throw new Error('TDX token refresh failed after 401');
      res = await fetch(tdxUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      });
    }

    if (!res.ok) throw new Error(`TDX fetch failed: ${res.status}`);
    const data = await res.json();

    // 🌟 O(N) 記憶體分組轉換
    const globalDelayMap = {};
    if (Array.isArray(data)) {
      data.forEach(train => {
        const station = train.StationName?.Zh_tw;
        // 僅接受已在白名單內的車站資料，丟棄陌生欄位
        if (station && typeof station === 'string' && VALID_STATIONS.has(station)) {
          if (!globalDelayMap[station]) globalDelayMap[station] = {};
          // 強制型別確認：DelayTime 必須是數字
          const delay = typeof train.DelayTime === 'number' ? train.DelayTime : 0;
          globalDelayMap[station][train.TrainNo] = delay;
        }
      });
    }

    apiCache.set(GLOBAL_CACHE_KEY, { data: globalDelayMap, timestamp: Date.now() });
    return globalDelayMap;
  })();

  fetchPromises.set(GLOBAL_CACHE_KEY, fetchTask);

  try {
    const globalDelayMap = await fetchTask;
    return NextResponse.json({ data: (globalDelayMap || {})[origin] || {} }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('TDX API Error:', error);
    const fallback = apiCache.get(GLOBAL_CACHE_KEY);
    if (fallback) {
      return NextResponse.json({ data: fallback.data[origin] || {} }, { headers: noCacheHeaders });
    }
    return NextResponse.json({ data: {} }, { status: 500, headers: noCacheHeaders });
  } finally {
    fetchPromises.delete(GLOBAL_CACHE_KEY);
  }
}