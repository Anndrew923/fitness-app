#!/usr/bin/env node

/**
 * 兩台電腦簡化設置腳本
 * 使用方法: node scripts/simple-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 兩台電腦快速設置檢查\n');

// 檢查 .env 檔案
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env 檔案已存在');

  // 讀取 .env 檔案內容
  const envContent = fs.readFileSync(envPath, 'utf8');

  // 檢查是否包含真實的 Firebase 配置
  if (
    envContent.includes('your_api_key_here') ||
    envContent.includes('your_project')
  ) {
    console.log('⚠️  檢測到範例配置，需要填入真實的 Firebase 配置');
    console.log('\n💡 解決方案:');
    console.log('1. 從另一台已配置的電腦複製 .env 檔案');
    console.log('2. 或者手動編輯 .env 檔案填入配置');
  } else {
    console.log('🎉 Firebase 配置已就緒！');
    console.log('\n📱 現在可以啟動開發伺服器:');
    console.log('  npm run dev');
  }
} else {
  console.log('❌ .env 檔案不存在');
  console.log('\n💡 快速解決方案:');
  console.log('1. 從另一台已配置的電腦複製 .env 檔案');
  console.log('2. 或者運行: npm run env:setup');
}

console.log('\n📋 兩台電腦設置流程:');
console.log('1. 在這台電腦上配置好 Firebase');
console.log('2. 將 .env 檔案同步到雲端（Dropbox/Google Drive）');
console.log('3. 在另一台電腦上從雲端複製 .env 檔案');
console.log('4. 運行: npm install && npm run dev');

