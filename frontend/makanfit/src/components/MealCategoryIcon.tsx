import React from 'react';
import { MealType } from '../types/types';

interface MealCategoryIconProps {
  type: MealType | string;
  className?: string;
  size?: number;
}

export const MealCategoryIcon: React.FC<MealCategoryIconProps> = ({ type, className = '', size = 48, }) => {
  const normType = type.toLowerCase();
  const iconSize = Math.round(size * (28 / 48));

  if (normType === 'breakfast') {
    return (
    //   <div
    //     className={`w-12 h-12 rounded-full bg-[#FED7AA] flex items-center justify-center relative shadow-xs shrink-0 select-none ${className}`}
    //     title="Breakfast"
    //   >
    //     <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    //       {/* Eyes */}
    //       <circle cx="9.5" cy="11.5" r="1.8" fill="#1E293B" />
    //       <circle cx="18.5" cy="11.5" r="1.8" fill="#1E293B" />
    //       {/* Friendly curved smile */}
    //       <path
    //         d="M10 17C11.5 19.2 16.5 19.2 18 17"
    //         stroke="#1E293B"
    //         strokeWidth="2.4"
    //         strokeLinecap="round"
    //       />
    //     </svg>
    //   </div>
    <div
        className={`w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center relative shadow-xs shrink-0 select-none ${className}`}
        title="Breakfast"
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* Toast slice */}
          <path
            d="M5 12.5c0-3 2.2-5 5-5s5 2 5 5v7.5H5v-7.5z"
            fill="#FDBA74"
            stroke="#EA580C"
            strokeWidth="1.2"
          />
          <path
            d="M6.5 12.5c0-2.2 1.5-3.8 3.5-3.8s3.5 1.6 3.5 3.8"
            stroke="#FED7AA"
            strokeWidth="1"
            fill="none"
          />

          {/* Sunny-side-up egg */}
          <ellipse cx="19" cy="16" rx="6" ry="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="19.5" cy="15.5" r="2.6" fill="#FBBF24" />
          <circle cx="18.5" cy="14.5" r="0.8" fill="#FDE68A" />

          {/* Steam lines (coffee vibe) */}
          <path
            d="M9 5.5c0 .8-1 .8-1 1.6s1 .8 1 1.6"
            stroke="#94A3B8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M12 5c0 .8-1 .8-1 1.6s1 .8 1 1.6"
            stroke="#94A3B8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (normType === 'lunch') {
    return (
      <div
        className={`w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center relative shadow-xs shrink-0 select-none ${className}`}
        title="Lunch"
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* Fork */}
          <path
            d="M6.5 6v5a1.8 1.8 0 001.8 1.8h0a1.8 1.8 0 001.8-1.8V6M8.3 6v14"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Knife */}
          <path
            d="M12.5 6v14M12.5 6c1.5 0 2 2 2 4v4h-2"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Red-Orange Tomato/Fruit */}
          <circle cx="19.5" cy="15" r="5" fill="#F97316" />
          <circle cx="18.5" cy="14" r="1.5" fill="#FB923C" />
          {/* Leaf stem */}
          <path
            d="M19.5 10c0-1.5 1-2 2-2"
            stroke="#15803D"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (normType === 'dinner') {
    return (
      <div
        className={`w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center relative shadow-xs shrink-0 select-none ${className}`}
        title="Dinner"
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* Glass of water */}
          <rect
            x="5.5"
            y="9"
            width="6"
            height="11"
            rx="1.5"
            fill="#BAE6FD"
            stroke="#38BDF8"
            strokeWidth="1.2"
          />
          <rect x="6.5" y="11" width="4" height="8" rx="1" fill="#E0F2FE" />
          {/* Dinner Bowl */}
          <path
            d="M11 16c0 4 3 6 7 6s7-2 7-6H11z"
            fill="#FEF08A"
            stroke="#CA8A04"
            strokeWidth="1.2"
          />
          {/* Salad greens */}
          <circle cx="15" cy="14" r="2.5" fill="#16A34A" />
          <circle cx="18" cy="13.5" r="2.5" fill="#22C55E" />
          <circle cx="21" cy="14" r="2" fill="#EAB308" />
        </svg>
      </div>
    );
  }

  // Snacks
  return (
    <div
      className={`w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center relative shadow-xs shrink-0 select-none ${className}`}
      title="Snacks"
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
        {/* Yogurt cup */}
        <path
          d="M5 12h8l-1 8H6l-1-8z"
          fill="#E0F2FE"
          stroke="#BAE6FD"
          strokeWidth="1.2"
        />
        <rect x="4.5" y="10.5" width="9" height="2" rx="0.5" fill="#FDE68A" />
        {/* Spoon */}
        <path d="M5 8l3 4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        {/* Kiwi slice */}
        <circle cx="19.5" cy="15.5" r="5" fill="#A3E635" stroke="#65A30D" strokeWidth="1.2" />
        <circle cx="19.5" cy="15.5" r="2.5" fill="#FEF08A" />
        {/* Seeds */}
        <circle cx="18.3" cy="14.8" r="0.4" fill="#365314" />
        <circle cx="19.5" cy="14.2" r="0.4" fill="#365314" />
        <circle cx="20.7" cy="14.8" r="0.4" fill="#365314" />
        <circle cx="20.7" cy="16.2" r="0.4" fill="#365314" />
        <circle cx="18.3" cy="16.2" r="0.4" fill="#365314" />
      </svg>
    </div>
  );
};

export default MealCategoryIcon;
