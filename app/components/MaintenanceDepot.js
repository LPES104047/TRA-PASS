import React from 'react';

// ============================================================================
// HIGH-DETAIL RAILWAY VECTOR ASSET SUBCOMPONENTS (STATION TRAIN SPECIFICATIONS)
// ============================================================================

const TrainBogie = ({ x }) => (
  <g>
    {/* Bogie frame */}
    <rect x={x - 25} y={188} width={50} height={8} fill="#333" rx={2} />
    {/* Left wheel */}
    <circle cx={x - 15} cy={198} r={7} fill="#111" stroke="#555" strokeWidth={1.5} />
    <circle cx={x - 15} cy={198} r={3} fill="#7F8C8D" />
    {/* Right wheel */}
    <circle cx={x + 15} cy={198} r={7} fill="#111" stroke="#555" strokeWidth={1.5} />
    <circle cx={x + 15} cy={198} r={3} fill="#7F8C8D" />
  </g>
);

const TrainPantograph = ({ x }) => (
  <g stroke="#7F8C8D" strokeWidth={2} fill="none">
    <rect x={x - 20} y="46" width="40" height="4" fill="#555" stroke="none" />
    <line x1={x - 15} y1="46" x2={x} y2="30" />
    <line x1={x} y1="30" x2={x + 15} y2="46" />
    <line x1={x} y1="30" x2={x - 10} y2="22" />
    <line x1={x - 10} y1="22" x2={x + 10} y2="22" />
    <line x1={x - 15} y1="22" x2={x + 15} y2="22" strokeWidth={3} />
  </g>
);

const GangwayConnector = () => (
  <g>
    {/* Dark inner connector */}
    <rect x="0" y="54" width="10" height="132" fill="#222" />
    {/* Outer bellows line */}
    <rect x="2" y="52" width="6" height="136" fill="#111" rx="1" />
    {/* Horizontal bellows rib lines */}
    <line x1="0" y1="65" x2="10" y2="65" stroke="#333" strokeWidth="1.5" />
    <line x1="0" y1="85" x2="10" y2="85" stroke="#333" strokeWidth="1.5" />
    <line x1="0" y1="105" x2="10" y2="105" stroke="#333" strokeWidth="1.5" />
    <line x1="0" y1="125" x2="10" y2="125" stroke="#333" strokeWidth="1.5" />
    <line x1="0" y1="145" x2="10" y2="145" stroke="#333" strokeWidth="1.5" />
  </g>
);

