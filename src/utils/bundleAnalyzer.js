// Bundle 分析工具
class BundleAnalyzer {
  constructor() {
    this.analysis = {
      totalSize: 0,
      chunks: [],
      unusedModules: [],
      duplicateModules: [],
      recommendations: [],
    };
  }

  // 分析 Bundle 大小
  analyzeBundle() {
    if (typeof window === 'undefined') {
      console.warn('Bundle analysis only available in browser environment');
      return this.analysis;
    }

    try {
      // 分析已載入的腳本
      this.analyzeLoadedScripts();

      // 分析未使用的模組
      this.analyzeUnusedModules();

      // 分析重複模組
      this.analyzeDuplicateModules();

      // 生成優化建議
      this.generateRecommendations();

      return this.analysis;
    } catch (error) {
      console.error('Bundle analysis failed:', error);
      return this.analysis;
    }
  }

  // 分析已載入的腳本
  analyzeLoadedScripts() {
    const scripts = Array.from(document.querySelectorAll('script[src]'));

    scripts.forEach(script => {
      const src = script.src;
      const size = this.estimateScriptSize(src);

      this.analysis.chunks.push({
        src,
        size,
        type: 'script',
        loaded: true,
      });

      this.analysis.totalSize += size;
    });
  }

  // 估算腳本大小
  estimateScriptSize(src) {
    // 這是一個簡化的估算，實際大小需要通過網路請求獲取
    const commonSizes = {
      'bundle.js': 500000, // 500KB
      'vendor.js': 300000, // 300KB
      'main.js': 200000, // 200KB
      'runtime.js': 50000, // 50KB
    };

    const filename = src.split('/').pop();
    return commonSizes[filename] || 100000; // 預設 100KB
  }

  // 分析未使用的模組
  analyzeUnusedModules() {
    // 檢查可能未使用的模組
    const potentiallyUnused = [
      'lodash',
      'moment',
      'jquery',
      'bootstrap',
      'font-awesome',
    ];

    potentiallyUnused.forEach(module => {
      if (this.isModuleLoaded(module) && !this.isModuleUsed(module)) {
        this.analysis.unusedModules.push({
          name: module,
          estimatedSize: this.estimateModuleSize(module),
          reason: 'Not detected in usage',
        });
      }
    });
  }

  // 檢查模組是否已載入
  isModuleLoaded(moduleName) {
    return window[moduleName] !== undefined;
  }

  // 檢查模組是否被使用
  isModuleUsed(moduleName) {
    // 簡化的使用檢測
    const code = document.documentElement.innerHTML;
    return (
      code.includes(moduleName) ||
      code.includes(moduleName.toLowerCase()) ||
      code.includes(moduleName.toUpperCase())
    );
  }

  // 估算模組大小
  estimateModuleSize(moduleName) {
    const moduleSizes = {
      lodash: 70000,
      moment: 60000,
      jquery: 80000,
      bootstrap: 50000,
      'font-awesome': 40000,
    };

    return moduleSizes[moduleName] || 20000;
  }

  // 分析重複模組
  analyzeDuplicateModules() {
    const loadedModules = this.analysis.chunks.map(chunk => chunk.src);
    const duplicates = this.findDuplicates(loadedModules);

    duplicates.forEach(duplicate => {
      this.analysis.duplicateModules.push({
        src: duplicate,
        count: loadedModules.filter(src => src === duplicate).length,
        estimatedWaste: this.estimateScriptSize(duplicate),
      });
    });
  }

  // 查找重複項
  findDuplicates(array) {
    const seen = new Set();
    const duplicates = new Set();

    array.forEach(item => {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    });

    return Array.from(duplicates);
  }

  // 生成優化建議
  generateRecommendations() {
    const recommendations = [];

    // 基於未使用模組的建議
    if (this.analysis.unusedModules.length > 0) {
      recommendations.push({
        type: 'remove_unused',
        priority: 'high',
        message: `移除 ${this.analysis.unusedModules.length} 個未使用的模組`,
        estimatedSavings: this.analysis.unusedModules.reduce(
          (sum, mod) => sum + mod.estimatedSize,
          0
        ),
        modules: this.analysis.unusedModules.map(mod => mod.name),
      });
    }

    // 基於重複模組的建議
    if (this.analysis.duplicateModules.length > 0) {
      recommendations.push({
        type: 'remove_duplicates',
        priority: 'medium',
        message: `移除 ${this.analysis.duplicateModules.length} 個重複模組`,
        estimatedSavings: this.analysis.duplicateModules.reduce(
          (sum, mod) => sum + mod.estimatedWaste,
          0
        ),
        modules: this.analysis.duplicateModules.map(mod => mod.src),
      });
    }

    // 基於總大小的建議
    if (this.analysis.totalSize > 1000000) {
      // 1MB
      recommendations.push({
        type: 'code_splitting',
        priority: 'high',
        message: 'Bundle 大小超過 1MB，建議實現代碼分割',
        estimatedSavings: this.analysis.totalSize * 0.3, // 預估可節省 30%
        suggestions: [
          '使用 React.lazy() 進行路由級代碼分割',
          '使用 dynamic import() 進行組件級代碼分割',
          '分離第三方庫到單獨的 chunk',
        ],
      });
    }

    // 通用優化建議
    recommendations.push({
      type: 'general_optimization',
      priority: 'medium',
      message: '通用優化建議',
      suggestions: [
        '啟用 gzip 壓縮',
        '使用 Webpack Bundle Analyzer 進行詳細分析',
        '考慮使用 Tree Shaking 移除未使用的代碼',
        '優化圖片資源，使用 WebP 格式',
        '使用 CDN 加速靜態資源載入',
      ],
    });

    this.analysis.recommendations = recommendations;
  }

  // 生成報告
  generateReport() {
    const report = {
      summary: {
        totalSize: this.analysis.totalSize,
        totalChunks: this.analysis.chunks.length,
        unusedModules: this.analysis.unusedModules.length,
        duplicateModules: this.analysis.duplicateModules.length,
        recommendations: this.analysis.recommendations.length,
      },
      details: this.analysis,
      timestamp: new Date().toISOString(),
    };

    return report;
  }

  // 輸出報告到控制台
  logReport() {
    const report = this.generateReport();

    console.group('📊 Bundle Analysis Report');
    console.log('總大小:', this.formatBytes(report.summary.totalSize));
    console.log('Chunk 數量:', report.summary.totalChunks);
    console.log('未使用模組:', report.summary.unusedModules);
    console.log('重複模組:', report.summary.duplicateModules);

    if (report.details.recommendations.length > 0) {
      console.group('💡 優化建議');
      report.details.recommendations.forEach((rec, index) => {
        console.log(
          `${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`
        );
        if (rec.estimatedSavings) {
          console.log(`   預估節省: ${this.formatBytes(rec.estimatedSavings)}`);
        }
        if (rec.suggestions) {
          rec.suggestions.forEach(suggestion => {
            console.log(`   - ${suggestion}`);
          });
        }
      });
      console.groupEnd();
    }

    console.groupEnd();

    return report;
  }

  // 格式化字節大小
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 創建全局實例
const bundleAnalyzer = new BundleAnalyzer();

// 在開發環境中自動分析
if (process.env.NODE_ENV === 'development') {
  // 延遲分析，確保所有資源都已載入
  setTimeout(() => {
    bundleAnalyzer.logReport();
  }, 3000);
}

export default bundleAnalyzer;
