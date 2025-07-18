import React from 'react';

// 力量圖標 - 彎曲的二頭肌
export const StrengthIcon = ({ size = 24, color = '#FFD700' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M8 6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8C16 9.10457 15.1046 10 14 10H10C8.89543 10 8 9.10457 8 8V6Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M6 8C6 6.89543 6.89543 6 8 6H10C11.1046 6 12 6.89543 12 8V10C12 11.1046 11.1046 12 10 12H8C6.89543 12 6 11.1046 6 10V8Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M12 8C12 6.89543 12.8954 6 14 6H16C17.1046 6 18 6.89543 18 8V10C18 11.1046 17.1046 12 16 12H14C12.8954 12 12 11.1046 12 10V8Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <circle
      cx="12"
      cy="9"
      r="1"
      fill="white"
      stroke="black"
      strokeWidth="0.5"
    />
  </svg>
);

// 爆發力圖標 - 閃電
export const ExplosivePowerIcon = ({ size = 24, color = '#FFD700' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M13 2L11 8H15L13 14L17 10H13L15 4L13 2Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M7 8L9 14L5 10H9L7 16L9 22L7 16Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// 心肺耐力圖標 - 跑步小人
export const CardioIcon = ({ size = 24, color = '#FF6B35' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="6"
      r="3"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M9 9C9 9 10 11 12 11C14 11 15 9 15 9"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 16L10 14L12 16L14 14L16 16"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 18L8 16L10 18L12 16L14 18L16 16L18 18"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 骨骼肌肉量圖標 - 啞鈴
export const MuscleIcon = ({ size = 24, color = '#FF9800' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x="4"
      y="10"
      width="16"
      height="4"
      rx="2"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <circle
      cx="6"
      cy="12"
      r="3"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <circle
      cx="18"
      cy="12"
      r="3"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <rect
      x="8"
      y="11"
      width="8"
      height="2"
      fill="white"
      stroke="black"
      strokeWidth="0.5"
    />
  </svg>
);

// FFMI圖標 - 柱狀圖
export const FFMIIcon = ({ size = 24, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="2"
      fill="none"
      stroke="black"
      strokeWidth="1.5"
    />
    <rect
      x="6"
      y="14"
      width="2"
      height="6"
      fill={color}
      stroke="black"
      strokeWidth="0.5"
    />
    <rect
      x="10"
      y="10"
      width="2"
      height="10"
      fill={color}
      stroke="black"
      strokeWidth="0.5"
    />
    <rect
      x="14"
      y="6"
      width="2"
      height="14"
      fill={color}
      stroke="black"
      strokeWidth="0.5"
    />
    <rect
      x="18"
      y="12"
      width="2"
      height="8"
      fill={color}
      stroke="black"
      strokeWidth="0.5"
    />
  </svg>
);

// 導出所有圖標
export default {
  StrengthIcon,
  ExplosivePowerIcon,
  CardioIcon,
  MuscleIcon,
  FFMI: FFMIIcon,
};
