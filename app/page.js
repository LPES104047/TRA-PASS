"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Theme1 from "./components/Theme1";
import Theme2 from "./components/Theme2";
import Theme3 from "./components/Theme3";
import TrainAnimation from "./components/TrainAnimation";
import TrainJourneyModal from "./components/TrainJourneyModal";
import MaintenanceDepot from "./components/MaintenanceDepot";
import HeaderControls from "./components/HeaderControls";

import {
  getStoredOrigin,
  setStoredOrigin,
  getStoredDest,
  setStoredDest,
  getStoredTheme,
  setStoredTheme
} from "../lib/storage";
import { getTaiwanNow } from "../lib/timeUtils";
import {
  resolveDirection,
  getAnimationDirection,
  processTrainSchedules
} from "../lib/trainSchedule";
import { useLiveConnection } from "../hooks/useLiveConnection";

export default function Home() {
  const [data, setData] = useState(null);
  const [origin, setOrigin] = useState("桃園");
  const [dest, setDest] = useState("基隆");
  const [theme, setTheme] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTomorrow, setIsTomorrow] = useState(false);
  const [activeTrain, setActiveTrain] = useState(null);
  const [animDirection, setAnimDirection] = useState('ltr');
  const [isAnimating, setIsAnimating] = useState(false);
  const [twTime, setTwTime] = useState(() => getTaiwanNow());
  const animTimersRef = useRef([]);

  // 組件卸載時清除過場動畫計時器 (防記憶體洩漏)
  useEffect(() => {
    return () => {
      animTimersRef.current.forEach((t) => clearTimeout(t));
      animTimersRef.current = [];
    };
  }, []);

  // 即時連線狀態管理 Hook
  const {
    liveData,
    connStatus,
    isLiveConnected,
    connectionTimeLeft,
    cooldownTimeLeft,
    refreshCountdown,
    toggleLiveConnection,
    handleManualRefresh,
    resetConnectionTimer
  } = useLiveConnection(origin, isLoaded);

  // 定期校準台灣時區時間基準 (每秒更新，精準驅動列車等待時間與發車過濾)
  useEffect(() => {
    const timer = setInterval(() => {
      setTwTime(getTaiwanNow());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 初始化 LocalStorage 設定 (防 Storage Poisoning 與同站死鎖)
  useEffect(() => {
    requestAnimationFrame(() => {
      let storedOrigin = getStoredOrigin();
      let storedDest = getStoredDest();
      if (storedOrigin === storedDest) {
        storedDest = storedOrigin === "基隆" ? "臺北" : "基隆";
      }
      setOrigin(storedOrigin);
      setDest(storedDest);
      setTheme(getStoredTheme());
      setIsLoaded(true);
    });

    const handleUnhandledRejection = (event) => {
      if (!event.reason || event.reason?.name === 'AbortError' || event.reason === 'canceled' || event.reason?.message === 'canceled') {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  // 主題樣式動態注入
  useEffect(() => {
    if (!isLoaded) return;
    setStoredTheme(theme);

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

  // 載入靜態時刻表資料
  useEffect(() => {
    fetch(`/data.json`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("靜態班表載入失敗", err));
  }, []);

  // 方向判定 (Memoized)
  const dirInfo = useMemo(() => resolveDirection(data, origin, dest), [data, origin, dest]);

  // 有效班次計算 (Memoized，兼顧即時更新與避免無謂重繪)
  const validTrains = useMemo(() => {
    if (!data || !dirInfo) return [];
    return processTrainSchedules({
      data,
      dirInfo,
      liveData,
      isTomorrow,
      twTime
    });
  }, [data, dirInfo, liveData, isTomorrow, twTime]);

  const allStations = data?.Northbound?.stations || [];
  const currentMins = useMemo(() => {
    return twTime.getHours() * 60 + twTime.getMinutes();
  }, [twTime]);

  // 過場動畫觸發器 (含計時器追蹤與記憶體防護)
  const triggerAnimation = useCallback((stateUpdateCallback, direction = 'ltr') => {
    if (isAnimating) return;
    if (validTrains.length === 0) {
      stateUpdateCallback();
      return;
    }
    // 清除既有尚未觸發之計時器
    animTimersRef.current.forEach((t) => clearTimeout(t));
    animTimersRef.current = [];

    setAnimDirection(direction);
    setIsAnimating(true);
    const t1 = setTimeout(() => { stateUpdateCallback(); }, 2000);
    const t2 = setTimeout(() => { setIsAnimating(false); }, 4000);
    animTimersRef.current.push(t1, t2);
  }, [isAnimating, validTrains.length]);

  const handleOriginChange = useCallback((newOrigin) => {
    if (newOrigin === origin) return;
    setOrigin(newOrigin);
    setStoredOrigin(newOrigin);
    resetConnectionTimer();
  }, [origin, resetConnectionTimer]);

  const handleDestChange = useCallback((newDest) => {
    if (newDest === dest) return;
    const animDir = getAnimationDirection(data, origin, newDest);
    triggerAnimation(() => {
      setDest(newDest);
      setStoredDest(newDest);
      resetConnectionTimer();
    }, animDir);
  }, [data, dest, origin, resetConnectionTimer, triggerAnimation]);

  const handleSwap = useCallback(() => {
    if (origin === dest) return;
    const animDir = getAnimationDirection(data, dest, origin);
    triggerAnimation(() => {
      const currentOrigin = origin;
      const currentDest = dest;
      setOrigin(currentDest);
      setDest(currentOrigin);
      setStoredOrigin(currentDest);
      setStoredDest(currentOrigin);
      resetConnectionTimer();
    }, animDir);
  }, [data, dest, origin, resetConnectionTimer, triggerAnimation]);

  if (!data) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh' }}>載入中...</div>;
  }

  const themeProps = {
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
      <HeaderControls
        isLoaded={isLoaded}
        isLiveConnected={isLiveConnected}
        connStatus={connStatus}
        refreshCountdown={refreshCountdown}
        connectionTimeLeft={connectionTimeLeft}
        cooldownTimeLeft={cooldownTimeLeft}
        toggleLiveConnection={toggleLiveConnection}
        handleManualRefresh={handleManualRefresh}
        theme={theme}
        setTheme={setTheme}
      />

      {isLoaded && theme === 1 && <Theme1 {...themeProps} />}
      {isLoaded && theme === 2 && <Theme2 {...themeProps} />}
      {isLoaded && theme === 3 && <Theme3 {...themeProps} />}

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
