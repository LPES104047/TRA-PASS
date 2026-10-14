import { NextResponse } from 'next/server';
import staticData from '../../../public/data.json'; 

// ==========================================
// 🛡️ 記憶體安全與全域快取防護區
// ==========================================
const apiCache = new Map();
const fetchPromises = new Map();
const GLOBAL_CACHE_KEY = 'ALL_STATIONS_LIVE_BOARD';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Content-Type-Options': 'nosniff',
};

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

// 2. 主機白名單與正規化函式（啟動時預先編譯）
function normalizeHost(rawHost) {
  if (!rawHost || typeof rawHost !== 'string') return '';
  let host = rawHost.trim().toLowerCase();
  // 移除標準通訊埠 (:80, :443)；保留如 :3000 等非標準開發埠
  host = host.replace(/:(80|443)$/, '');
  return host;
}

const DEFAULT_ALLOWED_HOSTS = ['localhost:3000', 'taiwan-train-live.web.app', 'lpes104047.web.app', 'tra-pass.vercel.app'];
const ALLOWED_HOSTS = new Set(
  (process.env.ALLOWED_HOSTS
    ? process.env.ALLOWED_HOSTS.split(',').map(h => h.trim())
    : DEFAULT_ALLOWED_HOSTS
  ).map(normalizeHost)
);

// 3. 請求來源防護（CORS / Host / Sec-Fetch-Site / Referer / Origin）
function validateRequestOrigin(request) {
  if (process.env.NODE_ENV !== 'production') return true;

  // 🛡️ 防禦跨站偽造：攔截惡意跨站腳本請求
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return false;
  }

  // 🛡️ 支援反向代理：優先讀取 x-forwarded-host，容錯至 host 標頭
  const hostHeader = request.headers.get('host');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const canonicalHost = normalizeHost(forwardedHost ? forwardedHost.split(',')[0] : hostHeader);

  if (!canonicalHost || !ALLOWED_HOSTS.has(canonicalHost)) {
    return false;
  }

  // 🛡️ Origin 標頭嚴格校驗
  const originHeader = request.headers.get('origin');
  if (originHeader) {
    try {
      const originUrl = new URL(originHeader);
      if (!ALLOWED_HOSTS.has(normalizeHost(originUrl.host))) {
        return false;
      }
    } catch {
      return false;
    }
  }

  // 🛡️ Referer 標頭嚴格校驗
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (!ALLOWED_HOSTS.has(normalizeHost(refererUrl.host))) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

// 4. Token 記憶體管理與互斥鎖（防止並發 OAuth Stampede）
let tokenCache = { token: null, expiresAt: 0 };
let tokenFetchPromise = null;

async function getTdxToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && tokenCache.token && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  if (tokenFetchPromise) {
    try {
      return await tokenFetchPromise;
    } catch {
      // 鎖釋放後若失敗繼續往下重新嘗試
    }
  }

  const clientId = process.env.TDX_CLIENT_ID;
  const clientSecret = process.env.TDX_CLIENT_SECRET;

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

  tokenFetchPromise = (async () => {
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
      tokenCache = { token: null, expiresAt: 0 };
      return null;
    } finally {
      tokenFetchPromise = null;
    }
  })();

  return await tokenFetchPromise;
}

export async function GET(request) {
  // ========================================
  // 🛡️ 第一道防線：來源驗證與 CPDoS 防護
  // ========================================
  if (!validateRequestOrigin(request)) {
    console.warn(`[Security Block] Access Denied for request to ${request.url}`);
    // 🛡️ 根除 CPDoS：403 必須帶上 noCacheHeaders，嚴禁中間代理快取錯誤狀態
    return NextResponse.json({ error: 'Forbidden: Access Denied' }, { status: 403, headers: noCacheHeaders });
  }

  // ========================================
  // 🛡️ 第二道防線：輸入驗證
  // ========================================
  const { searchParams } = new URL(request.url);
  const rawOrigin = searchParams.get('origin');
  const origin = rawOrigin ? rawOrigin.trim() : null;
  const bypass = searchParams.get('bypass') === 'true';

  // 🛡️ origin 白名單驗證
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
  // 🛡️ 第四道防線：防快取擊穿 Promise 鎖（Thundering Herd 根除）
  // ========================================
  if (fetchPromises.has(GLOBAL_CACHE_KEY)) {
    try {
      const globalData = await fetchPromises.get(GLOBAL_CACHE_KEY);
      return NextResponse.json({ data: (globalData || {})[origin] || {} }, { headers: noCacheHeaders });
    } catch {
      // 🛡️ 根除 Thundering Herd：即使等待中的 Promise 失敗，立即降回快取兜底，嚴禁重複發起 TDX 請求
      const fallback = apiCache.get(GLOBAL_CACHE_KEY);
      if (fallback) {
        return NextResponse.json({ data: fallback.data[origin] || {} }, { headers: noCacheHeaders });
      }
      return NextResponse.json({ data: {} }, { status: 500, headers: noCacheHeaders });
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
      if (!token) throw new Error('TDX token refresh failed after 401');
      res = await fetch(tdxUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      });
    }

    if (!res.ok) throw new Error(`TDX fetch failed: ${res.status}`);
    const data = await res.json();

    // 🌟 O(N) 記憶體分組轉換與防快取污染校驗
    const globalDelayMap = {};
    if (Array.isArray(data) && data.length > 0) {
      data.forEach(train => {
        const station = train.StationName?.Zh_tw;
        if (station && typeof station === 'string' && VALID_STATIONS.has(station)) {
          if (!globalDelayMap[station]) globalDelayMap[station] = {};
          const delay = typeof train.DelayTime === 'number' ? train.DelayTime : 0;
          globalDelayMap[station][train.TrainNo] = Math.max(0, Math.min(delay, 720));
        }
      });
      // 🛡️ 防快取污染：僅在上游回傳有效陣列時更新快取
      apiCache.set(GLOBAL_CACHE_KEY, { data: globalDelayMap, timestamp: Date.now() });
    }

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