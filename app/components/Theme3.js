import React, { useState, useEffect, useRef } from "react";

export default function Theme3({ origin, setOrigin, dest, setDest, handleSwap, allStations, validTrains, currentMins, isTomorrow, setIsTomorrow, onTrainSelect }) {
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const originRef = useRef(null);
  const destRef = useRef(null);

  // 【新增】卡片點擊狀態與動畫時間
  const [clickedTrainNo, setClickedTrainNo] = useState(null);
  const handleCardClick = (t) => {
    if (clickedTrainNo) return;
    setClickedTrainNo(t.number);
    setTimeout(() => {
      if (typeof onTrainSelect === 'function') onTrainSelect(t);
      setClickedTrainNo(null);
    }, 200);
  };

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



  const getDotColor = (type) => {
    if(type.includes('自強') || type.includes('普悠瑪') || type.includes('太魯閣')) return '#FF0076';
    if(type.includes('莒光')) return '#FFB84D';
    return '#00F0FF';
  };

  const formatTime = (mins) => {
    let h = Math.floor(mins / 60) % 24;
    let m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <>
      <style>{`
        .theme3-root {
          background: transparent; 
          min-height: 100vh; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          padding: 20px;
          color: #FFF;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
          z-index: 10;
        }
        
        .theme3-root h1 { margin-top: 0; font-size: 20px; text-align: center; font-weight: 600; color: #FFF; letter-spacing: 2px; margin-bottom: 20px; text-transform: uppercase; text-shadow: 0 0 10px rgba(0,240,255,0.5); }
        
        .theme3-root .card {
            background: rgba(10, 10, 10, 0.6);
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border-radius: 20px; border: 1px solid rgba(0, 240, 255, 0.2);
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            cursor: pointer;
        }
        .theme3-root .card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 15px 45px rgba(0,240,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2);
            border-color: rgba(0, 240, 255, 0.4);
        }
        .theme3-root .card.clicked {
            transform: scale(0.96);
            box-shadow: 0 0 20px rgba(0,240,255,0.4);
            border-color: #00F0FF;
            opacity: 0.8;
        }
        .theme3-root .card.empty {
            background: rgba(10, 10, 10, 0.2);
            backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
            border: 1px solid rgba(0, 240, 255, 0.1);
            box-shadow: none;
        }
        
        .theme3-root .selector-box { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1); display: flex; align-items: center; width: 100%; max-width: 500px; position: relative; z-index: 200; padding: 0; height: 70px; margin-bottom: 30px; }
        .theme3-root .selector-box::after { content: ""; position: absolute; left: 50%; top: 25%; bottom: 25%; width: 1px; background: rgba(255, 255, 255, 0.1); z-index: 1; }
        
        .theme3-root .custom-select { flex: 1; background: transparent; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; position: relative; transition: background 0.2s; cursor: pointer; }
        .theme3-root #originContainer { 
            border-top-left-radius: 16px; border-bottom-left-radius: 16px; 
            border-top-right-radius: 0; border-bottom-right-radius: 0; 
            padding: 0 30px 0 20px; 
        }
        .theme3-root #destContainer { 
            border-top-right-radius: 16px; border-bottom-right-radius: 16px; 
            border-top-left-radius: 0; border-bottom-left-radius: 0; 
            padding: 0 20px 0 30px; 
        }
        .theme3-root .custom-select:hover { background: rgba(255, 255, 255, 0.05); }
        .theme3-root #originContainer::before { content: "DEPARTURE"; font-size: 10px; color: #94A3B8; font-weight: 600; letter-spacing: 2px; margin-bottom: 2px; }
        .theme3-root #destContainer::before { content: "ARRIVAL"; font-size: 10px; color: #94A3B8; font-weight: 600; letter-spacing: 2px; margin-bottom: 2px; }
        .theme3-root .select-trigger { font-size: 18px; font-weight: 700; color: #F8FAFC; width: 100%; text-align: left; display: flex; justify-content: space-between; align-items: center; letter-spacing: 1px; border: none; background: transparent; padding: 0; }
        
        .theme3-root .select-options {
            position: absolute; top: calc(100% + 5px);
            background: rgba(30, 15, 60, 0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
            max-height: 250px; overflow-y: auto; display: none; z-index: 300;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(20px); padding: 10px;
            min-width: 300px; max-width: 100vw;
        }
        .theme3-root #originContainer .select-options { left: 15px; }
        .theme3-root #destContainer .select-options { right: 15px; left: auto; }
        .theme3-root .select-options.open { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .theme3-root .option-item { padding: 10px 5px; text-align: center; border-radius: 6px; font-size: 14px; cursor: pointer; transition: background 0.2s; background: rgba(255,255,255,0.05); color: #fff; }
        .theme3-root .option-item:hover { background: rgba(255,255,255,0.1); }
        .theme3-root .option-item.selected { background: #00F0FF; color: #1A0B2E; font-weight: bold; box-shadow: 0 0 10px #00F0FF; }
        
        .theme3-root .swap-btn { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: #0F172A; color: #38BDF8; border: 2px solid rgba(56, 189, 248, 0.3); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 20px rgba(56, 189, 248, 0.2); z-index: 10; cursor: pointer; transition: all 0.3s ease; }
        .theme3-root .swap-btn:hover { transform: translate(-50%, -50%) rotate(180deg) scale(1.05); background: #38BDF8; color: #0F172A; box-shadow: 0 0 30px rgba(56, 189, 248, 0.5); }

        .theme3-root .dashboard {
            width: 100%; max-width: 500px; margin: 0 auto;
            position: relative;
            margin-top: 20px;
        }
        
        /* Timeline line */
        .theme3-root .dashboard::before {
            content: ''; position: absolute; top: 0; bottom: 0; left: 30px;
            width: 4px; background: linear-gradient(180deg, #00F0FF 0%, #FF00E4 100%);
            border-radius: 2px; z-index: 1; box-shadow: 0 0 15px rgba(0, 240, 255, 0.6);
        }
        .theme3-root .dashboard.empty::before {
            display: none;
        }
        .theme3-root .train-item {
            position: relative; margin-bottom: 20px; padding-left: 70px;
        }
        
        /* Added box-sizing: content-box to fix border scale issue from Tailwind */
        .theme3-root .train-item::before {
            content: ''; position: absolute; left: 23px; top: 50%; transform: translateY(-50%);
            width: 12px; height: 12px; border-radius: 50%;
            background: #0A0A0A; border: 3px solid var(--dot-color, #00F0FF); z-index: 2;
            box-shadow: 0 0 15px var(--dot-color, #00F0FF); transition: all 0.3s;
            box-sizing: content-box;
        }
        .theme3-root .train-item:hover::before {
            transform: translateY(-50%) scale(1.3);
            box-shadow: 0 0 25px var(--dot-color, #00F0FF);
            background: var(--dot-color, #00F0FF);
        }
        
        .theme3-root .time-label {
            position: absolute; left: -30px; top: 50%; transform: translateY(-50%);
            font-size: 15px; font-weight: 700; color: #FFF;
            text-align: right; width: 50px; font-variant-numeric: tabular-nums;
            text-shadow: 0 0 8px rgba(255,255,255,0.4);
        }
        
        .theme3-root .card {
            clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
            border-radius: 0;
            position: relative;
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15);
            padding: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .theme3-root .card::before {
            content: ''; position: absolute; top: 0; left: 15px; width: 30px; height: 2px; background: var(--dot-color, #00F0FF);
        }
        
        .theme3-root .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
        .theme3-root .card-header h3 { margin: 0; font-size: clamp(13px, 4vw, 24px); font-weight: 700; letter-spacing: 1px; font-variant-numeric: tabular-nums; display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; white-space: normal; }
        .theme3-root .card-header h3 > span { white-space: nowrap; display: inline-flex; align-items: baseline; }
        .theme3-root .card-header .type { font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; flex-shrink: 0; white-space: nowrap; margin-left: auto; }
        
        .theme3-root .card-body { display: flex; justify-content: space-between; font-size: 14px; color: rgba(255,255,255,0.7); }
        .theme3-root .arr-time { color: #00FF87; font-weight: 600; }
        
        .theme3-root .progress-track { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 15px; position: relative; overflow: hidden; }
        .theme3-root .progress-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px; }

        .theme3-root .countdown-text { margin-top: 8px; font-size: 12px; font-weight: 600; text-align: right; }
        .theme3-root .empty-state { text-align: center; padding: 40px; color: rgba(255,255,255,0.5); margin-left: 70px; }
        .theme3-root .delay-badge {
          background: #FF0076; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 6px;
          box-shadow: 0 0 10px rgba(255,0,118,0.5);
        }

        /* 📅 Today/Tomorrow Toggle Badge (Cyberpunk style) */
        .theme3-root .date-toggle-container {
          display: flex;
          justify-content: center;
          margin-bottom: 25px;
          margin-top: 10px;
        }

        .theme3-root .date-toggle {
          background: rgba(18, 8, 34, 0.8);
          border: 1.5px solid #00F0FF;
          border-radius: 20px;
          padding: 2px;
          display: flex;
          width: 200px;
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.25);
        }

        .theme3-root .toggle-btn {
          flex: 1;
          border: none;
          background: transparent;
          color: rgba(0, 240, 255, 0.5);
          padding: 6px 12px;
          border-radius: 17px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          text-shadow: 0 0 5px rgba(0, 240, 255, 0.1);
        }

        .theme3-root .toggle-btn.active {
          background: #00F0FF;
          color: #110826;
          box-shadow: 0 0 10px #00F0FF;
          text-shadow: none;
        }

        /* Responsive Overrides */
        @media (min-width: 768px) {
            .theme3-root h1 { font-size: 24px; letter-spacing: 4px; margin-bottom: 30px; }
            .theme3-root .selector-box { max-width: 650px; height: 90px; margin: 0 auto 40px auto; }
             .theme3-root #originContainer { padding: 0 50px 0 40px; }
             .theme3-root #destContainer { padding: 0 40px 0 50px; }
            .theme3-root #originContainer::before, .theme3-root #destContainer::before { font-size: 11px; margin-bottom: 4px; }
            .theme3-root .select-trigger { font-size: 24px; }
            .theme3-root .swap-btn { width: 48px; height: 48px; font-size: 20px; }
            .theme3-root .dashboard { max-width: 650px; }
        }
      `}</style>

      <div className="theme3-root">
        <h1>儀表板風格時刻表</h1>
        <div className="selector-box">
            <div className="custom-select" id="originContainer" ref={originRef} onClick={() => { setIsOriginOpen(!isOriginOpen); setIsDestOpen(false); }}>
                <div className="select-trigger">{origin} <span style={{ fontSize: '0.6em', opacity: 0.6, color: '#38BDF8' }}>▼</span></div>
                <div className={`select-options ${isOriginOpen ? 'open' : ''}`}>
                    {allStations.map(s => (
                        <div key={s} className={`option-item ${s === origin ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setOrigin(s); setIsOriginOpen(false); }}>
                            {s}
                        </div>
                    ))}
                </div>
            </div>
            <button className="swap-btn" onClick={handleSwap}>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                     <path d="M16 17H4M4 17l4 4M4 17l4-4M8 7h12M20 7l-4-4M20 7l-4 4"/>
                 </svg>
             </button>
            <div className="custom-select" id="destContainer" ref={destRef} onClick={() => { setIsDestOpen(!isDestOpen); setIsOriginOpen(false); }}>
                <div className="select-trigger">{dest} <span style={{ fontSize: '0.6em', opacity: 0.6, color: '#38BDF8' }}>▼</span></div>
                <div className={`select-options ${isDestOpen ? 'open' : ''}`}>
                    {allStations.map(s => (
                        <div key={s} className={`option-item ${s === dest ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setDest(s); setIsDestOpen(false); }}>
                            {s}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 📅 Date Toggle Buttons */}
        <div className="date-toggle-container">
          <div className="date-toggle">
            <button className={`toggle-btn ${!isTomorrow ? 'active' : ''}`} onClick={() => setIsTomorrow(false)}>今日班次</button>
            <button className={`toggle-btn ${isTomorrow ? 'active' : ''}`} onClick={() => setIsTomorrow(true)}>明日班次</button>
          </div>
        </div>

        <div className={`dashboard ${validTrains.length === 0 ? 'empty' : ''}`}>
          {validTrains.length === 0 ? (
            <div className="empty-state-card" style={{
              background: 'rgba(17, 8, 38, 0.85)',
              border: '1.5px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '16px',
              padding: '30px 20px',
              textAlign: 'center',
              color: '#fff',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              margin: '10px 0 20px 0' /* Centered */
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,0,118,0.15)',
                border: '1px solid #FF0076',
                padding: '6px 16px',
                borderRadius: '20px',
                color: '#FF0076',
                fontSize: '13px',
                fontWeight: 'bold',
                marginBottom: '15px',
                boxShadow: '0 0 10px rgba(255,0,118,0.2)',
                textShadow: '0 0 5px rgba(255,0,118,0.5)'
              }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#FF0076', boxShadow: '0 0 6px #FF0076' }}></span>
                {origin === dest ? '⚠️ 路線錯誤' : (isTomorrow ? '明日班次查詢中' : '今日已無班次')}
              </div>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'rgba(0, 240, 255, 0.7)', lineHeight: '1.6', textShadow: '0 0 3px rgba(0,240,255,0.1)' }}>
                {origin === dest ? '出發站與目的地不可相同，請重新選擇車站。' : '本日列車已收班，後台正連線同步明日車表。您可點擊下方按鈕提早規劃行程。'}
              </p>
              <button 
                onClick={() => setIsTomorrow(!isTomorrow)}
                style={{
                  background: '#00F0FF',
                  border: 'none',
                  borderRadius: '20px',
                  color: '#110826',
                  padding: '8px 24px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px #00F0FF',
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
              const diffMins = t.actualDepMins - currentMins;
              const percent = Math.max(0, Math.min(100, 100 - (diffMins / 120 * 100)));
              
              let [dh, dm] = t.depTime.split(':').map(Number);
              let [ah, am] = t.arrTime.split(':').map(Number);
              let diff = (ah * 60 + am) - (dh * 60 + dm);
              if (diff < 0) diff += 24 * 60;
              let dur = diff >= 60 ? `${Math.floor(diff/60)}h ${diff%60}m` : `${diff}m`;
              const dotColor = getDotColor(t.type);
              let actualArrMins = (ah * 60 + am) + t.delay;

              return (
                <div key={t.number} className="train-item" style={{"--dot-color": dotColor}}>
                    <div className="time-label">{t.depTime}</div>
                    <div 
                      className={`card ${clickedTrainNo === t.number ? 'clicked' : ''}`}
                      style={{ borderLeft: `4px solid ${dotColor}`, cursor: 'pointer' }}
                      onClick={() => handleCardClick(t)}
                    >
                        <div className="card-header">
                            <h3>
                                <span>{t.delay > 0 ? <><del style={{opacity: 0.5, fontSize: '0.8em', marginRight: '6px', color: 'rgba(255,255,255,0.5)'}}>{t.depTime}</del><span style={{color: '#FF6B6B'}}>{formatTime(t.actualDepMins)}</span></> : t.depTime}</span> 
                                <span style={{color:'rgba(0,240,255,0.6)', fontWeight:'300', position: 'relative', top: '-6px'}}>⟶</span>
                                <span style={{color: t.delay > 0 ? '#FF6B6B' : '#00FF87'}}>{t.delay > 0 ? <><del style={{opacity: 0.5, fontSize: '0.8em', marginRight: '6px', color: 'rgba(255,255,255,0.5)'}}>{t.arrTime}</del><span>{formatTime(actualArrMins)}</span></> : t.arrTime}</span>
                            </h3>
                            <div className="type" style={{color: dotColor}}>{t.type}</div>
                        </div>
                        <div className="card-body">
                            <div style={{display:'flex', alignItems:'center'}}>{t.number} 往 {t.route.split('－')[1] || t.route} <span style={{marginLeft: '8px', background: 'rgba(255,255,255,0.1)', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>車程 {dur}</span></div>
                            <div>
                              {t.delay > 0 && <span className="delay-badge">晚 {t.delay} 分</span>}
                            </div>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{width: `${percent}%`, background: `linear-gradient(90deg, transparent, ${dotColor})`}}></div>
                        </div>
                        <div className="countdown-text" style={{color: dotColor}}>
                          {isTomorrow ? "明天車次" : `Departs in ${diffMins} min`}
                        </div>
                    </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
