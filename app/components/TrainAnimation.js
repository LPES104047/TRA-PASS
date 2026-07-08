import React from 'react';

export default function TrainAnimation({ isAnimating, direction = 'ltr' }) {
  if (!isAnimating) return null;

  const generateCommuterDetails = () => {
    const details = [];
    // Cars are 450 units long. Loop from -1500 to 1200
    for (let x = -1500; x < 1200; x += 450) {
      // 3 doors per car segment
      const doors = [x + 35, x + 205, x + 375];
      doors.forEach((pos, idx) => {
        details.push(
          <g key={`door-${x}-${idx}`}>
            {/* Door pocket/frame */}
            <rect x={pos} y={75} width={50} height={112} fill="#7F8C8D" rx={2} />
            {/* Left and right glass panes */}
            <rect x={pos + 4} y={83} width={19} height={52} fill="#1A1A1A" rx={2} />
            <path d={`M ${pos + 4},85 L ${pos + 15},85 L ${pos + 4},110 Z`} fill="rgba(255,255,255,0.12)" />
            <rect x={pos + 27} y={83} width={19} height={52} fill="#1A1A1A" rx={2} />
            <path d={`M ${pos + 27},85 L ${pos + 38},85 L ${pos + 27},110 Z`} fill="rgba(255,255,255,0.12)" />
            {/* Center seam */}
            <line x1={pos + 25} y1={75} x2={pos + 25} y2={187} stroke="#333" strokeWidth={1} />
            {/* Door warning indicator light above the door */}
            <circle cx={pos + 25} cy={70} r={2} fill="#FFD700" />
          </g>
        );
      });

      // 4 windows per car segment (2 between doors)
      const windows = [x + 101, x + 151, x + 271, x + 321];
      windows.forEach((pos, idx) => {
        details.push(
          <g key={`win-${x}-${idx}`}>
            <rect
              x={pos}
              y={83}
              width={44}
              height={52}
              fill="#1A1A1A"
              rx={6}
              stroke="#BDC3C7"
              strokeWidth={1.5}
            />
            {/* Glossy reflection */}
            <path d={`M ${pos + 4},85 L ${pos + 24},85 L ${pos + 4},115 Z`} fill="rgba(255,255,255,0.12)" />
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

  const generateTrainBodies = () => {
    const bodies = [];
    // 6 passenger cars
    for (let x = -1500; x < 1200; x += 450) {
      bodies.push(
        <g key={`body-${x}`}>
          {/* Passenger Car Body */}
          <rect x={x} y={50} width={440} height={140} fill="url(#emuBody)" rx={6} />
          
          {/* Top green roofline stripe */}
          <rect x={x} y={58} width={440} height={4} fill="#00A859" />

          {/* Bottom green wave belt */}
          <rect x={x} y={144} width={440} height={8} fill="#00A859" />

          {/* Subtle gap accent borders to enhance car separation */}
          <rect x={x} y={50} width={440} height={140} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={1} rx={6} />

          {/* Gangway connector between cars */}
          {x < 750 && (
            <g>
              {/* Dark inner connector */}
              <rect x={x + 440} y={54} width={10} height={132} fill="#222" />
              {/* Outer bellows line */}
              <rect x={x + 442} y={52} width={6} height={136} fill="#111" rx={1} />
              {/* Horizontal rib lines to simulate accordion bellows */}
              <line x1={x + 440} y1={65} x2={x + 450} y2={65} stroke="#333" strokeWidth={1.5} />
              <line x1={x + 440} y1={85} x2={x + 450} y2={85} stroke="#333" strokeWidth={1.5} />
              <line x1={x + 440} y1={105} x2={x + 450} y2={105} stroke="#333" strokeWidth={1.5} />
              <line x1={x + 440} y1={125} x2={x + 450} y2={125} stroke="#333" strokeWidth={1.5} />
              <line x1={x + 440} y1={145} x2={x + 450} y2={145} stroke="#333" strokeWidth={1.5} />
              <line x1={x + 440} y1={165} x2={x + 450} y2={165} stroke="#333" strokeWidth={1.5} />
            </g>
          )}
        </g>
      );
    }
    
    // Add gangway connector between the 6th car (ends at 1190) and the head cab (starts at 1200)
    bodies.push(
      <g key="gangway-head">
        <rect x={1190} y={54} width={10} height={132} fill="#222" />
        <rect x={1192} y={52} width={6} height={136} fill="#111" rx={1} />
        <line x1={1190} y1={65} x2={1200} y2={65} stroke="#333" strokeWidth={1.5} />
        <line x1={1190} y1={85} x2={1200} y2={85} stroke="#333" strokeWidth={1.5} />
        <line x1={1190} y1={105} x2={1200} y2={105} stroke="#333" strokeWidth={1.5} />
        <line x1={1190} y1={125} x2={1200} y2={125} stroke="#333" strokeWidth={1.5} />
        <line x1={1190} y1={145} x2={1200} y2={145} stroke="#333" strokeWidth={1.5} />
        <line x1={1190} y1={165} x2={1200} y2={165} stroke="#333" strokeWidth={1.5} />
      </g>
    );

    return bodies;
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
          z-index: 2;
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
          animation: trainLtr 4s linear forwards; /* ✨ 改為 4s 以展示重力感物理動畫 */
        }

        .bg-train-container.rtl {
          animation: trainRtl 4s linear forwards; /* ✨ 改為 4s */
        }

        /* 
          Keyframes: 模擬火車進站停靠的真實物理動作 (高慣性)
          - 0% ~ 40%: 進站減速期 (1.6s) - 使用高平滑度 ease-out (0.25, 1, 0.5, 1)
          - 40% ~ 60%: 月台停靠期 (0.8s) - 完全靜止，進行資料 Swap
          - 60% ~ 100%: 離站加速期 (1.6s) - 使用高慣性/慢起步 ease-in (0.5, 0, 0.75, 0)
        */
        @keyframes trainLtr {
          0% { 
            transform: translateX(-100%); 
            animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1); /* ✨ 超滑順漸慢煞車 */
          }
          40% { 
            transform: translateX(0%); 
            animation-timing-function: linear;
          }
          60% { 
            transform: translateX(0%); 
            animation-timing-function: cubic-bezier(0.5, 0, 0.75, 0); /* ✨ 重力感慢速起步 */
          }
          100% { 
            transform: translateX(100%); 
          }
        }

        @keyframes trainRtl {
          0% { 
            transform: translateX(100%) scaleX(-1); 
            animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1); /* ✨ 超滑順漸慢煞車 */
          }
          40% { 
            transform: translateX(0%) scaleX(-1); 
            animation-timing-function: linear;
          }
          60% { 
            transform: translateX(0%) scaleX(-1); 
            animation-timing-function: cubic-bezier(0.5, 0, 0.75, 0); /* ✨ 重力感慢速起步 */
          }
          100% { 
            transform: translateX(-100%) scaleX(-1); 
          }
        }

        .svg-emu900 {
          width: 100%;
          height: 100%;
          overflow: visible; /* ✨ 重點：防止火車尾巴與輪胎被切斷/閃爍消失 */
        }
      `}</style>

      <div className="bg-train-root">
        <div className={`bg-train-container ${direction}`}>
          <svg className="svg-emu900" viewBox="-1500 0 3100 220" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="emuBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ECEFF1" />
                <stop offset="35%" stopColor="#CFD8DC" />
                <stop offset="70%" stopColor="#90A4AE" />
                <stop offset="100%" stopColor="#455A64" />
              </linearGradient>
              <linearGradient id="headlightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>

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

            {/* Segmented Train bodies with gangway connectors */}
            {generateTrainBodies()}

            {/* Head Cab Body */}
            <path d="M 1200,50 L 1420,50 C 1480,50 1520,70 1535,120 C 1545,155 1525,185 1500,190 L 1200,190 Z" fill="url(#emuBody)" stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
            
            {/* Top green roofline stripe for Head Cab */}
            <rect x="1200" y="58" width="210" height="4" fill="#00A859" />

            {/* Bottom green wave belt for Head Cab - sweeping up at the front */}
            <path d="M 1200,144 L 1380,144 Q 1420,144 1445,153 Q 1470,162 1495,163" fill="none" stroke="#00A859" strokeWidth="8" strokeLinecap="round" />

            {/* Commuter doors and windows */}
            {generateCommuterDetails()}

            {/* Under-train Bogies and Wheels */}
            {generateBogiesAndWheels()}

            {/* Cab details */}
            <g>
              {/* Cab Door */}
              <rect x="1370" y="75" width="34" height="112" fill="#7F8C8D" rx="2" />
              <rect x="1375" y="83" width="24" height="52" fill="#1A1A1A" rx="2" />
              <path d="M 1375,85 L 1385,85 L 1375,110 Z" fill="rgba(255,255,255,0.12)" />

              {/* Black Mask (Driver visor & front face) */}
              <path d="M 1420,60 L 1465,60 C 1490,60 1515,80 1528,120 C 1535,145 1525,170 1505,175 L 1420,175 Z" fill="#111" />
              
              {/* Neon green smile profile */}
              <path d="M 1440,175 L 1505,175 C 1525,170 1535,145 1528,120" fill="none" stroke="#00FF66" strokeWidth="5" strokeLinecap="round" />
              
              {/* Cab window highlight */}
              <path d="M 1430,70 L 1460,70 C 1480,70 1495,85 1502,110 L 1485,110 C 1480,85 1465,75 1445,75 Z" fill="rgba(255,255,255,0.15)" />
            </g>

            {/* Glowing headlights */}
            <g transform="translate(1523, 148)">
              <circle cx="0" cy="0" r="5" fill="rgba(255,255,255,0.6)" filter="drop-shadow(0 0 4px #FFF)" />
              <circle cx="0" cy="0" r="2.5" fill="#FFF" />
              <path d="M 0,0 L 250,-20 L 250,35 Z" fill="url(#headlightBeam)" opacity="0.35" />
            </g>

            {/* Front Coupler (連結器) */}
            <rect x="1510" y="178" width="25" height="10" fill="#333" rx={2} />
            <circle cx="1530" cy="183" r="4" fill="#555" />
          </svg>
        </div>
      </div>
    </>
  );
}
