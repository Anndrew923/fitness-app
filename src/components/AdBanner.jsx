import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { preAdDisplayCheck } from '../utils/adsenseCompliance';
import './AdBanner.css';

const AdBanner = ({
  position = 'bottom',
  className = '',
  showAd = true,
  isFixed = true,
  adUnitId = null, // 從 AdMob 獲取的廣告單元 ID
}) => {
  const adRef = useRef(null);
  const isDevelopment = import.meta.env.MODE === 'development';

  useEffect(() => {
    // 如果不需要顯示廣告，返回
    if (!showAd) {
      return;
    }

    // 如果是開發環境或沒有廣告單元 ID，顯示測試廣告
    if (isDevelopment || !adUnitId) {
      return;
    }

    // AdSense 合規檢查
    const pageContent = document.body.innerText || '';
    const currentPage = window.location.pathname.replace('/', '') || 'home';

    if (!preAdDisplayCheck(currentPage, pageContent)) {
      console.log('AdSense 合規檢查失敗，不顯示廣告');
      return;
    }

    // 載入 Google AdSense 腳本
    const loadAdSense = () => {
      if (window.adsbygoogle) {
        // 如果腳本已載入，直接初始化廣告
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error('AdSense 初始化錯誤:', error);
        }
      } else {
        // 載入 AdSense 腳本
        const script = document.createElement('script');
        script.async = true;
        script.src =
          'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (error) {
            console.error('AdSense 載入後初始化錯誤:', error);
          }
        };
        script.onerror = () => {
          console.error('AdSense 腳本載入失敗');
        };
        document.head.appendChild(script);
      }
    };

    // 延遲載入廣告，確保 DOM 已準備好
    const timer = setTimeout(loadAdSense, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [showAd, adUnitId, isDevelopment]);

  // 如果不需要顯示廣告，返回 null
  if (!showAd) {
    return null;
  }

  // 開發環境或沒有廣告單元 ID 時顯示優化的預留空間
  if (isDevelopment || !adUnitId) {
    return (
      <div
        className={`ad-banner ad-banner--${position} ${
          isFixed ? 'ad-banner--fixed' : ''
        } ${className}`}
      >
        <div className="ad-banner__placeholder">
          <div className="ad-banner__placeholder-content">
            <span className="ad-banner__placeholder-label">
              {isDevelopment ? '🔧 開發模式' : '📱 廣告空間'}
            </span>
            <span className="ad-banner__placeholder-subtitle">
              {isDevelopment ? '測試廣告位置' : '等待 AdSense 審查通過'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 正式廣告
  return (
    <div
      className={`ad-banner ad-banner--${position} ${
        isFixed ? 'ad-banner--fixed' : ''
      } ${className}`}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // 替換為您的 AdSense 客戶 ID
        data-ad-slot={adUnitId} // 您的廣告單元 ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

AdBanner.propTypes = {
  position: PropTypes.oneOf(['top', 'bottom', 'inline']),
  className: PropTypes.string,
  showAd: PropTypes.bool,
  isFixed: PropTypes.bool, // 控制是否固定在底部
  adUnitId: PropTypes.string, // AdMob 廣告單元 ID
};

export default AdBanner;
