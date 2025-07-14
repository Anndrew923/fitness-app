// 廣告配置
export const adConfig = {
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
};

// 獲取頁面廣告配置
export const getPageAdConfig = pageName => {
  const testPages = adConfig.testPages[pageName];
  if (testPages) {
    return testPages;
  }

  const otherPages = adConfig.otherPages[pageName];
  if (otherPages) {
    return otherPages;
  }

  // 預設配置
  return { showTop: false, showBottom: false };
};

// 檢查是否應該顯示廣告
export const shouldShowAd = (pageName, position) => {
  const config = getPageAdConfig(pageName);

  if (position === 'top') {
    return config.showTop && !adConfig.ux.avoidTopAds;
  }

  if (position === 'bottom') {
    return config.showBottom;
  }

  return false;
};
