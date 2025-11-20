// 增強的 Netlify 部署腳本
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 增強版 Netlify 部署準備開始...\n');

// 顏色編碼工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// 部署檢查器類
class DeploymentChecker {
  constructor() {
    this.checks = {
      build: false,
      fileSize: false,
      dependencies: false,
      environment: false,
      admob: false,
      health: false,
    };
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
  }

  // 檢查文件大小
  checkFileSizes() {
    console.log(`${colors.cyan}📊 檢查文件大小...${colors.reset}`);

    const distPath = 'dist';
    const assetsPath = path.join(distPath, 'assets');

    if (!fs.existsSync(assetsPath)) {
      this.issues.push('assets 目錄不存在');
      return false;
    }

    const files = fs.readdirSync(assetsPath);
    let totalSize = 0;
    const largeFiles = [];

    files.forEach(file => {
      const filePath = path.join(assetsPath, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;

      if (stats.size > 500 * 1024) {
        // 500KB
        largeFiles.push({
          name: file,
          size: (stats.size / 1024).toFixed(2) + ' KB',
        });
      }
    });

    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`${colors.blue}總大小: ${totalSizeMB} MB${colors.reset}`);

    if (totalSize > 2 * 1024 * 1024) {
      // 2MB
      this.issues.push(`assets 目錄過大: ${totalSizeMB} MB`);
      this.recommendations.push('考慮使用代碼分割和懶加載');
    } else {
      console.log(`${colors.green}✅ 文件大小正常${colors.reset}`);
      this.checks.fileSize = true;
    }

    if (largeFiles.length > 0) {
      console.log(`${colors.yellow}⚠️ 大文件警告:${colors.reset}`);
      largeFiles.forEach(file => {
        console.log(
          `${colors.yellow}  - ${file.name}: ${file.size}${colors.reset}`
        );
      });
      this.warnings.push(`${largeFiles.length} 個文件超過 500KB`);
    }

    return this.checks.fileSize;
  }

