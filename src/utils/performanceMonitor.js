// 性能監控工具
class PerformanceMonitor {
  constructor() {
    this.isMonitoring = false;
    this.metrics = {
      pageLoadTimes: {},
      componentRenderTimes: {},
      apiCallTimes: {},
      memoryUsage: [],
      errors: [],
    };
    this.pageStartTimes = new Map(); // 新增：每個頁面的開始時間
  }

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    console.log('📊 性能監控已啟動');
  }

  stop() {
    this.isMonitoring = false;
    console.log('🛑 性能監控已停止');
  }

  // 開始監控頁面載入
  startPageLoad(pageName) {
    if (!this.isMonitoring) return;
    this.pageStartTimes.set(pageName, Date.now());
    console.log(`📄 開始載入頁面: ${pageName}`);
  }

  // 監控頁面載入時間 - 修復版本
  measurePageLoad(pageName) {
    if (!this.isMonitoring) return;

    const startTime = this.pageStartTimes.get(pageName);
    if (!startTime) {
      console.warn(`⚠️ 頁面 ${pageName} 沒有開始時間記錄`);
      return;
    }

    const loadTime = Date.now() - startTime;
    this.metrics.pageLoadTimes[pageName] = loadTime;
    this.pageStartTimes.delete(pageName); // 清理開始時間

    console.log(`📄 頁面載入完成 - ${pageName}: ${loadTime}ms`);

    // 檢查是否超過閾值
    if (loadTime > 3000) {
      console.warn(`⚠️ 頁面載入時間過長: ${pageName} (${loadTime}ms)`);
    }
  }

  // 監控組件渲染時間
  measureComponentRender(componentName, renderTime) {
    if (!this.isMonitoring) return;

    if (!this.metrics.componentRenderTimes[componentName]) {
      this.metrics.componentRenderTimes[componentName] = [];
    }

    this.metrics.componentRenderTimes[componentName].push(renderTime);

    // 只保留最近10次記錄
    if (this.metrics.componentRenderTimes[componentName].length > 10) {
      this.metrics.componentRenderTimes[componentName].shift();
    }

    // 檢查是否超過閾值
    if (renderTime > 100) {
      console.warn(`⚠️ 組件渲染時間過長: ${componentName} (${renderTime}ms)`);
    }
  }

  // 監控 API 調用時間
  measureApiCall(apiName, callTime) {
    if (!this.isMonitoring) return;

    if (!this.metrics.apiCallTimes[apiName]) {
      this.metrics.apiCallTimes[apiName] = [];
    }

    this.metrics.apiCallTimes[apiName].push(callTime);

    // 只保留最近10次記錄
    if (this.metrics.apiCallTimes[apiName].length > 10) {
      this.metrics.apiCallTimes[apiName].shift();
    }

    // 檢查是否超過閾值
    if (callTime > 5000) {
      console.warn(`⚠️ API 調用時間過長: ${apiName} (${callTime}ms)`);
    }
  }

  // 監控內存使用
  measureMemoryUsage() {
    if (!this.isMonitoring || !performance.memory) return;

    const memory = performance.memory;
    const usage = {
      timestamp: Date.now(),
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };

    this.metrics.memoryUsage.push(usage);

    // 只保留最近20次記錄
    if (this.metrics.memoryUsage.length > 20) {
      this.metrics.memoryUsage.shift();
    }

    // 檢查內存使用率
    const usagePercent = (usage.used / usage.limit) * 100;
    if (usagePercent > 80) {
      console.warn(`⚠️ 內存使用率過高: ${usagePercent.toFixed(2)}%`);
    }
  }

  // 記錄錯誤
  logError(error, context = '') {
    if (!this.isMonitoring) return;

    const errorRecord = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      context,
    };

    this.metrics.errors.push(errorRecord);

    // 只保留最近50個錯誤
    if (this.metrics.errors.length > 50) {
      this.metrics.errors.shift();
    }
  }

  // 獲取統計數據
  getStats() {
    const stats = {
      pageLoadTimes: { ...this.metrics.pageLoadTimes },
      componentRenderTimes: {},
      apiCallTimes: {},
      memoryUsage: this.metrics.memoryUsage.length,
      errorCount: this.metrics.errors.length,
    };

    // 計算組件渲染平均時間
    Object.keys(this.metrics.componentRenderTimes).forEach(component => {
      const times = this.metrics.componentRenderTimes[component];
      if (times.length > 0) {
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        stats.componentRenderTimes[component] = {
          average: Math.round(avg),
          count: times.length,
          max: Math.max(...times),
        };
      }
    });

    // 計算 API 調用平均時間
    Object.keys(this.metrics.apiCallTimes).forEach(api => {
      const times = this.metrics.apiCallTimes[api];
      if (times.length > 0) {
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        stats.apiCallTimes[api] = {
          average: Math.round(avg),
          count: times.length,
          max: Math.max(...times),
        };
      }
    });

    return stats;
  }

  // 檢測性能問題
  detectPerformanceIssues() {
    const issues = [];
    const stats = this.getStats();

    // 檢查頁面載入時間
    Object.keys(stats.pageLoadTimes).forEach(page => {
      const loadTime = stats.pageLoadTimes[page];
      if (loadTime > 3000) {
        issues.push({
          type: 'slow_page_load',
          message: `頁面載入時間過長: ${page} (${loadTime}ms)`,
          severity: 'warning',
        });
      }
    });

    // 檢查組件渲染時間
    Object.keys(stats.componentRenderTimes).forEach(component => {
      const renderStats = stats.componentRenderTimes[component];
      if (renderStats.average > 100) {
        issues.push({
          type: 'slow_component_render',
          message: `組件渲染時間過長: ${component} (平均 ${renderStats.average}ms)`,
          severity: 'warning',
        });
      }
    });

    // 檢查 API 調用時間
    Object.keys(stats.apiCallTimes).forEach(api => {
      const apiStats = stats.apiCallTimes[api];
      if (apiStats.average > 5000) {
        issues.push({
          type: 'slow_api_call',
          message: `API 調用時間過長: ${api} (平均 ${apiStats.average}ms)`,
          severity: 'warning',
        });
      }
    });

    // 檢查內存使用
    if (this.metrics.memoryUsage.length > 0) {
      const latest =
        this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      const usagePercent = (latest.used / latest.limit) * 100;

      if (usagePercent > 80) {
        issues.push({
          type: 'high_memory_usage',
          message: `內存使用率過高: ${usagePercent.toFixed(2)}%`,
          severity: 'error',
        });
      }
    }

    // 檢查錯誤數量
    if (stats.errorCount > 10) {
      issues.push({
        type: 'high_error_rate',
        message: `錯誤數量過多: ${stats.errorCount} 個錯誤`,
        severity: 'error',
      });
    }

    return issues;
  }

  // 生成優化建議
  generateOptimizationSuggestions() {
    const issues = this.detectPerformanceIssues();
    const suggestions = [];

    if (issues.length > 0) {
      suggestions.push('🚨 檢測到性能問題，建議檢查以下方面：');
      issues.forEach(issue => {
        suggestions.push(`- ${issue.message}`);
      });
    }

    // 通用優化建議
    suggestions.push('💡 通用優化建議：');
    suggestions.push('- ✅ 使用 React.memo 優化組件渲染（已實施）');
    suggestions.push('- ✅ 實現虛擬滾動處理大量數據（已實施）');
    suggestions.push('- ✅ 使用圖片懶加載減少初始載入時間（已實施）');
    suggestions.push('- ✅ 實現數據快取減少重複請求（已實施）');
    suggestions.push('- ✅ 使用 React.lazy 實現代碼分割（已實施）');
    suggestions.push('- ✅ 優化 Firebase 查詢減少數據傳輸（已實施）');

    // 新增優化建議
    suggestions.push('🚀 進階優化建議：');
    suggestions.push('- ✅ 使用 Web Workers 處理計算密集型任務（已實施）');
    suggestions.push('- ✅ 實現 Service Worker 快取策略（已實施）');
    suggestions.push(
      '- ✅ 使用 Intersection Observer 優化可見性檢測（已實施）'
    );
    suggestions.push('- ✅ 實現預加載關鍵資源（已實施）');
    suggestions.push('- ✅ 優化 Bundle 大小，移除未使用的代碼（已實施）');
    suggestions.push('- 使用 CDN 加速靜態資源載入');
    suggestions.push('- 實現 Service Worker 背景同步');
    suggestions.push('- 使用 WebAssembly 處理複雜計算');
    suggestions.push('- 實現離線優先策略');
    suggestions.push('- 優化關鍵渲染路徑');

    return suggestions;
  }

  // 重置統計
  reset() {
    this.metrics = {
      pageLoadTimes: {},
      componentRenderTimes: {},
      apiCallTimes: {},
      memoryUsage: [],
      errors: [],
    };
    this.pageStartTimes.clear();
    console.log('🔄 性能統計已重置');
  }
}

// 創建全局監控實例
const performanceMonitor = new PerformanceMonitor();

// 在開發環境中自動啟動監控
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.start();

  // 定期監控內存使用
  setInterval(() => {
    performanceMonitor.measureMemoryUsage();
  }, 30000); // 每30秒檢查一次

  // 定期輸出性能統計
  setInterval(() => {
    const stats = performanceMonitor.getStats();
    if (
      Object.keys(stats.pageLoadTimes).length > 0 ||
      Object.keys(stats.componentRenderTimes).length > 0 ||
      Object.keys(stats.apiCallTimes).length > 0
    ) {
      console.log('📊 性能統計:', stats);

      const suggestions = performanceMonitor.generateOptimizationSuggestions();
      if (suggestions.length > 0) {
        console.log('💡 性能優化建議:');
        suggestions.forEach(suggestion => console.log(suggestion));
      }
    }
  }, 300000); // 每5分鐘輸出一次
}

export default performanceMonitor;
