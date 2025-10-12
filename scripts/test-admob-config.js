// AdMob 配置測試腳本
import { checkAdMobConfig } from '../src/config/adConfig.js';

console.log('🧪 測試 AdMob 配置...\n');

// 檢查環境變數
console.log('📋 環境變數檢查:');
console.log('VITE_ADMOB_APP_ID:', process.env.VITE_ADMOB_APP_ID || '未設置');
console.log('VITE_ADMOB_BANNER_ID:', process.env.VITE_ADMOB_BANNER_ID || '未設置');
console.log('VITE_ADMOB_ENABLED:', process.env.VITE_ADMOB_ENABLED || '未設置');
console.log('VITE_ADMOB_TEST_MODE:', process.env.VITE_ADMOB_TEST_MODE || '未設置');
console.log('NODE_ENV:', process.env.NODE_ENV || '未設置');
console.log('');

// 檢查 AdMob 配置
const { config, issues } = checkAdMobConfig();

console.log('\n📊 配置摘要:');
console.log('應用程式 ID:', config.appId);
console.log('廣告單元 ID:', config.bannerId);
console.log('啟用狀態:', config.enabled);
console.log('測試模式:', config.testMode);
console.log('環境:', config.environment);

if (issues.length === 0) {
  console.log('\n✅ 所有配置檢查通過！');
} else {
  console.log('\n❌ 發現配置問題:');
  issues.forEach(issue => console.log('  -', issue));
}

console.log('\n🎯 下一步: 啟動開發服務器測試廣告組件');
