import { NextResponse } from 'next/server';

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
      // Token 可以快取很久 (通常是 24 小時)，這裡設定 12 小時 (43200 秒)
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

// 記憶體快取，防止使用者狂按 F5 把額度刷爆
let apiCache = {}; 

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const bypass = searchParams.get('bypass') === 'true';

  if (!origin) {
    return NextResponse.json({ error: 'Origin station is required' }, { status: 400 });
  }

  try {
    const nowMs = Date.now();
    const cachedData = apiCache[origin];

    // 【安全加固區塊】
    if (cachedData) {
      const timeDiff = nowMs - cachedData.timestamp;
      
      // 1. 絕對硬性防護：無論是否 bypass，15 秒內絕對不允許向 TDX 發送新請求 (防止惡意 DDoS)
      if (timeDiff < 15000) {
        console.log(`[Security Block] Blocked rapid bypass attempt for ${origin}. Serving cache.`);
        return NextResponse.json({ data: cachedData.data });
      }

      // 2. 常規快取：如果沒有強制 bypass，且在 3 分鐘內，回傳快取
      if (!bypass && timeDiff < 180000) {
        console.log(`[Protective Cache Hit] Returning cached TDX data for ${origin}`);
        return NextResponse.json({ data: cachedData.data });
      }
    }

    const token = await getTdxToken();
    
    // 如果沒有 Token (沒設定金鑰)，回傳空物件讓前端自動降級
    if (!token) {
      return NextResponse.json({ data: {} });
    }

    // 呼叫 TDX 即時看板 API，過濾出該出發站的資料
    const tdxUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard?$filter=StationName/Zh_tw eq '${encodeURIComponent(origin)}'&$format=JSON`;

    const res = await fetch(tdxUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch TDX live board');
    }

    const data = await res.json();
    
    // 將資料簡化為我們需要的格式 (車次號碼 -> 延誤分鐘數)
    const delayMap = {};
    if (Array.isArray(data)) {
      data.forEach(train => {
        delayMap[train.TrainNo] = train.DelayTime || 0;
      });
    }

    // 更新記憶體快取
    apiCache[origin] = {
      data: delayMap,
      timestamp: nowMs
    };

    console.log(`[TDX Fetch] Successfully fetched live data for ${origin}`);
    return NextResponse.json({ data: delayMap });

  } catch (error) {
    console.error('TDX API Error:', error);
    // 發生錯誤時回傳空資料，讓前端降級使用本地 json
    return NextResponse.json({ data: {} }, { status: 500 });
  }
}
