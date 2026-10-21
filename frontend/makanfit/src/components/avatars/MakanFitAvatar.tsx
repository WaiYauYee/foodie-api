import React from 'react';

interface MakanFitAvatarProps {
  size?: number;
  className?: string;
  mood?: 'happy' | 'idle' | 'wink';
  showSparkle?: boolean;
  withBackground?: boolean;
}

export const MakanFitAvatar: React.FC<MakanFitAvatarProps> = ({
  size = 48,
  className = '',
  mood = 'happy',
  showSparkle = false,
  withBackground = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Lemmy the MakanFit Mascot"
    >
      {withBackground && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-100/80 via-emerald-50 to-teal-50/80 border border-emerald-100/60 shadow-xs -z-10" />
      )}

      {showSparkle && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
        </span>
      )}

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Rice coconut gradient */}
          <linearGradient id="riceGrad" x1="50" y1="14" x2="50" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Banana leaf wrap gradient */}
          <linearGradient id="leafGrad" x1="50" y1="52" x2="50" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="40%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          {/* Egg yolk gradient */}
          <linearGradient id="yolkGrad" x1="28" y1="50" x2="36" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>

          {/* Sambal gradient */}
          <radialGradient id="sambalGrad" cx="70" cy="67" r="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="70%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>
        </defs>

        {/* Soft ground shadow */}
        <ellipse cx="50" cy="88" rx="30" ry="4" fill="#0F172A" fillOpacity="0.08" />

        {/* Banana Leaf Base Wrap */}
        <path
          d="M 20 80 C 18 86, 82 86, 80 80 C 82 66, 76 56, 70 52 C 58 64, 42 64, 30 52 C 24 56, 18 66, 20 80 Z"
          fill="url(#leafGrad)"
        />
        {/* Leaf subtle rib detail */}
        <path
          d="M 30 56 Q 50 67 70 56"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 24 74 Q 50 82 76 74"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Main Rice Pyramid Body */}
        <path
          d="M 50 16 C 53 16, 56 19, 61 28 L 78 65 C 82 73, 75 78, 66 78 L 34 78 C 25 78, 18 73, 22 65 L 39 28 C 44 19, 47 16, 50 16 Z"
          fill="url(#riceGrad)"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Boiled Egg Slice peeking on the left */}
        <ellipse cx="32" cy="56" rx="9" ry="11" transform="rotate(-15 32 56)" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <ellipse cx="32" cy="57" rx="5.5" ry="6.5" transform="rotate(-15 32 57)" fill="url(#yolkGrad)" />
        <circle cx="30" cy="54" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />

        {/* Sambal Dot on the right */}
        <circle cx="70" cy="67" r="6" fill="url(#sambalGrad)" />
        <circle cx="68.5" cy="65.5" r="1.5" fill="#FFFFFF" fillOpacity="0.6" />

        {/* Mini Chef Hat / Topping Accent on Head */}
        <g transform="translate(50, 14)">
          <ellipse cx="0" cy="0" rx="6" ry="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <path
            d="M -5 -1 C -7 -6, -2 -9, 0 -7 C 2 -9, 7 -6, 5 -1 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-6" r="1" fill="#10B981" />
        </g>

        {/* Cute Kawaii Face */}
        {mood === 'wink' ? (
          <g>
            {/* Left winking eye */}
            <path d="M 43 47 Q 46 43 49 47" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
            {/* Right open sparkling eye */}
            <circle cx="58" cy="46" r="3.2" fill="#0F172A" />
            <circle cx="57" cy="45" r="1.2" fill="#FFFFFF" />
          </g>
        ) : (
          <g>
            {/* Left Eye */}
            <circle cx="45" cy="46" r="3" fill="#0F172A" />
            <circle cx="44" cy="45" r="1.1" fill="#FFFFFF" />
            {/* Right Eye */}
            <circle cx="57" cy="46" r="3" fill="#0F172A" />
            <circle cx="56" cy="45" r="1.1" fill="#FFFFFF" />
          </g>
        )}

        {/* Cheerful Blush Cheeks */}
        <ellipse cx="39" cy="50" rx="3.5" ry="2" fill="#FDA4AF" fillOpacity="0.75" />
        <ellipse cx="63" cy="50" rx="3.5" ry="2" fill="#FDA4AF" fillOpacity="0.75" />

        {/* Joyful Mouth */}
        <path
          d="M 48 51 Q 51 56 54 51"
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tiny hands resting on tummy */}
        <circle cx="41" cy="62" r="2.2" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="0.8" />
        <circle cx="60" cy="62" r="2.2" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="0.8" />
      </svg>
    </div>
  );
};

export default MakanFitAvatar;

