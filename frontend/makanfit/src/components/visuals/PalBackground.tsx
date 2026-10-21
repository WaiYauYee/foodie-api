import React from 'react';

export type BackgroundTheme =
  | 'garden'
  | 'picnic'
  | 'forest'
  | 'beach'
  | 'night'
  | 'mamak'
  | 'kampung'
  | 'kl_lights'
  | 'food_court'
  | 'raya'
  | 'rainy_day';

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
  {
    id: 'mamak',
    name: 'Mamak Stall',
    emoji: '☕',
    tagline: '24-Hour Lepak Spot',
    lemmyQuote: 'Teh tarik kurang manis satu, roti canai garing! Jom lepak mamak with Lemmy! ☕🫓',
  },
  {
    id: 'kampung',
    name: 'Kampung Morning',
    emoji: '🏡',
    tagline: 'Serene Village Sunrise',
    lemmyQuote: 'Selamat pagi dari kampung! Fresh morning air and peaceful village serenity! 🐓🌴',
  },
  {
    id: 'kl_lights',
    name: 'KL City Lights',
    emoji: '🏙️',
    tagline: 'Gleaming Skyline & Spire',
    lemmyQuote: 'Wah, the shimmering city skyline! Twin Towers look spectacular tonight! 🏙️✨',
  },
  {
    id: 'food_court',
    name: 'Food Court',
    emoji: '🍜',
    tagline: 'Medan Selera Hawker Feast',
    lemmyQuote: 'Aroma of chicken rice and sizzling woks! Malaysian food court is true food paradise! 🍜🥟',
  },
  {
    id: 'raya',
    name: 'Raya Celebration',
    emoji: '✨',
    tagline: 'Pelita & Ketupat Festivity',
    lemmyQuote: 'Selamat Hari Raya! Warm pelita lamps and festive celebrations with good food! 🌙✨',
  },
  {
    id: 'rainy_day',
    name: 'Cozy Rainy Day',
    emoji: '🌧️',
    tagline: 'Cooling Monsoon Drizzle',
    lemmyQuote: 'Pitter-patter sound of cooling rain outside... Perfect weather to stay cozy and hydrated! 🌧️🍵',
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
        {theme === 'mamak' && <MamakScene />}
        {theme === 'kampung' && <KampungScene />}
        {theme === 'kl_lights' && <KLLightsScene />}
        {theme === 'food_court' && <FoodCourtScene />}
        {theme === 'raya' && <RayaScene />}
        {theme === 'rainy_day' && <RainyDayScene />}
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

/* ========================================================================= */
/* 6. MAMAK STALL SCENE                                                      */
/* ========================================================================= */
const MamakScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="mamakNightSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#090D16" />
        <stop offset="60%" stopColor="#1E1B4B" />
        <stop offset="100%" stopColor="#311B92" />
      </linearGradient>
      <linearGradient id="mamakFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#374151" />
        <stop offset="100%" stopColor="#1F2937" />
      </linearGradient>
      <linearGradient id="awningStripe" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#DC2626" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
      <pattern id="mamakAwning" width="28" height="60" patternUnits="userSpaceOnUse">
        <rect width="14" height="60" fill="#DC2626" />
        <rect x="14" width="14" height="60" fill="#FBBF24" />
      </pattern>
    </defs>

    {/* Evening Sky Background */}
    <rect width="400" height="320" fill="url(#mamakNightSky)" />

    {/* Warm Ambient Backlight Glow from Mamak lights */}
    <ellipse cx="200" cy="110" rx="190" ry="80" fill="#F59E0B" opacity="0.2" />

    {/* Distant shophouse outlines */}
    <g fill="#111827" opacity="0.8">
      <rect x="10" y="70" width="70" height="150" />
      <rect x="90" y="85" width="80" height="135" />
      <rect x="310" y="60" width="85" height="160" />
      {/* Lighted windows */}
      <rect x="25" y="90" width="14" height="20" fill="#FEF08A" opacity="0.6" />
      <rect x="48" y="90" width="14" height="20" fill="#FEF08A" opacity="0.4" />
      <rect x="110" y="105" width="16" height="22" fill="#FDE047" opacity="0.7" />
      <rect x="330" y="80" width="16" height="24" fill="#FDE047" opacity="0.5" />
    </g>

    {/* Mamak Stall Canopy / Awning Top */}
    <path
      d="M -10 0 L 410 0 L 410 50 Q 200 68 -10 50 Z"
      fill="url(#mamakAwning)"
      stroke="#B91C1C"
      strokeWidth="2"
    />
    {/* Scalloped Awning Edge */}
    <path
      d="M 0 50 Q 20 62 40 50 Q 60 62 80 50 Q 100 62 120 50 Q 140 62 160 50 Q 180 62 200 50 Q 220 62 240 50 Q 260 62 280 50 Q 300 62 320 50 Q 340 62 360 50 Q 380 62 400 50"
      stroke="#FEF08A"
      strokeWidth="3.5"
      fill="none"
    />

    {/* Fairy lights string below awning */}
    <g>
      <path d="M 0 54 Q 100 72 200 58 Q 300 72 400 54" stroke="#475569" strokeWidth="1.2" fill="none" />
      {[35, 75, 120, 165, 210, 255, 300, 345, 380].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy={59 + (i % 2) * 3} r="6" fill="#FEF08A" opacity="0.3" />
          <circle cx={cx} cy={59 + (i % 2) * 3} r="3" fill={i % 3 === 0 ? '#F43F5E' : i % 3 === 1 ? '#FBBF24' : '#38BDF8'} />
        </g>
      ))}
    </g>

    {/* Mamak Neon Sign */}
    <g transform="translate(200, 32)">
      <rect x="-85" y="-12" width="170" height="24" rx="6" fill="#1E1B4B" stroke="#F59E0B" strokeWidth="1.5" />
      <text x="0" y="4" fill="#FEF08A" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="1.5">
        RESTORAN MAMAK 24 JAM
      </text>
    </g>

    {/* Mamak Tiled Outdoor Ground */}
    <path d="M -10 205 L 410 205 L 410 320 L -10 320 Z" fill="url(#mamakFloor)" />
    {/* Ground perspective tile lines */}
    <g stroke="#4B5563" strokeWidth="1" opacity="0.5">
      <line x1="40" y1="205" x2="0" y2="320" />
      <line x1="120" y1="205" x2="90" y2="320" />
      <line x1="200" y1="205" x2="200" y2="320" />
      <line x1="280" y1="205" x2="310" y2="320" />
      <line x1="360" y1="205" x2="400" y2="320" />
      <line x1="-10" y1="240" x2="410" y2="240" />
      <line x1="-10" y1="280" x2="410" y2="280" />
    </g>

    {/* Stainless steel counter on the left (Roti Canai Station) */}
    <g transform="translate(15, 175)">
      <rect x="0" y="0" width="75" height="70" rx="4" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
      <rect x="4" y="4" width="67" height="12" fill="#CBD5E1" />
      <rect x="10" y="24" width="55" height="35" rx="3" fill="#64748B" opacity="0.6" />
      <text x="37" y="44" fill="#FEF08A" fontSize="8" fontWeight="bold" textAnchor="middle">
        ROTI CANAI
      </text>
      {/* Hot plate & fried dough */}
      <ellipse cx="37" cy="4" rx="20" ry="4" fill="#334155" />
      <ellipse cx="32" cy="3" rx="7" ry="2.5" fill="#FCD34D" stroke="#D97706" strokeWidth="0.8" />
    </g>

    {/* Classic Mamak Metal Round Table & Stools Right */}
    <g transform="translate(340, 235)">
      {/* Metal table top */}
      <ellipse cx="0" cy="0" rx="36" ry="12" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
      <ellipse cx="0" cy="-2" rx="32" ry="10" fill="#E2E8F0" />
      {/* Table leg */}
      <rect x="-4" y="0" width="8" height="40" fill="#64748B" />
      <ellipse cx="0" cy="40" rx="16" ry="5" fill="#475569" />

      {/* Mug of Teh Tarik on Table */}
      <g transform="translate(-10, -10)">
        <rect x="-5" y="-12" width="10" height="13" rx="2" fill="#FEF3C7" stroke="#92400E" strokeWidth="1" />
        <rect x="-4" y="-7" width="8" height="7" fill="#D97706" />
        {/* White froth */}
        <ellipse cx="0" cy="-11" rx="4.5" ry="2" fill="#FFFFFF" />
        {/* Handle */}
        <path d="M 5 -10 C 9 -10, 9 -3, 5 -3" stroke="#92400E" strokeWidth="1" fill="none" />
      </g>

      {/* Glass with Straw (Sirap Ais) */}
      <g transform="translate(12, -8)">
        <rect x="-4" y="-11" width="8" height="12" rx="1.5" fill="#FCE7F3" stroke="#9D174D" strokeWidth="0.8" />
        <rect x="-3.5" y="-7" width="7" height="7" fill="#E11D48" opacity="0.85" />
        <line x1="0" y1="-14" x2="2" y2="0" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Typical red plastic stool */}
      <g transform="translate(-25, 20)">
        <ellipse cx="0" cy="0" rx="12" ry="4" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
        <rect x="-1.5" y="0" width="3" height="15" fill="#B91C1C" />
        <line x1="-8" y1="2" x2="-10" y2="15" stroke="#B91C1C" strokeWidth="1.5" />
        <line x1="8" y1="2" x2="10" y2="15" stroke="#B91C1C" strokeWidth="1.5" />
      </g>
    </g>

    {/* Stepping Platform for Mascot */}
    <ellipse cx="200" cy="275" rx="55" ry="14" fill="#64748B" opacity="0.4" />
  </svg>
);

