// AdMob 政策合規監控系統
// 確保完全符合 Google AdMob 政策要求

export const AdMobCompliance = {
  // 檢查頁面是否符合 AdMob 內容政策
  checkContentPolicy: (pageName, pageContent) => {
    const violations = [];

    // 1. 檢查內容是否足夠（評測頁面跳過此檢查）
    const testPages = [
      'strength',
      'cardio',
      'explosive-power',
      'muscle-mass',
      'body-fat',
    ];
    if (
      !testPages.includes(pageName) &&
      (!pageContent || pageContent.length < 200)
    ) {
      violations.push('內容不足：頁面內容少於 200 字元');
    }

    // 2. 檢查是否有重複內容
    if (AdMobCompliance.hasDuplicateContent(pageContent)) {
      violations.push('重複內容：檢測到重複或低價值內容');
    }

    // 3. 檢查是否為導航頁面
    if (AdMobCompliance.isNavigationPage(pageName)) {
      violations.push('導航頁面：不應在導航頁面顯示廣告');
    }

    return {
      isCompliant: violations.length === 0,
      violations,
    };
  },

  // 檢查是否有重複內容
  hasDuplicateContent: content => {
    if (!content) return false;

    // 簡單的重複內容檢測
    const words = content.split(' ').filter(word => word.length > 3);
    const wordCount = {};

    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // 如果任何單詞出現超過 5 次，視為重複內容
    return Object.values(wordCount).some(count => count > 5);
  },

  // 檢查是否為導航頁面
  isNavigationPage: pageName => {
    const navigationPages = [
      'home',
      'login',
      'user-info',
      'settings',
      'privacy-policy',
      'terms',
      'about',
      'disclaimer',
      'contact',
    ];
    return navigationPages.includes(pageName);
  },

  // 檢查廣告放置是否合適
  checkAdPlacement: (pageName, adPosition) => {
    const issues = [];

    // 1. 檢查是否在內容不足的頁面放置廣告
    if (AdMobCompliance.isLowContentPage(pageName)) {
      issues.push('內容不足頁面不應顯示廣告');
    }

    // 2. 檢查廣告位置是否合適
    if (adPosition === 'top' && AdMobCompliance.isMobilePage()) {
      issues.push('手機版不建議在頂部放置廣告');
    }

    return {
      isAppropriate: issues.length === 0,
      issues,
    };
  },

  // 檢查是否為低內容頁面
  isLowContentPage: pageName => {
    const lowContentPages = [
      'home',
      'login',
      'user-info',
      'settings',
      'privacy-policy',
      'terms',
      'about',
      'disclaimer',
      'contact',
    ];
    return lowContentPages.includes(pageName);
  },

  // 檢查是否為手機頁面
  isMobilePage: () => {
    return window.innerWidth <= 768;
  },

  // 生成合規報告
  generateComplianceReport: (pageName, pageContent, adConfig) => {
    const contentCheck = AdMobCompliance.checkContentPolicy(
      pageName,
      pageContent
    );
    const placementCheck = AdMobCompliance.checkAdPlacement(
      pageName,
      adConfig.position
    );

    return {
      pageName,
      timestamp: new Date().toISOString(),
      contentCompliance: contentCheck,
      placementCompliance: placementCheck,
      overallCompliant:
        contentCheck.isCompliant && placementCheck.isAppropriate,
      recommendations: this.generateRecommendations(
        contentCheck,
        placementCheck
      ),
    };
  },

  // 生成改進建議
  generateRecommendations: (contentCheck, placementCheck) => {
    const recommendations = [];

    if (!contentCheck.isCompliant) {
      recommendations.push('增加頁面內容深度和價值');
      recommendations.push('避免重複或低價值內容');
    }

    if (!placementCheck.isAppropriate) {
      recommendations.push('調整廣告放置位置');
      recommendations.push('確保在內容豐富的頁面顯示廣告');
    }

    return recommendations;
  },
};

// 廣告顯示前的合規檢查
export const preAdDisplayCheck = (pageName, pageContent) => {
  // ✅ 改進：優先檢查導航頁面（不應顯示廣告）
  const navigationPages = [
    'home',
    'login',
    'user-info',
    'settings',
    'privacy-policy',
    'terms',
    'about',
    'disclaimer',
    'contact',
  ];
  if (navigationPages.includes(pageName)) {
    console.log(`📄 導航頁面 [${pageName}] 不應顯示廣告`);
    return false;
  }

  // 評測頁面特殊處理 - 有豐富的說明內容，符合 AdMob 政策
  const testPages = [
    'strength',
    'cardio',
    'explosive-power',
    'muscle-mass',
    'body-fat',
  ];
  if (testPages.includes(pageName)) {
    console.log(`📄 評測頁面 [${pageName}] 跳過內容長度檢查，直接顯示廣告`);
    return true;
  }

  // 工具頁面特殊處理 - 有豐富的工具列表，符合 AdMob 政策
  if (pageName === 'training-tools') {
    console.log(`📄 工具頁面 [${pageName}] 內容豐富，顯示廣告`);
    return true;
  }

  // 其他頁面進行正常合規檢查
  const compliance = AdMobCompliance.checkContentPolicy(pageName, pageContent);

  if (!compliance.isCompliant) {
    console.warn('AdMob 合規警告:', compliance.violations);
    return false;
  }

  return true;
};

export default AdMobCompliance;
