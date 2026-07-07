"use client";
import { useState, useEffect } from "react";
import Theme1 from "./components/Theme1";
import Theme2 from "./components/Theme2";
import Theme3 from "./components/Theme3";

export default function Home() {
  const [data, setData] = useState(null);
  const [origin, setOrigin] = useState("桃園");
  const [dest, setDest] = useState("基隆");
  const [theme, setTheme] = useState(1);
  const [liveData, setLiveData] = useState({});

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  useEffect(() => {
    if (!origin) return;
    
    let timerId;

    const fetchLive = async () => {
      try {
        const res = await fetch(`/api/trains?origin=${origin}`);
        const result = await res.json();
        if (result.data) {
          setLiveData(result.data);
        }
      } catch (e) {
        console.error("Live fetch error", e);
      }

      // 動態計算下一次的抓取時間
      const now = new Date();
      const currentHour = now.getHours();
      
      let delayMs;
      // 23:00 到 04:59 之間，每 5 分鐘刷一次
      if (currentHour >= 23 || currentHour < 5) {
        delayMs = 5 * 60 * 1000;
      } else {
        // 白天時段，每 30 秒刷一次
        delayMs = 30 * 1000;
      }
      
      timerId = setTimeout(fetchLive, delayMs);
    };

    // 第一次立刻執行
    fetchLive();
    
    return () => clearTimeout(timerId);
  }, [origin]);

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

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  
  let validTrains = [];
  if (dirInfo) {
    data[dirInfo.dir].trains.forEach(t => {
      const oTime = t.times[dirInfo.oIdx];
      const dTime = t.times[dirInfo.dIdx];
      if(oTime && dTime) {
        const [h, m] = oTime.split(':').map(Number);
        // add live delay
        let delay = liveData[t.number] || 0;
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
      if (t.actualDepMins < currentMins) return false;
      let [dh, dm] = t.depTime.split(':').map(Number);
      let [ah, am] = t.arrTime.split(':').map(Number);
      let diff = (ah * 60 + am) - (dh * 60 + dm);
      if (diff < 0) diff += 24 * 60;
      return diff <= 12 * 60;
    });
  }

  const props = {
    origin, setOrigin, dest, setDest, allStations, validTrains, currentMins
  };

  return (
    <>
      <div style={{position: 'fixed', top: 10, right: 10, zIndex: 9999, display: 'flex', gap: 5}}>
        <button onClick={() => setTheme(1)} style={{padding: '5px 10px', background: theme===1?'#00F2FE':'#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '12px'}}>極簡風</button>
        <button onClick={() => setTheme(2)} style={{padding: '5px 10px', background: theme===2?'#1B3B6F':'#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '12px'}}>車票風</button>
        <button onClick={() => setTheme(3)} style={{padding: '5px 10px', background: theme===3?'#00F0FF':'#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '12px'}}>儀表板風</button>
      </div>
      {theme === 1 && <Theme1 {...props} />}
      {theme === 2 && <Theme2 {...props} />}
      {theme === 3 && <Theme3 {...props} />}
    </>
  );
}
