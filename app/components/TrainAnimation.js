import React from 'react';

export default function TrainAnimation({ isAnimating, direction = 'ltr' }) {
  if (!isAnimating) return null;

  const renderPassengers = (pos) => {
    const passengers = [];
    const hash = Math.abs(pos) % 4;

    if (hash === 1 || hash === 3) {
      // Passenger 1 (left side of window)
      const offset = 12;
      passengers.push(
        <g key={`p1-${pos}`}>
          {/* Torso/Shoulders */}
          <path d={`M ${pos + offset - 7},134 L ${pos + offset - 7},122 C ${pos + offset - 7},115 ${pos + offset + 7},115 ${pos + offset + 7},122 L ${pos + offset + 7},134 Z`} fill="#2C3E50" opacity="0.85" />
          {/* Head */}
          <circle cx={pos + offset} cy={108} r={4.5} fill="#2C3E50" />
        </g>
      );
    }
    if (hash === 2 || hash === 3) {
      // Passenger 2 (right side of window)
      const offset = 32;
      passengers.push(
        <g key={`p2-${pos}`}>
          {/* Torso/Shoulders */}
          <path d={`M ${pos + offset - 7},134 L ${pos + offset - 7},122 C ${pos + offset - 7},115 ${pos + offset + 7},115 ${pos + offset + 7},122 L ${pos + offset + 7},134 Z`} fill="#2C3E50" opacity="0.85" />
          {/* Head */}
          <circle cx={pos + offset} cy={108} r={4.5} fill="#2C3E50" />
        </g>
      );
    }
    return passengers;
  };

  const generateCommuterDetails = () => {
    const details = [];
    // Cars are 450 units long. Loop from -1500 to 1200
    for (let x = -1500; x < 1200; x += 450) {
      // 3 doors per car segment
      const doors = [x + 40, x + 210, x + 380];
      doors.forEach((pos, idx) => {
        details.push(
          <g key={`door-${x}-${idx}`}>
            {/* Door portal background (warm glow inside) */}
            <rect x={pos + 2} y={77} width={30} height={110} fill="url(#windowGlow)" rx={1} />
            
            {/* Left Sliding Leaf Group */}
            <g className="left-door-leaf">
              <rect x={pos + 2} y={77} width={15} height={110} fill="#B0BEC5" stroke="#455A64" strokeWidth="0.5" rx={1} />
              <rect x={pos + 5} y={85} width={9} height={45} fill="#1A1A1A" rx={1} />
              <path d={`M ${pos + 5},87 L ${pos + 12},87 L ${pos + 5},108 Z`} fill="rgba(255,255,255,0.12)" />
            </g>

            {/* Right Sliding Leaf Group */}
            <g className="right-door-leaf">
              <rect x={pos + 17} y={77} width={15} height={110} fill="#B0BEC5" stroke="#455A64" strokeWidth="0.5" rx={1} />
              <rect x={pos + 20} y={85} width={9} height={45} fill="#1A1A1A" rx={1} />
              <path d={`M ${pos + 20},87 L ${pos + 27},87 L ${pos + 20},108 Z`} fill="rgba(255,255,255,0.12)" />
            </g>

            {/* Outer Door Frame border (fixed, doesn't move) */}
            <rect x={pos + 1} y={76} width={32} height={112} fill="none" stroke="#37474F" strokeWidth="1.5" rx={2} />
            
            {/* Door warning indicator light above the door */}
            <circle className="door-indicator" cx={pos + 17} cy={70} r={2.5} />
          </g>
        );
      });

      // 4 windows per car segment (2 between doors)
      const windows = [x + 90, x + 145, x + 260, x + 315];
      windows.forEach((pos, idx) => {
        details.push(
          <g key={`win-${x}-${idx}`}>
            {/* Window glass pane (Warm glowing interior) */}
            <rect
              x={pos}
              y={83}
              width={44}
              height={52}
              fill="url(#windowGlow)"
              rx={6}
              stroke="#555"
              strokeWidth={1.5}
            />
            {/* Render passenger silhouettes */}
            {renderPassengers(pos)}
            {/* Glossy window reflection */}
            <path d={`M ${pos + 4},85 L ${pos + 24},85 L ${pos + 4},115 Z`} fill="rgba(255,255,255,0.18)" />
          </g>
        );
      });
    }
    return details;
  };

  const generateBogiesAndWheels = () => {
    const wheels = [];
    // Every car has two bogies. Let's place them at x + 80 and x + 370 for each segment
    for (let x = -1500; x < 1200; x += 450) {
      const bogiePositions = [x + 80, x + 370];
      bogiePositions.forEach((pos, idx) => {
        wheels.push(
          <g key={`bogie-${x}-${idx}`}>
            {/* Bogie frame */}
            <rect x={pos - 25} y={188} width={50} height={8} fill="#333" rx={2} />
            {/* Left wheel */}
            <circle cx={pos - 15} cy={198} r={7} fill="#111" stroke="#555" strokeWidth={1.5} />
            <circle cx={pos - 15} cy={198} r={3} fill="#7F8C8D" />
            {/* Right wheel */}
            <circle cx={pos + 15} cy={198} r={7} fill="#111" stroke="#555" strokeWidth={1.5} />
            <circle cx={pos + 15} cy={198} r={3} fill="#7F8C8D" />
          </g>
        );
      });
    }
    // Also add bogies for the head cab
    const headBogies = [1280, 1450];
    headBogies.forEach((pos, idx) => {
      wheels.push(
        <g key={`head-bogie-${idx}`}>
          <rect x={pos - 25} y={188} width={50} height={8} fill="#333" rx={2} />
          <circle cx={pos - 15} cy={198} r={7} fill="#111" stroke="#555" strokeWidth={1.5} />
          <circle cx={pos - 15} cy={198} r={3} fill="#7F8C8D" />
          <circle cx={pos + 15} cy={198} r={7} fill="#111" stroke="#555" strokeWidth={1.5} />
          <circle cx={pos + 15} cy={198} r={3} fill="#7F8C8D" />
        </g>
      );
    });
    return wheels;
  };

  const generateSleepers = () => {
    const sleepers = [];
    for (let x = -1500; x < 1600; x += 40) {
      sleepers.push(
        <rect key={`sleeper-${x}`} x={x - 4} y={205} width={8} height={5} fill="#3A3A3A" rx={1} />
      );
    }
    return sleepers;
  };

  return (
    <>
      <style>{`
        .bg-train-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: -1;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-train-container {
          position: absolute;
          width: 250vw;
          max-width: 3500px;
          height: 150px;
          display: flex;
          align-items: center;
          will-change: transform; /* ✨ 啟用 GPU 加速 */
        }

        .bg-train-container.ltr {
          animation: trainLtr 3s linear forwards; /* ✨ 3s 配合進站停靠時間 */
        }

        .bg-train-container.rtl {
          animation: trainRtl 3s linear forwards; /* ✨ 3s */
        }

        /* 
          Keyframes: 模擬火車進站停靠的真實物理動作
          - 0% ~ 40%: 快速駛入並流暢減速 (ease-out)
          - 40% ~ 60%: 在月台中央完全靜止停靠 0.6 秒 (停靠期間進行資料 Swap)
          - 60% ~ 100%: 從靜止狀態平滑加速駛離 (ease-in)
        */
        @keyframes trainLtr {
          0% { 
            transform: translateX(-100%); 
            animation-timing-function: ease-out;
          }
          40% { 
            transform: translateX(0%); 
            animation-timing-function: linear;
          }
          60% { 
            transform: translateX(0%); 
            animation-timing-function: ease-in;
          }
          100% { 
            transform: translateX(100%); 
          }
        }

        @keyframes trainRtl {
          0% { 
            transform: translateX(100%) scaleX(-1); 
            animation-timing-function: ease-out;
          }
          40% { 
            transform: translateX(0%) scaleX(-1); 
            animation-timing-function: linear;
          }
          60% { 
            transform: translateX(0%) scaleX(-1); 
            animation-timing-function: ease-in;
          }
          100% { 
            transform: translateX(-100%) scaleX(-1); 
          }
        }

        /* ✨ 物理震動效果：行駛時有高頻微震，煞停在站點時完全靜止 */
        .bg-train-vibrator {
          width: 100%;
          height: 100%;
          animation: trainVibrate 3s linear forwards;
          will-change: transform;
        }

        @keyframes trainVibrate {
          /* 0% ~ 40%: 進站減速期，高頻震動逐漸減小 */
          0% { transform: translateY(0px); }
          5% { transform: translateY(0.8px); }
          10% { transform: translateY(-0.4px); }
          15% { transform: translateY(0.6px); }
          20% { transform: translateY(-0.3px); }
          25% { transform: translateY(0.5px); }
          30% { transform: translateY(-0.2px); }
          35% { transform: translateY(0.3px); }
          40% { transform: translateY(0px); } /* 煞停，完全停止震動 */
          
          /* 40% ~ 60%: 月台停靠期，火車完全靜止 */
          60% { transform: translateY(0px); }
          
          /* 60% ~ 100%: 啟動加速期，震動頻率與幅度逐漸增加 */
          65% { transform: translateY(0.2px); }
          70% { transform: translateY(-0.3px); }
          75% { transform: translateY(0.4px); }
          80% { transform: translateY(-0.5px); }
          85% { transform: translateY(0.6px); }
          90% { transform: translateY(-0.6px); }
          95% { transform: translateY(0.8px); }
          100% { transform: translateY(0px); }
        }

        /* ✨ 車門滑動開關動畫 (左葉) */
        .left-door-leaf {
          animation: leftDoorSlide 3s linear forwards;
          will-change: transform;
        }

        @keyframes leftDoorSlide {
          0% { transform: translateX(0px); }
          40% { transform: translateX(0px); }
          43% { transform: translateX(-9px); } /* 快速滑動開門 */
          57% { transform: translateX(-9px); } /* 保持開門狀態 */
          60% { transform: translateX(0px); }  /* 關門 */
          100% { transform: translateX(0px); }
        }

        /* ✨ 車門滑動開關動畫 (右葉) */
        .right-door-leaf {
          animation: rightDoorSlide 3s linear forwards;
          will-change: transform;
        }

        @keyframes rightDoorSlide {
          0% { transform: translateX(0px); }
          40% { transform: translateX(0px); }
          43% { transform: translateX(9px); }  /* 快速滑動開門 */
          57% { transform: translateX(9px); }  /* 保持開門狀態 */
          60% { transform: translateX(0px); }  /* 關門 */
          100% { transform: translateX(0px); }
        }

        /* ✨ 車門警示燈動畫：開關門期間閃爍紅色，平常關閉 */
        .door-indicator {
          animation: indicatorColor 3s linear forwards;
        }

        @keyframes indicatorColor {
          0% { fill: #555; }
          39% { fill: #555; }
          40% { fill: #FF3B30; }  /* 門開始開啟，警示燈亮紅燈 */
          57% { fill: #FF3B30; }
          60% { fill: #FF3B30; }  /* 門完全關閉 */
          61% { fill: #555; }
          100% { fill: #555; }
        }

        .svg-emu900 {
          width: 100%;
          height: 100%;
          overflow: visible; /* ✨ 重點：防止火車尾巴與輪胎被切斷/閃爍消失 */
        }
      `}</style>

      <div className="bg-train-root">
        <div className={`bg-train-container ${direction}`}>
          <div className="bg-train-vibrator">
            <svg className="svg-emu900" viewBox="-1500 0 3100 220" preserveAspectRatio="xMidYMid meet">
              <defs>
                {/* Metallic silver steel gradient for the body */}
                <linearGradient id="emuBody" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ECEFF1" />
                  <stop offset="35%" stopColor="#CFD8DC" />
                  <stop offset="70%" stopColor="#90A4AE" />
                  <stop offset="100%" stopColor="#455A64" />
                </linearGradient>

                {/* Warm glowing interior window light gradient */}
                <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF2CC" />
                  <stop offset="40%" stopColor="#FFE599" />
                  <stop offset="100%" stopColor="#F5B041" />
                </linearGradient>

                {/* Headlight beam fading gradient */}
                <linearGradient id="headlightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.40)" />
                  <stop offset="25%" stopColor="rgba(255, 255, 255, 0.15)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                </linearGradient>
              </defs>

              {/* Static Train Sleepers (鐵軌枕木) */}
              {generateSleepers()}

              {/* Static Iron Rail Track (鋼軌) */}
              <rect x="-1500" y="204" width="3100" height="4" fill="#555" />
              <rect x="-1500" y="202" width="3100" height="2" fill="#BDC3C7" />

              {/* Rooftop Pantographs (集電弓) */}
              <g stroke="#7F8C8D" strokeWidth="2" fill="none">
                {/* Pantograph 1 */}
                <rect x="-1020" y="46" width="40" height="4" fill="#555" stroke="none" />
                <line x1="-1015" y1="46" x2="-1000" y2="30" />
                <line x1="-1000" y1="30" x2="-985" y2="46" />
                <line x1="-1000" y1="30" x2="-1010" y2="22" />
                <line x1="-1010" y1="22" x2="-990" y2="22" />
                <line x1="-1015" y1="22" x2="-985" y2="22" strokeWidth="3" />

                {/* Pantograph 2 */}
                <rect x="-20" y="46" width="40" height="4" fill="#555" stroke="none" />
                <line x1="-15" y1="46" x2="0" y2="30" />
                <line x1="0" y1="30" x2="15" y2="46" />
                <line x1="0" y1="30" x2="-10" y2="22" />
                <line x1="-10" y1="22" x2="10" y2="22" />
                <line x1="-15" y1="22" x2="15" y2="22" strokeWidth="3" />
              </g>

              {/* Train body with commuter-style blunt nose */}
              <path d="M -1500,50 L 1440,50 C 1500,50 1530,70 1535,110 C 1540,140 1530,185 1510,190 L -1500,190 Z" fill="url(#emuBody)" />
              
              {/* Metallic body light reflection (太陽光影反射) */}
              <rect x="-1500" y="50" width="2940" height="15" fill="rgba(255,255,255,0.12)" />
              {/* Metallic body bottom shadow (車底陰影) */}
              <rect x="-1500" y="175" width="2920" height="15" fill="rgba(0,0,0,0.08)" />

              {/* Top green roofline stripe */}
              <rect x="-1500" y="58" width="2920" height="4" fill="#00A859" />

              {/* Bottom green wave belt - sweeping up at the front */}
              <path d="M -1500,144 L 1360,144 Q 1410,144 1435,153 Q 1460,162 1490,163" fill="none" stroke="#00A859" strokeWidth="8" strokeLinecap="round" />

              {/* Commuter doors and windows */}
              {generateCommuterDetails()}

              {/* Under-train Bogies and Wheels */}
              {generateBogiesAndWheels()}

              {/* Driver visor windshield mask */}
              <path d="M 1380,75 L 1440,75 C 1490,75 1518,90 1523,115 C 1528,135 1518,158 1495,163 L 1395,160 Z" fill="#1A1A1A" />

              {/* Driver Silhouette & Glowing Dashboard Screen inside driver cab */}
              <circle cx="1400" cy="115" r="4.5" fill="#333" />
              <path d="M 1393,130 L 1393,122 C 1393,119 1407,119 1407,122 L 1407,130 Z" fill="#333" />
              <rect x="1410" y="125" width="6" height="4" fill="#00F0FF" opacity="0.85" />
              <circle cx="1413" cy="127" r="8" fill="rgba(0,240,255,0.2)" />

              {/* Neon green smiley frame around driver shield */}
              <path d="M 1420,75 C 1480,75 1510,90 1518,115 C 1523,135 1513,158 1490,163" fill="none" stroke="#00FF66" strokeWidth="4.5" strokeLinecap="round" />

              {/* Glowing headlight */}
              <circle cx="1508" cy="148" r="6" fill="rgba(255,255,255,0.4)" />
              <circle cx="1508" cy="148" r="3" fill="#FFF" />
              {/* Fading headlight light beam */}
              <path d="M 1508,148 L 1800,118 L 1800,188 Z" fill="url(#headlightBeam)" />

              {/* Front Coupler (連結器) */}
              <rect x="1510" y="178" width="25" height="10" fill="#333" rx={2} />
              <circle cx="1530" cy="183" r="4" fill="#555" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