/* ========================================================================= */
/* 7. KAMPUNG MORNING SCENE                                                  */
/* ========================================================================= */
const KampungScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="kampungSunrise" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FED7AA" />
        <stop offset="35%" stopColor="#FEF08A" />
        <stop offset="70%" stopColor="#BBF7D0" />
        <stop offset="100%" stopColor="#86EFAC" />
      </linearGradient>
      <linearGradient id="kampungGrass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="100%" stopColor="#15803D" />
      </linearGradient>
      <linearGradient id="kampungWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <radialGradient id="kampungSun" cx="30%" cy="30%" r="40%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="40%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Morning Golden Sky */}
    <rect width="400" height="320" fill="url(#kampungSunrise)" />
    {/* Golden Sun */}
    <circle cx="90" cy="70" r="70" fill="url(#kampungSun)" />
    <circle cx="90" cy="70" r="26" fill="#FEF08A" opacity="0.85" />

    {/* Distant Morning Mist and Green Hills */}
    <path d="M -10 160 Q 80 120 180 145 T 410 135 L 410 320 L -10 320 Z" fill="#86EFAC" opacity="0.7" />
    <path d="M -10 185 Q 120 155 240 180 T 410 170 L 410 320 L -10 320 Z" fill="#4ADE80" opacity="0.75" />

    {/* Lush Banana Trees (Pokok Pisang) on the Left */}
    <g transform="translate(45, 140)">
      {/* Trunk */}
      <path d="M 0 80 Q 2 30 -6 0 L 2 0 Q 10 30 8 80 Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1" />
      {/* Broad banana leaves */}
      <path d="M 0 0 C -40 -30, -70 -10, -75 25 C -50 15, -20 10, 0 0 Z" fill="#65A30D" stroke="#3F6212" strokeWidth="1.2" />
      <path d="M 0 0 C -20 -45, -50 -60, -70 -40 C -55 -20, -30 -10, 0 0 Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1.2" />
      <path d="M 0 0 C 20 -45, 50 -60, 65 -35 C 50 -15, 25 -5, 0 0 Z" fill="#65A30D" stroke="#3F6212" strokeWidth="1.2" />
      <path d="M 0 0 C 40 -20, 65 0, 65 30 C 45 15, 20 10, 0 0 Z" fill="#4D7C0F" stroke="#3F6212" strokeWidth="1.2" />
      {/* Banana flower (Jantung Pisang) */}
      <path d="M -2 15 Q -10 30 -2 38 Q 4 30 -2 15 Z" fill="#991B1B" />
    </g>

    {/* Traditional Wooden Malay House on Stilts (Rumah Kampung) Right */}
    <g transform="translate(305, 115)">
      {/* Zinc / Nipah Roof */}
      <polygon points="20,-45 -45,5 85,5" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
      <polygon points="20,-45 85,5 75,10 20,-38" fill="#92400E" />
      {/* Wooden House Body */}
      <rect x="-35" y="5" width="110" height="60" rx="2" fill="url(#kampungWood)" stroke="#451A03" strokeWidth="1.5" />
      {/* Wooden horizontal planks */}
      <line x1="-35" y1="20" x2="75" y2="20" stroke="#78350F" strokeWidth="1" />
      <line x1="-35" y1="35" x2="75" y2="35" stroke="#78350F" strokeWidth="1" />
      <line x1="-35" y1="50" x2="75" y2="50" stroke="#78350F" strokeWidth="1" />
      {/* Traditional louvered windows (Tingkap Kayu) */}
      <rect x="-22" y="16" width="22" height="26" fill="#FDE68A" stroke="#451A03" strokeWidth="1.2" />
      <line x1="-11" y1="16" x2="-11" y2="42" stroke="#451A03" strokeWidth="1.2" />
      <rect x="25" y="16" width="22" height="26" fill="#FDE68A" stroke="#451A03" strokeWidth="1.2" />
      <line x1="36" y1="16" x2="36" y2="42" stroke="#451A03" strokeWidth="1.2" />
      {/* House Stilts (Tiang Rumah) */}
      <rect x="-30" y="65" width="6" height="40" fill="#451A03" />
      <rect x="-10" y="65" width="6" height="40" fill="#451A03" />
      <rect x="15" y="65" width="6" height="40" fill="#451A03" />
      <rect x="40" y="65" width="6" height="40" fill="#451A03" />
      <rect x="65" y="65" width="6" height="40" fill="#451A03" />
      {/* Wooden steps (Tangga Kayu) */}
      <polygon points="-45,100 -30,65 -22,65 -37,100" fill="#B45309" stroke="#78350F" strokeWidth="1" />
    </g>

    {/* Rolling Foreground Kampung Lawn */}
    <path d="M -10 215 Q 110 195 200 210 Q 300 195 410 215 L 410 320 L -10 320 Z" fill="url(#kampungGrass)" />

    {/* Wooden Fence and Kampung Rooster (Ayam Jantan) Left */}
    <g transform="translate(100, 215)">
      {/* Fence posts */}
      <rect x="-20" y="0" width="5" height="35" fill="#78350F" />
      <rect x="15" y="2" width="5" height="35" fill="#78350F" />
      <line x1="-30" y1="10" x2="30" y2="10" stroke="#92400E" strokeWidth="2.5" />
      <line x1="-30" y1="22" x2="30" y2="22" stroke="#92400E" strokeWidth="2.5" />

      {/* Cute Rooster crowing */}
      <g transform="translate(16, -10)">
        <ellipse cx="0" cy="0" rx="9" ry="7" fill="#B91C1C" />
        <circle cx="-6" cy="-6" r="4.5" fill="#D97706" />
        {/* Comb */}
        <polygon points="-8,-12 -5,-10 -3,-12 -2,-8 -9,-7" fill="#DC2626" />
        {/* Beak */}
        <polygon points="-11,-6 -8,-4 -8,-8" fill="#FACC15" />
        {/* Tail feathers */}
        <path d="M 6 -2 Q 14 -12 12 6 Z" fill="#047857" />
        <path d="M 5 0 Q 12 -8 10 7 Z" fill="#1D4ED8" />
      </g>
    </g>

    {/* Mascot stepping grass mound */}
    <ellipse cx="205" cy="275" rx="48" ry="12" fill="#166534" opacity="0.3" />
  </svg>
);

