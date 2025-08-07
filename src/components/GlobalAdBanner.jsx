// import React from 'react';
import { useLocation } from 'react-router-dom';
import AdBanner from './AdBanner';

const GlobalAdBanner = () => {
  const location = useLocation();

  // 定義需要顯示廣告的頁面
  const adEnabledPaths = [
    '/user-info',
    '/friends',
    '/ladder',
    '/history',
    '/strength',
    '/cardio',
    '/explosive-power',
    '/muscle-mass',
    '/body-fat',
  ];

  // 定義不顯示廣告的頁面
  const adDisabledPaths = [
    '/login',
    '/privacy-policy',
    '/test',
    '/strength-instructions',
  ];

  // 檢查當前路徑是否應該顯示廣告
  const shouldShowAd = () => {
    const currentPath = location.pathname;

    // 如果在禁用列表中，不顯示
    if (adDisabledPaths.some(path => currentPath.startsWith(path))) {
      return false;
    }

    // 如果在啟用列表中，顯示
    if (adEnabledPaths.some(path => currentPath.startsWith(path))) {
      return true;
    }

    // 預設不顯示
    return false;
  };

  // 如果不應該顯示廣告，返回 null
  if (!shouldShowAd()) {
    return null;
  }

  return (
    <AdBanner
      position="bottom"
      isFixed={true}
      showAd={true}
      className="global-ad-banner"
    />
  );
};

export default GlobalAdBanner;
