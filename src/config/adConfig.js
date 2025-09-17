// 廣告配置
export const adConfig = {
  // AdSense 客戶 ID（從 Google AdSense 獲取）
  clientId: import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX',

  // 廣告單元 ID 配置
  adUnits: {
    // 底部橫幅廣告
    bottomBanner: import.meta.env.VITE_ADSENSE_BOTTOM_BANNER_ID || null,

    // 頂部橫幅廣告
    topBanner: import.meta.env.VITE_ADSENSE_TOP_BANNER_ID || null,

    // 內嵌廣告
    inline: import.meta.env.VITE_ADSENSE_INLINE_ID || null,
  },

  // 評測頁面 - 只在結果頁面顯示底部廣告
  testPages: {
    strength: { showTop: false, showBottom: true },
    cardio: { showTop: false, showBottom: true },
    explosivePower: { showTop: false, showBottom: true },
    muscleMass: { showTop: false, showBottom: true },
    bodyFat: { showTop: false, showBottom: true },
  },

  // 其他頁面
  otherPages: {
    userInfo: { showTop: false, showBottom: false },
    history: { showTop: false, showBottom: true },
    ladder: { showTop: false, showBottom: true },
    guest: { showTop: false, showBottom: false },
  },

  // 廣告顯示頻率控制
  frequency: {
    maxAdsPerSession: 5, // 每個會話最多顯示 5 個廣告
    minTimeBetweenAds: 30000, // 廣告間隔至少 30 秒
  },

  // 用戶體驗優化
  ux: {
    avoidTopAds: true, // 避免頂部廣告，減少誤觸
    bottomAdOnly: true, // 只使用底部廣告
    respectUserFlow: true, // 尊重用戶操作流程
  },

  // 開發模式設置
  development: {
    showTestAds: true, // 開發環境顯示測試廣告
    enableLogging: true, // 啟用廣告日誌
  },
};

// 獲取頁面廣告配置
export const getPageAdConfig = pageName => {
  // 檢查是否為評測頁面
  if (adConfig.testPages[pageName]) {
    return adConfig.testPages[pageName];
  }

  // 檢查是否為其他頁面
  if (adConfig.otherPages[pageName]) {
    return adConfig.otherPages[pageName];
  }

  // 預設不顯示廣告
  return { showTop: false, showBottom: false };
};

// 獲取廣告單元 ID
export const getAdUnitId = (position = 'bottom') => {
  const key =
    position === 'top'
      ? 'topBanner'
      : position === 'inline'
      ? 'inline'
      : 'bottomBanner';
  return adConfig.adUnits[key];
};

// 檢查是否應該顯示廣告
export const shouldShowAd = (pageName, position = 'bottom') => {
  const pageConfig = getPageAdConfig(pageName);
  return position === 'top' ? pageConfig.showTop : pageConfig.showBottom;
};

// 廣告載入狀態管理
export const adState = {
  loaded: false,
  loading: false,
  error: null,
  lastLoadTime: null,
};

// 重置廣告狀態
export const resetAdState = () => {
  adState.loaded = false;
  adState.loading = false;
  adState.error = null;
  adState.lastLoadTime = null;
};

// 設置廣告狀態
export const setAdState = newState => {
  Object.assign(adState, newState);
};