  // 檢查未使用的依賴
  checkUnusedDependencies() {
    console.log(`${colors.cyan}🔍 檢查未使用的依賴...${colors.reset}`);

    try {
      // 使用 depcheck 檢查未使用的依賴
      const result = execSync('npx depcheck --json', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      const depcheckResult = JSON.parse(result);
      const unusedDeps = depcheckResult.dependencies || [];
      const unusedDevDeps = depcheckResult.devDependencies || [];

      if (unusedDeps.length > 0) {
        console.log(`${colors.yellow}⚠️ 未使用的生產依賴:${colors.reset}`);
        unusedDeps.forEach(dep => {
          console.log(`${colors.yellow}  - ${dep}${colors.reset}`);
        });
        this.warnings.push(`${unusedDeps.length} 個未使用的生產依賴`);
      }

      if (unusedDevDeps.length > 0) {
        console.log(`${colors.yellow}⚠️ 未使用的開發依賴:${colors.reset}`);
        unusedDevDeps.forEach(dep => {
          console.log(`${colors.yellow}  - ${dep}${colors.reset}`);
        });
        this.warnings.push(`${unusedDevDeps.length} 個未使用的開發依賴`);
      }

      if (unusedDeps.length === 0 && unusedDevDeps.length === 0) {
        console.log(`${colors.green}✅ 所有依賴都在使用中${colors.reset}`);
        this.checks.dependencies = true;
      } else {
        this.recommendations.push('考慮移除未使用的依賴以減少包大小');
      }
    } catch (error) {
      console.log(
        `${colors.yellow}⚠️ 無法檢查依賴使用情況: ${error.message}${colors.reset}`
      );
      this.warnings.push('依賴檢查失敗');
    }

    return this.checks.dependencies;
  }

  // 驗證環境變數完整性
  validateEnvironmentVariables() {
    console.log(`${colors.cyan}🔧 驗證環境變數完整性...${colors.reset}`);

    const envPath = '.env.local';
    if (!fs.existsSync(envPath)) {
      this.issues.push('.env.local 文件不存在');
      return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf16le');
    const requiredVars = [
      'VITE_ADMOB_APP_ID',
      'VITE_ADMOB_BANNER_ID',
      'VITE_ADMOB_ENABLED',
      'VITE_ADMOB_TEST_MODE',
    ];

    const missingVars = [];
    const invalidVars = [];

    requiredVars.forEach(varName => {
      if (!envContent.includes(varName)) {
        missingVars.push(varName);
      } else {
        // 檢查變數值是否有效
        const match = envContent.match(new RegExp(`${varName}=(.*?)(?:\n|$)`));
        if (match) {
          const value = match[1].trim();
          if (!value || value === 'undefined' || value === 'null') {
            invalidVars.push(varName);
          }
        } else {
          missingVars.push(varName);
        }
      }
    });

    if (missingVars.length > 0) {
      this.issues.push(`缺少環境變數: ${missingVars.join(', ')}`);
    }

    if (invalidVars.length > 0) {
      this.issues.push(`無效的環境變數值: ${invalidVars.join(', ')}`);
    }

    if (missingVars.length === 0 && invalidVars.length === 0) {
      console.log(`${colors.green}✅ 環境變數配置完整${colors.reset}`);
      this.checks.environment = true;
    } else {
      console.log(`${colors.red}❌ 環境變數配置有問題${colors.reset}`);
    }

    return this.checks.environment;
  }

  // 檢查 AdMob 配置
  checkAdMobConfiguration() {
    console.log(`${colors.cyan}🎯 檢查 AdMob 配置...${colors.reset}`);

    const distPath = 'dist';
    const assetsPath = path.join(distPath, 'assets');

    if (!fs.existsSync(assetsPath)) {
      this.issues.push('assets 目錄不存在');
      return false;
    }

    const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'));
    let admobFound = false;
    let admobConfigValid = true;

    jsFiles.forEach(jsFile => {
      const jsPath = path.join(assetsPath, jsFile);
      const jsContent = fs.readFileSync(jsPath, 'utf8');

      if (jsContent.includes('ca-app-pub-') || jsContent.includes('admob')) {
        admobFound = true;

        // 檢查 AdMob 配置格式
        const appIdMatch = jsContent.match(/ca-app-pub-\d+~\d+/);
        const bannerIdMatch = jsContent.match(/ca-app-pub-\d+\/\d+/);

        if (!appIdMatch) {
          this.issues.push('AdMob 應用程式 ID 格式不正確');
          admobConfigValid = false;
        }

        if (!bannerIdMatch) {
          this.issues.push('AdMob 廣告單元 ID 格式不正確');
          admobConfigValid = false;
        }
      }
    });

    if (!admobFound) {
      this.issues.push('AdMob 配置未在構建產物中找到');
    } else if (admobConfigValid) {
      console.log(`${colors.green}✅ AdMob 配置正確${colors.reset}`);
      this.checks.admob = true;
    } else {
      console.log(`${colors.red}❌ AdMob 配置有問題${colors.reset}`);
    }

    return this.checks.admob;
  }

  // 部署前健康檢查
  async performHealthCheck() {
    console.log(`${colors.cyan}🏥 執行部署前健康檢查...${colors.reset}`);

    try {
      // 運行自動化測試
      console.log(`${colors.blue}運行自動化測試...${colors.reset}`);
      execSync('npm run test:quick', { stdio: 'pipe' });
      console.log(`${colors.green}✅ 自動化測試通過${colors.reset}`);

      // 運行性能監控
      console.log(`${colors.blue}運行性能監控...${colors.reset}`);
      execSync('npm run test:performance', { stdio: 'pipe' });
      console.log(`${colors.green}✅ 性能監控通過${colors.reset}`);

      this.checks.health = true;
      console.log(`${colors.green}✅ 健康檢查通過${colors.reset}`);
    } catch (error) {
      this.issues.push(`健康檢查失敗: ${error.message}`);
      console.log(`${colors.red}❌ 健康檢查失敗${colors.reset}`);
    }

    return this.checks.health;
  }

  // 生成部署報告
  generateDeploymentReport() {
    const totalChecks = Object.keys(this.checks).length;
    const passedChecks = Object.values(this.checks).filter(Boolean).length;
    const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks,
        passedChecks,
        successRate: `${successRate}%`,
        issues: this.issues.length,
        warnings: this.warnings.length,
        recommendations: this.recommendations.length,
      },
      checks: this.checks,
      issues: this.issues,
      warnings: this.warnings,
      recommendations: this.recommendations,
    };

    return report;
  }
}