const PassengerCar = ({ model }) => {
  const isEMU3000 = model === 'emu3000';
  const isTaroko = model === 'emu900'; // We map emu900 to Taroko Express
  const isEMU800 = model === 'emu800';

  const bodyFill = isEMU3000 ? 'url(#emu3000Body)' : isTaroko ? 'url(#hayabusaWhite)' : 'url(#emu800Body)';
  const windowFill = isTaroko ? 'url(#cabinGlowCool)' : 'url(#cabinGlowWarm)';
  const isDarkWindows = isEMU800; // EMU800 windows glow but cabs are dark

  return (
    <g>
      {/* Passenger Car Body */}
      {isTaroko ? (
        <>
          {/* Lower body (Hiun White) */}
          <rect x="0" y="50" width="440" height="140" fill={bodyFill} rx={6} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
          {/* Upper body (Tokiwa Green) */}
          <path d="M 0,50 L 440,50 L 440,136 L 0,136 Z" fill="url(#hayabusaGreen)" />
          {/* Azalea Pink Stripe */}
          <rect x="0" y="136" width="440" height="4.5" fill="#E93B8E" />
          {/* Shinkansen grey/silver metal roof panel */}
          <path d="M 0,50 L 440,50 L 440,65 L 0,65 Z" fill="#2C3E50" opacity="0.3" />
        </>
      ) : (
        <rect x="0" y="50" width="440" height="140" fill={bodyFill} rx={6} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
      )}
      
      {/* EMU3000 Black Window Band */}
      {isEMU3000 && <rect x="0" y="78" width="440" height="62" fill="#111" />}
      
      {/* Stripes */}
      {isEMU800 && (
        <>
          <rect x="0" y="58" width="440" height="4" fill="#2980B9" />
          <rect x="0" y="144" width="440" height="8" fill="#2980B9" />
          <rect x="0" y="152" width="440" height="2" fill="#F1C40F" />
        </>
      )}
      {isEMU3000 && (
        <rect x="0" y="144" width="440" height="3" fill="#e60012" />
      )}

      {/* Under-chassis equipment details */}
      <g fill="#212529">
        <rect x="95" y="190" width="70" height="12" rx="1" />
        <rect x="180" y="190" width="80" height="10" rx="1" />
        <rect x="275" y="190" width="60" height="14" rx="2" />
      </g>
      <circle cx="130" cy="196" r="4" fill="#495057" />
      <circle cx="220" cy="195" r="3" fill="#495057" />

      {/* Pantographs */}
      {isEMU3000 && (
        <>
          <TrainPantograph x={80} />
          <TrainPantograph x={360} />
        </>
      )}
      {isTaroko && <TrainPantograph x={220} />}
      {isEMU800 && <TrainPantograph x={220} />}

      {/* Doors - Model Specific */}
      {isEMU3000 && (
        // EMU3000: 2 premium single glass doors at the ends
        [20, 370].map((pos, idx) => (
          <g key={idx}>
            <rect x={pos} y={75} width={50} height={112} fill="#111" rx={2} />
            {/* Single sliding door glass window */}
            <rect x={pos + 8} y={83} width={34} height={52} fill="#222" rx={2} stroke="#333" strokeWidth={1} />
            <path d={`M ${pos + 8},85 L ${pos + 25},85 L ${pos + 8},110 Z`} fill="rgba(255,255,255,0.12)" />
            {/* Chrome door handle */}
            <rect x={pos + 42} y={125} width={3} height={15} fill="#7F8C8D" rx={0.5} />
          </g>
        ))
      )}

      {isTaroko && (
        // Shinkansen E5: 2 single narrow end doors with split color
        [15, 395].map((pos, idx) => (
          <g key={idx}>
            <rect x={pos} y={75} width={30} height={112} fill="url(#hayabusaWhite)" rx={1} stroke="#4A5668" strokeWidth={0.8} />
            <path d={`M ${pos},75 L ${pos+30},75 L ${pos+30},136 L ${pos},136 Z`} fill="url(#hayabusaGreen)" />
            <rect x={pos} y={136} width={30} height={5} fill="#E93B8E" />
            <rect x={pos + 6} y={83} width={18} height={40} fill="#1A1A1A" rx={1} />
            <line x1={pos + 15} y1={75} x2={pos + 15} y2={187} stroke="#4A5668" strokeWidth={0.8} opacity="0.5" />
          </g>
        ))
      )}

      {isEMU800 && (
        // EMU800: 3 commuter doors per car
        [30, 195, 360].map((pos, idx) => (
          <g key={idx}>
            <rect x={pos} y={75} width={50} height={112} fill="#BDC3C7" rx={2} stroke="#7F8C8D" strokeWidth={0.5} />
            <rect x={pos + 4} y={83} width={19} height={52} fill="#1A1A1A" rx={2} />
            <path d={`M ${pos + 4},85 L ${pos + 15},85 L ${pos + 4},110 Z`} fill="rgba(255,255,255,0.12)" />
            <rect x={pos + 27} y={83} width={19} height={52} fill="#1A1A1A" rx={2} />
            <path d={`M ${pos + 27},85 L ${pos + 38},85 L ${pos + 27},110 Z`} fill="rgba(255,255,255,0.12)" />
            <line x1={pos + 25} y1={75} x2={pos + 25} y2={187} stroke="#333" strokeWidth={1} />
            <circle cx={pos + 25} cy={70} r={2} fill="#FFD700" />
          </g>
        ))
      )}

      {/* Windows - Model Specific */}
      {isEMU3000 && (
        // EMU3000: 3 very large panoramic windows
        [85, 180, 275].map((pos, idx) => (
          <g key={idx}>
            <rect x={pos} y={83} width={80} height={52} fill={windowFill} rx={4} stroke="#222" strokeWidth={1.5} />
            {/* Seat silhouettes */}
            <rect x={pos + 8} y={105} width={12} height="24" fill="#455A64" opacity="0.45" rx="1.5" />
            <rect x={pos + 32} y={105} width={12} height="24" fill="#455A64" opacity="0.45" rx="1.5" />
            <rect x={pos + 56} y={105} width={12} height="24" fill="#455A64" opacity="0.45" rx="1.5" />
            <path d={`M ${pos + 4},85 L ${pos + 40},85 L ${pos + 4},120 Z`} fill="rgba(255,255,255,0.12)" />
          </g>
        ))
      )}

      {isTaroko && (
        // Shinkansen E5: 7 small windows inside the green section
        [65, 115, 165, 215, 265, 315, 365].map((pos, idx) => (
          <g key={idx}>
            <rect x={pos} y={80} width={22} height={24} fill={windowFill} rx={3} stroke="#1A1A1A" strokeWidth={1.5} />
            {/* Passenger seat silhouette */}
            <rect x={pos + 4} y={93} width={5} height="8" fill="#455A64" opacity="0.4" rx="0.5" />
            <rect x={pos + 13} y={93} width={5} height="8" fill="#455A64" opacity="0.4" rx="0.5" />
          </g>
        ))
      )}

      {isEMU800 && (
        // EMU800: 4 double-pane windows
        [95, 142, 258, 305].map((pos, idx) => (
          <g key={idx}>
            <rect x={pos} y={83} width={42} height={52} fill={isDarkWindows ? "url(#cabinGlowWarm)" : windowFill} rx={4} stroke="#BDC3C7" strokeWidth={1.5} />
            {/* Center glass divider for double-pane look */}
            <line x1={pos + 21} y1={83} x2={pos + 21} y2={135} stroke="#BDC3C7" strokeWidth={1.5} />
            <rect x={pos + 4} y={105} width={7} height="24" fill="#5D4037" opacity="0.45" rx="1.5" />
            <rect x={pos + 29} y={105} width={7} height="24" fill="#5D4037" opacity="0.45" rx="1.5" />
            <path d={`M ${pos + 2},85 L ${pos + 18},85 L ${pos + 2},110 Z`} fill="rgba(255,255,255,0.12)" />
          </g>
        ))
      )}

      {/* Bogies and Wheels */}
      <TrainBogie x={80} />
      <TrainBogie x={360} />
    </g>
  );
};

