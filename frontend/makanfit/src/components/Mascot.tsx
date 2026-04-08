
import React from 'react';

interface MascotProps {
  outfit?: {
    hat?: React.ReactNode;
    eyes?: React.ReactNode;
    accessory?: React.ReactNode;
  };
  animationState?: 'idle' | 'happy' | 'thinking';
}

const Mascot: React.FC<MascotProps> = ({ outfit, animationState = 'idle' }) => {
  return (
    <div className="relative w-64 h-72 flex items-center justify-center">
      <style>{`
        @keyframes mascot-sway {
          0%, 100% { transform: rotate(-2deg) translateY(0); }
          50% { transform: rotate(2deg) translateY(-5px); }
        }
        @keyframes mascot-breathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.03, 0.97); }
        }
        @keyframes mascot-blink {
          0%, 90%, 100% { opacity: 1; transform: scaleY(1); }
          95% { opacity: 0.1; transform: scaleY(0.1); }
        }
        @keyframes mascot-arm-l {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-10deg); }
        }
        @keyframes mascot-arm-r {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        .animate-sway { animation: mascot-sway 4s ease-in-out infinite; }
        .animate-breathe { animation: mascot-breathe 3s ease-in-out infinite; transform-origin: bottom; }
        .animate-blink { animation: mascot-blink 4s ease-in-out infinite; transform-origin: center; }
        .animate-arm-l { animation: mascot-arm-l 2s ease-in-out infinite; transform-origin: top right; }
        .animate-arm-r { animation: mascot-arm-r 2s ease-in-out infinite; transform-origin: top left; }
      `}</style>

      <div className="relative w-full h-full animate-sway">
        <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-2xl overflow-visible">
          {/* Main Body Group (Breathes) */}
          <g className="animate-breathe">
            {/* Main Body (Rice Triangle) */}
            <path 
              d="M100 20 L175 160 Q180 175 160 175 L40 175 Q20 175 25 160 L100 20 Z" 
              fill="#FFFFFF" 
              stroke="#E2E8F0" 
              strokeWidth="2"
            />
            
            {/* Banana Leaf Wrap */}
            <path 
              d="M30 160 L100 90 L170 160 Q175 175 160 175 L40 175 Q25 175 30 160 Z" 
              fill="#65A30D" 
            />
            <path 
              d="M35 155 Q100 100 165 155" 
              fill="none" 
              stroke="#3F6212" 
              strokeWidth="1.5"
              opacity="0.2"
            />

            {/* The Egg Slice */}
            <circle cx="70" cy="85" r="22" fill="#FDE047" />
            <circle cx="70" cy="85" r="14" fill="#EAB308" />
            
            {/* Sambal Spot */}
            <circle cx="45" cy="145" r="12" fill="#B91C1C" />
            <circle cx="48" cy="148" r="7" fill="#991B1B" />

            {/* Face */}
            {animationState === 'happy' ? (
               <g transform="translate(0, 5)">
                 <path d="M85 110 Q100 130 115 110" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                 <path d="M82 100 Q90 92 98 100" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                 <path d="M102 100 Q110 92 118 100" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
               </g>
            ) : (
              <g className="animate-blink">
                <circle cx="90" cy="105" r="4" fill="#1E293B" />
                <circle cx="120" cy="105" r="4" fill="#1E293B" />
                {/* Cheeks */}
                <circle cx="80" cy="115" r="6" fill="#FDA4AF" opacity="0.4" />
                <circle cx="130" cy="115" r="6" fill="#FDA4AF" opacity="0.4" />
                {/* Mouth */}
                <path d="M98 118 Q105 125 112 118" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {/* Custom Outfits - Attached to body */}
            <g>
              {outfit?.hat}
              {outfit?.eyes}
              {outfit?.accessory}
            </g>
          </g>

          {/* Arms (Not scaling with body for independent movement) */}
          <path d="M45 125 Q20 115 30 95" className="animate-arm-l" stroke="#78350F" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M155 125 Q180 115 170 95" className="animate-arm-r" stroke="#78350F" strokeWidth="6" strokeLinecap="round" fill="none" />

          {/* Legs (Independent) */}
          <path d="M75 175 V200 Q75 210 90 210" stroke="#78350F" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M125 175 V200 Q125 210 110 210" stroke="#78350F" strokeWidth="7" strokeLinecap="round" fill="none" />
        </svg>
        
        {/* Shadow */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-36 h-5 bg-black/10 rounded-full blur-lg -z-10 animate-pulse-soft" />
      </div>
    </div>
  );
};

export default Mascot;
