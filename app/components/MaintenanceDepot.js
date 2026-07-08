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
          </g>

          {/* Background Wall & Arch Structures */}
          <rect x="0" y="0" width="800" height="250" fill="url(#wallGradient)" />
          
          {/* Steel Beams (Arching structure) */}
          <g stroke="#1a252f" strokeWidth="4">
            <line x1="100" y1="0" x2="100" y2="250" />
            <line x1="300" y1="0" x2="300" y2="250" />
            <line x1="500" y1="0" x2="500" y2="250" />
            <line x1="700" y1="0" x2="700" y2="250" />
            {/* Cross beams */}
            <line x1="0" y1="50" x2="800" y2="50" strokeWidth="2" />
            <line x1="0" y1="120" x2="800" y2="120" strokeWidth="2" />
            {/* Diagonal trusses */}
            <path d="M 100,50 L 300,120 M 300,50 L 100,120 M 300,50 L 500,120 M 500,50 L 300,120 M 500,50 L 700,120 M 700,50 L 500,120" strokeWidth="1" stroke="#2c3e50" />
          </g>

          {/* Ceiling Lights */}
          <g className="hangar-light">
            <rect x="190" y="0" width="20" height="4" fill="#E0F7FA" />
            <polygon points="180,20 220,20 210,4 190,4" fill="rgba(224, 247, 250, 0.15)" />
            <rect x="390" y="0" width="20" height="4" fill="#E0F7FA" />
            <polygon points="380,20 420,20 410,4 390,4" fill="rgba(224, 247, 250, 0.15)" />
            <rect x="590" y="0" width="20" height="4" fill="#E0F7FA" />
            <polygon points="580,20 620,20 610,4 590,4" fill="rgba(224, 247, 250, 0.15)" />
          </g>

          {/* Overhead Gantry Crane */}
          <g className="overhead-crane">
            <rect x="0" y="30" width="40" height="8" fill="#e67e22" rx="2" />
            <rect x="15" y="38" width="10" height="15" fill="#34495e" />
            {/* Hook and wire */}
            <line x1="20" y1="53" x2="20" y2="80" stroke="#7f8c8d" strokeWidth="1.5" />
            <path d="M 17,80 L 23,80 L 23,82 Q 23,86 17,86 Q 16,86 16,85 L 18,85 Q 21,85 21,82 L 17,82 Z" fill="#f39c12" />
          </g>

          {/* Floor Perspectives (Darker shadow gradients) */}
          <rect x="0" y="240" width="800" height="160" fill="#0b0f14" />
          {/* Floor grid lines */}
          <path d="M 0,250 L 800,250 M 0,270 L 800,270 M 0,300 L 800,300 M 0,340 L 800,340" stroke="#111" strokeWidth="1" />

          {/* TRACK 1 (TOP) - Active Wash System */}
          <line x1="0" y1="135" x2="800" y2="135" stroke="#333" strokeWidth="3" />
          <line x1="0" y1="133" x2="800" y2="133" stroke="#555" strokeWidth="1" />

          {/* Slowly moving EMU900 passing through wash */}
          <g className="train-washing">
            {/* EMU900 Back Cab */}
            <path d="M 40,84 L 200,84 L 200,131 L 40,131 C 20,131 5,115 5,100 C 5,90 20,84 40,84 Z" fill="url(#emu900Body)" />
            {/* Top green roofline stripe */}
            <rect x="40" y="86" width="160" height="2" fill="#00A859" />
            {/* Bottom green wave belt */}
            <path d="M 12,118 Q 20,118 40,115 L 200,115" fill="none" stroke="#00A859" strokeWidth="3" strokeLinecap="round" />
            
            {/* Windows & Doors */}
            <g fill="#151d24" stroke="#111" strokeWidth="0.5">
              {/* Doors */}
              <rect x="80" y="93" width="16" height="34" rx="1" />
              <line x1="88" y1="93" x2="88" y2="127" stroke="#333" strokeWidth="0.5" />
              <rect x="140" y="93" width="16" height="34" rx="1" />
              <line x1="148" y1="93" x2="148" y2="127" stroke="#333" strokeWidth="0.5" />
              
              {/* Windows */}
              <rect x="50" y="95" width="20" height="15" rx="2" />
              <rect x="106" y="95" width="24" height="15" rx="2" />
              <rect x="166" y="95" width="24" height="15" rx="2" />
            </g>
            <path d="M 52,96 L 58,96 L 54,108 Z" fill="rgba(255,255,255,0.2)" />
            <path d="M 108,96 L 114,96 L 110,108 Z" fill="rgba(255,255,255,0.2)" />
            <path d="M 168,96 L 174,96 L 170,108 Z" fill="rgba(255,255,255,0.2)" />
            
            {/* Back windshield */}
            <path d="M 35,89 L 45,89 L 45,105 L 18,105 C 18,100 25,89 35,89 Z" fill="#111" />
            <path d="M 34,91 L 43,91 L 43,103 L 20,103 C 21,98 27,91 34,91 Z" fill="#1a252f" />
            {/* Back red taillight */}
            <circle cx="15" cy="115" r="1.5" fill="#e74c3c" />
            <circle cx="15" cy="115" r="3" fill="rgba(231, 76, 60, 0.4)" />
          </g>

          {/* Washing System Overlay */}
          <g>
            <circle className="water-drop" cx="490" cy="90" r="1.5" fill="#5DADE2" style={{ '--wx': '-25px', '--wy': '-15px' }} />
            <circle className="water-drop" cx="492" cy="100" r="1.2" fill="#5DADE2" style={{ '--wx': '-30px', '--wy': '15px' }} />
            <circle className="water-drop" cx="500" cy="95" r="1.8" fill="#5DADE2" style={{ '--wx': '25px', '--wy': '-10px' }} />
            <circle className="water-drop" cx="505" cy="115" r="1.5" fill="#5DADE2" style={{ '--wx': '20px', '--wy': '20px' }} />

            <rect x="494" y="65" width="6" height="70" fill="url(#gantryBeam)" rx="1" />
            
            <text x="497" y="55" fill="#2ecc71" fontSize="5.5" fontWeight="bold" textAnchor="middle">♻️ 水資源循環洗車</text>
            <text x="497" y="61" fill="#2ecc71" fontSize="4.5" textAnchor="middle">WATER RECYCLING</text>

            <g className="wash-brush" style={{ transformOrigin: '497px 92px' }}>
              <rect x="490" y="80" width="14" height="24" fill="#3498DB" opacity="0.8" rx="3" />
              <line x1="497" y1="80" x2="497" y2="104" stroke="#FFF" strokeWidth="1" />
            </g>

            <g className="wash-brush-2" style={{ transformOrigin: '497px 118px' }}>
              <rect x="490" y="106" width="14" height="24" fill="#2980B9" opacity="0.8" rx="3" />
              <line x1="497" y1="106" x2="497" y2="130" stroke="#FFF" strokeWidth="1" />
            </g>
          </g>

          {/* TRACK 2 (MIDDLE) - Inspection */}
          <line x1="0" y1="105" x2="800" y2="105" stroke="#222" strokeWidth="2" />
          <line x1="0" y1="104" x2="800" y2="104" stroke="#444" strokeWidth="1" />

          <g transform="translate(600, 80)">
            <path d="M 0,6 L -160,6 L -160,24 L 0,24 C 20,24 35,15 35,6 Z" fill="url(#emu900Body)" />
            <rect x="-160" y="7.5" width="160" height="1.5" fill="#00A859" />
            <path d="M -160,19 Q -100,19 -40,19 L -10,19 Q 15,19 25,16" fill="none" stroke="#00A859" strokeWidth="2.5" strokeLinecap="round" />
            
            <g fill="#151d24" stroke="#111" strokeWidth="0.5">
              <rect x="-140" y="10" width="12" height="11" rx="1.5" />
              <rect x="-100" y="10" width="18" height="11" rx="1.5" />
              <rect x="-60" y="10" width="18" height="11" rx="1.5" />
            </g>
            <path d="M 4,9 L 17,9 L 17,14 L 5,14 Z" fill="#111" />
            <path d="M 12,9 L 17,9 C 19,9 20,10 20,12 C 20,13.5 19,14 17,14 L 13,14 Z" fill="none" stroke="#00FF66" strokeWidth="1" strokeLinecap="round" />
          </g>


          {/* TRACK 3 (BOTTOM) - EMU800 Maintenance & Welding */}
          <line x1="0" y1="210" x2="800" y2="210" stroke="#252528" strokeWidth="4" strokeDasharray="2, 6" />
          <line x1="0" y1="206" x2="800" y2="206" stroke="#55555d" strokeWidth="1.5" />
          <line x1="0" y1="207" x2="800" y2="207" stroke="#88888f" strokeWidth="1" />

          {/* Upgraded EMU800 Train Car */}
          <g transform="translate(100, 168)">
            {/* Pantograph */}
            <rect x="75" y="-12" width="20" height="2" fill="#555" />
            <path d="M 77,-12 L 85,-22 L 93,-12" fill="none" stroke="#777" strokeWidth="1.5" />
            <line x1="80" y1="-22" x2="90" y2="-22" stroke="#555" strokeWidth="2" />
            
            <rect x="145" y="4" width="18" height="2" fill="#555" rx="0.5" />
            
            {/* Detailed Bogies */}
            <g fill="#2c2c2c">
              <rect x="25" y="32" width="40" height="6" rx="2" />
              <rect x="155" y="32" width="40" height="6" rx="2" />
            </g>
            <circle cx="32" cy="35" r="4.5" fill="#111" /> <circle cx="32" cy="35" r="2" fill="#7f8c8d" />
            <circle cx="58" cy="35" r="4.5" fill="#111" /> <circle cx="58" cy="35" r="2" fill="#7f8c8d" />
            <circle cx="162" cy="35" r="4.5" fill="#111" /> <circle cx="162" cy="35" r="2" fill="#7f8c8d" />
            <circle cx="188" cy="35" r="4.5" fill="#111" /> <circle cx="188" cy="35" r="2" fill="#7f8c8d" />

            {/* Main Body */}
            <path d="M 10,6 L 225,6 Q 228,6 228,8 L 228,33 L 10,33 Q 2,30 2,18 L 3,12 Q 4,6 10,6 Z" fill="url(#emu800Body)" />
            {/* Yellow front face of EMU800 */}
            <path d="M 2,18 L 18,18 L 18,33 L 10,33 Q 2,30 2,18 Z" fill="#F1C40F" />
            {/* Blue and yellow stripes */}
            <rect x="18" y="24" width="210" height="3" fill="#2980B9" />
            <rect x="18" y="27" width="210" height="1.5" fill="#F1C40F" />

            {/* Doors */}
            <g fill="#7F8C8D">
               <rect x="45" y="10" width="16" height="22" rx="1" />
               <line x1="53" y1="10" x2="53" y2="32" stroke="#333" strokeWidth="0.5" />
               <rect x="115" y="10" width="16" height="22" rx="1" />
               <line x1="123" y1="10" x2="123" y2="32" stroke="#333" strokeWidth="0.5" />
               <rect x="185" y="10" width="16" height="22" rx="1" />
               <line x1="193" y1="10" x2="193" y2="32" stroke="#333" strokeWidth="0.5" />
            </g>

            {/* Windows */}
            <g fill="#151d24" stroke="#111" strokeWidth="0.5">
              <rect x="25" y="12" width="15" height="10" rx="1" />
              <rect x="68" y="12" width="40" height="10" rx="1" />
              <rect x="138" y="12" width="40" height="10" rx="1" />
              <rect x="208" y="12" width="15" height="10" rx="1" />
            </g>
            <path d="M 27,13 L 34,13 L 29,20 Z" fill="rgba(255,255,255,0.15)" />
            <path d="M 70,13 L 80,13 L 73,20 Z" fill="rgba(255,255,255,0.15)" />
            
            {/* Windshield */}
            <path d="M 2,12 L 15,12 L 15,17 L 3,17 Z" fill="#111" />
            <path d="M 3,12.5 L 12,12.5 L 11,16 L 4,16 Z" fill="#1a252f" />
          </g>

          {/* Spark generator (Welding Effect under EMU800) */}
          <g transform="translate(135, 206)">
            <circle cx="0" cy="0" r="15" fill="rgba(0, 240, 255, 0.25)" />
            <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#00F0FF" style={{ '--dx': '-20px', '--dy': '-15px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="1.2" fill="#FFF" style={{ '--dx': '15px', '--dy': '-18px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="2.0" fill="#00F0FF" style={{ '--dx': '-10px', '--dy': '-10px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="1.0" fill="#FFF" style={{ '--dx': '12px', '--dy': '-12px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#00F0FF" style={{ '--dx': '-15px', '--dy': '-5px' }} />
            <circle className="spark-particle" cx="0" cy="0" r="1.8" fill="#FFF" style={{ '--dx': '8px', '--dy': '-20px' }} />
          </g>

          {/* Detailed Welder Operator kneeling next to Track 3 */}
          <g transform="translate(150, 206)">
            {/* Back leg kneeling */}
            <path d="M 5,-4 L 8,4 L 11,4" fill="none" stroke="#1f2c3d" strokeWidth="2.5" strokeLinecap="round" />
            {/* Front leg planted */}
            <path d="M 0,-4 L -2,3 L 1,3" fill="none" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />
            {/* Torso (Orange safety suit) */}
            <path d="M -3,-14 L 3,-15 L 5,-4 L -2,-4 Z" fill="#e67e22" stroke="#d35400" strokeWidth="0.5" />
            {/* Tool/Welding torch in hands */}
            <line x1="-12" y1="-2" x2="-15" y2="0" stroke="#7f8c8d" strokeWidth="1" />
            {/* Left arm holding torch */}
            <path d="M 0,-12 L -7,-5 L -12,-2" fill="none" stroke="#d35400" strokeWidth="2" strokeLinecap="round" />
            {/* Right arm helping hold */}
            <path d="M -2,-13 L -9,-6 L -12,-2" fill="none" stroke="#e67e22" strokeWidth="1.5" strokeLinecap="round" />
            {/* Head and welding mask */}
            <circle cx="1" cy="-17" r="3" fill="#f1c40f" />
            <rect x="-4" y="-20" width="5" height="7" fill="#111" rx="1" />
            {/* Glowing welding arc reflection on mask */}
            <rect x="-4" y="-18" width="2" height="3" fill="#00F0FF" opacity="0.6" />
          </g>

          {/* Hangar Floor Warning Stripe Borders */}
          <rect x="0" y="380" width="800" height="20" fill="url(#warningStripes)" />
        </svg>
      </div>
    </>
  );
}
