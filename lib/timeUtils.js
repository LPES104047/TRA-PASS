// TRA PASS: Pure Time & Date Utility Functions
// Module: lib/timeUtils.js

/**
 * 取得台灣時區 (Asia/Taipei) 之目前 Date 物件
 * @param {Date} [baseDate=new Date()] 基礎時間
 * @returns {Date} 台灣時區 Date 物件
 */
export function getTaiwanNow(baseDate = new Date()) {
  const twTimeStr = baseDate.toLocaleString("en-US", { timeZone: "Asia/Taipei" });
  return new Date(twTimeStr);
}

// Interface contract alias
export const getTwTime = getTaiwanNow;

/**
 * 格式化 Date 為 YYYY-MM-DD
 * @param {Date} date
 * @returns {string} e.g. "2026-10-14"
 */
export function formatDateYMD(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Interface contract alias
export const getTwDateStr = formatDateYMD;

/**
 * 將 "HH:mm" 字串轉換為當日 00:00 起算的分鐘數
 * @param {string} timeStr e.g. "08:45"
 * @returns {number} 分鐘數 e.g. 525
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  return h * 60 + m;
}

// Interface contract alias
export const parseTimeToMinutes = timeToMinutes;

/**
 * 將分鐘數格式化為 "HH:mm" (24小時制)
 * @param {number} mins
 * @returns {string} e.g. "08:45"
 */
export function minutesToTime(mins) {
  if (typeof mins !== 'number' || isNaN(mins)) return "00:00";
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * 格式化倒數秒數為 "Xm YYs"
 * @param {number} secs
 * @returns {string} e.g. "4m 32s"
 */
export function formatCountdown(secs) {
  if (typeof secs !== 'number' || isNaN(secs) || secs < 0) return "0m 00s";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

/**
 * 計算列車實際出發時間與目前時間的差值 (分鐘數)
 * 支援雙引數 (trainDateTime, currentDateTime) 與三引數 (twTime, trainTimeStr, isCrossMidnight)
 * @param {Date} arg1 列車表定/延誤後完整 Date，或目前台灣時區 Date
 * @param {Date|string} arg2 當前基準時間 Date，或列車發車 "HH:mm" 字串
 * @param {boolean} [isCrossMidnight=false] 是否跨午夜
 * @returns {number} 等待分鐘數
 */
export function calculateWaitMinutes(arg1, arg2, isCrossMidnight = false) {
  if (arg1 instanceof Date && arg2 instanceof Date) {
    const diffMs = arg1.getTime() - arg2.getTime();
    return Math.floor(diffMs / 60000);
  }
  if (arg1 instanceof Date && typeof arg2 === 'string') {
    const twTime = arg1;
    const trainTimeStr = arg2;
    const trainMins = timeToMinutes(trainTimeStr);
    const twMins = twTime.getHours() * 60 + twTime.getMinutes();
    let diff = trainMins - twMins;
    if (isCrossMidnight) diff += 24 * 60;
    return diff;
  }
  return 0;
}
