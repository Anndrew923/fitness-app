#!/usr/bin/env node

/**
 * 構建驗證腳本
 * 驗證構建產物是否正確生成，確保部署不會失敗
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 獲取專案根目錄
const projectRoot = path.join(__dirname, '..');
const distPath = path.join(projectRoot, 'dist');
const indexHtml = path.join(distPath, 'index.html');
const assetsPath = path.join(distPath, 'assets');

let hasError = false;

log('\n🔍 開始構建驗證...\n', 'blue');

// 1. 檢查 dist 目錄是否存在
if (!fs.existsSync(distPath)) {
  error('dist 目錄不存在');
  error('請先運行: npm run build');
  process.exit(1);
}
success('dist 目錄存在');

// 2. 檢查 index.html 是否存在
if (!fs.existsSync(indexHtml)) {
  error('index.html 不存在');
  hasError = true;
} else {
  success('index.html 存在');
  
  // 檢查 index.html 內容
  const htmlContent = fs.readFileSync(indexHtml, 'utf-8');
  if (!htmlContent.includes('<div id="root"></div>')) {
    error('index.html 缺少 root div');
    hasError = true;
  } else {
    success('index.html 內容正確');
  }
}

// 3. 檢查 assets 目錄是否存在
if (!fs.existsSync(assetsPath)) {
  error('assets 目錄不存在');
  hasError = true;
} else {
  success('assets 目錄存在');
  
  // 4. 檢查必要的 chunk 是否存在
  const assets = fs.readdirSync(assetsPath);
  const jsFiles = assets.filter(file => file.endsWith('.js'));
  
  if (jsFiles.length === 0) {
    error('assets 目錄中沒有 JavaScript 文件');
    hasError = true;
  } else {
    success(`找到 ${jsFiles.length} 個 JavaScript 文件`);
  }
  
  // 5. 檢查 react-core chunk
  const reactCore = jsFiles.find(file => file.includes('react-core'));
  if (!reactCore) {
    error('react-core chunk 不存在');
    error('這可能導致 PureComponent 錯誤');
    hasError = true;
  } else {
    success(`react-core chunk 存在: ${reactCore}`);
  }
  
  // 6. 檢查 index chunk
  const indexChunk = jsFiles.find(file => file.includes('index-') && !file.includes('react-core'));
  if (!indexChunk) {
    warning('index chunk 不存在（可能被合併到其他 chunk）');
  } else {
    success(`index chunk 存在: ${indexChunk}`);
  }
  
  // 7. 檢查 chunk 大小
  let totalSize = 0;
  let largeChunks = [];
  
  jsFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeInMB = stats.size / (1024 * 1024);
    totalSize += sizeInMB;
    
    if (sizeInMB > 1) {
      largeChunks.push({ file, size: sizeInMB.toFixed(2) });
    }
  });
  
  info(`總 JavaScript 大小: ${totalSize.toFixed(2)} MB`);
  
  if (largeChunks.length > 0) {
    warning('發現較大的 chunk:');
    largeChunks.forEach(({ file, size }) => {
      warning(`  - ${file}: ${size} MB`);
    });
  }
}

// 8. 檢查 netlify.toml 配置
const netlifyToml = path.join(projectRoot, 'netlify.toml');
if (fs.existsSync(netlifyToml)) {
  const tomlContent = fs.readFileSync(netlifyToml, 'utf-8');
  
  // 檢查重定向規則
  if (!tomlContent.includes('from = "/assets/*"')) {
    error('netlify.toml 缺少 /assets/* 重定向規則');
    hasError = true;
  } else {
    success('netlify.toml 包含 /assets/* 重定向規則');
  }
  
  // 檢查 MIME 類型配置
  if (!tomlContent.includes('Content-Type = "application/javascript"')) {
    error('netlify.toml 缺少 JavaScript MIME 類型配置');
    hasError = true;
  } else {
    success('netlify.toml 包含 MIME 類型配置');
  }
  
  // 檢查 Node 版本配置
  if (!tomlContent.includes('NODE_VERSION')) {
    warning('netlify.toml 缺少 NODE_VERSION 配置（建議添加）');
  } else {
    success('netlify.toml 包含 NODE_VERSION 配置');
  }
} else {
  warning('netlify.toml 不存在（如果使用 Netlify 部署，建議創建）');
}

// 9. 檢查 vite.config.js
const viteConfig = path.join(projectRoot, 'vite.config.js');
if (fs.existsSync(viteConfig)) {
  const configContent = fs.readFileSync(viteConfig, 'utf-8');
  
  // 檢查 base 配置
  if (!configContent.includes("base: '/'")) {
    warning('vite.config.js 缺少 base 配置（建議添加）');
  } else {
    success('vite.config.js 包含 base 配置');
  }
  
  // 檢查 react-core chunk 配置
  if (!configContent.includes('react-core')) {
    warning('vite.config.js 可能缺少 react-core chunk 配置');
  } else {
    success('vite.config.js 包含 react-core chunk 配置');
  }
}

// 總結
log('\n' + '='.repeat(50), 'blue');
if (hasError) {
  error('構建驗證失敗！請修復上述錯誤後再部署。');
  process.exit(1);
} else {
  success('構建驗證通過！可以安全部署。');
  log('\n📝 建議：部署後請測試生產環境，確認所有功能正常。', 'yellow');
  process.exit(0);
}

