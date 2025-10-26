#!/usr/bin/env node

/**
 * 環境變數檢查腳本
 * 用於檢查所有必要的環境變數是否正確配置
 */

const fs = require('fs');
const path = require('path');

// 必要的環境變數清單
const REQUIRED_ENV_VARS = {
  // Firebase 配置
  VITE_FIREBASE_API_KEY: 'Firebase API Key',
  VITE_FIREBASE_AUTH_DOMAIN: 'Firebase Auth Domain',
  VITE_FIREBASE_PROJECT_ID: 'Firebase Project ID',
  VITE_FIREBASE_STORAGE_BUCKET: 'Firebase Storage Bucket',
  VITE_FIREBASE_MESSAGING_SENDER_ID: 'Firebase Messaging Sender ID',
  VITE_FIREBASE_APP_ID: 'Firebase App ID',

  // Google Auth 配置
  VITE_GOOGLE_CLIENT_ID: 'Google OAuth Client ID',
};

// 檢查結果
let checkResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: [],
};

console.log('🔍 開始環境變數檢查...\n');

// 檢查 .env 文件是否存在
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ 錯誤：.env 文件不存在！');
  console.log('📝 建議：請創建 .env 文件並配置必要的環境變數');
  console.log('📋 模板：請參考 .env.template 文件\n');

  checkResults.failed++;
  checkResults.details.push({
    type: 'error',
    message: '.env 文件不存在',
    suggestion: '創建 .env 文件並配置環境變數',
  });

  process.exit(1);
}

console.log('✅ .env 文件存在');

// 讀取 .env 文件
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ 錯誤：無法讀取 .env 文件');
  console.log('🔧 錯誤詳情：', error.message);
  process.exit(1);
}

// 解析環境變數
const envVars = {};
const lines = envContent.split('\n');

lines.forEach((line, index) => {
  line = line.trim();

  // 跳過空行和註釋
  if (!line || line.startsWith('#')) {
    return;
  }

  // 解析 KEY=VALUE 格式
  const equalIndex = line.indexOf('=');
  if (equalIndex > 0) {
    const key = line.substring(0, equalIndex).trim();
    const value = line.substring(equalIndex + 1).trim();
    envVars[key] = value;
  }
});

console.log(`📊 已解析 ${Object.keys(envVars).length} 個環境變數\n`);

// 檢查必要的環境變數
console.log('🔍 檢查必要的環境變數...\n');

Object.entries(REQUIRED_ENV_VARS).forEach(([key, description]) => {
  const value = envVars[key];

  if (!value) {
    console.log(`❌ ${key}: 未配置`);
    console.log(`   📝 說明：${description}`);
    checkResults.failed++;
    checkResults.details.push({
      type: 'error',
      key,
      description,
      message: '未配置',
    });
  } else if (
    value.includes('your_') ||
    value.includes('demo-') ||
    value === 'demo-api-key'
  ) {
    console.log(`⚠️  ${key}: 使用預設值`);
    console.log(`   📝 說明：${description}`);
    console.log(`   🔧 當前值：${value}`);
    checkResults.warnings++;
    checkResults.details.push({
      type: 'warning',
      key,
      description,
      message: '使用預設值',
      value,
    });
  } else {
    console.log(`✅ ${key}: 已配置`);
    checkResults.passed++;
    checkResults.details.push({
      type: 'success',
      key,
      description,
      message: '已配置',
    });
  }
});

// 檢查額外的環境變數
console.log('\n🔍 檢查額外的環境變數...\n');

const extraVars = Object.keys(envVars).filter(key => !REQUIRED_ENV_VARS[key]);
if (extraVars.length > 0) {
  console.log(`📋 發現 ${extraVars.length} 個額外的環境變數：`);
  extraVars.forEach(key => {
    console.log(`   ℹ️  ${key}`);
  });
} else {
  console.log('ℹ️  沒有額外的環境變數');
}

// 輸出檢查結果
console.log('\n📊 檢查結果總結：');
console.log(`✅ 通過：${checkResults.passed}`);
console.log(`⚠️  警告：${checkResults.warnings}`);
console.log(`❌ 失敗：${checkResults.failed}`);

// 檢查 Firebase API Key 格式
const firebaseApiKey = envVars['VITE_FIREBASE_API_KEY'];
if (firebaseApiKey && firebaseApiKey.startsWith('AIza')) {
  console.log('\n✅ Firebase API Key 格式正確');
} else if (firebaseApiKey) {
  console.log('\n⚠️  Firebase API Key 格式可能不正確');
  console.log('   📝 正確格式應以 "AIza" 開頭');
}

// 檢查 Google Client ID 格式
const googleClientId = envVars['VITE_GOOGLE_CLIENT_ID'];
if (googleClientId && googleClientId.includes('.apps.googleusercontent.com')) {
  console.log('✅ Google Client ID 格式正確');
} else if (googleClientId) {
  console.log('⚠️  Google Client ID 格式可能不正確');
  console.log('   📝 正確格式應包含 ".apps.googleusercontent.com"');
}

// 最終結果
if (checkResults.failed > 0) {
  console.log('\n❌ 環境變數檢查失敗！');
  console.log('🔧 請修復上述錯誤後重新運行檢查');
  process.exit(1);
} else if (checkResults.warnings > 0) {
  console.log('\n⚠️  環境變數檢查完成，但有警告');
  console.log('💡 建議修復警告以確保最佳體驗');
  process.exit(0);
} else {
  console.log('\n🎉 環境變數檢查全部通過！');
  console.log('✅ 所有必要的環境變數都已正確配置');
  process.exit(0);
}
