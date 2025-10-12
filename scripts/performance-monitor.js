// AdMob 性能監控系統
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('⚡ AdMob 性能監控系統啟動...\n');

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

// 性能監控器類
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      fileSizes: {},
      loadTimes: {},
      optimization: {},
      recommendations: [],
      warnings: [],
      bottlenecks: [],
    };
  }

  // 監控文件大小
  async monitorFileSizes() {
    console.log(`${colors.cyan}📊 監控文件大小...${colors.reset}`);

    const distPath = 'dist';
    if (!fs.existsSync(distPath)) {
      throw new Error('dist 目錄不存在，請先運行 npm run build');
    }

    const fileSizes = {};

    // 檢查主要文件
    const mainFiles = ['index.html', 'manifest.json', 'sw.js'];
    mainFiles.forEach(file => {
      const filePath = path.join(distPath, file);
      if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        fileSizes[file] = {
          size: size,
          sizeKB: (size / 1024).toFixed(2) + ' KB',
          status: this.getSizeStatus(size, file),
          recommendation: this.getSizeRecommendation(size, file),
        };
      }
    });

    // 檢查 assets 目錄
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      const files = fs.readdirSync(assetsPath);
      let totalAssetsSize = 0;
      const largeFiles = [];
      const fileBreakdown = {};

      files.forEach(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        totalAssetsSize += stats.size;

        const fileType = path.extname(file);
        if (!fileBreakdown[fileType]) {
          fileBreakdown[fileType] = { count: 0, size: 0 };
        }
        fileBreakdown[fileType].count++;
        fileBreakdown[fileType].size += stats.size;

        if (stats.size > 500 * 1024) {
          // 500KB
          largeFiles.push({
            name: file,
            size: (stats.size / 1024).toFixed(2) + ' KB',
            type: fileType,
          });
        }
      });

      fileSizes.assets = {
        totalSize: totalAssetsSize,
        totalSizeMB: (totalAssetsSize / 1024 / 1024).toFixed(2) + ' MB',
        fileCount: files.length,
        largeFiles: largeFiles,
        fileBreakdown: fileBreakdown,
        status: this.getSizeStatus(totalAssetsSize, 'assets'),
        recommendation: this.getSizeRecommendation(totalAssetsSize, 'assets'),
      };
    }

    this.metrics.fileSizes = fileSizes;
    return fileSizes;
  }

  // 監控 AdMob 廣告載入性能
  async monitorAdMobPerformance() {
    console.log(`${colors.cyan}🎯 監控 AdMob 廣告載入性能...${colors.reset}`);

    const distPath = 'dist';
    const assetsPath = path.join(distPath, 'assets');

    if (!fs.existsSync(assetsPath)) {
      throw new Error('assets 目錄不存在');
    }

    const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'));
    let admobConfigSize = 0;
    let admobScriptsFound = 0;
    const admobFiles = [];

    jsFiles.forEach(jsFile => {
      const jsPath = path.join(assetsPath, jsFile);
      const jsContent = fs.readFileSync(jsPath, 'utf8');

      if (jsContent.includes('ca-app-pub-') || jsContent.includes('admob')) {
        const fileSize = fs.statSync(jsPath).size;
        admobConfigSize += fileSize;
        admobScriptsFound++;

        admobFiles.push({
          name: jsFile,
          size: (fileSize / 1024).toFixed(2) + ' KB',
          lines: jsContent.split('\n').length,
          functions: (jsContent.match(/function|const\s+\w+\s*=/g) || [])
            .length,
        });
      }
    });

    const admobPerformance = {
      admobConfigSize: admobConfigSize,
      admobConfigSizeKB: (admobConfigSize / 1024).toFixed(2) + ' KB',
      admobScriptsFound: admobScriptsFound,
      admobFiles: admobFiles,
      status: this.getAdMobPerformanceStatus(admobConfigSize),
      recommendation: this.getAdMobPerformanceRecommendation(admobConfigSize),
    };

    this.metrics.adMobPerformance = admobPerformance;
    return admobPerformance;
  }

  // 測量用戶體驗指標
  async measureUserExperienceMetrics() {
    console.log(`${colors.cyan}👤 測量用戶體驗指標...${colors.reset}`);

    const distPath = 'dist';
    const indexHtmlPath = path.join(distPath, 'index.html');

    if (!fs.existsSync(indexHtmlPath)) {
      throw new Error('index.html 不存在');
    }

    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

    // 分析 HTML 結構
    const htmlAnalysis = {
      totalSize: htmlContent.length,
      totalSizeKB: (htmlContent.length / 1024).toFixed(2) + ' KB',
      scriptTags: (htmlContent.match(/<script[^>]*>/g) || []).length,
      linkTags: (htmlContent.match(/<link[^>]*>/g) || []).length,
      imgTags: (htmlContent.match(/<img[^>]*>/g) || []).length,
      inlineStyles: (htmlContent.match(/<style[^>]*>/g) || []).length,
      inlineScripts: (
        htmlContent.match(/<script[^>]*>[\s\S]*?<\/script>/g) || []
      ).length,
    };

    // 檢查關鍵渲染路徑
    const criticalPathAnalysis = {
      hasPreload: htmlContent.includes('rel="preload"'),
      hasPreconnect: htmlContent.includes('rel="preconnect"'),
      hasAsyncScripts: (htmlContent.match(/<script[^>]*async[^>]*>/g) || [])
        .length,
      hasDeferScripts: (htmlContent.match(/<script[^>]*defer[^>]*>/g) || [])
        .length,
      hasCriticalCSS:
        htmlContent.includes('critical') ||
        htmlContent.includes('above-the-fold'),
    };

    // 檢查 AdMob 相關優化
    const admobOptimization = {
      hasAdMobPreload:
        htmlContent.includes('adsbygoogle') && htmlContent.includes('preload'),
      hasAdMobAsync:
        htmlContent.includes('adsbygoogle') && htmlContent.includes('async'),
      hasAdMobDefer:
        htmlContent.includes('adsbygoogle') && htmlContent.includes('defer'),
      adMobScriptCount: (
        htmlContent.match(/adsbygoogle|googlesyndication/g) || []
      ).length,
    };

    const uxMetrics = {
      htmlAnalysis,
      criticalPathAnalysis,
      admobOptimization,
      score: this.calculateUXScore(
        htmlAnalysis,
        criticalPathAnalysis,
        admobOptimization
      ),
      recommendations: this.getUXRecommendations(
        htmlAnalysis,
        criticalPathAnalysis,
        admobOptimization
      ),
    };

    this.metrics.userExperience = uxMetrics;
    return uxMetrics;
  }

  // 檢測性能瓶頸
  async detectPerformanceBottlenecks() {
    console.log(`${colors.cyan}🔍 檢測性能瓶頸...${colors.reset}`);

    const bottlenecks = [];

    // 檢查文件大小瓶頸
    if (this.metrics.fileSizes.assets?.totalSize > 2 * 1024 * 1024) {
      // 2MB
      bottlenecks.push({
        type: 'file-size',
        severity: 'high',
        description: 'assets 目錄過大',
        impact: '影響頁面載入速度',
        solution: '使用代碼分割和懶加載',
        files: this.metrics.fileSizes.assets?.largeFiles || [],
      });
    }

    // 檢查 AdMob 性能瓶頸
    if (this.metrics.adMobPerformance?.admobConfigSize > 200 * 1024) {
      // 200KB
      bottlenecks.push({
        type: 'admob-performance',
        severity: 'medium',
        description: 'AdMob 配置過大',
        impact: '影響廣告載入速度',
        solution: '優化 AdMob 配置或使用延遲載入',
        size: this.metrics.adMobPerformance?.admobConfigSizeKB,
      });
    }

    // 檢查 HTML 瓶頸
    if (this.metrics.userExperience?.htmlAnalysis?.totalSize > 50 * 1024) {
      // 50KB
      bottlenecks.push({
        type: 'html-size',
        severity: 'medium',
        description: 'HTML 文件過大',
        impact: '影響首次內容繪製',
        solution: '移除不必要的內聯樣式和腳本',
        size: this.metrics.userExperience?.htmlAnalysis?.totalSizeKB,
      });
    }

    // 檢查關鍵渲染路徑瓶頸
    const criticalPath = this.metrics.userExperience?.criticalPathAnalysis;
    if (
      criticalPath &&
      !criticalPath.hasPreload &&
      !criticalPath.hasPreconnect
    ) {
      bottlenecks.push({
        type: 'critical-path',
        severity: 'high',
        description: '缺少關鍵渲染路徑優化',
        impact: '影響頁面載入性能',
        solution: '添加 preload 和 preconnect 標籤',
      });
    }

    this.metrics.bottlenecks = bottlenecks;
    return bottlenecks;
  }

  // 生成優化建議
  generateOptimizationRecommendations() {
    console.log(`${colors.cyan}💡 生成優化建議...${colors.reset}`);

    const recommendations = [];

    // 基於文件大小的建議
    Object.entries(this.metrics.fileSizes).forEach(([file, info]) => {
      if (info.recommendation) {
        recommendations.push({
          category: 'file-size',
          priority: info.status === 'warning' ? 'high' : 'medium',
          file: file,
          currentSize: info.sizeKB || info.totalSizeMB,
          recommendation: info.recommendation,
        });
      }
    });

    // 基於 AdMob 性能的建議
    if (this.metrics.adMobPerformance?.recommendation) {
      recommendations.push({
        category: 'admob-performance',
        priority:
          this.metrics.adMobPerformance.status === 'warning'
            ? 'high'
            : 'medium',
        recommendation: this.metrics.adMobPerformance.recommendation,
      });
    }

    // 基於用戶體驗的建議
    if (this.metrics.userExperience?.recommendations) {
      this.metrics.userExperience.recommendations.forEach(rec => {
        recommendations.push({
          category: 'user-experience',
          priority: rec.priority || 'medium',
          recommendation: rec.description,
          action: rec.action,
        });
      });
    }

    // 基於瓶頸的建議
    this.metrics.bottlenecks.forEach(bottleneck => {
      recommendations.push({
        category: 'bottleneck',
        priority: bottleneck.severity === 'high' ? 'high' : 'medium',
        recommendation: bottleneck.solution,
        impact: bottleneck.impact,
      });
    });

    this.metrics.recommendations = recommendations;
    return recommendations;
  }

  // 輔助方法
  getSizeStatus(size, fileType) {
    const thresholds = {
      'index.html': 50 * 1024, // 50KB
      'manifest.json': 10 * 1024, // 10KB
      'sw.js': 20 * 1024, // 20KB
      assets: 2 * 1024 * 1024, // 2MB
    };

    return size > (thresholds[fileType] || 100 * 1024) ? 'warning' : 'good';
  }

  getSizeRecommendation(size, fileType) {
    if (this.getSizeStatus(size, fileType) === 'warning') {
      const recommendations = {
        'index.html': '考慮移除不必要的內聯樣式和腳本',
        'manifest.json': '檢查是否有不必要的配置項',
        'sw.js': '優化 Service Worker 代碼',
        assets: '使用代碼分割和懶加載',
      };
      return recommendations[fileType] || '考慮壓縮和優化文件';
    }
    return null;
  }

  getAdMobPerformanceStatus(size) {
    return size > 200 * 1024 ? 'warning' : 'good';
  }

  getAdMobPerformanceRecommendation(size) {
    if (size > 200 * 1024) {
      return '考慮使用更小的 AdMob 配置或延遲載入廣告腳本';
    }
    return null;
  }

  calculateUXScore(htmlAnalysis, criticalPathAnalysis, admobOptimization) {
    let score = 100;

    // HTML 大小扣分
    if (htmlAnalysis.totalSize > 50 * 1024) score -= 20;
    if (htmlAnalysis.totalSize > 100 * 1024) score -= 30;

    // 關鍵渲染路徑扣分
    if (!criticalPathAnalysis.hasPreload) score -= 15;
    if (!criticalPathAnalysis.hasPreconnect) score -= 10;
    if (criticalPathAnalysis.inlineStyles > 3) score -= 10;

    // AdMob 優化加分/扣分
    if (admobOptimization.hasAdMobPreload) score += 5;
    if (admobOptimization.hasAdMobAsync) score += 5;
    if (admobOptimization.adMobScriptCount > 3) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  getUXRecommendations(htmlAnalysis, criticalPathAnalysis, admobOptimization) {
    const recommendations = [];

    if (htmlAnalysis.totalSize > 50 * 1024) {
      recommendations.push({
        priority: 'high',
        description: 'HTML 文件過大',
        action: '移除不必要的內聯樣式和腳本',
      });
    }

    if (!criticalPathAnalysis.hasPreload) {
      recommendations.push({
        priority: 'medium',
        description: '缺少資源預載入',
        action: '添加 preload 標籤優化關鍵資源載入',
      });
    }

    if (!criticalPathAnalysis.hasPreconnect) {
      recommendations.push({
        priority: 'medium',
        description: '缺少 DNS 預連接',
        action: '添加 preconnect 標籤優化第三方資源載入',
      });
    }

    if (
      admobOptimization.adMobScriptCount > 0 &&
      !admobOptimization.hasAdMobAsync
    ) {
      recommendations.push({
        priority: 'medium',
        description: 'AdMob 腳本未使用異步載入',
        action: '為 AdMob 腳本添加 async 屬性',
      });
    }

    return recommendations;
  }

  // 生成性能報告
  generateReport() {
    const totalTime = Date.now() - this.metrics.startTime;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTime: `${totalTime}ms`,
        fileSizes: Object.keys(this.metrics.fileSizes).length,
        bottlenecks: this.metrics.bottlenecks.length,
        recommendations: this.metrics.recommendations.length,
        warnings: this.metrics.warnings.length,
      },
      metrics: this.metrics,
      performance: {
        fileSizes: this.metrics.fileSizes,
        admobPerformance: this.metrics.adMobPerformance,
        userExperience: this.metrics.userExperience,
        bottlenecks: this.metrics.bottlenecks,
        recommendations: this.metrics.recommendations,
      },
    };

    return report;
  }
}

