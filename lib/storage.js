// TRA PASS: Safe LocalStorage Manager with Whitelist Validation
// Module: lib/storage.js

import {
  ALLOWED_STATIONS_SET,
  DEFAULT_ORIGIN,
  DEFAULT_DEST,
  ALLOWED_THEMES,
  DEFAULT_THEME,
  STORAGE_KEYS
} from "./constants.js";

function safeGet(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[storage] Failed to get key: ${key}`, err);
    return null;
  }
}

function safeSet(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, String(value));
  } catch (err) {
    console.warn(`[storage] Failed to set key: ${key}`, err);
  }
}

function safeRemove(key) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] Failed to remove key: ${key}`, err);
  }
}

// ==========================================
// 車站安全存取 (Storage Poisoning 防禦)
// ==========================================
export function getStoredOrigin() {
  const val = safeGet(STORAGE_KEYS.ORIGIN);
  return (val && ALLOWED_STATIONS_SET.has(val)) ? val : DEFAULT_ORIGIN;
}

export function setStoredOrigin(origin) {
  if (ALLOWED_STATIONS_SET.has(origin)) {
    safeSet(STORAGE_KEYS.ORIGIN, origin);
  }
}

export function getStoredDest() {
  const val = safeGet(STORAGE_KEYS.DEST);
  return (val && ALLOWED_STATIONS_SET.has(val)) ? val : DEFAULT_DEST;
}

export function setStoredDest(dest) {
  if (ALLOWED_STATIONS_SET.has(dest)) {
    safeSet(STORAGE_KEYS.DEST, dest);
  }
}

// ==========================================
// 主題安全存取 (只允許 1, 2, 3)
// ==========================================
export function getStoredTheme() {
  const val = Number(safeGet(STORAGE_KEYS.THEME));
  return ALLOWED_THEMES.includes(val) ? val : DEFAULT_THEME;
}

export function setStoredTheme(theme) {
  const val = Number(theme);
  if (ALLOWED_THEMES.includes(val)) {
    safeSet(STORAGE_KEYS.THEME, val);
  }
}

// ==========================================
// 連線時效 (5 分鐘安全限制)
// ==========================================
export function getStoredLiveExpire() {
  const val = Number(safeGet(STORAGE_KEYS.LIVE_CONNECTION_EXPIRE) || 0);
  return val > Date.now() ? val : 0;
}

export function setStoredLiveExpire(durationMs = 300000) {
  safeSet(STORAGE_KEYS.LIVE_CONNECTION_EXPIRE, Date.now() + durationMs);
}

export function clearStoredLiveExpire() {
  safeRemove(STORAGE_KEYS.LIVE_CONNECTION_EXPIRE);
}

// ==========================================
// 手動刷新冷卻 (20 秒安全冷卻)
// ==========================================
export function getStoredCooldownExpire() {
  const val = Number(safeGet(STORAGE_KEYS.MANUAL_REFRESH_COOLDOWN_EXPIRE) || 0);
  return val > Date.now() ? val : 0;
}

export function setStoredCooldownExpire(durationMs = 20000) {
  safeSet(STORAGE_KEYS.MANUAL_REFRESH_COOLDOWN_EXPIRE, Date.now() + durationMs);
}

export function clearStoredCooldownExpire() {
  safeRemove(STORAGE_KEYS.MANUAL_REFRESH_COOLDOWN_EXPIRE);
}

// ==========================================
// 全域防刷時間戳 (20 秒節流)
// ==========================================
export function getStoredGlobalLastFetch() {
  return Number(safeGet(STORAGE_KEYS.GLOBAL_LAST_FETCH) || 0);
}

export function setStoredGlobalLastFetch(timestamp = Date.now()) {
  safeSet(STORAGE_KEYS.GLOBAL_LAST_FETCH, timestamp);
}

// ==========================================
// 車站即時快取資料 (JSON 防護)
// ==========================================
export function getCachedLiveData(station) {
  if (!station) return {};
  const raw = safeGet(`${STORAGE_KEYS.LIVE_DATA_CACHE_PREFIX}${station}`);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {}
  return {};
}

export function setCachedLiveData(station, data) {
  if (!station || !data) return;
  safeSet(`${STORAGE_KEYS.LIVE_DATA_CACHE_PREFIX}${station}`, JSON.stringify(data));
}

export function clearCachedLiveData(station) {
  if (!station) return;
  safeRemove(`${STORAGE_KEYS.LIVE_DATA_CACHE_PREFIX}${station}`);
}

// ==========================================
// 車站下次更新倒數時間
// ==========================================
export function getStoredNextRefreshTime(station) {
  if (!station) return 0;
  return Number(safeGet(`${STORAGE_KEYS.LIVE_NEXT_REFRESH_PREFIX}${station}`) || 0);
}

export function setStoredNextRefreshTime(station, secs) {
  if (!station) return;
  safeSet(`${STORAGE_KEYS.LIVE_NEXT_REFRESH_PREFIX}${station}`, Date.now() + secs * 1000);
}

export function clearStoredNextRefreshTime(station) {
  if (!station) return;
  safeRemove(`${STORAGE_KEYS.LIVE_NEXT_REFRESH_PREFIX}${station}`);
}
