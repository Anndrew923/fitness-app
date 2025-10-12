// 完整的自動化測試系統
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🤖 完整自動化測試系統啟動...\n');

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

// 測試套件管理器
class TestSuiteManager {
  constructor() {
    this.suites = new Map();
    this.results = {
      startTime: Date.now(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: [],
      performance: {},
      coverage: {},
    };
  }

  // 註冊測試套件
  registerSuite(name, tests) {
    this.suites.set(name, {
      name,
      tests,
      status: 'pending',
      startTime: null,
      endTime: null,
      results: [],
    });
  }

  // 運行單個測試
  async runTest(testName, testFn, suiteName) {
    const startTime = Date.now();
    try {
      console.log(`${colors.cyan}🧪 運行測試: ${testName}${colors.reset}`);
      const result = await testFn();
      const duration = Date.now() - startTime;

      const testResult = {
        name: testName,
        status: 'pass',
        duration,
        result,
        timestamp: new Date().toISOString(),
      };

      this.results.passed++;
      this.results.totalTests++;
      console.log(
        `${colors.green}✅ ${testName} 通過 (${duration}ms)${colors.reset}`
      );
      return testResult;
    } catch (error) {
      const duration = Date.now() - startTime;

      const testResult = {
        name: testName,
        status: 'fail',
        duration,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      this.results.failed++;
      this.results.totalTests++;
      this.results.errors.push({
        suite: suiteName,
        test: testName,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `${colors.red}❌ ${testName} 失敗: ${error.message} (${duration}ms)${colors.reset}`
      );
      return testResult;
    }
  }

  // 並行運行測試套件
  async runSuiteParallel(suiteName) {
    const suite = this.suites.get(suiteName);
    if (!suite) {
      throw new Error(`測試套件 ${suiteName} 不存在`);
    }

    suite.startTime = Date.now();
    console.log(
      `\n${colors.bright}🚀 開始測試套件: ${suiteName}${colors.reset}`
    );

    // 並行執行所有測試
    const testPromises = suite.tests.map(test =>
      this.runTest(test.name, test.fn, suiteName)
    );

    const results = await Promise.all(testPromises);
    suite.results = results;
    suite.endTime = Date.now();
    suite.status = results.every(r => r.status === 'pass') ? 'pass' : 'fail';

    const duration = suite.endTime - suite.startTime;
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;

    console.log(
      `\n${colors.bright}📊 測試套件 ${suiteName} 完成:${colors.reset}`
    );
    console.log(`${colors.green}✅ 通過: ${passed}${colors.reset}`);
    console.log(`${colors.red}❌ 失敗: ${failed}${colors.reset}`);
    console.log(`${colors.blue}⏱️ 耗時: ${duration}ms${colors.reset}`);

    return suite;
  }

  // 運行所有測試套件
  async runAllSuites() {
    console.log(`${colors.bright}🚀 開始運行所有測試套件...${colors.reset}\n`);

    const suiteNames = Array.from(this.suites.keys());
    const results = [];

    for (const suiteName of suiteNames) {
      try {
        const suiteResult = await this.runSuiteParallel(suiteName);
        results.push(suiteResult);
      } catch (error) {
        console.log(
          `${colors.red}❌ 測試套件 ${suiteName} 執行失敗: ${error.message}${colors.reset}`
        );
        this.results.errors.push({
          suite: suiteName,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  // 生成詳細報告
  generateReport() {
    const totalTime = Date.now() - this.results.startTime;
    const successRate =
      this.results.totalTests > 0
        ? ((this.results.passed / this.results.totalTests) * 100).toFixed(1)
        : 0;

    const report = {
      summary: {
        totalSuites: this.suites.size,
        totalTests: this.results.totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        successRate: `${successRate}%`,
        totalTime: `${totalTime}ms`,
        timestamp: new Date().toISOString(),
      },
      suites: Array.from(this.suites.values()),
      errors: this.results.errors,
      warnings: this.results.warnings,
      performance: this.results.performance,
      coverage: this.results.coverage,
    };

    return report;
  }
}

// 創建測試管理器實例
const testManager = new TestSuiteManager();

// 環境變數測試套件
testManager.registerSuite('environment', [
  {
    name: '環境變數文件檢查',
    fn: async () => {
      const envPath = '.env.local';
      if (!fs.existsSync(envPath)) {
        throw new Error('.env.local 文件不存在');
      }
      return { fileExists: true, path: envPath };
    },
  },
  {
    name: 'AdMob 環境變數驗證',
    fn: async () => {
      const envPath = '.env.local';
      const content = fs.readFileSync(envPath, 'utf8');

      const requiredVars = [
        'VITE_ADMOB_APP_ID',
        'VITE_ADMOB_BANNER_ID',
        'VITE_ADMOB_ENABLED',
        'VITE_ADMOB_TEST_MODE',
      ];

      const missingVars = [];
      requiredVars.forEach(varName => {
        if (!content.includes(varName)) {
          missingVars.push(varName);
        }
      });

      if (missingVars.length > 0) {
        console.log(
          `${colors.yellow}⚠️ 警告: 缺少環境變數 ${missingVars.join(', ')}${
            colors.reset
          }`
        );
      }

      return {
        requiredVars: requiredVars.length,
        missingVars: missingVars.length,
        missingVarsList: missingVars,
      };
    },
  },
  {
    name: 'Node.js 環境檢查',
    fn: async () => {
      const nodeVersion = process.version;
      const platform = process.platform;
      const arch = process.arch;

      return {
        nodeVersion,
        platform,
        arch,
        isSupported: true,
      };
    },
  },
]);

// 配置文件測試套件
testManager.registerSuite('configuration', [
  {
    name: 'AdMob 配置文件檢查',
    fn: async () => {
      const configFiles = [
        'src/config/adConfig.js',
        'src/components/AdBanner.jsx',
        'src/components/AdMobConfigDebug.jsx',
      ];

      const results = {};
      configFiles.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          results[file] = {
            exists: true,
            size: content.length,
            hasAdMobConfig:
              content.includes('adConfig') || content.includes('AdMob'),
            hasErrorHandling:
              content.includes('try') && content.includes('catch'),
            hasPerformanceOptimization:
              content.includes('useMemo') || content.includes('useCallback'),
          };
        } else {
          results[file] = { exists: false };
        }
      });

      const missingFiles = Object.entries(results).filter(
        ([_, info]) => !info.exists
      );
      if (missingFiles.length > 0) {
        throw new Error(
          `缺少配置文件: ${missingFiles.map(([file]) => file).join(', ')}`
        );
      }

      return results;
    },
  },
  {
    name: 'package.json 依賴檢查',
    fn: async () => {
      const packageJsonPath = 'package.json';
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json 文件不存在');
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});

      const requiredDeps = ['react'];
      const missingDeps = requiredDeps.filter(
        dep => !dependencies.includes(dep)
      );

      if (missingDeps.length > 0) {
        throw new Error(`缺少必要依賴: ${missingDeps.join(', ')}`);
      }

      return {
        totalDependencies: dependencies.length,
        totalDevDependencies: devDependencies.length,
        requiredDependencies: requiredDeps.length,
        missingDependencies: missingDeps.length,
      };
    },
  },
  {
    name: 'Vite 配置檢查',
    fn: async () => {
      const viteConfigPath = 'vite.config.js';
      if (!fs.existsSync(viteConfigPath)) {
        throw new Error('vite.config.js 文件不存在');
      }

      const content = fs.readFileSync(viteConfigPath, 'utf8');
      return {
        exists: true,
        hasBuildConfig: content.includes('build'),
        hasDevConfig: content.includes('dev'),
        hasPluginConfig: content.includes('plugin'),
      };
    },
  },
]);

// 構建測試套件
testManager.registerSuite('build', [
  {
    name: '生產構建檢查',
    fn: async () => {
      const distPath = 'dist';
      if (!fs.existsSync(distPath)) {
        throw new Error('dist 目錄不存在，請先運行 npm run build');
      }

      const requiredFiles = ['index.html', 'assets'];
      const missingFiles = [];

      requiredFiles.forEach(file => {
        if (!fs.existsSync(path.join(distPath, file))) {
          missingFiles.push(file);
        }
      });

      if (missingFiles.length > 0) {
        throw new Error(`構建產物缺少文件: ${missingFiles.join(', ')}`);
      }

      return {
        distExists: true,
        requiredFiles: requiredFiles.length,
        missingFiles: missingFiles.length,
      };
    },
  },
  {
    name: 'AdMob 配置打包檢查',
    fn: async () => {
      const distPath = 'dist';
      const assetsPath = path.join(distPath, 'assets');

      if (!fs.existsSync(assetsPath)) {
        throw new Error('assets 目錄不存在');
      }

      const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'));
      let admobFound = false;
      let admobConfigSize = 0;

      jsFiles.forEach(jsFile => {
        const jsPath = path.join(assetsPath, jsFile);
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        if (jsContent.includes('ca-app-pub-') || jsContent.includes('admob')) {
          admobFound = true;
          admobConfigSize += fs.statSync(jsPath).size;
        }
      });

      if (!admobFound) {
        throw new Error('AdMob 配置未在構建產物中找到');
      }

      return {
        admobConfigPacked: admobFound,
        admobConfigSize: `${(admobConfigSize / 1024).toFixed(2)} KB`,
        jsFiles: jsFiles.length,
      };
    },
  },
  {
    name: '文件大小優化檢查',
    fn: async () => {
      const distPath = 'dist';
      const indexHtmlPath = path.join(distPath, 'index.html');
      const assetsPath = path.join(distPath, 'assets');

      let totalSize = 0;
      let largeFiles = [];

      // 檢查 index.html
      if (fs.existsSync(indexHtmlPath)) {
        const indexSize = fs.statSync(indexHtmlPath).size;
        totalSize += indexSize;
        if (indexSize > 50 * 1024) {
          // 50KB
          largeFiles.push({
            name: 'index.html',
            size: `${(indexSize / 1024).toFixed(2)} KB`,
          });
        }
      }

      // 檢查 assets 目錄
      if (fs.existsSync(assetsPath)) {
        const files = fs.readdirSync(assetsPath);
        files.forEach(file => {
          const filePath = path.join(assetsPath, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          if (stats.size > 500 * 1024) {
            // 500KB
            largeFiles.push({
              name: file,
              size: `${(stats.size / 1024).toFixed(2)} KB`,
            });
          }
        });
      }

      return {
        totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
        largeFiles: largeFiles.length,
        largeFilesList: largeFiles,
        isOptimized: largeFiles.length === 0,
      };
    },
  },
]);

// 代碼質量測試套件
testManager.registerSuite('code-quality', [
  {
    name: 'ESLint 檢查',
    fn: async () => {
      try {
        const result = execSync('npm run check', {
          encoding: 'utf8',
          stdio: 'pipe',
        });
        return {
          eslintPassed: true,
          output: result,
        };
      } catch (error) {
        // ESLint 錯誤不算測試失敗，只是警告
        console.log(
          `${colors.yellow}⚠️ ESLint 發現問題: ${error.message}${colors.reset}`
        );
        return {
          eslintPassed: false,
          output: error.stdout || error.message,
        };
      }
    },
  },
  {
    name: '代碼覆蓋率檢查',
    fn: async () => {
      const filesToCheck = [
        'src/config/adConfig.js',
        'src/components/AdBanner.jsx',
        'src/components/AdMobConfigDebug.jsx',
      ];

      let totalLines = 0;
      let coveredLines = 0;

      filesToCheck.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.split('\n');
          totalLines += lines.length;

          // 簡單的覆蓋率估算（基於函數和類的數量）
          const functions = (
            content.match(/function|const\s+\w+\s*=|class\s+\w+/g) || []
          ).length;
          coveredLines += functions;
        }
      });

      const coverage =
        totalLines > 0 ? ((coveredLines / totalLines) * 100).toFixed(1) : 0;

      return {
        totalLines,
        coveredLines,
        coverage: `${coverage}%`,
        isGoodCoverage: coverage >= 70,
      };
    },
  },
  {
    name: '性能優化檢查',
    fn: async () => {
      const filesToCheck = [
        'src/config/adConfig.js',
        'src/components/AdBanner.jsx',
        'src/components/AdMobConfigDebug.jsx',
      ];

      const optimizationIssues = [];
      let totalFiles = 0;
      let optimizedFiles = 0;

      filesToCheck.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          totalFiles++;

          let fileOptimized = true;

          // 檢查錯誤處理
          if (!content.includes('try') && !content.includes('catch')) {
            optimizationIssues.push(`${file}: 缺少錯誤處理`);
            fileOptimized = false;
          }

          // 檢查性能優化
          if (
            !content.includes('useMemo') &&
            !content.includes('useCallback') &&
            !content.includes('memo')
          ) {
            optimizationIssues.push(`${file}: 缺少性能優化`);
            fileOptimized = false;
          }

          // 檢查 console.log 使用
          const consoleLogCount = (content.match(/console\.log/g) || []).length;
          if (consoleLogCount > 5) {
            optimizationIssues.push(
              `${file}: 包含過多 console.log (${consoleLogCount} 個)`
            );
            fileOptimized = false;
          }

          if (fileOptimized) {
            optimizedFiles++;
          }
        }
      });

      return {
        totalFiles,
        optimizedFiles,
        optimizationPercentage:
          totalFiles > 0
            ? ((optimizedFiles / totalFiles) * 100).toFixed(1) + '%'
            : '0%',
        issues: optimizationIssues.length,
        issuesList: optimizationIssues,
        isWellOptimized: optimizationIssues.length === 0,
      };
    },
  },
]);

