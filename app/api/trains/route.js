import { NextResponse } from 'next/server';
// ⚡️ 直接使用 import 引入 JSON，讓 Webpack/Vercel 自動追蹤並打包，避免 Serverless 環境找不到檔案
import staticData from '../../../public/data.json'; 

// ==========================================
// 🛡️ 記憶體安全防護區
// ==========================================
const apiCache = new Map();
const fetchPromises = new Map();

// 1. 動態讀取有效車站名單 (透過靜態引入)
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
  // 若未過期且不強制刷新，回傳記憶體中的 Token
  if (!forceRefresh && tokenCache.token && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const clientId = process.env.TDX_CLIENT_ID;
  const clientSecret = process.env.TDX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("TDX credentials missing, using fallback.");
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
      cache: 'no-store', // 捨棄原生快取，由上方邏輯接管
      signal: AbortSignal.timeout(5000) // 🛡️ 資訊安全防禦：5秒強制超時
    });
    
    if (!res.ok) throw new Error('Failed to fetch TDX token');
    const data = await res.json();
    
    tokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in - 60) * 1000 // 提早 60 秒判定過期
    };
    return data.access_token;
  } catch (error) {
    console.error('Error fetching TDX token:', error);
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const bypass = searchParams.get('bypass') === 'true';

  if (!origin || !VALID_STATIONS.has(origin)) {
    return NextResponse.json({ error: 'Invalid origin station' }, { status: 400 });
  }

  const nowMs = Date.now();
  const cachedData = apiCache.get(origin);

  if (cachedData) {
    const timeDiff = nowMs - cachedData.timestamp;
    if (timeDiff < 15000) {
      return NextResponse.json({ data: cachedData.data });
    }
    if (!bypass && timeDiff < 180000) {
      return NextResponse.json({ data: cachedData.data });
    }
  }

  if (fetchPromises.has(origin)) {
    try {
      const data = await fetchPromises.get(origin);
      return NextResponse.json({ data });
    } catch (e) {
      // 繼續往下執行
    }
  }

  const fetchTask = (async () => {
    let token = await getTdxToken();
    if (!token) return {};

    const tdxUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard?$filter=StationName/Zh_tw eq '${encodeURIComponent(origin)}'&$format=JSON`;
    
    let res = await fetch(tdxUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000) // 🛡️ 資訊安全防禦：8秒強制超時
    });

    // 🛡️ 【401 自癒機制】如果 TDX 提前撤銷 Token，強制重啟並重試一次
    if (res.status === 401) {
      console.log(`[Token Expired] Force refreshing token for ${origin}...`);
      token = await getTdxToken(true);
      res = await fetch(tdxUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000) // 🛡️ 資訊安全防禦：8秒強制超時
      });
    }

    if (!res.ok) throw new Error(`Failed to fetch TDX live board: ${res.status}`);
    const data = await res.json();
    
    const delayMap = {};
    if (Array.isArray(data)) {
      data.forEach(train => {
        delayMap[train.TrainNo] = train.DelayTime || 0;
      });
    }

    if (apiCache.size > 300) apiCache.clear();
    apiCache.set(origin, { data: delayMap, timestamp: Date.now() });

    return delayMap;
  })();

  fetchPromises.set(origin, fetchTask);

  try {
    const delayMap = await fetchTask;
    return NextResponse.json({ data: delayMap });
  } catch (error) {
    console.error('TDX API Error:', error);
    return NextResponse.json({ data: {} }, { status: 500 });
  } finally {
    fetchPromises.delete(origin);
  }
}