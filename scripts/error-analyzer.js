// AdMob 錯誤分析系統
import fs from 'fs';
import path from 'path';

console.log('🔍 AdMob 錯誤分析系統啟動...\n');

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

// 錯誤分析器類
class ErrorAnalyzer {
  constructor() {
    this.errorPatterns = new Map();
    this.errorStats = {
      totalErrors: 0,
      errorTypes: {},
      frequency: {},
      severity: {},
      autoFixable: 0,
      manualFix: 0,
    };
    this.analysisResults = {
      startTime: Date.now(),
      patterns: [],
      recommendations: [],
      autoFixes: [],
      troubleshootingGuide: [],
    };
  }

  // 分析常見錯誤模式
  async analyzeErrorPatterns() {
    console.log(`${colors.cyan}🔍 分析常見錯誤模式...${colors.reset}`);

    const patterns = [
      {
        name: '環境變數錯誤',
        pattern: /VITE_ADMOB_\w+.*undefined|VITE_ADMOB_\w+.*null/gi,
        severity: 'high',
        category: 'configuration',
        description: 'AdMob 環境變數未正確設置',
        autoFixable: true,
        fix: '檢查 .env.local 文件並確保所有 VITE_ADMOB_ 變數已設置',
      },
      {
        name: 'AdMob 腳本載入錯誤',
        pattern:
          /adsbygoogle.*failed|googlesyndication.*error|AdMob.*script.*load/gi,
        severity: 'high',
        category: 'network',
        description: 'AdMob 腳本載入失敗',
        autoFixable: false,
        fix: '檢查網絡連接和 AdMob 應用程式 ID 是否正確',
      },
      {
        name: '廣告單元 ID 格式錯誤',
        pattern: /ca-app-pub-\d+~?\d+.*invalid|ad.*unit.*id.*format/gi,
        severity: 'high',
        category: 'configuration',
        description: 'AdMob 廣告單元 ID 格式不正確',
        autoFixable: true,
        fix: '檢查廣告單元 ID 格式是否為 ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY',
      },
      {
        name: 'CORS 錯誤',
        pattern:
          /CORS.*error|cross-origin.*blocked|Access-Control-Allow-Origin/gi,
        severity: 'medium',
        category: 'network',
        description: '跨域資源共享錯誤',
        autoFixable: false,
        fix: '檢查服務器 CORS 設置和 AdMob 腳本載入方式',
      },
      {
        name: 'React 組件錯誤',
        pattern: /React.*error|component.*error|props.*error/gi,
        severity: 'medium',
        category: 'component',
        description: 'React 組件相關錯誤',
        autoFixable: true,
        fix: '檢查組件 props 和狀態管理',
      },
      {
        name: '性能錯誤',
        pattern: /performance.*warning|memory.*leak|slow.*render/gi,
        severity: 'low',
        category: 'performance',
        description: '性能相關警告',
        autoFixable: true,
        fix: '優化組件渲染和記憶體使用',
      },
    ];

    this.analysisResults.patterns = patterns;
    return patterns;
  }

  // 掃描日誌文件中的錯誤
  async scanLogFiles() {
    console.log(`${colors.cyan}📋 掃描日誌文件...${colors.reset}`);

    const logFiles = [
      'test-results.json',
      'performance-monitor-report.json',
      'comprehensive-test-report.json',
    ];

    const errors = [];

    logFiles.forEach(logFile => {
      if (fs.existsSync(logFile)) {
        try {
          const content = fs.readFileSync(logFile, 'utf8');
          const data = JSON.parse(content);

          // 提取錯誤信息
          if (data.errors) {
            data.errors.forEach(error => {
              errors.push({
                file: logFile,
                error: error.error || error.message,
                context: error.context || error.suite || 'unknown',
                timestamp: error.timestamp || new Date().toISOString(),
                severity: this.determineSeverity(error.error || error.message),
              });
            });
          }
        } catch (parseError) {
          console.log(
            `${colors.yellow}⚠️ 無法解析 ${logFile}: ${parseError.message}${colors.reset}`
          );
        }
      }
    });

    return errors;
  }

