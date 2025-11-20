import React, { useMemo } from 'react';
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

  // ✅ 優化：使用 useMemo 緩存 currentPage，避免重複計算
  const currentPage = useMemo(
    () => getPageName(location.pathname),
    [location.pathname]
  );

  // ✅ 優化：使用 useMemo 緩存 shouldShowAd 結果，避免重複調用 checkPageContent
  const shouldShowBottomAd = useMemo(
    () => shouldShowAd(currentPage, 'bottom'),
    [currentPage]
  );

  // ✅ 修正：將 adUnitId 的 useMemo 移到條件返回之前，遵守 React Hooks 規則
  // 所有 Hooks 必須在組件頂層以相同順序調用，不能在條件語句之後
  const adUnitId = useMemo(() => getAdUnitId('bottom'), []);

  // 如果不應該顯示廣告，返回 null
  if (!shouldShowBottomAd) {
    return null;
  }

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
