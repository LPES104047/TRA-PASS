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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');

  if (!origin) {
    return NextResponse.json({ error: 'Origin station is required' }, { status: 400 });
  }

  try {
    const token = await getTdxToken();
    
    // 如果沒有 Token (沒設定金鑰)，回傳空物件讓前端自動降級
    if (!token) {
      return NextResponse.json({ data: {} });
    }

    // 呼叫 TDX 即時看板 API，過濾出該出發站的資料
    const tdxUrl = `https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard?$filter=StationName/Zh_tw eq '${encodeURIComponent(origin)}'&$format=JSON`;
    
    // 抓取當下的 UTC 時間並換算為台灣時間 (UTC+8)
    const now = new Date();
    const taiwanHour = (now.getUTCHours() + 8) % 24;

    let revalidateSeconds = 30; // 白天時段 30 秒快取
    if (taiwanHour >= 23 || taiwanHour < 5) {
      revalidateSeconds = 300; // 半夜時段 5 分鐘快取
    }

    const res = await fetch(tdxUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      // 動態設定快取秒數
      next: { revalidate: revalidateSeconds }
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

    return NextResponse.json({ data: delayMap });

  } catch (error) {
    console.error('TDX API Error:', error);
    // 發生錯誤時回傳空資料，讓前端降級使用本地 json
    return NextResponse.json({ data: {} }, { status: 500 });
  }
}