// 運行增強版部署檢查
async function runEnhancedDeployment() {
  const checker = new DeploymentChecker();

  // 1. 檢查構建產物
  console.log(`${colors.bright}📦 1. 檢查構建產物${colors.reset}`);
  const distPath = 'dist';
  if (fs.existsSync(distPath)) {
    console.log(`${colors.green}✅ dist 目錄存在${colors.reset}`);

    const files = fs.readdirSync(distPath);
    console.log(
      `${colors.blue}📁 包含 ${files.length} 個文件/目錄${colors.reset}`
    );

    // 檢查重要文件
    const importantFiles = ['index.html', 'assets'];
    let allFilesExist = true;
    importantFiles.forEach(file => {
      if (files.includes(file)) {
        console.log(`${colors.green}✅ ${file}: 存在${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ ${file}: 缺失${colors.reset}`);
        allFilesExist = false;
      }
    });

    if (allFilesExist) {
      checker.checks.build = true;
    } else {
      checker.issues.push('缺少重要的構建文件');
    }
  } else {
    console.log(
      `${colors.red}❌ dist 目錄不存在，請先運行 npm run build${colors.reset}`
    );
    checker.issues.push('dist 目錄不存在');
  }

  // 2. 執行所有檢查
  console.log(`\n${colors.bright}🔍 2. 執行部署前檢查${colors.reset}`);

  checker.checkFileSizes();
  checker.checkUnusedDependencies();
  checker.validateEnvironmentVariables();
  checker.checkAdMobConfiguration();
  await checker.performHealthCheck();

  // 3. 顯示檢查結果
  console.log(
    `\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`
  );
  console.log(`${colors.bright}📊 部署檢查報告${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);

  const report = checker.generateDeploymentReport();

  console.log(
    `${colors.blue}檢查項目: ${report.summary.totalChecks}${colors.reset}`
  );
  console.log(
    `${colors.green}通過: ${report.summary.passedChecks}${colors.reset}`
  );
  console.log(
    `${colors.blue}成功率: ${report.summary.successRate}${colors.reset}`
  );
  console.log(`${colors.red}問題: ${report.summary.issues}${colors.reset}`);
  console.log(
    `${colors.yellow}警告: ${report.summary.warnings}${colors.reset}`
  );
  console.log(
    `${colors.cyan}建議: ${report.summary.recommendations}${colors.reset}`
  );

  // 顯示詳細結果
  console.log(`\n${colors.bright}📋 詳細檢查結果:${colors.reset}`);
  Object.entries(checker.checks).forEach(([check, passed]) => {
    const status = passed ? `${colors.green}✅` : `${colors.red}❌`;
    const checkName = {
      build: '構建產物',
      fileSize: '文件大小',
      dependencies: '依賴檢查',
      environment: '環境變數',
      admob: 'AdMob 配置',
      health: '健康檢查',
    }[check];
    console.log(`${status} ${checkName}${colors.reset}`);
  });

  // 顯示問題和建議
  if (checker.issues.length > 0) {
    console.log(`\n${colors.red}❌ 發現問題:${colors.reset}`);
    checker.issues.forEach((issue, index) => {
      console.log(`${colors.red}${index + 1}. ${issue}${colors.reset}`);
    });
  }

  if (checker.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️ 警告:${colors.reset}`);
    checker.warnings.forEach((warning, index) => {
      console.log(`${colors.yellow}${index + 1}. ${warning}${colors.reset}`);
    });
  }

  if (checker.recommendations.length > 0) {
    console.log(`\n${colors.cyan}💡 建議:${colors.reset}`);
    checker.recommendations.forEach((rec, index) => {
      console.log(`${colors.cyan}${index + 1}. ${rec}${colors.reset}`);
    });
  }

  // 保存部署報告
  fs.writeFileSync('deployment-report.json', JSON.stringify(report, null, 2));
  console.log(
    `\n${colors.green}📄 部署報告已保存到 deployment-report.json${colors.reset}`
  );

  // 決定是否繼續部署
  if (checker.issues.length > 0) {
    console.log(
      `\n${colors.red}⚠️ 發現 ${checker.issues.length} 個問題，建議修復後再部署${colors.reset}`
    );
    console.log(
      `${colors.yellow}如需強制部署，請使用 --force 參數${colors.reset}`
    );
    return false;
  } else {
    console.log(
      `\n${colors.green}🎉 所有檢查通過！可以安全部署${colors.reset}`
    );
    return true;
  }
}

