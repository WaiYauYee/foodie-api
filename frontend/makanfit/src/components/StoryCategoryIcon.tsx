import React from "react";

interface StoryCategoryIconProps {
  type: "vision" | "nutrition" | "companion" | "camera" | "food" | "plan" | "onboarding" | "signup";
  className?: string;
  size?: number;
  pure?: boolean;
}

const StoryCategoryIcon: React.FC<StoryCategoryIconProps> = ({
  type,
  className = "",
  size = 48,
  pure = false,
}) => {
  const iconSize = Math.round(size * (28 / 48));

  const baseClass = pure
    ? `flex items-center justify-center ${className}`
    : `w-12 h-12 rounded-2xl bg-[#F1F5F9] flex items-center justify-center relative shadow-xs shrink-0 select-none ${className}`;

  if (type === "vision") {
    return (
      <div className={baseClass} title="AI Food Vision">
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* Camera body */}
          <rect
            x="5"
            y="9"
            width="18"
            height="13"
            rx="3"
            fill="#DBEAFE"
            stroke="#60A5FA"
            strokeWidth="1.2"
          />

          {/* Camera top */}
          <path
            d="M9 9l1.8-3h6.4L19 9"
            fill="#BFDBFE"
            stroke="#60A5FA"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Lens */}
          <circle
            cx="14"
            cy="15.5"
            r="4"
            fill="#FFFFFF"
            stroke="#38BDF8"
            strokeWidth="1.2"
          />

          <circle cx="14" cy="15.5" r="2" fill="#BAE6FD" />

          {/* Small food highlight */}
          <circle cx="14.8" cy="14.7" r="0.7" fill="#FFFFFF" />

          {/* Camera indicator */}
          <circle cx="20" cy="11.5" r="1" fill="#34D399" />
        </svg>
      </div>
    );
  }

  if (type === "nutrition") {
    return (
      <div className={baseClass} title="Nutrition Goals">
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* Plate */}
          <circle
            cx="14"
            cy="15"
            r="8"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />

          {/* Plate inner ring */}
          <circle cx="14" cy="15" r="5.8" stroke="#E2E8F0" strokeWidth="1" />

          {/* Vegetables */}
          <circle cx="11" cy="13" r="1.8" fill="#4ADE80" />

          <circle cx="15" cy="12.5" r="1.7" fill="#FACC15" />

          {/* Protein */}
          <path
            d="M16.5 15c1.8-1 3.3.2 3 1.8-.3 1.5-2 2.2-3.4 1.4"
            fill="#FDBA74"
            stroke="#EA580C"
            strokeWidth="0.9"
          />

          {/* Leaf */}
          <path
            d="M9 8c1.8-2 4-2.2 5.5-1.5-1 2-2.8 3.1-5.5 1.5z"
            fill="#86EFAC"
            stroke="#16A34A"
            strokeWidth="0.9"
          />

          {/* Small balance line */}
          <path
            d="M8 23h12"
            stroke="#94A3B8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // Companion
  if (type === "companion") {
    return (
      <div className={baseClass} title="Lemmy Companion">
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* Nasi bowl */}
          <path
            d="M6 14h16c-.5 5-3.2 8-8 8s-7.5-3-8-8z"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="1.1"
          />

          {/* Rice */}
          <path
            d="M8 14c.5-3 2.4-4.5 4.2-3.5 1-.9 2.5-.9 3.5 0 1.8-1 3.8.6 4.3 3.5H8z"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="0.9"
          />

          {/* Sambal */}
          <ellipse cx="14" cy="13.5" rx="2.5" ry="1.2" fill="#EF4444" />

          {/* Egg yolk */}
          <circle cx="18.5" cy="12" r="1.6" fill="#FBBF24" />

          {/* Small leaf */}
          <path
            d="M10 10c.5-2 2-2.7 3.5-2.4-.4 1.7-1.5 2.6-3.5 2.4z"
            fill="#4ADE80"
            stroke="#16A34A"
            strokeWidth="0.8"
          />

          {/* Heart */}
          <path
            d="M18.5 5.5c-.9-1.2-3-.5-3 1 0-1.5-2.1-2.2-3-1-.9 1.2-.1 2.6 3 4.5 3.1-1.9 3.9-3.3 3-4.5z"
            fill="#FB7185"
            stroke="#E11D48"
            strokeWidth="0.8"
          />
        </svg>
      </div>
    );
  }

  if (type === "camera") {
    return (
      <div className={baseClass} title="AI Food Vision">
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* AI Scan corner brackets */}
          <path
            d="M4.5 8.5V6.5C4.5 5.95 4.95 5.5 5.5 5.5H7.5"
            stroke="#10B981"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M23.5 8.5V6.5C23.5 5.95 23.05 5.5 22.5 5.5H20.5"
            stroke="#10B981"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M4.5 20.5V22.5C4.5 23.05 4.95 23.5 5.5 23.5H7.5"
            stroke="#10B981"
            strokeWidth="1.3"
            strokeLinecap="round"
          />

          {/* Camera body on the left */}
          <path
            d="M8.5 9L9.8 7.2H14.2L15.5 9"
            fill="#BAE6FD"
            stroke="#0284C7"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <rect
            x="5.5"
            y="9"
            width="13"
            height="9.5"
            rx="2.2"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="1.2"
          />
          {/* Camera lens */}
          <circle
            cx="12"
            cy="13.8"
            r="3.2"
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="1.2"
          />
          <circle cx="12" cy="13.8" r="1.6" fill="#38BDF8" />
          <circle cx="12.7" cy="13.1" r="0.6" fill="#FFFFFF" />
          {/* Shutter indicator */}
          <circle cx="16.5" cy="11" r="0.8" fill="#10B981" />

          {/* Mini Nasi Lemak plate overlapping bottom-right (like MealCategoryIcon egg/fruit) */}
          <ellipse
            cx="19.5"
            cy="18.8"
            rx="5.2"
            ry="3.8"
            fill="#DCFCE7"
            stroke="#16A34A"
            strokeWidth="1.1"
          />
          {/* Coconut rice mound */}
          <path
            d="M16.3 19C16.6 16.5 18 15.3 19.5 15.3C21 15.3 22.4 16.5 22.7 19H16.3Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          {/* Sambal & egg yolk */}
          <circle cx="20.6" cy="18" r="1.2" fill="#EF4444" />
          <circle cx="18.2" cy="18.1" r="1.1" fill="#FBBF24" />
        </svg>
      </div>
    );
  }

  if (type === "food") {
    return (
      <div className={baseClass} title="Smart Nutrition Goals">
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* Hydration water glass on the left */}
          <rect
            x="4.5"
            y="7.5"
            width="6"
            height="11.5"
            rx="1.5"
            fill="#BAE6FD"
            stroke="#38BDF8"
            strokeWidth="1.2"
          />
          <rect x="5.5" y="10" width="4" height="7.8" rx="0.8" fill="#E0F2FE" />
          {/* Water surface wave */}
          <path
            d="M5.5 10.2Q7.5 9.4 9.5 10.2"
            stroke="#0284C7"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Suku-Suku Separuh Balanced Plate on the right */}
          <circle
            cx="17.2"
            cy="15.2"
            r="6.8"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          <circle
            cx="17.2"
            cy="15.2"
            r="5"
            stroke="#E2E8F0"
            strokeWidth="0.9"
          />

          {/* Separuh (Half plate greens/ulam) */}
          <circle cx="14.8" cy="13.5" r="2" fill="#22C55E" />
          <circle cx="14.5" cy="16.4" r="1.9" fill="#16A34A" />
          <circle cx="16.2" cy="14.8" r="1.4" fill="#4ADE80" />

          {/* Suku (Quarter rice) */}
          <circle
            cx="19.3"
            cy="13.4"
            r="1.9"
            fill="#FEF9C3"
            stroke="#FACC15"
            strokeWidth="0.9"
          />

          {/* Suku (Quarter protein/ayam) */}
          <ellipse
            cx="19.2"
            cy="16.8"
            rx="2.1"
            ry="1.5"
            fill="#FDBA74"
            stroke="#EA580C"
            strokeWidth="1"
          />

          {/* Sparkle / target accent */}
          <path
            d="M21 6.2L21.6 7.6L23 8.2L21.6 8.8L21 10.2L20.4 8.8L19 8.2L20.4 7.6L21 6.2Z"
            fill="#FBBF24"
          />
        </svg>
      </div>
    );
  }

  if (type === 'onboarding') {
    return (
      <div className={baseClass} title="User Profile & Body Metrics">
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* Vertical Height Ruler on the left */}
          <rect
            x="4.5"
            y="5.5"
            width="4.5"
            height="17"
            rx="1.2"
            fill="#FEF08A"
            stroke="#CA8A04"
            strokeWidth="1.2"
          />
          {/* Ruler cm measurement ticks */}
          <line x1="4.5" y1="8.5" x2="6.8" y2="8.5" stroke="#CA8A04" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="4.5" y1="11.5" x2="6.2" y2="11.5" stroke="#CA8A04" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="4.5" y1="14.5" x2="6.8" y2="14.5" stroke="#CA8A04" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="4.5" y1="17.5" x2="6.2" y2="17.5" stroke="#CA8A04" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="4.5" y1="20.5" x2="6.8" y2="20.5" stroke="#CA8A04" strokeWidth="1.1" strokeLinecap="round" />

          {/* User Profile & Name Badge Card in the center-right */}
          <rect
            x="10.5"
            y="6"
            width="12.5"
            height="12"
            rx="2.5"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          {/* Cute user avatar head & shoulders */}
          <circle
            cx="16.8"
            cy="10"
            r="2.1"
            fill="#A7F3D0"
            stroke="#059669"
            strokeWidth="1.1"
          />
          <path
            d="M13.5 14.5C13.9 12.9 15.2 12.3 16.8 12.3C18.4 12.3 19.7 12.9 20.1 14.5"
            fill="#D1FAE5"
            stroke="#059669"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {/* Name line indicator */}
          <line
            x1="13.5"
            y1="16.3"
            x2="20"
            y2="16.3"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Mini Weight Scale overlapping bottom-right */}
          <rect
            x="14.5"
            y="16.5"
            width="9.5"
            height="7"
            rx="2"
            fill="#BAE6FD"
            stroke="#0284C7"
            strokeWidth="1.2"
          />
          {/* Scale dial window */}
          <path
            d="M17.2 19.8C17.2 18.6 18.1 17.8 19.25 17.8C20.4 17.8 21.3 18.6 21.3 19.8H17.2Z"
            fill="#FFFFFF"
            stroke="#38BDF8"
            strokeWidth="0.9"
          />
          {/* Scale needle */}
          <line
            x1="19.25"
            y1="19.8"
            x2="20.1"
            y2="18.5"
            stroke="#EF4444"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (type === 'signup') {
    return (
      <div className={baseClass} title="Create Account">
        <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
          {/* Warm welcome envelope / pass card in the background left */}
          <rect
            x="4.5"
            y="6.5"
            width="14.5"
            height="14.5"
            rx="3"
            fill="#E0F2FE"
            stroke="#38BDF8"
            strokeWidth="1.2"
          />

          {/* User Avatar inside the account card */}
          <circle
            cx="11.8"
            cy="11.5"
            r="2.4"
            fill="#FEF08A"
            stroke="#CA8A04"
            strokeWidth="1.1"
          />
          <path
            d="M7.8 17.5C8.3 15.3 9.9 14.5 11.8 14.5C13.7 14.5 15.3 15.3 15.8 17.5"
            fill="#FDE68A"
            stroke="#CA8A04"
            strokeWidth="1.1"
            strokeLinecap="round"
          />

          {/* Overlapping Emerald Security / New Account Badge bottom-right */}
          <circle
            cx="19.5"
            cy="18.2"
            r="4.5"
            fill="#4ADE80"
            stroke="#15803D"
            strokeWidth="1.2"
          />
          {/* Plus symbol for "Create / New" */}
          <path
            d="M19.5 16.1V20.3M17.4 18.2H21.6"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Sparkle star top-right */}
          <path
            d="M21.5 5.5L22.1 6.9L23.5 7.5L22.1 8.1L21.5 9.5L20.9 8.1L19.5 7.5L20.9 6.9L21.5 5.5Z"
            fill="#FBBF24"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={baseClass} title="Lemmy Nasi Lemak Pal">
      <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
        {/* Banana leaf base wrap */}
        <path
          d="M6.5 20.5C6 22.2 22 22.2 21.5 20.5C22 17.2 20 15 18.2 14C15.5 16.5 12.5 16.5 9.8 14C8 15 6 17.2 6.5 20.5Z"
          fill="#22C55E"
          stroke="#15803D"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Fragrant rice pyramid body */}
        <path
          d="M14 6.8C15 6.8 15.8 7.6 17 10L20.5 17.8C21.2 19.3 20 20.4 18.2 20.4H9.8C8 20.4 6.8 19.3 7.5 17.8L11 10C12.2 7.6 13 6.8 14 6.8Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Boiled egg slice peeking on the left */}
        <ellipse
          cx="9.2"
          cy="15.5"
          rx="2.3"
          ry="3"
          transform="rotate(-15 9.2 15.5)"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1"
        />
        <circle cx="9.2" cy="15.7" r="1.4" fill="#FBBF24" />

        {/* Sambal dollop on the right */}
        <circle cx="18.6" cy="17.8" r="1.8" fill="#EF4444" />
        <circle cx="18.1" cy="17.3" r="0.5" fill="#FCA5A5" />

        {/* Cute kawaii eyes & smile */}
        <circle cx="12.3" cy="13.5" r="0.9" fill="#1E293B" />
        <circle cx="15.7" cy="13.5" r="0.9" fill="#1E293B" />
        <ellipse cx="10.9" cy="14.5" rx="0.9" ry="0.5" fill="#FDA4AF" />
        <ellipse cx="17.1" cy="14.5" rx="0.9" ry="0.5" fill="#FDA4AF" />
        <path
          d="M13 14.6Q14 15.8 15 14.6"
          stroke="#1E293B"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Companion Heart floating top-right */}
        <path
          d="M22.5 6.8C21.8 5.9 20.2 6.4 20.2 7.6C20.2 6.4 18.6 5.9 17.9 6.8C17.2 7.7 17.8 8.9 20.2 10.4C22.6 8.9 23.2 7.7 22.5 6.8Z"
          fill="#FB7185"
          stroke="#E11D48"
          strokeWidth="0.9"
        />
      </svg>
    </div>
  );
};

export default StoryCategoryIcon;
