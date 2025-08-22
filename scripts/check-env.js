#!/usr/bin/env node

/**
 * 環境配置檢測腳本
 * 使用方法: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 檢查環境配置...\n');

// 檢查 .env 檔案
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env 檔案存在');
  
  // 讀取 .env 檔案內容
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  });
  
  // 檢查必要的 Firebase 變數
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  console.log('\n📋 Firebase 配置檢查:');
  let allConfigured = true;
  
  requiredVars.forEach(varName => {
    if (envVars[varName] && envVars[varName] !== 'your_api_key_here') {
      console.log(`  ✅ ${varName}: 已配置`);
    } else {
      console.log(`  ❌ ${varName}: 未配置或使用預設值`);
      allConfigured = false;
    }
  });
  
  if (allConfigured) {
    console.log('\n🎉 所有必要的環境變數都已正確配置！');
  } else {
    console.log('\n⚠️  部分環境變數未配置，請檢查 .env 檔案');
  }
  
} else {
  console.log('❌ .env 檔案不存在');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('\n💡 解決方案:');
    console.log('1. 複製 env.example 為 .env');
    console.log('2. 編輯 .env 檔案，填入您的 Firebase 配置');
    console.log('3. 重新啟動開發伺服器');
    
    console.log('\n📝 快速命令:');
    console.log('  cp env.example .env');
    console.log('  # 然後編輯 .env 檔案');
  } else {
    console.log('\n❌ env.example 檔案也不存在');
  }
}

// 檢查 package.json
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`\n📦 專案資訊:`);
  console.log(`  名稱: ${packageJson.name}`);
  console.log(`  版本: ${packageJson.version}`);
  console.log(`  Node.js 腳本: ${packageJson.scripts.dev || '未定義'}`);
}

console.log('\n🔧 開發伺服器啟動命令:');
console.log('  npm run dev');
console.log('\n📚 更多資訊請查看 README.md');
