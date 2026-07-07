# 台灣鐵路即時時刻表（新專案遷移與擬定計畫）

這個計畫旨在將目前分散的三個靜態 HTML 網頁（1號：極簡風、2號：車票風、3號：儀表板風）整合遷移至一個**統一且安全的現代 Web 應用程式**，並加入 TDX API 即時列車狀態與延誤更新功能（搭載 3 分鐘快取機制，以繞過免費版每分鐘 5 次的限制）。

## 使用者審查與決策 (User Review Required)

> [!IMPORTANT]
> **專案技術選型建議（推薦方案）：**
> 我們需要一個能處理「安全 API 請求（隱藏金鑰）」的後端，以及顯示「精美 UI」的前端。
>
> 1. **方案 A（推薦）：使用 Next.js (React / Tailwind 或 Vanilla CSS)**
>    * **優點：** 前後端整合在同一個專案中。我們可以直接在 `app/api/tdx/route.js` 寫安全後端快取，在 `app/page.js` 寫前端。部署非常方便（如 Vercel 一鍵免費部署）。
>    * **缺點：** 對於不熟悉 React 的使用者，程式碼結構稍微複雜一些。
> 
> 2. **方案 B：使用 Vite (純前端) + Cloudflare Workers (免費安全後端)**
>    * **優點：** 前端依然是純粹的 HTML/JS/CSS，非常直覺好改。
>    * **缺點：** 必須維護兩個獨立的專案（一個前端網頁專案，一個 Cloudflare 後端 Proxy 專案）。

---

## 需要遷移的關鍵檔案與資料

在新專案啟動時，您需要將以下現有資源複製到新專案中：

### 1. 靜態時刻表資料
* **來源路徑：** `file:///Users/tangmaorui/Desktop/gimini%20%E7%94%A8/data.json`
* **用途：** 作為「離線/後備時刻表」。當 TDX API 故障或網路斷線時，系統會自動降級讀取此 JSON 資料，確保基本的時刻表查詢永遠可用。

### 2. 三個版型的 CSS 與 HTML 結構
* **1 號（極簡深色風）：** [1號.html](file:///Users/tangmaorui/Desktop/1%E8%99%9F.html)
* **2 號（白色車票風）：** [2號.html](file:///Users/tangmaorui/Desktop/2%E8%99%9F.html)
* **3 號（儀表板風）：** [3號.html](file:///Users/tangmaorui/Desktop/3%E8%99%9F.html)
* **遷移重點：** 
  * 提取各個檔案中 `<style>` 標籤內的 CSS，將其模組化（例如改為 `theme1.css`、`theme2.css`、`theme3.css`）。
  * 提取 DOM 結構，將其抽象化為統一的範本，透過選單切換 `class`（例如：`body.theme-ticket`、`body.theme-dashboard`）來一鍵切換外觀。

---

## 新專案的系統架構

新專案將採用以下分層架構：

```mermaid
graph TD
    User([使用者瀏覽器]) -->|1. 切換站點 / 請求更新| FE[前端 UI: React 或 HTML/JS]
    FE -->|2. 要求即時火車資料| BE[後端 Proxy: Next.js API 或 Cloudflare Worker]
    BE -->|3. 檢查快取 (未過期)| Cache[(記憶體快取: 3分鐘有效)]
    Cache -->|有快取: 立即回傳| FE
    BE -->|無快取: 4. 向 TDX 請求最新資料| TDX[交通部 TDX API]
    TDX -->|5. 回傳最新列車與延誤資料| BE
    BE -->|6. 更新快取並回傳給瀏覽器| FE
```

---

## 遷移與實作步驟

### 階段一：建立新專案環境
1. 初始化 React/Next.js 專案（若選擇方案 A）。
2. 將 [data.json](file:///Users/tangmaorui/Desktop/gimini%20%E7%94%A8/data.json) 放進專案的 `public/` 或 `assets/` 資料夾。

### 階段二：建立安全後端 Proxy (API Gate)
1. 寫一個 API 端點 `/api/trains?origin={origin_code}&dest={dest_code}`。
2. 在後端實作 TDX OAuth2 Token 自動更新機制（將 Token 快取 1 天）。
3. 實作火車即時動態查詢，並將查詢結果（如「桃園 -> 基隆」列車）在伺服器端快取 3 分鐘。

### 階段三：前端介面與主題整合
1. 將 1、2、3 號的 HTML 結構與 CSS 移植至前端頁面。
2. 設計一個「主題切換器」按鈕（例如在網頁右上角），允許使用者一鍵在三個版型之間切換。
3. 統一前端邏輯：
   * 抓取 API 資料：成功時顯示即時誤點資訊，失敗時讀取本地 `data.json` 靜態班表。
   * 計算即時倒數時間（包含延誤時間的修正）。

---

## 驗證計畫

### 自動化與功能測試
* 測試 API 端點是否能正確抓取 TDX 資料。
* 驗證在 3 分鐘內重複呼叫該端點，是否回傳相同的快取資料（不增加 TDX API 呼叫次數）。
* 測試切換「極簡風」、「車票風」和「儀表板風」時，版面與文字比例是否均正常縮放。

### 手動測試
* 模擬網路斷線，驗證系統是否能成功降級讀取本地 `data.json`。
* 比對台鐵官方即時狀態，驗證我們時刻表上的「延誤分鐘數」與官方完全一致。
