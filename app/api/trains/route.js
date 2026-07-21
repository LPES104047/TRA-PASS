import { NextResponse } from 'next/server';
import staticData from '../../../public/data.json'; 

// ==========================================
// 🛡️ 記憶體安全與全域快取防護區
// ==========================================
const apiCache = new Map();
const fetchPromises = new Map();
const GLOBAL_CACHE_KEY = 'ALL_STATIONS_LIVE_BOARD'; // 全域快取鍵值

// 1. 動態讀取有效車站名單
let VALID_STATIONS = new Set();
try {
  const allStations = [...(staticData.Northbound?.stations || []), ...(staticData.Southbound?.stations || [])];
  VALID_STATIONS = new Set(allStations);
} catch (e) {
  console.error("解析 data.json 失敗，使用預設白名單防護", e);
  VALID_STATIONS = new Set(["桃園", "基隆", "臺北", "板橋"]); 
}

// 2. Token 記憶體管理 (為了捕捉 401 錯誤並強制刷新)
let tokenCache = { token: null, expiresAt: 0 };

async function getTdxToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && tokenCache.token && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const clientId = process.env.TDX_CLIENT_ID;
  const clientSecret = process.env.TDX_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

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
      signal: AbortSignal.timeout(5000) // 🛡️ 5秒強制超時防掛起
    });
    
    if (!res.ok) throw new Error('Failed to fetch TDX token');
    const data = await res.json();
    
    tokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in - 60) * 1000
    };
    return data.access_token;
  } catch (error) {
    console.error('Error fetching TDX token:', error);
    return null;
  }
}

export async function GET(request) {
  // 🛡️ 邊界防禦：嚴格檢查 Referer，防止 API 盜刷 (修補 Host Header 偽造漏洞)
  const referer = request.headers.get('referer');
  const secFetchSite = request.headers.get('sec-fetch-site');
  const host = request.headers.get('host');
  
  // 嚴格白名單：將 Firebase App Hosting 正式網域加入陣列
  const allowedHosts = process.env.ALLOWED_HOSTS 
    ? process.env.ALLOWED_HOSTS.split(',') 
    : ['localhost:3000', 'taiwan-train-live.web.app', 'lpes104047.web.app', 'tra-pass.vercel.app']; 
  
  if (process.env.NODE_ENV === 'production') {
    let isSameOrigin = secFetchSite === 'same-origin';
    const isVercel = host && host.endsWith('.vercel.app');
    const isHostAllowed = allowedHosts.includes(host) || isVercel;
    
    if (!isSameOrigin && referer) {
      try {
        const refererUrl = new URL(referer);
        // 🛡️ 雙重核對：Referer 的 host 必須等於當前請求的 host，且該 host【必須在白名單內或為 Vercel 網域】！
        isSameOrigin = (refererUrl.host === host) && isHostAllowed;
      } catch {
        isSameOrigin = false;
      }
    } else if (referer === null && secFetchSite === null) {
      // 🛡️ 防禦無 Referer 且無 Sec-Fetch-Site 的直接 API 呼叫，強體驗主機白名單
      isSameOrigin = isHostAllowed;
    } else {
      // 🛡️ 安全起見，若是 same-origin 請求也同時核對主機白名單
      isSameOrigin = isSameOrigin && isHostAllowed;
    }
    
    if (!isSameOrigin) {
      console.warn(`[Security Block] Access Denied for referer: ${referer}, host: ${host}`);
      return NextResponse.json({ error: 'Forbidden: Access Denied' }, { status: 403 });
    }
  }

  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const bypass = searchParams.get('bypass') === 'true';

  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  if (!origin || !VALID_STATIONS.has(origin)) {
    return NextResponse.json({ error: 'Invalid origin station' }, { status: 400, headers: noCacheHeaders });
  }

  const nowMs = Date.now();
  const cachedData = apiCache.get(GLOBAL_CACHE_KEY);

  if (cachedData) {
    const timeDiff = nowMs - cachedData.timestamp;
    
    // 🛡️【20 秒絕對極限防護】：對齊前端按鈕冷卻時間。
    // 無論駭客怎麼帶 bypass 參數，距離上次更新小於 20 秒絕對不准碰 TDX！
    // 這確保了 Vercel 每分鐘最高只會呼叫 TDX 3 次 (低於每分鐘 5 次的極限限制)
    if (timeDiff < 20000) {
      return NextResponse.json({ data: cachedData.data[origin] || {} }, { headers: noCacheHeaders });
    }
    
    // 🛡️【180 秒常規快取】：如果使用者沒有要求強制更新 (bypass=false)，3 分鐘內都給舊資料
    if (!bypass && timeDiff < 180000) {
      return NextResponse.json({ data: cachedData.data[origin] || {} }, { headers: noCacheHeaders });
    }
  }

  // 🛡️ 防止快取擊穿的全域鎖 (多請求同時湧入時，只讓第一個去打 TDX)
  if (fetchPromises.has(GLOBAL_CACHE_KEY)) {
    try {
      const globalData = await fetchPromises.get(GLOBAL_CACHE_KEY);
      return NextResponse.json({ data: globalData[origin] || {} }, { headers: noCacheHeaders });
    } catch {}
  }

  const fetchTask = (async () => {
    let token = await getTdxToken();
    if (!token) return {};

    // 🌟 核心進化：移除單站 filter，一次呼叫取得全台即時動態
    const tdxUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard?$format=JSON`;
    
    let res = await fetch(tdxUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000) // 🛡️ 8秒強制超時
    });

    if (res.status === 401) {
      token = await getTdxToken(true);
      res = await fetch(tdxUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      });
    }

    if (!res.ok) throw new Error(`TDX fetch failed: ${res.status}`);
    const data = await res.json();
    
    // 🌟 在記憶體中進行分組轉換 (O(N) 效能極高)
    const globalDelayMap = {};
    if (Array.isArray(data)) {
      data.forEach(train => {
        const station = train.StationName?.Zh_tw;
        if (station) {
          if (!globalDelayMap[station]) globalDelayMap[station] = {};
          globalDelayMap[station][train.TrainNo] = train.DelayTime || 0;
        }
      });
    }

    apiCache.set(GLOBAL_CACHE_KEY, { data: globalDelayMap, timestamp: Date.now() });
    return globalDelayMap;
  })();

  fetchPromises.set(GLOBAL_CACHE_KEY, fetchTask);

  try {
    const globalDelayMap = await fetchTask;
    return NextResponse.json({ data: globalDelayMap[origin] || {} }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('TDX API Error:', error);
    // 發生錯誤時，若有舊的全台資料快取，優先使用舊資料墊檔，確保畫面不白屏
    const fallback = apiCache.get(GLOBAL_CACHE_KEY);
    if (fallback) {
      return NextResponse.json({ data: fallback.data[origin] || {} }, { headers: noCacheHeaders });
    }
    return NextResponse.json({ data: {} }, { status: 500, headers: noCacheHeaders });
  } finally {
    fetchPromises.delete(GLOBAL_CACHE_KEY);
  }
}