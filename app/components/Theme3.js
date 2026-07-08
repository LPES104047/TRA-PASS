import React, { useState, useEffect, useRef } from "react";

export default function Theme3({ origin, setOrigin, dest, setDest, handleSwap, allStations, validTrains, currentMins }) {
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
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .theme3-root h1 { margin-top: 0; font-size: 20px; text-align: center; font-weight: 600; color: #FFF; letter-spacing: 2px; margin-bottom: 20px; text-transform: uppercase; text-shadow: 0 0 10px rgba(0,240,255,0.5); }
        
        .theme3-root .selector-box { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1); display: flex; align-items: center; width: 100%; max-width: 500px; position: relative; z-index: 200; padding: 0; height: 70px; margin-bottom: 30px; }
        .theme3-root .selector-box::after { content: ""; position: absolute; left: 50%; top: 25%; bottom: 25%; width: 1px; background: rgba(255, 255, 255, 0.1); z-index: 1; }
        
        .theme3-root .custom-select { flex: 1; background: transparent; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 0 20px; position: relative; border-radius: 16px; transition: background 0.2s; cursor: pointer; }
        .theme3-root .custom-select:hover { background: rgba(255, 255, 255, 0.05); }
        .theme3-root #originContainer::before { content: "DEPARTURE"; font-size: 10px; color: #94A3B8; font-weight: 600; letter-spacing: 2px; margin-bottom: 2px; }
        .theme3-root #destContainer::before { content: "ARRIVAL"; font-size: 10px; color: #94A3B8; font-weight: 600; letter-spacing: 2px; margin-bottom: 2px; }
        .theme3-root .select-trigger { font-size: 18px; font-weight: 700; color: #F8FAFC; width: 100%; text-align: left; display: flex; justify-content: space-between; align-items: center; letter-spacing: 1px; border: none; background: transparent; padding: 0; }
        
        .theme3-root .select-options {
            position: absolute; top: calc(100% + 5px); left: 15px; right: 15px;
            background: rgba(30, 15, 60, 0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
            max-height: 250px; overflow-y: auto; display: none; z-index: 300;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(20px); padding: 10px;
            min-width: 300px; max-width: 100vw;
        }
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
        .theme3-root .card-header h3 { margin: 0; font-size: clamp(13px, 4vw, 24px); font-weight: 700; letter-spacing: 1px; font-variant-numeric: tabular-nums; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
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

        /* Responsive Overrides */
        @media (min-width: 768px) {
            .theme3-root h1 { font-size: 24px; letter-spacing: 4px; margin-bottom: 30px; }
            .theme3-root .selector-box { max-width: 650px; height: 90px; margin: 0 auto 40px auto; }
            .theme3-root .custom-select { padding: 0 40px; }
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
            <button className="swap-btn" onClick={handleSwap}>⇆</button>
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

        <div className="dashboard">
          {validTrains.length === 0 && <div className="empty-state">今日已無班次</div>}
          {validTrains.map((t) => {
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
                  <div className="card" style={{borderLeft: `4px solid ${dotColor}`}}>
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
                      <div className="countdown-text" style={{color: dotColor}}>Departs in {diffMins} min</div>
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
