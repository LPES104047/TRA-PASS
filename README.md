# TRA PASS | 台鐵即時時刻表 🚄

TRA PASS 是一個現代化、即時、且擁有動態美學的台鐵時刻表 Web App。
專注於提供使用者最精準的火車動態資訊，並透過美觀的 UI 與流暢的微動畫，打造極致的乘車查詢體驗。

## ✨ 核心特色 (Features)

- **即時動態 (Live Board)**：直接串接交通部 TDX 運輸資料流通服務，精準顯示火車延誤與預估發車時間。
- **無縫跨分頁同步 (Cross-Tab Sync)**：獨家實作 `localStorage` 底層同步機制。多開分頁、F5 重新整理皆能達到 **0 秒延遲**秒讀快取。
- **背景絕對時鐘 (Absolute Clock)**：解決了瀏覽器在背景休眠時會造成計時器凍結的問題，確保倒數計時與全域防護鎖永遠精準。
- **智慧冷卻防護 (Smart Backoff)**：
  - `20 秒` 全域跨分頁 API 實體鎖，防止惡意連擊。
  - `30 秒` 無效資料降級冷卻。
  - `60 秒` 網路斷線避讓期，防止前端對伺服器發起 DDoS。
- **多重主題切換 (Theming)**：內建「極簡風」、「車票風 (Ticket Style)」等多套動態主題，一鍵切換視覺風格。

## 🛠️ 技術堆疊 (Tech Stack)

- **前端框架**: Next.js 16 (App Router) + React 19
- **樣式**: Vanilla CSS + 原生動態微動畫
- **資料來源**: 交通部 TDX 運輸資料流通服務 API
- **部署平台**: Vercel / Firebase App Hosting

## 🚀 執行與開發 (Development)

1. 安裝依賴套件：
   ```bash
   npm install
   ```

2. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

3. 打開 [http://localhost:3000](http://localhost:3000) 即可預覽。

---
*© 2024 TRA PASS Team. All rights reserved.*