  // 分析代碼中的潛在錯誤
  async analyzeCodeErrors() {
    console.log(`${colors.cyan}💻 分析代碼中的潛在錯誤...${colors.reset}`);

    const codeFiles = [
      'src/config/adConfig.js',
      'src/components/AdBanner.jsx',
      'src/components/AdMobConfigDebug.jsx',
      'scripts/browser-test.js',
    ];

    const codeErrors = [];

    codeFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          const lineNumber = index + 1;

          // 檢查常見錯誤模式
          if (line.includes('console.log') && !line.includes('// 測試')) {
            codeErrors.push({
              file,
              line: lineNumber,
              type: 'console-log',
              severity: 'low',
              description: '生產環境中的 console.log',
              suggestion: '移除或使用條件日誌',
            });
          }

          if (line.includes('debugger')) {
            codeErrors.push({
              file,
              line: lineNumber,
              type: 'debugger',
              severity: 'medium',
              description: '代碼中包含 debugger 語句',
              suggestion: '移除 debugger 語句',
            });
          }

          if (line.includes('TODO') || line.includes('FIXME')) {
            codeErrors.push({
              file,
              line: lineNumber,
              type: 'todo',
              severity: 'low',
              description: '未完成的代碼標記',
              suggestion: '完成 TODO 或 FIXME 項目',
            });
          }

          if (line.includes('catch') && !line.includes('error')) {
            codeErrors.push({
              file,
              line: lineNumber,
              type: 'error-handling',
              severity: 'medium',
              description: '錯誤處理不完整',
              suggestion: '在 catch 塊中處理錯誤',
            });
          }

          if (
            line.includes('import') &&
            line.includes('..') &&
            line.includes('..')
          ) {
            codeErrors.push({
              file,
              line: lineNumber,
              type: 'import-path',
              severity: 'low',
              description: '複雜的相對導入路徑',
              suggestion: '考慮使用絕對路徑或別名',
            });
          }
        });
      }
    });

    return codeErrors;
  }

  // 提供自動修復建議
  generateAutoFixSuggestions(errors, codeErrors) {
    console.log(`${colors.cyan}🔧 生成自動修復建議...${colors.reset}`);

    const autoFixes = [];

    // 環境變數錯誤修復
    const envErrors = errors.filter(
      e => e.error && e.error.includes('VITE_ADMOB_')
    );
    if (envErrors.length > 0) {
      autoFixes.push({
        type: 'environment-variables',
        priority: 'high',
        description: '修復 AdMob 環境變數配置',
        action: 'create-env-file',
        details: {
          file: '.env.local',
          content: `# AdMob 環境變數配置
VITE_ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
VITE_ADMOB_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
VITE_ADMOB_ENABLED=true
VITE_ADMOB_TEST_MODE=false`,
        },
      });
    }

    // 代碼錯誤修復
    const consoleLogErrors = codeErrors.filter(e => e.type === 'console-log');
    if (consoleLogErrors.length > 0) {
      autoFixes.push({
        type: 'remove-console-logs',
        priority: 'medium',
        description: '移除生產環境中的 console.log',
        action: 'remove-console-logs',
        details: {
          files: [...new Set(consoleLogErrors.map(e => e.file))],
          count: consoleLogErrors.length,
        },
      });
    }

    const debuggerErrors = codeErrors.filter(e => e.type === 'debugger');
    if (debuggerErrors.length > 0) {
      autoFixes.push({
        type: 'remove-debugger',
        priority: 'high',
        description: '移除 debugger 語句',
        action: 'remove-debugger',
        details: {
          files: [...new Set(debuggerErrors.map(e => e.file))],
          count: debuggerErrors.length,
        },
      });
    }

    // AdMob 配置錯誤修復
    const admobConfigErrors = errors.filter(
      e =>
        e.error && (e.error.includes('adConfig') || e.error.includes('AdMob'))
    );
    if (admobConfigErrors.length > 0) {
      autoFixes.push({
        type: 'admob-config',
        priority: 'high',
        description: '修復 AdMob 配置問題',
        action: 'fix-admob-config',
        details: {
          issues: admobConfigErrors.map(e => e.error),
          solution: '檢查 adConfig.js 中的 AdMob 配置',
        },
      });
    }

    this.analysisResults.autoFixes = autoFixes;
    return autoFixes;
  }

  // 生成錯誤統計報告
  generateErrorStatistics(errors, codeErrors) {
    console.log(`${colors.cyan}📊 生成錯誤統計報告...${colors.reset}`);

    // 統計錯誤類型
    const errorTypes = {};
    errors.forEach(error => {
      const type = error.context || 'unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });

    // 統計嚴重程度
    const severity = { high: 0, medium: 0, low: 0 };
    [...errors, ...codeErrors].forEach(error => {
      const sev = error.severity || 'low';
      severity[sev] = (severity[sev] || 0) + 1;
    });

    // 統計自動修復可能性
    const autoFixable = codeErrors.filter(e =>
      ['console-log', 'debugger', 'todo'].includes(e.type)
    ).length;

    const stats = {
      totalErrors: errors.length + codeErrors.length,
      logErrors: errors.length,
      codeErrors: codeErrors.length,
      errorTypes,
      severity,
      autoFixable,
      manualFix: errors.length + codeErrors.length - autoFixable,
      mostCommonError: this.getMostCommonError(errorTypes),
      criticalIssues: severity.high,
    };

    this.errorStats = stats;
    return stats;
  }

  // 創建故障排除指南
  createTroubleshootingGuide() {
    console.log(`${colors.cyan}📖 創建故障排除指南...${colors.reset}`);

    const guide = [
      {
        category: '環境變數問題',
        symptoms: ['VITE_ADMOB_ 變數未定義', '環境變數載入失敗'],
        causes: [
          '.env.local 文件不存在',
          '環境變數名稱錯誤',
          '開發服務器未重啟',
        ],
        solutions: [
          '檢查 .env.local 文件是否存在',
          '確認環境變數名稱以 VITE_ 開頭',
          '重新啟動開發服務器',
          '檢查變數值是否正確',
        ],
        prevention: [
          '使用環境變數模板',
          '在 README 中記錄必要的環境變數',
          '使用 TypeScript 類型檢查',
        ],
      },
      {
        category: 'AdMob 腳本載入問題',
        symptoms: ['adsbygoogle 腳本載入失敗', '廣告不顯示', '網絡錯誤'],
        causes: ['網絡連接問題', 'AdMob 應用程式 ID 錯誤', 'CORS 限制'],
        solutions: [
          '檢查網絡連接',
          '驗證 AdMob 應用程式 ID 格式',
          '檢查瀏覽器控制台錯誤',
          '確認 AdMob 帳戶狀態',
        ],
        prevention: ['使用錯誤處理機制', '添加重試邏輯', '監控腳本載入狀態'],
      },
      {
        category: 'React 組件錯誤',
        symptoms: ['組件渲染失敗', 'Props 錯誤', '狀態更新問題'],
        causes: ['Props 類型錯誤', '狀態管理問題', '生命週期錯誤'],
        solutions: [
          '檢查 Props 類型定義',
          '使用 PropTypes 或 TypeScript',
          '檢查組件狀態更新邏輯',
          '添加錯誤邊界',
        ],
        prevention: [
          '使用 TypeScript',
          '添加 PropTypes 驗證',
          '實現錯誤邊界',
          '編寫單元測試',
        ],
      },
      {
        category: '性能問題',
        symptoms: ['頁面載入慢', '廣告載入延遲', '記憶體洩漏'],
        causes: ['文件過大', '未優化的代碼', '過多的重新渲染'],
        solutions: [
          '使用代碼分割',
          '優化組件渲染',
          '添加性能監控',
          '使用懶加載',
        ],
        prevention: [
          '定期性能監控',
          '使用性能分析工具',
          '優化圖片和資源',
          '實現緩存策略',
        ],
      },
    ];

    this.analysisResults.troubleshootingGuide = guide;
    return guide;
  }

  // 輔助方法
  determineSeverity(errorMessage) {
    const highSeverityPatterns = [
      /VITE_ADMOB_.*undefined/gi,
      /adsbygoogle.*failed/gi,
      /ca-app-pub.*invalid/gi,
      /CORS.*error/gi,
    ];

    const mediumSeverityPatterns = [
      /React.*error/gi,
      /component.*error/gi,
      /props.*error/gi,
      /debugger/gi,
    ];

    if (highSeverityPatterns.some(pattern => pattern.test(errorMessage))) {
      return 'high';
    } else if (
      mediumSeverityPatterns.some(pattern => pattern.test(errorMessage))
    ) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  getMostCommonError(errorTypes) {
    const entries = Object.entries(errorTypes);
    if (entries.length === 0) return null;

    return entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    )[0];
  }

  // 生成完整報告
  generateReport() {
    const totalTime = Date.now() - this.analysisResults.startTime;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTime: `${totalTime}ms`,
        totalErrors: this.errorStats.totalErrors,
        autoFixable: this.errorStats.autoFixable,
        manualFix: this.errorStats.manualFix,
        criticalIssues: this.errorStats.criticalIssues,
        mostCommonError: this.errorStats.mostCommonError,
      },
      statistics: this.errorStats,
      patterns: this.analysisResults.patterns,
      autoFixes: this.analysisResults.autoFixes,
      troubleshootingGuide: this.analysisResults.troubleshootingGuide,
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.errorStats.criticalIssues > 0) {
      recommendations.push({
        priority: 'high',
        category: 'critical',
        description: `發現 ${this.errorStats.criticalIssues} 個高優先級問題`,
        action: '立即修復所有高優先級錯誤',
      });
    }

    if (this.errorStats.autoFixable > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'automation',
        description: `${this.errorStats.autoFixable} 個錯誤可以自動修復`,
        action: '運行自動修復腳本',
      });
    }

    if (this.errorStats.manualFix > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'manual',
        description: `${this.errorStats.manualFix} 個錯誤需要手動修復`,
        action: '參考故障排除指南進行修復',
      });
    }

    return recommendations;
  }
}

