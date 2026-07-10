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
    }, 300); // 配合 CSS transition 時間
  };

  // 1. 重構列車的停靠車站清單與表定時間
  const stops = [];
  stations.forEach((stationName, idx) => {
    const time = train.times[idx];
    if (time) {
      stops.push({
        name: stationName,
        time,
        index: idx,
      });
    }
  });

  // 2. 正常化時間軸，解決跨午夜時間遞減問題
  let baseOffset = 0;
  const stopMinutesList = [];
  stops.forEach((stop, i) => {
    const [h, m] = stop.time.split(':').map(Number);
    let mins = h * 60 + m + baseOffset;
    if (i > 0 && mins < stopMinutesList[i - 1]) {
      baseOffset += 24 * 60;
      mins += 24 * 60;
    }
    stopMinutesList.push(mins);
  });

  // 3. 取得當前時間（分鐘數）
  const now = new Date();
  let currentMins = now.getHours() * 60 + now.getMinutes();

  // 4. 計算列車當前運行狀態與位置
  let statusText = "";
  let trainPositionIndex = 0; // 車子在第幾個站點
  let segmentProgress = 0;    // 站間進度 (0 到 1)
  let isTrainActive = false;  // 列車是否已經在跑

  const delay = train.delay || 0;
  const firstStationMins = stopMinutesList[0] + delay;
  const lastStationMins = stopMinutesList[stopMinutesList.length - 1] + delay;

  // 【跨夜邏輯修正】：如果目前是凌晨 (例如 00:00 ~ 04:00，小於 240 分鐘)
  // 且列車終點站的表定時間已經跨夜 (大於等於 1440)
  // 我們就必須把目前時間也加上 1440，讓它們處於同一個時空維度
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
      // 尋找目前處於哪兩個車站之間
      for (let i = 0; i < stops.length - 1; i++) {
        const t1 = stopMinutesList[i] + delay;
        const t2 = stopMinutesList[i + 1] + delay;
        
        if (currentMins >= t1 && currentMins < t2) {
          trainPositionIndex = i;
          segmentProgress = (currentMins - t1) / (t2 - t1);
          
          // 如果剛好在出發點 1 分鐘內，算作「停靠中」，否則算「行駛中」
          if (currentMins - t1 < 2) {
            statusText = `停靠中：${stops[i].name} 站`;
            segmentProgress = 0; // 停靠在站點上
          } else {
            statusText = `行駛中：${stops[i].name} ➡️ ${stops[i+1].name}`;
          }
          break;
        }
      }
    }
  }

  // 格式化時間 (加上誤點)
  const formatStopActualTime = (tableTime, index) => {
    const [h, m] = tableTime.split(':').map(Number);
    let totalMins = h * 60 + m + (isTomorrow ? 0 : delay);
    const rh = Math.floor((totalMins % 1440) / 60);
    const rm = totalMins % 60;
    return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
  };

  // 計算小火車 Icon 的垂直位置 (每一站高度設定為 65px)
  const stopHeight = 65;
  const trainTopOffset = (trainPositionIndex * stopHeight) + (segmentProgress * stopHeight) + 15; // 15px 為微調置中偏差

  // 是否是已經通過的站
  const isStopPassed = (index) => {
    if (isTomorrow) return false;
    const stopMins = stopMinutesList[index] + delay;
    // 如果目前時間大於該站出發時間，則算通過
    return currentMins > stopMins;
  };

  // 取得起迄站的狀態
  const isOrigin = (name) => name === origin;
  const isDest = (name) => name === dest;

  // 動態主題外觀樣式
  const getThemeClass = () => {
    if (theme === 2) return 'theme2-modal';
    if (theme === 3) return 'theme3-modal';
    return 'theme1-modal';
  };

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          z-index: 10000;
          display: flex;
          align-items: flex-end; /* 從底部滑出 */
          justify-content: center;
          transition: background 0.3s ease, backdrop-filter 0.3s ease;
          pointer-events: auto;
        }

        .modal-overlay.modal-open {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .modal-sheet {
          width: 100%;
          max-width: 500px;
          background: #1a1a24;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px 24px 0 0;
          padding: 24px;
          box-sizing: border-box;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: #fff;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
        }

        .modal-open .modal-sheet {
          transform: translateY(0);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .modal-header h2 {
          margin: 0 0 6px 0;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-header p {
          margin: 0;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }

        .close-btn {
          background: rgba(255,255,255,0.08);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.15);
        }

        /* 🟢 運行狀態 Badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 242, 254, 0.1);
          border: 1px solid rgba(0, 242, 254, 0.2);
          color: #00F2FE;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
          align-self: flex-start;
        }

        .status-badge.delayed {
          background: rgba(255, 79, 79, 0.1);
          border-color: rgba(255, 79, 79, 0.2);
          color: #FF4B30;
        }

        .status-badge.completed {
          background: rgba(79, 255, 120, 0.1);
          border-color: rgba(79, 255, 120, 0.2);
          color: #2ECC71;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
          position: relative;
        }

        /* 🚂 垂直進度軸線軌道 */
        .timeline-container {
          position: relative;
          padding-left: 55px; /* 留位置放時間與小火車 */
          margin: 10px 0;
        }

        .timeline-line {
          position: absolute;
          left: 18px;
          top: 15px;
          bottom: 15px;
          width: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .timeline-line-progress {
          position: absolute;
          left: 18px;
          top: 15px;
          width: 3px;
          background: linear-gradient(180deg, #2ECC71, #00F2FE);
          border-radius: 2px;
          transition: height 0.3s ease;
        }

        /* 📍 車站點節點 */
        .station-node {
          position: relative;
          height: 65px; /* 剛好與 stopHeight 相符 */
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .station-dot {
          position: absolute;
          left: -35.5px; 
          /* 💡 精準修正：置於 19.5px 的軌道中線 (-35.5px + 55px padding) */
          top: 15px;    
          /* 💡 精準修正：與 30px 高度的文字行保持完美的絕對垂直居中 */
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #777;
          border: 2px solid #1a1a24;
          z-index: 2;
          transform: translate(-50%, -50%); 
          /* 💡 運用位移確保絕對中心對齊 */
          transition: background 0.3s, box-shadow 0.3s;
        }

        .station-node.passed .station-dot {
          background: #2ECC71;
          box-shadow: 0 0 6px rgba(46, 204, 113, 0.4);
        }

        .station-node.current .station-dot {
          background: #00F2FE;
          box-shadow: 0 0 10px #00F2FE;
        }

        .station-node.passed .station-name {
          color: rgba(255,255,255,0.4);
        }

        .station-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 30px;
        }

        .station-name {
          font-weight: 600;
          font-size: 15px;
          color: #fff;
          transition: color 0.3s;
        }

        /* 🛫 🛬 起迄站特別標記 */
        .station-badge {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
        }

        .station-badge.origin {
          background: rgba(46, 204, 113, 0.2);
          color: #2ECC71;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }

        .station-badge.dest {
          background: rgba(0, 242, 254, 0.2);
          color: #00F2FE;
          border: 1px solid rgba(0, 242, 254, 0.3);
        }

        .station-time {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          position: absolute;
          left: -105px; /* 推到最左側 */
          width: 50px;
          text-align: right;
          top: 8px;
          font-family: monospace;
        }

        .station-node.passed .station-time {
          color: rgba(255,255,255,0.3);
        }

        .station-time del {
          display: block;
          font-size: 10px;
          opacity: 0.5;
        }

        .station-time .actual-time {
          color: #FF4B30;
          font-weight: bold;
        }

        /* 🚂 實時動態小火車圖標 */
        .live-train-indicator {
          position: absolute;
          left: 19.5px; 
          /* 💡 修正資安/介面地雷：原先 10px 導致火車偏左脫軌，改為 19.5px 完美契合軌道中線 */
          width: 19px;
          height: 19px;
          background: #2ECC71;
          border-radius: 50%;
          border: 3px solid #1a1a24;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px #2ECC71;
          transform: translate(-50%, -50%);
          transition: top 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .live-train-indicator::after {
          content: '';
          position: absolute;
          width: 27px;
          height: 27px;
          border-radius: 50%;
          border: 2px solid #2ECC71;
          animation: pulseRing 1.5s infinite ease-out;
        }

        @keyframes pulseRing {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .live-train-svg {
          width: 10px;
          height: 10px;
          fill: #fff;
        }

        /* 🎟️ 不同主題下的 Modal 特殊調整 */
        .theme2-modal .modal-sheet {
          background: #ebeff7;
          color: #2c3e50;
          border-top: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
        }

        .theme2-modal .close-btn {
          background: rgba(0,0,0,0.05);
          color: #2c3e50;
        }

        .theme2-modal .close-btn:hover {
          background: rgba(0,0,0,0.1);
        }

        .theme2-modal .modal-header p {
          color: rgba(44, 62, 80, 0.6);
        }

        .theme2-modal .station-name {
          color: #2c3e50;
        }

        .theme2-modal .station-time {
          color: rgba(44, 62, 80, 0.6);
        }

        .theme2-modal .station-node.passed .station-name {
          color: rgba(44, 62, 80, 0.4);
        }

        .theme2-modal .station-dot {
          border-color: #ebeff7;
          background: #bdc3c7;
        }

        .theme3-modal .modal-sheet {
          background: #110826;
          border-top: 2px solid #00F0FF;
          box-shadow: 0 -10px 45px rgba(0, 240, 255, 0.15);
        }

        .theme3-modal .station-dot {
          border-color: #110826;
        }

        .theme3-modal .timeline-line-progress {
          background: linear-gradient(180deg, #00FF87, #00F0FF);
        }

        .theme3-modal .live-train-indicator {
          background: #00F0FF;
          box-shadow: 0 0 15px #00F0FF;
        }

        .theme3-modal .live-train-indicator::after {
          border-color: #00F0FF;
        }
      `}</style>

      <div className={`modal-overlay ${animationClass} ${getThemeClass()}`} onClick={handleClose}>
        <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2>
                <span style={{ fontSize: '13px', background: 'rgba(0,242,254,0.15)', color: '#00F2FE', padding: '3px 6px', borderRadius: '4px', border: '1px solid rgba(0,242,254,0.2)' }}>
                  {train.type}
                </span>
                <span>{train.number} 次</span>
              </h2>
              <p>開往：{train.route}</p>
            </div>
            <button className="close-btn" onClick={handleClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className={`status-badge ${delay > 0 ? 'delayed' : 'completed'}`}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
            <span>{isTomorrow ? "明日發車" : delay > 0 ? `誤點 ${delay} 分鐘` : "準點行駛"}</span>
            <span style={{ margin: '0 4px', opacity: 0.5 }}>|</span>
            <span style={{ fontWeight: 'normal' }}>{statusText}</span>
          </div>

          <div className="modal-body">
            <div className="timeline-container">
              {/* 鐵軌底線 */}
              <div className="timeline-line"></div>
              
              {/* 鐵軌進度亮線 */}
              <div 
                className="timeline-line-progress" 
                style={{ 
                  height: `${isTomorrow ? 0 : (trainPositionIndex * stopHeight) + (segmentProgress * stopHeight)}px` 
                }}
              ></div>

              {/* 小火車實時位置圖標 */}
              <div 
                className="live-train-indicator"
                style={{ 
                  top: `${trainTopOffset}px`,
                  display: (isTomorrow || currentMins < firstStationMins || currentMins > lastStationMins) ? 'none' : 'flex'
                }}
              >
                <svg className="live-train-svg" viewBox="0 0 24 24">
                  <path d="M4 18h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zm4-12h8v2H8V6zm-2 8c0-.55.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1H7c-.55 0-1-.45-1-1z" />
                </svg>
              </div>

              {stops.map((stop, index) => {
                const passed = isStopPassed(index);
                const current = !isTomorrow && isTrainActive && trainPositionIndex === index;
                
                return (
                  <div 
                    key={stop.name} 
                    className={`station-node ${passed ? 'passed' : ''} ${current ? 'current' : ''}`}
                  >
                    {/* 車站圓點 */}
                    <div className="station-dot"></div>

                    {/* 時間顯示 (左側) */}
                    <div className="station-time">
                      {delay > 0 && !isTomorrow ? (
                        <>
                          <del>{stop.time}</del>
                          <span className="actual-time">{formatStopActualTime(stop.time, index)}</span>
                        </>
                      ) : (
                        <span>{stop.time}</span>
                      )}
                    </div>

                    {/* 車站名稱與起迄站 Badge */}
                    <div className="station-name-row">
                      <span className="station-name">{stop.name}</span>
                      {isOrigin(stop.name) && <span className="station-badge origin">出發站 🛫</span>}
                      {isDest(stop.name) && <span className="station-badge dest">目的地 🏁</span>}
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
