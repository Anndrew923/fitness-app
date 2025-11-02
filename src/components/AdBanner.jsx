import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { preAdDisplayCheck } from '../utils/adMobCompliance';
import { getAdUnitId, adConfig } from '../config/adConfig';
import { Capacitor } from '@capacitor/core';
import './AdBanner.css';

// 動態導入 Capacitor AdMob 插件（僅在 Android/iOS 平台使用）
let AdMob = null;
if (Capacitor.isNativePlatform()) {
  import('@capacitor-community/admob').then(module => {
    AdMob = module.AdMob;
  });
}

const AdBanner = ({
  position = 'bottom',
  className = '',
  showAd = true,
  isFixed = true,
  adUnitId = null, // 可選的廣告單元 ID，如果未提供則使用配置中的 ID
}) => {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(null);
  const isDevelopment = import.meta.env.MODE === 'development';
  const isTestMode = import.meta.env.VITE_ADMOB_TEST_MODE === 'true';
  const isNativePlatform = Capacitor.isNativePlatform();

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

    // AdMob 合規檢查
    const pageContent = document.body?.innerText || '';
    const currentPage = window.location?.pathname?.replace('/', '') || 'home';

    if (!preAdDisplayCheck(currentPage, pageContent)) {
      console.log('AdMob 合規檢查失敗，不顯示廣告');
      return;
    }

    // 平台判斷：Android/iOS 使用原生 SDK，Web 使用 Web 腳本
    if (isNativePlatform) {
      // Android/iOS 原生 AdMob
      const loadNativeAd = async () => {
        try {
          // 動態導入 AdMob 插件
          const { AdMob } = await import('@capacitor-community/admob');

          // 確保 AdMob 已初始化（應在 App 啟動時執行）
          try {
            await AdMob.initialize({
              requestTrackingAuthorization: true,
              testingDevices: isDevelopment || isTestMode ? [] : undefined,
            });
          } catch (initError) {
            // 如果已初始化，會拋出錯誤，可以忽略
            console.log('AdMob 初始化檢查:', initError.message);
          }

          // 準備橫幅廣告
          const adId =
            isDevelopment || isTestMode
              ? 'ca-app-pub-3940256099942544/6300978111' // 測試 ID
              : finalAdUnitId;

          const bannerOptions = {
            adId: adId,
            adSize: 'BANNER',
            position: position === 'top' ? 'TOP_CENTER' : 'BOTTOM_CENTER',
            margin: 64, // 底部導覽列高度（64px），讓廣告顯示在導覽列上方，避免重疊
          };

          // 載入橫幅廣告
          await AdMob.prepareBanner(bannerOptions);
          await AdMob.showBanner({
            adId: adId,
            adPosition: bannerOptions.position,
          });
          setAdLoaded(true);
          console.log('✅ 原生 AdMob 橫幅廣告已載入');
        } catch (error) {
          console.error('❌ 原生 AdMob 載入失敗:', error);
          setAdError(error.message);
        }
      };

      loadNativeAd();
    } else {
      // Web 版 AdMob（使用 adsbygoogle.js）
      const loadWebAd = () => {
        if (window.adsbygoogle) {
          // 如果腳本已載入，直接初始化廣告
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
          } catch (error) {
            console.error('AdMob 初始化錯誤:', error);
            setAdError(error.message);
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
              setAdLoaded(true);
            } catch (error) {
              console.error('AdMob 載入後初始化錯誤:', error);
              setAdError(error.message);
            }
          };
          script.onerror = () => {
            console.error('AdMob 腳本載入失敗');
            setAdError('AdMob 腳本載入失敗');
          };
          document.head.appendChild(script);
        }
      };

      // 延遲載入廣告，確保 DOM 已準備好
      const timer = setTimeout(loadWebAd, 100);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [
    showAd,
    finalAdUnitId,
    appId,
    isDevelopment,
    isTestMode,
    isNativePlatform,
    position,
  ]);

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
  // Android/iOS 原生平台：AdMob 原生 SDK 會自動處理視圖，只需要預留空間
  // Web 平台：使用 adsbygoogle.js 腳本
  return (
    <div
      className={`ad-banner ad-banner--${position} ${
        isFixed ? 'ad-banner--fixed' : ''
      } ${className}`}
    >
      {isNativePlatform ? (
        // Android/iOS 原生 AdMob：原生 SDK 會自動渲染廣告
        // 這裡只需要提供容器，廣告會自動顯示
        <div
          ref={adRef}
          style={{
            width: '100%',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {adError && (
            <div
              style={{ color: '#dc3545', fontSize: '12px', padding: '10px' }}
            >
              ⚠️ 廣告載入失敗: {adError}
            </div>
          )}
          {!adLoaded && !adError && (
            <div style={{ color: '#6c757d', fontSize: '12px' }}>
              📱 載入廣告中...
            </div>
          )}
        </div>
      ) : (
        // Web 版 AdMob：使用 adsbygoogle.js
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={appId} // AdMob 應用程式 ID
          data-ad-slot={finalAdUnitId} // AdMob 廣告單元 ID
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
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
