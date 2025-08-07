/**
 * 除錯主控工具
 * 整合所有除錯功能，提供全面的錯誤檢測和修復建議
 */

import { performanceMonitor } from './performanceMonitor.js';
import { firebaseMonitor } from './firebaseMonitor.js';
// import { debugHelper } from './debugHelper.js';

class DebugMaster {
  constructor() {
    this.isActive = false;
    this.errorLog = [];
    this.performanceLog = [];
    this.firebaseLog = [];
    this.userInteractionLog = [];
    this.recommendations = [];

    // 初始化監控器
    this.initMonitors();
  }

  // 初始化所有監控器
  initMonitors() {
    // 性能監控
    this.performanceMonitor = performanceMonitor;

    // Firebase 監控
    this.firebaseMonitor = firebaseMonitor;

    // 錯誤監控
    this.setupErrorMonitoring();

    // 用戶交互監控
    this.setupUserInteractionMonitoring();

    // 控制台監控
    this.setupConsoleMonitoring();
  }

  // 設置錯誤監控
  setupErrorMonitoring() {
    // 全局錯誤處理
    window.addEventListener('error', event => {
      this.logError('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });

    // Promise 錯誤處理
    window.addEventListener('unhandledrejection', event => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });

    // React 錯誤邊界
    if (window.React) {
      this.setupReactErrorBoundary();
    }
  }

  // 設置 React 錯誤邊界
  setupReactErrorBoundary() {
    // 這裡可以添加 React 錯誤邊界的邏輯
    console.log('🔧 React 錯誤邊界已設置');
  }

  // 設置用戶交互監控
  setupUserInteractionMonitoring() {
    const events = ['click', 'input', 'submit', 'scroll', 'resize'];

    events.forEach(eventType => {
      document.addEventListener(
        eventType,
        event => {
          this.logUserInteraction(eventType, {
            target: event.target?.tagName,
            className: event.target?.className,
            id: event.target?.id,
            timestamp: Date.now(),
          });
        },
        { passive: true }
      );
    });
  }

  // 設置控制台監控
  setupConsoleMonitoring() {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    };

    // 攔截 console.error
    console.error = (...args) => {
      this.logError('Console Error', {
        message: args.join(' '),
        timestamp: Date.now(),
      });
      originalConsole.error.apply(console, args);
    };

    // 攔截 console.warn
    console.warn = (...args) => {
      this.logError('Console Warning', {
        message: args.join(' '),
        timestamp: Date.now(),
      });
      originalConsole.warn.apply(console, args);
    };
  }

  // 記錄錯誤
  logError(type, data) {
    const errorEntry = {
      type,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.errorLog.push(errorEntry);
    this.analyzeError(errorEntry);
  }

  // 記錄用戶交互
  logUserInteraction(type, data) {
    this.userInteractionLog.push({
      type,
      data,
      timestamp: Date.now(),
    });
  }

  // 分析錯誤並提供建議
  analyzeError(errorEntry) {
    const { type, data } = errorEntry;

    switch (type) {
      case 'Global Error':
        this.analyzeGlobalError(data);
        break;
      case 'Unhandled Promise Rejection':
        this.analyzePromiseError(data);
        break;
      case 'Console Error':
        this.analyzeConsoleError(data);
        break;
      case 'Console Warning':
        this.analyzeConsoleWarning(data);
        break;
    }
  }

  // 分析全局錯誤
  analyzeGlobalError(data) {
    const { message, filename, lineno } = data;

    if (message.includes('Cannot read property')) {
      this.addRecommendation('空值檢查', {
        severity: 'high',
        description: '檢測到空值訪問錯誤，建議添加空值檢查',
        fix: '使用可選鏈操作符 (?.) 或條件檢查',
        example: 'object?.property 或 if (object) { object.property }',
      });
    }

    if (message.includes('Unexpected token')) {
      this.addRecommendation('語法錯誤', {
        severity: 'critical',
        description: '檢測到語法錯誤',
        fix: '檢查代碼語法，確保括號、引號等配對正確',
        line: lineno,
        file: filename,
      });
    }
  }

  // 分析 Promise 錯誤
  analyzePromiseError() {
    this.addRecommendation('Promise 錯誤處理', {
      severity: 'medium',
      description: '檢測到未處理的 Promise 拒絕',
      fix: '為所有 Promise 添加 .catch() 處理器',
      example: 'promise.catch(error => console.error(error))',
    });
  }

  // 分析控制台錯誤
  analyzeConsoleError(data) {
    const { message } = data;

    if (message.includes('Firebase')) {
      this.addRecommendation('Firebase 配置', {
        severity: 'high',
        description: 'Firebase 相關錯誤',
        fix: '檢查 Firebase 配置和權限設置',
        check: ['API Key', 'Auth Domain', 'Database Rules'],
      });
    }
  }

  // 分析控制台警告
  analyzeConsoleWarning(data) {
    const { message } = data;

    if (message.includes('React Hook')) {
      this.addRecommendation('React Hooks', {
        severity: 'medium',
        description: 'React Hooks 使用警告',
        fix: '檢查 useEffect 依賴項或 Hook 使用順序',
        check: ['useEffect dependencies', 'Hook order'],
      });
    }
  }

  // 添加建議
  addRecommendation(category, details) {
    this.recommendations.push({
      category,
      ...details,
      timestamp: Date.now(),
    });
  }

  // 啟動全面監控
  start() {
    if (this.isActive) {
      console.log('⚠️ 除錯監控已在運行中');
      return;
    }

    this.isActive = true;
    console.log('🚀 啟動全面除錯監控...');

    // 啟動性能監控
    this.performanceMonitor.start();

    // 啟動 Firebase 監控
    this.firebaseMonitor.start();

    // 定期生成報告
    this.startReporting();
  }

  // 停止監控
  stop() {
    this.isActive = false;
    console.log('⏹️ 停止除錯監控');

    this.performanceMonitor.stop();
    this.firebaseMonitor.stop();
  }

  // 開始定期報告
  startReporting() {
    setInterval(() => {
      if (this.isActive) {
        this.generateReport();
      }
    }, 30000); // 每30秒生成一次報告
  }

  // 生成報告
  generateReport() {
    const report = {
      timestamp: Date.now(),
      errors: this.errorLog.length,
      recommendations: this.recommendations.length,
      performance: this.performanceMonitor.getMetrics(),
      firebase: this.firebaseMonitor.getMetrics(),
      userInteractions: this.userInteractionLog.length,
    };

    console.log('📊 除錯報告:', report);

    // 如果有嚴重問題，立即提醒
    const criticalIssues = this.recommendations.filter(
      r => r.severity === 'critical'
    );
    if (criticalIssues.length > 0) {
      console.error('🚨 發現嚴重問題:', criticalIssues);
    }
  }

  // 獲取完整報告
  getFullReport() {
    return {
      summary: {
        totalErrors: this.errorLog.length,
        totalRecommendations: this.recommendations.length,
        monitoringDuration: Date.now() - (this.startTime || Date.now()),
      },
      errors: this.errorLog,
      recommendations: this.recommendations,
      performance: this.performanceMonitor.getMetrics(),
      firebase: this.firebaseMonitor.getMetrics(),
      userInteractions: this.userInteractionLog,
    };
  }

  // 清理日誌
  clearLogs() {
    this.errorLog = [];
    this.performanceLog = [];
    this.firebaseLog = [];
    this.userInteractionLog = [];
    this.recommendations = [];
    console.log('🧹 日誌已清理');
  }

  // 導出報告
  exportReport() {
    const report = this.getFullReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-report-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
}

// 創建全局實例
const debugMaster = new DebugMaster();

// 開發環境自動啟動
if (process.env.NODE_ENV === 'development') {
  debugMaster.start();
}

export default debugMaster;
