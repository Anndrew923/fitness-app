// Netlify 部署腳本
import fs from 'fs';
import path from 'path';

console.log('🚀 Netlify 部署準備開始...\n');

// 1. 檢查構建產物
console.log('📦 1. 檢查構建產物');
const distPath = 'dist';
if (fs.existsSync(distPath)) {
  console.log('✅ dist 目錄存在');

  const files = fs.readdirSync(distPath);
  console.log(`📁 包含 ${files.length} 個文件/目錄`);

  // 檢查重要文件
  const importantFiles = ['index.html', 'assets'];
  importantFiles.forEach(file => {
    if (files.includes(file)) {
      console.log(`✅ ${file}: 存在`);
    } else {
      console.log(`❌ ${file}: 缺失`);
    }
  });
} else {
  console.log('❌ dist 目錄不存在，請先運行 npm run build');
  process.exit(1);
}

// 2. 檢查 AdMob 配置
console.log('\n🎯 2. 檢查 AdMob 配置');
const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
const jsFiles = fs
  .readdirSync(path.join(distPath, 'assets'))
  .filter(f => f.endsWith('.js'));

let admobFound = false;
jsFiles.forEach(jsFile => {
  const jsPath = path.join(distPath, 'assets', jsFile);
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  if (jsContent.includes('ca-app-pub-') || jsContent.includes('admob')) {
    console.log(`✅ AdMob 配置在 ${jsFile} 中`);
    admobFound = true;
  }
});

if (!admobFound) {
  console.log('⚠️ 未在構建產物中找到 AdMob 配置');
}

// 3. 生成 Netlify 配置
console.log('\n⚙️ 3. 生成 Netlify 配置');
const netlifyConfig = {
  build: {
    command: 'npm run build',
    publish: 'dist',
  },
  redirects: [
    {
      from: '/*',
      to: '/index.html',
      status: 200,
    },
  ],
  headers: [
    {
      for: '/*',
      values: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
    {
      for: '/assets/*',
      values: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  ],
};

fs.writeFileSync(
  'netlify.toml',
  `# Netlify 配置文件
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`
);

console.log('✅ netlify.toml 配置文件已生成');

// 4. 生成環境變數模板
console.log('\n🔧 4. 生成環境變數模板');
const envTemplate = `# Netlify 環境變數設置
# 在 Netlify 控制台的 Site settings > Environment variables 中設置

VITE_ADMOB_APP_ID=ca-app-pub-5869708488609837~6490454632
VITE_ADMOB_BANNER_ID=ca-app-pub-5869708488609837/1189068634
VITE_ADMOB_ENABLED=true
VITE_ADMOB_TEST_MODE=false

# Firebase 配置 (如果使用)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_firebase_app_id
`;

fs.writeFileSync('netlify-env-template.txt', envTemplate);
console.log('✅ netlify-env-template.txt 已生成');

// 5. 生成部署指令
console.log('\n📋 5. 部署指令');
const deployInstructions = `
🚀 Netlify 部署指令

方法一：使用 Netlify CLI
1. 安裝 Netlify CLI: npm install -g netlify-cli
2. 登入: netlify login
3. 部署: netlify deploy --prod --dir=dist

方法二：使用 Netlify 網站
1. 前往 https://app.netlify.com/
2. 點擊 "New site from Git"
3. 連接您的 Git 倉庫
4. 設置構建命令: npm run build
5. 設置發布目錄: dist
6. 添加環境變數 (見 netlify-env-template.txt)
7. 點擊 "Deploy site"

方法三：拖拽部署
1. 前往 https://app.netlify.com/
2. 將 dist 文件夾拖拽到部署區域
3. 在 Site settings 中設置環境變數

🔧 環境變數設置
在 Netlify 控制台的 Site settings > Environment variables 中添加：
${envTemplate}

📊 部署後檢查
1. 訪問部署的網站
2. 打開開發者工具
3. 檢查控制台中的 AdMob 配置狀態
4. 測試不同頁面的廣告顯示
5. 在 AdMob 控制台監控收益

🔗 相關鏈接
- Netlify 控制台: https://app.netlify.com/
- AdMob 控制台: https://admob.google.com/
- 部署狀態: 檢查 Netlify 控制台的 Deploys 頁面
`;

fs.writeFileSync('DEPLOY_INSTRUCTIONS.md', deployInstructions);
console.log('✅ DEPLOY_INSTRUCTIONS.md 已生成');

// 6. 生成部署檢查清單
console.log('\n✅ 6. 部署檢查清單');
const checklist = `
📋 Netlify 部署檢查清單

構建檢查:
□ dist 目錄存在
□ index.html 文件存在
□ assets 目錄存在
□ AdMob 配置已打包

配置文件:
□ netlify.toml 已生成
□ 環境變數模板已生成
□ 部署指令已生成

環境變數設置:
□ VITE_ADMOB_APP_ID 已設置
□ VITE_ADMOB_BANNER_ID 已設置
□ VITE_ADMOB_ENABLED 已設置
□ VITE_ADMOB_TEST_MODE 已設置

部署後驗證:
□ 網站正常訪問
□ AdMob 配置正確載入
□ 廣告組件正常渲染
□ 控制台無錯誤
□ AdMob 腳本正常載入

AdMob 設置:
□ 應用程式已審核通過
□ 廣告單元 ID 正確
□ 收益數據正常顯示
□ 政策合規檢查通過
`;

console.log(checklist);

// 7. 總結
console.log('\n🎉 部署準備完成！');
console.log('='.repeat(50));
console.log('📁 生成的文件:');
console.log('- netlify.toml (Netlify 配置)');
console.log('- netlify-env-template.txt (環境變數模板)');
console.log('- DEPLOY_INSTRUCTIONS.md (部署指令)');
console.log('='.repeat(50));

console.log('\n📝 下一步:');
console.log('1. 查看 DEPLOY_INSTRUCTIONS.md 了解部署步驟');
console.log('2. 在 Netlify 控制台設置環境變數');
console.log('3. 部署到 Netlify');
console.log('4. 驗證 AdMob 功能正常');

console.log('\n🔗 重要鏈接:');
console.log('- Netlify 控制台: https://app.netlify.com/');
console.log('- AdMob 控制台: https://admob.google.com/');
console.log('- 測試報告: ADMOB_TEST_REPORT.md');