/* ========================================================================= */
/* 8. KL CITY LIGHTS SCENE                                                   */
/* ========================================================================= */
const KLLightsScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="klSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0B091A" />
        <stop offset="45%" stopColor="#1E1338" />
        <stop offset="75%" stopColor="#3B1C54" />
        <stop offset="100%" stopColor="#1A1830" />
      </linearGradient>
      <linearGradient id="twinTowerGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="highwayStreaks" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
      </linearGradient>
    </defs>

    {/* Twilight Dark Sky */}
    <rect width="400" height="320" fill="url(#klSky)" />

    {/* Glowing Crescent Moon & Stars */}
    <g transform="translate(50, 45)">
      <circle cx="0" cy="0" r="14" fill="#FDE047" opacity="0.2" />
      <path d="M -6 -10 A 10 10 0 1 0 8 8 A 8 8 0 1 1 -6 -10 Z" fill="#FEF08A" />
    </g>
    <circle cx="110" cy="30" r="1.2" fill="#FFFFFF" opacity="0.8" />
    <circle cx="150" cy="55" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="260" cy="35" r="1.5" fill="#FFFFFF" opacity="0.85" />
    <circle cx="340" cy="40" r="1" fill="#FFFFFF" opacity="0.7" />

    {/* Background Skyline Silhouette */}
    <g fill="#0F172A" opacity="0.85">
      <rect x="20" y="110" width="40" height="120" />
      <rect x="70" y="130" width="35" height="100" />
      <rect x="290" y="125" width="45" height="110" />
      <rect x="345" y="100" width="40" height="135" />
    </g>

    {/* KL Tower (Menara KL) Left-Center */}
    <g transform="translate(130, 85)">
      {/* Spire Antenna */}
      <line x1="0" y1="-35" x2="0" y2="0" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="0" cy="-35" r="2" fill="#EF4444" />
      {/* Tower Pod / Head */}
      <ellipse cx="0" cy="0" rx="14" ry="7" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
      <ellipse cx="0" cy="-2" rx="11" ry="5" fill="#38BDF8" opacity="0.8" />
      {/* Shaft */}
      <rect x="-3" y="0" width="6" height="130" fill="#94A3B8" />
    </g>

    {/* PETRONAS TWIN TOWERS (Center-Right Iconic Landmark) */}
    <g transform="translate(240, 60)">
      {/* Spire 1 */}
      <line x1="-22" y1="-45" x2="-22" y2="-10" stroke="#F1F5F9" strokeWidth="1.8" />
      <circle cx="-22" cy="-45" r="2" fill="#38BDF8" />
      {/* Tower 1 Tiered Body */}
      <polygon points="-30,-10 -14,-10 -12,25 -32,25" fill="url(#twinTowerGrad)" />
      <polygon points="-33,25 -11,25 -9,75 -35,75" fill="url(#twinTowerGrad)" />
      <polygon points="-36,75 -8,75 -6,155 -38,155" fill="url(#twinTowerGrad)" />

      {/* Spire 2 */}
      <line x1="22" y1="-45" x2="22" y2="-10" stroke="#F1F5F9" strokeWidth="1.8" />
      <circle cx="22" cy="-45" r="2" fill="#38BDF8" />
      {/* Tower 2 Tiered Body */}
      <polygon points="14,-10 30,-10 32,25 12,25" fill="url(#twinTowerGrad)" />
      <polygon points="11,25 33,25 35,75 9,75" fill="url(#twinTowerGrad)" />
      <polygon points="8,75 36,75 38,155 6,155" fill="url(#twinTowerGrad)" />

      {/* Double Decker Skybridge connecting towers */}
      <rect x="-12" y="62" width="24" height="7" rx="1.5" fill="#E2E8F0" stroke="#334155" strokeWidth="1" />
      <line x1="-12" y1="65" x2="12" y2="65" stroke="#0284C7" strokeWidth="1" />

      {/* Illuminated Windows */}
      {[-24, 20].map((baseX, idx) => (
        <g key={idx} fill="#FEF08A" opacity="0.8">
          <circle cx={baseX} cy="0" r="1" />
          <circle cx={baseX + 4} cy="10" r="1" />
          <circle cx={baseX - 2} cy="35" r="1.2" />
          <circle cx={baseX + 5} cy="45" r="1" />
          <circle cx={baseX + 2} cy="90" r="1.2" />
          <circle cx={baseX - 3} cy="110" r="1.2" />
        </g>
      ))}
    </g>

    {/* Observation Deck / Foreground Terrace Floor */}
    <path d="M -10 215 L 410 215 L 410 320 L -10 320 Z" fill="#1E293B" />
    {/* Glass balustrade reflection */}
    <rect x="-10" y="210" width="420" height="8" fill="#38BDF8" opacity="0.4" />

    {/* Highway Light Trails (Speeding cars below) */}
    <path d="M 0 206 Q 180 195 400 206" stroke="url(#highwayStreaks)" strokeWidth="3" fill="none" opacity="0.9" />
    <path d="M 0 209 Q 200 200 400 209" stroke="#EF4444" strokeWidth="1.5" fill="none" opacity="0.8" />

    {/* Center viewing pedestal */}
    <ellipse cx="200" cy="275" rx="55" ry="12" fill="#0F172A" opacity="0.6" />
    <ellipse cx="200" cy="274" rx="48" ry="10" fill="#334155" />
  </svg>
);

