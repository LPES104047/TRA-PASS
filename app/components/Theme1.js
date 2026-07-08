import React, { useState, useEffect, useRef } from "react";

export default function Theme1({ origin, setOrigin, dest, setDest, handleSwap, allStations, validTrains, currentMins, isTomorrow, setIsTomorrow, onTrainSelect }) {
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const originRef = useRef(null);
  const destRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setIsOriginOpen(false);
      }
      if (destRef.current && !destRef.current.contains(event.target)) {
        setIsDestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const nextTrain = validTrains[0];
  let diffMins = 0;
  if (nextTrain) {
    diffMins = nextTrain.actualDepMins - currentMins;
  }

  const getTrainDotClass = (type) => {
    if(type.includes('區間')) return '';
    if(type.includes('自強') || type.includes('普悠瑪') || type.includes('太魯閣')) return 'fast';
    return 'express';
  };

  const formatTime = (mins) => {
    let h = Math.floor(mins / 60) % 24;
    let m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <>
      <style>{`
        .theme1-root {
          --bg: #0B132B;
          --surface: rgba(255, 255, 255, 0.15);
          --primary: #FFFFFF;
          --accent: #FFD700;
          --text-main: #FFFFFF;
          --text-muted: rgba(255, 255, 255, 0.7);
          
          --train-local: #2ECC71;
          --train-fast: #F1C40F;
          --train-express: #E74C3C;
          
          min-height: 100vh;
          color: var(--text-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          padding: 80px 20px 40px 20px;
          box-sizing: border-box;
        }
        
        .theme1-root .container {
          max-width: 500px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.08);
          padding: 30px 20px;
          border-radius: 40px 10px 40px 10px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
        }
        
        .theme1-root h1 {
          font-size: 20px;
          font-weight: 800;
          text-align: center;
          margin: 0 0 30px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .theme1-root .selector {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
          position: relative;
        }
        
        .theme1-root .select-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .theme1-root .select-group label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-left: 15px;
        }
        
        .theme1-root .custom-select {
          position: relative;
          cursor: pointer;
        }
        .theme1-root .select-trigger {
          background: var(--surface);
          padding: 12px 20px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 15px;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .theme1-root .select-trigger:hover {
          background: rgba(255,255,255,0.25);
          border-color: rgba(255,255,255,0.2);
        }
        .theme1-root .select-trigger::after {
          content: '▼';
          font-size: 10px;
          color: var(--accent);
          transition: transform 0.3s;
        }
        
        .theme1-root .select-options {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 15px;
          margin-top: 5px;
          max-height: 250px;
          overflow-y: auto;
          z-index: 100;
          display: none;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          backdrop-filter: blur(10px);
        }
        .theme1-root .select-options.open {
          display: block;
        }
        .theme1-root .option-item {
          padding: 12px 20px;
          font-weight: 600;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.2s;
        }
        .theme1-root .option-item:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          padding-left: 25px;
        }
        .theme1-root .option-item.selected {
          background: var(--accent);
          color: #000;
        }
        
        .theme1-root .swap-btn {
          background: var(--surface);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
          transform: translateY(10px);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          z-index: 5;
        }
        .theme1-root .swap-btn:hover { transform: translateY(10px) scale(1.1) rotate(180deg); }
        
        .theme1-root .next-train-card { text-align: center; margin-bottom: 45px; margin-top: 10px; }
        .theme1-root .countdown { font-size: 80px; font-weight: 800; line-height: 0.95; margin: 15px 0; color: #FFFFFF; text-shadow: 0 0 25px rgba(255, 255, 255, 0.25); font-variant-numeric: tabular-nums; }
        .theme1-root .countdown span { font-size: 24px; color: var(--accent); font-weight: 600; margin-left: 4px; text-shadow: none; text-transform: uppercase; }
        .theme1-root .subtitle { font-size: 13px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 3px; font-weight: 500; }
        .theme1-root .dest-highlight { color: #FFFFFF; font-weight: 700; background: rgba(255, 215, 0, 0.25); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(255, 215, 0, 0.4); margin-left: 4px; }
        
        .theme1-root .schedule-list { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 500px; margin: 0 auto; }
        
        .theme1-root .train-card {
            position: relative; 
            background: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05)); 
            padding: 22px 28px; border-radius: 40px 10px 40px 10px; display: flex; justify-content: space-between; align-items: center; 
            margin-bottom: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.5); 
            border: 1px solid rgba(255,255,255,0.3); border-left: 0;
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
        }
        .theme1-root .train-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: var(--train-local); border-radius: 6px 0 0 6px; box-shadow: 0 0 15px var(--train-local); }
        .theme1-root .train-card.fast::before { background: var(--train-fast); box-shadow: 0 0 15px var(--train-fast); }
        .theme1-root .train-card.express::before { background: var(--train-express); box-shadow: 0 0 15px var(--train-express); }
        .theme1-root .train-card.express { border-left-color: var(--train-express); }
        
        .theme1-root .train-details h3 { margin: 0; font-size: 22px; font-weight: 800; color: #fff; letter-spacing: 1px; font-variant-numeric: tabular-nums; }
        .theme1-root .train-details p { margin: 8px 0 0 0; font-size: 13px; color: var(--text-muted); font-weight: 600; display: flex; align-items: center; }
        .theme1-root .duration-badge { background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 6px; font-size: 11px; margin-left: 8px; color: #fff; font-weight: bold; }
        
        .theme1-root .train-time { font-size: 22px; font-weight: 800; color: #fff; text-align: right; letter-spacing: 1px; font-variant-numeric: tabular-nums; }
        .theme1-root .train-time span { display: block; font-size: 11px; color: var(--accent); margin-top: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        
        .theme1-root .delay-text { color: #FF6B6B; font-size: 11px; font-weight: bold; margin-left: 5px; }

        .theme1-root .date-toggle-container {
          display: flex;
          justify-content: center;
          margin-bottom: 25px;
          margin-top: 10px;
        }

        .theme1-root .date-toggle {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 3px;
          display: flex;
          width: 200px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .theme1-root .toggle-btn {
          flex: 1;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          padding: 6px 12px;
          border-radius: 17px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .theme1-root .toggle-btn.active {
          background: #ffffff;
          color: #0B132B;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        @media (min-width: 768px) {
            .theme1-root .container { max-width: 650px; padding: 40px; }
            .theme1-root .schedule-list { max-width: 650px; display: flex; flex-direction: column; gap: 20px; }
            .theme1-root .train-details h3 { font-size: 40px; margin-bottom: 5px; text-align: left; }
            .theme1-root .train-time { font-size: 40px; text-align: right; }
            .theme1-root h1 { font-size: 26px; letter-spacing: 3px; }
            .theme1-root .selector { max-width: 650px; gap: 20px; }
            .theme1-root .select-trigger { font-size: 18px; padding: 15px 20px; }
            .theme1-root .train-details p { font-size: 16px; margin-top: 8px; justify-content: flex-start; }
            .theme1-root .train-time span { font-size: 14px; margin-top: 8px; justify-content: flex-end; }
            .theme1-root .countdown { font-size: 110px; }
            .theme1-root .countdown span { font-size: 32px; }
            .theme1-root .subtitle { font-size: 15px; }
        }
      `}</style>
      
      <div className="theme1-root">
        <div className="container">
            <h1>個人時刻表 Minimalist</h1>
            
            <div className="selector">
                <div className="select-group" ref={originRef}>
                    <label>出發地 Origin</label>
                    <div className="custom-select" onClick={() => { setIsOriginOpen(!isOriginOpen); setIsDestOpen(false); }}>
                        <div className="select-trigger">{origin}</div>
                        <div className={`select-options ${isOriginOpen ? 'open' : ''}`}>
                            {allStations.map(s => (
                                <div key={s} className={`option-item ${s === origin ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setOrigin(s); setIsOriginOpen(false); }}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <button className="swap-btn" onClick={handleSwap}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        <path d="M16 17H4M4 17l4 4M4 17l4-4M8 7h12M20 7l-4-4M20 7l-4 4"/>
                    </svg>
                </button>
                <div className="select-group" ref={destRef}>
                    <label>目的地 Destination</label>
                    <div className="custom-select" onClick={() => { setIsDestOpen(!isDestOpen); setIsOriginOpen(false); }}>
                        <div className="select-trigger">{dest}</div>
                        <div className={`select-options ${isDestOpen ? 'open' : ''}`}>
                            {allStations.map(s => (
                                <div key={s} className={`option-item ${s === dest ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setDest(s); setIsDestOpen(false); }}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {nextTrain && !isTomorrow ? (
              <div className="next-train-card">
                  <div className="subtitle">距離下一班車</div>
                  <div className="countdown">
                    {diffMins > 60 ? Math.floor(diffMins/60) : diffMins}
                    <span>{diffMins > 60 ? 'hr' : 'mins'}</span>
                    {diffMins > 60 && ` ${diffMins%60}`}
                    {diffMins > 60 && <span>m</span>}
                  </div>
                  <div className="subtitle">開往 <span className="dest-highlight">{dest}</span></div>
              </div>
            ) : null}

            <div className="date-toggle-container">
              <div className="date-toggle">
                <button className={`toggle-btn ${!isTomorrow ? 'active' : ''}`} onClick={() => setIsTomorrow(false)}>今日班次</button>
                <button className={`toggle-btn ${isTomorrow ? 'active' : ''}`} onClick={() => setIsTomorrow(true)}>明日班次</button>
              </div>
            </div>

            <div className="schedule-list">
              {validTrains.length === 0 ? (
                <div className="empty-state-card" style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.15)'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,75,75,0.15)',
                    border: '1px solid rgba(255,75,75,0.3)',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    color: '#FF6B6B',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    textShadow: '0 0 5px rgba(255,107,107,0.3)'
                  }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', boxShadow: '0 0 6px #FF6B6B' }}></span>
                    {isTomorrow ? '明日班次查詢中' : '今日已無班次'}
                  </div>
                  <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                    本日列車已收班，後台正連線同步明日車表。<br/>您可點擊下方按鈕提早規劃行程。
                  </p>
                  <button 
                    onClick={() => setIsTomorrow(!isTomorrow)}
                    style={{
                      background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
                      border: 'none',
                      borderRadius: '20px',
                      color: '#fff',
                      padding: '8px 24px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <path d="M16 2v4M8 2v4M2 10h20" />
                    </svg>
                    {isTomorrow ? '🔍 返回今日時刻表' : '🔍 查看明日車次'}
                  </button>
                </div>
              ) : (
                validTrains.map((t) => {
                  let [dh, dm] = t.depTime.split(':').map(Number);
                  let [ah, am] = t.arrTime.split(':').map(Number);
                  let diff = (ah * 60 + am) - (dh * 60 + dm);
                  if (diff < 0) diff += 24 * 60;
                  let dur = diff >= 60 ? `${Math.floor(diff/60)}h ${diff%60}m` : `${diff}m`;
                  let waitDiff = t.actualDepMins - currentMins;
                  let waitText = waitDiff > 60 ? `${Math.floor(waitDiff/60)}h ${waitDiff%60}m` : `${waitDiff}m`;
                  let actualArrMins = (ah * 60 + am) + t.delay;
                  
                  return (
                    <div 
                      key={t.number} 
                      className={`train-card ${getTrainDotClass(t.type)}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onTrainSelect && onTrainSelect(t)}
                    >
                        <div className="train-details">
                            <h3>{t.delay > 0 ? <><del style={{opacity: 0.5, fontSize: '0.8em', marginRight: '6px', color: 'rgba(255,255,255,0.6)'}}>{t.depTime}</del><span style={{color: '#FF6B6B'}}>{formatTime(t.actualDepMins)}</span></> : t.depTime} {t.delay > 0 && <span className="delay-text">晚 {t.delay} 分</span>}</h3>
                            <p>{t.type} {t.number} <span className="duration-badge">{isTomorrow ? '明日發車' : `${waitText} 後發車`}</span></p>
                        </div>
                        <div className="train-time">{t.delay > 0 ? <><del style={{opacity: 0.5, fontSize: '0.8em', marginRight: '6px', color: 'rgba(255,255,255,0.6)'}}>{t.arrTime}</del><span style={{color: '#FF6B6B'}}>{formatTime(actualArrMins)}</span></> : t.arrTime}<span>抵達 {dest} / 車程 {dur}</span></div>
                    </div>
                  )
                })
              )}
            </div>
        </div>
      </div>
    </>
  );
}
