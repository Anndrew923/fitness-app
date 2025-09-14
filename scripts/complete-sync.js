#!/usr/bin/env node

/**
 * 完整環境同步腳本
 * 整合所有環境同步功能，一鍵完成辦公室環境設定
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

// 檢查必要軟體
function checkSoftware() {
  logSection('軟體環境檢查');

  const software = [
    {
      name: 'Node.js',
      required: '20.19.1',
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
    },
    {
      name: 'npm',
      required: '10.8.2',
      check: () => {
        try {
          return execSync('npm --version', { encoding: 'utf8' }).trim();
        } catch (error) {
          return null;
        }
      },
    },
    {
      name: 'Java',
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
  ];

  let allInstalled = true;

  software.forEach(sw => {
    const currentVersion = sw.check();
    if (currentVersion) {
      logSuccess(`${sw.name}: ${currentVersion} (已安裝)`);
    } else {
      logError(`${sw.name}: 未安裝`);
      allInstalled = false;
    }
  });

  return allInstalled;
}

// 設定環境變數
function setupEnvironment() {
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

// 安裝依賴
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

// 同步 Cursor 配置
function syncCursorConfig() {
  logSection('同步 Cursor 配置');

  try {
    execSync('node scripts/cursor-config-sync.js', { stdio: 'inherit' });
    logSuccess('Cursor 配置同步完成');
    return true;
  } catch (error) {
    logError(`Cursor 配置同步失敗: ${error.message}`);
    return false;
  }
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

// 生成同步報告
function generateSyncReport() {
  logSection('生成同步報告');

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
    workspaceConfig: fs.existsSync('fitness-app.code-workspace'),
  };

  const reportPath = path.join(process.cwd(), 'complete-sync-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`同步報告已保存到: ${reportPath}`);

  return report;
}

// 主函數
function main() {
  log('🚀 完整環境同步開始', 'magenta');

  // 檢查軟體環境
  const softwareOk = checkSoftware();
  if (!softwareOk) {
    logError('請先安裝必要的軟體後再執行此腳本');
    logInfo('必要軟體: Node.js 20.19.1, Java 17.0.16');
    return;
  }

  // 設定環境變數
  setupEnvironment();

  // 安裝依賴
  const depsOk = installDependencies();
  if (!depsOk) {
    logError('依賴安裝失敗，請檢查網路連接和權限');
    return;
  }

  // 同步 Cursor 配置
  const cursorOk = syncCursorConfig();
  if (!cursorOk) {
    logWarning('Cursor 配置同步失敗，但可以繼續使用');
  }

  // 驗證環境
  const verifyOk = verifyEnvironment();
  if (!verifyOk) {
    logWarning('環境驗證未完全通過，但基本設定已完成');
  }

  // 生成報告
  const report = generateSyncReport();

  log('\n🎉 完整環境同步完成！', 'magenta');
  log('現在您可以在辦公室使用與家用電腦相同的環境了', 'green');

  log('\n📋 後續步驟:', 'yellow');
  log('1. 編輯 .env 檔案，填入 Firebase 配置', 'white');
  log('2. 執行 npm run dev 啟動開發服務器', 'white');
  log('3. 在 Cursor 中打開專案', 'white');
  log('4. 如有問題，執行 npm run office:sync 檢查環境', 'white');

  log('\n📊 同步狀態:', 'yellow');
  log(`- 環境變數: ${report.environmentFile ? '✅' : '❌'}`, 'white');
  log(`- 依賴項目: ${report.nodeModules ? '✅' : '❌'}`, 'white');
  log(`- Android 專案: ${report.androidProject ? '✅' : '❌'}`, 'white');
  log(`- Cursor 配置: ${report.cursorConfig ? '✅' : '❌'}`, 'white');
  log(`- 工作區配置: ${report.workspaceConfig ? '✅' : '❌'}`, 'white');
}

// 執行主函數
main();
