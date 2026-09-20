import React from 'react';

export type BackgroundTheme = 'garden' | 'picnic' | 'forest' | 'beach' | 'night';

export interface BackgroundOption {
  id: BackgroundTheme;
  name: string;
  emoji: string;
  tagline: string;
  lemmyQuote: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'garden',
    name: 'Garden',
    emoji: '🌿',
    tagline: 'Zen Garden & Flowers',
    lemmyQuote: 'Fresh blooming flowers and gentle morning breeze! Lemmy loves nature! 🌸',
  },
  {
    id: 'picnic',
    name: 'Picnic',
    emoji: '🧺',
    tagline: 'Cozy Picnic Mat',
    lemmyQuote: 'Piknik time under the shady trees! Healthy snacks taste 10x better outdoors! 🍉',
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    tagline: 'Rainforest Sanctuary',
    lemmyQuote: 'Deep in the lush Malaysian rainforest! Look at those fireflies glow! ✨',
  },
  {
    id: 'beach',
    name: 'Beach',
    emoji: '🏖️',
    tagline: 'Sunny Cherating Beach',
    lemmyQuote: 'Wah, the ocean breeze and coconut palms are so calming! Beach day vibes! 🥥',
  },
  {
    id: 'night',
    name: 'Night Sky',
    emoji: '🌙',
    tagline: 'Campfire Starlight',
    lemmyQuote: 'Peaceful starry night by the warm campfire. Time to rest and recharge! 🔥',
  },
];

interface PalBackgroundProps {
  theme: BackgroundTheme;
  children?: React.ReactNode;
}

