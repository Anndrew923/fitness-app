// AdMob 實時監控系統
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('📊 AdMob 實時監控系統啟動...\n');

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

// 監控器類
class AdMobMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      admobEarnings: 0,
      adLoadSuccess: 0,
      adLoadFailure: 0,
      userExperience: {},
      performance: {},
      errors: [],
      alerts: [],
    };
    this.isRunning = false;
    this.intervalId = null;
    this.alertThresholds = {
      earnings: 0, // 收益閾值
      adLoadRate: 0.8, // 廣告載入成功率閾值
      errorCount: 5, // 錯誤數量閾值
      responseTime: 3000, // 響應時間閾值 (ms)
    };
  }

  // 開始監控
  start(interval = 30000) {
    // 默認 30 秒間隔
    if (this.isRunning) {
      console.log(`${colors.yellow}⚠️ 監控已在運行中${colors.reset}`);
      return;
    }

    this.isRunning = true;
    console.log(
      `${colors.green}🚀 開始實時監控 (間隔: ${interval}ms)${colors.reset}`
    );

    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, interval);

    // 立即執行一次
    this.collectMetrics();
  }

  // 停止監控
  stop() {
    if (!this.isRunning) {
      console.log(`${colors.yellow}⚠️ 監控未在運行${colors.reset}`);
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log(`${colors.green}⏹️ 監控已停止${colors.reset}`);
  }

  // 收集指標
  async collectMetrics() {
    try {
      console.log(`${colors.cyan}📊 收集監控指標...${colors.reset}`);

      await this.monitorAdMobEarnings();
      await this.monitorAdLoadSuccess();
      await this.monitorUserExperience();
      await this.monitorPerformance();
      await this.monitorErrors();

      this.checkAlerts();
      this.displayMetrics();
    } catch (error) {
      console.log(
        `${colors.red}❌ 收集指標失敗: ${error.message}${colors.reset}`
      );
      this.metrics.errors.push({
        timestamp: new Date().toISOString(),
        type: 'metric_collection',
        message: error.message,
      });
    }
  }

  // 監控 AdMob 收益
  async monitorAdMobEarnings() {
    // 這裡應該連接到 AdMob API 獲取實際收益數據
    // 目前使用模擬數據
    const mockEarnings = Math.random() * 10; // 模擬收益
    this.metrics.admobEarnings += mockEarnings;

    console.log(
      `${colors.blue}💰 AdMob 收益: $${this.metrics.admobEarnings.toFixed(2)}${
        colors.reset
      }`
    );
  }

  // 監控廣告載入成功率
  async monitorAdLoadSuccess() {
    // 模擬廣告載入測試
    const successRate = Math.random();
    const isSuccess = successRate > 0.2; // 80% 成功率

    if (isSuccess) {
      this.metrics.adLoadSuccess++;
      console.log(`${colors.green}✅ 廣告載入成功${colors.reset}`);
    } else {
      this.metrics.adLoadFailure++;
      console.log(`${colors.red}❌ 廣告載入失敗${colors.reset}`);
    }

    const totalAttempts =
      this.metrics.adLoadSuccess + this.metrics.adLoadFailure;
    const successRatePercent =
      totalAttempts > 0
        ? ((this.metrics.adLoadSuccess / totalAttempts) * 100).toFixed(1)
        : 0;

    console.log(
      `${colors.blue}📈 廣告載入成功率: ${successRatePercent}%${colors.reset}`
    );
  }

  // 監控用戶體驗指標
  async monitorUserExperience() {
    const uxMetrics = {
      pageLoadTime: Math.random() * 2000 + 500, // 500-2500ms
      adRenderTime: Math.random() * 1000 + 200, // 200-1200ms
      userInteraction: Math.random() > 0.3, // 70% 用戶互動
      bounceRate: Math.random() * 0.3, // 0-30% 跳出率
    };

    this.metrics.userExperience = uxMetrics;

    console.log(`${colors.blue}👤 用戶體驗指標:${colors.reset}`);
    console.log(
      `${colors.blue}  頁面載入時間: ${uxMetrics.pageLoadTime.toFixed(0)}ms${
        colors.reset
      }`
    );
    console.log(
      `${colors.blue}  廣告渲染時間: ${uxMetrics.adRenderTime.toFixed(0)}ms${
        colors.reset
      }`
    );
    console.log(
      `${colors.blue}  用戶互動: ${uxMetrics.userInteraction ? '是' : '否'}${
        colors.reset
      }`
    );
    console.log(
      `${colors.blue}  跳出率: ${(uxMetrics.bounceRate * 100).toFixed(1)}%${
        colors.reset
      }`
    );
  }

  // 監控性能指標
  async monitorPerformance() {
    const perfMetrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      responseTime: Math.random() * 1000 + 100, // 100-1100ms
    };

    this.metrics.performance = perfMetrics;

    console.log(`${colors.blue}⚡ 性能指標:${colors.reset}`);
    console.log(
      `${colors.blue}  記憶體使用: ${(
        perfMetrics.memoryUsage.heapUsed /
        1024 /
        1024
      ).toFixed(2)} MB${colors.reset}`
    );
    console.log(
      `${colors.blue}  運行時間: ${perfMetrics.uptime.toFixed(0)}s${
        colors.reset
      }`
    );
    console.log(
      `${colors.blue}  響應時間: ${perfMetrics.responseTime.toFixed(0)}ms${
        colors.reset
      }`
    );
  }

  // 監控錯誤
  async monitorErrors() {
    // 檢查最近的錯誤日誌
    const logFiles = [
      'comprehensive-test-report.json',
      'performance-monitor-report.json',
      'error-analysis-report.json',
      'health-check-report.json',
    ];

    let recentErrors = 0;
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    logFiles.forEach(logFile => {
      if (fs.existsSync(logFile)) {
        try {
          const content = fs.readFileSync(logFile, 'utf8');
          const data = JSON.parse(content);

          if (data.errors) {
            recentErrors += data.errors.length;
          }
        } catch (parseError) {
          // 忽略解析錯誤
        }
      }
    });

    this.metrics.errors.push({
      timestamp: new Date().toISOString(),
      type: 'error_count',
      count: recentErrors,
    });

    console.log(
      `${colors.blue}🔍 錯誤監控: ${recentErrors} 個錯誤${colors.reset}`
    );
  }

  // 檢查警報
  checkAlerts() {
    const alerts = [];

    // 檢查收益警報
    if (this.metrics.admobEarnings > this.alertThresholds.earnings) {
      alerts.push({
        type: 'earnings',
        level: 'info',
        message: `AdMob 收益達到 $${this.metrics.admobEarnings.toFixed(2)}`,
        timestamp: new Date().toISOString(),
      });
    }

    // 檢查廣告載入成功率警報
    const totalAttempts =
      this.metrics.adLoadSuccess + this.metrics.adLoadFailure;
    if (totalAttempts > 0) {
      const successRate = this.metrics.adLoadSuccess / totalAttempts;
      if (successRate < this.alertThresholds.adLoadRate) {
        alerts.push({
          type: 'ad_load_rate',
          level: 'warning',
          message: `廣告載入成功率過低: ${(successRate * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 檢查錯誤數量警報
    if (this.metrics.errors.length > this.alertThresholds.errorCount) {
      alerts.push({
        type: 'error_count',
        level: 'error',
        message: `錯誤數量過多: ${this.metrics.errors.length}`,
        timestamp: new Date().toISOString(),
      });
    }

    // 檢查響應時間警報
    if (
      this.metrics.performance.responseTime > this.alertThresholds.responseTime
    ) {
      alerts.push({
        type: 'response_time',
        level: 'warning',
        message: `響應時間過長: ${this.metrics.performance.responseTime.toFixed(
          0
        )}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    // 處理警報
    alerts.forEach(alert => {
      this.handleAlert(alert);
    });

    this.metrics.alerts.push(...alerts);
  }

  // 處理警報
  handleAlert(alert) {
    const alertColors = {
      info: colors.blue,
      warning: colors.yellow,
      error: colors.red,
    };

    const alertIcons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '🚨',
    };

    const color = alertColors[alert.level] || colors.white;
    const icon = alertIcons[alert.level] || '📢';

    console.log(`${color}${icon} 警報: ${alert.message}${colors.reset}`);

    // 這裡可以添加發送通知的邏輯
    // 例如：發送郵件、Slack 通知、Webhook 等
  }

  // 顯示指標
  displayMetrics() {
    const runtime = Date.now() - this.metrics.startTime;
    const runtimeMinutes = (runtime / 1000 / 60).toFixed(1);

    console.log(
      `\n${colors.bright}${colors.cyan}${'='.repeat(50)}${colors.reset}`
    );
    console.log(
      `${colors.bright}📊 實時監控指標 (運行時間: ${runtimeMinutes} 分鐘)${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.cyan}${'='.repeat(50)}${colors.reset}`
    );

    console.log(
      `${colors.green}💰 AdMob 收益: $${this.metrics.admobEarnings.toFixed(2)}${
        colors.reset
      }`
    );

    const totalAttempts =
      this.metrics.adLoadSuccess + this.metrics.adLoadFailure;
    const successRate =
      totalAttempts > 0
        ? ((this.metrics.adLoadSuccess / totalAttempts) * 100).toFixed(1)
        : 0;
    console.log(
      `${colors.blue}📈 廣告載入成功率: ${successRate}% (${this.metrics.adLoadSuccess}/${totalAttempts})${colors.reset}`
    );

    console.log(
      `${
        colors.blue
      }👤 用戶體驗: 載入時間 ${this.metrics.userExperience.pageLoadTime?.toFixed(
        0
      )}ms${colors.reset}`
    );
    console.log(
      `${colors.blue}⚡ 性能: 記憶體 ${(
        this.metrics.performance.memoryUsage?.heapUsed /
        1024 /
        1024
      ).toFixed(2)}MB${colors.reset}`
    );
    console.log(
      `${colors.red}🔍 錯誤: ${this.metrics.errors.length} 個${colors.reset}`
    );
    console.log(
      `${colors.yellow}🚨 警報: ${this.metrics.alerts.length} 個${colors.reset}`
    );
  }

  // 生成監控報告
  generateReport() {
    const runtime = Date.now() - this.metrics.startTime;
    const totalAttempts =
      this.metrics.adLoadSuccess + this.metrics.adLoadFailure;
    const successRate =
      totalAttempts > 0
        ? ((this.metrics.adLoadSuccess / totalAttempts) * 100).toFixed(1)
        : 0;

    const report = {
      timestamp: new Date().toISOString(),
      runtime: `${(runtime / 1000 / 60).toFixed(1)} 分鐘`,
      summary: {
        admobEarnings: this.metrics.admobEarnings,
        adLoadSuccessRate: `${successRate}%`,
        totalErrors: this.metrics.errors.length,
        totalAlerts: this.metrics.alerts.length,
        avgPageLoadTime:
          this.metrics.userExperience.pageLoadTime?.toFixed(0) + 'ms',
        avgAdRenderTime:
          this.metrics.userExperience.adRenderTime?.toFixed(0) + 'ms',
        memoryUsage: `${(
          this.metrics.performance.memoryUsage?.heapUsed /
          1024 /
          1024
        ).toFixed(2)} MB`,
      },
      metrics: this.metrics,
      alerts: this.metrics.alerts,
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  // 生成建議
  generateRecommendations() {
    const recommendations = [];

    const totalAttempts =
      this.metrics.adLoadSuccess + this.metrics.adLoadFailure;
    const successRate =
      totalAttempts > 0 ? this.metrics.adLoadSuccess / totalAttempts : 0;

    if (successRate < 0.8) {
      recommendations.push({
        priority: 'high',
        category: 'ad_loading',
        description: '廣告載入成功率過低',
        action: '檢查 AdMob 配置和網絡連接',
      });
    }

    if (this.metrics.userExperience.pageLoadTime > 2000) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        description: '頁面載入時間過長',
        action: '優化資源載入和代碼分割',
      });
    }

    if (this.metrics.errors.length > 5) {
      recommendations.push({
        priority: 'high',
        category: 'errors',
        description: '錯誤數量過多',
        action: '檢查並修復所有錯誤',
      });
    }

    if (this.metrics.performance.memoryUsage?.heapUsed > 100 * 1024 * 1024) {
      // 100MB
      recommendations.push({
        priority: 'medium',
        category: 'memory',
        description: '記憶體使用過高',
        action: '檢查記憶體洩漏和優化代碼',
      });
    }

    return recommendations;
  }

  // 保存報告
  saveReport() {
    const report = this.generateReport();
    const filename = `monitor-report-${
      new Date().toISOString().split('T')[0]
    }.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(
      `${colors.green}📄 監控報告已保存到 ${filename}${colors.reset}`
    );
  }
}

// 命令行界面
class MonitorCLI {
  constructor() {
    this.monitor = new AdMobMonitor();
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => {
      console.log(
        `\n${colors.yellow}⏹️ 收到中斷信號，停止監控...${colors.reset}`
      );
      this.monitor.stop();
      this.monitor.saveReport();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log(
        `\n${colors.yellow}⏹️ 收到終止信號，停止監控...${colors.reset}`
      );
      this.monitor.stop();
      this.monitor.saveReport();
      process.exit(0);
    });
  }

  start(interval = 30000) {
    console.log(`${colors.bright}🚀 啟動 AdMob 實時監控系統${colors.reset}`);
    console.log(`${colors.blue}按 Ctrl+C 停止監控${colors.reset}\n`);

    this.monitor.start(interval);
  }
}

// 主函數
function main() {
  const args = process.argv.slice(2);
  const interval = args.includes('--interval')
    ? parseInt(args[args.indexOf('--interval') + 1]) * 1000
    : 30000;

  const cli = new MonitorCLI();
  cli.start(interval);
}

// 啟動監控
main();
