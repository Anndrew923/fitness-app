import React from 'react';
import { useLocation } from 'react-router-dom';
import AdBanner from './AdBanner';

const GlobalAdBanner = () => {
  // 🚫 暫時隱藏廣告用於截圖 - 截圖完成後請恢復
  return null;

  /* 
  📝 截圖完成後，請將上面的 return null; 註解掉，並取消註解下面的代碼：
  
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
  */
};

export default React.memo(GlobalAdBanner);
