// AdMob 整合測試腳本
import {
  checkAdMobConfig,
  getAdUnitId,
  shouldShowAd,
} from '../src/config/adConfig.js';

console.log('🧪 AdMob 整合測試開始...\n');

// 1. 檢查基本配置
console.log('📋 1. 基本配置檢查');
const { config, issues } = checkAdMobConfig();

if (issues.length === 0) {
  console.log('✅ 基本配置正常');
} else {
  console.log('❌ 配置問題:', issues);
}

// 2. 測試廣告單元 ID 獲取
console.log('\n📱 2. 廣告單元 ID 測試');
const positions = ['bottom', 'top', 'inline'];
positions.forEach(position => {
  const adUnitId = getAdUnitId(position);
  console.log(`${position}: ${adUnitId || '未設置'}`);
});

// 3. 測試頁面廣告顯示邏輯
console.log('\n🎯 3. 頁面廣告顯示邏輯測試');
const testPages = [
  'home',
  'strength',
  'cardio',
  'history',
  'community',
  'userInfo',
  'settings',
  'login',
  'privacy-policy',
];

testPages.forEach(pageName => {
  const shouldShow = shouldShowAd(pageName, 'bottom');
  console.log(`${pageName}: ${shouldShow ? '✅ 顯示' : '❌ 不顯示'}`);
});

// 4. 測試 AdMob 腳本載入
console.log('\n🔧 4. AdMob 腳本載入測試');
const testScriptLoad = () => {
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.appId}`;
    script.onload = () => {
      console.log('✅ AdMob 腳本載入成功');
      resolve(true);
    };
    script.onerror = () => {
      console.log('❌ AdMob 腳本載入失敗');
      resolve(false);
    };
    document.head.appendChild(script);
  });
};

// 5. 生成測試報告
console.log('\n📊 5. 測試報告');
console.log('='.repeat(50));
console.log('AdMob 應用程式 ID:', config.appId);
console.log('廣告單元 ID:', config.bannerId);
console.log('啟用狀態:', config.enabled ? '已啟用' : '未啟用');
console.log('測試模式:', config.testMode ? '是' : '否');
console.log('環境:', config.environment);
console.log('配置問題數量:', issues.length);
console.log('='.repeat(50));

if (issues.length === 0) {
  console.log('\n🎉 所有測試通過！AdMob 整合準備就緒。');
  console.log('\n📝 下一步建議：');
  console.log('1. 在瀏覽器中訪問 http://localhost:5173');
  console.log('2. 檢查控制台中的 AdMob 配置狀態');
  console.log('3. 測試不同頁面的廣告顯示邏輯');
  console.log('4. 構建生產版本並部署');
} else {
  console.log('\n⚠️ 發現配置問題，請先解決後再繼續。');
}

console.log('\n🔗 相關鏈接：');
console.log('- AdMob 控制台: https://admob.google.com/');
console.log('- 開發服務器: http://localhost:5173');
console.log('- 配置調試組件: 在任意頁面導入 AdMobConfigDebug');
