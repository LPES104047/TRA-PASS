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

        /* 🏭 背景機廠貨車庫結構 */
        .bg-depot-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: -2; /* 處於卡片層與火車層下方 */
          overflow: hidden;
          background: #11111e;
          animation: depotFadeIn 0.5s ease-out forwards;
        }

        .depot-svg-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 380px;
        }

        @keyframes depotFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* 🪚 電焊火花動畫 */
        .spark-particle {
          transform-box: fill-box;
          transform-origin: center;
          animation: electroSpark 1.5s infinite ease-out;
        }

        @keyframes electroSpark {
          0% { transform: scale(0) translate(0, 0); opacity: 0; }
          10% { transform: scale(1.2) translate(var(--dx), var(--dy)); opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: scale(0.2) translate(calc(var(--dx) * 2), calc(var(--dy) * 2)); opacity: 0; }
        }

        /* 🧹 旋轉洗車刷 */
        .wash-brush {
          animation: spinBrush 0.6s infinite linear;
          transform-origin: 497px 92px;
          transform-box: fill-box;
        }
        .wash-brush-2 {
          animation: spinBrushReverse 0.6s infinite linear;
          transform-origin: 497px 118px;
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

        /* 🚄 EMU900 洗車平移動畫 */
        .depot-emu900 {
          animation: washMove 6s infinite ease-in-out;
        }

        @keyframes washMove {
          0%, 100% { transform: translateX(-15px); }
          50% { transform: translateX(15px); }
        }

        /* Hangar Grid Lines */
        .hangar-grid {
          stroke: rgba(255, 255, 255, 0.03);
          stroke-width: 1;
        }
      `}</style>

      <div className="bg-depot-root">
        <div className="depot-svg-container">
          <svg width="100%" height="100%" viewBox="0 0 800 250" preserveAspectRatio="xMidYMax slice">
            <defs>
            {/* Metal/steel textures for 3D gradient look */}
            <linearGradient id="emu3000Body" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#E0E0E0" />
              <stop offset="80%" stopColor="#B0B0B0" />
              <stop offset="100%" stopColor="#666666" />
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
              <stop offset="0%" stopColor="#333" />
              <stop offset="50%" stopColor="#555" />
              <stop offset="100%" stopColor="#222" />
            </linearGradient>

            {/* Warning stripes pattern */}
            <pattern id="warningStripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="20" fill="#F1C40F" />
              <rect x="10" width="10" height="20" fill="#1A1A1A" />
            </pattern>
          </defs>

          {/* Hangar Background Grids */}
          <line x1="0" y1="40" x2="800" y2="40" className="hangar-grid" />
          <line x1="0" y1="105" x2="800" y2="105" className="hangar-grid" />
          <line x1="0" y1="170" x2="800" y2="170" className="hangar-grid" />
          <line x1="150" y1="0" x2="150" y2="250" className="hangar-grid" />
          <line x1="400" y1="0" x2="400" y2="250" className="hangar-grid" />
          <line x1="650" y1="0" x2="650" y2="250" className="hangar-grid" />

          {/* Industrial background trusses & pillars */}
          <rect x="25" y="0" width="10" height="250" fill="#222" />
          <rect x="765" y="0" width="10" height="250" fill="#222" />
          <line x1="20" y1="20" x2="780" y2="20" stroke="#222" strokeWidth="4" />

          {/* TRACK 1 (TOP) - EMU3000 Parking */}
          {/* Sleepers (Ties) */}
          <line x1="0" y1="45" x2="800" y2="45" stroke="#252528" strokeWidth="4" strokeDasharray="2, 6" />
          {/* Rails */}
          <line x1="0" y1="41" x2="800" y2="41" stroke="#55555d" strokeWidth="1" />
          <line x1="0" y1="42" x2="800" y2="42" stroke="#88888f" strokeWidth="0.5" />
          
          {/* EMU3000 Train Car (High-detail) */}
          <g transform="translate(220, 18)">
            {/* Pantograph (Folded, realistic) */}
            <path d="M 45,6 L 50,2 L 60,2 L 65,6" stroke="#555" strokeWidth="0.8" fill="none" />
            <path d="M 50,2 L 58,5" stroke="#444" strokeWidth="0.5" />
            {/* AC Units on Roof */}
            <rect x="75" y="4" width="18" height="2" fill="#777" rx="0.5" />
            <rect x="145" y="4" width="18" height="2" fill="#777" rx="0.5" />
            
            {/* Bogies & Wheels (Concentric, detailed) */}
            <rect x="25" y="22" width="26" height="3" fill="#2c2c2c" rx="1" />
            <circle cx="29" cy="23.5" r="2.5" fill="#111" /> <circle cx="29" cy="23.5" r="1" fill="#7f8c8d" />
            <circle cx="47" cy="23.5" r="2.5" fill="#111" /> <circle cx="47" cy="23.5" r="1" fill="#7f8c8d" />
            
            <rect x="155" y="22" width="26" height="3" fill="#2c2c2c" rx="1" />
            <circle cx="159" cy="23.5" r="2.5" fill="#111" /> <circle cx="159" cy="23.5" r="1" fill="#7f8c8d" />
            <circle cx="177" cy="23.5" r="2.5" fill="#111" /> <circle cx="177" cy="23.5" r="1" fill="#7f8c8d" />

            {/* Main Body */}
            <path d="M 10,6 L 205,6 Q 208,6 208,8 L 208,21 L 10,21 Q 4,20 4,14 L 5,10 Q 6,6 10,6 Z" fill="url(#emu3000Body)" />
            {/* Windows Mask */}
            <path d="M 9,7 L 208,7 L 208,13 L 9,13 Z" fill="#111" />
            {/* Window Glass Panels with Reflections */}
            <g fill="#2c3e50">
              <rect x="22" y="8" width="22" height="4.5" rx="0.5" />
              <rect x="52" y="8" width="22" height="4.5" rx="0.5" />
              <rect x="82" y="8" width="22" height="4.5" rx="0.5" />
              <rect x="112" y="8" width="22" height="4.5" rx="0.5" />
              <rect x="142" y="8" width="22" height="4.5" rx="0.5" />
              <rect x="172" y="8" width="22" height="4.5" rx="0.5" />
            </g>
            {/* Glossy Slash Reflections */}
            <path d="M 23,8.5 L 30,8.5 L 24,12 Z" fill="rgba(255,255,255,0.25)" />
            <path d="M 53,8.5 L 60,8.5 L 54,12 Z" fill="rgba(255,255,255,0.25)" />
            <path d="M 83,8.5 L 90,8.5 L 84,12 Z" fill="rgba(255,255,255,0.25)" />
            <path d="M 113,8.5 L 120,8.5 L 114,12 Z" fill="rgba(255,255,255,0.25)" />
            <path d="M 143,8.5 L 150,8.5 L 144,12 Z" fill="rgba(255,255,255,0.25)" />
            <path d="M 173,8.5 L 180,8.5 L 174,12 Z" fill="rgba(255,255,255,0.25)" />
            {/* Red Accent Stripe */}
            <rect x="12" y="14" width="196" height="1.5" fill="#E74C3C" />
            {/* Passenger Doors (seams) */}
            <g stroke="#555" strokeWidth="0.5">
              <line x1="48" y1="6" x2="48" y2="21" />
              <line x1="138" y1="6" x2="138" y2="21" />
            </g>
            {/* Front windshield */}
            <path d="M 5,10 L 14,10 L 14,13 L 8,13 Z" fill="#1a252f" stroke="#000" strokeWidth="0.5" />
            <path d="M 6,10.5 L 11,10.5 L 8,12.5 Z" fill="rgba(255,255,255,0.3)" />
            {/* Red tail light (Parked) */}
            <circle cx="5" cy="17" r="1" fill="#FF3333" />
          </g>


          {/* TRACK 2 (MIDDLE) - EMU900 Washing Facility */}
          {/* Sleepers (Ties) */}
          <line x1="0" y1="110" x2="800" y2="110" stroke="#252528" strokeWidth="4" strokeDasharray="2, 6" />
          {/* Rails */}
          <line x1="0" y1="106" x2="800" y2="106" stroke="#55555d" strokeWidth="1" />
          <line x1="0" y1="107" x2="800" y2="107" stroke="#88888f" strokeWidth="0.5" />
          
          {/* EMU900 Train in Washing (undergoing wash Move) */}
          <g className="depot-emu900" transform="translate(280, 83)">
            {/* Rooftop details */}
            <rect x="75" y="4" width="18" height="2" fill="#666" rx="0.5" />
            <rect x="145" y="4" width="18" height="2" fill="#666" rx="0.5" />
            
            {/* Bogies & Wheels */}
            <rect x="25" y="22" width="26" height="3" fill="#2c2c2c" rx="1" />
            <circle cx="29" cy="23.5" r="2.5" fill="#111" /> <circle cx="29" cy="23.5" r="1" fill="#7f8c8d" />
            <circle cx="47" cy="23.5" r="2.5" fill="#111" /> <circle cx="47" cy="23.5" r="1" fill="#7f8c8d" />
            
            <rect x="155" y="22" width="26" height="3" fill="#2c2c2c" rx="1" />
            <circle cx="159" cy="23.5" r="2.5" fill="#111" /> <circle cx="159" cy="23.5" r="1" fill="#7f8c8d" />
            <circle cx="177" cy="23.5" r="2.5" fill="#111" /> <circle cx="177" cy="23.5" r="1" fill="#7f8c8d" />

            {/* Main Body */}
            <path d="M 10,6 L 205,6 Q 208,6 208,8 L 208,21 L 10,21 Q 4,20 4,14 L 5,10 Q 6,6 10,6 Z" fill="url(#emu900Body)" />
            {/* Green smiley wave line */}
            <path d="M 4,17 Q 15,17 35,19 L 208,19 L 208,20.2 L 35,20.2 Q 15,18.2 4,17.5 Z" fill="#00A859" />
            {/* Windows (warm glow during washing) */}
            <g fill="#F9E79F" stroke="#111" strokeWidth="0.5">
              <rect x="22" y="8" width="24" height="6.5" rx="0.5" />
              <rect x="52" y="8" width="24" height="6.5" rx="0.5" />
              <rect x="92" y="8" width="24" height="6.5" rx="0.5" />
              <rect x="122" y="8" width="24" height="6.5" rx="0.5" />
              <rect x="162" y="8" width="24" height="6.5" rx="0.5" />
            </g>
            <path d="M 23,8.5 L 30,8.5 L 24,14 Z" fill="rgba(255,255,255,0.4)" />
            <path d="M 53,8.5 L 60,8.5 L 54,14 Z" fill="rgba(255,255,255,0.4)" />
            <path d="M 93,8.5 L 100,8.5 L 94,14 Z" fill="rgba(255,255,255,0.4)" />
            
            {/* Front windshield and visor */}
            <path d="M 4,9 L 17,9 L 17,14 L 5,14 Z" fill="#111" />
            <path d="M 5,9.5 L 14,9.5 L 13,12.5 L 6,12.5 Z" fill="#1a252f" />
            <path d="M 12,9 L 17,9 C 19,9 20,10 20,12 C 20,13.5 19,14 17,14 L 13,14 Z" fill="none" stroke="#00FF66" strokeWidth="1" strokeLinecap="round" />
            {/* Front headlight glowing */}
            <circle cx="4" cy="16" r="1.2" fill="#FFF" />
            <circle cx="4" cy="16" r="3" fill="rgba(255,255,255,0.3)" />
          </g>

          {/* Spinning washing brushes overlay & water drops */}
          <g>
            {/* Water Spraying drops */}
            <circle className="water-drop" cx="490" cy="90" r="1.5" fill="#5DADE2" style={{ '--wx': '-15px', '--wy': '-12px' }} />
            <circle className="water-drop" cx="492" cy="100" r="1.2" fill="#5DADE2" style={{ '--wx': '-20px', '--wy': '10px' }} />
            <circle className="water-drop" cx="500" cy="95" r="1.8" fill="#5DADE2" style={{ '--wx': '18px', '--wy': '-8px' }} />
            <circle className="water-drop" cx="505" cy="115" r="1.5" fill="#5DADE2" style={{ '--wx': '12px', '--wy': '15px' }} />
            <circle className="water-drop" cx="495" cy="120" r="1.3" fill="#5DADE2" style={{ '--wx': '-10px', '--wy': '20px' }} />

            {/* Gantry supporting wash system */}
            <rect x="494" y="65" width="6" height="70" fill="url(#gantryBeam)" rx="1" />
            
            {/* Recycling system label (♻️ 水資源循環洗車) */}
            <text x="497" y="55" fill="#2ecc71" fontSize="5.5" fontWeight="bold" textAnchor="middle" style={{ fontFamily: 'sans-serif', letterSpacing: '0.2px' }}>♻️ 水資源循環洗車</text>
            <text x="497" y="61" fill="#2ecc71" fontSize="4.5" textAnchor="middle" style={{ fontFamily: 'sans-serif' }}>WATER RECYCLING</text>

            {/* Spin Brush 1 (Top of Train Body) */}
            <g className="wash-brush" style={{ transformOrigin: '497px 92px' }}>
              <rect x="490" y="80" width="14" height="24" fill="#3498DB" opacity="0.8" rx="3" />
              <line x1="497" y1="80" x2="497" y2="104" stroke="#FFF" strokeWidth="1" />
            </g>

            {/* Spin Brush 2 (Bottom of Train Body) */}
            <g className="wash-brush-2" style={{ transformOrigin: '497px 118px' }}>
              <rect x="490" y="106" width="14" height="24" fill="#2980B9" opacity="0.8" rx="3" />
              <line x1="497" y1="106" x2="497" y2="130" stroke="#FFF" strokeWidth="1" />
            </g>
          </g>

          {/* Washing Operator Silhouette & Control Panel */}
          <g transform="translate(460, 110)">
            <rect x="-12" y="-12" width="10" height="12" fill="#555" stroke="#333" strokeWidth="0.5" />
            <rect x="-10" y="-18" width="6" height="5" fill="#1abc9c" />
            <line x1="-3" y1="0" x2="-4" y2="5" stroke="#111" strokeWidth="1.5" />
            <line x1="-1" y1="0" x2="-1" y2="5" stroke="#111" strokeWidth="1.5" />
            <rect x="-4" y="-8" width="4" height="8" fill="#e67e22" rx="1" />
            <circle cx="-2" cy="-11" r="1.5" fill="#f1c40f" />
            <path d="M -3.5,-11.5 Q -2,-13 -0.5,-11.5 Z" fill="#f1c40f" />
          </g>


          {/* TRACK 3 (BOTTOM) - EMU800 Maintenance & Welding */}
          {/* Sleepers (Ties) */}
          <line x1="0" y1="175" x2="800" y2="175" stroke="#252528" strokeWidth="4" strokeDasharray="2, 6" />
          {/* Rails */}
          <line x1="0" y1="171" x2="800" y2="171" stroke="#55555d" strokeWidth="1" />
          <line x1="0" y1="172" x2="800" y2="172" stroke="#88888f" strokeWidth="0.5" />

          {/* EMU800 Train Car (High-detail) */}
          <g transform="translate(100, 148)">
            {/* Roof details */}
            <rect x="75" y="4" width="18" height="2" fill="#555" rx="0.5" />
            <rect x="145" y="4" width="18" height="2" fill="#555" rx="0.5" />
            
            {/* Bogies & Wheels */}
            <rect x="25" y="22" width="26" height="3" fill="#2c2c2c" rx="1" />
            <circle cx="29" cy="23.5" r="2.5" fill="#111" /> <circle cx="29" cy="23.5" r="1" fill="#7f8c8d" />
            <circle cx="47" cy="23.5" r="2.5" fill="#111" /> <circle cx="47" cy="23.5" r="1" fill="#7f8c8d" />
            
            <rect x="155" y="22" width="26" height="3" fill="#2c2c2c" rx="1" />
            <circle cx="159" cy="23.5" r="2.5" fill="#111" /> <circle cx="159" cy="23.5" r="1" fill="#7f8c8d" />
            <circle cx="177" cy="23.5" r="2.5" fill="#111" /> <circle cx="177" cy="23.5" r="1" fill="#7f8c8d" />

            {/* Main Body */}
            <path d="M 10,6 L 205,6 Q 208,6 208,8 L 208,21 L 10,21 Q 4,20 4,14 L 5,10 Q 6,6 10,6 Z" fill="url(#emu800Body)" />
            {/* Yellow front face of EMU800 */}
            <path d="M 4,14 L 18,14 L 18,21 L 10,21 Q 4,20 4,14 Z" fill="#F1C40F" />
            {/* Blue accent side stripe */}
            <rect x="18" y="16" width="190" height="2" fill="#2980B9" />
            {/* Windows */}
            <g fill="#151d24" stroke="#111" strokeWidth="0.5">
              <rect x="28" y="9" width="22" height="5" rx="0.5" />
              <rect x="58" y="9" width="22" height="5" rx="0.5" />
              <rect x="88" y="9" width="22" height="5" rx="0.5" />
              <rect x="118" y="9" width="22" height="5" rx="0.5" />
              <rect x="148" y="9" width="22" height="5" rx="0.5" />
              <rect x="178" y="9" width="22" height="5" rx="0.5" />
            </g>
            <path d="M 29,9.5 L 34,9.5 L 30,13.5 Z" fill="rgba(255,255,255,0.15)" />
            <path d="M 59,9.5 L 64,9.5 L 60,13.5 Z" fill="rgba(255,255,255,0.15)" />
            {/* Windshield */}
            <path d="M 4,9 L 16,9 L 16,13 L 5,13 Z" fill="#111" />
            <path d="M 5,9.5 L 13,9.5 L 12,12 L 6,12 Z" fill="#1a252f" />
          </g>

          {/* Spark generator (Welding Effect under EMU800 wheels/chassis) */}
          <g transform="translate(129, 172)">
            {/* Welding Glow */}
            <circle cx="0" cy="0" r="12" fill="rgba(0, 240, 255, 0.25)" />
            {/* Spark particles with CSS delay and offsets */}
            <circle className="spark-particle" cx="0" cy="0" r="1.2" fill="#00F0FF" style={{ '--dx': '-12px', '--dy': '-10px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="0.9" fill="#FFF" style={{ '--dx': '10px', '--dy': '-12px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#00F0FF" style={{ '--dx': '-4px', '--dy': '-6px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="0.8" fill="#FFF" style={{ '--dx': '8px', '--dy': '-8px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="1.2" fill="#00F0FF" style={{ '--dx': '-8px', '--dy': '-4px' }} />
          </g>

          {/* Welder Operator kneeling next to Track 3 */}
          <g transform="translate(142, 172)">
            <path d="M 0,-4 L 3,3 L 6,3" fill="none" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" />
            <path d="M -2,-12 L 2,-12 L 1,-4 L -1,-4 Z" fill="#e67e22" stroke="#d35400" strokeWidth="0.5" />
            <path d="M -2,-10 L -13,-4" fill="none" stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="0" cy="-15" r="2.5" fill="#f1c40f" />
            <rect x="-3" y="-17" width="3" height="4.5" fill="#2c3e50" rx="0.5" />
          </g>


          {/* Hangar Floor Warning Stripe Borders (Yellow & Black stripes) */}
          <rect x="0" y="243" width="800" height="7" fill="url(#warningStripes)" />
        </svg>
        </div>
      </div>
    </>
  );
}
