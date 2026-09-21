import { OutfitItem } from '../types/types';

/**
 * Your item SVGs are drawn in the mascot's 200x200 coordinate space, so a
 * plain viewBox would show them off-centre. These crop each item so it sits
 * in the middle of its card.
 */
export const ITEM_VIEWBOX: Record<string, string> = {
  // Eyes
  shades: "57 43 100 100",
  round_specs: "60 55 94 94",
  heart_glasses: '56 50 100 100',
  star_glasses: '56 50 100 100',
  pixel_glasses: '57 43 100 100',

  // Hats
  crown: "60 -24 80 80",
  songkok: "65 -15 70 70",
  straw_hat: "50 -15 100 100",
  sporty_band: "60 10 80 80",
  kopiah: '65 -15 70 70',
  banana_hat: '55 -25 90 90',
  rainbow_cap: '55 -25 90 90',

  // Accessories
  bowtie: "82 101 50 50",
  gold_medal: "80 95 55 55",
  teh_tarik: "120 110 50 50",
  chef_hat: "60 -35 80 80",
  bungaraya: "49 27 50 50",
  halo: "55 -39 90 90",
  kopi_cup: '118 108 52 52',
  satay_skewer: '115 105 55 55',
  mini_fan: '110 105 62 62',
  golden_spoon: '108 105 62 62',
  pandan_charm: '112 105 62 52',
  snack_pouch: '118 108 52 52',

  // background
  bg_garden: "0 0 120 120",
  bg_picnic: "0 0 120 120",
  bg_forest: "0 0 120 120",
  bg_beach: "0 0 120 120",
  bg_night: "0 0 120 120",
  bg_mamak: '0 0 120 120',
  bg_kampung: '0 0 120 120',
  bg_kl_lights: '0 0 120 120',
  bg_food_court: '0 0 120 120',
  bg_raya: '0 0 120 120',
  bg_rainy_day: '0 0 120 120',
};

