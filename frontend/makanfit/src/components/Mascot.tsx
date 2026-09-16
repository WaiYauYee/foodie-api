import React from 'react';

interface MascotProps {
  outfit?: {
    hat?: React.ReactNode;
    eyes?: React.ReactNode;
    accessory?: React.ReactNode;
  };
  animationState?: 'idle' | 'happy' | 'thinking' | 'petting';
  onPet?: () => void;
}

const Mascot: React.FC<MascotProps> = ({ outfit, animationState = 'idle', onPet }) => {
  return (
    <div 
      onClick={onPet}
      className="relative w-64 h-72 flex items-center justify-center cursor-pointer select-none group"
    >
      <style>{`
        @keyframes mascot-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @keyframes mascot-happy-hop {
          0%, 100% { transform: translateY(0) scale(1, 1); }
          30% { transform: translateY(-16px) scale(0.96, 1.05) rotate(-2deg); }
          50% { transform: translateY(-20px) scale(1.02, 0.98) rotate(2deg); }
          75% { transform: translateY(0) scale(1.06, 0.94); }
        }
        @keyframes mascot-pet-squish {
          0%, 100% { transform: scale(1, 1); }
          40% { transform: scale(1.1, 0.9) translateY(4px); }
          80% { transform: scale(0.95, 1.05) translateY(-4px); }
        }
        @keyframes mascot-breathe-subtle {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.02, 0.98); }
        }
        @keyframes mascot-blink-cycle {
          0%, 92%, 100% { transform: scaleY(1); opacity: 1; }
          96% { transform: scaleY(0.08); opacity: 0.2; }
        }
        @keyframes mascot-wave-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-18deg); }
        }
        @keyframes mascot-wave-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(18deg); }
        }
        @keyframes heart-rise {
          0% { opacity: 0; transform: translateY(0) scale(0.6); }
          50% { opacity: 1; transform: translateY(-20px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-45px) scale(0.8); }
        }
        .animate-float-mascot { animation: mascot-float 3.5s ease-in-out infinite; }
        .animate-happy-mascot { animation: mascot-happy-hop 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
        .animate-squish-mascot { animation: mascot-pet-squish 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-breathe-body { animation: mascot-breathe-subtle 2.8s ease-in-out infinite; transform-origin: bottom center; }
        .animate-eyes-blink { animation: mascot-blink-cycle 4.5s ease-in-out infinite; transform-origin: center; }
        .animate-left-arm { animation: mascot-wave-left 2s ease-in-out infinite; transform-origin: top right; }
        .animate-right-arm { animation: mascot-wave-right 2s ease-in-out infinite; transform-origin: top left; }
      `}</style>

      {/* Floating love hearts when happy or petting */}
      {(animationState === 'happy' || animationState === 'petting') && (
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="absolute top-4 left-10 text-rose-500 animate-[heart-rise_1.5s_ease-out_infinite]">
            ❤️
          </div>
          <div className="absolute top-2 right-12 text-rose-400 text-sm animate-[heart-rise_1.8s_ease-out_0.3s_infinite]">
            💖
          </div>
          <div className="absolute top-12 right-6 text-amber-400 text-xs animate-[heart-rise_1.4s_ease-out_0.6s_infinite]">
            ✨
          </div>
        </div>
      )}

      {/* Main Mascot Container */}
      <div 
        className={`relative w-full h-full transition-transform duration-300 ${
          animationState === 'happy'
            ? 'animate-happy-mascot'
            : animationState === 'petting'
            ? 'animate-squish-mascot'
            : 'animate-float-mascot'
        }`}
      >
        <svg viewBox="0 0 200 230" className="w-full h-full overflow-visible drop-shadow-xl">
          <defs>
            {/* Rice Body Gradient */}
            <linearGradient id="lemmyRiceGrad" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            {/* Banana Leaf Wrap */}
            <linearGradient id="lemmyLeafGrad" x1="100" y1="110" x2="100" y2="185" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="35%" stopColor="#22C55E" />
              <stop offset="85%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>

            {/* Sambal Gradient */}
            <radialGradient id="lemmySambalGrad" cx="62" cy="155" r="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="60%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#991B1B" />
            </radialGradient>

            {/* Egg Yolk Gradient */}
            <linearGradient id="lemmyEggGrad" x1="68" y1="95" x2="76" y2="115" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="lemmySoftGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.08" floodColor="#0F172A" />
            </filter>
          </defs>

          {/* Dynamic Ground Shadow */}
          <ellipse 
            cx="100" 
            cy="218" 
            rx="54" 
            ry="7" 
            fill="#0F172A" 
            fillOpacity="0.12" 
            className="transition-all duration-300 group-hover:scale-95 group-hover:fill-opacity-15"
          />

          {/* Main Breathing Body Group */}
          <g className="animate-breathe-body">
            {/* Rice Triangle Pyramid (Smooth Curves) */}
            <path
              d="M 100 24 C 106 24 114 30 122 45 L 165 145 C 172 162 160 176 142 176 L 58 176 C 40 176 28 162 35 145 L 78 45 C 86 30 94 24 100 24 Z"
              fill="url(#lemmyRiceGrad)"
              stroke="#CBD5E1"
              strokeWidth="2.5"
              strokeLinejoin="round"
              filter="url(#lemmySoftGlow)"
            />

            {/* Rice subtle highlights */}
            <path
              d="M 98 32 C 94 38 78 75 74 95"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Banana Leaf Base Wrap */}
            <path
              d="M 32 148 C 30 175 170 175 168 148 C 170 126 150 110 134 104 C 114 126 86 126 66 104 C 50 110 30 126 32 148 Z"
              fill="url(#lemmyLeafGrad)"
              stroke="#15803D"
              strokeWidth="1.8"
            />

            {/* Banana Leaf Veins & Folds */}
            <path
              d="M 66 108 Q 100 132 134 108"
              stroke="#166534"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.35"
              fill="none"
            />
            <path
              d="M 44 142 Q 100 162 156 142"
              stroke="#166534"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.3"
              fill="none"
            />
            <path
              d="M 100 120 L 100 172"
              stroke="#166534"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.25"
              strokeDasharray="3 3"
            />

            {/* Hard-boiled Egg Slice on the side */}
            <g transform="translate(10, 5)">
              <ellipse 
                cx="65" 
                cy="104" 
                rx="16" 
                ry="21" 
                transform="rotate(-18 65 104)" 
                fill="#FFFFFF" 
                stroke="#E2E8F0" 
                strokeWidth="1.8" 
              />
              <ellipse 
                cx="65" 
                cy="106" 
                rx="10" 
                ry="13" 
                transform="rotate(-18 65 106)" 
                fill="url(#lemmyEggGrad)" 
              />
              {/* Egg Yolk Specular Shine */}
              <circle cx="61" cy="100" r="3" fill="#FFFFFF" fillOpacity="0.85" />
              <circle cx="67" cy="104" r="1.5" fill="#FFFFFF" fillOpacity="0.6" />
            </g>

            {/* Sambal Spot on the lower right leaf */}
            <ellipse cx="140" cy="154" rx="14" ry="11" fill="url(#lemmySambalGrad)" />
            <circle cx="137" cy="151" r="2.5" fill="#FFFFFF" fillOpacity="0.6" />
            <ellipse cx="148" cy="156" rx="4" ry="3" fill="#991B1B" />

            {/* Kawaii Face Expressions */}
            {animationState === 'happy' || animationState === 'petting' ? (
              <g>
                {/* Blissful Arch Eyes */}
                <path d="M 86 94 Q 94 85 102 94" fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 112 94 Q 120 85 128 94" fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
                {/* Cheerful Open Smile */}
                <path 
                  d="M 98 103 Q 107 116 116 103 Z" 
                  fill="#E11D48" 
                  stroke="#0F172A" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round" 
                />
                <ellipse cx="107" cy="108" rx="3.5" ry="2" fill="#FDA4AF" />
              </g>
            ) : animationState === 'thinking' ? (
              <g>
                {/* Inquiring raised brow / eyes looking up */}
                <circle cx="94" cy="89" r="4.5" fill="#0F172A" />
                <circle cx="92" cy="87" r="1.8" fill="#FFFFFF" />
                <circle cx="122" cy="89" r="4.5" fill="#0F172A" />
                <circle cx="120" cy="87" r="1.8" fill="#FFFFFF" />
                {/* Curious small curved mouth */}
                <path d="M 103 103 Q 107 101 112 105" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
              </g>
            ) : (
              <g className="animate-eyes-blink">
                {/* Cute Open Eyes */}
                <circle cx="94" cy="94" r="5" fill="#0F172A" />
                <circle cx="92.5" cy="92.5" r="2" fill="#FFFFFF" />
                <circle cx="95" cy="95.5" r="0.9" fill="#FFFFFF" />

                <circle cx="120" cy="94" r="5" fill="#0F172A" />
                <circle cx="118.5" cy="92.5" r="2" fill="#FFFFFF" />
                <circle cx="121" cy="95.5" r="0.9" fill="#FFFFFF" />

                {/* Sweet smile */}
                <path d="M 101 102 Q 107 109 113 102" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {/* Glowing Rosy Blush Cheeks */}
            <ellipse cx="82" cy="100" rx="7" ry="4" fill="#FDA4AF" fillOpacity="0.75" />
            <ellipse cx="132" cy="100" rx="7" ry="4" fill="#FDA4AF" fillOpacity="0.75" />

            {/* Outfits: Hats, Glasses, Accessories */}
            <g>
              {outfit?.hat}
              {outfit?.eyes}
              {outfit?.accessory}
            </g>
          </g>

          {/* Little Arms */}
          {animationState === 'happy' ? (
            <g>
              {/* Hands raised in excitement */}
              <path d="M 50 130 Q 32 105 45 88" className="animate-left-arm" stroke="#475569" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <path d="M 150 130 Q 168 105 155 88" className="animate-right-arm" stroke="#475569" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g>
              {/* Cute resting/swaying arms */}
              <path d="M 50 135 Q 26 130 35 112" className="animate-left-arm" stroke="#475569" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M 150 135 Q 174 130 165 112" className="animate-right-arm" stroke="#475569" strokeWidth="5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* Cute Little Feet */}
          <path d="M 80 176 V 198 Q 80 205 92 205" stroke="#334155" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 120 176 V 198 Q 120 205 108 205" stroke="#334155" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
};

export default Mascot;