export const PalBackground: React.FC<PalBackgroundProps> = ({ theme, children }) => {
  return (
    <div className="relative w-full rounded-[32px] sm:rounded-[36px] overflow-hidden border-2 border-white/80 shadow-md transition-all duration-500">
      {/* Background SVG Artwork Layer */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {theme === 'garden' && <GardenScene />}
        {theme === 'picnic' && <PicnicScene />}
        {theme === 'forest' && <ForestScene />}
        {theme === 'beach' && <BeachScene />}
        {theme === 'night' && <NightScene />}
      </div>

      {/* Foreground Content (Lemmy, dialogue, controls) */}
      <div className="relative z-10 flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 1. ZEN GARDEN SCENE                                                       */
/* ========================================================================= */
const GardenScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="gardenSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E0F2FE" />
        <stop offset="55%" stopColor="#FEF3C7" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#D1FAE5" />
      </linearGradient>
      <linearGradient id="gardenHillBack" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <linearGradient id="gardenHillFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <radialGradient id="gardenSun" cx="20%" cy="25%" r="40%">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#FDE047" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Sky & Sun Glow */}
    <rect width="400" height="320" fill="url(#gardenSky)" />
    <circle cx="70" cy="65" r="85" fill="url(#gardenSun)" />
    <circle cx="70" cy="65" r="28" fill="#FEF9C3" opacity="0.9" />

    {/* Distant Clouds */}
    <g fill="#FFFFFF" opacity="0.65">
      <path d="M 230 45 Q 245 35 260 45 Q 275 35 290 45 Q 300 55 285 62 L 235 62 Z" />
      <path d="M 120 70 Q 130 62 142 70 Q 155 63 165 70 Q 172 78 160 82 L 125 82 Z" opacity="0.5" />
    </g>

    {/* Background Hills */}
    <path
      d="M -20 180 Q 80 130 190 165 Q 310 120 420 160 L 420 320 L -20 320 Z"
      fill="url(#gardenHillBack)"
      opacity="0.85"
    />

    {/* Foreground Lawn */}
    <path
      d="M -10 215 Q 120 185 240 210 Q 340 190 410 215 L 410 320 L -10 320 Z"
      fill="url(#gardenHillFront)"
    />

    {/* Stepping Stones under mascot ground */}
    <g fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" opacity="0.9">
      <ellipse cx="150" cy="275" rx="22" ry="7" />
      <ellipse cx="205" cy="285" rx="30" ry="9" />
      <ellipse cx="260" cy="274" rx="24" ry="7" />
    </g>

    {/* Flower Bushes & Bunga Raya (Hibiscus) Left */}
    <g transform="translate(25, 205)">
      {/* Leaves */}
      <circle cx="0" cy="0" r="22" fill="#047857" />
      <circle cx="18" cy="8" r="18" fill="#10B981" />
      <circle cx="-14" cy="10" r="16" fill="#059669" />
      {/* Pink & Red Blossoms */}
      <circle cx="-2" cy="-4" r="7" fill="#F43F5E" />
      <circle cx="-2" cy="-4" r="3" fill="#FACC15" />
      <circle cx="16" cy="6" r="6" fill="#FB7185" />
      <circle cx="16" cy="6" r="2.5" fill="#FEF08A" />
      <circle cx="-12" cy="12" r="5" fill="#FDA4AF" />
    </g>

    {/* Flower Bushes Right */}
    <g transform="translate(365, 210)">
      <circle cx="0" cy="0" r="26" fill="#047857" />
      <circle cx="-18" cy="8" r="19" fill="#10B981" />
      <circle cx="14" cy="10" r="18" fill="#059669" />
      <circle cx="-6" cy="-6" r="8" fill="#EC4899" />
      <circle cx="-6" cy="-6" r="3" fill="#FACC15" />
      <circle cx="-16" cy="6" r="6" fill="#F472B6" />
      <circle cx="10" cy="6" r="5" fill="#FBCFE8" />
    </g>

    {/* Fluttering Butterflies */}
    <g transform="translate(110, 110)">
      <ellipse cx="-4" cy="-2" rx="5" ry="3" fill="#FACC15" transform="rotate(-25)" />
      <ellipse cx="4" cy="-2" rx="5" ry="3" fill="#FACC15" transform="rotate(25)" />
      <circle cx="0" cy="0" r="1.5" fill="#D97706" />
    </g>
    <g transform="translate(305, 95)" opacity="0.85">
      <ellipse cx="-3" cy="-1.5" rx="4" ry="2.5" fill="#38BDF8" transform="rotate(-20)" />
      <ellipse cx="3" cy="-1.5" rx="4" ry="2.5" fill="#38BDF8" transform="rotate(20)" />
      <circle cx="0" cy="0" r="1.2" fill="#0284C7" />
    </g>
  </svg>
);

/* ========================================================================= */
/* 2. COZY PICNIC SCENE                                                      */
/* ========================================================================= */
const PicnicScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="picnicSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#BAE6FD" />
        <stop offset="60%" stopColor="#E0F2FE" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
      <linearGradient id="picnicGrass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>
      {/* Red & White Checkered Pattern for Blanket */}
      <pattern id="picnicCheckers" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#EF4444" />
        <rect width="8" height="8" fill="#FFFFFF" />
        <rect x="8" y="8" width="8" height="8" fill="#FFFFFF" />
      </pattern>
    </defs>

    {/* Sky */}
    <rect width="400" height="320" fill="url(#picnicSky)" />

    {/* Sun and Warm Beam */}
    <circle cx="340" cy="50" r="32" fill="#FDE047" opacity="0.9" />
    <circle cx="340" cy="50" r="55" fill="#FEF08A" opacity="0.35" />

    {/* Shady Tree Canopy on the Left */}
    <g fill="#15803D" opacity="0.95">
      <circle cx="20" cy="15" r="60" />
      <circle cx="85" cy="10" r="45" />
      <circle cx="120" cy="35" r="35" />
      <circle cx="-10" cy="70" r="50" fill="#166534" />
      <path d="M 0 110 L 25 110 L 28 220 L 5 220 Z" fill="#78350F" opacity="0.8" />
    </g>

    {/* Gently Rolling Grass */}
    <path
      d="M -10 195 Q 110 170 210 185 Q 310 170 410 190 L 410 320 L -10 320 Z"
      fill="url(#picnicGrass)"
    />

    {/* Picnic Blanket */}
    <g transform="translate(200, 260)">
      {/* Blanket Shadow */}
      <ellipse cx="0" cy="14" rx="145" ry="38" fill="#166534" opacity="0.35" />
      {/* Checkered Diamond Blanket */}
      <path
        d="M -135 6 Q 0 -16 135 6 Q 142 28 115 36 Q 0 46 -115 36 Z"
        fill="url(#picnicCheckers)"
        stroke="#DC2626"
        strokeWidth="2"
      />
      {/* White Fringe */}
      <path
        d="M -135 8 L -140 10 M 135 8 L 140 10 M -100 37 L -102 42 M 100 37 L 102 42"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>

    {/* Wicker Picnic Basket on the Right */}
    <g transform="translate(325, 240)">
      <ellipse cx="0" cy="15" rx="24" ry="7" fill="#047857" opacity="0.3" />
      <rect x="-20" y="-8" width="40" height="24" rx="6" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
      {/* Wicker Weave lines */}
      <path d="M -20 0 L 20 0 M -20 8 L 20 8 M -8 -8 L -8 16 M 8 -8 L 8 16" stroke="#B45309" strokeWidth="1.2" />
      {/* Basket lid & cloth */}
      <ellipse cx="0" cy="-8" rx="22" ry="5" fill="#F59E0B" stroke="#92400E" strokeWidth="1.5" />
      <path d="M -6 -10 L 8 -10 Q 14 -2 6 2 Z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
      {/* Sliced Watermelon Wedge */}
      <path d="M -30 2 Q -22 14 -12 10 Z" fill="#22C55E" />
      <path d="M -28 3 Q -22 12 -14 9 Z" fill="#EF4444" />
      <circle cx="-21" cy="7" r="1" fill="#0F172A" />
      <circle cx="-18" cy="6" r="1" fill="#0F172A" />
    </g>

    {/* Drifting Petals */}
    <g fill="#F472B6" opacity="0.75">
      <ellipse cx="140" cy="140" rx="4" ry="2.5" transform="rotate(35)" />
      <ellipse cx="170" cy="165" rx="3.5" ry="2" transform="rotate(-15)" />
      <ellipse cx="270" cy="180" rx="4" ry="2.5" transform="rotate(45)" />
    </g>
  </svg>
);

