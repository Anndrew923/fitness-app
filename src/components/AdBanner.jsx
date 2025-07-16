import React from 'react';
import PropTypes from 'prop-types';
import './AdBanner.css';

const AdBanner = ({
  position = 'bottom',
  className = '',
  showAd = true,
  isFixed = true,
}) => {
  // 開發環境顯示測試廣告
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 如果不需要顯示廣告，返回 null
  if (!showAd) {
    return null;
  }

  return (
    <div
      className={`ad-banner ad-banner--${position} ${
        isFixed ? 'ad-banner--fixed' : ''
      } ${className}`}
    >
      {isDevelopment ? (
        <div className="ad-banner__test">
          <div className="ad-banner__test-content">
            <span className="ad-banner__test-label">🎯 廣告空間預留 🎯</span>
            <span className="ad-banner__test-size">點擊體驗優化版設計</span>
          </div>
        </div>
      ) : (
        <div className="ad-banner__placeholder">
          {/* 正式環境將顯示 AdMob 廣告 */}
          <div className="ad-banner__content">
            <div className="ad-banner__loading">
              <div className="ad-banner__loading-dot"></div>
              <div className="ad-banner__loading-dot"></div>
              <div className="ad-banner__loading-dot"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AdBanner.propTypes = {
  position: PropTypes.oneOf(['top', 'bottom', 'inline']),
  className: PropTypes.string,
  showAd: PropTypes.bool,
  isFixed: PropTypes.bool, // 控制是否固定在底部
};

export default AdBanner;
