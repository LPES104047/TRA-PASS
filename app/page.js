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
  const [isTabActive, setIsTabActive] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const lastFetchTimeRef = useRef(0);

  // 初始化時讀取 LocalStorage
  useEffect(() => {
    const savedOrigin = localStorage.getItem("train_origin");
    const savedDest = localStorage.getItem("train_dest");
    const savedTheme = localStorage.getItem("train_theme");

    // 使用 setTimeout 延遲更新以防 React 19+ 同步引發階梯式重繪規則警告
    setTimeout(() => {
      if (savedOrigin) setOrigin(savedOrigin);
      if (savedDest) setDest(savedDest);
      if (savedTheme) setTheme(Number(savedTheme));
      setIsLoaded(true);
    }, 0);
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

  // 監聽 Visibility API 與 閒置偵測 (5 分鐘 = 300,000 ms)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Visibility
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Idle Detection
    let idleTimer;
    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdle(true);
      }, 300000); // 5 分鐘
    };

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);
    window.addEventListener("scroll", resetIdleTimer);

    resetIdleTimer();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
      window.removeEventListener("scroll", resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, []);

  useEffect(() => {
    fetch(`/data.json?v=${Date.now()}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  useEffect(() => {
    if (!isLoaded || !origin) return;
    
    let countdownInterval;

    const fetchLive = async () => {
      setRefreshCountdown(null); // Show loading or wait state while fetching
      try {
        const res = await fetch(`/api/trains?origin=${origin}&_t=${Date.now()}`);
        const result = await res.json();
        if (result.data) {
          setLiveData(result.data);
          lastFetchTimeRef.current = Date.now();
        }
      } catch (e) {
        console.error("Live fetch error", e);
      }

      // 動態計算下一次的抓取時間（與現實時鐘同步）
      const now = new Date();
      const currentHour = now.getHours();
      const currentMins = now.getMinutes();
      const currentSecs = now.getSeconds();
      
      let delaySeconds;
      if (currentHour >= 23 || currentHour < 5) {
        // 半夜：每 5 分鐘的整點觸發 (例如 00, 05, 10...)
        const totalSecs = currentMins * 60 + currentSecs;
        const nextMarkSecs = Math.ceil((totalSecs + 1) / 300) * 300; // +1 避免剛好在 0 秒時算出自己
        delaySeconds = nextMarkSecs - totalSecs;
      } else {
        // 白天：每 3 分鐘的整點觸發 (例如 00, 03, 06, 09...)以節省點數
        const totalSecs = currentMins * 60 + currentSecs;
        const nextMarkSecs = Math.ceil((totalSecs + 1) / 180) * 180;
        delaySeconds = nextMarkSecs - totalSecs;
      }
      
      setRefreshCountdown(delaySeconds);

      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = setInterval(() => {
        setRefreshCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            fetchLive();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // 如果目前分頁活躍且非閒置，才進行 fetch 或是設定定時器
    if (isTabActive && !isIdle) {
      const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
      if (timeSinceLastFetch >= 180000 || lastFetchTimeRef.current === 0) {
        // 已過期或第一次載入，立刻向後端取資料
        fetchLive();
      } else {
        // 未過期，計算剩餘時間並重啟倒數計時器
        const remainingSecs = Math.max(1, Math.ceil((180000 - timeSinceLastFetch) / 1000));
        setRefreshCountdown(remainingSecs);
        
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
          setRefreshCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              fetchLive();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      // 若背景中或閒置，清空倒數顯示
      setRefreshCountdown(null);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [origin, isLoaded, isTabActive, isIdle]);

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

  // const now = new Date();
  // 記住這位置！記住記住記住！
  const currentMins = 23 * 60 + 59; // 為了開發，固定在半夜 23:59 (收班無車狀態)
  // const currentMins = now.getHours() * 60 + now.getMinutes();
  
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
      if (!isTomorrow && t.actualDepMins < currentMins) return false;
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

  const handleOriginChange = (newOrigin) => {
    if (newOrigin === origin) return;
    setOrigin(newOrigin); // 立即更新，不觸發動畫
    localStorage.setItem("train_origin", newOrigin);
  };

  const handleDestChange = (newDest) => {
    if (newDest === dest) return;
    const animDir = getDirectionAnim(origin, newDest);
    triggerAnimation(() => {
      setDest(newDest);
      localStorage.setItem("train_dest", newDest);
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
    }, animDir);
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
      <div style={{
        position: 'fixed', top: 10, left: 10, zIndex: 9999, 
        display: 'flex', alignItems: 'center', gap: 8, 
        background: isIdle ? 'rgba(231, 76, 60, 0.2)' : 'rgba(0,0,0,0.5)', 
        padding: '5px 12px', borderRadius: '20px', 
        color: isIdle ? '#FF6B6B' : '#00F2FE', 
        fontSize: '12px', backdropFilter: 'blur(5px)', 
        border: isIdle ? '1px solid rgba(231, 76, 60, 0.4)' : '1px solid rgba(0, 242, 254, 0.3)',
        transition: 'all 0.5s ease'
      }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%', 
          background: isIdle ? '#FF6B6B' : (refreshCountdown === null ? '#FFD700' : '#00F2FE'), 
          boxShadow: `0 0 8px ${isIdle ? '#FF6B6B' : (refreshCountdown === null ? '#FFD700' : '#00F2FE')}`
        }}></span>
        {isIdle ? '💤 已暫停自動更新 (移動滑鼠以恢復)' : (refreshCountdown === null ? '正在同步 TDX...' : `TDX 即時更新倒數 ${refreshCountdown}s`)}
      </div>
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
