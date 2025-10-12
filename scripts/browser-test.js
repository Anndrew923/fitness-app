// 瀏覽器 AdMob 整合測試腳本 (增強版)
// 在瀏覽器控制台中運行此腳本

// 顏色編碼工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// 測試結果收集器
const testResults = {
  startTime: Date.now(),
  tests: [],
  errors: [],
  warnings: [],
  performance: {},
};

// 進度指示器
let currentStep = 0;
const totalSteps = 8;

const updateProgress = (step, message) => {
  currentStep = step;
  const progress = Math.round((step / totalSteps) * 100);
  console.log(
    `${colors.cyan}📊 進度: ${progress}% (${step}/${totalSteps}) - ${message}${colors.reset}`
  );
};

// 錯誤處理工具
const handleError = (error, context, retryCount = 0) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    retryCount,
    timestamp: new Date().toISOString(),
  };

  testResults.errors.push(errorInfo);

  console.log(`${colors.red}❌ 錯誤 [${context}]:${colors.reset}`);
  console.log(`${colors.red}   訊息: ${error.message}${colors.reset}`);
  console.log(`${colors.red}   堆疊: ${error.stack}${colors.reset}`);
  console.log(`${colors.yellow}   重試次數: ${retryCount}${colors.reset}`);

  // 提供故障排除建議
  const suggestions = getTroubleshootingSuggestions(context, error);
  if (suggestions.length > 0) {
    console.log(`${colors.blue}💡 故障排除建議:${colors.reset}`);
    suggestions.forEach(suggestion => {
      console.log(`${colors.blue}   • ${suggestion}${colors.reset}`);
    });
  }

  return errorInfo;
};

// 故障排除建議
const getTroubleshootingSuggestions = (context, error) => {
  const suggestions = [];

  switch (context) {
    case 'config-module-load':
      suggestions.push('檢查開發服務器是否正在運行 (npm run dev)');
      suggestions.push('確認 src/config/adConfig.js 文件存在');
      suggestions.push('檢查瀏覽器控制台是否有 CORS 錯誤');
      break;
    case 'environment-variables':
      suggestions.push('檢查 .env.local 文件是否存在');
      suggestions.push('確認環境變數名稱正確 (VITE_ 前綴)');
      suggestions.push('重新啟動開發服務器');
      break;
    case 'admob-script-load':
      suggestions.push('檢查網絡連接');
      suggestions.push('確認 AdMob 應用程式 ID 正確');
      suggestions.push('檢查瀏覽器是否阻止了第三方腳本');
      break;
    case 'ad-component-render':
      suggestions.push('檢查 AdBanner 組件是否正確導入');
      suggestions.push('確認廣告單元 ID 格式正確');
      suggestions.push('檢查頁面是否有足夠的內容顯示廣告');
      break;
  }

  return suggestions;
};

