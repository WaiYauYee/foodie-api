import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Heart,
  Coins,
  ShoppingBag,
  Trophy,
  CheckCircle2,
  Circle,
  Sparkles,
  PartyPopper,
  Shirt,
  X,
  Check,
  Lock,
  ChevronRight,
  Crown,
  Glasses,
  LayoutGrid,
  Palmtree,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Mascot, { MascotMoodState } from "./Mascot";
import { Challenge, MealEntry, OutfitItem, User } from "../types/types";
import { calculateStreak } from '../utils/streak';
import PalBackground, {
  BackgroundTheme,
  BACKGROUND_OPTIONS,
} from "./PalBackground";
import StreakModal from "./StreakModal";

interface PalProps {
  meals?: MealEntry[];
  user?: User;
  onNavigateToLogMeal?: (category?: any) => void;
  onOpenStreakModal?: () => void;
}

/* ------------------------------------------------------------------ */
/* DATA                                                                */
/* ------------------------------------------------------------------ */

const LEMMY_TIPS = [
  "Minum air kosong 2 liter hari ni okay? Keep glowing! ✨",
  "Ayam bakar & ulam-ulam is the Malaysian cheat code for lean protein! 🍗",
  "Consistency beats perfection every single day, champ! 🌟",
  "Log your meals right after eating so you never forget! 📝",
  "Craving teh tarik? Ask for 'kurang manis' or 'kosong' to save 120 kcal! ☕",
  "Hehe, that tickles! Thank you for petting me! ❤️",
  "Wah, your food logging streak is looking super steady! 🔥",
];

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: "d1",
    title: "Get Started",
    description: "Log your first meal today",
    reward: 50,
    progress: 0,
    target: 1,
    completed: false,
    type: "consistent",
  },
  {
    id: "d2",
    title: "Stay Consistent",
    description: "Log 3 meals today",
    reward: 50,
    progress: 0,
    target: 3,
    completed: false,
    type: "consistent",
  },
  {
    id: "d3",
    title: "Calorie Balance",
    description: "Log 3 meals and stay within your calorie goal",
    reward: 80,
    progress: 0,
    target: 1,
    completed: false,
    type: "balance",
  },
];

const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: "w1",
    title: "Keep the streak",
    description: "Stay active 5 days",
    reward: 50,
    progress: 0,
    target: 5,
    completed: false,
    type: "consistent",
  },
  {
    id: "w2",
    title: "Hydration",
    description: "Hit your water target 5 days",
    reward: 40,
    progress: 0,
    target: 5,
    completed: false,
    type: "mindful",
  },
  {
    id: "w3",
    title: "Calorie Control",
    description: "Stay within your calorie goal 5 days",
    reward: 80,
    progress: 0,
    target: 5,
    completed: false,
    type: "balance",
  },
  {
    id: "w4",
    title: "Track Progress",
    description: "Log your weight",
    reward: 30,
    progress: 0,
    target: 1,
    completed: false,
    type: "mindful",
  },
];
const SHOP_ITEMS: OutfitItem[] = [
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
];

/* ------------------------------------------------------------------ */
/* SHOP / CLOSET UI HELPERS                                            */
/* ------------------------------------------------------------------ */

type Category = OutfitItem["category"];
type TabKey = "all" | Category;
type CardMode = "shop" | "closet";

const CATEGORY_ORDER: Category[] = ["hat", "eyes", "accessory", "scenery"];

const CATEGORY_META: Record<Category, { label: string; Icon: LucideIcon }> = {
  hat: { label: "Headwear", Icon: Crown },
  eyes: { label: "Eyewear", Icon: Glasses },
  accessory: { label: "Accessories", Icon: Sparkles },
  scenery: { label: "Sceneries", Icon: Palmtree },
};

const TABS: { key: TabKey; label: string; Icon: LucideIcon }[] = [
  { key: "all", label: "All", Icon: LayoutGrid },
  ...CATEGORY_ORDER.map((c) => ({ key: c as TabKey, ...CATEGORY_META[c] })),
];

/**
 * Your item SVGs are drawn in the mascot's 200x200 coordinate space, so a
 * plain viewBox would show them off-centre. These crop each item so it sits
 * in the middle of its card.
 */
const ITEM_VIEWBOX: Record<string, string> = {
  shades: '57 43 100 100',
  round_specs: '60 55 94 94',
  crown: '60 -24 80 80',
  songkok: '65 -15 70 70',
  straw_hat: '50 -15 100 100',
  sporty_band: '60 10 80 80',
  bowtie: '82 101 50 50',
  gold_medal: '80 95 55 55',
  teh_tarik: '120 110 50 50',
  chef_hat: '60 -35 80 80',
  bungaraya: '49 27 50 50',
  halo: '55 -39 90 90',
  bg_garden: '0 0 120 120',
  bg_picnic: '0 0 120 120',
  bg_forest: '0 0 120 120',
  bg_beach: '0 0 120 120',
  bg_night: '0 0 120 120',
};

const ACCENT = {
  amber: { bar: "bg-amber-500", text: "text-amber-600" },
  emerald: { bar: "bg-emerald-500", text: "text-emerald-600" },
} as const;

const AWNING_R = 22;

/** Scalloped shop-awning strip made of two repeating radial gradients. */
const Awning: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <div
    aria-hidden
    className="absolute top-0 inset-x-0 pointer-events-none"
    style={{
      height: AWNING_R,
      backgroundImage: `radial-gradient(circle at ${AWNING_R}px 0, ${a} ${AWNING_R - 0.5}px, transparent ${AWNING_R}px), radial-gradient(circle at ${AWNING_R}px 0, ${b} ${AWNING_R - 0.5}px, transparent ${AWNING_R}px)`,
      backgroundSize: `${AWNING_R * 4}px 100%`,
      backgroundPosition: `0 0, ${AWNING_R * 2}px 0`,
      backgroundRepeat: "repeat-x",
      filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.06))",
    }}
  />
);

const CoinPill: React.FC<{ amount: number }> = ({ amount }) => (
  <div className="flex items-center gap-1.5 bg-white pl-1.5 pr-3 py-1 rounded-full border-2 border-[#F1E6C4]">
    <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
      <Coins size={13} className="text-white" />
    </span>
    <span className="text-sm font-black text-amber-800 tabular-nums">
      {amount}
    </span>
  </div>
);