/* ========================================================================= */
/* 9. MALAYSIAN FOOD COURT SCENE                                             */
/* ========================================================================= */
const FoodCourtScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="fcCeiling" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="60%" stopColor="#334155" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="fcFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
    </defs>

    {/* Indoor Food Court Upper Wall */}
    <rect width="400" height="320" fill="url(#fcCeiling)" />

    {/* Ceiling fans & industrial beams */}
    <line x1="-10" y1="35" x2="410" y2="35" stroke="#64748B" strokeWidth="2.5" />
    <line x1="80" y1="35" x2="80" y2="55" stroke="#64748B" strokeWidth="2" />
    <ellipse cx="80" cy="55" rx="28" ry="5" fill="#475569" />
    <line x1="320" y1="35" x2="320" y2="55" stroke="#64748B" strokeWidth="2" />
    <ellipse cx="320" cy="55" rx="28" ry="5" fill="#475569" />

    {/* Hawker Stall Signboards along the top */}
    {/* Stall 1: Chicken Rice */}
    <g transform="translate(18, 65)">
      <rect x="0" y="0" width="80" height="42" rx="4" fill="#DC2626" stroke="#FEF08A" strokeWidth="1.5" />
      <text x="40" y="16" fill="#FEF08A" fontSize="8.5" fontWeight="900" textAnchor="middle">
        HAINAN RICE
      </text>
      <text x="40" y="30" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" textAnchor="middle">
        NASI AYAM 🍗
      </text>
    </g>

    {/* Stall 2: Char Kuey Teow */}
    <g transform="translate(112, 65)">
      <rect x="0" y="0" width="85" height="42" rx="4" fill="#D97706" stroke="#FEF3C7" strokeWidth="1.5" />
      <text x="42" y="16" fill="#FEF08A" fontSize="8.5" fontWeight="900" textAnchor="middle">
        PENANG WOK
      </text>
      <text x="42" y="30" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">
        CHAR KUEY TEOW 🦐
      </text>
    </g>

    {/* Stall 3: Laksa Sarawak */}
    <g transform="translate(210, 65)">
      <rect x="0" y="0" width="82" height="42" rx="4" fill="#047857" stroke="#A7F3D0" strokeWidth="1.5" />
      <text x="41" y="16" fill="#FEF08A" fontSize="8.5" fontWeight="900" textAnchor="middle">
        SARAWAK
      </text>
      <text x="41" y="30" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" textAnchor="middle">
        LAKSA & MEE 🍜
      </text>
    </g>

    {/* Stall 4: Cendol & Drinks */}
    <g transform="translate(304, 65)">
      <rect x="0" y="0" width="80" height="42" rx="4" fill="#2563EB" stroke="#BAE6FD" strokeWidth="1.5" />
      <text x="40" y="16" fill="#FEF08A" fontSize="8.5" fontWeight="900" textAnchor="middle">
        AIR BALANG
      </text>
      <text x="40" y="30" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" textAnchor="middle">
        CENDOL & TEA 🍧
      </text>
    </g>

    {/* Stall counter shelves and glass display */}
    <rect x="-10" y="110" width="420" height="45" fill="#475569" stroke="#334155" strokeWidth="1.5" />
    <g fill="#94A3B8" opacity="0.5">
      <rect x="25" y="115" width="65" height="32" rx="2" />
      <rect x="120" y="115" width="70" height="32" rx="2" />
      <rect x="215" y="115" width="70" height="32" rx="2" />
      <rect x="310" y="115" width="70" height="32" rx="2" />
    </g>

    {/* Steaming wok on counter 2 */}
    <ellipse cx="155" cy="115" rx="14" ry="4" fill="#0F172A" />
    <path d="M 152 110 Q 155 100 150 92 M 158 110 Q 161 102 165 95" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none" />

    {/* Food Court Tiled Floor */}
    <path d="M -10 195 L 410 195 L 410 320 L -10 320 Z" fill="url(#fcFloor)" />

    {/* Floor Tile Checker Grid */}
    <g stroke="#94A3B8" strokeWidth="1" opacity="0.5">
      <line x1="-10" y1="230" x2="410" y2="230" />
      <line x1="-10" y1="270" x2="410" y2="270" />
      <line x1="50" y1="195" x2="10" y2="320" />
      <line x1="130" y1="195" x2="100" y2="320" />
      <line x1="210" y1="195" x2="200" y2="320" />
      <line x1="290" y1="195" x2="300" y2="320" />
      <line x1="370" y1="195" x2="400" y2="320" />
    </g>

    {/* Iconic Food Court Round Plastic Table & Colorful Stools Left */}
    <g transform="translate(60, 240)">
      {/* Table */}
      <ellipse cx="0" cy="0" rx="32" ry="10" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
      <rect x="-3" y="0" width="6" height="35" fill="#64748B" />
      <ellipse cx="0" cy="35" rx="14" ry="4" fill="#475569" />
      {/* Plastic Stools (Yellow & Blue) */}
      <ellipse cx="-24" cy="12" rx="10" ry="3.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
      <ellipse cx="24" cy="12" rx="10" ry="3.5" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
    </g>

    {/* Plastic Table & Stools Right */}
    <g transform="translate(340, 240)">
      <ellipse cx="0" cy="0" rx="32" ry="10" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
      <rect x="-3" y="0" width="6" height="35" fill="#64748B" />
      <ellipse cx="0" cy="35" rx="14" ry="4" fill="#475569" />
      <ellipse cx="-22" cy="12" rx="10" ry="3.5" fill="#EC4899" stroke="#BE185D" strokeWidth="1" />
      <ellipse cx="22" cy="12" rx="10" ry="3.5" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
    </g>

    {/* Mascot Stage Mat */}
    <ellipse cx="200" cy="275" rx="50" ry="13" fill="#94A3B8" opacity="0.4" />
  </svg>
);

