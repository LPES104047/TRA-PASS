import { NextResponse } from 'next/server';

// ==========================================
// 🛡️ 記憶體安全防護區
// ==========================================
// 1. 拒絕使用 {}，改用 Map 以防範 Prototype Pollution (記憶體擴權攻擊)
const apiCache = new Map();

// 2. 快取鎖 (Promise Lock)：防止併發導致的 Cache Stampede (快取擊穿)
const fetchPromises = new Map();

// 3. 嚴格白名單：阻擋惡意參數引發的 Memory Leak (請補齊您所有的有效車站名稱)
const VALID_STATIONS = new Set([
  "基隆", "三坑", "八堵", "七堵", "百福", "五堵", "汐止", "汐科", "南港", "松山", 
  "臺北", "萬華", "板橋", "浮洲", "樹林", "南樹林", "山佳", "鶯歌", "鳳鳴", "桃園"
]);

// 取得 TDX Access Token
async function getTdxToken() {
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
      next: { revalidate: 43200 } 
    });
    
    if (!res.ok) throw new Error('Failed to fetch TDX token');
    const data = await res.json();
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

  // 🛡️ 驗證：絕對白名單攔截，防禦記憶體無限擴張攻擊
  if (!origin || !VALID_STATIONS.has(origin)) {
    return NextResponse.json({ error: 'Invalid origin station' }, { status: 400 });
  }

  const nowMs = Date.now();
  const cachedData = apiCache.get(origin);

  // 🛡️ 驗證：API 呼叫硬限制與防繞過機制
  if (cachedData) {
    const timeDiff = nowMs - cachedData.timestamp;
    
    // 【極限煞車】無論是否要求 bypass，15 秒內絕對不允許向 TDX 發送新請求 (防腳本 DDoS)
    if (timeDiff < 15000) {
      console.log(`[Security Block] Blocked rapid request for ${origin}`);
      return NextResponse.json({ data: cachedData.data });
    }
    // 【常規快取】3 分鐘 (180,000 ms) 內，且無 bypass，返回快取
    if (!bypass && timeDiff < 180000) {
      console.log(`[Cache Hit] Serving ${origin}`);
      return NextResponse.json({ data: cachedData.data });
    }
  }

  // 🛡️ 驗證：防止快取擊穿 (Cache Stampede)
  // 如果此時已經有另一個請求正在抓取同一個車站的資料，直接等待它的結果，不重複發送 API
  if (fetchPromises.has(origin)) {
    console.log(`[Concurrency Lock] Waiting for existing fetch task for ${origin}`);
    try {
      const data = await fetchPromises.get(origin);
      return NextResponse.json({ data });
    } catch (e) {
      // 若原來的 Promise 失敗，就繼續往下自己執行
    }
  }

  // 建立實際抓取 TDX 資料的非同步任務
  const fetchTask = (async () => {
    const token = await getTdxToken();
    if (!token) return {};

    const tdxUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard?$filter=StationName/Zh_tw eq '${encodeURIComponent(origin)}'&$format=JSON`;
    const res = await fetch(tdxUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Failed to fetch TDX live board');
    const data = await res.json();
    
    const delayMap = {};
    if (Array.isArray(data)) {
      data.forEach(train => {
        delayMap[train.TrainNo] = train.DelayTime || 0;
      });
    }

    // 🛡️ OOM 防護：即使有白名單，依然確保記憶體安全水位 (不會超過 300 站)
    if (apiCache.size > 300) {
      apiCache.clear();
    }

    apiCache.set(origin, {
      data: delayMap,
      timestamp: Date.now()
    });

    return delayMap;
  })();

  // 紀錄 Promise，讓後續併發的請求可以共享結果
  fetchPromises.set(origin, fetchTask);

  try {
    const delayMap = await fetchTask;
    console.log(`[TDX Fetch] Data updated for ${origin}`);
    return NextResponse.json({ data: delayMap });
  } catch (error) {
    console.error('TDX API Error:', error);
    return NextResponse.json({ data: {} }, { status: 500 });
  } finally {
    // 無論成功或失敗，任務完成後解除鎖定
    fetchPromises.delete(origin);
  }
}
