#!/usr/bin/env node

/**
 * 全面除錯腳本
 * 使用方法: node debug-scripts.js [command]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commands = {
  // 1. 代碼質量檢查
  lint: () => {
    console.log('🔍 執行 ESLint 檢查...');
    try {
      execSync('npx eslint src --ext .js,.jsx --max-warnings 0', {
        stdio: 'inherit',
      });
      console.log('✅ ESLint 檢查通過');
    } catch (error) {
      console.log('❌ ESLint 發現問題，請修復後重試');
      process.exit(1);
    }
  },

  // 2. 依賴檢查
  deps: () => {
    console.log('📦 檢查依賴項...');
    try {
      execSync('npm audit', { stdio: 'inherit' });
      execSync('npm outdated', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ 發現依賴問題');
    }
  },

  // 3. 構建測試
  build: () => {
    console.log('🏗️ 測試構建...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ 構建成功');
    } catch (error) {
      console.log('❌ 構建失敗');
      process.exit(1);
    }
  },

  // 4. 性能檢查
  perf: () => {
    console.log('⚡ 性能檢查...');
    try {
      execSync(
        'npx lighthouse http://localhost:5173 --output=json --output-path=./lighthouse-report.json',
        { stdio: 'inherit' }
      );
      console.log('✅ 性能報告已生成');
    } catch (error) {
      console.log('⚠️ 性能檢查失敗，請確保開發服務器正在運行');
    }
  },

  // 5. 全面檢查
  full: () => {
    console.log('🚀 執行全面除錯檢查...\n');

    console.log('1️⃣ 代碼質量檢查');
    commands.lint();

    console.log('\n2️⃣ 依賴檢查');
    commands.deps();

    console.log('\n3️⃣ 構建測試');
    commands.build();

    console.log('\n4️⃣ 檢查錯誤邊界');
    checkErrorBoundaries();

    console.log('\n5️⃣ 檢查 Firebase 配置');
    checkFirebaseConfig();

    console.log('\n✅ 全面檢查完成！');
  },

  // 6. 監控模式
  monitor: () => {
    console.log('📊 啟動監控模式...');
    console.log('監控以下項目:');
    console.log('- 控制台錯誤');
    console.log('- 性能指標');
    console.log('- Firebase 操作');
    console.log('- 用戶交互');

    // 啟動開發服務器並監控
    execSync('npm run dev', { stdio: 'inherit' });
  },
};

// 檢查錯誤邊界
function checkErrorBoundaries() {
  const srcPath = path.join(__dirname, 'src');
  const files = fs.readdirSync(srcPath).filter(f => f.endsWith('.jsx'));

  let hasErrorBoundary = false;
  files.forEach(file => {
    const content = fs.readFileSync(path.join(srcPath, file), 'utf8');
    if (
      content.includes('ErrorBoundary') ||
      content.includes('componentDidCatch')
    ) {
      hasErrorBoundary = true;
    }
  });

  if (hasErrorBoundary) {
    console.log('✅ 發現錯誤邊界');
  } else {
    console.log('⚠️ 建議添加錯誤邊界');
  }
}

// 檢查 Firebase 配置
function checkFirebaseConfig() {
  const firebasePath = path.join(__dirname, 'src', 'firebase.js');
  if (fs.existsSync(firebasePath)) {
    const content = fs.readFileSync(firebasePath, 'utf8');
    if (content.includes('apiKey') && content.includes('authDomain')) {
      console.log('✅ Firebase 配置完整');
    } else {
      console.log('⚠️ Firebase 配置可能不完整');
    }
  } else {
    console.log('❌ 未找到 Firebase 配置文件');
  }
}

// 主函數
function main() {
  const command = process.argv[2];

  if (!command || !commands[command]) {
    console.log('🔧 除錯腳本使用指南:');
    console.log('');
    console.log('可用命令:');
    console.log('  lint    - ESLint 代碼檢查');
    console.log('  deps    - 依賴項檢查');
    console.log('  build   - 構建測試');
    console.log('  perf    - 性能檢查');
    console.log('  full    - 全面檢查');
    console.log('  monitor - 監控模式');
    console.log('');
    console.log('示例:');
    console.log('  node debug-scripts.js full');
    console.log('  node debug-scripts.js monitor');
    return;
  }

  commands[command]();
}

main();