/* ========================================================================= */
/* 10. RAYA CELEBRATION SCENE                                                */
/* ========================================================================= */
const RayaScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="rayaNight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#064E3B" />
        <stop offset="40%" stopColor="#047857" />
        <stop offset="85%" stopColor="#065F46" />
        <stop offset="100%" stopColor="#022C22" />
      </linearGradient>
      <radialGradient id="pelitaFlameGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
        <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
      </radialGradient>
      <pattern id="ketupatWeave" width="10" height="10" patternUnits="userSpaceOnUse">
        <polygon points="5,0 10,5 5,10 0,5" fill="#84CC16" />
        <polygon points="5,2 8,5 5,8 2,5" fill="#A3E635" />
      </pattern>
    </defs>

    {/* Festive Emerald Night Sky */}
    <rect width="400" height="320" fill="url(#rayaNight)" />

    {/* Golden Crescent Moon and 8-pointed Star of Islam */}
    <g transform="translate(80, 55)">
      <circle cx="0" cy="0" r="28" fill="#FDE047" opacity="0.25" />
      <path d="M -12 -20 A 24 24 0 1 0 18 18 A 19 19 0 1 1 -12 -20 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
      {/* 8-pointed golden star */}
      <g transform="translate(24, -8) scale(0.9)">
        <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FEF08A" />
      </g>
    </g>

    {/* Hanging Ketupat Ornaments along the top */}
    {/* Ketupat 1 Left */}
    <g transform="translate(45, 0)">
      <line x1="0" y1="0" x2="0" y2="70" stroke="#FDE047" strokeWidth="1.2" />
      <g transform="translate(0, 70) rotate(45)">
        <rect x="-14" y="-14" width="28" height="28" rx="2" fill="url(#ketupatWeave)" stroke="#4D7C0F" strokeWidth="1.5" />
      </g>
      {/* Ribbons hanging down */}
      <path d="M -4 90 Q -8 110 -2 125 M 4 90 Q 8 110 2 125" stroke="#84CC16" strokeWidth="2" fill="none" />
    </g>

    {/* Ketupat 2 Right-Center */}
    <g transform="translate(280, 0)">
      <line x1="0" y1="0" x2="0" y2="50" stroke="#FDE047" strokeWidth="1.2" />
      <g transform="translate(0, 50) rotate(45)">
        <rect x="-16" y="-16" width="32" height="32" rx="2" fill="url(#ketupatWeave)" stroke="#4D7C0F" strokeWidth="1.5" />
      </g>
      <path d="M -4 74 Q -8 95 -2 110 M 4 74 Q 8 95 2 110" stroke="#84CC16" strokeWidth="2" fill="none" />
    </g>

    {/* Ketupat 3 Far Right */}
    <g transform="translate(350, 0)">
      <line x1="0" y1="0" x2="0" y2="85" stroke="#FDE047" strokeWidth="1.2" />
      <g transform="translate(0, 85) rotate(45)">
        <rect x="-12" y="-12" width="24" height="24" rx="2" fill="url(#ketupatWeave)" stroke="#4D7C0F" strokeWidth="1.5" />
      </g>
      <path d="M -3 103 Q -6 120 -2 135 M 3 103 Q 6 120 2 135" stroke="#84CC16" strokeWidth="1.8" fill="none" />
    </g>

    {/* Fairy Light Swags */}
    <path d="M 0 35 Q 100 65 200 45 Q 300 65 400 35" stroke="#CA8A04" strokeWidth="1.2" fill="none" />
    {[40, 85, 130, 175, 220, 265, 310, 360].map((cx, i) => (
      <circle key={cx} cx={cx} cy={43 + (i % 2) * 5} r="3" fill="#FEF08A" />
    ))}

    {/* Kampung Night Lawn */}
    <path d="M -10 215 Q 110 195 200 205 Q 310 195 410 215 L 410 320 L -10 320 Z" fill="#022C22" />

    {/* Bamboo Pelita Oil Lamps glowing on bamboo fence */}
    {/* Fence railing */}
    <line x1="-10" y1="240" x2="410" y2="240" stroke="#854D0E" strokeWidth="4" />
    <line x1="-10" y1="256" x2="410" y2="256" stroke="#854D0E" strokeWidth="4" />

    {/* Pelita 1 (Left) */}
    <g transform="translate(60, 240)">
      <rect x="-4" y="-8" width="8" height="26" rx="2" fill="#65A30D" stroke="#3F6212" strokeWidth="1" />
      {/* Glow */}
      <circle cx="0" cy="-14" r="22" fill="url(#pelitaFlameGlow)" />
      {/* Wick & Flame */}
      <line x1="0" y1="-8" x2="0" y2="-12" stroke="#451A03" strokeWidth="1.5" />
      <path d="M -3 -12 Q 0 -22 0 -24 Q 0 -22 3 -12 Z" fill="#F59E0B" />
      <circle cx="0" cy="-15" r="1.5" fill="#FEF08A" />
    </g>

    {/* Pelita 2 (Center Left) */}
    <g transform="translate(130, 240)">
      <rect x="-4" y="-8" width="8" height="26" rx="2" fill="#65A30D" stroke="#3F6212" strokeWidth="1" />
      <circle cx="0" cy="-14" r="22" fill="url(#pelitaFlameGlow)" />
      <line x1="0" y1="-8" x2="0" y2="-12" stroke="#451A03" strokeWidth="1.5" />
      <path d="M -3 -12 Q 0 -22 0 -24 Q 0 -22 3 -12 Z" fill="#F59E0B" />
      <circle cx="0" cy="-15" r="1.5" fill="#FEF08A" />
    </g>

    {/* Pelita 3 (Center Right) */}
    <g transform="translate(270, 240)">
      <rect x="-4" y="-8" width="8" height="26" rx="2" fill="#65A30D" stroke="#3F6212" strokeWidth="1" />
      <circle cx="0" cy="-14" r="22" fill="url(#pelitaFlameGlow)" />
      <line x1="0" y1="-8" x2="0" y2="-12" stroke="#451A03" strokeWidth="1.5" />
      <path d="M -3 -12 Q 0 -22 0 -24 Q 0 -22 3 -12 Z" fill="#F59E0B" />
      <circle cx="0" cy="-15" r="1.5" fill="#FEF08A" />
    </g>

    {/* Pelita 4 (Right) */}
    <g transform="translate(340, 240)">
      <rect x="-4" y="-8" width="8" height="26" rx="2" fill="#65A30D" stroke="#3F6212" strokeWidth="1" />
      <circle cx="0" cy="-14" r="22" fill="url(#pelitaFlameGlow)" />
      <line x1="0" y1="-8" x2="0" y2="-12" stroke="#451A03" strokeWidth="1.5" />
      <path d="M -3 -12 Q 0 -22 0 -24 Q 0 -22 3 -12 Z" fill="#F59E0B" />
      <circle cx="0" cy="-15" r="1.5" fill="#FEF08A" />
    </g>

    {/* Center woven green mat for Lemmy */}
    <ellipse cx="200" cy="275" rx="55" ry="14" fill="#047857" stroke="#10B981" strokeWidth="2" />
  </svg>
);

