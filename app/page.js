"use client";
import { useState, useEffect, useRef } from "react";
import Theme1 from "./components/Theme1";
import Theme2 from "./components/Theme2";
import Theme3 from "./components/Theme3";
import TrainAnimation from "./components/TrainAnimation";
import TrainJourneyModal from "./components/TrainJourneyModal";
import MaintenanceDepot from "./components/MaintenanceDepot";

export default function Home() {
  const [data, setData] = useState(null);
  const [origin, setOrigin] = useState("桃園");
  const [dest, setDest] = useState("基隆");
  const [theme, setTheme] = useState(1);
  const [liveData, setLiveData] = useState({});
  const [animDirection, setAnimDirection] = useState('ltr');
  const [isAnimating, setIsAnimating] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTomorrow, setIsTomorrow] = useState(false);
  const [activeTrain, setActiveTrain] = useState(null);
  const [forceDepotPreview, setForceDepotPreview] = useState(false);
  const [connStatus, setConnStatus] = useState('idle'); // 'idle' | 'syncing' | 'live' | 'nodata' | 'error'

  // 智慧防護與節流狀態
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [connectionTimeLeft, setConnectionTimeLeft] = useState(300); // 5 分鐘安全限制 (300 秒)
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0); // 手動刷新冷卻 (20 秒)
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 觸發更新計數器
  const bypassCacheRef = useRef(false); // 強制更新標記 (繞過快取)
  const abortControllerRef = useRef(null); // 用於中斷 API 請求的控制器
  const bypassOriginRef = useRef(origin); // 紀錄上次查詢的站點，用於切換站點時強制更新

  // 初始化時讀取 LocalStorage
  useEffect(() => {
    const savedOrigin = localStorage.getItem("train_origin");
    const savedDest = localStorage.getItem("train_dest");
    const savedTheme = localStorage.getItem("train_theme");

    requestAnimationFrame(() => {
      if (savedOrigin) setOrigin(savedOrigin);
      if (savedDest) setDest(savedDest);
      if (savedTheme) setTheme(Number(savedTheme));
    });

    const nowMs = Date.now();
    const savedExpire = localStorage.getItem("live_connection_expire_time");
    if (savedExpire) {
      const expireTime = Number(savedExpire);
      if (expireTime > nowMs) {
        requestAnimationFrame(() => {
          setIsLiveConnected(true);
          setConnectionTimeLeft(Math.ceil((expireTime - nowMs) / 1000));
        });
      } else {
        localStorage.removeItem("live_connection_expire_time");
      }
    }

    const savedCooldown = localStorage.getItem("manual_refresh_cooldown_expire_time");
    if (savedCooldown) {
      const cooldownTime = Number(savedCooldown);
      if (cooldownTime > nowMs) {
        requestAnimationFrame(() => setCooldownTimeLeft(Math.ceil((cooldownTime - nowMs) / 1000)));
      } else {
        localStorage.removeItem("manual_refresh_cooldown_expire_time");
      }
    }

    const handleUnhandledRejection = (event) => {
      if (!event.reason || event.reason?.name === 'AbortError' || event.reason === 'canceled' || event.reason?.message === 'canceled') {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    requestAnimationFrame(() => setIsLoaded(true));

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("train_theme", theme);

    if (theme === 1) {
      document.body.classList.add('fluid-gradient-theme');
      document.body.style.background = '#0B132B';
    } else {
      document.body.classList.remove('fluid-gradient-theme');
    }

    if (theme === 2) {
      document.body.style.background = '#ebeff7';
      document.body.style.backgroundAttachment = 'fixed';
    } else if (theme === 3) {
      document.body.style.background = 'linear-gradient(135deg, #1A0B2E, #3B1B54, #120822)';
      document.body.style.backgroundAttachment = 'fixed';
    }
  }, [theme, isLoaded]);

  const isLiveRef = useRef(isLiveConnected);
  useEffect(() => {
    isLiveRef.current = isLiveConnected;
    if (!isLiveConnected) setConnStatus('idle');
  }, [isLiveConnected]);

  // 跨分頁快取同步監聽器
  useEffect(() => {
    if (!isLoaded || !origin) return;
    const handleStorage = (e) => {
      if (e.key === `live_data_cache_${origin}` && e.newValue) {
        try {
          const parsedData = JSON.parse(e.newValue);
          if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
            setLiveData(parsedData);
            setConnStatus(Object.keys(parsedData).length > 0 ? 'live' : 'nodata');
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
      
      const savedCooldown = Number(localStorage.getItem("manual_refresh_cooldown_expire_time") || 0);
      setCooldownTimeLeft(savedCooldown > now ? Math.ceil((savedCooldown - now) / 1000) : 0);

      if (isLiveRef.current) {
        const savedConn = Number(localStorage.getItem("live_connection_expire_time") || 0);
        if (savedConn > now) {
          setConnectionTimeLeft(Math.ceil((savedConn - now) / 1000));
        } else {
          setIsLiveConnected(false);
          setConnStatus('idle');
          localStorage.removeItem("live_connection_expire_time");
          setConnectionTimeLeft(0);
        }
        
        if (origin) {
          const nextRefreshStr = localStorage.getItem(`live_next_refresh_time_${origin}`);
          if (nextRefreshStr) {
            const remain = Math.ceil((Number(nextRefreshStr) - now) / 1000);
            if (remain > 0) {
              setRefreshCountdown(remain);
            } else {
              localStorage.removeItem(`live_next_refresh_time_${origin}`);
              setRefreshCountdown(null);
              setRefreshTrigger(t => t + 1);
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

  useEffect(() => {
    fetch(`/data.json`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("靜態班表載入失敗", err));
  }, []);

  useEffect(() => {
    if (!isLoaded || !origin || !isLiveConnected) return;
    let isCurrent = true;

    const updateCountdown = (secs) => {
      if (secs === null) {
        localStorage.removeItem(`live_next_refresh_time_${origin}`);
        if (isCurrent) setRefreshCountdown(null);
      } else {
        localStorage.setItem(`live_next_refresh_time_${origin}`, String(Date.now() + secs * 1000));
        if (isCurrent) setRefreshCountdown(secs);
      }
    };

    const fetchLive = async (bypass = false) => {
      if (!isCurrent) return;

      const now = Date.now();
      const globalLastFetch = Number(localStorage.getItem('traPass_global_last_fetch') || 0);
      if (!bypass && now - globalLastFetch < 20000) {
        const cached = localStorage.getItem(`live_data_cache_${origin}`);
        if (cached) {
          try {
            const parsedData = JSON.parse(cached);
            requestAnimationFrame(() => {
              setLiveData(parsedData);
              setConnStatus(Object.keys(parsedData).length > 0 ? 'live' : 'nodata');
            });
          } catch {}
        }
        const timePassed = Math.floor((now - globalLastFetch) / 1000);
        updateCountdown(180 - timePassed > 0 ? 180 - timePassed : 180);
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
        
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }

        const result = await res.json();
        if (!isCurrent) return;

        if (result && result.data) {
          const hasKeys = Object.keys(result.data).length > 0;
          setLiveData(result.data);
          setConnStatus(hasKeys ? 'live' : 'nodata');
          localStorage.setItem(`live_data_cache_${origin}`, JSON.stringify(result.data));
          localStorage.setItem('traPass_global_last_fetch', String(Date.now()));
          updateCountdown(180);
        } else {
          setConnStatus('nodata');
          updateCountdown(30); 
        }
      } catch (e) {
        if (!e || e.name === 'AbortError' || e.message === 'canceled') return;
        console.error("Live fetch error", e);
        if (isCurrent) setConnStatus('error');
        updateCountdown(60); 
      }
    };

    const shouldBypass = bypassCacheRef.current;
    const now = Date.now();
    const nextRefreshStr = localStorage.getItem(`live_next_refresh_time_${origin}`);
    const isOriginSwitch = bypassOriginRef.current !== origin;
    bypassOriginRef.current = origin;
    
    if (shouldBypass || isOriginSwitch) {
      bypassCacheRef.current = false;
      fetchLive(true);
    } else if (!nextRefreshStr || Number(nextRefreshStr) <= now) {
      fetchLive(false);
    } else {
      // 🌟 改由 localStorage 讀取，完美涵蓋新開分頁的情境
      const cached = localStorage.getItem(`live_data_cache_${origin}`);
      if (cached) {
        try {
          const parsedData = JSON.parse(cached);
          if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
            requestAnimationFrame(() => {
              setLiveData(parsedData);
              setRefreshCountdown(Math.ceil((Number(nextRefreshStr) - now) / 1000));
            });
          } else {
            throw new Error("Invalid cache format");
          }
        } catch {
          localStorage.removeItem(`live_data_cache_${origin}`);
          fetchLive(false);
        }
      } else {
        fetchLive(false);
      }
    }

    return () => { isCurrent = false; };
  }, [origin, isLoaded, isLiveConnected, refreshTrigger]);

  useEffect(() => {
    if (isLoaded && !isLiveConnected) {
      const cached = localStorage.getItem(`live_data_cache_${origin}`);
      if (cached) {
        try {
          const parsedData = JSON.parse(cached);
          requestAnimationFrame(() => setLiveData(parsedData));
        } catch {
          requestAnimationFrame(() => setLiveData({}));
        }
      } else {
        requestAnimationFrame(() => setLiveData({}));
      }
    }
  }, [isLiveConnected, isLoaded, origin]);

  if (!data) return <div style={{color: 'white', textAlign: 'center', marginTop: '20vh'}}>載入中...</div>;

  const allStations = data.Northbound.stations;
  let dirInfo = null;
  const nO = data.Northbound.stations.indexOf(origin);
  const nD = data.Northbound.stations.indexOf(dest);
  if (nO !== -1 && nD !== -1 && nO < nD) dirInfo = { dir: "Northbound", oIdx: nO, dIdx: nD };

  const sO = data.Southbound.stations.indexOf(origin);
  const sD = data.Southbound.stations.indexOf(dest);
  if (sO !== -1 && sD !== -1 && sO < sD) dirInfo = { dir: "Southbound", oIdx: sO, dIdx: sD };

  const now = new Date();
  const twTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Taipei" });
  const twTime = new Date(twTimeStr);
  const currentMins = twTime.getHours() * 60 + twTime.getMinutes();

  let validTrains = [];
  if (dirInfo) {
    const getTwDateStr = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    const todayStr = getTwDateStr(twTime);
    const tomorrowTime = new Date(twTime);
    tomorrowTime.setDate(tomorrowTime.getDate() + 1);
    const tomorrowStr = getTwDateStr(tomorrowTime);

    let allTrains = [];
    data[dirInfo.dir].trains.forEach(t => {
      const oTime = t.times[dirInfo.oIdx];
      const dTime = t.times[dirInfo.dIdx];
      if (oTime && dTime) {
        const [h, m] = oTime.split(':').map(Number);

        // 尋找起點發車時間以判斷是否跨夜
        const firstTimeStr = t.times.find(time => time !== "");
        const [startH, startM] = firstTimeStr.split(':').map(Number);
        const isCrossMidnight = (h * 60 + m < startH * 60 + startM);

        // 今日出發的列車在本站的實際表定發車日期
        let todayTrainDate = todayStr;
        if (isCrossMidnight) {
          todayTrainDate = tomorrowStr;
        }

        // 明日出發的列車在本站的實際表定發車日期
        let tomorrowTrainDate = tomorrowStr;
        if (isCrossMidnight) {
          const dayAfterTomorrow = new Date(twTime);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
          tomorrowTrainDate = getTwDateStr(dayAfterTomorrow);
        }

        // 🛡️ 資安防護：強制型別轉換 (Storage Poisoning 防禦)
        let rawDelay = liveData[t.number];
        let delay = (typeof rawDelay === 'number' ? rawDelay : (Number(rawDelay) || 0));
        let actualDepMins = h * 60 + m + delay;

        // 1. 今日出發的車次
        allTrains.push({
          ...t,
          TrainDate: todayTrainDate,
          DepartureTime: oTime,
          depTime: oTime,
          arrTime: dTime,
          depMins: h * 60 + m,
          actualDepMins,
          delay
        });

        // 2. 明日出發的車次 (明日無 delay)
        allTrains.push({
          ...t,
          TrainDate: tomorrowTrainDate,
          DepartureTime: oTime,
          depTime: oTime,
          arrTime: dTime,
          depMins: h * 60 + m,
          actualDepMins: h * 60 + m,
          delay: 0
        });
      }
    });

    // 終極時光機防呆演算法：精準校正真實等待時間，防禦跨夜造成的破萬分鐘異常
    // 使用絕對時間戳計算 waitMins
    allTrains.forEach(t => {
      const trainDateTime = new Date(`${t.TrainDate}T${t.depTime}`);
      if (t.delay > 0) {
        trainDateTime.setMinutes(trainDateTime.getMinutes() + t.delay);
      }
      const diffMs = trainDateTime - twTime;
      t.waitMins = Math.floor(diffMs / 60000);
    });

    // 依照真正的等待時間由近到遠排序
    allTrains.sort((a, b) => a.waitMins - b.waitMins);

    // 補上 TrainDate 嚴格校驗與過濾 (依據 RTF 指示)
    validTrains = allTrains.filter(train => {
      // 1. 確認當前 Tab 目標日期 (YYYY-MM-DD)
      const targetDate = isTomorrow ? tomorrowStr : todayStr;

      // 🛡️ 絕對防禦：強制核對班次表定日期，根除幽靈跨日班次！
      if (train.TrainDate !== targetDate) return false;

      // 2. 針對「今日班次」，只顯示未來的車次；「明日班次」則全數顯示
      if (!isTomorrow) {
        const trainDateTime = new Date(`${train.TrainDate}T${train.DepartureTime}`);
        if (train.delay > 0) {
          trainDateTime.setMinutes(trainDateTime.getMinutes() + train.delay);
        }
        return trainDateTime >= twTime;
      }

      // 明日班次一律顯示
      return true;
    });

    // 車程合理性防呆 (排除假資料)
    validTrains = validTrains.filter(t => {
      let [dh, dm] = t.depTime.split(':').map(Number);
      let [ah, am] = t.arrTime.split(':').map(Number);
      let diff = (ah * 60 + am) - (dh * 60 + dm);
      if (diff < 0) diff += 24 * 60;
      return diff <= 12 * 60;
    });
  }

  const triggerAnimation = (stateUpdateCallback, direction = 'ltr') => {
    if (isAnimating) return;
    const isDepotShown = validTrains.length === 0;
    if (isDepotShown) {
      stateUpdateCallback();
      return;
    }
    setAnimDirection(direction);
    setIsAnimating(true);
    setTimeout(() => { stateUpdateCallback(); }, 2000);
    setTimeout(() => { setIsAnimating(false); }, 4000);
  };

  const getDirectionAnim = (from, to) => {
    if (!data) return 'ltr';
    const nO = data.Northbound.stations.indexOf(from);
    const nD = data.Northbound.stations.indexOf(to);
    if (nO !== -1 && nD !== -1 && nO < nD) return 'ltr';
    return 'rtl';
  };

  const resetConnectionTimer = () => {
    if (isLiveConnected) {
      setConnectionTimeLeft(300);
      localStorage.setItem("live_connection_expire_time", String(Date.now() + 300000));
    }
  };

  const handleOriginChange = (newOrigin) => {
    if (newOrigin === origin) return;
    setOrigin(newOrigin);
    localStorage.setItem("train_origin", newOrigin);
    resetConnectionTimer();
  };

  const handleDestChange = (newDest) => {
    if (newDest === dest) return;
    const animDir = getDirectionAnim(origin, newDest);
    triggerAnimation(() => {
      setDest(newDest);
      localStorage.setItem("train_dest", newDest);
      resetConnectionTimer();
    }, animDir);
  };

  const handleSwap = () => {
    if (origin === dest) return;
    const animDir = getDirectionAnim(dest, origin);
    triggerAnimation(() => {
      const currentOrigin = origin;
      const currentDest = dest;
      setOrigin(currentDest);
      setDest(currentOrigin);
      localStorage.setItem("train_origin", currentDest);
      localStorage.setItem("train_dest", currentOrigin);
      resetConnectionTimer();
    }, animDir);
  };

  const toggleLiveConnection = () => {
    setIsLiveConnected(prev => {
      const next = !prev;
      if (next) {
        setConnectionTimeLeft(300);
        localStorage.setItem("live_connection_expire_time", String(Date.now() + 300000));
      } else {
        localStorage.removeItem("live_connection_expire_time");
        localStorage.removeItem(`live_next_refresh_time_${origin}`);
        setRefreshCountdown(null);
        if (abortControllerRef.current) abortControllerRef.current.abort();
      }
      return next;
    });
  };

  const handleManualRefresh = () => {
    if (!isLiveConnected || cooldownTimeLeft > 0) return;
    setCooldownTimeLeft(20);
    localStorage.setItem("manual_refresh_cooldown_expire_time", String(Date.now() + 20000));
    bypassCacheRef.current = true;
    setRefreshTrigger(prev => prev + 1);
    resetConnectionTimer();
  };

  const formatTimeLeft = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const props = {
    origin,
    setOrigin: handleOriginChange,
    dest,
    setDest: handleDestChange,
    handleSwap,
    allStations,
    validTrains,
    currentMins,
    isTomorrow,
    setIsTomorrow,
    onTrainSelect: setActiveTrain
  };

  return (
    <div className="global-page-container">
      <div className="global-header-btn-group">
        <div className="global-header-left-group">
          {isLoaded && (() => {
            const badge = (() => {
              if (!isLiveConnected || connStatus === 'idle') {
                return {
                  color: '#BDC3C7',
                  bg: 'rgba(127, 140, 141, 0.2)',
                  border: '1px solid rgba(127, 140, 141, 0.3)',
                  dotColor: '#7F8C8D',
                  shadow: 'none',
                  text: '離線模式 (點擊連線)',
                  pulseAnim: 'none'
                };
              }
              if (connStatus === 'syncing' || refreshCountdown === null) {
                return {
                  color: '#FFD700',
                  bg: 'rgba(241, 196, 15, 0.18)',
                  border: '1px solid rgba(241, 196, 15, 0.4)',
                  dotColor: '#FFD700',
                  shadow: '0 0 10px rgba(241, 196, 15, 0.3)',
                  text: '資料同步中...',
                  pulseAnim: 'statusPulse 0.9s ease-in-out infinite'
                };
              }
              if (connStatus === 'error') {
                return {
                  color: '#E74C3C',
                  bg: 'rgba(231, 76, 60, 0.18)',
                  border: '1px solid rgba(231, 76, 60, 0.4)',
                  dotColor: '#E74C3C',
                  shadow: '0 0 10px rgba(231, 76, 60, 0.3)',
                  text: `連線異常 (${refreshCountdown ? `${refreshCountdown}s` : '60s'})`,
                  pulseAnim: 'statusPulse 0.8s ease-in-out infinite'
                };
              }
              if (connStatus === 'nodata') {
                return {
                  color: '#E67E22',
                  bg: 'rgba(230, 126, 34, 0.18)',
                  border: '1px solid rgba(230, 126, 34, 0.4)',
                  dotColor: '#E67E22',
                  shadow: '0 0 10px rgba(230, 126, 34, 0.3)',
                  text: `連線中 (暫無即時誤點) | ${refreshCountdown}s ✕`,
                  pulseAnim: 'statusPulse 1.5s ease-in-out infinite'
                };
              }
              return {
                color: '#2ECC71',
                bg: 'rgba(46, 204, 113, 0.15)',
                border: '1px solid rgba(46, 204, 113, 0.4)',
                dotColor: '#2ECC71',
                shadow: '0 0 10px rgba(46, 204, 113, 0.2)',
                text: `連線中 (${formatTimeLeft(connectionTimeLeft)}) | ${refreshCountdown}s ✕`,
                pulseAnim: 'statusPulse 2s ease-in-out infinite'
              };
            })();

            return (
              <button
                onClick={toggleLiveConnection}
                className="global-conn-btn"
                style={{
                  background: badge.bg,
                  color: badge.color,
                  border: badge.border,
                  boxShadow: badge.shadow
                }}
              >
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                  background: badge.dotColor,
                  color: badge.dotColor,
                  animation: badge.pulseAnim,
                  boxShadow: badge.dotColor !== '#7F8C8D' ? `0 0 8px ${badge.dotColor}` : 'none',
                }}></span>
                <span>{badge.text}</span>
              </button>
            );
          })()}

          {isLoaded && (
            <button
              onClick={handleManualRefresh}
              disabled={(!isLiveConnected && cooldownTimeLeft === 0) || cooldownTimeLeft > 0}
              className="global-refresh-btn"
              style={{
                background: cooldownTimeLeft > 0 ? 'rgba(230, 126, 34, 0.15)' : (!isLiveConnected ? 'rgba(127, 140, 141, 0.2)' : 'rgba(52, 152, 219, 0.15)'),
                color: cooldownTimeLeft > 0 ? '#E67E22' : (!isLiveConnected ? '#BDC3C7' : '#3498DB'),
                border: cooldownTimeLeft > 0 ? '1px solid rgba(230, 126, 34, 0.4)' : (!isLiveConnected ? '1px solid rgba(127, 140, 141, 0.3)' : '1px solid rgba(52, 152, 219, 0.4)'),
                cursor: (!isLiveConnected || cooldownTimeLeft > 0) ? 'not-allowed' : 'pointer',
                opacity: isLiveConnected ? 1 : 0.5,
                pointerEvents: isLiveConnected ? 'auto' : 'none'
              }}
            >
              <span>{cooldownTimeLeft > 0 ? `⏳ 鎖定中 (${cooldownTimeLeft}s)` : '立即手動更新'}</span>
            </button>
          )}
        </div>

        <div className="global-theme-selector">
          <button onClick={() => setTheme(1)} className="theme-select-btn" style={{background: theme===1?'#00F2FE':'#333'}}>極簡風</button>
          <button onClick={() => setTheme(2)} className="theme-select-btn" style={{background: theme===2?'#1B3B6F':'#333'}}>車票風</button>
          <button onClick={() => setTheme(3)} className="theme-select-btn" style={{background: theme===3?'#00F0FF':'#333'}}>儀表板風</button>
        </div>
      </div>
      {isLoaded && theme === 1 && <Theme1 {...props} />}
      {isLoaded && theme === 2 && <Theme2 {...props} />}
      {isLoaded && theme === 3 && <Theme3 {...props} />}
      <TrainAnimation isAnimating={isAnimating} direction={animDirection} />
      <MaintenanceDepot show={validTrains.length === 0} />

      {activeTrain && (
        <TrainJourneyModal
          train={activeTrain}
          onClose={() => setActiveTrain(null)}
          stations={dirInfo ? data[dirInfo.dir].stations : allStations}
          dirInfo={dirInfo}
          isTomorrow={isTomorrow}
          origin={origin}
          dest={dest}
          theme={theme}
        />
      )}
    </div>
  );
}
