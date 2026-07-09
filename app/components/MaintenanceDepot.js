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

        /* 🚄 EMU900 洗車平移動畫 - 超慢速穿越且精準維持在 y=330 軌道 */
        .train-washing {
          animation: washPass 35s linear infinite;
        }

        @keyframes washPass {
          0% { transform: translateY(330px) translateX(-450px); }
          100% { transform: translateY(330px) translateX(850px); }
        }

        /* 🏗️ 懸吊天車平移動畫 */
        .overhead-crane {
          animation: craneMove 25s ease-in-out infinite;
        }

        /* 天車多段關節物理擺盪效果 */
        .crane-joint-1 {
          transform-origin: 0px 64px;
          animation: swayJoint1 25s ease-in-out infinite;
        }

        .crane-joint-2 {
          transform-origin: 0px 0px;
          animation: swayJoint2 25s ease-in-out infinite;
        }

        .crane-joint-3 {
          transform-origin: 0px 0px;
          animation: swayJoint3 25s ease-in-out infinite;
        }

        @keyframes craneMove {
          0%, 100% { transform: translateX(40px); }
          50% { transform: translateX(620px); }
        }

        @keyframes swayJoint1 {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-5deg); }
          25% { transform: rotate(0deg); }
          40% { transform: rotate(5deg); }
          50% { transform: rotate(0deg); }
          60% { transform: rotate(5deg); }
          75% { transform: rotate(0deg); }
          90% { transform: rotate(-5deg); }
        }

        @keyframes swayJoint2 {
          0%, 100% { transform: rotate(0deg); }
          12% { transform: rotate(-4.5deg); }
          27% { transform: rotate(0deg); }
          42% { transform: rotate(4.5deg); }
          50% { transform: rotate(0deg); }
          62% { transform: rotate(4.5deg); }
          77% { transform: rotate(0deg); }
          92% { transform: rotate(-4.5deg); }
        }

        @keyframes swayJoint3 {
          0%, 100% { transform: rotate(0deg); }
          14% { transform: rotate(-4deg); }
          29% { transform: rotate(0deg); }
          44% { transform: rotate(4deg); }
          50% { transform: rotate(0deg); }
          64% { transform: rotate(4deg); }
          79% { transform: rotate(0deg); }
          94% { transform: rotate(-4deg); }
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
          0% { opacity: 0.08; }
          100% { opacity: 0.2; }
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

            {/* Overhead Gantry Crane (Centered around x=0, slides horizontally) */}
            <g className="overhead-crane">
              {/* Crane Rail Carriage */}
              <rect x="-25" y="46" width="50" height="10" fill="#f39c12" rx="1" />
              <rect x="-15" y="56" width="30" height="8" fill="#2c3e50" rx="1" />
              {/* Cable & Hook Group (Swaying with Nested joints) */}
              <g className="crane-joint-1">
                {/* Segment 1 line */}
                <line x1="0" y1="64" x2="0" y2="88" stroke="#7f8c8d" strokeWidth="1.5" strokeDasharray="3, 3" />
                
                <g className="crane-joint-2" transform="translate(0, 88)">
                  {/* Segment 2 line */}
                  <line x1="0" y1="0" x2="0" y2="24" stroke="#7f8c8d" strokeWidth="1.5" strokeDasharray="3, 3" />
                  
                  <g className="crane-joint-3" transform="translate(0, 24)">
                    {/* Segment 3 line */}
                    <line x1="0" y1="0" x2="0" y2="23" stroke="#7f8c8d" strokeWidth="1.5" strokeDasharray="3, 3" />
                    
                    {/* Hook block and mechanical claw */}
                    <g transform="translate(0, 23)">
                      <rect x="-6" y="0" width="12" height="12" fill="#34495e" rx="1" />
                      <circle cx="0" cy="6" r="2.5" fill="#f1c40f" />
                      {/* Symmetric steel claw hooks */}
                      <path d="M -8,10 Q -8,17 -4,17 Q 0,17 0,13 Q 0,17 4,17 Q 8,17 8,10" fill="none" stroke="#7f8c8d" strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                  </g>
                </g>
              </g>
            </g>

            {/* Floor perspectives */}
            <rect x="0" y="270" width="800" height="230" fill="#090c10" />
            <path d="M 0,270 L 800,270 M 0,285 L 800,285 M 0,310 L 800,310 M 0,350 L 800,350 M 0,400 L 800,400 M 0,460 L 800,460" stroke="#121720" strokeWidth="1" />


            {/* ==================== TRACK 1 (TOP, y=230) - EMU3000 Parking ==================== */}
            {/* Sleepers */}
            <line x1="0" y1="230" x2="800" y2="230" stroke="#1c1f24" strokeWidth="4" strokeDasharray="2, 6" />
            {/* Rails */}
            <line x1="0" y1="226" x2="800" y2="226" stroke="#484d56" strokeWidth="1.5" />
            <line x1="0" y1="227" x2="800" y2="227" stroke="#777c85" strokeWidth="1" />
            
            {/* Highly Detailed 3-Car EMU3000 Train */}
            <g transform="translate(180, 182)">
              {/* Car 1: Left Cab */}
              <g>
                {/* Coupler */}
                <rect x="-8" y="38" width="8" height="3" fill="#222" />
                {/* Aerodynamic Body */}
                <path d="M 15,4 L 140,4 L 140,38 L 15,38 C 2,38 -2,32 -2,25 C -2,10 5,4 15,4 Z" fill="url(#emu3000Body)" stroke="#999" strokeWidth="0.5" />
                {/* Black window band */}
                <path d="M 5,8 L 140,8 L 140,20 L 8,20 C 5,20 4,18 4,15 C 4,11 4,8 5,8 Z" fill="#111" />
                {/* Red stripe */}
                <path d="M 2,28 L 140,28 L 140,31 L 2,31 Z" fill="#E74C3C" />
                {/* Detailed Windows with reflections */}
                <g fill="#1a1a1a" stroke="#333" strokeWidth="0.5">
                  <rect x="40" y="10" width="22" height="8" rx="1" />
                  <rect x="70" y="10" width="22" height="8" rx="1" />
                  <rect x="100" y="10" width="22" height="8" rx="1" />
                </g>
                <g fill="rgba(255,255,255,0.1)">
                  <path d="M 42,10 L 52,10 L 48,18 L 40,18 Z" />
                  <path d="M 72,10 L 82,10 L 78,18 L 70,18 Z" />
                  <path d="M 102,10 L 112,10 L 108,18 L 100,18 Z" />
                </g>
                {/* Hidden Doors */}
                <line x1="32" y1="4" x2="32" y2="38" stroke="#ccc" strokeWidth="0.5" />
                <line x1="65" y1="4" x2="65" y2="38" stroke="#ccc" strokeWidth="0.5" />
                {/* Cab window & Headlight */}
                <path d="M -1,10 L 15,10 L 15,18 L 2,18 Z" fill="#1a1a1a" />
                <path d="M -1,10 L 5,10 L 4,18 L -1,18 Z" fill="rgba(255,255,255,0.15)" />
                <circle cx="-1" cy="26" r="1.5" fill="#FFF" filter="drop-shadow(0 0 2px #FFF)" />
                {/* Bogies & Wheels */}
                <rect x="20" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="26" cy="42" r="4.5" fill="#000" /> <circle cx="26" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="44" cy="42" r="4.5" fill="#000" /> <circle cx="44" cy="42" r="1.5" fill="#7f8c8d" />
                
                <rect x="95" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="101" cy="42" r="4.5" fill="#000" /> <circle cx="101" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="119" cy="42" r="4.5" fill="#000" /> <circle cx="119" cy="42" r="1.5" fill="#7f8c8d" />
                {/* Pantograph */}
                <path d="M 90,4 L 85,-2 L 95,-2 Z" fill="none" stroke="#555" strokeWidth="1" />
                <line x1="80" y1="-2" x2="100" y2="-2" stroke="#333" strokeWidth="1.5" />
              </g>

              {/* Gangway Connector 1-2 */}
              <rect x="140" y="6" width="6" height="32" fill="#222" />
              <rect x="141" y="6" width="4" height="32" fill="#111" />

              {/* Car 2: Middle Passenger Car */}
              <g transform="translate(146, 0)">
                {/* Body */}
                <rect x="0" y="4" width="120" height="34" fill="url(#emu3000Body)" stroke="#999" strokeWidth="0.5" rx="1" />
                {/* Black window band */}
                <rect x="0" y="8" width="120" height="12" fill="#111" />
                {/* Red stripe */}
                <rect x="0" y="28" width="120" height="3" fill="#E74C3C" />
                {/* Windows */}
                <g fill="#1a1a1a" stroke="#333" strokeWidth="0.5">
                  <rect x="12" y="10" width="22" height="8" rx="1" />
                  <rect x="42" y="10" width="22" height="8" rx="1" />
                  <rect x="72" y="10" width="22" height="8" rx="1" />
                  <rect x="102" y="10" width="22" height="8" rx="1" />
                </g>
                <g fill="rgba(255,255,255,0.1)">
                  <path d="M 14,10 L 24,10 L 20,18 L 12,18 Z" />
                  <path d="M 44,10 L 54,10 L 50,18 L 42,18 Z" />
                  <path d="M 74,10 L 84,10 L 80,18 L 72,18 Z" />
                  <path d="M 104,10 L 114,10 L 110,18 L 102,18 Z" />
                </g>
                {/* Hidden Doors */}
                <line x1="38" y1="4" x2="38" y2="38" stroke="#ccc" strokeWidth="0.5" />
                <line x1="98" y1="4" x2="98" y2="38" stroke="#ccc" strokeWidth="0.5" />
                {/* Bogies & Wheels */}
                <rect x="15" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="21" cy="42" r="4.5" fill="#000" /> <circle cx="21" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="39" cy="42" r="4.5" fill="#000" /> <circle cx="39" cy="42" r="1.5" fill="#7f8c8d" />
                
                <rect x="85" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="90" cy="42" r="4.5" fill="#000" /> <circle cx="90" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="108" cy="42" r="4.5" fill="#000" /> <circle cx="108" cy="42" r="1.5" fill="#7f8c8d" />
              </g>

              {/* Gangway Connector 2-3 */}
              <rect x="266" y="6" width="6" height="32" fill="#222" />
              <rect x="267" y="6" width="4" height="32" fill="#111" />

              {/* Car 3: Right Cab */}
              <g transform="translate(272, 0)">
                {/* Body */}
                <path d="M 0,4 L 125,4 C 135,4 142,10 142,25 C 142,32 138,38 125,38 L 0,38 Z" fill="url(#emu3000Body)" stroke="#999" strokeWidth="0.5" />
                {/* Black window band */}
                <path d="M 0,8 L 132,8 C 133,8 135,11 135,15 C 135,18 134,20 132,20 L 0,20 Z" fill="#111" />
                {/* Red stripe */}
                <path d="M 0,28 L 138,28 L 138,31 L 0,31 Z" fill="#E74C3C" />
                {/* Windows */}
                <g fill="#1a1a1a" stroke="#333" strokeWidth="0.5">
                  <rect x="15" y="10" width="22" height="8" rx="1" />
                  <rect x="45" y="10" width="22" height="8" rx="1" />
                  <rect x="75" y="10" width="22" height="8" rx="1" />
                </g>
                <g fill="rgba(255,255,255,0.1)">
                  <path d="M 17,10 L 27,10 L 23,18 L 15,18 Z" />
                  <path d="M 47,10 L 57,10 L 53,18 L 45,18 Z" />
                  <path d="M 77,10 L 87,10 L 83,18 L 75,18 Z" />
                </g>
                {/* Hidden Doors */}
                <line x1="70" y1="4" x2="70" y2="38" stroke="#ccc" strokeWidth="0.5" />
                <line x1="105" y1="4" x2="105" y2="38" stroke="#ccc" strokeWidth="0.5" />
                {/* Cab window & Headlight */}
                <path d="M 125,10 L 134,10 C 135,10 136,13 136,14 L 125,18 Z" fill="#1a1a1a" />
                <path d="M 128,10 L 133,10 L 129,18 L 125,18 Z" fill="rgba(255,255,255,0.15)" />
                <circle cx="141" cy="26" r="1.5" fill="#FFF" filter="drop-shadow(0 0 2px #FFF)" />
                {/* Bogies & Wheels */}
                <rect x="20" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="26" cy="42" r="4.5" fill="#000" /> <circle cx="26" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="44" cy="42" r="4.5" fill="#000" /> <circle cx="44" cy="42" r="1.5" fill="#7f8c8d" />
                
                <rect x="85" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="91" cy="42" r="4.5" fill="#000" /> <circle cx="91" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="109" cy="42" r="4.5" fill="#000" /> <circle cx="109" cy="42" r="1.5" fill="#7f8c8d" />
                {/* Pantograph */}
                <path d="M 45,4 L 50,-2 L 40,-2 Z" fill="none" stroke="#555" strokeWidth="1" />
                <line x1="35" y1="-2" x2="55" y2="-2" stroke="#333" strokeWidth="1.5" />
                {/* Coupler */}
                <rect x="142" y="38" width="8" height="3" fill="#222" />
              </g>
            </g>


            {/* ==================== TRACK 2 (MIDDLE, y=330) - Wash & EMU900 ==================== */}
            {/* Sleepers */}
            <line x1="0" y1="330" x2="800" y2="330" stroke="#1c1f24" strokeWidth="4" strokeDasharray="2, 6" />
            {/* Rails */}
            <line x1="0" y1="326" x2="800" y2="326" stroke="#484d56" strokeWidth="1.5" />
            <line x1="0" y1="327" x2="800" y2="327" stroke="#777c85" strokeWidth="1" />

            {/* Highly Detailed 3-Car EMU900 Train passing through washing system */}
            <g className="train-washing">
              {/* Car 1: Left Cab */}
              <g transform="translate(0, 0)">
                {/* Coupler */}
                <rect x="-8" y="-14" width="8" height="3" fill="#222" />
                {/* Aerodynamic Body */}
                <path d="M 15,-45 L 140,-45 L 140,-11 L 15,-11 C 5,-11 -2,-17 -2,-28 C -2,-39 5,-45 15,-45 Z" fill="url(#emu900Body)" stroke="#999" strokeWidth="0.5" />
                {/* Green stripe top */}
                <rect x="15" y="-42" width="125" height="3" fill="#00A859" />
                {/* Green stripe bottom */}
                <path d="M 2,-22 Q 10,-22 30,-25 L 140,-25" fill="none" stroke="#00A859" strokeWidth="4" strokeLinecap="round" />
                
                {/* Windows and Doors */}
                <g fill="#151d24" stroke="#333" strokeWidth="0.5">
                  <rect x="35" y="-38" width="18" height="10" rx="1.5" />
                  <rect x="68" y="-38" width="18" height="10" rx="1.5" />
                  <rect x="101" y="-38" width="18" height="10" rx="1.5" />
                </g>
                <g fill="rgba(255,255,255,0.1)">
                  <path d="M 37,-38 L 45,-38 L 41,-28 L 35,-28 Z" />
                  <path d="M 70,-38 L 78,-38 L 74,-28 L 68,-28 Z" />
                  <path d="M 103,-38 L 111,-38 L 107,-28 L 101,-28 Z" />
                </g>
                {/* Doors */}
                <rect x="25" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="29" y1="-40" x2="29" y2="-13" stroke="#333" strokeWidth="0.5" />
                <rect x="55" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="59" y1="-40" x2="59" y2="-13" stroke="#333" strokeWidth="0.5" />
                <rect x="88" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="92" y1="-40" x2="92" y2="-13" stroke="#333" strokeWidth="0.5" />
                <rect x="122" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="126" y1="-40" x2="126" y2="-13" stroke="#333" strokeWidth="0.5" />
                
                {/* Driver Cab details */}
                {/* Black Mask */}
                <path d="M 0,-34 C 4,-26 6,-13 18,-11 L 28,-11 C 24,-13 21,-18 20,-26 C 19,-32 22,-38 26,-38 L 12,-38 Z" fill="#111" />
                {/* Smile neon */}
                <path d="M -1,-38 C 5,-38 10,-32 10,-28 C 10,-24 5,-18 -1,-18" fill="none" stroke="#00FF66" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="-1.5" cy="-28" r="2.5" fill="rgba(255,255,255,0.4)" filter="drop-shadow(0 0 2px #FFF)" />
                <circle cx="-1.5" cy="-28" r="1.2" fill="#FFF" />
                {/* Cab window highlight */}
                <path d="M 0,-38 L 8,-38 L 8,-26 L 3,-26 Z" fill="#151d24" />
                <path d="M 2,-38 L 6,-38 L 5,-26 L 3,-26 Z" fill="rgba(255,255,255,0.15)" />

                {/* Bogies & Wheels */}
                <rect x="20" y="-11" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="26" cy="-7" r="4.5" fill="#000" /> <circle cx="26" cy="-7" r="1.5" fill="#7f8c8d" />
                <circle cx="44" cy="-7" r="4.5" fill="#000" /> <circle cx="44" cy="-7" r="1.5" fill="#7f8c8d" />
                
                <rect x="95" y="-11" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="101" cy="-7" r="4.5" fill="#000" /> <circle cx="101" cy="-7" r="1.5" fill="#7f8c8d" />
                <circle cx="119" cy="-7" r="4.5" fill="#000" /> <circle cx="119" cy="-7" r="1.5" fill="#7f8c8d" />
                
                {/* Pantograph */}
                <path d="M 90,-45 L 85,-51 L 95,-51 Z" fill="none" stroke="#555" strokeWidth="1" />
                <line x1="80" y1="-51" x2="100" y2="-51" stroke="#333" strokeWidth="1.5" />
              </g>

              {/* Gangway Connector 1-2 */}
              <rect x="140" y="-38" width="6" height="27" fill="#222" />
              <rect x="141" y="-38" width="4" height="27" fill="#111" />

              {/* Car 2: Middle Passenger Car */}
              <g transform="translate(146, 0)">
                {/* Body */}
                <rect x="0" y="-45" width="120" height="34" fill="url(#emu900Body)" stroke="#999" strokeWidth="0.5" rx="1" />
                {/* Green stripe */}
                <rect x="0" y="-42" width="120" height="3" fill="#00A859" />
                {/* Green bottom curve */}
                <line x1="0" y1="-25" x2="120" y2="-25" stroke="#00A859" strokeWidth="4" />
                
                {/* Windows and Doors */}
                <g fill="#151d24" stroke="#333" strokeWidth="0.5">
                  <rect x="25" y="-38" width="18" height="10" rx="1.5" />
                  <rect x="58" y="-38" width="18" height="10" rx="1.5" />
                  <rect x="91" y="-38" width="18" height="10" rx="1.5" />
                </g>
                <g fill="rgba(255,255,255,0.1)">
                  <path d="M 27,-38 L 35,-38 L 31,-28 L 25,-28 Z" />
                  <path d="M 60,-38 L 68,-38 L 64,-28 L 58,-28 Z" />
                  <path d="M 93,-38 L 101,-38 L 97,-28 L 91,-28 Z" />
                </g>
                {/* Doors */}
                <rect x="12" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="16" y1="-40" x2="16" y2="-13" stroke="#333" strokeWidth="0.5" />
                <rect x="45" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="49" y1="-40" x2="49" y2="-13" stroke="#333" strokeWidth="0.5" />
                <rect x="78" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="82" y1="-40" x2="82" y2="-13" stroke="#333" strokeWidth="0.5" />
                <rect x="110" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="114" y1="-40" x2="114" y2="-13" stroke="#333" strokeWidth="0.5" />

                {/* Bogies & Wheels */}
                <rect x="15" y="-11" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="21" cy="-7" r="4.5" fill="#000" /> <circle cx="21" cy="-7" r="1.5" fill="#7f8c8d" />
                <circle cx="39" cy="-7" r="4.5" fill="#000" /> <circle cx="39" cy="-7" r="1.5" fill="#7f8c8d" />
                
                <rect x="80" y="-11" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="85" cy="-7" r="4.5" fill="#000" /> <circle cx="85" cy="-7" r="1.5" fill="#7f8c8d" />
                <circle cx="103" cy="-7" r="4.5" fill="#000" /> <circle cx="103" cy="-7" r="1.5" fill="#7f8c8d" />
              </g>

              {/* Gangway Connector 2-3 */}
              <rect x="266" y="-38" width="6" height="27" fill="#222" />
              <rect x="267" y="-38" width="4" height="27" fill="#111" />

              {/* Car 3: Right Cab */}
              <g transform="translate(272, 0)">
                {/* Body */}
                <path d="M 0,-45 L 125,-45 C 135,-45 142,-39 142,-28 C 142,-17 135,-11 125,-11 L 0,-11 Z" fill="url(#emu900Body)" stroke="#999" strokeWidth="0.5" />
                {/* Green stripe */}
                <rect x="0" y="-42" width="115" height="3" fill="#00A859" />
                {/* Green bottom curve */}
                <path d="M 0,-25 L 110,-25 Q 125,-22 135,-22" fill="none" stroke="#00A859" strokeWidth="4" strokeLinecap="round" />
                
                {/* Windows and Doors */}
                <g fill="#151d24" stroke="#333" strokeWidth="0.5">
                  <rect x="25" y="-38" width="18" height="10" rx="1.5" />
                  <rect x="58" y="-38" width="18" height="10" rx="1.5" />
                  <rect x="91" y="-38" width="18" height="10" rx="1.5" />
                </g>
                <g fill="rgba(255,255,255,0.1)">
                  <path d="M 27,-38 L 35,-38 L 31,-28 L 25,-28 Z" />
                  <path d="M 60,-38 L 68,-38 L 64,-28 L 58,-28 Z" />
                  <path d="M 93,-38 L 101,-38 L 97,-28 L 91,-28 Z" />
                </g>
                {/* Doors */}
                <rect x="10" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="14" y1="-40" x2="14" y2="-13" stroke="#333" strokeWidth="0.5" />
                <rect x="45" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="49" y1="-40" x2="49" y2="-13" stroke="#333" strokeWidth="0.5" />
                <rect x="78" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="82" y1="-40" x2="82" y2="-13" stroke="#333" strokeWidth="0.5" />
                <rect x="110" y="-40" width="8" height="27" fill="#7F8C8D" rx="1" />
                <line x1="114" y1="-40" x2="114" y2="-13" stroke="#333" strokeWidth="0.5" />

                {/* Driver Cab details */}
                {/* Black Mask */}
                <path d="M 125,-11 L 115,-11 C 122,-11 127,-16 130,-22 C 131,-28 128,-36 122,-38 L 140,-38 C 142,-26 142,-13 130,-11 Z" fill="#111" />
                {/* Smile neon */}
                <path d="M 141,-38 C 135,-38 130,-32 130,-28 C 130,-24 135,-18 141,-18" fill="none" stroke="#00FF66" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="141.5" cy="-28" r="2.5" fill="rgba(255,255,255,0.4)" filter="drop-shadow(0 0 2px #FFF)" />
                <circle cx="141.5" cy="-28" r="1.2" fill="#FFF" />
                {/* Cab window highlight */}
                <path d="M 128,-38 L 138,-38 L 134,-26 L 128,-26 Z" fill="#151d24" />
                <path d="M 132,-38 L 137,-38 L 134,-26 L 130,-26 Z" fill="rgba(255,255,255,0.15)" />

                {/* Bogies & Wheels */}
                <rect x="20" y="-11" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="26" cy="-7" r="4.5" fill="#000" /> <circle cx="26" cy="-7" r="1.5" fill="#7f8c8d" />
                <circle cx="44" cy="-7" r="4.5" fill="#000" /> <circle cx="44" cy="-7" r="1.5" fill="#7f8c8d" />
                
                <rect x="85" y="-11" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="91" cy="-7" r="4.5" fill="#000" /> <circle cx="91" cy="-7" r="1.5" fill="#7f8c8d" />
                <circle cx="109" cy="-7" r="4.5" fill="#000" /> <circle cx="109" cy="-7" r="1.5" fill="#7f8c8d" />
                
                {/* Pantograph */}
                <path d="M 45,-45 L 50,-51 L 40,-51 Z" fill="none" stroke="#555" strokeWidth="1" />
                <line x1="35" y1="-51" x2="55" y2="-51" stroke="#333" strokeWidth="1.5" />

                {/* Coupler */}
                <rect x="142" y="-14" width="8" height="3" fill="#222" />
              </g>
            </g>

            {/* Washing System Overlay (Layered on top of Track 2) */}
            <g transform="translate(350, 0)">
              {/* Spraying water drops */}
              <circle className="water-drop" cx="-12" cy="305" r="1.8" fill="#5DADE2" style={{ '--wx': '-28px', '--wy': '-18px' }} />
              <circle className="water-drop" cx="-10" cy="320" r="1.5" fill="#5DADE2" style={{ '--wx': '-35px', '--wy': '12px' }} />
              <circle className="water-drop" cx="12" cy="310" r="2.0" fill="#5DADE2" style={{ '--wx': '28px', '--wy': '-12px' }} />
              <circle className="water-drop" cx="10" cy="328" r="1.8" fill="#5DADE2" style={{ '--wx': '25px', '--wy': '18px' }} />

              {/* Vertical Support Gantry */}
              <rect x="-3" y="275" width="6" height="60" fill="url(#gantryBeam)" rx="1" />

              {/* Brush 1 (Upper) - No inline transformOrigin styles to avoid offsets, spins in place */}
              <g className="wash-brush">
                <rect x="-7" y="287" width="14" height="22" fill="#3498DB" opacity="0.85" rx="3" />
                <line x1="0" y1="287" x2="0" y2="309" stroke="#FFF" strokeWidth="1" />
              </g>

              {/* Brush 2 (Lower) - reverse spin */}
              <g className="wash-brush-2">
                <rect x="-7" y="311" width="14" height="22" fill="#2980B9" opacity="0.85" rx="3" />
                <line x1="0" y1="311" x2="0" y2="333" stroke="#FFF" strokeWidth="1" />
              </g>
            </g>


            {/* ==================== TRACK 3 (BOTTOM, y=430) - EMU800 Maintenance ==================== */}
            {/* Sleepers */}
            <line x1="0" y1="420" x2="800" y2="420" stroke="#1c1f24" strokeWidth="4" strokeDasharray="2, 6" />
            {/* Rails */}
            <line x1="0" y1="416" x2="800" y2="416" stroke="#484d56" strokeWidth="1.5" />
            <line x1="0" y1="417" x2="800" y2="417" stroke="#777c85" strokeWidth="1" />

            {/* Highly Detailed 3-Car EMU800 Train */}
            <g transform="translate(100, 382)">
              {/* Car 1: Left Cab */}
              <g>
                {/* Coupler */}
                <rect x="-8" y="38" width="8" height="3" fill="#222" />
                {/* Body */}
                <path d="M 15,4 L 140,4 L 140,38 L 15,38 C 5,38 -2,32 -2,22 C -2,12 5,4 15,4 Z" fill="url(#emu800Body)" stroke="#999" strokeWidth="0.5" />
                {/* Yellow front face - Smile shape */}
                <path d="M -2,22 L 20,22 L 20,38 L 12,38 C 5,38 -2,32 -2,22 Z" fill="#F1C40F" />
                <path d="M 8,24 Q -1,24 -1,22 Q -1,18 8,18" fill="none" stroke="#F1C40F" strokeWidth="4" />
                {/* Blue stripe */}
                <rect x="20" y="19" width="120" height="5" fill="#2980B9" />
                {/* Yellow stripe below blue */}
                <rect x="20" y="24" width="120" height="2" fill="#F1C40F" />
                
                {/* Windows and Doors */}
                <g fill="#151d24" stroke="#333" strokeWidth="0.5">
                  <rect x="35" y="8" width="18" height="10" rx="1" />
                  <rect x="68" y="8" width="18" height="10" rx="1" />
                  <rect x="101" y="8" width="18" height="10" rx="1" />
                </g>
                <g fill="rgba(255,255,255,0.1)">
                  <path d="M 37,8 L 45,8 L 41,18 L 35,18 Z" />
                  <path d="M 70,8 L 78,8 L 74,18 L 68,18 Z" />
                  <path d="M 103,8 L 111,8 L 107,18 L 101,18 Z" />
                </g>
                {/* Doors */}
                <rect x="25" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="29" y1="6" x2="29" y2="33" stroke="#555" strokeWidth="0.5" />
                <rect x="55" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="59" y1="6" x2="59" y2="33" stroke="#555" strokeWidth="0.5" />
                <rect x="88" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="92" y1="6" x2="92" y2="33" stroke="#555" strokeWidth="0.5" />
                <rect x="122" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="126" y1="6" x2="126" y2="33" stroke="#555" strokeWidth="0.5" />

                {/* Windshield & Headlight */}
                <path d="M 0,8 L 15,8 L 15,16 L 3,16 Z" fill="#111" />
                <path d="M 2,8 L 6,8 L 5,16 L 3,16 Z" fill="rgba(255,255,255,0.15)" />
                <circle cx="2" cy="28" r="1.5" fill="#FFF" filter="drop-shadow(0 0 2px #FFF)" />
                <circle cx="-1" cy="34" r="1.5" fill="#F00" />
                
                {/* Bogies & Wheels */}
                <rect x="20" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="26" cy="42" r="4.5" fill="#000" /> <circle cx="26" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="44" cy="42" r="4.5" fill="#000" /> <circle cx="44" cy="42" r="1.5" fill="#7f8c8d" />
                
                <rect x="95" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="101" cy="42" r="4.5" fill="#000" /> <circle cx="101" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="119" cy="42" r="4.5" fill="#000" /> <circle cx="119" cy="42" r="1.5" fill="#7f8c8d" />

                {/* Pantograph */}
                <path d="M 90,4 L 85,-2 L 95,-2 Z" fill="none" stroke="#555" strokeWidth="1" />
                <line x1="80" y1="-2" x2="100" y2="-2" stroke="#333" strokeWidth="1.5" />
              </g>

              {/* Gangway Connector 1-2 */}
              <rect x="140" y="8" width="6" height="27" fill="#222" />
              <rect x="141" y="8" width="4" height="27" fill="#111" />

              {/* Car 2: Middle Passenger Car */}
              <g transform="translate(146, 0)">
                {/* Body */}
                <rect x="0" y="4" width="120" height="34" fill="url(#emu800Body)" stroke="#999" strokeWidth="0.5" rx="1" />
                {/* Blue stripe */}
                <rect x="0" y="19" width="120" height="5" fill="#2980B9" />
                {/* Yellow stripe */}
                <rect x="0" y="24" width="120" height="2" fill="#F1C40F" />
                
                {/* Windows and Doors */}
                <g fill="#151d24" stroke="#333" strokeWidth="0.5">
                  <rect x="25" y="8" width="18" height="10" rx="1" />
                  <rect x="58" y="8" width="18" height="10" rx="1" />
                  <rect x="91" y="8" width="18" height="10" rx="1" />
                </g>
                <g fill="rgba(255,255,255,0.1)">
                  <path d="M 27,8 L 35,8 L 31,18 L 25,18 Z" />
                  <path d="M 60,8 L 68,8 L 64,18 L 58,18 Z" />
                  <path d="M 93,8 L 101,8 L 97,18 L 91,18 Z" />
                </g>
                {/* Doors */}
                <rect x="12" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="16" y1="6" x2="16" y2="33" stroke="#555" strokeWidth="0.5" />
                <rect x="45" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="49" y1="6" x2="49" y2="33" stroke="#555" strokeWidth="0.5" />
                <rect x="78" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="82" y1="6" x2="82" y2="33" stroke="#555" strokeWidth="0.5" />
                <rect x="110" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="114" y1="6" x2="114" y2="33" stroke="#555" strokeWidth="0.5" />

                {/* Bogies & Wheels */}
                <rect x="15" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="21" cy="42" r="4.5" fill="#000" /> <circle cx="21" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="39" cy="42" r="4.5" fill="#000" /> <circle cx="39" cy="42" r="1.5" fill="#7f8c8d" />
                
                <rect x="85" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="90" cy="42" r="4.5" fill="#000" /> <circle cx="90" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="108" cy="42" r="4.5" fill="#000" /> <circle cx="108" cy="42" r="1.5" fill="#7f8c8d" />
              </g>

              {/* Gangway Connector 2-3 */}
              <rect x="266" y="8" width="6" height="27" fill="#222" />
              <rect x="267" y="8" width="4" height="27" fill="#111" />

              {/* Car 3: Right Cab */}
              <g transform="translate(272, 0)">
                {/* Body */}
                <path d="M 0,4 L 125,4 C 135,4 142,10 142,22 C 142,32 135,38 125,38 L 0,38 Z" fill="url(#emu800Body)" stroke="#999" strokeWidth="0.5" />
                {/* Yellow front face */}
                <path d="M 142,22 L 120,22 L 120,38 L 128,38 C 135,38 142,32 142,22 Z" fill="#F1C40F" />
                <path d="M 132,24 Q 141,24 141,22 Q 141,18 132,18" fill="none" stroke="#F1C40F" strokeWidth="4" />
                {/* Blue stripe */}
                <rect x="0" y="19" width="120" height="5" fill="#2980B9" />
                {/* Yellow stripe below blue */}
                <rect x="0" y="24" width="120" height="2" fill="#F1C40F" />
                
                {/* Windows and Doors */}
                <g fill="#151d24" stroke="#333" strokeWidth="0.5">
                  <rect x="25" y="8" width="18" height="10" rx="1" />
                  <rect x="58" y="8" width="18" height="10" rx="1" />
                  <rect x="91" y="8" width="18" height="10" rx="1" />
                </g>
                <g fill="rgba(255,255,255,0.1)">
                  <path d="M 27,8 L 35,8 L 31,18 L 25,18 Z" />
                  <path d="M 60,8 L 68,8 L 64,18 L 58,18 Z" />
                  <path d="M 93,8 L 101,8 L 97,18 L 91,18 Z" />
                </g>
                {/* Doors */}
                <rect x="10" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="14" y1="6" x2="14" y2="33" stroke="#555" strokeWidth="0.5" />
                <rect x="45" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="49" y1="6" x2="49" y2="33" stroke="#555" strokeWidth="0.5" />
                <rect x="78" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="82" y1="6" x2="82" y2="33" stroke="#555" strokeWidth="0.5" />
                <rect x="110" y="6" width="8" height="27" fill="#BDC3C7" stroke="#7F8C8D" strokeWidth="0.5" rx="1" />
                <line x1="114" y1="6" x2="114" y2="33" stroke="#555" strokeWidth="0.5" />

                {/* Windshield & Headlight */}
                <path d="M 140,8 L 125,8 L 125,16 L 137,16 Z" fill="#111" />
                <path d="M 138,8 L 134,8 L 135,16 L 137,16 Z" fill="rgba(255,255,255,0.15)" />
                <circle cx="138" cy="28" r="1.5" fill="#FFF" filter="drop-shadow(0 0 2px #FFF)" />
                <circle cx="141" cy="34" r="1.5" fill="#F00" />
                
                {/* Bogies & Wheels */}
                <rect x="20" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="26" cy="42" r="4.5" fill="#000" /> <circle cx="26" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="44" cy="42" r="4.5" fill="#000" /> <circle cx="44" cy="42" r="1.5" fill="#7f8c8d" />
                
                <rect x="85" y="38" width="30" height="4" fill="#2c2c2c" rx="1" />
                <circle cx="91" cy="42" r="4.5" fill="#000" /> <circle cx="91" cy="42" r="1.5" fill="#7f8c8d" />
                <circle cx="109" cy="42" r="4.5" fill="#000" /> <circle cx="109" cy="42" r="1.5" fill="#7f8c8d" />
                
                {/* Pantograph */}
                <path d="M 45,4 L 50,-2 L 40,-2 Z" fill="none" stroke="#555" strokeWidth="1" />
                <line x1="35" y1="-2" x2="55" y2="-2" stroke="#333" strokeWidth="1.5" />

                {/* Coupler */}
                <rect x="142" y="38" width="8" height="3" fill="#222" />
              </g>
            </g>

            {/* Spark generator (Welding Effect under EMU800 at x=219, y=424) */}
            <g transform="translate(219, 424)">
              <circle cx="0" cy="0" r="15" fill="rgba(0, 240, 255, 0.2)" />
              <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#00F0FF" style={{ '--dx': '-18px', '--dy': '-12px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.0" fill="#FFF" style={{ '--dx': '12px', '--dy': '-16px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.8" fill="#00F0FF" style={{ '--dx': '-8px', '--dy': '-8px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="0.8" fill="#FFF" style={{ '--dx': '10px', '--dy': '-10px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.2" fill="#00F0FF" style={{ '--dx': '-12px', '--dy': '-4px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#FFF" style={{ '--dx': '6px', '--dy': '-18px' }} />
            </g>

            {/* Detailed Welder Operator kneeling next to Track 3 (跪姿雙腿) at x=235, y=424 */}
            <g transform="translate(235, 424)">
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
