// TRA PASS: Live Train Connection & Real-Time Sync Hook
// Module: hooks/useLiveConnection.js

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getStoredLiveExpire,
  setStoredLiveExpire,
  clearStoredLiveExpire,
  getStoredCooldownExpire,
  setStoredCooldownExpire,
  getStoredGlobalLastFetch,
  setStoredGlobalLastFetch,
  getCachedLiveData,
  setCachedLiveData,
  clearCachedLiveData,
  getStoredNextRefreshTime,
  setStoredNextRefreshTime,
  clearStoredNextRefreshTime,
} from "../lib/storage";
import { TIMING_CONFIG, STORAGE_KEYS } from "../lib/constants";

/**
 * 延誤數值安全過濾與箝位防護 [0, 720]
 * @param {object} rawMap 原始即時資料
 * @returns {object} 經箝位驗證的安全資料
 */
function sanitizeDelayMap(rawMap) {
  if (!rawMap || typeof rawMap !== 'object' || Array.isArray(rawMap)) return {};
  const clean = {};
  for (const [trainNo, rawDelay] of Object.entries(rawMap)) {
    const num = typeof rawDelay === 'number' ? rawDelay : Number(rawDelay);
    clean[trainNo] = Math.max(0, Math.min(Number.isFinite(num) ? num : 0, 720));
  }
  return clean;
}

/**
 * 台鐵即時動態連線與同步狀態機 Hook
 * @param {string} origin 當前出發站
 * @param {boolean} isLoaded 用戶端 LocalStorage 是否已初始化
 */