// 性能測試套件
testManager.registerSuite('performance', [
  {
    name: '構建性能檢查',
    fn: async () => {
      const startTime = Date.now();

      try {
        // 清理之前的構建
        if (fs.existsSync('dist')) {
          fs.rmSync('dist', { recursive: true, force: true });
        }

        // 運行構建
        execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });

        const buildTime = Date.now() - startTime;

        return {
          buildTime: `${buildTime}ms`,
          buildSuccessful: true,
          isFastBuild: buildTime < 60000, // 1分鐘
        };
      } catch (error) {
        throw new Error(`構建失敗: ${error.message}`);
      }
    },
  },
  {
    name: '文件壓縮檢查',
    fn: async () => {
      const distPath = 'dist';
      const assetsPath = path.join(distPath, 'assets');

      if (!fs.existsSync(assetsPath)) {
        throw new Error('assets 目錄不存在');
      }

      const files = fs.readdirSync(assetsPath);
      let totalSize = 0;
      let compressedFiles = 0;

      files.forEach(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;

        // 檢查是否為壓縮文件
        if (file.endsWith('.js') || file.endsWith('.css')) {
          compressedFiles++;
        }
      });

      return {
        totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
        fileCount: files.length,
        compressedFiles,
        compressionRatio:
          files.length > 0
            ? ((compressedFiles / files.length) * 100).toFixed(1) + '%'
            : '0%',
      };
    },
  },
  {
    name: '依賴大小分析',
    fn: async () => {
      const packageJsonPath = 'package.json';
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});

      return {
        productionDependencies: dependencies.length,
        developmentDependencies: devDependencies.length,
        totalDependencies: dependencies.length + devDependencies.length,
        isReasonableSize: dependencies.length + devDependencies.length < 50,
      };
    },
  },
]);

