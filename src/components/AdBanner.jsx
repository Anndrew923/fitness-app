import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { preAdDisplayCheck } from '../utils/adsenseCompliance';
import { getAdUnitId, adConfig } from '../config/adConfig';
import './AdBanner.css';

const AdBanner = ({
  position = 'bottom',
  className = '',
  showAd = true,
  isFixed = true,
  adUnitId = null, // 可選的廣告單元 ID，如果未提供則使用配置中的 ID
}) => {
  const adRef = useRef(null);
  const isDevelopment = import.meta.env.MODE === 'development';
  const isTestMode = import.meta.env.VITE_ADMOB_TEST_MODE === 'true';

  // 獲取廣告單元 ID（優先使用傳入的 ID，否則使用配置中的 ID）
  const finalAdUnitId = adUnitId || getAdUnitId(position);
  const appId = adConfig.appId;

  useEffect(() => {
    // 如果不需要顯示廣告，返回
    if (!showAd) {
      return;
    }

    // 檢查必要的配置
    if (!finalAdUnitId || !appId) {
      console.warn('AdMob 配置不完整:', { finalAdUnitId, appId });
      return;
    }

    // 如果是開發環境或測試模式，顯示測試廣告
    if (isDevelopment || isTestMode) {
      console.log('AdMob 測試模式，顯示測試廣告');
      return;
    }

    // AdMob 合規檢查（使用現有的 AdSense 合規檢查邏輯）
    const pageContent = document.body.innerText || '';
    const currentPage = window.location.pathname.replace('/', '') || 'home';

    if (!preAdDisplayCheck(currentPage, pageContent)) {
      console.log('AdMob 合規檢查失敗，不顯示廣告');
      return;
    }

    // 載入 Google AdMob 腳本
    const loadAdMob = () => {
      if (window.adsbygoogle) {
        // 如果腳本已載入，直接初始化廣告
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error('AdMob 初始化錯誤:', error);
        }
      } else {
        // 載入 AdMob 腳本
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${appId}`;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-ad-client', appId);
        script.onload = () => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (error) {
            console.error('AdMob 載入後初始化錯誤:', error);
          }
        };
        script.onerror = () => {
          console.error('AdMob 腳本載入失敗');
        };
        document.head.appendChild(script);
      }
    };

    // 延遲載入廣告，確保 DOM 已準備好
    const timer = setTimeout(loadAdMob, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [showAd, finalAdUnitId, appId, isDevelopment, isTestMode]);

  // 如果不需要顯示廣告，返回 null
  if (!showAd) {
    return null;
  }

  // 開發環境、測試模式或沒有廣告單元 ID 時顯示優化的預留空間
  if (isDevelopment || isTestMode || !finalAdUnitId) {
    return (
      <div
        className={`ad-banner ad-banner--${position} ${
          isFixed ? 'ad-banner--fixed' : ''
        } ${className}`}
      >
        <div className="ad-banner__placeholder">
          <div className="ad-banner__placeholder-content">
            <span className="ad-banner__placeholder-label">
              {isDevelopment
                ? '🔧 開發模式'
                : isTestMode
                ? '🧪 測試模式'
                : '📱 廣告空間'}
            </span>
            <span className="ad-banner__placeholder-subtitle">
              {isDevelopment
                ? 'AdMob 測試廣告位置'
                : isTestMode
                ? 'AdMob 測試廣告'
                : '等待 AdMob 審查通過'}
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
        data-ad-client={appId} // AdMob 應用程式 ID
        data-ad-slot={finalAdUnitId} // AdMob 廣告單元 ID
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
