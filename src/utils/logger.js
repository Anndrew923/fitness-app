/**
 * 統一的日誌工具
 * 在生產環境中自動禁用調試日誌，只保留錯誤和警告
 */

// 檢測環境
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// 日誌級別配置
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// 當前日誌級別（生產環境只顯示錯誤和警告）
const currentLogLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

/**
 * 統一的日誌工具
 */
export const logger = {
  /**
   * 錯誤日誌（所有環境都顯示）
   * @param {...any} args - 日誌參數
   */
  error: (...args) => {
    console.error(...args);
    // 生產環境可以發送到錯誤追蹤服務（如 Sentry）
    if (isProduction) {
      // TODO: 集成錯誤追蹤服務
      // errorTrackingService.captureException(new Error(args.join(' ')));
    }
  },

  /**
   * 警告日誌（所有環境都顯示）
   * @param {...any} args - 日誌參數
   */
  warn: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn(...args);
    }
  },

  /**
   * 信息日誌（僅開發環境）
   * @param {...any} args - 日誌參數
   */
  info: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(...args);
    }
  },

  /**
   * 調試日誌（僅開發環境）
   * @param {...any} args - 日誌參數
   */
  debug: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log(...args);
    }
  },

  /**
   * 分組日誌（僅開發環境）
   * @param {string} label - 分組標籤
   * @param {Function} callback - 回調函數
   */
  group: (label, callback) => {
    if (isDevelopment) {
      console.group(label);
      try {
        callback();
      } finally {
        console.groupEnd();
      }
    } else {
      callback();
    }
  },

  /**
   * 表格日誌（僅開發環境）
   * @param {...any} args - 表格數據
   */
  table: (...args) => {
    if (isDevelopment) {
      console.table(...args);
    }
  },
};

// 導出環境檢測
export { isDevelopment, isProduction };

// 默認導出
export default logger;

