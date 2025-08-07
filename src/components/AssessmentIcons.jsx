// import React from 'react';
import PropTypes from 'prop-types';

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

StrengthIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

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

ExplosivePowerIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

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

CardioIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

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
    <rect
      x="2"
      y="8"
      width="4"
      height="8"
      rx="2"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <rect
      x="18"
      y="8"
      width="4"
      height="8"
      rx="2"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <circle
      cx="12"
      cy="12"
      r="2"
      fill="white"
      stroke="black"
      strokeWidth="0.5"
    />
  </svg>
);

MuscleIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

// 體脂率圖標 - 人體輪廓
export const BodyFatIcon = ({ size = 24, color = '#E91E63' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M8 8C8 6.89543 8.89543 6 10 6H14C15.1046 6 16 6.89543 16 8V10C16 11.1046 15.1046 12 14 12H10C8.89543 12 8 11.1046 8 10V8Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M6 14C6 12.8954 6.89543 12 8 12H16C17.1046 12 18 12.8954 18 14V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V14Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M4 20C4 18.8954 4.89543 18 6 18H18C19.1046 18 20 18.8954 20 20V22C20 23.1046 19.1046 24 18 24H6C4.89543 24 4 23.1046 4 22V20Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
  </svg>
);

BodyFatIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

// FFMI圖標 - 肌肉線條
export const FFMIIcon = ({ size = 24, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M8 6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8C16 9.10457 15.1046 10 14 10H10C8.89543 10 8 9.10457 8 8V6Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M6 12C6 10.8954 6.89543 10 8 10H16C17.1046 10 18 10.8954 18 12V14C18 15.1046 17.1046 16 16 16H8C6.89543 16 6 15.1046 6 14V12Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M4 18C4 16.8954 4.89543 16 6 16H18C19.1046 16 20 16.8954 20 18V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V18Z"
      fill={color}
      stroke="black"
      strokeWidth="1.5"
    />
    <line
      x1="12"
      y1="6"
      x2="12"
      y2="20"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

FFMIIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

// 導出所有圖標
export default {
  StrengthIcon,
  ExplosivePowerIcon,
  CardioIcon,
  MuscleIcon,
  FFMI: FFMIIcon,
};
