// 瀏覽器 AdMob 整合測試腳本
// 在瀏覽器控制台中運行此腳本

console.log('🧪 瀏覽器 AdMob 整合測試開始...\n');

// 1. 檢查環境變數載入
console.log('📋 1. 環境變數檢查');
const envCheck = {
  VITE_ADMOB_APP_ID: import.meta.env.VITE_ADMOB_APP_ID,
  VITE_ADMOB_BANNER_ID: import.meta.env.VITE_ADMOB_BANNER_ID,
  VITE_ADMOB_ENABLED: import.meta.env.VITE_ADMOB_ENABLED,
  VITE_ADMOB_TEST_MODE: import.meta.env.VITE_ADMOB_TEST_MODE,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE,
};

console.log('環境變數狀態:', envCheck);

const envIssues = [];
Object.entries(envCheck).forEach(([key, value]) => {
  if (!value || value === 'undefined') {
    envIssues.push(key);
  }
});

if (envIssues.length === 0) {
  console.log('✅ 所有環境變數正確載入');
} else {
  console.log('❌ 環境變數問題:', envIssues);
}

// 2. 檢查 AdMob 配置
console.log('\n🎯 2. AdMob 配置檢查');
try {
  // 動態導入配置模組
  const configModule = await import('/src/config/adConfig.js');
  const { adConfig, checkAdMobConfig, getAdUnitId } = configModule;

  console.log('AdMob 配置:', {
    appId: adConfig.appId,
    bannerId: adConfig.adUnits.bottomBanner,
    enabled: adConfig.adUnits.bottomBanner ? true : false,
  });

  // 運行配置檢查
  const { config, issues } = checkAdMobConfig();
  console.log('配置檢查結果:', { config, issues });

  if (issues.length === 0) {
    console.log('✅ AdMob 配置正常');
  } else {
    console.log('❌ AdMob 配置問題:', issues);
  }
} catch (error) {
  console.log('❌ 配置模組載入失敗:', error.message);
}

// 3. 檢查廣告組件渲染
console.log('\n📱 3. 廣告組件檢查');
const adBanners = document.querySelectorAll('.ad-banner');
console.log(`找到 ${adBanners.length} 個廣告組件`);

adBanners.forEach((banner, index) => {
  console.log(`廣告組件 ${index + 1}:`, {
    className: banner.className,
    hasPlaceholder: banner.querySelector('.ad-banner__placeholder') !== null,
    hasAdSense: banner.querySelector('.adsbygoogle') !== null,
    position: banner.className.includes('bottom') ? 'bottom' : 'other',
  });
});

// 4. 檢查 AdMob 腳本載入
console.log('\n🔧 4. AdMob 腳本檢查');
const adSenseScript = document.querySelector('script[src*="adsbygoogle"]');
if (adSenseScript) {
  console.log('✅ AdMob 腳本已載入:', adSenseScript.src);
} else {
  console.log('❌ AdMob 腳本未載入');
}

// 檢查 window.adsbygoogle
if (window.adsbygoogle) {
  console.log('✅ window.adsbygoogle 可用');
} else {
  console.log('❌ window.adsbygoogle 不可用');
}

// 5. 檢查控制台錯誤
console.log('\n⚠️ 5. 錯誤檢查');
// 這個需要在頁面載入後手動檢查控制台

// 6. 測試廣告單元 ID 獲取
console.log('\n📊 6. 廣告單元 ID 測試');
try {
  const configModule = await import('/src/config/adConfig.js');
  const { getAdUnitId, shouldShowAd } = configModule;

  const positions = ['bottom', 'top', 'inline'];
  positions.forEach(position => {
    const adUnitId = getAdUnitId(position);
    console.log(`${position}: ${adUnitId || '未設置'}`);
  });

  // 測試頁面廣告顯示邏輯
  const testPages = ['home', 'strength', 'community', 'settings'];
  testPages.forEach(pageName => {
    const shouldShow = shouldShowAd(pageName, 'bottom');
    console.log(`${pageName}: ${shouldShow ? '✅ 顯示' : '❌ 不顯示'}`);
  });
} catch (error) {
  console.log('❌ 廣告單元 ID 測試失敗:', error.message);
}

// 7. 生成測試報告
console.log('\n📊 7. 測試報告');
console.log('='.repeat(50));
console.log('測試時間:', new Date().toLocaleString());
console.log('頁面 URL:', window.location.href);
console.log('用戶代理:', navigator.userAgent);
console.log('環境變數問題:', envIssues.length);
console.log('廣告組件數量:', adBanners.length);
console.log('AdMob 腳本載入:', adSenseScript ? '是' : '否');
console.log('='.repeat(50));

if (envIssues.length === 0 && adBanners.length > 0) {
  console.log('\n🎉 AdMob 整合測試通過！');
  console.log('\n📝 下一步建議：');
  console.log('1. 構建生產版本 (npm run build)');
  console.log('2. 部署到 Netlify');
  console.log('3. 在 AdMob 控制台監控收益');
} else {
  console.log('\n⚠️ 發現問題，請檢查上述錯誤並修正');
}

console.log('\n🔗 相關鏈接：');
console.log('- AdMob 控制台: https://admob.google.com/');
console.log('- 開發服務器: http://localhost:5173');
console.log('- 配置調試: 使用 AdMobConfigDebug 組件');
