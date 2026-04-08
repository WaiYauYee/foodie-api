
import React, { useId } from 'react';

interface MakanFitAvatarProps {
  size?: number;
  className?: string;
}

const MakanFitAvatar: React.FC<MakanFitAvatarProps> = ({ size = 100, className = "" }) => {
  // Generate a unique ID for the gradient to prevent collisions and fix mobile resolution issues
  const gradientId = `makanfit-gradient-${useId().replace(/:/g, "")}`;

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Main Body - Green Coconut */}
        <path
          d="M20 45C20 25.67 35.67 10 55 10C74.33 10 90 25.67 90 45V70C90 78.2843 83.2843 85 75 85H35C26.7157 85 20 78.2843 20 70V45Z"
          fill={`url(#${gradientId})`}
        />
        
        {/* Inner Shell Detail */}
        <path
          d="M28 45C28 32.2975 38.2975 22 51 22C63.7025 22 74 32.2975 74 45V68C74 71.3137 71.3137 74 68 74H34C30.6863 74 28 71.3137 28 68V45Z"
          fill="white"
          fillOpacity="0.1"
        />

        {/* The Face - Friendly Eyes */}
        <circle cx="45" cy="48" r="4" fill="#1A2A33" />
        <circle cx="70" cy="48" r="4" fill="#1A2A33" />
        
        {/* Cute Blush */}
        <circle cx="40" cy="54" r="3" fill="#10B981" fillOpacity="0.3" />
        <circle cx="75" cy="54" r="3" fill="#10B981" fillOpacity="0.3" />

        {/* Small Smile */}
        <path
          d="M54 58C54 58 56.5 61 60.5 61C64.5 61 67 58 67 58"
          stroke="#1A2A33"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Coconut "Top" / Leaf Stem */}
        <path
          d="M55 10L52 4C52 4 48 2 48 6C48 10 52 14 55 14"
          fill="#064E3B"
        />
        <path
          d="M58 8C62 8 66 12 66 16C66 20 62 22 62 22"
          stroke="#059669"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Glassy Highlight */}
        <path
          d="M35 20C35 20 45 15 55 15"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />

        <defs>
          <linearGradient
            id={gradientId}
            x1="20"
            y1="10"
            x2="90"
            y2="85"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default MakanFitAvatar;