/* ========================================================================= */
/* 3. TROPICAL RAINFOREST SCENE                                              */
/* ========================================================================= */
const ForestScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#064E3B" />
        <stop offset="50%" stopColor="#047857" />
        <stop offset="100%" stopColor="#A7F3D0" />
      </linearGradient>
      <linearGradient id="forestGround" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#065F46" />
        <stop offset="100%" stopColor="#022C22" />
      </linearGradient>
      {/* Sunbeams filtering through trees */}
      <linearGradient id="sunBeam" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Deep Jungle Canopy Sky */}
    <rect width="400" height="320" fill="url(#forestSky)" />

    {/* Filtered Sunbeams */}
    <polygon points="120,0 160,0 240,320 180,320" fill="url(#sunBeam)" />
    <polygon points="230,0 270,0 360,320 290,320" fill="url(#sunBeam)" opacity="0.6" />

    {/* Silhouetted Rainforest Tree Trunks */}
    <g fill="#064E3B" opacity="0.7">
      <rect x="50" y="0" width="18" height="250" />
      <rect x="330" y="0" width="22" height="250" />
      <path d="M 68 80 Q 110 50 140 40 L 138 46 Q 110 56 68 88 Z" />
      <path d="M 330 90 Q 280 60 250 50 L 252 56 Q 280 66 330 98 Z" />
    </g>

    {/* Giant Monstera Leaves Left */}
    <g fill="#059669" stroke="#047857" strokeWidth="1.2">
      <path d="M -10 120 C 30 110, 70 140, 75 180 C 45 190, 10 170, -10 120 Z" />
      <path d="M 10 170 C 45 160, 80 180, 85 220 C 55 230, 20 210, 10 170 Z" fill="#10B981" />
    </g>

    {/* Giant Fern Fronds Right */}
    <g fill="#047857" stroke="#064E3B" strokeWidth="1.2">
      <path d="M 410 130 C 370 120, 330 150, 325 190 C 355 200, 390 180, 410 130 Z" />
      <path d="M 390 180 C 355 170, 320 190, 315 230 C 345 240, 380 220, 390 180 Z" fill="#10B981" />
    </g>

    {/* Mossy Rainforest Clearing Ground */}
    <path
      d="M -10 215 Q 110 190 200 205 Q 310 190 410 215 L 410 320 L -10 320 Z"
      fill="url(#forestGround)"
    />

    {/* Glowing Fireflies (Kunang-Kunang) */}
    <g>
      <circle cx="90" cy="140" r="3.5" fill="#FDE047" opacity="0.9" />
      <circle cx="90" cy="140" r="8" fill="#FEF08A" opacity="0.3" />

      <circle cx="150" cy="190" r="3" fill="#A7F3D0" opacity="0.9" />
      <circle cx="150" cy="190" r="7" fill="#A7F3D0" opacity="0.35" />

      <circle cx="280" cy="130" r="3.5" fill="#FDE047" opacity="0.9" />
      <circle cx="280" cy="130" r="8" fill="#FEF08A" opacity="0.3" />

      <circle cx="310" cy="175" r="2.5" fill="#A7F3D0" opacity="0.9" />
      <circle cx="310" cy="175" r="6" fill="#A7F3D0" opacity="0.3" />
    </g>
  </svg>
);