interface ModalShellProps {
  title: string;
  headerBg: string;
  awningA: string;
  awningB: string;
  right: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

/** Full-screen page: awning + [X] Title [pill] header, then whatever children you pass. */
const ModalShell: React.FC<ModalShellProps> = ({
  title,
  headerBg,
  awningA,
  awningB,
  right,
  onClose,
  children,
}) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label={title}
    className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom duration-300"
  >
    <header
      className={`relative shrink-0 ${headerBg}`}
      style={{
        paddingTop: `calc(env(safe-area-inset-top, 0px) + ${AWNING_R + 10}px)`,
      }}
    >
      <Awning a={awningA} b={awningB} />
      <div className="px-4 pb-3 grid grid-cols-[1fr_auto_1fr] items-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="justify-self-start w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-600 hover:bg-black/5 active:scale-90 transition-all cursor-pointer"
        >
          <X size={22} />
        </button>
        <h2 className="text-lg font-black text-slate-800 tracking-tight">
          {title}
        </h2>
        <div className="justify-self-end">{right}</div>
      </div>
    </header>
    {children}
  </div>
);

const TabsBar: React.FC<{
  active: TabKey;
  onChange: (t: TabKey) => void;
  accent: keyof typeof ACCENT;
}> = ({ active, onChange, accent }) => (
  <nav
    className="shrink-0 flex bg-white border-b border-[#F0EBDD]"
    role="tablist"
  >
    {TABS.map(({ key, label, Icon }) => {
      const isActive = active === key;
      return (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(key)}
          className={`relative flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-2.5 text-[11px] font-bold transition-colors cursor-pointer ${
            isActive
              ? ACCENT[accent].text
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Icon size={18} />
          <span>{label}</span>
          {isActive && (
            <span
              className={`absolute bottom-0 h-[3px] w-10 rounded-full ${ACCENT[accent].bar}`}
            />
          )}
        </button>
      );
    })}
  </nav>
);

interface ItemCardProps {
  item: OutfitItem;
  mode: CardMode;
  isEquipped: boolean;
  canAfford: boolean;
  onSelect: () => void;
  className?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  mode,
  isEquipped,
  canAfford,
  onSelect,
  className = "",
}) => {
  // Closet: anything not owned is locked. Shop: locked only if you can't afford it yet.
  const locked = !item.owned && (mode === "closet" || !canAfford);
  const isScenery = item.category === "scenery";

  let status: React.ReactNode;
  if (item.owned) {
    status = isEquipped ? (
      <span className="text-emerald-600 font-black">
        {isScenery ? "Active" : "Wearing"}
      </span>
    ) : (
      <span className="text-slate-500 font-bold">
        {mode === "closet" ? (isScenery ? "Set" : "Wear") : "Owned"}
      </span>
    );
  } else if (mode === "closet") {
    status = <span className="text-amber-500">Unlock</span>;
  } else {
    status = (
      <span
        className={`flex items-center gap-1 ${canAfford ? "text-slate-700" : "text-slate-400"}`}
      >
        <Coins
          size={12}
          className={
            canAfford
              ? "text-amber-500 fill-amber-400"
              : "text-slate-300 fill-slate-200"
          }
        />
        {item.price}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative h-[118px] rounded-[22px] bg-white border-2 px-2 pt-2 pb-2 flex flex-col items-center text-center transition-all active:translate-y-[2px] active:shadow-none cursor-pointer ${
        isEquipped
          ? "border-emerald-400 bg-emerald-50/60 shadow-[0_3px_0_#A7F3D0]"
          : "border-[#ECE7D8] shadow-[0_3px_0_#ECE7D8] hover:border-[#DDD5BE]"
      } ${className}`}
    >
      {locked && (
        <Lock size={12} className="absolute top-2 left-2 text-amber-400" />
      )}
      {isEquipped && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
          <Check size={10} className="stroke-[4]" />
        </span>
      )}

      <div
        className={`flex-1 w-full flex items-center justify-center ${locked && mode === "closet" ? "opacity-50 grayscale" : ""}`}
      >
        <svg
          viewBox={ITEM_VIEWBOX[item.id] ?? "0 0 200 200"}
          className={`w-14 h-14 ${isScenery ? "rounded-xl overflow-hidden shadow-2xs border border-slate-200/80" : ""}`}
          aria-hidden
        >
          {item.svgElement}
        </svg>
      </div>

      <p className="w-full truncate text-[10px] font-semibold text-slate-400">
        {item.name}
      </p>
      <div className="h-4 flex items-center justify-center text-[12px] font-extrabold">
        {status}
      </div>
    </button>
  );
};

interface ItemsBrowserProps {
  items: OutfitItem[];
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
  mode: CardMode;
  equipped: Record<string, OutfitItem | null>;
  backgroundTheme: BackgroundTheme;
  coins: number;
  onSelect: (item: OutfitItem) => void;
}

/**
 * "All" tab  -> one horizontal row per category with a "See all" link (like the reference)
 * Other tabs -> a 3-column grid for that category
 */
const ItemsBrowser: React.FC<ItemsBrowserProps> = ({
  items,
  tab,
  onTabChange,
  mode,
  equipped,
  backgroundTheme,
  coins,
  onSelect,
}) => {
  const categories = tab === "all" ? CATEGORY_ORDER : [tab];

  return (
    <div className="space-y-5">
      {categories.map((cat) => {
        const list = items.filter((i) => i.category === cat);
        if (list.length === 0) return null;

        const renderCard = (item: OutfitItem, className: string) => (
          <ItemCard
            key={item.id}
            item={item}
            mode={mode}
            isEquipped={
              item.category === "scenery"
                ? backgroundTheme === item.id.replace("bg_", "")
                : equipped[item.category]?.id === item.id
            }
            canAfford={coins >= item.price}
            onSelect={() => onSelect(item)}
            className={className}
          />
        );

        return (
          <section key={cat}>
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <h3 className="text-[13px] font-extrabold text-slate-700">
                {CATEGORY_META[cat].label}
              </h3>
              {tab === "all" && (
                <button
                  type="button"
                  onClick={() => onTabChange(cat)}
                  className="flex items-center text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  See all
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            {tab === "all" ? (
              <div className="flex gap-2.5 overflow-x-auto snap-x -mx-4 px-4 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {list.map((item) =>
                  renderCard(item, "w-[100px] shrink-0 snap-start"),
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 pb-1.5">
                {list.map((item) => renderCard(item, "w-full"))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MISSIONS                                                            */
/* ------------------------------------------------------------------ */

const QuestCard: React.FC<{
  quest: Challenge;
  onClaim: (id: string) => void;
}> = ({ quest, onClaim }) => {
  const isReadyToComplete = !quest.completed && quest.progress >= quest.target;
  return (
    <div
      onClick={() => isReadyToComplete && onClaim(quest.id)}
      className={`bg-white p-4 rounded-2xl border transition-all duration-200 flex items-center space-x-3.5 shadow-xs ${
        quest.completed
          ? "border-slate-100 bg-slate-50/60 opacity-80"
          : isReadyToComplete
            ? "border-emerald-300 ring-2 ring-emerald-400/20 hover:border-emerald-400 cursor-pointer active:scale-98"
            : "border-slate-200 hover:border-emerald-200 cursor-pointer active:scale-98"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          quest.completed
            ? "bg-emerald-500 text-white"
            : isReadyToComplete
              ? "bg-amber-100 text-amber-600 animate-pulse"
              : "bg-slate-100 text-slate-400"
        }`}
      >
        {quest.completed ? (
          <CheckCircle2 size={22} className="stroke-[2.5]" />
        ) : (
          <Circle size={22} className="stroke-[2]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1.5">
          <h3 className="font-bold text-slate-800 text-sm truncate">
            {quest.title}
          </h3>
          {quest.completed && (
            <Sparkles
              size={13}
              className="text-amber-500 fill-amber-500 shrink-0"
            />
          )}
        </div>
        <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
          {quest.description}
        </p>

        <div className="mt-2.5 flex items-center space-x-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${quest.completed ? "bg-emerald-500" : "bg-emerald-400"}`}
              style={{
                width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 tabular-nums">
            {quest.progress}/{quest.target}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end">
        {quest.completed ? (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            Claimed
          </span>
        ) : (
          <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
            <Coins size={14} className="text-amber-500 fill-amber-400" />
            <span className="text-xs font-black text-amber-700">
              +{quest.reward}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const MissionSection: React.FC<{
  title: string;
  quests: Challenge[];
  onClaim: (id: string) => void;
}> = ({ title, quests, onClaim }) => (
  <div className="space-y-3 pb-8">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center space-x-1.5">
        <Trophy size={14} className="text-amber-500" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
      </div>
      <span className="text-[11px] font-bold text-emerald-700">
        {quests.filter((c) => c.completed).length} / {quests.length} Done
      </span>
    </div>
    {quests.map((quest) => (
      <QuestCard key={quest.id} quest={quest} onClaim={onClaim} />
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* PAGE                                                                */
/* ------------------------------------------------------------------ */

export const Pal: React.FC<PalProps> = ({
  meals: propMeals,
  user: propUser,
  onOpenStreakModal,
  onNavigateToLogMeal,
}) => {
  // ---- state (all declared up-front so effects below can safely read it) ----
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("makanfit_coins");
    return saved ? Number(saved) : 340;
  });

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const allMeals = useMemo(() => {
    let list: MealEntry[] = propMeals || [];
    if (!list.length) {
      const saved = localStorage.getItem('makanfit_meals');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) list = parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return list;
  }, [propMeals]);

  const streakInfo = useMemo(() => calculateStreak(allMeals, now), [allMeals, now]);

  const [showOutfits, setShowOutfits] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [outfitTab, setOutfitTab] = useState<TabKey>("all");
  const [shopTab, setShopTab] = useState<TabKey>("all");
  const [sheetItemId, setSheetItemId] = useState<string | null>(null);

  const [internalStreakModalOpen, setInternalStreakModalOpen] = useState(false);
  const handleOpenStreakModal = () => {
    if (onOpenStreakModal) {
      onOpenStreakModal();
    } else {
      setInternalStreakModalOpen(true);
    }
  };

  // Background Scenery Theme (Garden, Picnic, Forest, Beach, Night)
  const [backgroundTheme, setBackgroundTheme] = useState<BackgroundTheme>(
    () => {
      const saved = localStorage.getItem("makanfit_pal_bg");
      if (
        saved &&
        ["garden", "picnic", "forest", "beach", "night"].includes(saved)
      ) {
        return saved as BackgroundTheme;
      }
      return "garden";
    },
  );

  /** Read a saved challenge list from localStorage, falling back to the defaults. */
  const loadChallenges = (key: string, fallback: Challenge[]): Challenge[] => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return fallback;
  };

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    if (
      localStorage.getItem("makanfit_daily_date") !== new Date().toDateString()
    ) {
      return DAILY_CHALLENGES;
    }
    return loadChallenges("makanfit_daily_challenges", DAILY_CHALLENGES);
  });

  const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>(() =>
    loadChallenges("makanfit_weekly_challenges", WEEKLY_CHALLENGES),
  );

  // Temporary animation override (e.g. while being petted or trying clothes)
  const [temporaryAnimation, setTemporaryAnimation] =
    useState<MascotMoodState | null>(null);
  // const [mascotState, setMascotState] = useState<'idle' | 'happy' | 'thinking' | 'petting'>('idle');
  const [showReward, setShowReward] = useState<{
    amount: number;
    title: string;
  } | null>(null);
  const [dialogue, setDialogue] = useState<string>("");
  const [friendshipLevel, setFriendshipLevel] = useState(3);
  const [friendshipXp, setFriendshipXp] = useState(65);
  const [petNotice, setPetNotice] = useState<string | null>(null);

  const [shopItems, setShopItems] = useState<OutfitItem[]>(() => {
    const saved = localStorage.getItem("makanfit_shop_items");
    const savedBg = localStorage.getItem("makanfit_pal_bg");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return SHOP_ITEMS.map((item) => {
          const found = parsed.find((p: any) => p.id === item.id);
          const isDefaultScenery =
            item.id === "bg_garden" || (savedBg && item.id === `bg_${savedBg}`);
          if (found) {
            return { ...item, owned: Boolean(found.owned || isDefaultScenery) };
          }
          return { ...item, owned: Boolean(item.owned || isDefaultScenery) };
        });
      } catch (e) {
        console.error(e);
      }
    }
    return SHOP_ITEMS;
  });

  const getTimestamp = (val: any): number => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  // =========================================================================
  // BITEPAL NUTRITION REFLECTION ENGINE
  // Analyzes user's logged meals today to determine Pal's mood, energy & needs
  // =========================================================================
  const palStatus = useMemo(() => {
    const today = new Date(now);
    // const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    // Get effective meals from props or fallback to localStorage
    let effectiveMeals: MealEntry[] = propMeals || [];
    if (!effectiveMeals.length) {
      const saved = localStorage.getItem("makanfit_meals");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) effectiveMeals = parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }

    const todayMeals = effectiveMeals.filter((m) => {
      const time = getTimestamp(m.consumedAt || m.createdAt);
      if (!time) return false;
      const d = new Date(time);
      return d.toDateString() === today.toDateString();
    });

    const mealKcal = (m: MealEntry) => {
      if (m.estimatedCalories) return m.estimatedCalories;
      if (m.food?.nutrients?.calories) return m.food.nutrients.calories;
      if (m.ingredients && m.ingredients.length > 0) {
        return m.ingredients.reduce(
          (sum, ing) => sum + (ing.nutrients?.calories || 0),
          0,
        );
      }
      return 0;
    };

    const todayCalories = todayMeals.reduce((sum, m) => sum + mealKcal(m), 0);

    const targetCalories = propUser?.targetCalories || 1750;
    const calorieRatio =
      targetCalories > 0 ? todayCalories / targetCalories : 0;

    // Sort descending
    const sortedMeals = [...todayMeals].sort((a, b) => {
      const tA = getTimestamp(a.consumedAt || a.createdAt);
      const tB = getTimestamp(b.consumedAt || b.createdAt);
      return tB - tA;
    });

    const lastMeal = sortedMeals[0] || null;
    const lastMealTime = lastMeal
      ? getTimestamp(lastMeal.consumedAt || lastMeal.createdAt)
      : 0;
    const hoursSinceLastMeal =
      lastMeal && lastMealTime ? (now - lastMealTime) / (1000 * 60 * 60) : 999;

    const hasBreakfast = todayMeals.some((m) =>
      (m.mealType || "").toLowerCase().includes("breakfast"),
    );
    const hasLunch = todayMeals.some((m) =>
      (m.mealType || "").toLowerCase().includes("lunch"),
    );
    const hasDinner = todayMeals.some((m) =>
      (m.mealType || "").toLowerCase().includes("dinner"),
    );
    const hasSnack = todayMeals.some((m) =>
      (m.mealType || "").toLowerCase().includes("snack"),
    );

    // Status Decision logic (like BitePal)
    let moodState: MascotMoodState = "idle";
    let statusTitle = "Content & Relaxed";
    let statusSubtitle = "Lemmy is resting calmly.";
    let statusBadge = "Neutral";
    let statusBadgeColor = "bg-slate-100 text-slate-700 border-slate-200";
    let energyPercent = 50;
    let moodEmoji = "😊";
    let defaultDialogue = LEMMY_TIPS[0];
    let needsFood = false;

    if (todayMeals.length === 0) {
      // Awake and ready for breakfast, not asleep!
      moodState = "idle"; // or 'hungry'
      statusTitle = "Waiting for Breakfast";
      statusSubtitle = "Lemmy is ready to start the day! Log your first meal.";
      statusBadge = "Awaiting Fuel";
      statusBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
      energyPercent = 35;
      moodEmoji = "☀️";
      defaultDialogue =
        "Selamat pagi! Ready to fuel up? Log your breakfast to get Lemmy energized! 🍳";
      needsFood = true;
    } else if (
      todayCalories > targetCalories * 1.18 ||
      (lastMeal && mealKcal(lastMeal) > 800 && hoursSinceLastMeal < 2.5)
    ) {
      // Food Coma / Stuffed
      moodState = "stuffed";
      statusTitle = "Food Coma (Kenyang)";
      statusSubtitle =
        "Hearty Malaysian feast! Lemmy is resting his full belly.";
      statusBadge = "Food Coma 🤤";
      statusBadgeColor = "bg-purple-50 text-purple-700 border-purple-200";
      energyPercent = 48;
      moodEmoji = "🤤";
      defaultDialogue =
        "Fuh... kenyang gila! That was a generous meal! Lemmy needs a power nap to digest. 😴";
      needsFood = false;
    } else if (hoursSinceLastMeal > 5.5 && calorieRatio < 0.45) {
      // Long fast since morning -> Tired & Weak
      moodState = "tired";
      statusTitle = "Tired & Depleted";
      statusSubtitle = `Last meal was ${Math.round(hoursSinceLastMeal)}h ago. Lemmy's stamina is running low!`;
      statusBadge = "Low Stamina";
      statusBadgeColor = "bg-rose-50 text-rose-700 border-rose-200";
      energyPercent = 25;
      moodEmoji = "🥱";
      defaultDialogue =
        "Hooaam... Lemmy is running on empty! Time for another meal to keep our energy burning! 🥗";
      needsFood = true;
    } else if (
      calorieRatio < 0.35 ||
      (hoursSinceLastMeal > 3.5 && calorieRatio < 0.65)
    ) {
      // Hungry
      moodState = "hungry";
      statusTitle = "Hungry & Waiting";
      statusSubtitle = "Lemmy's tummy is grumbling! Ready for the next meal.";
      statusBadge = "Hungry Tummy";
      statusBadgeColor = "bg-amber-50 text-amber-800 border-amber-300";
      energyPercent = 40;
      moodEmoji = "🥺";
      defaultDialogue =
        "Mmm... is it makan time yet? Lemmy is craving some wholesome Malaysian food! 🍲";
      needsFood = true;
    } else if (calorieRatio >= 0.9 && calorieRatio <= 1.15) {
      // Peak Vitality
      moodState = "happy";
      statusTitle = "Peak Vitality";
      statusSubtitle = "Daily calorie balance achieved! Lemmy is thriving!";
      statusBadge = "Peak Vitality ✨";
      statusBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-300";
      energyPercent = 100;
      moodEmoji = "🌟";
      defaultDialogue =
        "Mantap! You nailed your nutrition target today! Lemmy is in top shape! 🏆";
      needsFood = false;
    } else {
      // Energized
      moodState = "energetic";
      statusTitle = "Well-Nourished & Energized";
      statusSubtitle = `Powered by ${lastMeal?.food?.name || "today's meals"}! High stamina.`;
      statusBadge = "Energized ⚡";
      statusBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
      energyPercent = Math.min(95, Math.round(50 + calorieRatio * 45));
      moodEmoji = "⚡";
      defaultDialogue =
        "Wah, thanks for logging! Lemmy feels super energized and ready to crush our goals! 🚀";
      needsFood = false;
    }

    return {
      moodState,
      statusTitle,
      statusSubtitle,
      statusBadge,
      statusBadgeColor,
      energyPercent,
      satietyPercent: Math.min(100, Math.round(calorieRatio * 100)),
      moodEmoji,
      defaultDialogue,
      needsFood,
      todayCalories,
      targetCalories,
      todayMealCount: todayMeals.length,
      lastMeal,
      hoursSinceLastMeal,
      hasBreakfast,
      hasLunch,
      hasDinner,
      hasSnack,
    };
  }, [propMeals, propUser, now]);

  useEffect(() => {
    // Only override dialogue if there is no temporary interactive animation (like petting)
    if (!temporaryAnimation) {
      setDialogue(palStatus.defaultDialogue);
    }
  }, [palStatus.defaultDialogue, temporaryAnimation]);

  const [equipped, setEquipped] = useState<Record<string, OutfitItem | null>>(
    () => {
      const saved = localStorage.getItem("makanfit_equipped_ids");
      if (saved) {
        try {
          const ids: Record<string, string | null> = JSON.parse(saved);
          return {
            hat: SHOP_ITEMS.find((i) => i.id === ids.hat) || null,
            eyes: SHOP_ITEMS.find((i) => i.id === ids.eyes) || null,
            accessory: SHOP_ITEMS.find((i) => i.id === ids.accessory) || null,
          };
        } catch (e) {
          console.error(e);
        }
      }
      return {
        hat: null,
        eyes: null,
        accessory: SHOP_ITEMS.find((i) => i.id === "bowtie") || null,
      };
    },
  );

  // ---- derived ----
  const sheetItem = useMemo(
    () => shopItems.find((i) => i.id === sheetItemId) ?? null,
    [shopItems, sheetItemId],
  );
  const ownedItems = useMemo(
    () => shopItems.filter((i) => i.owned),
    [shopItems],
  );
  // Closet shows owned items first, locked ones after
  const closetItems = useMemo(
    () => [...shopItems].sort((a, b) => Number(b.owned) - Number(a.owned)),
    [shopItems],
  );
  const anyEquipped = Boolean(
    equipped.hat || equipped.eyes || equipped.accessory,
  );

  /** Outfit the mascot should wear, optionally overriding one slot with a try-on item */
  const outfitWith = (tryOn: OutfitItem | null) => ({
    hat: (tryOn?.category === "hat" ? tryOn : equipped.hat)?.svgElement,
    eyes: (tryOn?.category === "eyes" ? tryOn : equipped.eyes)?.svgElement,
    accessory: (tryOn?.category === "accessory" ? tryOn : equipped.accessory)
      ?.svgElement,
  });
  const currentOutfit = outfitWith(null);

  const tryOnOutfit = (item: OutfitItem) => {
    if (item.category === "scenery") {
      return currentOutfit;
    }
    return outfitWith(item);
  };

  const handleSelectBackground = (themeId: BackgroundTheme) => {
    setBackgroundTheme(themeId);
    localStorage.setItem("makanfit_pal_bg", themeId);
    const option = BACKGROUND_OPTIONS.find(
      (b: (typeof BACKGROUND_OPTIONS)[number]) => b.id === themeId,
    );
    if (option) {
      setDialogue(option.lemmyQuote);
    }
    setTemporaryAnimation("happy");
    setTimeout(() => setTemporaryAnimation(null), 1200);
  };

  // ---- effects ----
  useEffect(() => {
    const { todayMealCount, todayCalories, targetCalories } = palStatus;
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.completed) return c;
        if (c.id === "d1")
          return { ...c, progress: Math.min(todayMealCount, 1) };
        if (c.id === "d2")
          return { ...c, progress: Math.min(todayMealCount, 3) };
        if (c.id === "d3") {
          const ok = todayMealCount >= 3 && todayCalories <= targetCalories;
          return { ...c, progress: ok ? 1 : 0 };
        }
        return c;
      }),
    );
  }, [
    palStatus.todayMealCount,
    palStatus.todayCalories,
    palStatus.targetCalories,
  ]);

  useEffect(() => {
    setWeeklyChallenges(prev => prev.map(c => {
      if (c.completed) return c;
      if (c.id === 'w1') return { ...c, progress: Math.min(streakInfo.streak, c.target) };
      return c;
    }));
  }, [streakInfo.streak]);

  // Escape closes the top-most layer; lock page scroll while a modal is open
  useEffect(() => {
    if (!showOutfits && !showShop) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sheetItemId) {
        setSheetItemId(null);
      } else {
        setShowOutfits(false);
        setShowShop(false);
      }
    };

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showOutfits, showShop, sheetItemId]);

  useEffect(() => {
    localStorage.setItem("makanfit_coins", String(coins));
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(
      "makanfit_daily_challenges",
      JSON.stringify(challenges),
    );
    localStorage.setItem("makanfit_daily_date", new Date().toDateString());
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem(
      "makanfit_weekly_challenges",
      JSON.stringify(weeklyChallenges),
    );
  }, [weeklyChallenges]);

  useEffect(() => {
    const serializable = shopItems.map((i) => ({ id: i.id, owned: i.owned }));
    localStorage.setItem("makanfit_shop_items", JSON.stringify(serializable));
  }, [shopItems]);

  useEffect(() => {
    const ids = {
      hat: equipped.hat?.id || null,
      eyes: equipped.eyes?.id || null,
      accessory: equipped.accessory?.id || null,
    };
    localStorage.setItem("makanfit_equipped_ids", JSON.stringify(ids));
  }, [equipped]);

  // ---- handlers ----
  const handlePetLemmy = () => {
    setTemporaryAnimation("petting");
    setDialogue(LEMMY_TIPS[Math.floor(Math.random() * LEMMY_TIPS.length)]);

    const next = friendshipXp + 10;
    if (next >= 100) {
      setFriendshipXp(next - 100);
      setFriendshipLevel((lvl) => lvl + 1);
      setPetNotice("Level Up! Lemmy loves you more! ❤️");
    } else {
      setFriendshipXp(next);
      setPetNotice("Petting +10 XP ❤️");
    }

    setTimeout(() => setPetNotice(null), 1800);
    setTimeout(() => setTemporaryAnimation(null), 1400);
  };

  // Equip / Unequip outfit item
  const handleEquip = (item: OutfitItem) => {
    if (item.category === "scenery") {
      const themeId = item.id.replace("bg_", "") as BackgroundTheme;
      handleSelectBackground(themeId);
      return;
    }
    const isCurrentlyEquipped = equipped[item.category]?.id === item.id;
    setEquipped((prev) => ({
      ...prev,
      [item.category]: isCurrentlyEquipped ? null : item,
    }));
    setTemporaryAnimation("happy");
    setDialogue(
      isCurrentlyEquipped
        ? `Removed ${item.name}! Back to natural Lemmy.`
        : `Looking sharp in ${item.name}! Sedap mata memandang! 😎`,
    );
    setTimeout(() => setTemporaryAnimation(null), 1300);
  };

  const handleUnequipAll = () => {
    setEquipped({ hat: null, eyes: null, accessory: null });
    setTemporaryAnimation("happy");
    setDialogue("All accessories taken off! Lemmy feels breezy and light! 🍃");
    setTimeout(() => setTemporaryAnimation(null), 1200);
  };

  const handleBuy = (item: OutfitItem) => {
    if (item.owned || coins < item.price) return;
    setCoins((prev) => prev - item.price);
    setShopItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, owned: true } : i)),
    );
    if (item.category === "scenery") {
      const themeId = item.id.replace("bg_", "") as BackgroundTheme;
      handleSelectBackground(themeId);
      setDialogue(
        `Wah, bought the ${item.name} scenery! It looks so stunning! 🌟`,
      );
    } else {
      handleEquip({ ...item, owned: true });
    }
  };

  const handleCompleteQuest = (id: string) => {
    const isDaily = challenges.some((c) => c.id === id);
    const quest = (isDaily ? challenges : weeklyChallenges).find(
      (c) => c.id === id,
    );
    if (quest && !quest.completed && quest.progress >= quest.target) {
      const markDone = (list: Challenge[]) =>
        list.map((c) =>
          c.id === id ? { ...c, completed: true, progress: c.target } : c,
        );
      if (isDaily) setChallenges(markDone);
      else setWeeklyChallenges(markDone);
      setCoins((prev) => prev + quest.reward);
      setTemporaryAnimation("happy");
      setDialogue(`Mantap! Quest completed! +${quest.reward} coins earned! 🎉`);
      setShowReward({ amount: quest.reward, title: quest.title });
      setTimeout(() => {
        setTemporaryAnimation(null);
        setShowReward(null);
      }, 2400);
    }
  };

  // The active mascot animation state: priority to temporary interactive state, else real-time food state!
  const currentMascotAnimation: MascotMoodState =
    temporaryAnimation || palStatus.moodState;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-[#F1F5F9] pb-28 relative overflow-hidden select-none">
      {/* Reward Popup Overlay */}
      {showReward && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="bg-white px-8 py-7 rounded-[32px] shadow-2xl border border-amber-200 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 max-w-xs w-full">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-3 border border-amber-100 shadow-inner">
              <PartyPopper size={36} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Quest Complete!
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {showReward.title}
            </p>
            <div className="flex items-center space-x-2 text-3xl font-black text-amber-500 my-4 bg-amber-50/80 px-6 py-2.5 rounded-2xl border border-amber-100/60">
              <Coins size={30} className="fill-amber-400" />
              <span>+{showReward.amount}</span>
            </div>
            <button
              onClick={() => setShowReward(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Collect & Continue
            </button>
          </div>
        </div>
      )}

      {/* Floating Petting / XP Notice */}
      {petNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center space-x-2 animate-bounce">
            <Sparkles size={14} className="text-amber-400" />
            <span>{petNotice}</span>
          </div>
        </div>
      )}

      {/* Header Stats Bar */}
      <div className="px-5 py-4 bg-white/80 backdrop-blur-md rounded-b-[28px] border-b border-emerald-100/60 shadow-xs flex items-center justify-between sticky top-0 z-20">
        <button 
          onClick={handleOpenStreakModal}
          className="flex items-center space-x-3 text-left group cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
          title="Click to view full streak calendar and rewards"
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center relative shadow-xs transition-all group-hover:scale-105 ${
            streakInfo.hasLoggedToday
              ? 'bg-gradient-to-tr from-orange-400 to-amber-300'
              : streakInfo.streak > 0
              ? 'bg-gradient-to-tr from-amber-400 to-yellow-300'
              : 'bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200/80'
          }`}>
            <Flame 
              className={`transition-all ${
                streakInfo.hasLoggedToday
                  ? 'text-white fill-white'
                  : streakInfo.streak > 0
                  ? 'text-white fill-white/90'
                  : 'text-slate-400'
              }`} 
              size={20} 
            />
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
              <div className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white font-black ${
                streakInfo.hasLoggedToday
                  ? 'bg-orange-600'
                  : streakInfo.streak > 0
                  ? 'bg-amber-600'
                  : 'bg-slate-400'
              }`}>
                {streakInfo.streak}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <p className="text-sm font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                {streakInfo.streak}-Day Streak
              </p>
              <span className={`text-[10px] ${streakInfo.badgeBg} ${streakInfo.badgeText} font-extrabold px-1.5 py-0.5 rounded-md border ${streakInfo.badgeBorder}`}>
                {streakInfo.statusBadge}
              </span>
            </div>
            <p className={`text-[11px] font-medium transition-colors ${
              streakInfo.hasLoggedToday 
                ? 'text-emerald-600 font-semibold' 
                : 'text-slate-400'
            }`}>
              {streakInfo.statusMessage}
            </p>
          </div>
        </button>

        <div className="flex items-center space-x-1.5 bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200/80 shadow-xs">
          <Coins className="text-amber-500 fill-amber-400" size={18} />
          <span className="font-black text-amber-800 text-sm tabular-nums">{coins}</span>
        </div>
      </div>

      {/* Hero Section: Interactive Lemmy Stage */}
      <div className="relative pt-4 pb-6 px-4 max-w-md mx-auto">
        {/* Scenic Stage Card Framing Lemmy */}
        <PalBackground theme={backgroundTheme}>
          <div className="w-full pt-4 pb-4 px-4 flex flex-col items-center">

          <div className="flex flex-col items-center mb-2 z-10 text-center">
            <div className="flex items-center space-x-2 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/80 shadow-2xs">
                <h1 className="text-base font-black text-slate-800 tracking-tight">Lemmy</h1>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  Lvl {friendshipLevel} Companion
                </span>
              </div>

            <div className="flex items-center space-x-2 mt-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(h => (
                    <Heart
                      key={h}
                      className={`transition-colors duration-300 ${h <= 4 ? "fill-rose-500 text-rose-500" : "text-slate-300"}`}
                      size={12}
                    />
                  ))}
                </div>
              <div
                className="w-24 h-2 bg-slate-200/80 rounded-full overflow-hidden"
                title={`Friendship XP: ${friendshipXp}/100`}
              >
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${friendshipXp}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                {friendshipXp}xp
              </span>
            </div>
            </div>

            {/* Speech Bubble */}
            <div className="relative mb-2 max-w-xs px-4 py-2.5 bg-white/95 rounded-2xl shadow-sm border border-emerald-100/80 text-xs font-semibold text-slate-700 text-center z-10 transition-all duration-300">
              <p className="leading-snug">
                {dialogue || palStatus.defaultDialogue}
              </p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-emerald-100/80 rotate-45" />
            </div>

            <div className="relative z-10 my-0">
              <Mascot
                animationState={currentMascotAnimation}
                outfit={currentOutfit}
                onPet={handlePetLemmy}
                className="w-56 h-64 sm:w-64 sm:h-72"
              />
            </div>

            {/* Quick Scenery Theme Bar */}
            <div className="w-full flex items-center justify-center gap-1 mt-1 z-10">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-white shadow-xs overflow-x-auto [scrollbar-width:none]">
                {BACKGROUND_OPTIONS.map(
                  (bg: (typeof BACKGROUND_OPTIONS)[number]) => {
                    const isCurrent = backgroundTheme === bg.id;
                    const item = shopItems.find((i) => i.id === `bg_${bg.id}`);
                    const isOwned = item?.owned ?? bg.id === "garden";
                    return (
                      <button
                        key={bg.id}
                        onClick={() => {
                          if (isOwned) {
                            handleSelectBackground(bg.id);
                          } else if (item) {
                            setSheetItemId(item.id);
                          }
                        }}
                        title={
                          isOwned
                            ? `Switch to ${bg.name} (${bg.tagline})`
                            : `Unlock ${bg.name} in Shop (${item?.price} coins)`
                        }
                        className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                          isCurrent
                            ? "bg-emerald-600 text-white shadow-xs scale-102"
                            : isOwned
                              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95"
                              : "text-slate-400 bg-slate-50/80 hover:bg-amber-50 hover:text-amber-700 border border-dashed border-amber-200 active:scale-95"
                        }`}
                      >
                        <span className="text-xs">{bg.emoji}</span>
                        <span>{bg.name}</span>
                        {!isOwned && item && (
                          <span className="flex items-center text-[9px] text-amber-700 bg-amber-100/90 px-1 py-0.2 rounded font-black ml-0.5">
                            <Lock size={9} className="mr-0.5" />
                            {item.price}
                          </span>
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </PalBackground>

        {/* Quick Action Buttons */}
        <div className="mt-4 flex items-center justify-center space-x-3 z-10">
          <button
            onClick={handlePetLemmy}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-2xl shadow-md shadow-emerald-600/20 font-bold text-xs text-white hover:scale-102 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Heart size={15} className="fill-white" />
            <span>Pet Lemmy</span>
          </button>

          <button
            id="my-outfits-btn"
            onClick={() => setShowOutfits(true)}
            className="bg-white hover:bg-emerald-50 px-4 py-3 rounded-2xl shadow-xs border border-emerald-100 text-emerald-800 font-bold text-xs hover:scale-102 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
            title="Open My Outfits"
          >
            <Shirt size={15} className="text-emerald-600" />
            <span>My Outfits</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {ownedItems.length}
            </span>
          </button>

          <button
            id="shop-btn"
            onClick={() => setShowShop(true)}
            className="bg-white hover:bg-amber-50 px-4 py-3 rounded-2xl shadow-xs border border-amber-200/80 text-amber-900 font-bold text-xs hover:scale-102 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
            title="Open Shop"
            aria-label="Open Shop"
          >
            <ShoppingBag size={15} className="text-amber-600" />
          </button>
        </div>
      </div>

      {/* Missions (only this block is width-constrained; modals live outside it) */}
      <div className="px-5 space-y-4 max-w-md mx-auto">
        <MissionSection
          title="Daily Missions"
          quests={challenges}
          onClaim={handleCompleteQuest}
        />
        {/* TODO: swap `challenges` for a separate special-missions list */}
        <MissionSection
          title="Weekly Missions"
          quests={weeklyChallenges}
          onClaim={handleCompleteQuest}
        />
      </div>

      {/* ================================================================= */}
      {/* MY OUTFITS                                                        */}
      {/* ================================================================= */}
      {showOutfits && (
        <ModalShell
          title="My Outfits"
          headerBg="bg-[#E3F5EC]"
          awningA="#2FB585"
          awningB="#FFFFFF"
          onClose={() => setShowOutfits(false)}
          right={
            <div className="flex items-center gap-1.5 bg-white pl-2 pr-3 py-1.5 rounded-full border-2 border-emerald-100">
              <Shirt size={14} className="text-emerald-600" />
              <span className="text-sm font-black text-emerald-800 tabular-nums">
                {ownedItems.length}
                <span className="text-emerald-400">/{shopItems.length}</span>
              </span>
            </div>
          }
        >
          {/* Fitting stage: mascot + equipment slots */}
          <div className="shrink-0 px-4 pt-3 pb-3 bg-white">
            <div className="relative h-[230px] sm:h-[300px] rounded-[28px] overflow-hidden border-2 border-emerald-200 shadow-sm">
              <PalBackground theme={backgroundTheme}>
                <div className="w-full h-[230px] sm:h-[300px] relative flex items-end justify-center pb-2">
                  <Mascot
                    className="w-36 h-40 sm:w-52 sm:h-60"
                    outfit={currentOutfit}
                  />

                {/* Slots: tap a worn item to take it off, tap an empty one to browse that category */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                    {CATEGORY_ORDER.map(cat => {
                      const isScenery = cat === 'scenery';
                      const worn = isScenery
                        ? shopItems.find(i => i.id === `bg_${backgroundTheme}`)
                        : equipped[cat];
                      const { Icon, label } = CATEGORY_META[cat];
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => (worn && !isScenery ? handleEquip(worn) : setOutfitTab(cat))}
                          title={isScenery ? (worn ? `Active Scene: ${worn.name}` : 'Browse Sceneries') : (worn ? `Take off ${worn.name}` : `Browse ${label}`)}
                          aria-label={isScenery ? (worn ? `Active Scene: ${worn.name}` : 'Browse Sceneries') : (worn ? `Take off ${worn.name}` : `Browse ${label}`)}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-xs ${
                            worn
                              ? 'bg-white border-2 border-emerald-400 shadow-xs'
                              : 'bg-white/80 border-2 border-dashed border-emerald-300 text-emerald-600'
                          }`}
                        >
                          {worn ? (
                            <svg viewBox={ITEM_VIEWBOX[worn.id] ?? '0 0 120 120'} className={`w-7 h-7 ${isScenery ? 'rounded-lg overflow-hidden' : ''}`} aria-hidden>
                              {worn.svgElement}
                            </svg>
                          ) : (
                            <Icon size={17} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                {anyEquipped && (
                    <button
                      type="button"
                      onClick={handleUnequipAll}
                      className="absolute top-3 right-3 text-[11px] font-bold text-rose-600 bg-white/90 hover:bg-white px-3 py-1.5 rounded-full border border-rose-100 active:scale-95 transition-all cursor-pointer z-20 shadow-xs"
                    >
                      Take all off
                    </button>
                  )}
                  </div>
              </PalBackground>
            </div>
          </div>

          <TabsBar
            active={outfitTab}
            onChange={setOutfitTab}
            accent="emerald"
          />

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#FFFDF7] px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <ItemsBrowser
              items={closetItems}
              tab={outfitTab}
              onTabChange={setOutfitTab}
              mode="closet"
              equipped={equipped}
              backgroundTheme={backgroundTheme}
              coins={coins}
              onSelect={(item) =>
                item.owned ? handleEquip(item) : setSheetItemId(item.id)
              }
            />
          </div>
        </ModalShell>
      )}

      {/* ================================================================= */}
      {/* SHOP                                                              */}
      {/* ================================================================= */}
      {showShop && (
        <ModalShell
          title="Shop"
          headerBg="bg-[#FFF4D6]"
          awningA="#60A5FA"
          awningB="#FFFFFF"
          onClose={() => setShowShop(false)}
          right={<CoinPill amount={coins} />}
        >
          <TabsBar active={shopTab} onChange={setShopTab} accent="amber" />

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#FFFDF7] px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <ItemsBrowser
              items={shopItems}
              tab={shopTab}
              onTabChange={setShopTab}
              mode="shop"
              equipped={equipped}
              backgroundTheme={backgroundTheme}
              coins={coins}
              onSelect={(item) => setSheetItemId(item.id)}
            />
            <p className="mt-6 text-center text-[11px] font-semibold text-slate-400">
              Complete missions to earn more coins 🪙
            </p>
          </div>
        </ModalShell>
      )}

      {/* ================================================================= */}
      {/* ITEM SHEET: try on, buy, or wear                                  */}
      {/* ================================================================= */}
      {sheetItem &&
        (() => {
          const isScenery = sheetItem.category === "scenery";
          const sheetTheme = isScenery
            ? (sheetItem.id.replace("bg_", "") as BackgroundTheme)
            : backgroundTheme;
          const isEquipped = isScenery
            ? backgroundTheme === sheetTheme
            : equipped[sheetItem.category]?.id === sheetItem.id;
          const canAfford = coins >= sheetItem.price;
          const shortBy = sheetItem.price - coins;

          let message: string;
          if (isScenery) {
            message = sheetItem.owned
              ? isEquipped
                ? "Lemmy is relaxing in this scenery right now."
                : "You own this scenery! Ready to set it as your active backdrop?"
              : canAfford
                ? "Here is how Lemmy looks in this scenery. Ready to unlock?"
                : `You need ${shortBy} more coins to unlock this scenery. Complete missions to earn them.`;
          } else {
            message = sheetItem.owned
              ? isEquipped
                ? "Lemmy is wearing this right now."
                : "You own this. Ready to wear it?"
              : canAfford
                ? "Here is how Lemmy looks with it."
                : `You need ${shortBy} more coins. Complete missions to earn them.`;
          }

          return (
            <div
              className="fixed inset-0 z-[110] flex items-end justify-center"
              role="dialog"
              aria-modal="true"
              aria-label={sheetItem.name}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSheetItemId(null)}
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] animate-in fade-in duration-200 cursor-default"
              />

              <div
                className="relative w-full max-w-md bg-[#FFFCF2] rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300"
                style={{
                  paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
                }}
              >
                <div className="w-11 h-1.5 bg-slate-200 rounded-full mx-auto mt-3" />

                <div className="px-5 pt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-amber-600">
                      {CATEGORY_META[sheetItem.category].label}
                    </p>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight truncate">
                      {sheetItem.name}
                    </h3>
                  </div>

                  {sheetItem.owned ? (
                    <span className="shrink-0 flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                      <Check size={13} className="stroke-[3]" />
                      Owned
                    </span>
                  ) : (
                    <span
                      className={`shrink-0 flex items-center gap-1 text-sm font-black px-3 py-1.5 rounded-full border ${
                        canAfford
                          ? "text-amber-800 bg-amber-50 border-amber-200"
                          : "text-slate-400 bg-slate-50 border-slate-200"
                      }`}
                    >
                      {!canAfford && <Lock size={12} />}
                      <Coins
                        size={14}
                        className={
                          canAfford
                            ? "text-amber-500 fill-amber-400"
                            : "text-slate-300 fill-slate-200"
                        }
                      />
                      {sheetItem.price}
                    </span>
                  )}
                </div>

                {/* Try-on stage */}
                <div className="relative mx-5 mt-3 h-52 rounded-[24px] overflow-hidden border-2 border-[#F6D98A]">
                <PalBackground theme={sheetTheme}>
                  <div className="w-full h-52 flex items-end justify-center pb-2">
                    <Mascot
                      className="w-36 h-44"
                      outfit={isScenery ? currentOutfit : tryOnOutfit(sheetItem)}
                    />
                  </div>
                </PalBackground>
              </div>

                <p className="px-5 mt-3 text-xs font-semibold text-slate-500 text-center">
                  {message}
                </p>

                <div className="px-5 mt-3 space-y-2">
                  {sheetItem.owned ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleEquip(sheetItem);
                        setSheetItemId(null);
                      }}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm text-white border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer ${
                        isEquipped
                          ? "bg-slate-700 border-slate-900"
                          : "bg-emerald-500 border-emerald-700"
                      }`}
                    >
                      {isScenery
                        ? isEquipped
                          ? "Current Scene"
                          : "Set as Active Scene"
                        : isEquipped
                          ? "Take it off"
                          : "Wear it"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        handleBuy(sheetItem);
                        setSheetItemId(null);
                      }}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-b-4 transition-all ${
                        canAfford
                          ? "bg-amber-500 border-amber-700 text-white active:border-b-0 active:translate-y-1 cursor-pointer"
                          : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Coins
                        size={16}
                        className={canAfford ? "fill-white" : ""}
                      />
                      {canAfford
                        ? `Buy for ${sheetItem.price} coins`
                        : `Need ${shortBy} more coins`}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSheetItemId(null)}
                    className="w-full py-2.5 rounded-2xl text-slate-500 hover:bg-slate-100 font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Fallback Streak Modal */}
      <StreakModal
        isOpen={internalStreakModalOpen}
        onClose={() => setInternalStreakModalOpen(false)}
        meals={allMeals}
        onLogMeal={() => {
          setInternalStreakModalOpen(false);
          onNavigateToLogMeal?.();
        }}
      />
    </div>
  );
};

export default Pal;
