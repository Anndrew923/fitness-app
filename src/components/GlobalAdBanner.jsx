import React from 'react';
import { useLocation } from 'react-router-dom';
import AdBanner from './AdBanner';
import { getAdUnitId, shouldShowAd } from '../config/adConfig';

const GlobalAdBanner = () => {
  const location = useLocation();

  // 從路徑中提取頁面名稱
  const getPageName = pathname => {
    const path = pathname.replace('/', '');
    return path || 'home';
  };

  // 獲取當前頁面名稱
  const currentPage = getPageName(location.pathname);

  // 檢查是否應該顯示底部廣告
  const shouldShowBottomAd = shouldShowAd(currentPage, 'bottom');

  // 如果不應該顯示廣告，返回 null
  if (!shouldShowBottomAd) {
    return null;
  }

  // 獲取底部廣告的廣告單元 ID
  const adUnitId = getAdUnitId('bottom');

  return (
    <AdBanner
      position="bottom"
      isFixed={true}
      showAd={true}
      adUnitId={adUnitId}
      className="global-ad-banner"
    />
  );
};

export default React.memo(GlobalAdBanner);