export const SHOP_ITEMS: OutfitItem[] = [
  {
    id: "shades",
    name: "Cool Shades",
    price: 150,
    category: "eyes",
    owned: false,
    svgElement: (
      <g transform="translate(107, 94)">
        <rect
          x="-30"
          y="-10"
          width="22"
          height="18"
          rx="4"
          fill="#0F172A"
          stroke="#334155"
          strokeWidth="1.5"
        />
        <path
          d="M -26 -6 L -12 4"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <rect
          x="8"
          y="-10"
          width="22"
          height="18"
          rx="4"
          fill="#0F172A"
          stroke="#334155"
          strokeWidth="1.5"
        />
        <path
          d="M 12 -6 L 26 4"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M -8 -4 Q 0 -8 8 -4"
          stroke="#334155"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M -30 -4 L -38 -8"
          stroke="#334155"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 30 -4 L 38 -8"
          stroke="#334155"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    ),
  },
  {
    id: "round_specs",
    name: "Retro Round Specs",
    price: 130,
    category: "eyes",
    owned: false,
    svgElement: (
      <g transform="translate(107, 94)">
        <circle
          cx="-16"
          cy="0"
          r="11"
          fill="#F0FDFA"
          fillOpacity="0.3"
          stroke="#D97706"
          strokeWidth="2"
        />
        <circle
          cx="16"
          cy="0"
          r="11"
          fill="#F0FDFA"
          fillOpacity="0.3"
          stroke="#D97706"
          strokeWidth="2"
        />
        <path
          d="M -5 0 Q 0 -4 5 0"
          stroke="#D97706"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M -27 0 L -36 -4"
          stroke="#D97706"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 27 0 L 36 -4"
          stroke="#D97706"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M -20 -4 L -14 2"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 12 -4 L 18 2"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>
    ),
  },
  {
    id: 'heart_glasses',
    name: 'Heart Glasses',
    price: 180,
    category: 'eyes',
    owned: false,
    svgElement: (
      <g transform="translate(107, 94)">
        {/* Left Heart */}
        <g transform="translate(-16, 0) scale(1.1)">
          <path
            d="M 0 -2 C -5 -9, -13 -3, -11 4 C -9 9, 0 13, 0 13 C 0 13, 9 9, 11 4 C 13 -3, 5 -9, 0 -2 Z"
            fill="#FB7185"
            stroke="#E11D48"
            strokeWidth="1.8"
          />
          <circle cx="-3" cy="-1" r="2" fill="#FFFFFF" opacity="0.8" />
        </g>
        {/* Right Heart */}
        <g transform="translate(16, 0) scale(1.1)">
          <path
            d="M 0 -2 C -5 -9, -13 -3, -11 4 C -9 9, 0 13, 0 13 C 0 13, 9 9, 11 4 C 13 -3, 5 -9, 0 -2 Z"
            fill="#FB7185"
            stroke="#E11D48"
            strokeWidth="1.8"
          />
          <circle cx="-3" cy="-1" r="2" fill="#FFFFFF" opacity="0.8" />
        </g>
        {/* Bridge & Temples */}
        <path d="M -6 0 Q 0 -3 6 0" stroke="#BE123C" strokeWidth="2" fill="none" />
        <path d="M -27 0 L -36 -4" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" />
        <path d="M 27 0 L 36 -4" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'star_glasses',
    name: 'Star Glasses',
    price: 190,
    category: 'eyes',
    owned: false,
    svgElement: (
      <g transform="translate(107, 94)">
        {/* Left Star */}
        <g transform="translate(-16, 0) scale(1.15)">
          <polygon
            points="0,-11 3.5,-3 11,-2 5,4 7,12 0,7 -7,12 -5,4 -11,-2 -3.5,-3"
            fill="#FDE047"
            stroke="#D97706"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="-2" cy="-2" r="1.8" fill="#FFFFFF" opacity="0.8" />
        </g>
        {/* Right Star */}
        <g transform="translate(16, 0) scale(1.15)">
          <polygon
            points="0,-11 3.5,-3 11,-2 5,4 7,12 0,7 -7,12 -5,4 -11,-2 -3.5,-3"
            fill="#FDE047"
            stroke="#D97706"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="-2" cy="-2" r="1.8" fill="#FFFFFF" opacity="0.8" />
        </g>
        <path d="M -6 0 Q 0 -4 6 0" stroke="#B45309" strokeWidth="2" fill="none" />
        <path d="M -27 0 L -36 -4" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        <path d="M 27 0 L 36 -4" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'pixel_glasses',
    name: 'Pixel Glasses',
    price: 220,
    category: 'eyes',
    owned: false,
    svgElement: (
      <g transform="translate(107, 94)">
        {/* Left stepped pixel lens */}
        <g fill="#000000">
          <rect x="-30" y="-8" width="8" height="6" />
          <rect x="-24" y="-5" width="8" height="6" />
          <rect x="-18" y="-2" width="10" height="7" />
          {/* Lens body */}
          <rect x="-30" y="-2" width="22" height="10" />
          {/* White pixel shine */}
          <rect x="-28" y="-4" width="3" height="3" fill="#FFFFFF" />
          <rect x="-25" y="-1" width="3" height="3" fill="#FFFFFF" />
        </g>
        {/* Right stepped pixel lens */}
        <g fill="#000000">
          <rect x="8" y="-2" width="10" height="7" />
          <rect x="16" y="-5" width="8" height="6" />
          <rect x="22" y="-8" width="8" height="6" />
          {/* Lens body */}
          <rect x="8" y="-2" width="22" height="10" />
          {/* White pixel shine */}
          <rect x="10" y="-1" width="3" height="3" fill="#FFFFFF" />
          <rect x="13" y="-4" width="3" height="3" fill="#FFFFFF" />
        </g>
        {/* Bridge */}
        <rect x="-8" y="-2" width="16" height="4" fill="#000000" />
        {/* Pixel arms */}
        <rect x="-36" y="-8" width="6" height="4" fill="#000000" />
        <rect x="30" y="-8" width="6" height="4" fill="#000000" />
      </g>
    ),
  },
  {
    id: "crown",
    name: "Royal Crown",
    price: 350,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(100, 22)">
        <path
          d="M -26 6 L -30 -16 L -12 -4 L 0 -22 L 12 -4 L 30 -16 L 26 6 Z"
          fill="#FACC15"
          stroke="#CA8A04"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle
          cx="0"
          cy="-14"
          r="3.5"
          fill="#EF4444"
          stroke="#B91C1C"
          strokeWidth="0.8"
        />
        <circle
          cx="-18"
          cy="-10"
          r="2.5"
          fill="#3B82F6"
          stroke="#1D4ED8"
          strokeWidth="0.8"
        />
        <circle
          cx="18"
          cy="-10"
          r="2.5"
          fill="#3B82F6"
          stroke="#1D4ED8"
          strokeWidth="0.8"
        />
        <rect x="-24" y="6" width="48" height="4" rx="2" fill="#EAB308" />
      </g>
    ),
  },
  {
    id: "songkok",
    name: "Classic Songkok",
    price: 180,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(100, 20)">
        <path
          d="M -22 6 L -20 -12 Q 0 -15 20 -12 L 22 6 Z"
          fill="#0F172A"
          stroke="#1E293B"
          strokeWidth="1.5"
        />
        <rect x="-22" y="4" width="44" height="3" fill="#F59E0B" />
      </g>
    ),
  },
  {
    id: "straw_hat",
    name: "Kampung Straw Hat",
    price: 120,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(100, 24)">
        <path
          d="M 0 -22 L 36 6 L -36 6 Z"
          fill="#FDE68A"
          stroke="#D97706"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M 0 -22 L 20 6"
          stroke="#D97706"
          strokeWidth="1"
          opacity="0.6"
        />
        <path
          d="M 0 -22 L -20 6"
          stroke="#D97706"
          strokeWidth="1"
          opacity="0.6"
        />
        <ellipse
          cx="0"
          cy="6"
          rx="36"
          ry="6"
          fill="#FCD34D"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        <path
          d="M -16 6 Q 0 16 16 6"
          stroke="#DC2626"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    ),
  },
  {
    id: "sporty_band",
    name: "Runner Headband",
    price: 160,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(100, 48)">
        <path
          d="M -28 0 Q 0 -6 28 0"
          stroke="#0284C7"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M -26 0 Q 0 -6 26 0"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </g>
    ),
  },
  {
    id: "kopiah",
    name: "Classic Kopiah",
    price: 150,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(100, 24)">
        <path
          d="M -24 5 Q -22 -16 0 -19 Q 22 -16 24 5 Q 0 11 -24 5 Z"
          fill="#334155"
          stroke="#1E293B"
          strokeWidth="1.5"
        />
        <path
          d="M -20 -2 Q 0 3 20 -2"
          stroke="#64748B"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M -16 -8 Q 0 -12 16 -8"
          stroke="#94A3B8"
          strokeWidth="1"
          opacity="0.7"
        />
      </g>
    ),
  },
  {
    id: "banana_hat",
    name: "Banana Hat",
    price: 220,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(100, 35) rotate(-8)">
        <path
          d="M -38 -3 Q -22 -28 4 -25 Q 27 -22 38 -4 Q 22 -13 5 -11 Q -15 -9 -38 -3 Z"
          fill="#FACC15"
          stroke="#CA8A04"
          strokeWidth="1.8"
        />
        <path
          d="M -36 -4 Q -17 -15 4 -13 Q 23 -11 36 -4"
          stroke="#EAB308"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 35 -4 Q 40 -7 39 -12"
          stroke="#92400E"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    ),
  },
  {
    id: "rainbow_cap",
    name: "Rainbow Cap",
    price: 190,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(100, 30)">
        <path
          d="M -28 4 Q -25 -18 0 -22 Q 25 -18 28 4 Z"
          fill="#60A5FA"
          stroke="#2563EB"
          strokeWidth="1.5"
        />
        <path
          d="M -28 4 Q 0 -4 28 4"
          stroke="#1D4ED8"
          strokeWidth="5"
          fill="none"
        />
        <path
          d="M -15 -4 Q -7 -15 0 -4 Q 7 -15 15 -4"
          stroke="#F472B6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    ),
  },
  {
    id: "bowtie",
    name: "Fancy Bowtie",
    price: 120,
    category: "accessory",
    owned: true,
    svgElement: (
      <g transform="translate(107, 126)">
        <path
          d="M 0 0 L -18 -8 Q -16 0 -18 8 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 0 0 L 18 -8 Q 16 0 18 8 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <ellipse
          cx="0"
          cy="0"
          rx="5"
          ry="6"
          fill="#EF4444"
          stroke="#991B1B"
          strokeWidth="1.5"
        />
        <circle cx="-1" cy="-1" r="1.5" fill="#FFFFFF" fillOpacity="0.6" />
      </g>
    ),
  },
  {
    id: "gold_medal",
    name: "Champion Gold Medal",
    price: 260,
    category: "accessory",
    owned: false,
    svgElement: (
      <g transform="translate(107, 126)">
        <path
          d="M -12 -16 L 0 0 L -8 0 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="1"
        />
        <path
          d="M 12 -16 L 0 0 L 8 0 Z"
          fill="#2563EB"
          stroke="#1D4ED8"
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="5"
          r="9"
          fill="#FACC15"
          stroke="#CA8A04"
          strokeWidth="1.8"
        />
        <circle
          cx="0"
          cy="5"
          r="7"
          fill="#FDE047"
          stroke="#EAB308"
          strokeWidth="1"
          strokeDasharray="2 1.5"
        />
        <path
          d="M 0 1 L 1.5 4.5 L 5 5 L 2.5 7.5 L 3 11 L 0 9.5 L -3 11 L -2.5 7.5 L -5 5 L -1.5 4.5 Z"
          fill="#B45309"
        />
      </g>
    ),
  },
  {
    id: "teh_tarik",
    name: "Boba Teh Tarik Cup",
    price: 180,
    category: "accessory",
    owned: false,
    svgElement: (
      <g transform="translate(142, 138)">
        <path
          d="M -7 -14 L 7 -14 L 5 12 L -5 12 Z"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        <path d="M -6 -8 L 6 -8 L 4.5 11 L -4.5 11 Z" fill="#D97706" />
        <ellipse cx="0" cy="-8" rx="6" ry="2" fill="#FDE68A" />
        <circle cx="-2" cy="7" r="1.8" fill="#1E1B4B" />
        <circle cx="2" cy="8" r="1.8" fill="#1E1B4B" />
        <circle cx="0" cy="3" r="1.8" fill="#1E1B4B" />
        <path
          d="M 0 -8 L 3 -20"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    ),
  },
  {
    id: 'kopi_cup',
    name: 'Kopi O Cup',
    price: 190,
    category: 'accessory',
    owned: false,
    svgElement: (
      <g transform="translate(142, 138)">
        {/* Saucer */}
        <ellipse cx="0" cy="10" rx="14" ry="4" fill="#F8FAFC" stroke="#059669" strokeWidth="1.2" />
        {/* Porcelain Kopitiam Cup Body */}
        <path d="M -10 -8 L 10 -8 L 8 8 L -8 8 Z" fill="#FFFFFF" stroke="#059669" strokeWidth="1.4" />
        {/* Green Floral Kopitiam motif */}
        <path d="M -4 0 Q 0 -3 4 0 Q 0 3 -4 0" fill="#059669" />
        {/* Dark Kopi O Liquid */}
        <ellipse cx="0" cy="-7" rx="8" ry="2.5" fill="#1C1917" />
        {/* Porcelain Handle */}
        <path d="M 10 -6 C 15 -6, 15 4, 9 4" stroke="#059669" strokeWidth="1.6" fill="none" />
        {/* Silver teaspoon */}
        <line x1="-3" y1="-8" x2="-8" y2="-18" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        {/* Steam */}
        <path d="M 0 -10 Q -2 -18 1 -24" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    ),
  },
  {
    id: 'satay_skewer',
    name: 'Satay Skewer',
    price: 210,
    category: 'accessory',
    owned: false,
    svgElement: (
      <g transform="translate(142, 138)">
        {/* Skewer Bamboo stick */}
        <line x1="-12" y1="18" x2="16" y2="-22" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
        {/* Grilled Satay Meat Chunk 1 */}
        <rect x="6" y="-18" width="10" height="9" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1" transform="rotate(35 11 -13)" />
        <circle cx="11" cy="-14" r="1.5" fill="#451A03" />
        {/* Chunk 2 */}
        <rect x="0" y="-10" width="10" height="9" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="1" transform="rotate(35 5 -5)" />
        <circle cx="5" cy="-6" r="1.5" fill="#451A03" />
        {/* Chunk 3 */}
        <rect x="-6" y="-2" width="10" height="9" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1" transform="rotate(35 -1 3)" />
        {/* Cucumber Slice garnish */}
        <circle cx="-6" cy="10" r="5" fill="#86EFAC" stroke="#16A34A" strokeWidth="1" />
        <circle cx="-6" cy="10" r="2.5" fill="#DCFCE7" />
      </g>
    ),
  },
  {
    id: 'mini_fan',
    name: 'Mini Hand Fan',
    price: 200,
    category: 'accessory',
    owned: false,
    svgElement: (
      <g transform="translate(142, 138)">
        {/* Handle */}
        <rect x="-4" y="0" width="8" height="22" rx="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.2" />
        <circle cx="0" cy="8" r="2" fill="#FFFFFF" />
        {/* Fan Guard Head */}
        <circle cx="0" cy="-10" r="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
        {/* Fan Blades (Spinning) */}
        <ellipse cx="0" cy="-10" rx="10" ry="3" fill="#38BDF8" />
        <ellipse cx="0" cy="-10" rx="3" ry="10" fill="#38BDF8" />
        <circle cx="0" cy="-10" r="3.5" fill="#0284C7" />
        {/* Breeze breeze curves */}
        <path d="M -14 -14 Q -18 -20 -12 -24" stroke="#7DD3FC" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M 4 -22 Q 10 -26 14 -20" stroke="#7DD3FC" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "golden_spoon",
    name: "Golden Spoon",
    price: 380,
    category: "accessory",
    owned: false,
    svgElement: (
      <g transform="translate(143, 132) rotate(-25)">
        <ellipse
          cx="0"
          cy="-15"
          rx="8"
          ry="12"
          fill="#FDE68A"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        <path
          d="M 0 -4 L 0 27"
          stroke="#D97706"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M -3 20 L 3 20"
          stroke="#FACC15"
          strokeWidth="2"
        />
      </g>
    ),
  },

  {
    id: "pandan_charm",
    name: "Pandan Leaf Charm",
    price: 210,
    category: "accessory",
    owned: false,
    svgElement: (
      <g transform="translate(143, 132) rotate(-12)">
        <path
          d="M 0 5 Q -20 -15 -30 -3 Q -17 8 0 9 Z"
          fill="#22C55E"
          stroke="#15803D"
          strokeWidth="1.3"
        />
        <path
          d="M 0 5 Q 8 -20 20 -22 Q 19 -5 4 8 Z"
          fill="#16A34A"
          stroke="#166534"
          strokeWidth="1.3"
        />
        <path
          d="M 0 7 Q 22 -4 29 5 Q 14 13 0 10 Z"
          fill="#4ADE80"
          stroke="#15803D"
          strokeWidth="1.3"
        />
        <circle cx="0" cy="7" r="4" fill="#FACC15" />
      </g>
    ),
  },

  {
    id: "snack_pouch",
    name: "Snack Pouch",
    price: 280,
    category: "accessory",
    owned: false,
    svgElement: (
      <g transform="translate(142, 137)">
        <path
          d="M -12 -15 H 12 L 10 14 H -10 Z"
          fill="#FDE68A"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        <path
          d="M -12 -15 L -8 -20 H 8 L 12 -15"
          fill="#FBBF24"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        <circle cx="0" cy="-1" r="6" fill="#EF4444" />
        <path
          d="M -3 -1 L 0 2 L 4 -3"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M -6 8 H 6"
          stroke="#D97706"
          strokeWidth="1"
        />
      </g>
    ),
  },
  {
    id: "chef_hat",
    name: "Chef Toque",
    price: 250,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(100, 18)">
        <path
          d="M -22 6 L 22 6 L 20 0 L -20 0 Z"
          fill="#F8FAFC"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <path
          d="M -20 0 C -28 -12, -18 -26, -10 -22 C -6 -32, 6 -32, 10 -22 C 18 -26, 28 -12, 20 0 Z"
          fill="#FFFFFF"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="-20" y="2" width="40" height="4" fill="#10B981" />
      </g>
    ),
  },
  {
    id: "bungaraya",
    name: "Bunga Raya",
    price: 200,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(74, 52)">
        <g transform="rotate(-15)">
          <circle cx="-6" cy="-4" r="7" fill="#E11D48" />
          <circle cx="6" cy="-4" r="7" fill="#E11D48" />
          <circle cx="-7" cy="5" r="7" fill="#E11D48" />
          <circle cx="7" cy="5" r="7" fill="#E11D48" />
          <circle cx="0" cy="-8" r="7" fill="#F43F5E" />
          <circle cx="0" cy="1" r="4" fill="#9F1239" />
          <path
            d="M 0 1 Q 4 10 12 12"
            stroke="#FBBF24"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="12" cy="12" r="2.5" fill="#F59E0B" />
        </g>
      </g>
    ),
  },
  {
    id: "halo",
    name: "Healthy Halo",
    price: 500,
    category: "hat",
    owned: false,
    svgElement: (
      <g transform="translate(100, 6)">
        <ellipse
          cx="0"
          cy="0"
          rx="36"
          ry="7"
          fill="none"
          stroke="#FDE047"
          strokeWidth="4"
          opacity="0.9"
        />
        <ellipse
          cx="0"
          cy="0"
          rx="36"
          ry="7"
          fill="none"
          stroke="#FACC15"
          strokeWidth="1.5"
        />
      </g>
    ),
  },
  {
    id: "bg_garden",
    name: "Zen Garden",
    price: 0,
    category: "scenery",
    owned: true,
    svgElement: (
      <g>
        <defs>
          <linearGradient id="bgThumbGarden" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="50%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#bgThumbGarden)" />
        <circle cx="28" cy="28" r="14" fill="#FDE047" opacity="0.8" />
        <circle cx="28" cy="28" r="8" fill="#FACC15" />
        <path
          d="M -10 90 Q 30 65 70 85 T 130 80 L 130 120 L -10 120 Z"
          fill="#34D399"
        />
        <path
          d="M -10 100 Q 40 85 80 95 T 130 92 L 130 120 L -10 120 Z"
          fill="#059669"
        />
        <ellipse
          cx="60"
          cy="108"
          rx="10"
          ry="4"
          fill="#CBD5E1"
          stroke="#94A3B8"
          strokeWidth="1"
        />
        <ellipse
          cx="40"
          cy="112"
          rx="8"
          ry="3.5"
          fill="#E2E8F0"
          stroke="#94A3B8"
          strokeWidth="1"
        />
        <circle cx="95" cy="88" r="7" fill="#E11D48" />
        <circle cx="95" cy="88" r="2.5" fill="#FDE047" />
      </g>
    ),
  },
  {
    id: "bg_picnic",
    name: "Cozy Picnic",
    price: 180,
    category: "scenery",
    owned: false,
    svgElement: (
      <g>
        <defs>
          <linearGradient id="bgThumbPicnic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="60%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#86EFAC" />
          </linearGradient>
          <pattern
            id="picnicGingham"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <rect width="12" height="12" fill="#FFFFFF" />
            <rect width="6" height="12" fill="#F87171" opacity="0.5" />
            <rect width="12" height="6" fill="#F87171" opacity="0.5" />
            <rect width="6" height="6" fill="#DC2626" opacity="0.8" />
          </pattern>
        </defs>
        <rect width="120" height="120" fill="url(#bgThumbPicnic)" />
        <ellipse cx="60" cy="118" rx="75" ry="35" fill="#22C55E" />
        <polygon
          points="25,82 95,82 108,114 12,114"
          fill="url(#picnicGingham)"
          stroke="#DC2626"
          strokeWidth="1.2"
        />
        <rect
          x="30"
          y="88"
          width="18"
          height="14"
          rx="3"
          fill="#D97706"
          stroke="#92400E"
          strokeWidth="1"
        />
        <path
          d="M 33 88 C 33 80, 45 80, 45 88"
          stroke="#92400E"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 75 96 A 14 14 0 0 1 95 96 Z"
          fill="#EF4444"
          stroke="#16A34A"
          strokeWidth="1.8"
        />
      </g>
    ),
  },
  {
    id: "bg_forest",
    name: "Rainforest",
    price: 240,
    category: "scenery",
    owned: false,
    svgElement: (
      <g>
        <defs>
          <linearGradient id="bgThumbForest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="50%" stopColor="#047857" />
            <stop offset="100%" stopColor="#022C22" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#bgThumbForest)" />
        <path d="M 0 0 L 35 45 L 0 55 Z" fill="#065F46" opacity="0.8" />
        <path d="M 120 0 L 80 50 L 120 60 Z" fill="#065F46" opacity="0.8" />
        <path d="M -10 120 Q 30 70 80 120 Z" fill="#10B981" opacity="0.6" />
        <path d="M 40 120 Q 90 75 130 120 Z" fill="#059669" />
        <circle cx="35" cy="40" r="4" fill="#FEF08A" opacity="0.4" />
        <circle cx="35" cy="40" r="2" fill="#FACC15" />
        <circle cx="85" cy="32" r="5" fill="#FEF08A" opacity="0.4" />
        <circle cx="85" cy="32" r="2.5" fill="#FDE047" />
        <circle cx="60" cy="65" r="3.5" fill="#FEF08A" opacity="0.4" />
        <circle cx="60" cy="65" r="1.8" fill="#FDE047" />
      </g>
    ),
  },
  {
    id: "bg_beach",
    name: "Sunny Beach",
    price: 280,
    category: "scenery",
    owned: false,
    svgElement: (
      <g>
        <defs>
          <linearGradient id="bgThumbBeach" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="45%" stopColor="#BAE6FD" />
            <stop offset="70%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#bgThumbBeach)" />
        <circle cx="95" cy="25" r="12" fill="#FBBF24" opacity="0.9" />
        <path
          d="M -10 75 Q 30 68 70 74 T 130 70 L 130 95 L -10 95 Z"
          fill="#0D9488"
          opacity="0.8"
        />
        <path
          d="M -10 82 Q 35 78 75 83 T 130 80 L 130 120 L -10 120 Z"
          fill="#FDE68A"
        />
        <path
          d="M 22 105 Q 26 65 36 50"
          stroke="#92400E"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 36 50 Q 15 45 10 55"
          stroke="#16A34A"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 36 50 Q 55 42 62 52"
          stroke="#16A34A"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 36 50 Q 38 32 32 28"
          stroke="#15803D"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="85" cy="102" rx="4" ry="3" fill="#F43F5E" />
      </g>
    ),
  },
  {
    id: "bg_night",
    name: "Campfire Night",
    price: 350,
    category: "scenery",
    owned: false,
    svgElement: (
      <g>
        <defs>
          <linearGradient id="bgThumbNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B0F19" />
            <stop offset="60%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#bgThumbNight)" />
        <path
          d="M 98 16 A 10 10 0 1 0 92 34 A 8 8 0 1 1 98 16 Z"
          fill="#FDE047"
        />
        <circle cx="20" cy="22" r="1.2" fill="#FFFFFF" />
        <circle cx="45" cy="15" r="1" fill="#FFFFFF" />
        <circle cx="65" cy="28" r="1.5" fill="#FFFFFF" />
        <circle cx="30" cy="45" r="1" fill="#FFFFFF" />
        <polygon points="-10,95 35,55 80,95" fill="#1E293B" opacity="0.9" />
        <polygon points="40,95 85,62 130,95" fill="#0F172A" />
        <rect y="92" width="120" height="28" fill="#0F172A" />
        <ellipse cx="60" cy="112" rx="14" ry="4" fill="#78350F" />
        <path
          d="M 54 112 L 66 102"
          stroke="#9A3412"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 66 112 L 54 102"
          stroke="#9A3412"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M 60 106 Q 66 94 60 88 Q 54 94 60 106 Z" fill="#F97316" />
        <path d="M 60 105 Q 63 97 60 92 Q 57 97 60 105 Z" fill="#FDE047" />
        <circle cx="63" cy="84" r="1" fill="#FBBF24" />
        <circle cx="57" cy="81" r="0.8" fill="#FBBF24" />
      </g>
    ),
  },
  {
    id: 'bg_mamak',
    name: 'Mamak Stall',
    price: 220,
    category: 'scenery',
    owned: false,
    svgElement: (
      <g>
        <rect width="120" height="120" fill="#1E1B4B" />
        {/* Yellow-red striped awning top */}
        <polygon points="0,0 120,0 120,25 0,25" fill="#DC2626" />
        <line x1="20" y1="0" x2="20" y2="25" stroke="#FBBF24" strokeWidth="5" />
        <line x1="50" y1="0" x2="50" y2="25" stroke="#FBBF24" strokeWidth="5" />
        <line x1="80" y1="0" x2="80" y2="25" stroke="#FBBF24" strokeWidth="5" />
        <line x1="110" y1="0" x2="110" y2="25" stroke="#FBBF24" strokeWidth="5" />
        {/* Neon sign */}
        <rect x="25" y="32" width="70" height="14" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
        <text x="60" y="42" fill="#FEF08A" fontSize="7" fontWeight="bold" textAnchor="middle">
          MAMAK 24J
        </text>
        {/* Floor & Table */}
        <rect y="80" width="120" height="40" fill="#374151" />
        <ellipse cx="60" cy="98" rx="28" ry="8" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
        {/* Teh Tarik cup */}
        <rect x="56" y="88" width="8" height="9" rx="1.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1" />
        <rect x="57" y="91" width="6" height="5" fill="#D97706" />
      </g>
    ),
  },
  {
    id: 'bg_kampung',
    name: 'Kampung Morning',
    price: 250,
    category: 'scenery',
    owned: false,
    svgElement: (
      <g>
        <rect width="120" height="120" fill="#FEF08A" />
        <circle cx="30" cy="35" r="16" fill="#FDE047" />
        <path d="M -10 70 Q 30 55 80 65 T 130 60 L 130 120 L -10 120 Z" fill="#86EFAC" />
        {/* Wooden House on Stilts */}
        <polygon points="85,35 60,50 110,50" fill="#78350F" />
        <rect x="68" y="50" width="34" height="22" fill="#B45309" />
        <rect x="74" y="55" width="8" height="8" fill="#FEF3C7" />
        <line x1="72" y1="72" x2="72" y2="86" stroke="#451A03" strokeWidth="1.5" />
        <line x1="98" y1="72" x2="98" y2="86" stroke="#451A03" strokeWidth="1.5" />
        {/* Green Lawn */}
        <path d="M -10 82 Q 60 72 130 82 L 130 120 L -10 120 Z" fill="#15803D" />
        {/* Banana Palm */}
        <path d="M 22 84 Q 24 55 15 45" stroke="#65A30D" strokeWidth="2.5" fill="none" />
        <circle cx="15" cy="45" r="8" fill="#84CC16" />
      </g>
    ),
  },
  {
    id: 'bg_kl_lights',
    name: 'KL City Lights',
    price: 320,
    category: 'scenery',
    owned: false,
    svgElement: (
      <g>
        <rect width="120" height="120" fill="#1E1338" />
        <circle cx="20" cy="20" r="6" fill="#FEF08A" />
        {/* Twin Towers Silhouette */}
        <line x1="68" y1="12" x2="68" y2="28" stroke="#E2E8F0" strokeWidth="1.2" />
        <polygon points="62,28 74,28 72,90 64,90" fill="#64748B" />
        <line x1="86" y1="12" x2="86" y2="28" stroke="#E2E8F0" strokeWidth="1.2" />
        <polygon points="80,28 92,28 90,90 82,90" fill="#64748B" />
        <line x1="72" y1="55" x2="82" y2="55" stroke="#94A3B8" strokeWidth="2" />
        {/* KL Tower */}
        <line x1="38" y1="30" x2="38" y2="90" stroke="#94A3B8" strokeWidth="1.5" />
        <ellipse cx="38" cy="45" rx="6" ry="3" fill="#38BDF8" />
        {/* City Floor & Light trails */}
        <rect y="88" width="120" height="32" fill="#0F172A" />
        <path d="M 0 92 Q 60 88 120 92" stroke="#EF4444" strokeWidth="1.8" fill="none" />
        <path d="M 0 96 Q 60 92 120 96" stroke="#F59E0B" strokeWidth="1.8" fill="none" />
      </g>
    ),
  },
  {
    id: 'bg_food_court',
    name: 'Food Court',
    price: 260,
    category: 'scenery',
    owned: false,
    svgElement: (
      <g>
        <rect width="120" height="120" fill="#334155" />
        {/* Stalls signs */}
        <rect x="8" y="25" width="28" height="14" rx="2" fill="#DC2626" />
        <text x="22" y="35" fill="#FEF08A" fontSize="5" fontWeight="bold" textAnchor="middle">
          RICE
        </text>
        <rect x="44" y="25" width="32" height="14" rx="2" fill="#D97706" />
        <text x="60" y="35" fill="#FFFFFF" fontSize="5" fontWeight="bold" textAnchor="middle">
          NOODLES
        </text>
        <rect x="84" y="25" width="28" height="14" rx="2" fill="#047857" />
        <text x="98" y="35" fill="#FEF08A" fontSize="5" fontWeight="bold" textAnchor="middle">
          DRINKS
        </text>
        {/* Counter */}
        <rect y="42" width="120" height="25" fill="#475569" />
        {/* Tiled Floor */}
        <rect y="67" width="120" height="53" fill="#E2E8F0" />
        {/* Red plastic round table */}
        <ellipse cx="60" cy="95" rx="24" ry="7" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
        <ellipse cx="38" cy="102" rx="7" ry="2.5" fill="#FACC15" />
        <ellipse cx="82" cy="102" rx="7" ry="2.5" fill="#3B82F6" />
      </g>
    ),
  },
  {
    id: 'bg_raya',
    name: 'Raya Celebration',
    price: 300,
    category: 'scenery',
    owned: false,
    svgElement: (
      <g>
        <rect width="120" height="120" fill="#064E3B" />
        {/* Moon */}
        <path d="M 25 15 A 12 12 0 1 0 40 32 A 9 9 0 1 1 25 15 Z" fill="#FACC15" />
        {/* Hanging Ketupat */}
        <line x1="60" y1="0" x2="60" y2="25" stroke="#FDE047" strokeWidth="1" />
        <g transform="translate(60, 30) rotate(45)">
          <rect x="-7" y="-7" width="14" height="14" rx="1" fill="#84CC16" stroke="#3F6212" strokeWidth="1" />
        </g>
        <line x1="95" y1="0" x2="95" y2="35" stroke="#FDE047" strokeWidth="1" />
        <g transform="translate(95, 40) rotate(45)">
          <rect x="-6" y="-6" width="12" height="12" rx="1" fill="#A3E635" stroke="#3F6212" strokeWidth="1" />
        </g>
        {/* Pelita lamps on fence */}
        <rect y="85" width="120" height="35" fill="#022C22" />
        <line x1="0" y1="92" x2="120" y2="92" stroke="#854D0E" strokeWidth="2.5" />
        {/* Pelita 1 */}
        <rect x="35" y="87" width="5" height="12" rx="1" fill="#65A30D" />
        <circle cx="37.5" cy="83" r="4" fill="#F59E0B" />
        {/* Pelita 2 */}
        <rect x="80" y="87" width="5" height="12" rx="1" fill="#65A30D" />
        <circle cx="82.5" cy="83" r="4" fill="#F59E0B" />
      </g>
    ),
  },
  {
    id: 'bg_rainy_day',
    name: 'Cozy Rainy Day',
    price: 200,
    category: 'scenery',
    owned: false,
    svgElement: (
      <g>
        <rect width="120" height="120" fill="#475569" />
        {/* Rain streaks */}
        <g stroke="#BAE6FD" strokeWidth="1.2" opacity="0.7">
          <line x1="20" y1="10" x2="10" y2="30" />
          <line x1="55" y1="15" x2="45" y2="35" />
          <line x1="90" y1="10" x2="80" y2="30" />
          <line x1="35" y1="40" x2="25" y2="60" />
          <line x1="75" y1="45" x2="65" y2="65" />
          <line x1="105" y1="40" x2="95" y2="60" />
        </g>
        {/* Window Pane cross */}
        <rect width="120" height="85" fill="none" stroke="#334155" strokeWidth="6" />
        <line x1="60" y1="0" x2="60" y2="85" stroke="#334155" strokeWidth="4" />
        {/* Wooden Sill & Steamy Mug */}
        <rect y="82" width="120" height="8" fill="#B45309" />
        <rect y="90" width="120" height="30" fill="#78350F" />
        <rect x="85" y="74" width="10" height="10" rx="2" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="0.8" />
        <path d="M 88 71 Q 86 65 89 62" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    ),
  },
];