// 4. 生成 Netlify 配置（如果檢查通過）
async function generateNetlifyConfig() {
  console.log(`\n${colors.bright}⚙️ 4. 生成 Netlify 配置${colors.reset}`);

  const netlifyConfig = {
    build: {
      command: 'npm run build',
      publish: 'dist',
    },
    redirects: [
      {
        from: '/assets/*',
        to: '/assets/:splat',
        status: 200,
      },
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

# ✅ 修復：保護靜態資源，避免被重定向（必須在 /* 之前）
[[redirects]]
  from = "/assets/*"
  to = "/assets/:splat"
  status = 200

# ✅ 原有規則：SPA 路由重定向
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

  console.log(`${colors.green}✅ netlify.toml 配置文件已生成${colors.reset}`);
}

// 5. 生成環境變數模板
async function generateEnvironmentTemplate() {
  console.log(`\n${colors.bright}🔧 5. 生成環境變數模板${colors.reset}`);

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
  console.log(
    `${colors.green}✅ netlify-env-template.txt 已生成${colors.reset}`
  );
}

// 6. 生成部署指令
async function generateDeployInstructions() {
  console.log(`\n${colors.bright}📋 6. 生成部署指令${colors.reset}`);

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
VITE_ADMOB_APP_ID=ca-app-pub-5869708488609837~6490454632
VITE_ADMOB_BANNER_ID=ca-app-pub-5869708488609837/1189068634
VITE_ADMOB_ENABLED=true
VITE_ADMOB_TEST_MODE=false

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
  console.log(`${colors.green}✅ DEPLOY_INSTRUCTIONS.md 已生成${colors.reset}`);
}

// 7. 生成部署檢查清單
async function generateDeploymentChecklist() {
  console.log(`\n${colors.bright}✅ 7. 生成部署檢查清單${colors.reset}`);

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
}

// 主函數
async function main() {
  try {
    // 執行增強版部署檢查
    const canDeploy = await runEnhancedDeployment();

    if (canDeploy) {
      // 生成配置文件
      await generateNetlifyConfig();
      await generateEnvironmentTemplate();
      await generateDeployInstructions();
      await generateDeploymentChecklist();

      // 顯示總結
      console.log(
        `\n${colors.bright}${colors.green}🎉 部署準備完成！${colors.reset}`
      );
      console.log(
        `${colors.bright}${colors.cyan}${'='.repeat(50)}${colors.reset}`
      );
      console.log(`${colors.bright}📁 生成的文件:${colors.reset}`);
      console.log(`${colors.blue}- netlify.toml (Netlify 配置)${colors.reset}`);
      console.log(
        `${colors.blue}- netlify-env-template.txt (環境變數模板)${colors.reset}`
      );
      console.log(
        `${colors.blue}- DEPLOY_INSTRUCTIONS.md (部署指令)${colors.reset}`
      );
      console.log(
        `${colors.blue}- deployment-report.json (部署報告)${colors.reset}`
      );
      console.log(
        `${colors.bright}${colors.cyan}${'='.repeat(50)}${colors.reset}`
      );

      console.log(`\n${colors.bright}📝 下一步:${colors.reset}`);
      console.log(
        `${colors.blue}1. 查看 DEPLOY_INSTRUCTIONS.md 了解部署步驟${colors.reset}`
      );
      console.log(
        `${colors.blue}2. 在 Netlify 控制台設置環境變數${colors.reset}`
      );
      console.log(`${colors.blue}3. 部署到 Netlify${colors.reset}`);
      console.log(`${colors.blue}4. 驗證 AdMob 功能正常${colors.reset}`);

      console.log(`\n${colors.bright}🔗 重要鏈接:${colors.reset}`);
      console.log(
        `${colors.blue}- Netlify 控制台: https://app.netlify.com/${colors.reset}`
      );
      console.log(
        `${colors.blue}- AdMob 控制台: https://admob.google.com/${colors.reset}`
      );
      console.log(
        `${colors.blue}- 測試報告: ADMOB_TEST_REPORT.md${colors.reset}`
      );
    } else {
      console.log(
        `\n${colors.red}❌ 部署檢查失敗，請修復問題後重新運行${colors.reset}`
      );
      process.exit(1);
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ 部署準備失敗: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }
}

// 啟動主函數
main();