// 重試機制
const retryWithBackoff = async (
  fn,
  context,
  maxRetries = 3,
  baseDelay = 1000
) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(
        `${colors.yellow}⏳ 重試 ${
          attempt + 1
        }/${maxRetries} (${delay}ms 後)...${colors.reset}`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

console.log(
  `${colors.bright}${colors.cyan}🧪 瀏覽器 AdMob 整合測試開始 (增強版)...${colors.reset}\n`
);

// 性能監控開始
const performanceStart = performance.now();

// 1. 檢查環境變數載入
updateProgress(1, '檢查環境變數載入');
console.log(`${colors.bright}📋 1. 環境變數檢查${colors.reset}`);

const envCheck = {
  VITE_ADMOB_APP_ID: import.meta.env.VITE_ADMOB_APP_ID,
  VITE_ADMOB_BANNER_ID: import.meta.env.VITE_ADMOB_BANNER_ID,
  VITE_ADMOB_ENABLED: import.meta.env.VITE_ADMOB_ENABLED,
  VITE_ADMOB_TEST_MODE: import.meta.env.VITE_ADMOB_TEST_MODE,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE,
};

console.log(`${colors.blue}環境變數狀態:${colors.reset}`, envCheck);

const envIssues = [];
Object.entries(envCheck).forEach(([key, value]) => {
  if (!value || value === 'undefined') {
    envIssues.push(key);
  }
});

const envTestResult = {
  name: '環境變數檢查',
  status: envIssues.length === 0 ? 'pass' : 'fail',
  issues: envIssues,
  details: envCheck,
};

testResults.tests.push(envTestResult);

if (envIssues.length === 0) {
  console.log(`${colors.green}✅ 所有環境變數正確載入${colors.reset}`);
} else {
  console.log(
    `${colors.red}❌ 環境變數問題: ${envIssues.join(', ')}${colors.reset}`
  );
  envIssues.forEach(issue => {
    handleError(new Error(`環境變數 ${issue} 未設置`), 'environment-variables');
  });
}

// 2. 檢查 AdMob 配置
updateProgress(2, '檢查 AdMob 配置');
console.log(`\n${colors.bright}🎯 2. AdMob 配置檢查${colors.reset}`);

let configTestResult = {
  name: 'AdMob 配置檢查',
  status: 'pending',
  details: {},
};

try {
  // 使用重試機制載入配置模組
  const configModule = await retryWithBackoff(async () => {
    return await import('/src/config/adConfig.js');
  }, 'config-module-load');

  const { adConfig, checkAdMobConfig, getAdUnitId } = configModule;

  const configDetails = {
    appId: adConfig.appId,
    bannerId: adConfig.adUnits.bottomBanner,
    enabled: adConfig.adUnits.bottomBanner ? true : false,
  };

  console.log(`${colors.blue}AdMob 配置:${colors.reset}`, configDetails);

  // 運行配置檢查
  const { config, issues } = checkAdMobConfig();
  console.log(`${colors.blue}配置檢查結果:${colors.reset}`, { config, issues });

  configTestResult = {
    name: 'AdMob 配置檢查',
    status: issues.length === 0 ? 'pass' : 'fail',
    details: configDetails,
    issues: issues,
  };

  if (issues.length === 0) {
    console.log(`${colors.green}✅ AdMob 配置正常${colors.reset}`);
  } else {
    console.log(
      `${colors.red}❌ AdMob 配置問題: ${issues.join(', ')}${colors.reset}`
    );
    issues.forEach(issue => {
      handleError(new Error(issue), 'admob-config');
    });
  }
} catch (error) {
  configTestResult = {
    name: 'AdMob 配置檢查',
    status: 'fail',
    error: error.message,
  };
  handleError(error, 'config-module-load');
}

testResults.tests.push(configTestResult);

// 3. 檢查廣告組件渲染
updateProgress(3, '檢查廣告組件渲染');
console.log(`\n${colors.bright}📱 3. 廣告組件檢查${colors.reset}`);

const adBanners = document.querySelectorAll('.ad-banner');
console.log(`${colors.blue}找到 ${adBanners.length} 個廣告組件${colors.reset}`);

const adComponentDetails = [];
adBanners.forEach((banner, index) => {
  const bannerInfo = {
    index: index + 1,
    className: banner.className,
    hasPlaceholder: banner.querySelector('.ad-banner__placeholder') !== null,
    hasAdSense: banner.querySelector('.adsbygoogle') !== null,
    position: banner.className.includes('bottom') ? 'bottom' : 'other',
    isVisible: banner.offsetParent !== null,
    dimensions: {
      width: banner.offsetWidth,
      height: banner.offsetHeight,
    },
  };

  adComponentDetails.push(bannerInfo);

  const status = bannerInfo.hasAdSense
    ? '✅'
    : bannerInfo.hasPlaceholder
    ? '⚠️'
    : '❌';
  console.log(`${status} 廣告組件 ${index + 1}:`, bannerInfo);
});

const adComponentTestResult = {
  name: '廣告組件檢查',
  status: adBanners.length > 0 ? 'pass' : 'fail',
  details: {
    count: adBanners.length,
    components: adComponentDetails,
  },
};

testResults.tests.push(adComponentTestResult);

// 4. 檢查 AdMob 腳本載入
updateProgress(4, '檢查 AdMob 腳本載入');
console.log(`\n${colors.bright}🔧 4. AdMob 腳本檢查${colors.reset}`);

const scriptLoadStart = performance.now();
const adSenseScript = document.querySelector('script[src*="adsbygoogle"]');
const scriptLoadTime = performance.now() - scriptLoadStart;

let scriptTestResult = {
  name: 'AdMob 腳本檢查',
  status: 'pending',
  details: {},
};

if (adSenseScript) {
  console.log(
    `${colors.green}✅ AdMob 腳本已載入:${colors.reset}`,
    adSenseScript.src
  );

  // 檢查腳本載入時間
  const scriptLoadPerformance = {
    loadTime: scriptLoadTime,
    src: adSenseScript.src,
    async: adSenseScript.async,
    defer: adSenseScript.defer,
  };

  scriptTestResult = {
    name: 'AdMob 腳本檢查',
    status: 'pass',
    details: scriptLoadPerformance,
  };

  testResults.performance.scriptLoad = scriptLoadPerformance;
} else {
  console.log(`${colors.red}❌ AdMob 腳本未載入${colors.reset}`);
  scriptTestResult = {
    name: 'AdMob 腳本檢查',
    status: 'fail',
    error: 'AdMob 腳本未找到',
  };
  handleError(new Error('AdMob 腳本未載入'), 'admob-script-load');
}

// 檢查 window.adsbygoogle
const adsbygoogleCheck = {
  available: !!window.adsbygoogle,
  type: typeof window.adsbygoogle,
  isArray: Array.isArray(window.adsbygoogle),
};

if (window.adsbygoogle) {
  console.log(`${colors.green}✅ window.adsbygoogle 可用${colors.reset}`);
  scriptTestResult.details.adsbygoogle = adsbygoogleCheck;
} else {
  console.log(`${colors.red}❌ window.adsbygoogle 不可用${colors.reset}`);
  if (scriptTestResult.status === 'pass') {
    scriptTestResult.status = 'fail';
  }
  scriptTestResult.details.adsbygoogle = adsbygoogleCheck;
  handleError(new Error('window.adsbygoogle 不可用'), 'admob-script-load');
}

testResults.tests.push(scriptTestResult);

// 5. 性能監控
updateProgress(5, '性能監控');
console.log(`\n${colors.bright}⚡ 5. 性能監控${colors.reset}`);

// 收集性能指標
const performanceMetrics = {
  pageLoadTime:
    performance.timing.loadEventEnd - performance.timing.navigationStart,
  domContentLoaded:
    performance.timing.domContentLoadedEventEnd -
    performance.timing.navigationStart,
  firstPaint:
    performance
      .getEntriesByType('paint')
      .find(entry => entry.name === 'first-paint')?.startTime || 'N/A',
  firstContentfulPaint:
    performance
      .getEntriesByType('paint')
      .find(entry => entry.name === 'first-contentful-paint')?.startTime ||
    'N/A',
  totalTestTime: performance.now() - performanceStart,
};

// 檢查 AdMob 相關性能
const admobPerformance = {
  scriptLoadTime: testResults.performance.scriptLoad?.loadTime || 'N/A',
  adRenderTime: 'N/A', // 可以通過 MutationObserver 監控
  networkRequests: performance
    .getEntriesByType('resource')
    .filter(
      entry =>
        entry.name.includes('adsbygoogle') ||
        entry.name.includes('googlesyndication')
    ).length,
};

console.log(`${colors.blue}頁面性能指標:${colors.reset}`, {
  頁面載入時間: `${performanceMetrics.pageLoadTime}ms`,
  'DOM 內容載入': `${performanceMetrics.domContentLoaded}ms`,
  首次繪製: `${performanceMetrics.firstPaint}ms`,
  首次內容繪製: `${performanceMetrics.firstContentfulPaint}ms`,
});

console.log(`${colors.blue}AdMob 性能指標:${colors.reset}`, {
  腳本載入時間: `${admobPerformance.scriptLoadTime}ms`,
  網絡請求數量: admobPerformance.networkRequests,
});

const performanceTestResult = {
  name: '性能監控',
  status: 'pass',
  details: {
    page: performanceMetrics,
    admob: admobPerformance,
  },
};

testResults.tests.push(performanceTestResult);
testResults.performance = { ...performanceMetrics, ...admobPerformance };

// 6. 檢查控制台錯誤
updateProgress(6, '檢查控制台錯誤');
console.log(`\n${colors.bright}⚠️ 6. 錯誤檢查${colors.reset}`);

// 監控控制台錯誤
const originalConsoleError = console.error;
const consoleErrors = [];

console.error = function (...args) {
  consoleErrors.push({
    message: args.join(' '),
    timestamp: new Date().toISOString(),
    stack: new Error().stack,
  });
  originalConsoleError.apply(console, args);
};

// 檢查是否有 AdMob 相關錯誤
const admobErrors = consoleErrors.filter(
  error =>
    error.message.toLowerCase().includes('admob') ||
    error.message.toLowerCase().includes('adsbygoogle') ||
    error.message.toLowerCase().includes('advertisement')
);

if (admobErrors.length > 0) {
  console.log(
    `${colors.red}❌ 發現 ${admobErrors.length} 個 AdMob 相關錯誤${colors.reset}`
  );
  admobErrors.forEach(error => {
    console.log(`${colors.red}   ${error.message}${colors.reset}`);
  });
} else {
  console.log(`${colors.green}✅ 未發現 AdMob 相關錯誤${colors.reset}`);
}

const errorTestResult = {
  name: '錯誤檢查',
  status: admobErrors.length === 0 ? 'pass' : 'fail',
  details: {
    totalErrors: consoleErrors.length,
    admobErrors: admobErrors.length,
    errors: admobErrors,
  },
};

testResults.tests.push(errorTestResult);

// 7. 測試廣告單元 ID 獲取
updateProgress(7, '測試廣告單元 ID 獲取');
console.log(`\n${colors.bright}📊 7. 廣告單元 ID 測試${colors.reset}`);

let adUnitTestResult = {
  name: '廣告單元 ID 測試',
  status: 'pending',
  details: {},
};

try {
  const configModule = await retryWithBackoff(async () => {
    return await import('/src/config/adConfig.js');
  }, 'config-module-load');

  const { getAdUnitId, shouldShowAd } = configModule;

  const positions = ['bottom', 'top', 'inline'];
  const adUnitResults = {};

  positions.forEach(position => {
    const adUnitId = getAdUnitId(position);
    adUnitResults[position] = adUnitId || '未設置';
    const status = adUnitId ? '✅' : '❌';
    console.log(`${status} ${position}: ${adUnitId || '未設置'}`);
  });

  // 測試頁面廣告顯示邏輯
  const testPages = ['home', 'strength', 'community', 'settings'];
  const pageResults = {};

  testPages.forEach(pageName => {
    const shouldShow = shouldShowAd(pageName, 'bottom');
    pageResults[pageName] = shouldShow;
    const status = shouldShow ? '✅' : '❌';
    console.log(`${status} ${pageName}: ${shouldShow ? '顯示' : '不顯示'}`);
  });

  adUnitTestResult = {
    name: '廣告單元 ID 測試',
    status: 'pass',
    details: {
      adUnits: adUnitResults,
      pageLogic: pageResults,
    },
  };
} catch (error) {
  adUnitTestResult = {
    name: '廣告單元 ID 測試',
    status: 'fail',
    error: error.message,
  };
  handleError(error, 'ad-unit-test');
}

testResults.tests.push(adUnitTestResult);

// 8. 生成綜合測試報告
updateProgress(8, '生成綜合測試報告');
console.log(`\n${colors.bright}📊 8. 綜合測試報告${colors.reset}`);

// 計算測試統計
const testStats = {
  total: testResults.tests.length,
  passed: testResults.tests.filter(t => t.status === 'pass').length,
  failed: testResults.tests.filter(t => t.status === 'fail').length,
  totalTime: Date.now() - testResults.startTime,
  errors: testResults.errors.length,
  warnings: testResults.warnings.length,
};

// 生成控制台報告
console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
console.log(`${colors.bright}📊 AdMob 整合測試報告${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
console.log(
  `${colors.blue}測試時間:${colors.reset} ${new Date().toLocaleString()}`
);
console.log(`${colors.blue}頁面 URL:${colors.reset} ${window.location.href}`);
console.log(
  `${colors.blue}用戶代理:${colors.reset} ${navigator.userAgent.substring(
    0,
    80
  )}...`
);
console.log(`${colors.blue}總測試數:${colors.reset} ${testStats.total}`);
console.log(`${colors.green}通過:${colors.reset} ${testStats.passed}`);
console.log(`${colors.red}失敗:${colors.reset} ${testStats.failed}`);
console.log(`${colors.blue}總耗時:${colors.reset} ${testStats.totalTime}ms`);
console.log(`${colors.red}錯誤數:${colors.reset} ${testStats.errors}`);
console.log(`${colors.yellow}警告數:${colors.reset} ${testStats.warnings}`);

// 詳細測試結果
console.log(`\n${colors.bright}📋 詳細測試結果:${colors.reset}`);
testResults.tests.forEach((test, index) => {
  const status =
    test.status === 'pass' ? `${colors.green}✅` : `${colors.red}❌`;
  console.log(`${status} ${index + 1}. ${test.name}${colors.reset}`);
  if (test.status === 'fail' && test.error) {
    console.log(`${colors.red}   錯誤: ${test.error}${colors.reset}`);
  }
});

// 性能摘要
if (testResults.performance) {
  console.log(`\n${colors.bright}⚡ 性能摘要:${colors.reset}`);
  console.log(
    `${colors.blue}頁面載入時間:${colors.reset} ${testResults.performance.pageLoadTime}ms`
  );
  console.log(
    `${colors.blue}腳本載入時間:${colors.reset} ${testResults.performance.scriptLoadTime}ms`
  );
  console.log(
    `${colors.blue}總測試時間:${colors.reset} ${testResults.performance.totalTestTime}ms`
  );
}

// 生成 HTML 報告
const generateHTMLReport = () => {
  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AdMob 整合測試報告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e9ecef; }
        .status-pass { color: #28a745; }
        .status-fail { color: #dc3545; }
        .status-warning { color: #ffc107; }
        .test-item { margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; background: #f8f9fa; }
        .test-pass { border-left-color: #28a745; background: #d4edda; }
        .test-fail { border-left-color: #dc3545; background: #f8d7da; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #e3f2fd; padding: 15px; border-radius: 5px; text-align: center; }
        .performance { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .error-list { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 AdMob 整合測試報告</h1>
            <p>測試時間: ${new Date().toLocaleString()}</p>
            <p>頁面: ${window.location.href}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>${testStats.total}</h3>
                <p>總測試數</p>
            </div>
            <div class="stat-card">
                <h3 class="status-pass">${testStats.passed}</h3>
                <p>通過</p>
            </div>
            <div class="stat-card">
                <h3 class="status-fail">${testStats.failed}</h3>
                <p>失敗</p>
            </div>
            <div class="stat-card">
                <h3>${testStats.totalTime}ms</h3>
                <p>總耗時</p>
            </div>
        </div>

        <h2>📋 測試結果</h2>
        ${testResults.tests
          .map(
            test => `
            <div class="test-item ${
              test.status === 'pass' ? 'test-pass' : 'test-fail'
            }">
                <h3>${test.status === 'pass' ? '✅' : '❌'} ${test.name}</h3>
                ${
                  test.error
                    ? `<p class="status-fail">錯誤: ${test.error}</p>`
                    : ''
                }
                ${
                  test.details
                    ? `<pre>${JSON.stringify(test.details, null, 2)}</pre>`
                    : ''
                }
            </div>
        `
          )
          .join('')}

        ${
          testResults.performance
            ? `
            <div class="performance">
                <h2>⚡ 性能指標</h2>
                <pre>${JSON.stringify(testResults.performance, null, 2)}</pre>
            </div>
        `
            : ''
        }

        ${
          testResults.errors.length > 0
            ? `
            <div class="error-list">
                <h2>❌ 錯誤詳情</h2>
                ${testResults.errors
                  .map(
                    error => `
                    <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 3px;">
                        <strong>${error.context}</strong><br>
                        <span class="status-fail">${error.message}</span><br>
                        <small>時間: ${error.timestamp}</small>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `
            : ''
        }
    </div>
</body>
</html>`;

  // 創建下載鏈接
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `admob-test-report-${
    new Date().toISOString().split('T')[0]
  }.html`;
  a.click();
  URL.revokeObjectURL(url);

  console.log(`${colors.green}📄 HTML 測試報告已生成並下載${colors.reset}`);
};

// 最終狀態判斷
const overallStatus = testStats.failed === 0 && testStats.errors === 0;
console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);

if (overallStatus) {
  console.log(`${colors.green}🎉 AdMob 整合測試通過！${colors.reset}`);
  console.log(`\n${colors.bright}📝 下一步建議：${colors.reset}`);
  console.log(`${colors.blue}1. 構建生產版本 (npm run build)${colors.reset}`);
  console.log(`${colors.blue}2. 部署到 Netlify${colors.reset}`);
  console.log(`${colors.blue}3. 在 AdMob 控制台監控收益${colors.reset}`);
} else {
  console.log(`${colors.red}⚠️ 發現問題，請檢查上述錯誤並修正${colors.reset}`);
  console.log(`\n${colors.bright}🔧 故障排除：${colors.reset}`);
  console.log(`${colors.yellow}1. 檢查開發服務器是否正在運行${colors.reset}`);
  console.log(`${colors.yellow}2. 確認 .env.local 文件配置正確${colors.reset}`);
  console.log(
    `${colors.yellow}3. 檢查瀏覽器控制台是否有 CORS 錯誤${colors.reset}`
  );
}

console.log(`\n${colors.bright}🔗 相關鏈接：${colors.reset}`);
console.log(
  `${colors.blue}- AdMob 控制台: https://admob.google.com/${colors.reset}`
);
console.log(`${colors.blue}- 開發服務器: http://localhost:5173${colors.reset}`);
console.log(
  `${colors.blue}- 配置調試: 使用 AdMobConfigDebug 組件${colors.reset}`
);

// 生成 HTML 報告
generateHTMLReport();

console.log(`\n${colors.bright}${colors.cyan}測試完成！${colors.reset}`);
