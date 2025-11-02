import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { preAdDisplayCheck } from '../utils/adMobCompliance';
import { getAdUnitId, adConfig, shouldShowAd } from '../config/adConfig';
import { Capacitor } from '@capacitor/core';
import './AdBanner.css';

// ✅ 動態導入 AdMob 插件（在組件內部使用動態導入，移除頂部未使用的變數定義）

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

  // ✅ 修正 1：應用程式審核狀態（在 AdMob 應用程式審核通過前設為 true）
  const APP_PENDING_ADMOB_REVIEW = true; // TODO: AdMob 應用程式審核通過後改為 false

  // 獲取廣告單元 ID（優先使用傳入的 ID，否則使用配置中的 ID）
  const finalAdUnitId = adUnitId || getAdUnitId(position);
  const appId = adConfig.appId;

  useEffect(() => {
    // 如果不需要顯示廣告，返回
    if (!showAd) {
      return;
    }

    // ✅ 修正 1：應用程式待審核時，不載入任何廣告（包括測試廣告）
    // 只顯示 placeholder，不調用 AdMob.showBanner()，避免真實廣告與 placeholder 重疊
    if (APP_PENDING_ADMOB_REVIEW) {
      console.log('📋 應用程式待審核，不載入真實廣告，只顯示 placeholder');
      return; // 不執行廣告載入邏輯，只顯示 placeholder
    }

    // 檢查必要的配置
    if (!finalAdUnitId || !appId) {
      console.warn('AdMob 配置不完整:', { finalAdUnitId, appId });
      return;
    }

    // ✅ 修正 2：測試模式或開發環境時，使用測試廣告 ID（不 return）
    if (isDevelopment || isTestMode) {
      console.log('AdMob 測試模式或開發環境，將使用測試廣告 ID');
      // 不 return，繼續執行，使用測試廣告 ID
    }

    // ✅ 修正 3：先檢查頁面配置（優先於合規檢查）
    const pageContent = document.body?.innerText || '';
    const currentPage = window.location?.pathname?.replace('/', '') || 'home';

    // ✅ 修正 3：檢查頁面配置，確保遵守 shouldShowAd() 的結果
    if (!shouldShowAd(currentPage, position)) {
      console.log(
        `📄 頁面 [${currentPage}] 配置為不顯示廣告（${position}位置）`
      );
      return;
    }

    // ✅ 然後進行 AdMob 合規檢查
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

          // ✅ 移除重複初始化（已在 App.jsx 中初始化，避免資源競爭）

          // 準備橫幅廣告
          // ✅ 修正：測試模式或開發環境時，使用測試廣告 ID
          // 注意：APP_PENDING_ADMOB_REVIEW 的情況已在 useEffect 開始處 return，不會執行到這裡
          const adId =
            isDevelopment || isTestMode
              ? 'ca-app-pub-3940256099942544/6300978111' // 測試 ID
              : finalAdUnitId; // 真實廣告 ID（應用程式審核通過後使用）

          // ✅ 新增：詳細日誌，確認使用的廣告 ID
          console.log('🔍 廣告 ID 選擇:', {
            isDevelopment,
            isTestMode,
            APP_PENDING_ADMOB_REVIEW,
            selectedAdId: adId,
            finalAdUnitId,
            isTestAd: adId === 'ca-app-pub-3940256099942544/6300978111',
          });

          if (adId === 'ca-app-pub-3940256099942544/6300978111') {
            console.log('✅ 使用測試廣告 ID（正確）');
          } else {
            console.warn('⚠️ 使用真實廣告 ID（應用程式審核通過後才應使用）');
          }

          const bannerOptions = {
            adId: adId,
            adSize: 'BANNER',
            position: position === 'top' ? 'TOP_CENTER' : 'BOTTOM_CENTER',
            margin: 84, // ✅ 導覽列高度(64px) + 安全間距(20px) = 84px，讓廣告顯示在導覽列上方，避免重疊
          };

          // ✅ 移除 prepareBanner（在 Android 上未實現），直接使用 showBanner
          await AdMob.showBanner({
            adId: bannerOptions.adId,
            adSize: bannerOptions.adSize,
            adPosition: bannerOptions.position,
            margin: bannerOptions.margin, // ✅ 傳遞 margin 參數，確保廣告位置正確
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
      // ✅ 修正 1：Web 版本的廣告 ID 邏輯在 JSX 中的 data-ad-slot 屬性中處理
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
    APP_PENDING_ADMOB_REVIEW, // ✅ 添加到依賴項
  ]);

  // 如果不需要顯示廣告，返回 null
  if (!showAd) {
    return null;
  }

  // ✅ 修正 4：先檢查頁面配置，如果不應顯示廣告，直接返回 null（包括 placeholder）
  const currentPage = window.location?.pathname?.replace('/', '') || 'home';
  if (!shouldShowAd(currentPage, position)) {
    return null; // 不顯示廣告（包括 placeholder）
  }

  // ✅ 修正 5：開發環境、測試模式、應用程式待審核或沒有廣告單元 ID 時顯示優化的預留空間
  if (
    isDevelopment ||
    isTestMode ||
    APP_PENDING_ADMOB_REVIEW ||
    !finalAdUnitId
  ) {
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
                : APP_PENDING_ADMOB_REVIEW
                ? '📋 測試廣告'
                : '📱 廣告空間'}
            </span>
            <span className="ad-banner__placeholder-subtitle">
              {isDevelopment
                ? 'AdMob 測試廣告位置'
                : isTestMode
                ? 'AdMob 測試廣告'
                : APP_PENDING_ADMOB_REVIEW
                ? '等待 AdMob 審查通過'
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
          data-ad-slot={
            // ✅ 修正：Web 版本也需要使用測試廣告 ID（測試模式或開發環境時）
            // 注意：APP_PENDING_ADMOB_REVIEW 的情況已在 useEffect 開始處 return，不會執行到這裡
            isDevelopment || isTestMode
              ? 'ca-app-pub-3940256099942544/6300978111' // 測試 ID
              : finalAdUnitId
          } // AdMob 廣告單元 ID
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
