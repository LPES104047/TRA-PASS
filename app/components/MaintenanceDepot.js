import React from 'react';

export default function MaintenanceDepot({ show }) {
  if (!show) return null;

  return (
    <>
      <style>{`
        /* Override body background when Depot is visible */
        body {
          background: #11111e !important;
        }

        /* 🏭 背景機廠貨車庫結構 - 全螢幕沉浸式 */
        .bg-depot-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: -2; /* 處於卡片層下方 */
          overflow: hidden;
          background: #11111e;
          animation: depotFadeIn 0.8s ease-out forwards;
        }

        .depot-svg-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        @keyframes depotFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* 🪚 電焊火花動畫 */
        .spark-particle {
          transform-box: fill-box;
          transform-origin: center;
          animation: electroSpark 1.2s infinite ease-out;
        }

        @keyframes electroSpark {
          0% { transform: scale(0) translate(0, 0); opacity: 0; }
          5% { opacity: 1; }
          15% { transform: scale(1.2) translate(var(--dx), var(--dy)); opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: scale(0.2) translate(calc(var(--dx) * 1.8), calc(var(--dy) * 1.8)); opacity: 0; }
        }

        /* 🧹 旋轉洗車刷 - 使用 center 搭配 fill-box 實現原地旋轉 */
        .wash-brush {
          animation: spinBrush 0.6s infinite linear;
          transform-origin: center;
          transform-box: fill-box;
        }
        .wash-brush-2 {
          animation: spinBrushReverse 0.6s infinite linear;
          transform-origin: center;
          transform-box: fill-box;
        }

        @keyframes spinBrush {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinBrushReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* 💦 洗車噴水滴 */
        .water-drop {
          animation: waterSpray 0.8s infinite ease-in;
          transform-origin: center;
          transform-box: fill-box;
        }

        @keyframes waterSpray {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translate(var(--wx), var(--wy)) scale(1.2); opacity: 0; }
        }

        /* 🚄 EMU900 洗車平移動畫 - 超慢速穿越 */
        .train-washing {
          animation: washPass 35s linear infinite;
        }

        @keyframes washPass {
          0% { transform: translateX(-450px); }
          100% { transform: translateX(850px); }
        }

        /* 🏗️ 懸吊天車平移動畫 */
        .overhead-crane {
          animation: craneMove 25s ease-in-out infinite;
        }

        @keyframes craneMove {
          0%, 100% { transform: translateX(40px); }
          50% { transform: translateX(620px); }
        }

        /* 天花板燈光呼吸效果 */
        .hangar-light rect {
          animation: lightGlow 4s ease-in-out infinite alternate;
        }
        .hangar-light polygon {
          animation: beamGlow 4s ease-in-out infinite alternate;
        }

        @keyframes lightGlow {
          0% { fill: #E0F7FA; filter: drop-shadow(0 0 2px #00F0FF); }
          100% { fill: #FFF; filter: drop-shadow(0 0 8px #00F0FF); }
        }

        @keyframes beamGlow {
          0% { opacity: 0.1; }
          100% { opacity: 0.25; }
        }

        /* Hangar Grid Lines */
        .hangar-grid {
          stroke: rgba(255, 255, 255, 0.02);
          stroke-width: 1;
        }
      `}</style>

      <div className="bg-depot-root">
        <div className="depot-svg-container">
          <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice">
            <defs>
              <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10101b" />
                <stop offset="50%" stopColor="#0a0a0f" />
                <stop offset="100%" stopColor="#050507" />
              </linearGradient>

              <linearGradient id="emu3000Body" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#E5E5E5" />
                <stop offset="85%" stopColor="#C0C0C0" />
                <stop offset="100%" stopColor="#888888" />
              </linearGradient>

              <linearGradient id="emu900Body" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ECEFF1" />
                <stop offset="50%" stopColor="#B0BEC5" />
                <stop offset="100%" stopColor="#546E7A" />
              </linearGradient>

              <linearGradient id="emu800Body" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ECEFF1" />
                <stop offset="40%" stopColor="#CFD8DC" />
                <stop offset="80%" stopColor="#90A4AE" />
                <stop offset="100%" stopColor="#37474F" />
              </linearGradient>

              <linearGradient id="gantryBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2c3e50" />
                <stop offset="50%" stopColor="#34495e" />
                <stop offset="100%" stopColor="#1a252f" />
              </linearGradient>

              {/* Warning stripes pattern */}
              <pattern id="warningStripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="10" height="20" fill="#F1C40F" />
                <rect x="10" width="10" height="20" fill="#1A1A1A" />
              </pattern>
            </defs>

            {/* Hangar Background Wall & Grids */}
            <rect x="0" y="0" width="800" height="500" fill="url(#wallGradient)" />
            
            <line x1="0" y1="80" x2="800" y2="80" className="hangar-grid" />
            <line x1="0" y1="180" x2="800" y2="180" className="hangar-grid" />
            <line x1="0" y1="280" x2="800" y2="280" className="hangar-grid" />
            <line x1="0" y1="380" x2="800" y2="380" className="hangar-grid" />
            <line x1="150" y1="0" x2="150" y2="500" className="hangar-grid" />
            <line x1="400" y1="0" x2="400" y2="500" className="hangar-grid" />
            <line x1="650" y1="0" x2="650" y2="500" className="hangar-grid" />

            {/* Steel Beams (Arching structure) - Tall layout */}
            <g stroke="#161a24" strokeWidth="5" fill="none">
              <line x1="80" y1="0" x2="80" y2="500" />
              <line x1="280" y1="0" x2="280" y2="500" />
              <line x1="480" y1="0" x2="480" y2="500" />
              <line x1="680" y1="0" x2="680" y2="500" />
              {/* Horizontal beams */}
              <line x1="0" y1="60" x2="800" y2="60" strokeWidth="3" />
              <line x1="0" y1="200" x2="800" y2="200" strokeWidth="3" />
              {/* Diagonal trusses */}
              <path d="M 80,60 L 280,200 M 280,60 L 80,200 M 280,60 L 480,200 M 480,60 L 280,200 M 480,60 L 680,200 M 680,60 L 480,200" strokeWidth="1.5" stroke="#1f2d3d" />
            </g>

            {/* Ceiling Lights (Upper part of screen) */}
            <g className="hangar-light">
              {/* Light 1 */}
              <rect x="180" y="0" width="40" height="6" rx="1" fill="#E0F7FA" />
              <polygon points="160,50 240,50 215,6 185,6" fill="rgba(0, 240, 255, 0.08)" />
              {/* Light 2 */}
              <rect x="380" y="0" width="40" height="6" rx="1" fill="#E0F7FA" />
              <polygon points="360,50 440,50 415,6 385,6" fill="rgba(0, 240, 255, 0.08)" />
              {/* Light 3 */}
              <rect x="580" y="0" width="40" height="6" rx="1" fill="#E0F7FA" />
              <polygon points="560,50 640,50 615,6 585,6" fill="rgba(0, 240, 255, 0.08)" />
            </g>

            {/* Overhead Gantry Crane (Upper part of screen, slides horizontally) */}
            <g className="overhead-crane">
              {/* Crane Rail Carriage */}
              <rect x="0" y="46" width="50" height="10" fill="#f39c12" rx="1" />
              <rect x="10" y="56" width="30" height="12" fill="#2c3e50" rx="1" />
              {/* Gantry steel cable */}
              <line x1="25" y1="68" x2="25" y2="135" stroke="#7f8c8d" strokeWidth="1.5" strokeDasharray="3, 3" />
              {/* Hook block and mechanical claw (industrial look, no longer resembling a train pantograph) */}
              <rect x="19" y="135" width="12" height="12" fill="#34495e" rx="1" />
              <circle cx="25" cy="141" r="2.5" fill="#f1c40f" />
              {/* Dual steel claw hooks */}
              <path d="M 16,145 Q 16,152 21,152 Q 24,152 24,148 Q 24,152 27,152 Q 32,152 32,145" fill="none" stroke="#7f8c8d" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Floor perspectives */}
            <rect x="0" y="270" width="800" height="230" fill="#090c10" />
            <path d="M 0,270 L 800,270 M 0,285 L 800,285 M 0,310 L 800,310 M 0,350 L 800,350 M 0,400 L 800,400 M 0,460 L 800,460" stroke="#121720" strokeWidth="1" />


            {/* ==================== TRACK 1 (TOP, y=280) - EMU3000 Parking ==================== */}
            {/* Sleepers */}
            <line x1="0" y1="280" x2="800" y2="280" stroke="#1c1f24" strokeWidth="4" strokeDasharray="2, 6" />
            {/* Rails */}
            <line x1="0" y1="276" x2="800" y2="276" stroke="#484d56" strokeWidth="1" />
            <line x1="0" y1="277" x2="800" y2="277" stroke="#777c85" strokeWidth="0.5" />
            
            {/* Detailed 3-Car EMU3000 Train (White body, red stripe, black window band) */}
            <g transform="translate(180, 252)">
              {/* Car 1: Left Cab */}
              <g>
                {/* Coupler */}
                <rect x="-8" y="16" width="8" height="2" fill="#222" />
                {/* Body */}
                <path d="M 12,2 L 120,2 C 122,2 123,3 123,5 L 123,20 Q 123,21 120,21 L 12,21 C 2,21 -2,17 -2,12 C -2,7 2,2 12,2 Z" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="0.5" />
                {/* Black window band */}
                <path d="M 3,3 L 123,3 L 123,10 L 5,10 Z" fill="#111" />
                {/* Red stripe */}
                <rect x="15" y="14" width="108" height="1.5" fill="#E74C3C" />
                {/* Windows */}
                <g fill="#2c3e50">
                  <rect x="25" y="4" width="18" height="5" rx="0.5" />
                  <rect x="50" y="4" width="18" height="5" rx="0.5" />
                  <rect x="75" y="4" width="18" height="5" rx="0.5" />
                  <rect x="100" y="4" width="18" height="5" rx="0.5" />
                </g>
                {/* Cab window */}
                <path d="M 0,4 L 10,4 L 10,9 L 2,9 Z" fill="#2c3e50" />
                {/* Bogies & Wheels */}
                <rect x="15" y="21" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="20" cy="24" r="3" fill="#000" /> <circle cx="20" cy="24" r="1.2" fill="#7f8c8d" />
                <circle cx="32" cy="24" r="3" fill="#000" /> <circle cx="32" cy="24" r="1.2" fill="#7f8c8d" />
                
                <rect x="85" y="21" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="90" cy="24" r="3" fill="#000" /> <circle cx="90" cy="24" r="1.2" fill="#7f8c8d" />
                <circle cx="102" cy="24" r="3" fill="#000" /> <circle cx="102" cy="24" r="1.2" fill="#7f8c8d" />
              </g>

              {/* Gangway Connector 1-2 */}
              <rect x="123" y="4" width="5" height="16" fill="#222" />
              <rect x="124" y="6" width="3" height="12" fill="#444" />

              {/* Car 2: Middle Passenger Car */}
              <g transform="translate(128, 0)">
                {/* Body */}
                <rect x="0" y="2" width="115" height="19" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="0.5" rx="1" />
                {/* Black window band */}
                <rect x="0" y="3" width="115" height="7" fill="#111" />
                {/* Red stripe */}
                <rect x="0" y="14" width="115" height="1.5" fill="#E74C3C" />
                {/* Windows */}
                <g fill="#2c3e50">
                  <rect x="8" y="4" width="18" height="5" rx="0.5" />
                  <rect x="33" y="4" width="18" height="5" rx="0.5" />
                  <rect x="58" y="4" width="18" height="5" rx="0.5" />
                  <rect x="83" y="4" width="18" height="5" rx="0.5" />
                </g>
                {/* Passenger Door seams */}
                <line x1="108" y1="2" x2="108" y2="21" stroke="#888" strokeWidth="0.5" />
                {/* Bogies & Wheels */}
                <rect x="12" y="21" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="17" cy="24" r="3" fill="#000" /> <circle cx="17" cy="24" r="1.2" fill="#7f8c8d" />
                <circle cx="29" cy="24" r="3" fill="#000" /> <circle cx="29" cy="24" r="1.2" fill="#7f8c8d" />
                
                <rect x="80" y="21" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="85" cy="24" r="3" fill="#000" /> <circle cx="85" cy="24" r="1.2" fill="#7f8c8d" />
                <circle cx="97" cy="24" r="3" fill="#000" /> <circle cx="97" cy="24" r="1.2" fill="#7f8c8d" />
              </g>

              {/* Gangway Connector 2-3 */}
              <rect x="243" y="4" width="5" height="16" fill="#222" />
              <rect x="244" y="6" width="3" height="12" fill="#444" />

              {/* Car 3: Right Cab */}
              <g transform="translate(248, 0)">
                {/* Body */}
                <path d="M 0,2 L 108,2 C 118,2 122,7 122,12 C 122,17 118,21 108,21 L 0,21 Z" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="0.5" />
                {/* Black window band */}
                <path d="M 0,3 L 115,3 L 118,10 L 0,10 Z" fill="#111" />
                {/* Red stripe */}
                <rect x="0" y="14" width="105" height="1.5" fill="#E74C3C" />
                {/* Windows */}
                <g fill="#2c3e50">
                  <rect x="15" y="4" width="18" height="5" rx="0.5" />
                  <rect x="40" y="4" width="18" height="5" rx="0.5" />
                  <rect x="65" y="4" width="18" height="5" rx="0.5" />
                  <rect x="90" y="4" width="18" height="5" rx="0.5" />
                </g>
                {/* Cab window */}
                <path d="M 120,4 L 110,4 L 110,9 L 118,9 Z" fill="#2c3e50" />
                {/* Bogies & Wheels */}
                <rect x="18" y="21" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="23" cy="24" r="3" fill="#000" /> <circle cx="23" cy="24" r="1.2" fill="#7f8c8d" />
                <circle cx="35" cy="24" r="3" fill="#000" /> <circle cx="35" cy="24" r="1.2" fill="#7f8c8d" />
                
                <rect x="82" y="21" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="87" cy="24" r="3" fill="#000" /> <circle cx="87" cy="24" r="1.2" fill="#7f8c8d" />
                <circle cx="99" cy="24" r="3" fill="#000" /> <circle cx="99" cy="24" r="1.2" fill="#7f8c8d" />
                {/* Coupler */}
                <rect x="122" y="16" width="8" height="2" fill="#222" />
              </g>
            </g>


            {/* ==================== TRACK 2 (MIDDLE, y=350) - Wash & EMU900 ==================== */}
            {/* Sleepers */}
            <line x1="0" y1="350" x2="800" y2="350" stroke="#1c1f24" strokeWidth="4" strokeDasharray="2, 6" />
            {/* Rails */}
            <line x1="0" y1="346" x2="800" y2="346" stroke="#484d56" strokeWidth="1" />
            <line x1="0" y1="347" x2="800" y2="347" stroke="#777c85" strokeWidth="0.5" />

            {/* Slowly moving 3-Car EMU900 Train passing through washing system */}
            <g className="train-washing" transform="translate(0, 322)">
              {/* Car 1: Left Cab */}
              <g>
                {/* Body */}
                <path d="M 12,2 L 120,2 L 120,20 L 12,20 C 2,20 -2,16 -2,11 C -2,6 2,2 12,2 Z" fill="url(#emu900Body)" />
                {/* Green stripe */}
                <rect x="12" y="3.5" width="108" height="1.5" fill="#00A859" />
                {/* Green bottom curve */}
                <path d="M 2,12 Q 10,12 25,10.5 L 120,10.5" fill="none" stroke="#00A859" strokeWidth="2.2" strokeLinecap="round" />
                {/* Windows */}
                <g fill="#151d24">
                  <rect x="25" y="5.5" width="18" height="7" rx="1" />
                  <rect x="50" y="5.5" width="18" height="7" rx="1" />
                  <rect x="75" y="5.5" width="18" height="7" rx="1" />
                </g>
                {/* Door */}
                <rect x="98" y="4" width="14" height="16" fill="#7F8C8D" rx="0.5" />
                <line x1="105" y1="4" x2="105" y2="20" stroke="#222" strokeWidth="0.5" />
                {/* Cab window */}
                <path d="M 0,5.5 L 10,5.5 L 10,10.5 L 2,10.5 Z" fill="#151d24" />
                {/* Bogies & Wheels */}
                <rect x="15" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="20" cy="23" r="3" fill="#000" /> <circle cx="20" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="32" cy="23" r="3" fill="#000" /> <circle cx="32" cy="23" r="1.2" fill="#7f8c8d" />
                
                <rect x="85" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="90" cy="23" r="3" fill="#000" /> <circle cx="90" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="102" cy="23" r="3" fill="#000" /> <circle cx="102" cy="23" r="1.2" fill="#7f8c8d" />
              </g>

              {/* Gangway Connector 1-2 */}
              <rect x="120" y="4" width="5" height="16" fill="#222" />

              {/* Car 2: Middle Passenger Car */}
              <g transform="translate(125, 0)">
                {/* Body */}
                <rect x="0" y="2" width="115" height="18" fill="url(#emu900Body)" rx="1" />
                {/* Green stripe */}
                <rect x="0" y="3.5" width="115" height="1.5" fill="#00A859" />
                {/* Green bottom curve */}
                <line x1="0" y1="10.5" x2="115" y2="10.5" stroke="#00A859" strokeWidth="2.2" />
                {/* Windows */}
                <g fill="#151d24">
                  <rect x="10" y="5.5" width="18" height="7" rx="1" />
                  <rect x="35" y="5.5" width="18" height="7" rx="1" />
                  <rect x="60" y="5.5" width="18" height="7" rx="1" />
                </g>
                {/* Door */}
                <rect x="88" y="4" width="14" height="16" fill="#7F8C8D" rx="0.5" />
                <line x1="95" y1="4" x2="95" y2="20" stroke="#222" strokeWidth="0.5" />
                {/* Bogies & Wheels */}
                <rect x="12" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="17" cy="23" r="3" fill="#000" /> <circle cx="17" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="29" cy="23" r="3" fill="#000" /> <circle cx="29" cy="23" r="1.2" fill="#7f8c8d" />
                
                <rect x="80" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="85" cy="23" r="3" fill="#000" /> <circle cx="85" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="97" cy="23" r="3" fill="#000" /> <circle cx="97" cy="23" r="1.2" fill="#7f8c8d" />
              </g>

              {/* Gangway Connector 2-3 */}
              <rect x="240" y="4" width="5" height="16" fill="#222" />

              {/* Car 3: Right Cab */}
              <g transform="translate(245, 0)">
                {/* Body */}
                <path d="M 0,2 L 108,2 C 118,2 122,6 122,11 C 122,16 118,20 108,20 L 0,20 Z" fill="url(#emu900Body)" />
                {/* Green stripe */}
                <rect x="0" y="3.5" width="108" height="1.5" fill="#00A859" />
                {/* Green bottom curve */}
                <path d="M 0,10.5 L 95,10.5 Q 110,12 118,12" fill="none" stroke="#00A859" strokeWidth="2.2" strokeLinecap="round" />
                {/* Windows */}
                <g fill="#151d24">
                  <rect x="15" y="5.5" width="18" height="7" rx="1" />
                  <rect x="40" y="5.5" width="18" height="7" rx="1" />
                  <rect x="65" y="5.5" width="18" height="7" rx="1" />
                </g>
                {/* Door */}
                <rect x="88" y="4" width="14" height="16" fill="#7F8C8D" rx="0.5" />
                <line x1="95" y1="4" x2="95" y2="20" stroke="#222" strokeWidth="0.5" />
                {/* Cab window */}
                <path d="M 120,5.5 L 110,5.5 L 110,10.5 L 118,10.5 Z" fill="#151d24" />
                {/* Bogies & Wheels */}
                <rect x="18" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="23" cy="23" r="3" fill="#000" /> <circle cx="23" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="35" cy="23" r="3" fill="#000" /> <circle cx="35" cy="23" r="1.2" fill="#7f8c8d" />
                
                <rect x="82" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="87" cy="23" r="3" fill="#000" /> <circle cx="87" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="99" cy="23" r="3" fill="#000" /> <circle cx="99" cy="23" r="1.2" fill="#7f8c8d" />
              </g>
            </g>

            {/* Washing System Overlay (Layered on top of Track 2) */}
            <g transform="translate(350, 0)">
              {/* Spraying water drops */}
              <circle className="water-drop" cx="-10" cy="326" r="1.5" fill="#5DADE2" style={{ '--wx': '-25px', '--wy': '-15px' }} />
              <circle className="water-drop" cx="-8" cy="336" r="1.2" fill="#5DADE2" style={{ '--wx': '-30px', '--wy': '15px' }} />
              <circle className="water-drop" cx="10" cy="330" r="1.8" fill="#5DADE2" style={{ '--wx': '25px', '--wy': '-10px' }} />
              <circle className="water-drop" cx="8" cy="348" r="1.5" fill="#5DADE2" style={{ '--wx': '20px', '--wy': '20px' }} />

              {/* Vertical Support Gantry */}
              <rect x="-3" y="300" width="6" height="60" fill="url(#gantryBeam)" rx="1" />
              
              {/* Wash Station Banner */}
              <text x="0" y="288" fill="#2ecc71" fontSize="5" fontWeight="bold" textAnchor="middle">♻️ 水資源循環洗車</text>
              <text x="0" y="294" fill="#2ecc71" fontSize="4.2" textAnchor="middle">WATER RECYCLING</text>

              {/* Brush 1 (Upper) */}
              <g className="wash-brush" style={{ transformOrigin: '0px 315px' }}>
                <rect x="-7" y="303" width="14" height="24" fill="#3498DB" opacity="0.85" rx="3" />
                <line x1="0" y1="303" x2="0" y2="327" stroke="#FFF" strokeWidth="1" />
              </g>

              {/* Brush 2 (Lower) - reverse spin */}
              <g className="wash-brush-2" style={{ transformOrigin: '0px 341px' }}>
                <rect x="-7" y="329" width="14" height="24" fill="#2980B9" opacity="0.85" rx="3" />
                <line x1="0" y1="329" x2="0" y2="353" stroke="#FFF" strokeWidth="1" />
              </g>
            </g>


            {/* ==================== TRACK 3 (BOTTOM, y=420) - EMU800 Maintenance ==================== */}
            {/* Sleepers */}
            <line x1="0" y1="420" x2="800" y2="420" stroke="#1c1f24" strokeWidth="4" strokeDasharray="2, 6" />
            {/* Rails */}
            <line x1="0" y1="416" x2="800" y2="416" stroke="#484d56" strokeWidth="1.5" />
            <line x1="0" y1="417" x2="800" y2="417" stroke="#777c85" strokeWidth="1" />

            {/* Upgraded 3-Car EMU800 Train (Silver, blue stripe, yellow front nose) */}
            <g transform="translate(100, 392)">
              {/* Car 1: Left Cab */}
              <g>
                {/* Body */}
                <path d="M 12,2 L 120,2 C 122,2 123,3 123,5 L 123,20 L 12,20 C 6,20 2,17 2,11 C 2,7 6,2 12,2 Z" fill="url(#emu800Body)" stroke="#999" strokeWidth="0.5" />
                {/* Yellow front face */}
                <path d="M 2,11 L 18,11 L 18,20 L 12,20 C 6,20 2,17 2,11 Z" fill="#F1C40F" />
                {/* Blue stripe */}
                <rect x="18" y="10.5" width="105" height="3" fill="#2980B9" />
                {/* Yellow stripe below blue */}
                <rect x="18" y="13.5" width="105" height="1.5" fill="#F1C40F" />
                {/* Windows */}
                <g fill="#151d24">
                  <rect x="25" y="4.5" width="15" height="7" rx="1" />
                  <rect x="45" y="4.5" width="18" height="7" rx="1" />
                  <rect x="68" y="4.5" width="18" height="7" rx="1" />
                  <rect x="91" y="4.5" width="15" height="7" rx="1" />
                </g>
                {/* Windshield */}
                <path d="M 2,4.5 L 15,4.5 L 15,9.5 L 3,9.5 Z" fill="#111" />
                <path d="M 3,5 L 12,5 L 11,8.5 L 4,8.5 Z" fill="#1a252f" />
                {/* Bogies & Wheels */}
                <rect x="15" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="20" cy="23" r="3" fill="#000" /> <circle cx="20" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="32" cy="23" r="3" fill="#000" /> <circle cx="32" cy="23" r="1.2" fill="#7f8c8d" />
                
                <rect x="85" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="90" cy="23" r="3" fill="#000" /> <circle cx="90" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="102" cy="23" r="3" fill="#000" /> <circle cx="102" cy="23" r="1.2" fill="#7f8c8d" />
              </g>

              {/* Gangway Connector 1-2 */}
              <rect x="123" y="4" width="5" height="16" fill="#222" />

              {/* Car 2: Middle Passenger Car */}
              <g transform="translate(128, 0)">
                {/* Body */}
                <rect x="0" y="2" width="115" height="18" fill="url(#emu800Body)" stroke="#999" strokeWidth="0.5" rx="1" />
                {/* Blue stripe */}
                <rect x="0" y="10.5" width="115" height="3" fill="#2980B9" />
                {/* Yellow stripe */}
                <rect x="0" y="13.5" width="115" height="1.5" fill="#F1C40F" />
                {/* Windows */}
                <g fill="#151d24">
                  <rect x="10" y="4.5" width="18" height="7" rx="1" />
                  <rect x="35" y="4.5" width="18" height="7" rx="1" />
                  <rect x="60" y="4.5" width="18" height="7" rx="1" />
                  <rect x="85" y="4.5" width="18" height="7" rx="1" />
                </g>
                {/* Bogies & Wheels */}
                <rect x="12" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="17" cy="23" r="3" fill="#000" /> <circle cx="17" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="29" cy="23" r="3" fill="#000" /> <circle cx="29" cy="23" r="1.2" fill="#7f8c8d" />
                
                <rect x="80" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="85" cy="23" r="3" fill="#000" /> <circle cx="85" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="97" cy="23" r="3" fill="#000" /> <circle cx="97" cy="23" r="1.2" fill="#7f8c8d" />
              </g>

              {/* Gangway Connector 2-3 */}
              <rect x="243" y="4" width="5" height="16" fill="#222" />

              {/* Car 3: Right Cab */}
              <g transform="translate(248, 0)">
                {/* Body */}
                <path d="M 0,2 L 108,2 C 114,2 118,7 118,11 C 118,17 114,20 108,20 L 0,20 Z" fill="url(#emu800Body)" stroke="#999" strokeWidth="0.5" />
                {/* Yellow front face */}
                <path d="M 118,11 L 102,11 L 102,20 L 108,20 C 114,20 118,17 118,11 Z" fill="#F1C40F" />
                {/* Blue stripe */}
                <rect x="0" y="10.5" width="102" height="3" fill="#2980B9" />
                {/* Yellow stripe below blue */}
                <rect x="0" y="13.5" width="102" height="1.5" fill="#F1C40F" />
                {/* Windows */}
                <g fill="#151d24">
                  <rect x="15" y="4.5" width="15" height="7" rx="1" />
                  <rect x="35" y="4.5" width="18" height="7" rx="1" />
                  <rect x="58" y="4.5" width="18" height="7" rx="1" />
                  <rect x="81" y="4.5" width="15" height="7" rx="1" />
                </g>
                {/* Windshield */}
                <path d="M 118,4.5 L 105,4.5 L 105,9.5 L 117,9.5 Z" fill="#111" />
                <path d="M 117,5 L 108,5 L 109,8.5 L 116,8.5 Z" fill="#1a252f" />
                {/* Bogies & Wheels */}
                <rect x="18" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="23" cy="23" r="3" fill="#000" /> <circle cx="23" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="35" cy="23" r="3" fill="#000" /> <circle cx="35" cy="23" r="1.2" fill="#7f8c8d" />
                
                <rect x="82" y="20" width="22" height="3" fill="#2c2c2c" rx="1" />
                <circle cx="87" cy="23" r="3" fill="#000" /> <circle cx="87" cy="23" r="1.2" fill="#7f8c8d" />
                <circle cx="99" cy="23" r="3" fill="#000" /> <circle cx="99" cy="23" r="1.2" fill="#7f8c8d" />
              </g>
            </g>

            {/* Spark generator (Welding Effect under EMU800 at x=120) */}
            <g transform="translate(120, 415)">
              <circle cx="0" cy="0" r="15" fill="rgba(0, 240, 255, 0.2)" />
              <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#00F0FF" style={{ '--dx': '-18px', '--dy': '-12px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.0" fill="#FFF" style={{ '--dx': '12px', '--dy': '-16px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.8" fill="#00F0FF" style={{ '--dx': '-8px', '--dy': '-8px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="0.8" fill="#FFF" style={{ '--dx': '10px', '--dy': '-10px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.2" fill="#00F0FF" style={{ '--dx': '-12px', '--dy': '-4px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#FFF" style={{ '--dx': '6px', '--dy': '-18px' }} />
            </g>

            {/* Detailed Welder Operator kneeling next to Track 3 (跪姿雙腿) */}
            <g transform="translate(136, 415)">
              {/* Back leg kneeling (膝蓋著地) */}
              <path d="M 4,-3 L 8,4 L 11,4" fill="none" stroke="#1f2c3d" strokeWidth="2.5" strokeLinecap="round" />
              {/* Front leg planted (另一隻腿支撐) */}
              <path d="M -1,-3 L -3,3 L 0,3" fill="none" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />
              {/* Torso (Orange safety suit) */}
              <path d="M -4,-12 L 2,-13 L 4,-3 L -3,-3 Z" fill="#e67e22" stroke="#d35400" strokeWidth="0.5" />
              {/* Welding torch wire */}
              <line x1="-12" y1="-2" x2="-16" y2="0" stroke="#7f8c8d" strokeWidth="1" />
              {/* Arms holding torch */}
              <path d="M -1,-10 L -8,-4 L -13,-2" fill="none" stroke="#d35400" strokeWidth="2" strokeLinecap="round" />
              <path d="M -3,-11 L -9,-5 L -13,-2" fill="none" stroke="#e67e22" strokeWidth="1.5" strokeLinecap="round" />
              {/* Head and welding mask */}
              <circle cx="0" cy="-15" r="2.8" fill="#f1c40f" />
              <rect x="-4" y="-18" width="5" height="7" fill="#111" rx="1" />
              {/* Blue reflection light on welder mask */}
              <rect x="-4" y="-16" width="2" height="3" fill="#00F0FF" opacity="0.65" />
            </g>

            {/* Floor border warning stripes */}
            <rect x="0" y="475" width="800" height="25" fill="url(#warningStripes)" />
          </svg>
        </div>
      </div>
    </>
  );
}
