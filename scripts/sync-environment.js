#!/usr/bin/env node

/**
 * 環境同步檢查和修復腳本
 * 用於確保辦公室電腦與家用電腦環境一致
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(50)}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 環境檢查配置
const ENV_CONFIG = {
  node: {
    required: '20.19.1',
    check: () => {
      try {
        const version = execSync('node --version', { encoding: 'utf8' }).trim();
        return version.replace('v', '');
      } catch (error) {
        return null;
      }
    },
  },
  npm: {
    required: '10.8.2',
    check: () => {
      try {
        return execSync('npm --version', { encoding: 'utf8' }).trim();
      } catch (error) {
        return null;
      }
    },
  },
  java: {
    required: '17.0.16',
    check: () => {
      try {
        const output = execSync('java -version', {
          encoding: 'utf8',
          stdio: 'pipe',
        });
        const match = output.match(/version "([^"]+)"/);
        return match ? match[1] : null;
      } catch (error) {
        return null;
      }
    },
  },
  gradle: {
    required: '8.11.1',
    check: () => {
      try {
        const output = execSync('gradlew --version', { encoding: 'utf8' });
        const match = output.match(/Gradle (\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
      } catch (error) {
        return null;
      }
    },
  },
};

// 檢查環境變數
function checkEnvironmentVariables() {
  logSection('環境變數檢查');

  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  let allEnvVarsSet = true;

  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      logSuccess(`${envVar}: 已設置`);
    } else {
      logError(`${envVar}: 未設置`);
      allEnvVarsSet = false;
    }
  });

  if (!allEnvVarsSet) {
    logWarning('請檢查 .env 檔案是否存在且包含所有必要的 Firebase 配置');
    logInfo('執行: npm run env:setup 來創建 .env 檔案');
  }

  return allEnvVarsSet;
}

// 檢查依賴項目
function checkDependencies() {
  logSection('依賴項目檢查');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json 不存在');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');

  if (!fs.existsSync(nodeModulesPath)) {
    logError('node_modules 不存在，需要安裝依賴');
    logInfo('執行: npm install');
    return false;
  }

  // 檢查關鍵依賴
  const criticalDeps = ['react', 'vite', 'firebase'];
  let allDepsInstalled = true;

  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      logSuccess(`${dep}: 已安裝`);
    } else {
      logError(`${dep}: 未安裝`);
      allDepsInstalled = false;
    }
  });

  return allDepsInstalled;
}

// 檢查 Android 環境
function checkAndroidEnvironment() {
  logSection('Android 環境檢查');

  const androidPath = path.join(process.cwd(), 'app');
  if (!fs.existsSync(androidPath)) {
    logError('Android 專案目錄不存在');
    return false;
  }

  const gradleWrapperPath = path.join(process.cwd(), 'gradlew.bat');
  if (!fs.existsSync(gradleWrapperPath)) {
    logError('Gradle Wrapper 不存在');
    return false;
  }

  logSuccess('Android 專案結構正常');

  // 檢查 keystore
  const keystorePath = path.join(process.cwd(), 'android.keystore');
  if (fs.existsSync(keystorePath)) {
    logSuccess('Android Keystore 存在');
  } else {
    logWarning('Android Keystore 不存在，可能影響建構');
  }

  return true;
}

// 檢查 Cursor 配置
function checkCursorConfig() {
  logSection('Cursor 配置檢查');

  const cursorConfigPath = path.join(process.cwd(), '.cursor');
  if (fs.existsSync(cursorConfigPath)) {
    logSuccess('Cursor 配置目錄存在');
  } else {
    logWarning('Cursor 配置目錄不存在');
  }

  // 檢查是否有 .vscode 配置
  const vscodePath = path.join(process.cwd(), '.vscode');
  if (fs.existsSync(vscodePath)) {
    logSuccess('VSCode 配置存在');
  } else {
    logInfo('建議創建 .vscode 配置以確保 Cursor 行為一致');
  }

  return true;
}

// 執行修復操作
function performFixes() {
  logSection('執行修復操作');

  try {
    // 安裝依賴
    logInfo('安裝/更新 npm 依賴...');
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('npm 依賴安裝完成');

    // 清理並重新建構
    logInfo('清理專案...');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('專案建構完成');

    // 檢查 Android 建構
    logInfo('檢查 Android 建構...');
    execSync('gradlew clean', { stdio: 'inherit' });
    logSuccess('Android 清理完成');
  } catch (error) {
    logError(`修復過程中發生錯誤: ${error.message}`);
    return false;
  }

  return true;
}

// 生成環境報告
function generateEnvironmentReport() {
  logSection('環境報告');

  const report = {
    timestamp: new Date().toISOString(),
    node: ENV_CONFIG.node.check(),
    npm: ENV_CONFIG.npm.check(),
    java: ENV_CONFIG.java.check(),
    gradle: ENV_CONFIG.gradle.check(),
    environmentVariables: checkEnvironmentVariables(),
    dependencies: checkDependencies(),
    android: checkAndroidEnvironment(),
    cursor: checkCursorConfig(),
  };

  const reportPath = path.join(process.cwd(), 'environment-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`環境報告已保存到: ${reportPath}`);

  return report;
}

// 主函數
function main() {
  log('🚀 環境同步檢查開始', 'magenta');

  const report = generateEnvironmentReport();

  // 檢查是否有問題
  const hasIssues =
    !report.environmentVariables || !report.dependencies || !report.android;

  if (hasIssues) {
    logWarning('發現環境問題，建議執行修復操作');
    logInfo('執行: node scripts/sync-environment.js --fix 來修復問題');
  } else {
    logSuccess('環境檢查通過，所有配置正常！');
  }

  log('\n📋 環境同步完成', 'magenta');
}

// 處理命令行參數
if (process.argv.includes('--fix')) {
  log('🔧 執行修復模式', 'yellow');
  performFixes();
} else {
  main();
}
