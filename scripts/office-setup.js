#!/usr/bin/env node

/**
 * 辦公室環境快速設定腳本
 * 用於在辦公室電腦上快速設定與家用電腦相同的環境
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
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
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

// 檢查並安裝必要軟體
function checkAndInstallSoftware() {
  logSection('軟體環境檢查');

  const software = [
    {
      name: 'Node.js',
      version: '20.19.1',
      check: () => {
        try {
          const version = execSync('node --version', {
            encoding: 'utf8',
          }).trim();
          return version.replace('v', '');
        } catch (error) {
          return null;
        }
      },
      install: '請從 https://nodejs.org/ 下載並安裝 Node.js 20.19.1 LTS 版本',
    },
    {
      name: 'Java',
      version: '17.0.16',
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
      install: '請從 https://adoptium.net/ 下載並安裝 OpenJDK 17.0.16',
    },
  ];

  let allInstalled = true;

  software.forEach(sw => {
    const currentVersion = sw.check();
    if (currentVersion) {
      logSuccess(`${sw.name}: ${currentVersion} (已安裝)`);
    } else {
      logError(`${sw.name}: 未安裝`);
      logInfo(`安裝方法: ${sw.install}`);
      allInstalled = false;
    }
  });

  return allInstalled;
}

// 設定環境變數
function setupEnvironmentVariables() {
  logSection('環境變數設定');

  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');

  if (fs.existsSync(envPath)) {
    logSuccess('.env 檔案已存在');
    return true;
  }

  if (fs.existsSync(envExamplePath)) {
    logInfo('從 env.example 創建 .env 檔案...');
    fs.copyFileSync(envExamplePath, envPath);
    logSuccess('.env 檔案已創建');
    logWarning('請編輯 .env 檔案並填入您的 Firebase 配置');
    return true;
  } else {
    logError('env.example 檔案不存在');
    return false;
  }
}

// 安裝專案依賴
function installDependencies() {
  logSection('安裝專案依賴');

  try {
    logInfo('執行 npm install...');
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('npm 依賴安裝完成');
    return true;
  } catch (error) {
    logError(`npm install 失敗: ${error.message}`);
    return false;
  }
}

// 設定 Cursor 配置
function setupCursorConfig() {
  logSection('Cursor 配置設定');

  const cursorConfig = {
    'typescript.preferences.importModuleSpecifier': 'relative',
    'editor.formatOnSave': true,
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': true,
    },
    'eslint.workingDirectories': ['.'],
    'files.associations': {
      '*.jsx': 'javascriptreact',
      '*.js': 'javascript',
    },
  };

  const vscodePath = path.join(process.cwd(), '.vscode');
  const settingsPath = path.join(vscodePath, 'settings.json');

  if (!fs.existsSync(vscodePath)) {
    fs.mkdirSync(vscodePath, { recursive: true });
  }

  fs.writeFileSync(settingsPath, JSON.stringify(cursorConfig, null, 2));
  logSuccess('Cursor/VSCode 配置已設定');

  return true;
}

// 驗證環境
function verifyEnvironment() {
  logSection('環境驗證');

  try {
    // 檢查開發服務器
    logInfo('檢查開發服務器...');
    execSync('npm run build', { stdio: 'pipe' });
    logSuccess('專案建構成功');

    // 檢查 Android 環境
    logInfo('檢查 Android 環境...');
    execSync('gradlew --version', { stdio: 'pipe' });
    logSuccess('Android 環境正常');

    return true;
  } catch (error) {
    logError(`環境驗證失敗: ${error.message}`);
    return false;
  }
}

// 生成設定報告
function generateSetupReport() {
  logSection('設定報告');

  const report = {
    timestamp: new Date().toISOString(),
    node: execSync('node --version', { encoding: 'utf8' }).trim(),
    npm: execSync('npm --version', { encoding: 'utf8' }).trim(),
    java: (() => {
      try {
        const output = execSync('java -version', {
          encoding: 'utf8',
          stdio: 'pipe',
        });
        const match = output.match(/version "([^"]+)"/);
        return match ? match[1] : 'Unknown';
      } catch (error) {
        return 'Not installed';
      }
    })(),
    gradle: (() => {
      try {
        const output = execSync('gradlew --version', {
          encoding: 'utf8',
          stdio: 'pipe',
        });
        const match = output.match(/Gradle (\d+\.\d+\.\d+)/);
        return match ? match[1] : 'Unknown';
      } catch (error) {
        return 'Not available';
      }
    })(),
    environmentFile: fs.existsSync('.env'),
    nodeModules: fs.existsSync('node_modules'),
    androidProject: fs.existsSync('app'),
    cursorConfig: fs.existsSync('.vscode/settings.json'),
  };

  const reportPath = path.join(process.cwd(), 'office-setup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`設定報告已保存到: ${reportPath}`);

  return report;
}

// 主函數
function main() {
  log('🏢 辦公室環境設定開始', 'magenta');

  // 檢查軟體環境
  const softwareOk = checkAndInstallSoftware();
  if (!softwareOk) {
    logError('請先安裝必要的軟體後再執行此腳本');
    return;
  }

  // 設定環境變數
  setupEnvironmentVariables();

  // 安裝依賴
  const depsOk = installDependencies();
  if (!depsOk) {
    logError('依賴安裝失敗，請檢查網路連接和權限');
    return;
  }

  // 設定 Cursor 配置
  setupCursorConfig();

  // 驗證環境
  const verifyOk = verifyEnvironment();
  if (!verifyOk) {
    logWarning('環境驗證未完全通過，但基本設定已完成');
  }

  // 生成報告
  generateSetupReport();

  log('\n🎉 辦公室環境設定完成！', 'magenta');
  log('現在您可以在辦公室使用 Cursor 開發了', 'green');

  log('\n📋 後續步驟:', 'yellow');
  log('1. 編輯 .env 檔案，填入 Firebase 配置', 'white');
  log('2. 執行 npm run dev 啟動開發服務器', 'white');
  log('3. 在 Cursor 中打開專案', 'white');
  log('4. 如有問題，執行 node scripts/sync-environment.js 檢查', 'white');
}

// 執行主函數
main();
