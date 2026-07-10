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

  // 智慧防護與節流狀態
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [connectionTimeLeft, setConnectionTimeLeft] = useState(300); // 5 分鐘安全限制 (300 秒)
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0); // 手動刷新冷卻 (20 秒)
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 觸發更新計數器
  const lastFetchTimeRef = useRef(0);
  const bypassCacheRef = useRef(false); // 強制更新標記 (繞過快取)
  const abortControllerRef = useRef(null); // 🟢 新增：用於中斷 API 請求的控制器useEffect

  // 初始化時讀取 LocalStorage
  useEffect(() => {
    const savedOrigin = localStorage.getItem("train_origin");
    const savedDest = localStorage.getItem("train_dest");
    const savedTheme = localStorage.getItem("train_theme");

    if (savedOrigin) setOrigin(savedOrigin);
    if (savedDest) setDest(savedDest);
    if (savedTheme) setTheme(Number(savedTheme));
    
    const nowMs = Date.now();
    const savedExpire = localStorage.getItem("live_connection_expire_time");
    if (savedExpire) {
      const expireTime = Number(savedExpire);
      if (expireTime > nowMs) {
        setIsLiveConnected(true);
        setConnectionTimeLeft(Math.ceil((expireTime - nowMs) / 1000));
      } else {
        localStorage.removeItem("live_connection_expire_time");
      }
    }
    
    const savedCooldown = localStorage.getItem("manual_refresh_cooldown_expire_time");
    if (savedCooldown) {
      const cooldownTime = Number(savedCooldown);
      if (cooldownTime > nowMs) {
        setCooldownTimeLeft(Math.ceil((cooldownTime - nowMs) / 1000));
      } else {
        localStorage.removeItem("manual_refresh_cooldown_expire_time");
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("train_theme", theme);

    // Dynamically update body background to place it behind the TrainAnimation
    if (theme === 1) {
      document.body.style.background = 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)';
      document.body.style.backgroundAttachment = 'fixed';
    } else if (theme === 2) {
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
  }, [isLiveConnected]);

// 中央時鐘 (處理 5 分鐘防呆、手動冷卻、與自動刷新倒數)
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      // 1. 手動更新冷卻倒數
      setCooldownTimeLeft(prev => (prev > 0 ? prev - 1 : 0));

      // 2. 5 分鐘安全連線防呆
      if (isLiveRef.current) {
        setConnectionTimeLeft(prev => {
          if (prev > 1) return prev - 1;
          // 倒數歸零，斷開連線
          setIsLiveConnected(false);
          localStorage.removeItem("live_connection_expire_time");
          return 0;
        });
      }

      // 3. 自動刷新倒數 (180 秒)
      if (isLiveRef.current && origin) {
        setRefreshCountdown(prev => {
          if (prev === null) return null; // 同步中不倒數
          if (prev > 1) return prev - 1;
          
          // 觸發重新請求資料
          setRefreshTrigger(t => t + 1);
          return null; 
        });
      } else {
        setRefreshCountdown(null);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLoaded, origin]);

  useEffect(() => {
    fetch(`/data.json`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => {
        console.error("靜態班表載入失敗", err);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded || !origin || !isLiveConnected) return;
    
    let isCurrent = true;

    const fetchLive = async (bypass = false) => {
      if (!isCurrent) return;
      
      // ⚡️ 【防競態條件】立即中斷上一個未完成的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setRefreshCountdown(null); // 同步中
      try {
        const url = `/api/trains?origin=${origin}&_t=${Date.now()}${bypass ? '&bypass=true' : ''}`;
        const res = await fetch(url, { signal: abortControllerRef.current.signal });
        const result = await res.json();
        
        if (!isCurrent) return;
        
        if (result.data) {
          setLiveData(result.data);
          sessionStorage.setItem(`live_data_cache_${origin}`, JSON.stringify(result.data));
          localStorage.setItem(`live_last_fetch_time_${origin}`, String(Date.now()));
          setRefreshCountdown(180);
        }
      } catch (e) {
        if (e.name === 'AbortError') {
          console.log(`Fetch aborted for origin: ${origin}`);
          return; 
        }
        console.error("Live fetch error", e);
        // 【死鎖修復】：就算網路失敗，也要推進最後更新時間
        localStorage.setItem(`live_last_fetch_time_${origin}`, String(Date.now()));
        setRefreshCountdown(180);
      }
    };

    const shouldBypass = bypassCacheRef.current;
    if (shouldBypass) {
      bypassCacheRef.current = false;
      fetchLive(true);
    } else {
      const lastFetch = Number(localStorage.getItem(`live_last_fetch_time_${origin}`) || 0);
      const refreshInterval = 180;
      
      const now = Date.now();
      if (now - lastFetch >= refreshInterval * 1000 || lastFetch === 0) {
        fetchLive(false);
      } else {
        const cached = sessionStorage.getItem(`live_data_cache_${origin}`);
        if (cached) {
          try {
            setLiveData(JSON.parse(cached));
            setRefreshCountdown(Math.ceil((lastFetch + refreshInterval * 1000 - now) / 1000));
          } catch (e) {
            console.error("Cache parsing error", e);
            sessionStorage.removeItem(`live_data_cache_${origin}`);
            fetchLive(false);
          }
        } else {
          fetchLive(false);
        }
      }
    }

    return () => {
      isCurrent = false;
    };
  }, [origin, isLoaded, isLiveConnected, refreshTrigger]);

  useEffect(() => {
    if (isLoaded && !isLiveConnected) {
      // 當斷開連線時，立刻清除殘留的即時延誤資料，避免誤導使用者
      setLiveData({});
    }
  }, [isLiveConnected, isLoaded]);

  if (!data) return <div style={{color: 'white', textAlign: 'center', marginTop: '20vh'}}>載入中...</div>;

  const allStations = data.Northbound.stations;

  // Compute schedules
  let dirInfo = null;
  const nO = data.Northbound.stations.indexOf(origin); 
  const nD = data.Northbound.stations.indexOf(dest);
  if(nO !== -1 && nD !== -1 && nO < nD) dirInfo = { dir: "Northbound", oIdx: nO, dIdx: nD };
  
  const sO = data.Southbound.stations.indexOf(origin); 
  const sD = data.Southbound.stations.indexOf(dest);
  if(sO !== -1 && sD !== -1 && sO < sD) dirInfo = { dir: "Southbound", oIdx: sO, dIdx: sD };

  // 取得當下時間
  const now = new Date();
  // 強制轉換為台灣時間字串，再重新解析出小時與分鐘
  const twTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Taipei" });
  const twTime = new Date(twTimeStr);

  const currentMins = twTime.getHours() * 60 + twTime.getMinutes();
  
  let validTrains = [];
  if (dirInfo) {
    data[dirInfo.dir].trains.forEach(t => {
      const oTime = t.times[dirInfo.oIdx];
      const dTime = t.times[dirInfo.dIdx];
      if(oTime && dTime) {
        const [h, m] = oTime.split(':').map(Number);
        // 若為明天，即時誤點時間強制為 0 分
        let delay = isTomorrow ? 0 : (liveData[t.number] || 0);
        let actualDepMins = h * 60 + m + delay;
        
        validTrains.push({ 
          ...t, 
          depTime: oTime, 
          arrTime: dTime, 
          depMins: h * 60 + m,
          actualDepMins,
          delay
        });
      }
    });
    
    validTrains.sort((a, b) => a.actualDepMins - b.actualDepMins);
    validTrains = validTrains.filter(t => {
      // 若為明天，則不過濾「目前時間點之前發車」的列車
      if (!isTomorrow) {
        if (t.actualDepMins < currentMins) {
          // 【跨夜邏輯修正】：如果列車是明天的凌晨時間，且距離現在的「真實等待時間」在 2 小時 (120 分鐘) 內，則保留！
          const isNightOwlTrain = (t.actualDepMins + 1440) - currentMins <= 120;
          if (!isNightOwlTrain) return false;
        }
      }
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
    // The continuous train takes 4.0s total.
    // Update state at 2000ms (when train is stopped at the center).
    setTimeout(() => {
      stateUpdateCallback();
    }, 2000);
    setTimeout(() => {
      setIsAnimating(false);
    }, 4000);
  };

  const getDirectionAnim = (from, to) => {
    if (!data) return 'ltr';
    const nO = data.Northbound.stations.indexOf(from);
    const nD = data.Northbound.stations.indexOf(to);
    // 北上 (Northbound) -> LTR (由左至右), 南下 (Southbound) -> RTL (由右至左)
    if (nO !== -1 && nD !== -1 && nO < nD) return 'ltr';
    return 'rtl';
  };

  const resetConnectionTimer = () => {
    if (isLiveConnected) {
      setConnectionTimeLeft(300); // 重新填滿為 5 分鐘
      localStorage.setItem("live_connection_expire_time", String(Date.now() + 300000));
    }
  };

  const handleOriginChange = (newOrigin) => {
    if (newOrigin === origin) return;
    setOrigin(newOrigin); // 立即更新，不觸發動畫
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
        setConnectionTimeLeft(300); // 重置為 5 分鐘
        localStorage.setItem("live_connection_expire_time", String(Date.now() + 300000));
      } else {
        localStorage.removeItem("live_connection_expire_time");
      }
      return next;
    });
  };

  const handleManualRefresh = () => {
    if (!isLiveConnected || cooldownTimeLeft > 0) return;
    setCooldownTimeLeft(20); // 20 秒手動更新冷卻
    localStorage.setItem("manual_refresh_cooldown_expire_time", String(Date.now() + 20000));
    bypassCacheRef.current = true; // 標記強制刷新以繞過後台快取
    setRefreshTrigger(prev => prev + 1); // 觸發 useEffect 重新整理
    resetConnectionTimer(); // 重置防呆倒數
  };

  const formatTimeLeft = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const props = {
    origin, setOrigin: handleOriginChange, 
    dest, setDest: handleDestChange, 
    handleSwap,
    allStations, validTrains, currentMins,
    isTomorrow, setIsTomorrow,
    onTrainSelect: setActiveTrain
  };

  return (
    <>
      {/* 📡 膠囊一：即時連線開關 */}
      {isLoaded && (
        <button 
          onClick={toggleLiveConnection}
          style={{
            position: 'fixed', top: 10, left: 10, zIndex: 9999, 
            display: 'flex', alignItems: 'center', gap: 8, 
            background: isLiveConnected ? 'rgba(46, 204, 113, 0.15)' : 'rgba(127, 140, 141, 0.2)', 
            padding: '6px 14px', borderRadius: '20px', 
            color: isLiveConnected ? '#2ECC71' : '#BDC3C7', 
            fontSize: '12px', fontWeight: 'bold', backdropFilter: 'blur(8px)', 
            border: isLiveConnected ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid rgba(127, 140, 141, 0.3)',
            cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: isLiveConnected ? '0 0 10px rgba(46, 204, 113, 0.1)' : 'none'
          }}
        >
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%', 
            background: isLiveConnected ? (refreshCountdown === null ? '#FFD700' : '#2ECC71') : '#7F8C8D', 
            boxShadow: isLiveConnected ? `0 0 8px ${refreshCountdown === null ? '#FFD700' : '#2ECC71'}` : 'none',
          }}></span>
          {isLiveConnected ? (
            <span>連線中 ({formatTimeLeft(connectionTimeLeft)}) | {refreshCountdown === null ? '同步中' : `${refreshCountdown}s`} ✕</span>
          ) : (
            <span>● 離線模式 (點擊連線)</span>
          )}
        </button>
      )}

      {/* 🔄 膠囊二：手動立即更新 */}
      {isLoaded && (
        <button 
          onClick={handleManualRefresh}
          disabled={(!isLiveConnected && cooldownTimeLeft === 0) || cooldownTimeLeft > 0}
          style={{
            position: 'fixed', top: 50, left: 10, zIndex: 9999, 
            display: 'flex', alignItems: 'center', gap: 8, 
            background: cooldownTimeLeft > 0 ? 'rgba(230, 126, 34, 0.15)' : (!isLiveConnected ? 'rgba(127, 140, 141, 0.2)' : 'rgba(52, 152, 219, 0.15)'), 
            padding: '6px 14px', borderRadius: '20px', 
            color: cooldownTimeLeft > 0 ? '#E67E22' : (!isLiveConnected ? '#BDC3C7' : '#3498DB'), 
            fontSize: '12px', fontWeight: 'bold', backdropFilter: 'blur(8px)', 
            border: cooldownTimeLeft > 0 ? '1px solid rgba(230, 126, 34, 0.4)' : (!isLiveConnected ? '1px solid rgba(127, 140, 141, 0.3)' : '1px solid rgba(52, 152, 219, 0.4)'),
            cursor: (!isLiveConnected || cooldownTimeLeft > 0) ? 'not-allowed' : 'pointer', 
            transition: 'all 0.3s ease',
            opacity: isLiveConnected ? 1 : 0.5,
            pointerEvents: isLiveConnected ? 'auto' : 'none'
          }}
        >
          <span>{cooldownTimeLeft > 0 ? `⏳ 鎖定中 (${cooldownTimeLeft}s)` : '🔄 立即手動更新'}</span>
        </button>
      )}
      <div style={{position: 'fixed', top: 10, right: 10, zIndex: 9999, display: 'flex', gap: 5}}>
        <button onClick={() => setTheme(1)} style={{padding: '5px 10px', background: theme===1?'#00F2FE':'#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '12px'}}>極簡風</button>
        <button onClick={() => setTheme(2)} style={{padding: '5px 10px', background: theme===2?'#1B3B6F':'#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '12px'}}>車票風</button>
        <button onClick={() => setTheme(3)} style={{padding: '5px 10px', background: theme===3?'#00F0FF':'#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '12px'}}>儀表板風</button>
      </div>
      {theme === 1 && <Theme1 {...props} />}
      {theme === 2 && <Theme2 {...props} />}
      {theme === 3 && <Theme3 {...props} />}
      <TrainAnimation isAnimating={isAnimating} direction={animDirection} />
      <MaintenanceDepot show={validTrains.length === 0} />

      {activeTrain && (
        <TrainJourneyModal
          train={activeTrain}
          onClose={() => setActiveTrain(null)}
          stations={allStations}
          dirInfo={dirInfo}
          isTomorrow={isTomorrow}
          origin={origin}
          dest={dest}
          theme={theme}
        />
      )}
    </>
  );
}
