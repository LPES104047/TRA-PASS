// TRA PASS: Global Constants & Whitelists
// Module: lib/constants.js

export const ALLOWED_STATIONS = [
  "桃園", "鳳鳴", "鶯歌", "山佳", "南樹林", "樹林", "浮洲", "板橋", "萬華", "臺北",
  "松山", "南港", "汐科", "汐止", "五堵", "百福", "七堵", "八堵", "三坑", "基隆"
];

export const ALLOWED_STATIONS_SET = new Set(ALLOWED_STATIONS);

export const DEFAULT_ORIGIN = "桃園";
export const DEFAULT_DEST = "基隆";

export const ALLOWED_THEMES = [1, 2, 3];
export const DEFAULT_THEME = 1;

export const TIMING_CONFIG = {
  LIVE_CONNECTION_TIMEOUT_SECS: 300,      // 5 分鐘自動中斷 (防背景消耗流量)
  MANUAL_REFRESH_COOLDOWN_SECS: 20,       // 手動刷新 20 秒冷卻
  GLOBAL_FETCH_THROTTLE_MS: 20000,        // 跨分頁全域防刷 (20秒)
  AUTO_REFRESH_INTERVAL_SECS: 180,        // 正常即時誤點自動刷新間隔 (3分鐘)
  RETRY_NO_DATA_SECS: 30,                 // 查無資料時重試間隔
  RETRY_ERROR_SECS: 60,                   // 網路錯誤重試間隔
  ANIMATION_FIRST_STAGE_MS: 2000,         // 動畫第一階段
  ANIMATION_TOTAL_MS: 4000,               // 動畫總時長
};

export const STORAGE_KEYS = {
  ORIGIN: "train_origin",
  DEST: "train_dest",
  THEME: "train_theme",
  LIVE_CONNECTION_EXPIRE: "live_connection_expire_time",
  MANUAL_REFRESH_COOLDOWN_EXPIRE: "manual_refresh_cooldown_expire_time",
  GLOBAL_LAST_FETCH: "traPass_global_last_fetch",
  LIVE_DATA_CACHE_PREFIX: "live_data_cache_",
  LIVE_NEXT_REFRESH_PREFIX: "live_next_refresh_time_",
};