/* ========================================================================= */
/* 4. SUNNY BEACH SCENE                                                      */
/* ========================================================================= */
const BeachScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="beachSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="60%" stopColor="#BAE6FD" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
      <linearGradient id="beachSea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0284C7" />
        <stop offset="45%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#2DD4BF" />
      </linearGradient>
      <linearGradient id="beachSand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>

    {/* Tropical Sky */}
    <rect width="400" height="320" fill="url(#beachSky)" />

    {/* Radiant Tropical Sun */}
    <circle cx="65" cy="55" r="34" fill="#FACC15" />
    <circle cx="65" cy="55" r="54" fill="#FEF08A" opacity="0.4" />

    {/* Distant Islands / Horizon */}
    <path d="M 120 150 Q 150 142 180 150 Z" fill="#047857" opacity="0.6" />
    <path d="M 260 152 Q 295 144 330 152 Z" fill="#047857" opacity="0.5" />

    {/* Soaring Seagulls */}
    <g stroke="#0369A1" strokeWidth="1.8" fill="none" strokeLinecap="round">
      <path d="M 160 60 Q 166 52 172 60 Q 178 52 184 60" />
      <path d="M 210 75 Q 215 68 220 75 Q 225 68 230 75" opacity="0.7" />
    </g>

    {/* Turquoise Sea */}
    <path
      d="M -10 148 L 410 148 L 410 215 Q 280 200 160 210 Q 60 200 -10 215 Z"
      fill="url(#beachSea)"
    />

    {/* Sea Foam Wave Line */}
    <path
      d="M -10 208 Q 90 196 190 205 Q 310 194 410 206"
      stroke="#FFFFFF"
      strokeWidth="4"
      fill="none"
      opacity="0.85"
    />
    <path
      d="M -10 214 Q 100 204 210 212 Q 320 202 410 214"
      stroke="#E0F2FE"
      strokeWidth="2.5"
      fill="none"
      opacity="0.7"
    />

    {/* Golden Sand Beach */}
    <path
      d="M -10 215 Q 110 205 210 214 Q 310 204 410 216 L 410 320 L -10 320 Z"
      fill="url(#beachSand)"
    />

    {/* Leaning Coconut Palm Tree Right */}
    <g transform="translate(345, 110)">
      {/* Palm Trunk */}
      <path
        d="M 30 140 Q 20 60 -15 0 Q -24 0 -10 60 Q -2 140 10 140 Z"
        fill="#92400E"
        stroke="#78350F"
        strokeWidth="1.5"
      />
      {/* Palm Fronds */}
      <g stroke="#15803D" strokeWidth="2" fill="#22C55E">
        <path d="M -18 0 Q -70 -20 -110 10 Q -60 -5 -18 0" />
        <path d="M -18 0 Q -50 -55 -70 -75 Q -35 -40 -18 0" />
        <path d="M -18 0 Q 20 -60 40 -70 Q 15 -35 -18 0" />
        <path d="M -18 0 Q 60 -30 90 -10 Q 40 -10 -18 0" />
        <path d="M -18 0 Q -20 30 -35 55 Q -10 25 -18 0" />
      </g>
      {/* Green Coconuts */}
      <circle cx="-16" cy="4" r="5" fill="#65A30D" stroke="#3F6212" strokeWidth="1" />
      <circle cx="-10" cy="8" r="5" fill="#65A30D" stroke="#3F6212" strokeWidth="1" />
      <circle cx="-22" cy="7" r="4.5" fill="#4D7C0F" stroke="#3F6212" strokeWidth="1" />
    </g>

    {/* Cute Seashells and Starfish on Sand */}
    <g transform="translate(60, 275)">
      {/* Starfish */}
      <path
        d="M 0 -7 L 2 -2 L 7 -2 L 3 1 L 5 6 L 0 3 L -5 6 L -3 1 L -7 -2 L -2 -2 Z"
        fill="#F97316"
        stroke="#C2410C"
        strokeWidth="0.8"
      />
    </g>
    <g transform="translate(300, 280)">
      {/* Spiral Shell */}
      <ellipse cx="0" cy="0" rx="6" ry="4" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
      <path d="M -4 0 Q 0 -3 4 0" stroke="#CA8A04" strokeWidth="0.8" fill="none" />
    </g>
  </svg>
);

