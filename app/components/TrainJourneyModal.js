import React, { useEffect, useState } from 'react';

export default function TrainJourneyModal({ train, onClose, stations, dirInfo, isTomorrow, origin, dest, theme }) {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // 進入時的動畫類別，產生順暢展開效果
    setAnimationClass('modal-open');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setAnimationClass('');
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // 1. 建立停靠站清單
  let stops = [];
  stations.forEach((stationName, idx) => {
    const time = train.times[idx];
    if (time) {
      stops.push({ name: stationName, time, index: idx });
    }
  });

  // 終極完美修復：台/臺 防呆轉換與起訖站相對位置對齊演算法
  // 透過標準化字串，完美防禦 TDX API 的用字差異，確保陣列精準反轉！
  const normalize = (name) => name?.replace(/臺/g, '台').trim();
  const originIdx = stops.findIndex(s => normalize(s.name) === normalize(origin));
  const destIdx = stops.findIndex(s => normalize(s.name) === normalize(dest));

  if (originIdx !== -1 && destIdx !== -1) {
    // 若出發站在目的站的下方，直接反轉，確保由上往下開
    if (originIdx > destIdx) stops.reverse();
  } 
  
  // 雙重保險：萬一起訖站沒抓到或產生時光倒流，使用時間差演算法防呆
  // 這是解決「明明車在路上卻沒資料」的核心，確保陣列時間絕對是順向的！
  let fw = 0, bw = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const [h1, m1] = stops[i].time.split(':').map(Number);
    const [h2, m2] = stops[i+1].time.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < -720) diff += 1440;
    if (diff > 720) diff -= 1440;
    if (diff > 0) fw++;
    else if (diff < 0) bw++;
  }
  if (bw > fw) stops.reverse();

  // 2. 正常化時間軸，解決跨午夜時間遞減問題
  let baseOffset = 0;
  const stopMinutesList = [];
  stops.forEach((stop, i) => {
    const [h, m] = stop.time.split(':').map(Number);
    let mins = h * 60 + m + baseOffset;
    if (i > 0) {
      const prevMins = stopMinutesList[i - 1];
      while (mins < prevMins) {
        baseOffset += 24 * 60;
        mins += 24 * 60;
      }
    }
    stopMinutesList.push(mins);
  });

  const now = new Date();
  let currentMins = now.getHours() * 60 + now.getMinutes();

  let statusText = "";
  let trainPositionIndex = 0;
  let segmentProgress = 0;
  let isTrainActive = false;

  const delay = train.delay || 0;
  const isDelayed = delay > 0 && !isTomorrow;
  const firstStationMins = stopMinutesList[0] + delay;
  const lastStationMins = stopMinutesList[stopMinutesList.length - 1] + delay;

  // 修正跨夜檢測邏輯
  if (currentMins < 240 && lastStationMins >= 1440) {
    currentMins += 1440;
  }

  if (isTomorrow) {
    statusText = "明日發車 | 表定準點";
    trainPositionIndex = 0;
    segmentProgress = 0;
    isTrainActive = false;
  } else {
    if (currentMins < firstStationMins) {
      statusText = `尚未發車 (預計 ${stops[0].time} 自 ${stops[0].name} 發車)`;
      trainPositionIndex = 0;
      segmentProgress = 0;
      isTrainActive = false;
    } else if (currentMins >= lastStationMins) {
      statusText = "列車已抵達終點站";
      trainPositionIndex = stops.length - 1;
      segmentProgress = 0;
      isTrainActive = false;
    } else {
      isTrainActive = true;
      for (let i = 0; i < stops.length - 1; i++) {
        const t1 = stopMinutesList[i] + delay;
        const t2 = stopMinutesList[i + 1] + delay;
        
        if (currentMins >= t1 && currentMins < t2) {
          trainPositionIndex = i;
          segmentProgress = (currentMins - t1) / (t2 - t1);
          
          if (currentMins - t1 < 2) {
            statusText = `停靠中：${stops[i].name} 站`;
            segmentProgress = 0;
          } else {
            statusText = `行駛中：${stops[i].name} ➡️ ${stops[i+1].name}`;
          }
          break;
        }
      }
    }
  }

  const formatStopActualTime = (tableTime, index) => {
    const [h, m] = tableTime.split(':').map(Number);
    let totalMins = h * 60 + m + (isTomorrow ? 0 : delay);
    // 防禦 JS 負數取模崩潰：確保倒扣時間時不會跑出負數
    totalMins = ((totalMins % 1440) + 1440) % 1440;
    const rh = Math.floor(totalMins / 60);
    const rm = totalMins % 60;
    return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
  };

  const stopHeight = 65;
  // 修正垂直軸心位置：站點圓心在第 index 個節點的 top + 10px 處
  const trainTopOffset = (trainPositionIndex * stopHeight) + (segmentProgress * stopHeight) + 10;

  const isStopPassed = (index) => {
    if (isTomorrow) return false;
    const stopMins = stopMinutesList[index] + delay;
    return currentMins > stopMins;
  };

  const isOrigin = (name) => normalize(name) === normalize(origin);
  const isDest = (name) => normalize(name) === normalize(dest);

  const getThemeClass = () => {
    if (theme === 2) return 'theme2-modal';
    if (theme === 3) return 'theme3-modal';
    return 'theme1-modal';
  };

  const themeColor = isDelayed ? '#FF4B30' : '#00F0FF';
  const trackGradient = isDelayed 
   ? 'linear-gradient(to bottom, #FF4B30, #FF8C00)' 
   : 'linear-gradient(to bottom, #00F0FF, #0080FF)';

  const OriginBadge = () => (
   <div className="station-badge origin">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
    出發站
   </div>
  );

  const DestBadge = () => (
   <div className="station-badge dest">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
    目的站
   </div>
  );

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px);
          z-index: 10000; display: flex; align-items: flex-end; justify-content: center;
          transition: background 0.3s ease, backdrop-filter 0.3s ease; pointer-events: auto;
        }
        .modal-overlay.modal-open {
          background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        }
        .modal-sheet {
          width: 100%; max-width: 500px; background: #0B132B;
          border-top-left-radius: 24px; border-top-right-radius: 24px;
          padding: 24px 24px 40px 24px; box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
          transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          max-height: 85vh; display: flex; flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.1); border-bottom: none;
        }
        .theme2-modal .modal-sheet { background: #FFFFFF; border-color: rgba(0, 0, 0, 0.05); }
        .theme2-modal .modal-header h2, .theme2-modal .modal-header p, .theme2-modal .station-name { color: #1B3B6F; }
        .theme2-modal .station-time { color: #64748B; }
        .theme2-modal .close-btn { background: #F1F5F9; color: #1B3B6F; }

        .theme3-modal .modal-sheet { background: rgba(10, 10, 10, 0.85); border-color: rgba(0, 240, 255, 0.2); }
     
        .modal-open .modal-sheet { transform: translateY(0); }
     
        .modal-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px; margin-bottom: 16px;
        }
        .theme2-modal .modal-header { border-color: rgba(0, 0, 0, 0.05); }
     
        .modal-header h2 { margin: 0 0 6px 0; font-size: 18px; display: flex; align-items: center; gap: 8px; color: #fff; }
        .modal-header p { margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); }
        .close-btn {
          background: rgba(255, 255, 255, 0.08); border: none; width: 32px; height: 32px;
          border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
        }
        .close-btn:hover { background: rgba(255, 255, 255, 0.15); }
        .journey-scroll { flex: 1; overflow-y: auto; padding-right: 10px; }
     
        /* 物理防歪斜對齊基底 */
        .journey-container {
          position: relative;
          padding-left: 70px;
          margin-top: 10px;
          padding-bottom: 30px;
        }
        .station-node {
          position: relative;
          height: 65px;
        }
        .station-time {
          position: absolute;
          left: -70px;
          top: -2px;
          width: 55px;
          text-align: right;
          font-size: 14px;
          font-family: monospace;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        .station-node.passed .station-time { color: rgba(255, 255, 255, 0.4); }
        .theme2-modal .station-node.passed .station-time { color: rgba(0, 0, 0, 0.3); }
 
        /* 絕對中軸線 left: 28px */
        .station-dot {
          position: absolute;
          left: 28px;
          top: 4px;
          transform: translateX(-50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          z-index: 2;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .theme2-modal .station-dot { background: #E2E8F0; }
        .station-node.passed .station-dot { background: rgba(255, 255, 255, 0.2); }
        .theme2-modal .station-node.passed .station-dot { background: rgba(0, 0, 0, 0.1); }
     
        .station-node.current .station-dot {
          background: ${themeColor};
          box-shadow: 0 0 10px ${themeColor};
        }
     
        .station-line-bg {
          position: absolute;
          left: 28px;
          top: 16px;
          bottom: -4px;
          width: 2px;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.15);
          z-index: 1;
        }
        .theme2-modal .station-line-bg { background: rgba(0, 0, 0, 0.06); }
     
        .station-line-progress {
          position: absolute;
          left: 28px;
          top: 16px;
          width: 2px;
          transform: translateX(-50%);
          background: ${trackGradient};
          z-index: 1;
          transition: height 0.3s linear;
        }
 
        .station-name-row {
          position: absolute;
          left: 50px;
          top: -3px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .station-name {
          font-weight: 600;
          font-size: 16px;
          color: #fff;
          transition: color 0.3s;
        }
        .station-node.passed .station-name { color: rgba(255, 255, 255, 0.4); }
        .theme2-modal .station-node.passed .station-name { color: rgba(0, 0, 0, 0.3); }
 
        .station-badge {
          display: inline-flex; align-items: center; gap: 4px; font-size: 11px;
          padding: 2px 6px; border-radius: 6px; font-weight: 700;
        }
        .station-badge.origin {
          background: rgba(46, 204, 113, 0.15); color: #2ECC71; border: 1px solid rgba(46, 204, 113, 0.3);
        }
        .station-badge.dest {
          background: rgba(255, 75, 48, 0.15); color: #FF4B30; border: 1px solid rgba(255, 75, 48, 0.3);
        }
     
        .delay-time {
          font-size: 11px; color: #FF4B30; background: rgba(255, 75, 48, 0.1);
          padding: 2px 6px; border-radius: 4px; font-weight: bold;
        }
 
        .live-train-indicator {
          position: absolute;
          left: 98px; /* 70px container padding + 28px line offset */
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background: ${themeColor};
          border-radius: 50%;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px ${themeColor};
          transition: top 0.5s ease-out, background 0.3s;
        }
        .live-train-indicator svg {
          width: 14px;
          height: 14px;
          fill: #0B132B;
        }
        .theme2-modal .live-train-indicator svg { fill: #FFF; }
     
        /* 隱藏捲動軸 */
        .journey-scroll::-webkit-scrollbar { width: 6px; }
        .journey-scroll::-webkit-scrollbar-track { background: transparent; }
        .journey-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .theme2-modal .journey-scroll::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); }
      `}</style>
 
      <div className={`modal-overlay ${animationClass} ${getThemeClass()}`} onClick={handleClose}>
        <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2>
                <span style={{ fontSize: '13px', background: isDelayed ? 'rgba(255, 75, 48, 0.15)' : 'rgba(0, 242, 254, 0.15)', color: themeColor, padding: '2px 8px', borderRadius: '10px' }}>
                  {train.type}
                </span>
                {train.number} 次
              </h2>
              <p>開往 {train.route.split('－')[1] || train.route}</p>
            </div>
            <button className="close-btn" onClick={handleClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
 
          <div style={{ padding: '10px 15px', background: isDelayed ? 'rgba(255, 75, 48, 0.1)' : 'rgba(0, 240, 255, 0.05)', borderRadius: '12px', marginBottom: '15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: themeColor, fontWeight: '600' }}>
            {isTrainActive ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" /></circle></svg> 列車動態 | {statusText}</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> 班次資訊 | {statusText}</>
            )}
          </div>
 
          <div className="journey-scroll">
            <div className="journey-container">
              {isTrainActive && (
                <div className="live-train-indicator" style={{ top: `${trainTopOffset}px` }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C8 2 4 4.5 4 12V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V12C20 4.5 16 2 12 2ZM12 4C15 4 17.5 5.5 18 10H6C6.5 5.5 9 4 12 4ZM6 20V12H18V20H6ZM9 16C9 14.9 8.1 14 7 14C5.9 14 5 14.9 5 16C5 17.1 5.9 18 7 18C8.1 18 9 17.1 9 16ZM19 16C19 14.9 18.1 14 17 14C15.9 14 15 14.9 15 16C15 17.1 15.9 18 17 18C18.1 18 19 17.1 19 16Z" />
                  </svg>
                </div>
              )}
 
              {stops.map((stop, index) => {
                const isPassed = isStopPassed(index);
                const isCurrent = index === trainPositionIndex && isTrainActive;
                
                return (
                  <div key={index} className={`station-node ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="station-time">
                      {stop.time}
                    </div>
                    <div className="station-dot" />
                    
                    {index < stops.length - 1 && (
                      <>
                        <div className="station-line-bg" />
                        {isPassed && (
                          <div className="station-line-progress" style={{ bottom: '-4px' }} />
                        )}
                        {isCurrent && (
                          <div className="station-line-progress" style={{ height: `calc(${segmentProgress * 100}% + 4px)` }} />
                        )}
                      </>
                    )}
 
                    <div className="station-name-row">
                      <div className="station-name">{stop.name}</div>
                      {isOrigin(stop.name) && <OriginBadge />}
                      {isDest(stop.name) && <DestBadge />}
                      {isDelayed && !isTomorrow && (
                        <div className="delay-time">
                          預計 {formatStopActualTime(stop.time, index)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