// 運行性能監控
async function runPerformanceMonitoring() {
  try {
    console.log(`${colors.bright}🚀 開始性能監控...${colors.reset}\n`);

    const monitor = new PerformanceMonitor();

    // 執行所有監控
    await monitor.monitorFileSizes();
    await monitor.monitorAdMobPerformance();
    await monitor.measureUserExperienceMetrics();
    await monitor.detectPerformanceBottlenecks();
    monitor.generateOptimizationRecommendations();

    // 顯示結果
    console.log(
      `\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`
    );
    console.log(`${colors.bright}⚡ 性能監控報告${colors.reset}`);
    console.log(
      `${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`
    );

    // 文件大小報告
    console.log(`\n${colors.bright}📊 文件大小分析:${colors.reset}`);
    Object.entries(monitor.metrics.fileSizes).forEach(([file, info]) => {
      const status =
        info.status === 'good' ? `${colors.green}✅` : `${colors.yellow}⚠️`;
      console.log(
        `${status} ${file}: ${info.sizeKB || info.totalSizeMB}${colors.reset}`
      );
      if (info.recommendation) {
        console.log(
          `${colors.blue}   建議: ${info.recommendation}${colors.reset}`
        );
      }
    });

    // AdMob 性能報告
    if (monitor.metrics.adMobPerformance) {
      console.log(`\n${colors.bright}🎯 AdMob 性能分析:${colors.reset}`);
      const admob = monitor.metrics.adMobPerformance;
      const status =
        admob.status === 'good' ? `${colors.green}✅` : `${colors.yellow}⚠️`;
      console.log(
        `${status} 配置大小: ${admob.admobConfigSizeKB}${colors.reset}`
      );
      console.log(
        `${colors.blue}腳本數量: ${admob.admobScriptsFound}${colors.reset}`
      );
      if (admob.recommendation) {
        console.log(
          `${colors.blue}建議: ${admob.recommendation}${colors.reset}`
        );
      }
    }

    // 用戶體驗報告
    if (monitor.metrics.userExperience) {
      console.log(`\n${colors.bright}👤 用戶體驗分析:${colors.reset}`);
      const ux = monitor.metrics.userExperience;
      console.log(`${colors.blue}UX 分數: ${ux.score}/100${colors.reset}`);
      console.log(
        `${colors.blue}HTML 大小: ${ux.htmlAnalysis.totalSizeKB}${colors.reset}`
      );
      console.log(
        `${colors.blue}腳本數量: ${ux.htmlAnalysis.scriptTags}${colors.reset}`
      );
      console.log(
        `${colors.blue}圖片數量: ${ux.htmlAnalysis.imgTags}${colors.reset}`
      );
    }

    // 瓶頸分析
    if (monitor.metrics.bottlenecks.length > 0) {
      console.log(`\n${colors.bright}🔍 性能瓶頸:${colors.reset}`);
      monitor.metrics.bottlenecks.forEach((bottleneck, index) => {
        const severity =
          bottleneck.severity === 'high'
            ? `${colors.red}🔴`
            : `${colors.yellow}🟡`;
        console.log(
          `${severity} ${index + 1}. ${bottleneck.description}${colors.reset}`
        );
        console.log(
          `${colors.blue}   影響: ${bottleneck.impact}${colors.reset}`
        );
        console.log(
          `${colors.blue}   解決方案: ${bottleneck.solution}${colors.reset}\n`
        );
      });
    }

    // 優化建議
    if (monitor.metrics.recommendations.length > 0) {
      console.log(`\n${colors.bright}💡 優化建議:${colors.reset}`);
      monitor.metrics.recommendations.forEach((rec, index) => {
        const priority =
          rec.priority === 'high'
            ? `${colors.red}🔴`
            : rec.priority === 'medium'
            ? `${colors.yellow}🟡`
            : `${colors.green}🟢`;
        console.log(
          `${priority} ${index + 1}. ${rec.recommendation}${colors.reset}`
        );
        if (rec.action) {
          console.log(`${colors.blue}   行動: ${rec.action}${colors.reset}`);
        }
        console.log('');
      });
    }

    // 保存報告
    const report = monitor.generateReport();
    fs.writeFileSync(
      'performance-monitor-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log(
      `${colors.green}📄 性能監控報告已保存到 performance-monitor-report.json${colors.reset}`
    );

    // 最終評估
    const hasHighPriorityIssues = monitor.metrics.bottlenecks.some(
      b => b.severity === 'high'
    );
    const hasWarnings = monitor.metrics.warnings.length > 0;

    if (hasHighPriorityIssues) {
      console.log(
        `\n${colors.red}⚠️ 發現高優先級性能問題，建議立即修復${colors.reset}`
      );
    } else if (hasWarnings) {
      console.log(`\n${colors.yellow}⚠️ 發現性能警告，建議優化${colors.reset}`);
    } else {
      console.log(
        `\n${colors.green}🎉 性能監控通過！AdMob 整合性能良好${colors.reset}`
      );
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ 性能監控失敗: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }
}

// 啟動性能監控
runPerformanceMonitoring();