const TrainCab = ({ model, side }) => {
  const isEMU3000 = model === 'emu3000';
  const isTaroko = model === 'emu900'; // emu900 maps to Taroko
  const isEMU800 = model === 'emu800';

  const bodyFill = isEMU3000 ? 'url(#emu3000Body)' : isTaroko ? 'url(#hayabusaWhite)' : 'url(#emu800Body)';
  const windowFill = isTaroko ? 'url(#cabinGlowCool)' : 'url(#cabinGlowWarm)';
  
  // Driving cabs are dark when off-duty/parked/repaired
  const isDarkCabs = isEMU800 || isEMU3000;

  // Headlights & Tail lights mapping
  const showHeadlights = (isTaroko && side === 'right') || (isEMU3000 && side === 'left');
  const showTaillights = (isTaroko && side === 'left') || (isEMU3000 && side === 'right');

  return (
    <g>
      {/* Cab Body Shape (EMU3000 slanted, EMU800 round front, Taroko sleek white bullet front) */}
      {isEMU3000 ? (
        <path d="M 0,50 L 220,50 L 335,115 L 335,175 L 285,190 L 0,190 Z" fill={bodyFill} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      ) : isEMU800 ? (
        <path d="M 0,50 L 170,50 C 230,50 300,70 320,115 C 332,145 315,180 290,190 L 0,190 Z" fill={bodyFill} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      ) : (
        <>
          {/* Shinkansen E5 Series smooth duckbill nose body base (Hiun White) */}
          <path d="M 0,50 L 120,50 C 160,50 185,72 215,95 C 245,100 285,135 335,160 C 330,165 315,178 285,183 L 0,183 Z" fill={bodyFill} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
          {/* Upper body Tokiwa Green paint overlay */}
          <path d="M 0,50 L 120,50 C 160,50 185,72 215,95 C 245,100 285,135 335,160 C 320,154 300,150 280,147 C 235,147 205,136 175,136 L 0,136 Z" fill="url(#hayabusaGreen)" />
          {/* Azalea Pink Stripe running along the boundary */}
          <path d="M 0,136 L 175,136 C 205,136 235,147 280,147 C 300,147 320,154 335,160" fill="none" stroke="#E93B8E" strokeWidth="5.5" strokeLinecap="round" />
          {/* Aerodynamic wing/fender line below cockpit */}
          <path d="M 215,114 Q 250,118 280,134" fill="none" stroke="#00796B" strokeWidth="1.5" opacity="0.6" />
        </>
      )}
      
      {/* EMU3000 Black Window Band */}
      {isEMU3000 && (
        <>
          <rect x="0" y="78" width="220" height="62" fill="#111" />
          <rect x="0" y="144" width="220" height="3" fill="#e60012" />
        </>
      )}

      {/* Stripes */}
      {isTaroko && (
        <>
          {/* Driver's side window */}
          <rect x="145" y="85" width="18" height="24" fill="#1A1A1A" rx={1} stroke="#111" strokeWidth={1} />
          {/* Hayabusa Falcon emblem on the green side panel */}
          <g transform="translate(60, 95)" opacity="0.95">
            <path d="M 0,10 L 15,2 L 30,12 L 12,20 Z" fill="#FFFFFF" />
            <path d="M 5,12 L 12,9 L 20,15 Z" fill="#E93B8E" />
          </g>
        </>
      )}
      {isEMU800 && (
        <>
          <rect x="0" y="58" width="170" height="4" fill="#2980B9" />
          {/* Yellow face paint */}
          <path d="M 160,50 L 170,50 C 230,50 300,70 320,115 C 332,145 315,180 290,190 L 160,190 Z" fill="#F1C40F" />
          <path d="M 0,144 L 160,144 Q 210,144 240,153 Q 275,162 298,150" fill="none" stroke="#2980B9" strokeWidth="8" strokeLinecap="round" />
          <path d="M 0,152 L 160,152 Q 210,152 240,161 Q 275,170 298,158" fill="none" stroke="#F1C40F" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* Under-chassis equipment details */}
      <g fill="#212529">
        <rect x="95" y="190" width="70" height="12" rx="1" />
      </g>
      <circle cx="130" cy="196" r="4" fill="#495057" />

      {/* Cab Passenger Door */}
      {isEMU3000 ? (
        <g transform="translate(125, 0)">
          <rect x="0" y="75" width="50" height="112" fill="#111" rx={2} />
          <rect x="8" y="83" width="34" height="52" fill="#222" rx={2} stroke="#333" />
          <path d="M 8,85 L 25,85 L 8,110 Z" fill="rgba(255,255,255,0.12)" />
        </g>
      ) : isTaroko ? (
        <g transform="translate(110, 0)">
          <rect x="0" y="75" width="30" height="112" fill="url(#hayabusaWhite)" rx={1} stroke="#4A5668" strokeWidth={0.8} />
          <path d="M 0,75 L 30,75 L 30,136 L 0,136 Z" fill="url(#hayabusaGreen)" />
          <rect x="0" y="136" width="30" height="5" fill="#E93B8E" />
          <rect x="6" y="83" width="18" height="40" fill="#1A1A1A" rx={1} />
        </g>
      ) : (
        <g transform="translate(110, 0)">
          <rect x="0" y="75" width="50" height="112" fill="#BDC3C7" rx={2} stroke="#7F8C8D" />
          <rect x="4" y="83" width="19" height="52" fill="#1A1A1A" rx={2} />
          <path d="M 4,85 L 15,85 L 4,110 Z" fill="rgba(255,255,255,0.12)" />
          <rect x="27" y="83" width="19" height="52" fill="#1A1A1A" rx={2} />
          <path d="M 27,85 L 38,85 L 27,110 Z" fill="rgba(255,255,255,0.12)" />
          <line x1="25" y1="75" x2="25" y2="187" stroke="#333" strokeWidth={1} />
        </g>
      )}

      {/* Cab Passenger Windows */}
      {isEMU3000 ? (
        <g transform="translate(30, 0)">
          <rect x="0" y="83" width="80" height="52" fill="#151d24" rx={4} stroke="#222" strokeWidth={1.5} />
        </g>
      ) : isTaroko ? (
        <g transform="translate(0, 0)">
          <rect x="35" y="80" width="22" height="24" fill={windowFill} rx={3} stroke="#1A1A1A" strokeWidth={1.5} />
          <rect x="70" y="80" width="22" height="24" fill={windowFill} rx={3} stroke="#1A1A1A" strokeWidth={1.5} />
        </g>
      ) : (
        <g transform="translate(30, 0)">
          <rect x="0" y="83" width="42" height="52" fill="#151d24" rx={4} stroke="#BDC3C7" strokeWidth={1.5} />
          <line x1="21" y1="83" x2="21" y2="135" stroke="#BDC3C7" strokeWidth={1.5} />
        </g>
      )}

      {/* Driver Windshield & Front Mask */}
      <g>
        {isEMU3000 ? (
          <>
            <path d="M 200,58 L 222,58 L 333,115 L 333,173 L 283,173 L 200,173 Z" fill="#111" />
            <path d="M 215,70 L 275,70 L 315,110 L 255,110 Z" fill="rgba(255,255,255,0.15)" />
          </>
        ) : isEMU800 ? (
          <>
            <path d="M 180,62 L 240,62 C 265,62 288,75 298,102 L 245,102 C 230,85 210,80 180,80 Z" fill="#111" />
            <path d="M 185,67 L 235,67 L 240,75 L 185,75 Z" fill="rgba(255,255,255,0.15)" />
            {/* Circular headlights under windshield */}
            <circle cx="272" cy="122" r="3.5" fill="#444" />
            <circle cx="282" cy="128" r="3.5" fill="#555" />
          </>
        ) : (
          <>
            {/* Shinkansen E5 style pilot cockpit canopy */}
            <path d="M 190,95 Q 215,70 240,95 Q 215,108 190,95 Z" fill="#111" />
            <path d="M 195,92 Q 215,75 235,92 Z" fill="rgba(255,255,255,0.2)" />
            {/* Aerodynamic LED headlights on the side of the duckbill nose */}
            <ellipse cx="242" cy="116" rx="8" ry="1.8" fill="#FFF" transform="rotate(-28, 242, 116)" filter="drop-shadow(0 0 4.5px #FFF)" />
            <ellipse cx="242" cy="116" rx="5" ry="0.8" fill="#FFFAED" transform="rotate(-28, 242, 116)" />
            {/* Streamlined nose panel joint lines */}
            <path d="M 280,115 Q 310,135 335,155" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
            {/* Small black bottom cover for the coupler pocket */}
            <rect x="315" y="162" width="10" height="8" fill="#222" rx="1" />
          </>
        )}
      </g>

      {/* Headlights and beams */}
      {showHeadlights && (
        isEMU3000 ? (
          <g transform="translate(325, 145)">
            <rect x="0" y="-2" width="10" height="4" fill="rgba(255,255,255,0.6)" filter="drop-shadow(0 0 4px #FFF)" />
            <rect x="0" y="-2" width="5" height="2" fill="#FFF" />
            <path d="M 10,0 L 250,-20 L 250,35 Z" fill="url(#headlightBeam)" opacity="0.35" pointerEvents="none" />
          </g>
        ) : isTaroko ? (
          <g transform="translate(242, 116)">
            <ellipse cx="0" cy="0" rx="8" ry="1.8" fill="rgba(255,255,255,0.6)" filter="drop-shadow(0 0 4px #FFF)" />
            <ellipse cx="0" cy="0" rx="4" ry="0.8" fill="#FFF" />
            <path d="M 0,0 L 250,-15 L 250,30 Z" fill="url(#headlightBeam)" opacity="0.35" pointerEvents="none" />
          </g>
        ) : null
      )}

      {/* Taillights */}
      {showTaillights && (
        isEMU3000 ? (
          <rect x="320" y="145" width="6" height="3" fill="#FF3333" filter="drop-shadow(0 0 3px #FF0000)" />
        ) : isTaroko ? (
          <circle cx="242" cy="116" r="3.5" fill="#FF3333" filter="drop-shadow(0 0 3px #FF0000)" />
        ) : null
      )}

      {/* Front Coupler */}
      {!isTaroko && (
        <>
          <rect x={isEMU3000 ? "315" : "310"} y="178" width="25" height="10" fill="#333" rx={2} />
          <circle cx={isEMU3000 ? "330" : "325"} cy="183" r="4" fill="#555" />
        </>
      )}

      {/* Bogies & Wheels */}
      <TrainBogie x={80} />
      <TrainBogie x={250} />
    </g>
  );
};

const DetailedTrain = ({ model, layout = ['cabLeft', 'passenger', 'cabRight'] }) => {
  let currentX = 0;
  return (
    <g>
      {layout.map((type, idx) => {
        let element = null;
        let width = 0;
        
        if (type === 'cabLeft') {
          width = 335;
          element = (
            <g transform={`translate(${currentX + 335}, 0) scale(-1, 1)`}>
              <TrainCab model={model} side="left" />
            </g>
          );
        } else if (type === 'cabRight') {
          width = 335;
          element = (
            <g transform={`translate(${currentX}, 0)`}>
              <TrainCab model={model} side="right" />
            </g>
          );
        } else if (type === 'passenger') {
          width = 440;
          element = (
            <g transform={`translate(${currentX}, 0)`}>
              <PassengerCar model={model} />
            </g>
          );
        }
        
        const renderConnector = idx < layout.length - 1;
        const connectorX = currentX + width;
        currentX += width + (renderConnector ? 10 : 0);
        
        return (
          <g key={idx}>
            {element}
            {renderConnector && (
              <g transform={`translate(${connectorX}, 0)`}>
                <GangwayConnector />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

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
          0% { transform: translateY(261.4px) translateX(-820px); }
          100% { transform: translateY(261.4px) translateX(850px); }
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
          0%, 5% { transform: translateX(240px); }
          40%, 55% { transform: translateX(740px); }
          90%, 100% { transform: translateX(240px); }
        }

        @keyframes swayJoint1 {
          /* Damped oscillation at left (crane static 90% to 5%) */
          0% { transform: rotate(0deg); }
          5% { transform: rotate(0deg); }
          
          /* Move right (5% to 40%) */
          19% { transform: rotate(8deg); } /* Max lag left */
          
          /* Damped right (crane static 40% to 55%) */
          41.5% { transform: rotate(-9deg); } /* Max overshoot right (0.375s after stop) */
          45.5% { transform: rotate(4.5deg); }
          49.5% { transform: rotate(-1.5deg); }
          52.5% { transform: rotate(0.3deg); }
          55% { transform: rotate(0deg); }
          
          /* Move left (55% to 90%) */
          69% { transform: rotate(-8deg); } /* Max lag right */
          
          /* Damped left (crane static 90% to 100%) */
          91.5% { transform: rotate(9deg); } /* Max overshoot left (0.375s after stop) */
          95.5% { transform: rotate(-4.5deg); }
          98.5% { transform: rotate(1.5deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes swayJoint2 {
          /* Damped oscillation at left */
          0% { transform: rotate(0deg); }
          5% { transform: rotate(0deg); }
          
          /* Move right */
          20% { transform: rotate(7deg); }
          
          /* Damped right */
          42.5% { transform: rotate(-8deg); } /* Overshoot right */
          46.5% { transform: rotate(4deg); }
          49.8% { transform: rotate(-1deg); }
          51.5% { transform: rotate(0deg); }
          55% { transform: rotate(0deg); }
          
          /* Move left */
          70% { transform: rotate(-7deg); }
          
          /* Damped left */
          92.5% { transform: rotate(8deg); } /* Overshoot left */
          96.5% { transform: rotate(-4deg); }
          99.8% { transform: rotate(1deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes swayJoint3 {
          /* Damped oscillation at left */
          0% { transform: rotate(0deg); }
          5% { transform: rotate(0deg); }
          
          /* Move right */
          21% { transform: rotate(6deg); }
          
          /* Damped right */
          43.5% { transform: rotate(-7deg); } /* Overshoot right */
          47.5% { transform: rotate(3deg); }
          50% { transform: rotate(-0.5deg); }
          51.5% { transform: rotate(0deg); }
          55% { transform: rotate(0deg); }
          
          /* Move left */
          71% { transform: rotate(-6deg); }
          
          /* Damped left */
          93.5% { transform: rotate(7deg); } /* Overshoot left */
          97.5% { transform: rotate(-3deg); }
          99.9% { transform: rotate(0.5deg); }
          100% { transform: rotate(0deg); }
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

        /* 🪚 電焊強光閃爍反射 */
        .welding-glow-reflect {
          animation: weldingFlicker 1.2s infinite;
        }

        @keyframes weldingFlicker {
          0%, 100% { opacity: 0; }
          4%, 12%, 20%, 28%, 36%, 44%, 52%, 60%, 68%, 76%, 84%, 92% { opacity: 0.45; }
          8%, 16%, 24%, 32%, 40%, 48%, 56%, 64%, 72%, 80%, 88%, 96% { opacity: 0.05; }
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

              <linearGradient id="hayabusaGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00A08A" />
                <stop offset="50%" stopColor="#00806C" />
                <stop offset="100%" stopColor="#005B4D" />
              </linearGradient>

              <linearGradient id="hayabusaWhite" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#ECEFF1" />
                <stop offset="100%" stopColor="#D5DBDB" />
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

              <linearGradient id="cabinGlowWarm" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="50%" stopColor="#FFF9C4" />
                <stop offset="100%" stopColor="#FFE082" />
              </linearGradient>

              <linearGradient id="cabinGlowCool" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#B2EBF2" />
                <stop offset="50%" stopColor="#E0F7FA" />
                <stop offset="100%" stopColor="#B2EBF2" />
              </linearGradient>

              <linearGradient id="headlightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.45" />
                <stop offset="30%" stopColor="#FFF9C4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#FFF9C4" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="headlightBeamLeft" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.45" />
                <stop offset="30%" stopColor="#FFF9C4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#FFF9C4" stopOpacity="0" />
              </linearGradient>

              <radialGradient id="weldingFlashGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF" stopOpacity="1" />
                <stop offset="20%" stopColor="#00E5FF" stopOpacity="0.85" />
                <stop offset="55%" stopColor="#00B0FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00B0FF" stopOpacity="0" />
              </radialGradient>

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
                
                {/* Translate to end of Segment 1 */}
                <g transform="translate(0, 88)">
                  {/* Rotate Segment 2 */}
                  <g className="crane-joint-2">
                    {/* Segment 2 line */}
                    <line x1="0" y1="0" x2="0" y2="24" stroke="#7f8c8d" strokeWidth="1.5" strokeDasharray="3, 3" />
                    
                    {/* Translate to end of Segment 2 */}
                    <g transform="translate(0, 24)">
                      {/* Rotate Segment 3 */}
                      <g className="crane-joint-3">
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
                        {/* Highly Detailed EMU3000 Train (Extended off-screen to left) */}
            <g transform="translate(-150, 161.4) scale(0.32)">
              <DetailedTrain model="emu3000" layout={['passenger', 'passenger', 'passenger', 'cabRight']} />
            </g>


            {/* ==================== TRACK 2 (MIDDLE, y=330) - Wash & Taroko Express ==================== */}
            {/* Sleepers */}
            <line x1="0" y1="330" x2="800" y2="330" stroke="#1c1f24" strokeWidth="4" strokeDasharray="2, 6" />
            {/* Rails */}
            <line x1="0" y1="326" x2="800" y2="326" stroke="#484d56" strokeWidth="1.5" />
            <line x1="0" y1="327" x2="800" y2="327" stroke="#777c85" strokeWidth="1" />
            {/* OCS contact wire */}
            <line x1="0" y1="279" x2="800" y2="279" stroke="#cd853f" strokeWidth="0.8" opacity="0.35" />

            {/* Highly Detailed 6-Car Shinkansen E5 Series "Hayabusa" Train passing through washing system (beautiful green/white bullet train) */}
            <g className="train-washing">
              <g transform="scale(0.32)">
                <DetailedTrain model="emu900" layout={['cabLeft', 'passenger', 'passenger', 'passenger', 'passenger', 'cabRight']} />
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
            {/* OCS contact wire */}
            <line x1="0" y1="380" x2="800" y2="380" stroke="#cd853f" strokeWidth="0.8" opacity="0.35" />
            {/* Sleepers */}
            <line x1="0" y1="430" x2="800" y2="430" stroke="#1c1f24" strokeWidth="4" strokeDasharray="2, 6" />
            {/* Rails */}
            <line x1="0" y1="426" x2="800" y2="426" stroke="#484d56" strokeWidth="1.5" />
            <line x1="0" y1="427" x2="800" y2="427" stroke="#777c85" strokeWidth="1" />

            {/* Highly Detailed EMU800 Train (Staggered further to the right by shifting to x=180) */}
            <g transform="translate(180, 361.4) scale(0.32)">
              <DetailedTrain model="emu800" layout={['passenger', 'passenger', 'passenger', 'cabRight']} />
            </g>

            {/* Spark generator (Welding Effect under EMU800 at x=499, y=424) */}
            <g transform="translate(499, 424)">
              <circle cx="0" cy="0" r="15" fill="rgba(0, 240, 255, 0.2)" />
              <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#00F0FF" style={{ '--dx': '-18px', '--dy': '-12px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.0" fill="#FFF" style={{ '--dx': '12px', '--dy': '-16px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.8" fill="#00F0FF" style={{ '--dx': '-8px', '--dy': '-8px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="0.8" fill="#FFF" style={{ '--dx': '10px', '--dy': '-10px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.2" fill="#00F0FF" style={{ '--dx': '-12px', '--dy': '-4px' }} />
              <circle className="spark-particle" cx="0" cy="0" r="1.5" fill="#FFF" style={{ '--dx': '6px', '--dy': '-18px' }} />
            </g>

            {/* Detailed Welder Operator kneeling next to Track 3 (跪姿雙腿) at x=515, y=424 */}
            <g transform="translate(515, 424)">
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

            {/* Detailed Leaning Ladder on Track 3 (staggered & detailed) */}
            <g stroke="#BDC3C7" strokeWidth="1.5" opacity="0.9" pointerEvents="none">
              {/* Left Rail */}
              <line x1="435" y1="435" x2="440" y2="395" stroke="#7F8C8D" strokeWidth="2" />
              {/* Right Rail */}
              <line x1="445" y1="435" x2="450" y2="395" stroke="#7F8C8D" strokeWidth="2" />
              {/* Steps/Rungs */}
              <line x1="436.25" y1="427" x2="446.25" y2="427" />
              <line x1="437.5" y1="419" x2="447.5" y2="419" />
              <line x1="438.75" y1="411" x2="448.75" y2="411" />
              <line x1="440" y1="403" x2="450" y2="403" />
              {/* Safety rubber pads at the bottom */}
              <rect x="433" y="433" width="4" height="3" fill="#333" rx="0.5" />
              <rect x="443" y="433" width="4" height="3" fill="#333" rx="0.5" />
            </g>

            {/* Red toolbox */}
            <g fill="#c0392b" stroke="#7f0c0d" strokeWidth="0.5" pointerEvents="none">
              <rect x="530" y="423" width="12" height="7" rx="1" />
              <rect x="533" y="421" width="6" height="2" rx="0.5" fill="#95a5a6" />
            </g>

            {/* Welding flash overlay */}
            <circle cx="499" cy="424" r="55" fill="url(#weldingFlashGradient)" className="welding-glow-reflect" pointerEvents="none" />

            {/* Floor border warning stripes */}
            <rect x="0" y="475" width="800" height="25" fill="url(#warningStripes)" />
          </svg>
        </div>
      </div>
    </>
  );
}
