#!/usr/bin/env node

/**
 * Cursor 配置同步腳本
 * 用於同步 Cursor 的設定和擴展配置
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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

// 獲取 Cursor 配置目錄
function getCursorConfigDir() {
  const platform = os.platform();
  const homeDir = os.homedir();

  switch (platform) {
    case 'win32':
      return path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User');
    case 'darwin':
      return path.join(
        homeDir,
        'Library',
        'Application Support',
        'Cursor',
        'User'
      );
    case 'linux':
      return path.join(homeDir, '.config', 'Cursor', 'User');
    default:
      return null;
  }
}

// 創建專案級別的 Cursor 配置
function createProjectCursorConfig() {
  logSection('創建專案級別 Cursor 配置');

  const projectConfig = {
    'typescript.preferences.importModuleSpecifier': 'relative',
    'editor.formatOnSave': true,
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': 'explicit',
    },
    'eslint.workingDirectories': ['.'],
    'files.associations': {
      '*.jsx': 'javascriptreact',
      '*.js': 'javascript',
    },
    'emmet.includeLanguages': {
      javascript: 'javascriptreact',
    },
    'editor.tabSize': 2,
    'editor.insertSpaces': true,
    'editor.detectIndentation': false,
    'files.trimTrailingWhitespace': true,
    'files.insertFinalNewline': true,
    'files.trimFinalNewlines': true,
    'javascript.preferences.quoteStyle': 'single',
    'typescript.preferences.quoteStyle': 'single',
    'editor.rulers': [80, 120],
    'editor.wordWrap': 'wordWrapColumn',
    'editor.wordWrapColumn': 120,
    'editor.minimap.enabled': true,
    'editor.minimap.showSlider': 'always',
    'workbench.colorTheme': 'Default Dark+',
    'workbench.iconTheme': 'vs-seti',
    'explorer.confirmDelete': false,
    'explorer.confirmDragAndDrop': false,
    'files.autoSave': 'onFocusChange',
    'editor.suggestSelection': 'first',
    'vsintellicode.modify.editor.suggestSelection':
      'automaticallyOverrodeDefaultValue',
    'git.enableSmartCommit': true,
    'git.confirmSync': false,
    'terminal.integrated.defaultProfile.windows': 'PowerShell',
    'terminal.integrated.defaultProfile.linux': 'bash',
    'terminal.integrated.defaultProfile.osx': 'zsh',
  };

  const vscodePath = path.join(process.cwd(), '.vscode');
  const settingsPath = path.join(vscodePath, 'settings.json');

  if (!fs.existsSync(vscodePath)) {
    fs.mkdirSync(vscodePath, { recursive: true });
  }

  fs.writeFileSync(settingsPath, JSON.stringify(projectConfig, null, 2));
  logSuccess('專案級別 Cursor 配置已創建');

  return true;
}

// 創建推薦的擴展配置
function createRecommendedExtensions() {
  logSection('創建推薦擴展配置');

  const extensions = [
    'ms-vscode.vscode-eslint',
    'bradlc.vscode-tailwindcss',
    'esbenp.prettier-vscode',
    'ms-vscode.vscode-json',
    'formulahendry.auto-rename-tag',
    'christian-kohler.path-intellisense',
    'ms-vscode.vscode-typescript-next',
    'ms-vscode.vscode-js-debug',
    'ms-vscode.vscode-js-debug-companion',
    'ms-vscode.vscode-js-debug-companion-browser',
    'ms-vscode.vscode-js-debug-companion-chrome',
    'ms-vscode.vscode-js-debug-companion-edge',
    'ms-vscode.vscode-js-debug-companion-firefox',
    'ms-vscode.vscode-js-debug-companion-ie',
    'ms-vscode.vscode-js-debug-companion-node',
    'ms-vscode.vscode-js-debug-companion-safari',
    'ms-vscode.vscode-js-debug-companion-web',
    'ms-vscode.vscode-js-debug-companion-webview',
    'ms-vscode.vscode-js-debug-companion-webview2',
    'ms-vscode.vscode-js-debug-companion-webview2-edge',
    'ms-vscode.vscode-js-debug-companion-webview2-chrome',
    'ms-vscode.vscode-js-debug-companion-webview2-firefox',
    'ms-vscode.vscode-js-debug-companion-webview2-safari',
    'ms-vscode.vscode-js-debug-companion-webview2-ie',
    'ms-vscode.vscode-js-debug-companion-webview2-node',
    'ms-vscode.vscode-js-debug-companion-webview2-web',
    'ms-vscode.vscode-js-debug-companion-webview2-webview',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2-edge',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2-chrome',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2-firefox',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2-safari',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2-ie',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2-node',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2-web',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2-webview',
    'ms-vscode.vscode-js-debug-companion-webview2-webview2-webview2',
  ];

  // 簡化擴展列表
  const essentialExtensions = [
    'ms-vscode.vscode-eslint',
    'esbenp.prettier-vscode',
    'ms-vscode.vscode-json',
    'formulahendry.auto-rename-tag',
    'christian-kohler.path-intellisense',
    'ms-vscode.vscode-typescript-next',
  ];

  const vscodePath = path.join(process.cwd(), '.vscode');
  const extensionsPath = path.join(vscodePath, 'extensions.json');

  const extensionsConfig = {
    recommendations: essentialExtensions,
  };

  fs.writeFileSync(extensionsPath, JSON.stringify(extensionsConfig, null, 2));
  logSuccess('推薦擴展配置已創建');

  return true;
}

// 創建工作區配置
function createWorkspaceConfig() {
  logSection('創建工作區配置');

  const workspaceConfig = {
    folders: [
      {
        path: '.',
      },
    ],
    settings: {
      'typescript.preferences.importModuleSpecifier': 'relative',
      'editor.formatOnSave': true,
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': 'explicit',
      },
      'eslint.workingDirectories': ['.'],
      'files.associations': {
        '*.jsx': 'javascriptreact',
        '*.js': 'javascript',
      },
    },
    extensions: {
      recommendations: [
        'ms-vscode.vscode-eslint',
        'esbenp.prettier-vscode',
        'ms-vscode.vscode-json',
        'formulahendry.auto-rename-tag',
        'christian-kohler.path-intellisense',
        'ms-vscode.vscode-typescript-next',
      ],
    },
  };

  const workspacePath = path.join(process.cwd(), 'fitness-app.code-workspace');
  fs.writeFileSync(workspacePath, JSON.stringify(workspaceConfig, null, 2));
  logSuccess('工作區配置已創建');

  return true;
}

// 創建調試配置
function createDebugConfig() {
  logSection('創建調試配置');

  const debugConfig = {
    version: '0.2.0',
    configurations: [
      {
        name: 'Launch Chrome',
        type: 'chrome',
        request: 'launch',
        url: 'http://localhost:5173',
        webRoot: '${workspaceFolder}/src',
        sourceMaps: true,
      },
      {
        name: 'Attach to Chrome',
        type: 'chrome',
        request: 'attach',
        port: 9222,
        webRoot: '${workspaceFolder}/src',
        sourceMaps: true,
      },
    ],
  };

  const vscodePath = path.join(process.cwd(), '.vscode');
  const launchPath = path.join(vscodePath, 'launch.json');

  fs.writeFileSync(launchPath, JSON.stringify(debugConfig, null, 2));
  logSuccess('調試配置已創建');

  return true;
}

// 創建任務配置
function createTasksConfig() {
  logSection('創建任務配置');

  const tasksConfig = {
    version: '2.0.0',
    tasks: [
      {
        label: 'Start Dev Server',
        type: 'shell',
        command: 'npm run dev',
        group: 'build',
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'new',
        },
        problemMatcher: [],
      },
      {
        label: 'Build Project',
        type: 'shell',
        command: 'npm run build',
        group: 'build',
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'new',
        },
        problemMatcher: [],
      },
      {
        label: 'Clean and Build Android',
        type: 'shell',
        command: 'gradlew clean && gradlew bundleRelease',
        group: 'build',
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'new',
        },
        problemMatcher: [],
      },
      {
        label: 'Check Environment',
        type: 'shell',
        command: 'node scripts/sync-environment.js',
        group: 'test',
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'new',
        },
        problemMatcher: [],
      },
    ],
  };

  const vscodePath = path.join(process.cwd(), '.vscode');
  const tasksPath = path.join(vscodePath, 'tasks.json');

  fs.writeFileSync(tasksPath, JSON.stringify(tasksConfig, null, 2));
  logSuccess('任務配置已創建');

  return true;
}

// 主函數
function main() {
  log('⚙️  Cursor 配置同步開始', 'magenta');

  // 創建專案級別配置
  createProjectCursorConfig();

  // 創建推薦擴展配置
  createRecommendedExtensions();

  // 創建工作區配置
  createWorkspaceConfig();

  // 創建調試配置
  createDebugConfig();

  // 創建任務配置
  createTasksConfig();

  log('\n🎉 Cursor 配置同步完成！', 'magenta');
  log('現在您可以在辦公室使用相同的 Cursor 配置了', 'green');

  log('\n📋 使用說明:', 'yellow');
  log('1. 在 Cursor 中打開專案', 'white');
  log('2. 系統會自動載入專案級別的配置', 'white');
  log('3. 建議安裝推薦的擴展', 'white');
  log('4. 使用 Ctrl+Shift+P 打開命令面板，可以執行預設任務', 'white');
}

// 執行主函數
main();
