import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/**
 * 統一的載入動畫組件
 * 用於 Suspense fallback 和頁面載入狀態
 */
const LoadingSpinner = ({ 
  message = '載入中...', 
  size = 'medium',
  fullScreen = false 
}) => {
  return (
    <div className={`loading-spinner-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullScreen: PropTypes.bool,
};

export default React.memo(LoadingSpinner);

