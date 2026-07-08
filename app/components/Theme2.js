import React, { useState, useEffect, useRef } from "react";

export default function Theme2({ origin, setOrigin, dest, setDest, handleSwap, allStations, validTrains, currentMins, isTomorrow, setIsTomorrow, onTrainSelect }) {
  const [tearingTrainNo, setTearingTrainNo] = useState(null);

  const handleTicketClick = (t) => {
    if (tearingTrainNo) return;
    setTearingTrainNo(t.number);
    setTimeout(() => {
      onTrainSelect(t);
      setTearingTrainNo(null);
    }, 550);
  };
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
    if(type.includes('自強') || type.includes('普悠瑪') || type.includes('太魯閣')) return '#FF6B6B';
    if(type.includes('莒光')) return '#FFB84D';
    return '#1B3B6F';
  };

  const enNames = {
    "桃園": "TAOYUAN", "鳳鳴": "FENGMING", "鶯歌": "YINGGE", "山佳": "SHANJIA", "南樹林": "NANSHULIN",
    "樹林": "SHULIN", "浮洲": "FUZHOU", "板橋": "BANQIAO", "萬華": "WANHUA", "臺北": "TAIPEI",
    "松山": "SONGSHAN", "南港": "NANGANG", "汐科": "XIKE", "汐止": "XIZHI", "五堵": "WUDU",
    "百福": "BAIFU", "七堵": "QIDU", "八堵": "BADU", "三坑": "SANKENG", "基隆": "KEELUNG"
  };

  const enOrigin = enNames[origin] || "STATION";
  const enDest = enNames[dest] || "STATION";

  const formatTime = (mins) => {
    let h = Math.floor(mins / 60) % 24;
    let m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <>
      <style>{`
        .theme2-root {
          background: transparent; 
          min-height: 100vh; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          padding: 20px;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .theme2-root h1 { margin-top: 0; font-size: 20px; text-align: center; font-weight: 600; color: #1B3B6F; letter-spacing: 2px; margin-bottom: 20px; text-transform: uppercase; }
        
        .theme2-root .selector-box { background: #FFFFFF; border-radius: 20px; box-shadow: 0 10px 30px rgba(27, 59, 111, 0.08); display: flex; align-items: center; width: 100%; max-width: 500px; position: relative; z-index: 200; padding: 0; height: 70px; margin-bottom: 30px; border: 1px solid rgba(27, 59, 111, 0.05); }
        .theme2-root .selector-box::after { content: ""; position: absolute; left: 50%; top: 20%; bottom: 20%; width: 1px; background: #E2E8F0; z-index: 1; }
        
        .theme2-root .custom-select { flex: 1; background: transparent; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; position: relative; transition: background 0.2s; cursor: pointer; }
        .theme2-root #originContainer { 
            border-top-left-radius: 20px; border-bottom-left-radius: 20px; 
            border-top-right-radius: 0; border-bottom-right-radius: 0; 
            padding: 0 25px; 
        }
        .theme2-root #destContainer { 
            border-top-right-radius: 20px; border-bottom-right-radius: 20px; 
            border-top-left-radius: 0; border-bottom-left-radius: 0; 
            padding: 0 25px; 
        }
        .theme2-root .custom-select:hover { background: #F8FAFC; }
        .theme2-root #originContainer::before { content: "出發 Origin"; font-size: 10px; color: #64748B; font-weight: 600; letter-spacing: 1px; margin-bottom: 2px; }
        .theme2-root #destContainer::before { content: "抵達 Destination"; font-size: 10px; color: #64748B; font-weight: 600; letter-spacing: 1px; margin-bottom: 2px; }
        .theme2-root .select-trigger { font-size: 18px; font-weight: 800; color: #1B3B6F; width: 100%; text-align: left; display: flex; justify-content: space-between; align-items: center; }
        
        .theme2-root .select-options { position: absolute; top: 100%; background: #FFFFFF; border: 1px solid #E0E5EC; border-radius: 12px; margin-top: 5px; max-height: 250px; overflow-y: auto; display: none; z-index: 300; box-shadow: 0 8px 24px rgba(0,0,0,0.1); padding: 10px; min-width: 300px; }
        .theme2-root #originContainer .select-options { left: 0; }
        .theme2-root #destContainer .select-options { right: 0; left: auto; }
        .theme2-root .select-options.open { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .theme2-root .option-item { padding: 10px 5px; text-align: center; border-radius: 8px; font-size: 14px; cursor: pointer; transition: background 0.2s; background: #F2F4F8; border: none; color: #1B3B6F; font-weight: 500; }
        .theme2-root .option-item:hover { background: #E0E5EC; }
        .theme2-root .option-item.selected { background: #1B3B6F; color: #FFFFFF; font-weight: bold; }
        
        .theme2-root .swap-btn { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: #1B3B6F; color: #FFFFFF; border: 3px solid #FFFFFF; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 15px rgba(27, 59, 111, 0.15); z-index: 10; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .theme2-root .swap-btn:hover { transform: translate(-50%, -50%) rotate(180deg) scale(1.05); background: #2A5298; }

        .theme2-root .ticket {
            width: 100%; max-width: 500px; margin: 0 auto;
            background: #F2F4F8;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
        }
        .theme2-root .ticket-header { padding: 25px 25px 35px 25px; position: relative; }
        .theme2-root .top-row { display: flex; justify-content: space-between; align-items: center; position: relative; margin-bottom: 20px; border-bottom: 2px solid #222; padding-bottom: 10px; }
        .theme2-root .top-row .logo { font-weight: 700; font-family: 'Space Grotesk', sans-serif; letter-spacing: 1px; color: #1B3B6F; }
        .theme2-root .top-row .date { font-size: 12px; color: #555; text-align: right; }
        
        .theme2-root .route-row { display: flex; justify-content: space-between; align-items: center; position: relative; }
        .theme2-root .station-col { text-align: center; flex: 1; }
        .theme2-root .station-en { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #1B3B6F; text-transform: uppercase; }
        .theme2-root .station-zh { font-size: 18px; font-weight: 600; color: #1B3B6F; margin-top: 5px; }
        .theme2-root .arrow { font-size: 24px; color: #888; text-align: center; width: 40px; font-weight: normal; transform: translateY(-12px); }
        
        .theme2-root .punched-line {
            position: absolute; bottom: -10px; left: 0; right: 0;
            height: 20px;
            background-image: radial-gradient(circle at 15px 10px, transparent 11px, #F2F4F8 12px);
            background-size: 30px 20px;
            background-repeat: repeat-x;
            z-index: 10;
        }
        .theme2-root .punched-shadow {
            position: absolute; bottom: -10px; left: 0; right: 0;
            height: 20px;
            background-image: radial-gradient(circle at 15px 10px, rgba(0,0,0,0.15) 11px, transparent 12px);
            background-size: 30px 20px;
            background-repeat: repeat-x;
            z-index: 9;
            transform: translateY(2px);
        }
        .theme2-root .ticket-body { padding: 30px 20px 20px 20px; }
        
        .theme2-root .dashboard { width: 100%; position: relative; margin-top: 20px; }
        
        /* Base Timeline Styles (Tablet 481px - 767px) */
        .theme2-root .dashboard::before {
            content: ''; position: absolute; top: 0; bottom: 0; 
            left: 65px; width: 2px; /* Center is 66px */
            background: #D0D5E0;
            border-radius: 2px; z-index: 1;
        }
        .theme2-root .train-item { position: relative; margin-bottom: 20px; padding-left: 80px; }
        
        .theme2-root .train-item::before {
            content: ''; position: absolute; top: 18px; 
            left: 57px; width: 14px; height: 14px; /* Total width 18px, Center is 66px */
            border-radius: 50%;
            background: var(--dot-color, #1B3B6F); border: 2px solid #FFFFFF; z-index: 2;
            box-shadow: 0 0 10px var(--dot-color, #1B3B6F), 0 0 20px var(--dot-color, #1B3B6F);
            animation: pulse-dot 2s infinite;
            box-sizing: content-box;
        }
        @keyframes pulse-dot {
            0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(27, 59, 111, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(27, 59, 111, 0); }
            100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(27, 59, 111, 0); }
        }
        .theme2-root .time-label {
            position: absolute; top: 50%; transform: translateY(-50%);
            left: 0px; width: 50px; /* Right edge is 50px, gap to dot is 7px */
            font-size: 15px; font-weight: 700; color: #1B3B6F;
            text-align: right; font-variant-numeric: tabular-nums;
        }

        .theme2-root .card {
            border-radius: 12px;
            position: relative;
            overflow: hidden; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.05); 
            padding: 15px 95px 15px 15px; /* Leave space on the right for 75px stub + 20px padding */
            box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s ease, box-shadow 0.2s ease; 
        }
        .theme2-root .card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); border-color: rgba(27,59,111,0.2); }
        .theme2-root .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
        .theme2-root .card-header h3 { margin: 0; font-size: clamp(13px, 4vw, 18px); color: #1B3B6F; display: flex; align-items: center; flex-wrap: wrap; gap: 4px 6px; font-weight: bold; white-space: normal; }
        .theme2-root .card-header h3 > span { white-space: nowrap; display: inline-flex; align-items: baseline; }
        .theme2-root .card-header .type { font-size: 11px; background: rgba(27,59,111,0.1); padding: 4px 8px; border-radius: 4px; color: #1B3B6F; font-weight: bold; flex-shrink: 0; white-space: nowrap; margin-left: auto; }
        .theme2-root .card-body { display: flex; justify-content: space-between; font-size: 13px; color: #555; }
        .theme2-root .arr-time { font-weight: bold; color: #1B3B6F; }
        .theme2-root .progress-track { height: 4px; background: rgba(0,0,0,0.05); border-radius: 2px; margin-top: 12px; position: relative; overflow: hidden; }
        .theme2-root .progress-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px; transition: width 0.3s; }
        .theme2-root .countdown-text { margin-top: 8px; font-size: 12px; font-weight: 600; text-align: right; color: #1B3B6F; }
        .theme2-root .ticket-footer { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border-top: 2px dashed rgba(0,0,0,0.1); background: #E8ECF3; }
        .theme2-root .ticket-footer .meta { text-align: right; }
        .theme2-root .ticket-footer .meta p { margin: 0; font-size: 12px; font-weight: bold; color: #1B3B6F; }
        .theme2-root .ticket-footer .meta span { font-size: 10px; color: #64748B; }
        
        .theme2-root .delay-badge {
          background: #FF6B6B; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 6px;
        }

        .theme2-root .card::after {
            content: ''; position: absolute; top: 0; bottom: 0; right: 75px;
            border-left: 2px dashed rgba(0,0,0,0.1);
        }
        .theme2-root .ticket-stub-content {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 75px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #1B3B6F;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2px;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            opacity: 0.2;
            z-index: 2;
            pointer-events: none;
        }

        /* 📅 Today/Tomorrow Toggle Badge */
        .theme2-root .date-toggle-container {
          display: flex;
          justify-content: center;
          margin-bottom: 25px;
          margin-top: 10px;
        }

        .theme2-root .date-toggle {
          background: rgba(255, 255, 255, 0.8);
          border: 1.5px solid #1B3B6F;
          border-radius: 20px;
          padding: 2px;
          display: flex;
          width: 200px;
          box-shadow: 0 4px 12px rgba(27, 59, 111, 0.15);
        }

        .theme2-root .toggle-btn {
          flex: 1;
          border: none;
          background: transparent;
          color: #64748B;
          padding: 6px 12px;
          border-radius: 17px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .theme2-root .toggle-btn.active {
          background: #1B3B6F;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(27, 59, 111, 0.3);
        }

        /* 🎫 撕票根動畫 */
        .theme2-root .card.tearing {
          animation: ticketShake 0.5s ease-out;
        }

        .theme2-root .card.tearing::after {
          opacity: 0;
          transition: opacity 0.15s ease-out;
        }

        .theme2-root .card.tearing .ticket-stub-content {
          animation: tearOffStub 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes ticketShake {
          0%, 100% { transform: scale(1) rotate(0deg); }
          20% { transform: scale(0.97) rotate(-1deg); }
          40% { transform: scale(0.98) rotate(0.8deg); }
          60% { transform: scale(0.99) rotate(-0.4deg); }
        }

        @keyframes tearOffStub {
          0% {
            transform: rotate(0deg) translate(0, 0);
            opacity: 0.2;
          }
          20% {
            transform: rotate(6deg) translate(5px, 15px);
            opacity: 0.8;
          }
          100% {
            transform: rotate(24deg) translate(40px, 180px);
            opacity: 0;
          }
        }

        /* Desktop Overrides */
        @media (min-width: 768px) {
            .theme2-root .ticket { max-width: 650px; width: 100%; }
            .theme2-root .selector-box { max-width: 650px; height: 90px; margin: 0 auto 40px auto; }
            .theme2-root .custom-select { padding: 0 40px; }
            .theme2-root #originContainer::before, .theme2-root #destContainer::before { font-size: 12px; margin-bottom: 4px; }
            .theme2-root .select-trigger { font-size: 24px; }
            .theme2-root .swap-btn { width: 48px; height: 48px; border: 4px solid #FFFFFF; font-size: 20px; }
            
            .theme2-root .dashboard { max-width: 650px; margin-top: 40px; }
            .theme2-root .train-item { padding-left: 100px; }
            
            /* Math perfectly aligned for desktop */
            .theme2-root .time-label { left: -10px; width: 60px; font-size: 18px; } /* Right edge: 50px */
            .theme2-root .dashboard::before { left: 65px; width: 4px; } /* Center: 67px */
            .theme2-root .train-item::before { left: 56px; width: 18px; height: 18px; border-width: 2px; } /* Total width: 22px, Center: 67px */
            
            .theme2-root .card { padding: 25px 155px 25px 35px; } /* Leave space for 120px stub + 35px padding */
            .theme2-root .card::after { right: 120px; }
            .theme2-root .ticket-stub-content { width: 120px; font-size: 13px; letter-spacing: 4px; }
            .theme2-root .card-header h3 { font-size: 32px; }
            .theme2-root .card-body { font-size: 16px; }
            .theme2-root .countdown-text { font-size: 16px; margin-top: 15px; }
        }

        /* Mobile Overrides */
        @media (max-width: 480px) {
            .theme2-root .selector-box { flex-direction: column; height: auto; padding: 10px 0; border-radius: 16px; }
            .theme2-root .selector-box::after { display: none; }
            .theme2-root #originContainer, .theme2-root #destContainer { border-radius: 16px; padding: 15px 30px; }
            .theme2-root .custom-select { width: 100%; align-items: center; }
            .theme2-root #originContainer::before, .theme2-root #destContainer::before { text-align: center; }
            .theme2-root .select-trigger { justify-content: center; text-align: center; gap: 8px; }
            .theme2-root .swap-btn { position: relative; left: auto; top: auto; transform: none; margin: -10px auto; border: 4px solid #FFFFFF; }
            
            .theme2-root .dashboard { margin-top: 10px; }
            
            /* Math perfectly aligned for mobile */
            .theme2-root .train-item { padding-left: 65px; margin-bottom: 15px; }
            .theme2-root .time-label { left: 0px; width: 42px; font-size: 13px; } /* Right edge: 42px */
            .theme2-root .dashboard::before { left: 52px; width: 2px; } /* Center: 53px */
            .theme2-root .train-item::before { left: 46px; width: 10px; height: 10px; border-width: 2px; } /* Total width: 14px, Center: 53px */
            
            .theme2-root .card { padding: 15px 95px 15px 15px; }
            .theme2-root .station-col { min-width: 0; }
            .theme2-root .station-en { font-size: 14px; word-break: break-word; line-height: 1.2; }
            .theme2-root .station-zh { font-size: 15px; margin-top: 2px; }
            .theme2-root .arrow { font-size: 16px; width: 20px; }
        }
      `}</style>

      <div className="theme2-root">
        <h1>個人時刻表 TICKET STYLE</h1>
        <div className="selector-box">
            <div className="custom-select" id="originContainer" ref={originRef} onClick={() => { setIsOriginOpen(!isOriginOpen); setIsDestOpen(false); }}>
                <div className="select-trigger">{origin} <span style={{ fontSize: '0.6em', opacity: 0.6 }}>▼</span></div>
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
                <div className="select-trigger">{dest} <span style={{ fontSize: '0.6em', opacity: 0.6 }}>▼</span></div>
                <div className={`select-options ${isDestOpen ? 'open' : ''}`}>
                    {allStations.map(s => (
                        <div key={s} className={`option-item ${s === dest ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setDest(s); setIsDestOpen(false); }}>
                            {s}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="ticket">
            <div className="ticket-header">
                <div className="top-row">
                    <div className="logo">🚆 TRA PASS</div>
                    <div className="date">{isTomorrow ? 'Valid Tomorrow' : 'Valid Today'}</div>
                </div>
                <div className="route-row">
                    <div className="station-col">
                        <div className="station-en">{enOrigin}</div>
                        <div className="station-zh">{origin}</div>
                    </div>
                    <div className="arrow" style={{fontWeight: 'normal', color: '#888', position: 'relative', top: '-14px'}}>⟶</div>
                    <div className="station-col">
                        <div className="station-en">{enDest}</div>
                        <div className="station-zh">{dest}</div>
                    </div>
                </div>
                <div className="punched-shadow"></div>
                <div className="punched-line"></div>
            </div>
            
            {/* 📅 Date Toggle Buttons */}
            <div className="date-toggle-container">
              <div className="date-toggle">
                <button className={`toggle-btn ${!isTomorrow ? 'active' : ''}`} onClick={() => setIsTomorrow(false)}>今日班次</button>
                <button className={`toggle-btn ${isTomorrow ? 'active' : ''}`} onClick={() => setIsTomorrow(true)}>明日班次</button>
              </div>
            </div>

            <div className="ticket-body">
                <div className="dashboard">
                  {validTrains.length === 0 ? (
                    <div className="empty-state-card" style={{
                      background: '#FFFFFF',
                      border: '1.5px dashed rgba(27, 59, 111, 0.2)',
                      borderRadius: '12px',
                      padding: '30px 20px',
                      textAlign: 'center',
                      color: '#2C3E50',
                      boxShadow: '0 4px 15px rgba(27, 59, 111, 0.05)',
                      margin: '10px 0 20px 0'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(27, 59, 111, 0.05)',
                        border: '1px solid rgba(27, 59, 111, 0.15)',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        color: '#1B3B6F',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        marginBottom: '15px'
                      }}>
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#1B3B6F' }}></span>
                        {isTomorrow ? '明日班次查詢中' : '今日已無班次'}
                      </div>
                      <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                        本日列車已收班，後台正連線同步明日車表。<br/>您可點擊下方按鈕提早規劃行程。
                      </p>
                      <button 
                        onClick={() => setIsTomorrow(!isTomorrow)}
                        style={{
                          background: '#1B3B6F',
                          border: 'none',
                          borderRadius: '20px',
                          color: '#fff',
                          padding: '8px 24px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(27, 59, 111, 0.2)',
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
                      const isTearing = tearingTrainNo === t.number;

                      return (
                        <div 
                          key={t.number} 
                          className="train-item" 
                          style={{
                            "--dot-color": dotColor,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleTicketClick(t)}
                        >
                            <div className="time-label">{t.depTime}</div>
                            <div className={`card ${isTearing ? 'tearing' : ''}`} style={{borderLeft: `6px solid ${dotColor}`}}>
                                <div className="ticket-stub-content">TRA PASS</div>
                                <div className="card-header">
                                    <h3>
                                        <span>{t.delay > 0 ? <><del style={{opacity: 0.5, fontSize: '0.8em', marginRight: '6px', color: '#888'}}>{t.depTime}</del><span style={{color: '#FF6B6B'}}>{formatTime(t.actualDepMins)}</span></> : t.depTime}</span> 
                                        <span style={{color:'#888', fontSize:'16px', fontWeight: 'normal', position: 'relative', top: '-2px', margin: '0 4px'}}>⟶</span>
                                        <span>{t.delay > 0 ? <><del style={{opacity: 0.5, fontSize: '0.8em', marginRight: '6px', color: '#888'}}>{t.arrTime}</del><span style={{color: '#FF6B6B'}}>{formatTime(actualArrMins)}</span></> : t.arrTime}</span>
                                    </h3>
                                    <div className="type" style={{color: dotColor, background: `${dotColor}15`}}>{t.type}</div>
                                </div>
                                <div className="card-body">
                                    <div style={{display:'flex', alignItems:'center', zIndex: 5, position: 'relative'}}>{t.number} 往 {t.route.split('－')[1] || t.route} <span style={{marginLeft: '8px', background: 'rgba(0,0,0,0.05)', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>車程 {dur}</span></div>
                                    <div style={{zIndex: 5, position: 'relative'}}>
                                      {t.delay > 0 && <span className="delay-badge">晚 {t.delay} 分</span>}
                                    </div>
                                </div>
                                <div className="progress-track" style={{zIndex: 5, position: 'relative'}}>
                                    <div className="progress-fill" style={{width: `${percent}%`, background: `linear-gradient(90deg, transparent, ${dotColor})`}}></div>
                                </div>
                                <div className="countdown-text" style={{color: dotColor, zIndex: 5, position: 'relative'}}>
                                  {isTomorrow ? "明天車次" : `Departs in ${diffMins} min`}
                                </div>
                            </div>
                        </div>
                      );
                    })
                  )}
                </div>
            </div>
            
            <div className="ticket-footer">
                <div style={{fontSize: '24px'}}>🎫</div>
                <div className="meta">
                    <p>BOOKING: TRA-PASS</p>
                    <span>Taiwan Railway Company</span>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