// 運行錯誤分析
async function runErrorAnalysis() {
  try {
    console.log(`${colors.bright}🚀 開始錯誤分析...${colors.reset}\n`);

    const analyzer = new ErrorAnalyzer();

    // 執行分析
    await analyzer.analyzeErrorPatterns();
    const logErrors = await analyzer.scanLogFiles();
    const codeErrors = await analyzer.analyzeCodeErrors();
    analyzer.generateAutoFixSuggestions(logErrors, codeErrors);
    analyzer.generateErrorStatistics(logErrors, codeErrors);
    analyzer.createTroubleshootingGuide();

    // 顯示結果
    console.log(
      `\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`
    );
    console.log(`${colors.bright}🔍 錯誤分析報告${colors.reset}`);
    console.log(
      `${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`
    );

    // 錯誤統計
    console.log(`\n${colors.bright}📊 錯誤統計:${colors.reset}`);
    console.log(
      `${colors.blue}總錯誤數: ${analyzer.errorStats.totalErrors}${colors.reset}`
    );
    console.log(
      `${colors.red}高優先級: ${analyzer.errorStats.criticalIssues}${colors.reset}`
    );
    console.log(
      `${colors.green}可自動修復: ${analyzer.errorStats.autoFixable}${colors.reset}`
    );
    console.log(
      `${colors.yellow}需手動修復: ${analyzer.errorStats.manualFix}${colors.reset}`
    );

    // 錯誤類型分布
    if (Object.keys(analyzer.errorStats.errorTypes).length > 0) {
      console.log(`\n${colors.bright}📋 錯誤類型分布:${colors.reset}`);
      Object.entries(analyzer.errorStats.errorTypes).forEach(
        ([type, count]) => {
          console.log(`${colors.blue}${type}: ${count}${colors.reset}`);
        }
      );
    }

    // 自動修復建議
    if (analyzer.analysisResults.autoFixes.length > 0) {
      console.log(`\n${colors.bright}🔧 自動修復建議:${colors.reset}`);
      analyzer.analysisResults.autoFixes.forEach((fix, index) => {
        const priority =
          fix.priority === 'high'
            ? `${colors.red}🔴`
            : fix.priority === 'medium'
            ? `${colors.yellow}🟡`
            : `${colors.green}🟢`;
        console.log(
          `${priority} ${index + 1}. ${fix.description}${colors.reset}`
        );
        console.log(`${colors.blue}   行動: ${fix.action}${colors.reset}\n`);
      });
    }

    // 故障排除指南
    if (analyzer.analysisResults.troubleshootingGuide.length > 0) {
      console.log(`\n${colors.bright}📖 故障排除指南:${colors.reset}`);
      analyzer.analysisResults.troubleshootingGuide.forEach((guide, index) => {
        console.log(
          `${colors.cyan}${index + 1}. ${guide.category}${colors.reset}`
        );
        console.log(
          `${colors.blue}   症狀: ${guide.symptoms.join(', ')}${colors.reset}`
        );
        console.log(
          `${colors.blue}   解決方案: ${guide.solutions
            .slice(0, 2)
            .join(', ')}...${colors.reset}\n`
        );
      });
    }

    // 保存報告
    const report = analyzer.generateReport();
    fs.writeFileSync(
      'error-analysis-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log(
      `${colors.green}📄 錯誤分析報告已保存到 error-analysis-report.json${colors.reset}`
    );

    // 最終評估
    if (analyzer.errorStats.criticalIssues > 0) {
      console.log(
        `\n${colors.red}⚠️ 發現 ${analyzer.errorStats.criticalIssues} 個高優先級問題，建議立即修復${colors.reset}`
      );
    } else if (analyzer.errorStats.totalErrors > 0) {
      console.log(
        `\n${colors.yellow}⚠️ 發現 ${analyzer.errorStats.totalErrors} 個問題，建議修復${colors.reset}`
      );
    } else {
      console.log(
        `\n${colors.green}🎉 未發現錯誤！系統運行正常${colors.reset}`
      );
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ 錯誤分析失敗: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }
}

// 啟動錯誤分析
runErrorAnalysis();
