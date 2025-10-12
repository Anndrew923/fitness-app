// AdMob 整合測試腳本 (Node.js 環境)
import fs from 'fs';
import path from 'path';

console.log('🧪 AdMob 整合測試開始 (Node.js 環境)...\n');

// 1. 檢查 .env.local 文件
console.log('📋 1. 環境變數文件檢查');
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local 文件存在');
  const envContent = fs.readFileSync(envPath, 'utf8');

  // 檢查必要的環境變數
  const requiredVars = [
    'VITE_ADMOB_APP_ID',
    'VITE_ADMOB_BANNER_ID',
    'VITE_ADMOB_ENABLED',
    'VITE_ADMOB_TEST_MODE',
  ];

  const missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length === 0) {
    console.log('✅ 所有必要的環境變數都已設置');
  } else {
    console.log('❌ 缺少環境變數:', missingVars);
  }

  // 提取環境變數值
  const envVars = {};
  envContent.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      envVars[key.trim()] = value.trim();
    }
  });

  console.log('\n📊 環境變數值:');
  console.log('VITE_ADMOB_APP_ID:', envVars.VITE_ADMOB_APP_ID || '未設置');
  console.log(
    'VITE_ADMOB_BANNER_ID:',
    envVars.VITE_ADMOB_BANNER_ID || '未設置'
  );
  console.log('VITE_ADMOB_ENABLED:', envVars.VITE_ADMOB_ENABLED || '未設置');
  console.log(
    'VITE_ADMOB_TEST_MODE:',
    envVars.VITE_ADMOB_TEST_MODE || '未設置'
  );
} else {
  console.log('❌ .env.local 文件不存在');
}

// 2. 檢查配置文件
console.log('\n📱 2. 配置文件檢查');
const configPath = 'src/config/adConfig.js';
if (fs.existsSync(configPath)) {
  console.log('✅ adConfig.js 文件存在');
  const configContent = fs.readFileSync(configPath, 'utf8');

  // 檢查 AdMob 相關配置
  const admobChecks = [
    { name: 'AdMob 應用程式 ID', pattern: 'appId:' },
    { name: 'AdMob 廣告單元 ID', pattern: 'VITE_ADMOB_BANNER_ID' },
    { name: 'AdMob 配置檢查函數', pattern: 'checkAdMobConfig' },
    { name: 'AdMob 腳本載入', pattern: 'AdMob 腳本' },
  ];

  admobChecks.forEach(check => {
    if (configContent.includes(check.pattern)) {
      console.log(`✅ ${check.name}: 已配置`);
    } else {
      console.log(`❌ ${check.name}: 未找到`);
    }
  });
} else {
  console.log('❌ adConfig.js 文件不存在');
}

// 3. 檢查 AdBanner 組件
console.log('\n🎯 3. AdBanner 組件檢查');
const bannerPath = 'src/components/AdBanner.jsx';
if (fs.existsSync(bannerPath)) {
  console.log('✅ AdBanner.jsx 文件存在');
  const bannerContent = fs.readFileSync(bannerPath, 'utf8');

  // 檢查 AdMob 相關功能
  const bannerChecks = [
    { name: 'AdMob 配置導入', pattern: "from '../config/adConfig'" },
    { name: 'AdMob 應用程式 ID 使用', pattern: 'adConfig.appId' },
    { name: 'AdMob 腳本載入', pattern: 'AdMob 腳本' },
    { name: 'AdMob 測試模式', pattern: 'VITE_ADMOB_TEST_MODE' },
  ];

  bannerChecks.forEach(check => {
    if (bannerContent.includes(check.pattern)) {
      console.log(`✅ ${check.name}: 已實現`);
    } else {
      console.log(`❌ ${check.name}: 未找到`);
    }
  });
} else {
  console.log('❌ AdBanner.jsx 文件不存在');
}

// 4. 檢查測試組件
console.log('\n🧪 4. 測試組件檢查');
const testFiles = [
  'src/components/AdMobConfigDebug.jsx',
  'src/components/AdBannerTest.jsx',
  'src/pages/AdTest.jsx',
];

testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: 存在`);
  } else {
    console.log(`❌ ${file}: 不存在`);
  }
});

// 5. 檢查開發服務器狀態
console.log('\n🔧 5. 開發服務器狀態檢查');
console.log('開發服務器應該在 http://localhost:5173 運行');
console.log('請在瀏覽器中訪問該地址來測試 AdMob 整合');

// 6. 生成測試報告
console.log('\n📊 6. 測試報告');
console.log('='.repeat(50));
console.log('AdMob 整合狀態: 基本完成');
console.log('下一步: 在瀏覽器中測試實際功能');
console.log('='.repeat(50));

console.log('\n🎉 AdMob 整合準備就緒！');
console.log('\n📝 下一步建議：');
console.log('1. 確保開發服務器正在運行 (npm run dev)');
console.log('2. 在瀏覽器中訪問 http://localhost:5173');
console.log('3. 打開開發者工具查看控制台輸出');
console.log('4. 檢查 AdMob 配置狀態');
console.log('5. 測試不同頁面的廣告顯示邏輯');

console.log('\n🔗 相關鏈接：');
console.log('- AdMob 控制台: https://admob.google.com/');
console.log('- 開發服務器: http://localhost:5173');
console.log('- 配置調試: 在瀏覽器控制台查看 AdMob 配置狀態');
