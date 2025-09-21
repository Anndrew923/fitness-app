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

  // 評測頁面 - 暫時不顯示廣告，等有足夠內容後再啟用
  testPages: {
    strength: { showTop: false, showBottom: false }, // 暫時關閉，等內容豐富後再啟用
    cardio: { showTop: false, showBottom: false },
    explosivePower: { showTop: false, showBottom: false },
    muscleMass: { showTop: false, showBottom: false },
    bodyFat: { showTop: false, showBottom: false },
  },

  // 其他頁面
  otherPages: {
    userInfo: { showTop: false, showBottom: false }, // 用戶資訊頁面不顯示廣告
    history: { showTop: false, showBottom: false }, // 暫時關閉，等內容豐富後再啟用
    ladder: { showTop: false, showBottom: false }, // 天梯頁面不顯示廣告（保持乾淨）
    guest: { showTop: false, showBottom: false }, // 訪客模式不顯示廣告
    home: { showTop: false, showBottom: false }, // 首頁不顯示廣告
    login: { showTop: false, showBottom: false }, // 登入頁面不顯示廣告
    'privacy-policy': { showTop: false, showBottom: false }, // 隱私政策不顯示廣告
    terms: { showTop: false, showBottom: false }, // 條款頁面不顯示廣告
    about: { showTop: false, showBottom: false }, // 關於頁面不顯示廣告
    disclaimer: { showTop: false, showBottom: false }, // 免責聲明不顯示廣告
    contact: { showTop: false, showBottom: false }, // 聯絡頁面不顯示廣告
    settings: { showTop: false, showBottom: false }, // 設定頁面不顯示廣告
    community: { showTop: false, showBottom: true }, // 社群頁面內容豐富，可以顯示廣告
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
  const shouldShow = position === 'top' ? pageConfig.showTop : pageConfig.showBottom;
  
  // 額外檢查：確保頁面有足夠內容
  if (shouldShow) {
    // 檢查頁面是否有足夠的內容來支撐廣告
    const hasEnoughContent = checkPageContent(pageName);
    return hasEnoughContent;
  }
  
  return shouldShow;
};

// 檢查頁面內容是否足夠
const checkPageContent = (pageName) => {
  // 社群頁面通常有豐富內容
  if (pageName === 'community') {
    return true;
  }
  
  // 其他頁面暫時不顯示廣告，等內容豐富後再啟用
  return false;
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