export function useLiveConnection(origin, isLoaded) {
  const [liveData, setLiveData] = useState({});
  const [connStatus, setConnStatus] = useState('idle'); // 'idle' | 'syncing' | 'live' | 'nodata' | 'error'
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [connectionTimeLeft, setConnectionTimeLeft] = useState(TIMING_CONFIG.LIVE_CONNECTION_TIMEOUT_SECS);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [refreshCountdown, setRefreshCountdown] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const bypassCacheRef = useRef(false);
  const abortControllerRef = useRef(null);
  const bypassOriginRef = useRef(origin);
  const isLiveRef = useRef(isLiveConnected);

  // 同步 isLiveRef
  useEffect(() => {
    isLiveRef.current = isLiveConnected;
  }, [isLiveConnected]);

  // 組件卸載時中止所有 pending fetch (防記憶體洩漏)
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 初始化時恢復過期時間與連線狀態
  useEffect(() => {
    if (!isLoaded) return;
    requestAnimationFrame(() => {
      const nowMs = Date.now();
      const expireTime = getStoredLiveExpire();
      if (expireTime > nowMs) {
        setIsLiveConnected(true);
        setConnectionTimeLeft(Math.ceil((expireTime - nowMs) / 1000));
      }

      const cooldownTime = getStoredCooldownExpire();
      if (cooldownTime > nowMs) {
        setCooldownTimeLeft(Math.ceil((cooldownTime - nowMs) / 1000));
      }
    });
  }, [isLoaded]);

  // 跨分頁快取同步監聽器
  useEffect(() => {
    if (!isLoaded || !origin) return;
    const targetKey = `${STORAGE_KEYS.LIVE_DATA_CACHE_PREFIX}${origin}`;
    const handleStorage = (e) => {
      if (e.key === targetKey && e.newValue) {
        try {
          const parsedData = JSON.parse(e.newValue);
          if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
            const cleanData = sanitizeDelayMap(parsedData);
            setLiveData(cleanData);
            setConnStatus(Object.keys(cleanData).length > 0 ? 'live' : 'nodata');
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isLoaded, origin]);

  // 中央時鐘 (絕對時間校準，防背景休眠)
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      const now = Date.now();

      const cooldownExpire = getStoredCooldownExpire();
      setCooldownTimeLeft(cooldownExpire > now ? Math.ceil((cooldownExpire - now) / 1000) : 0);

      if (isLiveRef.current) {
        const liveExpire = getStoredLiveExpire();
        if (liveExpire > now) {
          setConnectionTimeLeft(Math.ceil((liveExpire - now) / 1000));
        } else {
          setIsLiveConnected(false);
          setConnStatus('idle');
          clearStoredLiveExpire();
          setConnectionTimeLeft(0);
        }

        if (origin) {
          const nextRefreshMs = getStoredNextRefreshTime(origin);
          if (nextRefreshMs > 0) {
            const remain = Math.ceil((nextRefreshMs - now) / 1000);
            if (remain > 0) {
              setRefreshCountdown(remain);
            } else {
              clearStoredNextRefreshTime(origin);
              setRefreshCountdown(null);
              setRefreshTrigger((t) => t + 1);
            }
          } else {
            setRefreshCountdown(null);
          }
        }
      } else {
        setRefreshCountdown(null);
        setConnStatus('idle');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, origin]);

  // 核心資料獲取與快取邏輯
  useEffect(() => {
    if (!isLoaded || !origin || !isLiveConnected) return;
    let isCurrent = true;

    const updateCountdown = (secs) => {
      if (secs === null) {
        clearStoredNextRefreshTime(origin);
        if (isCurrent) setRefreshCountdown(null);
      } else {
        setStoredNextRefreshTime(origin, secs);
        if (isCurrent) setRefreshCountdown(secs);
      }
    };

    const fetchLive = async (bypass = false) => {
      if (!isCurrent) return;

      const now = Date.now();
      const globalLastFetch = getStoredGlobalLastFetch();
      if (!bypass && now - globalLastFetch < TIMING_CONFIG.GLOBAL_FETCH_THROTTLE_MS) {
        const cached = sanitizeDelayMap(getCachedLiveData(origin));
        if (Object.keys(cached).length > 0) {
          requestAnimationFrame(() => {
            setLiveData(cached);
            setConnStatus('live');
          });
        }
        const timePassed = Math.floor((now - globalLastFetch) / 1000);
        const nextTime = TIMING_CONFIG.AUTO_REFRESH_INTERVAL_SECS - timePassed;
        updateCountdown(nextTime > 0 ? nextTime : TIMING_CONFIG.AUTO_REFRESH_INTERVAL_SECS);
        return;
      }

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      updateCountdown(null); // UI 顯示同步中
      if (isCurrent) setConnStatus('syncing');

      try {
        const safeOrigin = encodeURIComponent(origin);
        const url = `/api/trains?origin=${safeOrigin}&_t=${Date.now()}${bypass ? '&bypass=true' : ''}`;

        const res = await fetch(url, { signal: abortControllerRef.current.signal });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const result = await res.json();
        if (!isCurrent) return;

        if (result && result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          const cleanData = sanitizeDelayMap(result.data);
          const hasKeys = Object.keys(cleanData).length > 0;
          setLiveData(cleanData);
          setConnStatus(hasKeys ? 'live' : 'nodata');
          setCachedLiveData(origin, cleanData);
          setStoredGlobalLastFetch(Date.now());
          updateCountdown(TIMING_CONFIG.AUTO_REFRESH_INTERVAL_SECS);
        } else {
          setConnStatus('nodata');
          updateCountdown(TIMING_CONFIG.RETRY_NO_DATA_SECS);
        }
      } catch (e) {
        if (!e || e.name === 'AbortError' || e.message === 'canceled') return;
        console.error("Live fetch error", e);
        if (isCurrent) setConnStatus('error');
        updateCountdown(TIMING_CONFIG.RETRY_ERROR_SECS);
      }
    };

    const shouldBypass = bypassCacheRef.current;
    const now = Date.now();
    const nextRefreshMs = getStoredNextRefreshTime(origin);
    const isOriginSwitch = bypassOriginRef.current !== origin;
    bypassOriginRef.current = origin;

    if (shouldBypass || isOriginSwitch) {
      bypassCacheRef.current = false;
      fetchLive(true);
    } else if (!nextRefreshMs || nextRefreshMs <= now) {
      fetchLive(false);
    } else {
      const cached = sanitizeDelayMap(getCachedLiveData(origin));
      if (Object.keys(cached).length > 0) {
        requestAnimationFrame(() => {
          setLiveData(cached);
          setRefreshCountdown(Math.ceil((nextRefreshMs - now) / 1000));
        });
      } else {
        clearCachedLiveData(origin);
        fetchLive(false);
      }
    }

    return () => {
      isCurrent = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [origin, isLoaded, isLiveConnected, refreshTrigger]);

  // 離線狀態下讀取本地快取
  useEffect(() => {
    if (isLoaded && !isLiveConnected) {
      const cached = sanitizeDelayMap(getCachedLiveData(origin));
      requestAnimationFrame(() => setLiveData(cached));
    }
  }, [isLiveConnected, isLoaded, origin]);

  // 重設 5 分鐘連線計時器
  const resetConnectionTimer = useCallback(() => {
    if (isLiveConnected) {
      setConnectionTimeLeft(TIMING_CONFIG.LIVE_CONNECTION_TIMEOUT_SECS);
      setStoredLiveExpire(TIMING_CONFIG.LIVE_CONNECTION_TIMEOUT_SECS * 1000);
    }
  }, [isLiveConnected]);

  // 切換即時連線 (啟動 / 中斷)
  const toggleLiveConnection = useCallback(() => {
    setIsLiveConnected((prev) => {
      const next = !prev;
      if (next) {
        setConnectionTimeLeft(TIMING_CONFIG.LIVE_CONNECTION_TIMEOUT_SECS);
        setStoredLiveExpire(TIMING_CONFIG.LIVE_CONNECTION_TIMEOUT_SECS * 1000);
      } else {
        clearStoredLiveExpire();
        clearStoredNextRefreshTime(origin);
        setRefreshCountdown(null);
        setConnStatus('idle');
        if (abortControllerRef.current) abortControllerRef.current.abort();
      }
      return next;
    });
  }, [origin]);

  // 手動強制刷新 (20 秒冷卻)
  const handleManualRefresh = useCallback(() => {
    if (!isLiveConnected || cooldownTimeLeft > 0) return;
    setCooldownTimeLeft(TIMING_CONFIG.MANUAL_REFRESH_COOLDOWN_SECS);
    setStoredCooldownExpire(TIMING_CONFIG.MANUAL_REFRESH_COOLDOWN_SECS * 1000);
    bypassCacheRef.current = true;
    setRefreshTrigger((prev) => prev + 1);
    resetConnectionTimer();
  }, [isLiveConnected, cooldownTimeLeft, resetConnectionTimer]);

  return {
    liveData,
    connStatus: isLiveConnected ? connStatus : 'idle',
    isLiveConnected,
    setIsLiveConnected,
    connectionTimeLeft,
    cooldownTimeLeft,
    manualCountdown: cooldownTimeLeft,
    isManualDisabled: (!isLiveConnected && cooldownTimeLeft === 0) || cooldownTimeLeft > 0,
    refreshCountdown,
    toggleLiveConnection,
    handleManualRefresh,
    resetConnectionTimer
  };
}
