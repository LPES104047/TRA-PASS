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
          transform-origin: 397px 92px;
        }
        .wash-brush-2 {
          animation: spinBrush 0.6s infinite linear;
          transform-origin: 397px 118px;
        }

        @keyframes spinBrush {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 💦 洗車噴水滴 */
        .water-drop {
          animation: waterSpray 0.8s infinite ease-in;
          transform-origin: center;
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
          <rect x="0" y="42" width="800" height="2" fill="#555" />
          <rect x="0" y="44" width="800" height="1" fill="#777" />
          
          {/* EMU3000 Train Car (3D design) */}
          <g transform="translate(220, 20)">
            {/* Under-frame & Wheels */}
            <rect x="15" y="21" width="190" height="3" fill="#222" />
            <circle cx="35" cy="24" r="3.5" fill="#333" />
            <circle cx="50" cy="24" r="3.5" fill="#333" />
            <circle cx="170" cy="24" r="3.5" fill="#333" />
            <circle cx="185" cy="24" r="3.5" fill="#333" />

            {/* Main Body */}
            <path d="M 10,6 L 210,6 Q 212,6 212,8 L 212,21 L 10,21 Q 5,20 5,14 L 6,10 Q 7,6 10,6 Z" fill="url(#emu3000Body)" />
            {/* Matte black top window mask */}
            <path d="M 9,7 L 212,7 L 212,13 L 9,13 Z" fill="#1A1A1A" opacity="0.95" />
            {/* Red accent line of EMU3000 */}
            <rect x="15" y="14" width="197" height="1.2" fill="#E74C3C" />
            {/* Windows glow */}
            <rect x="25" y="8" width="22" height="4" fill="#333" rx="0.5" />
            <rect x="52" y="8" width="22" height="4" fill="#333" rx="0.5" />
            <rect x="85" y="8" width="22" height="4" fill="#333" rx="0.5" />
            <rect x="112" y="8" width="22" height="4" fill="#333" rx="0.5" />
            <rect x="145" y="8" width="22" height="4" fill="#333" rx="0.5" />
            <rect x="172" y="8" width="22" height="4" fill="#333" rx="0.5" />
            {/* Windshield */}
            <path d="M 6,10 L 15,10 L 15,13 L 9,13 Z" fill="#2C3E50" stroke="#000" strokeWidth="0.5" />
            <path d="M 7,10 L 12,10 L 10,13 L 8,13 Z" fill="rgba(255,255,255,0.18)" />
          </g>


          {/* TRACK 2 (MIDDLE) - EMU900 Washing Facility */}
          <rect x="0" y="107" width="800" height="2" fill="#555" />
          <rect x="0" y="109" width="800" height="1" fill="#777" />
          
          {/* EMU900 Train in Washing (undergoing wash Move) */}
          <g className="depot-emu900" transform="translate(280, 85)">
            {/* Under-frame & Wheels */}
            <rect x="15" y="21" width="190" height="3" fill="#222" />
            <circle cx="35" cy="24" r="3.5" fill="#333" />
            <circle cx="50" cy="24" r="3.5" fill="#333" />
            <circle cx="170" cy="24" r="3.5" fill="#333" />
            <circle cx="185" cy="24" r="3.5" fill="#333" />

            {/* Main Body */}
            <path d="M 10,6 L 210,6 Q 212,6 212,8 L 212,21 L 10,21 Q 5,20 5,14 L 6,10 Q 7,6 10,6 Z" fill="url(#emu900Body)" />
            {/* Green smile wave line */}
            <path d="M 5,17 Q 20,17 40,19 L 212,19 L 212,20.5 L 40,20.5 Q 20,18.5 5,18 Z" fill="#00A859" />
            {/* Windows (warm glow during washing) */}
            <rect x="25" y="9" width="24" height="6" fill="#F9E79F" rx="1" stroke="#333" strokeWidth="0.5" />
            <rect x="55" y="9" width="24" height="6" fill="#F9E79F" rx="1" stroke="#333" strokeWidth="0.5" />
            <rect x="95" y="9" width="24" height="6" fill="#F9E79F" rx="1" stroke="#333" strokeWidth="0.5" />
            <rect x="125" y="9" width="24" height="6" fill="#F9E79F" rx="1" stroke="#333" strokeWidth="0.5" />
            <rect x="165" y="9" width="24" height="6" fill="#F9E79F" rx="1" stroke="#333" strokeWidth="0.5" />
            {/* Front windshield and visor */}
            <path d="M 5,9 L 18,9 L 18,14 L 6,14 Z" fill="#1A1A1A" />
            <path d="M 6,10 L 15,10 L 14,13 L 7,13 Z" fill="#2C3E50" />
            {/* Front light */}
            <circle cx="5" cy="16" r="1.5" fill="#FFF" />
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


          {/* TRACK 3 (BOTTOM) - EMU800 Maintenance & Welding */}
          <rect x="0" y="172" width="800" height="2" fill="#555" />
          <rect x="0" y="174" width="800" height="1" fill="#777" />

          {/* EMU800 Train Car */}
          <g transform="translate(100, 150)">
            {/* Under-frame & Wheels */}
            <rect x="15" y="21" width="190" height="3" fill="#222" />
            <circle cx="35" cy="24" r="3.5" fill="#333" />
            <circle cx="50" cy="24" r="3.5" fill="#333" />
            <circle cx="170" cy="24" r="3.5" fill="#333" />
            <circle cx="185" cy="24" r="3.5" fill="#333" />

            {/* Main Body */}
            <path d="M 10,6 L 210,6 Q 212,6 212,8 L 212,21 L 10,21 Q 5,20 5,14 L 6,10 Q 7,6 10,6 Z" fill="url(#emu800Body)" />
            {/* Yellow front face of EMU800 */}
            <path d="M 5,14 L 20,14 L 20,21 L 10,21 Q 5,20 5,14 Z" fill="#F1C40F" />
            {/* Blue accent side stripe */}
            <rect x="20" y="16" width="192" height="2" fill="#2980B9" />
            {/* Windows (Dark) */}
            <rect x="30" y="9" width="22" height="5" fill="#1A1A1A" rx="0.5" />
            <rect x="60" y="9" width="22" height="5" fill="#1A1A1A" rx="0.5" />
            <rect x="90" y="9" width="22" height="5" fill="#1A1A1A" rx="0.5" />
            <rect x="120" y="9" width="22" height="5" fill="#1A1A1A" rx="0.5" />
            <rect x="150" y="9" width="22" height="5" fill="#1A1A1A" rx="0.5" />
            <rect x="180" y="9" width="22" height="5" fill="#1A1A1A" rx="0.5" />
            {/* Windshield */}
            <path d="M 5,9 L 18,9 L 18,13 L 6,13 Z" fill="#1A1A1A" />
            <path d="M 6,10 L 15,10 L 14,12 L 7,12 Z" fill="#34495E" />
          </g>

          {/* Spark generator (Welding Effect under EMU800 wheels/chassis) */}
          <g transform="translate(220, 172)">
            {/* Welding Glow */}
            <circle cx="0" cy="2" r="10" fill="rgba(241, 196, 15, 0.15)" />
            {/* Spark particles with CSS delay and offsets */}
            <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#F39C12" style={{ '--dx': '-10px', '--dy': '-12px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="1.2" fill="#F1C40F" style={{ '--dx': '8px', '--dy': '-15px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="2.0" fill="#FFF" style={{ '--dx': '-4px', '--dy': '-8px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="1.0" fill="#E67E22" style={{ '--dx': '12px', '--dy': '-10px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#FFF" style={{ '--dx': '-12px', '--dy': '-4px' }} />
          </g>


          {/* Hangar Floor Warning Stripe Borders (Yellow & Black stripes) */}
          <rect x="0" y="243" width="800" height="7" fill="url(#warningStripes)" />
        </svg>
        </div>
      </div>
    </>
  );
}