/* ========================================================================= */
/* 11. COZY RAINY DAY SCENE                                                  */
/* ========================================================================= */
const RainyDayScene: React.FC = () => (
  <svg
    viewBox="0 0 400 320"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="rainySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
      <linearGradient id="cozyInterior" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#78350F" />
        <stop offset="100%" stopColor="#451A03" />
      </linearGradient>
      <radialGradient id="lampWarmth" cx="15%" cy="30%" r="50%">
        <stop offset="0%" stopColor="#FDE047" stopOpacity="0.75" />
        <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Outside Monsoon Gray Sky through windowpane */}
    <rect width="400" height="320" fill="url(#rainySky)" />

    {/* Outside wet tropical foliage */}
    <g fill="#065F46" opacity="0.65">
      <circle cx="50" cy="180" r="60" />
      <circle cx="120" cy="170" r="50" />
      <circle cx="340" cy="175" r="65" />
      <circle cx="280" cy="180" r="45" />
    </g>

    {/* Diagonal Rain Streaks */}
    <g stroke="#E0F2FE" strokeWidth="1.4" opacity="0.6" strokeLinecap="round">
      <line x1="20" y1="10" x2="8" y2="40" />
      <line x1="60" y1="35" x2="48" y2="65" />
      <line x1="110" y1="15" x2="98" y2="45" />
      <line x1="150" y1="40" x2="138" y2="70" />
      <line x1="190" y1="20" x2="178" y2="50" />
      <line x1="230" y1="45" x2="218" y2="75" />
      <line x1="270" y1="15" x2="258" y2="45" />
      <line x1="310" y1="35" x2="298" y2="65" />
      <line x1="350" y1="20" x2="338" y2="50" />
      <line x1="385" y1="45" x2="373" y2="75" />
      <line x1="40" y1="90" x2="28" y2="120" />
      <line x1="130" y1="85" x2="118" y2="115" />
      <line x1="210" y1="95" x2="198" y2="125" />
      <line x1="300" y1="90" x2="288" y2="120" />
      <line x1="365" y1="105" x2="353" y2="135" />
    </g>

    {/* Condensation & Rain droplets on glass */}
    <g fill="#BAE6FD" opacity="0.85">
      <circle cx="75" cy="85" r="2.5" />
      <circle cx="75" cy="92" r="1.5" />
      <circle cx="160" cy="65" r="2.2" />
      <circle cx="160" cy="74" r="1.4" />
      <circle cx="245" cy="80" r="2.5" />
      <circle cx="245" cy="88" r="1.5" />
      <circle cx="330" cy="70" r="2" />
      <circle cx="330" cy="78" r="1.2" />
    </g>

    {/* Window Frame Panes */}
    <rect x="0" y="0" width="400" height="215" fill="none" stroke="#334155" strokeWidth="12" />
    <line x1="200" y1="0" x2="200" y2="215" stroke="#334155" strokeWidth="8" />
    <line x1="0" y1="110" x2="400" y2="110" stroke="#334155" strokeWidth="8" />

    {/* Cozy Wooden Window Sill and Indoor Floor */}
    <rect x="-10" y="210" width="420" height="18" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
    <path d="M -10 228 L 410 228 L 410 320 L -10 320 Z" fill="url(#cozyInterior)" />

    {/* Warm indoor ambient glow on the left */}
    <circle cx="60" cy="100" r="110" fill="url(#lampWarmth)" />

    {/* Steamy Hot Mug of Hot Milo / Kopi on the Sill Right */}
    <g transform="translate(340, 205)">
      {/* Ceramic Mug */}
      <rect x="-10" y="-18" width="20" height="20" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
      <rect x="-8" y="-12" width="16" height="12" fill="#78350F" />
      {/* Mug Handle */}
      <path d="M 10 -14 C 16 -14, 16 -4, 10 -4" stroke="#94A3B8" strokeWidth="2" fill="none" />
      {/* Swirling Warm Steam */}
      <path d="M -4 -20 Q -8 -30 -2 -38 M 4 -20 Q 8 -30 2 -38" stroke="#F1F5F9" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" fill="none" />
    </g>

    {/* Potted Indoor Succulent / Plant on Left Sill */}
    <g transform="translate(60, 205)">
      <polygon points="-8,0 8,0 6,14 -6,14" fill="#EA580C" stroke="#C2410C" strokeWidth="1" />
      <ellipse cx="0" cy="0" rx="8" ry="2" fill="#78350F" />
      <circle cx="-3" cy="-4" r="5" fill="#10B981" />
      <circle cx="3" cy="-4" r="5" fill="#059669" />
      <circle cx="0" cy="-8" r="4.5" fill="#34D399" />
    </g>

    {/* Cozy woven rag rug for Lemmy */}
    <ellipse cx="200" cy="275" rx="55" ry="14" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
    <ellipse cx="200" cy="275" rx="46" ry="10" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
  </svg>
);

export default PalBackground;