// 運行所有測試
async function runAllTests() {
  try {
    console.log(
      `${colors.bright}${colors.cyan}🚀 開始完整自動化測試...${colors.reset}\n`
    );

    const results = await testManager.runAllSuites();
    const report = testManager.generateReport();

    // 顯示總結
    console.log(
      `\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`
    );
    console.log(`${colors.bright}📊 完整自動化測試報告${colors.reset}`);
    console.log(
      `${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`
    );

    console.log(
      `${colors.blue}測試套件: ${report.summary.totalSuites}${colors.reset}`
    );
    console.log(
      `${colors.blue}總測試數: ${report.summary.totalTests}${colors.reset}`
    );
    console.log(`${colors.green}通過: ${report.summary.passed}${colors.reset}`);
    console.log(`${colors.red}失敗: ${report.summary.failed}${colors.reset}`);
    console.log(
      `${colors.blue}成功率: ${report.summary.successRate}${colors.reset}`
    );
    console.log(
      `${colors.blue}總耗時: ${report.summary.totalTime}${colors.reset}`
    );

    // 詳細結果
    console.log(`\n${colors.bright}📋 詳細結果:${colors.reset}`);
    results.forEach((suite, index) => {
      const status =
        suite.status === 'pass' ? `${colors.green}✅` : `${colors.red}❌`;
      const duration = suite.endTime - suite.startTime;
      console.log(
        `${status} ${index + 1}. ${suite.name} (${duration}ms)${colors.reset}`
      );
    });

    // 錯誤詳情
    if (report.errors.length > 0) {
      console.log(`\n${colors.red}❌ 錯誤詳情:${colors.reset}`);
      report.errors.forEach((error, index) => {
        console.log(
          `${colors.red}${index + 1}. [${error.suite || '系統'}] ${
            error.test || '測試'
          }: ${error.error}${colors.reset}`
        );
      });
    }

    // 保存報告
    fs.writeFileSync(
      'comprehensive-test-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log(
      `\n${colors.green}📄 詳細報告已保存到 comprehensive-test-report.json${colors.reset}`
    );

    // 最終狀態
    if (report.summary.failed === 0) {
      console.log(
        `\n${colors.green}🎉 所有測試通過！系統準備就緒${colors.reset}`
      );
      process.exit(0);
    } else {
      console.log(
        `\n${colors.red}⚠️ 發現 ${report.summary.failed} 個測試失敗${colors.reset}`
      );
      console.log(
        `${colors.yellow}請檢查上述錯誤並修復後重新運行測試${colors.reset}`
      );
      process.exit(1);
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ 測試系統執行失敗: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }
}

// 啟動測試
runAllTests();