/* ========================================================================= */
/* 5. STARRY NIGHT CAMPFIRE SCENE                                            */
/* ========================================================================= */
const NightScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0B0F19" />
        <stop offset="45%" stopColor="#1E1B4B" />
        <stop offset="85%" stopColor="#312E81" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="nightGround" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <radialGradient id="campfireGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F97316" stopOpacity="0.85" />
        <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#7C2D12" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Deep Night Sky */}
    <rect width="400" height="320" fill="url(#nightSky)" />

    {/* Twinkling Stars */}
    <g fill="#FFFFFF">
      <circle cx="45" cy="40" r="1.8" opacity="0.9" />
      <circle cx="85" cy="25" r="1.2" opacity="0.7" />
      <circle cx="140" cy="55" r="2" opacity="0.9" />
      <circle cx="180" cy="30" r="1.5" opacity="0.8" />
      <circle cx="230" cy="65" r="1.2" opacity="0.65" />
      <circle cx="275" cy="25" r="2.2" opacity="0.95" />
      <circle cx="340" cy="45" r="1.5" opacity="0.8" />
      <circle cx="370" cy="70" r="1.8" opacity="0.9" />
      <circle cx="110" cy="85" r="1.2" opacity="0.6" />
      <circle cx="310" cy="95" r="1.4" opacity="0.7" />
    </g>

    {/* Glowing Crescent Moon */}
    <g transform="translate(65, 55)">
      <circle cx="0" cy="0" r="26" fill="#FDE047" opacity="0.2" />
      <path
        d="M -12 -18 A 20 20 0 1 0 16 16 A 16 16 0 1 1 -12 -18 Z"
        fill="#FEF08A"
        stroke="#FDE047"
        strokeWidth="1"
      />
    </g>

    {/* Mountain Silhouettes */}
    <path
      d="M -20 180 L 70 120 L 160 175 L 260 115 L 360 180 L 420 165 L 420 320 L -20 320 Z"
      fill="#1E1B4B"
      opacity="0.85"
    />

    {/* Camp Ground */}
    <path
      d="M -10 215 Q 110 195 210 210 Q 310 195 410 215 L 410 320 L -10 320 Z"
      fill="url(#nightGround)"
    />

    {/* Cozy Campfire on the Left */}
    <g transform="translate(70, 255)">
      {/* Campfire Warm Ambient Glow */}
      <circle cx="0" cy="0" r="50" fill="url(#campfireGlow)" />
      {/* Campfire Stones */}
      <ellipse cx="-16" cy="10" rx="7" ry="4" fill="#64748B" />
      <ellipse cx="16" cy="10" rx="7" ry="4" fill="#64748B" />
      <ellipse cx="0" cy="14" rx="9" ry="5" fill="#475569" />
      <ellipse cx="-10" cy="14" rx="8" ry="4.5" fill="#475569" />
      <ellipse cx="10" cy="14" rx="8" ry="4.5" fill="#475569" />
      {/* Wood Logs */}
      <path d="M -18 8 L 18 -4 L 14 -8 L -22 4 Z" fill="#78350F" />
      <path d="M 18 8 L -18 -4 L -14 -8 L 22 4 Z" fill="#92400E" />
      {/* Flames */}
      <path d="M -10 6 Q -15 -14 0 -26 Q 15 -14 10 6 Q 0 10 -10 6 Z" fill="#EF4444" />
      <path d="M -6 6 Q -10 -8 0 -18 Q 10 -8 6 6 Z" fill="#F97316" />
      <path d="M -3 6 Q -5 -3 0 -11 Q 5 -3 3 6 Z" fill="#FDE047" />
      {/* Embers */}
      <circle cx="-4" cy="-30" r="1.5" fill="#FEF08A" />
      <circle cx="6" cy="-34" r="1.2" fill="#F59E0B" />
      <circle cx="2" cy="-42" r="1" fill="#FEF08A" opacity="0.8" />
    </g>

    {/* Pine Trees Silhouette Right */}
    <g fill="#0F172A" opacity="0.95">
      <polygon points="340,165 325,190 355,190" />
      <polygon points="340,180 320,210 360,210" />
      <polygon points="340,200 315,235 365,235" />
      <rect x="337" y="235" width="6" height="15" fill="#78350F" />
    </g>
  </svg>
);

export default PalBackground;
