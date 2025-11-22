import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../firebase';
import logger from './logger';

/**
 * Firestore 連接狀態管理
 */
class FirestoreConnectionManager {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 初始延遲 1 秒
    this.isOnline = navigator.onLine;
    this.connectionListeners = [];
    
    // 監聽網路狀態
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners('online');
        logger.info('🌐 網路已連接，嘗試恢復 Firestore 連接');
        this.reconnect();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners('offline');
        logger.warn('📴 網路已斷開');
      });
    }
  }

  /**
   * 添加連接狀態監聽器
   */
  addConnectionListener(callback) {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * 通知所有監聽器
   */
  notifyListeners(status) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        logger.error('連接監聽器錯誤:', error);
      }
    });
  }

  /**
   * 檢查連接錯誤類型
   */
  isRetryableError(error) {
    if (!error) return false;
    
    const errorCode = error.code || '';
    const errorMessage = error.message || '';
    
    // ✅ 修正：過濾 "Unexpected state" 錯誤，這不是可重試的錯誤
    // 這是 Firestore 內部狀態問題，重試不會解決，應該直接忽略
    if (errorMessage.includes('Unexpected state') || 
        errorMessage.includes('INTERNAL ASSERTION FAILED')) {
      return false; // 不可重試，這是內部狀態問題
    }
    
    // 可重試的錯誤類型
    const retryableErrors = [
      'unavailable',
      'deadline-exceeded',
      'internal',
      'aborted',
      'cancelled',
      'ERR_QUIC_PROTOCOL_ERROR',
      'ERR_CONNECTION_CLOSED',
      'ERR_NETWORK_CHANGED',
      'ERR_INTERNET_DISCONNECTED',
    ];
    
    return retryableErrors.some(
      retryableError =>
        errorCode.includes(retryableError) ||
        errorMessage.includes(retryableError)
    );
  }

  /**
   * 重試 Firestore 操作
   */
  async retryOperation(operation, retryCount = 0) {
    try {
      return await operation();
    } catch (error) {
      // ✅ 修正：過濾 "Unexpected state" 錯誤，這是 Firestore 內部狀態問題
      // 不應該重試 enableNetwork()，應該直接重試操作本身
      const errorMessage = error.message || '';
      if (errorMessage.includes('Unexpected state') || 
          errorMessage.includes('INTERNAL ASSERTION FAILED')) {
        // 這是內部狀態問題，不應該重試 enableNetwork()
        // 直接重試操作本身（不調用 enableNetwork）
        logger.debug('檢測到 Firestore 內部狀態錯誤，跳過重連，直接重試操作');
        if (retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.retryOperation(operation, retryCount + 1);
        }
        // 如果重試次數已用完，拋出錯誤
        throw error;
      }
      
      // 檢查是否為可重試錯誤
      if (!this.isRetryableError(error)) {
        throw error; // 不可重試的錯誤直接拋出
      }

      // 檢查重試次數
      if (retryCount >= this.maxRetries) {
        logger.error(`❌ Firestore 操作失敗，已重試 ${this.maxRetries} 次:`, error);
        throw new Error(`操作失敗：${error.message || '連接超時'}`);
      }

      // 計算延遲時間（指數退避）
      const delay = this.retryDelay * Math.pow(2, retryCount);
      logger.warn(
        `🔄 Firestore 連接錯誤，${delay}ms 後重試 (${retryCount + 1}/${this.maxRetries}):`,
        error.message || error.code
      );

      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, delay));

      // 嘗試重新連接
      try {
        await enableNetwork(db);
      } catch (reconnectError) {
        // ✅ 修正：過濾 "Unexpected state" 錯誤，避免影響功能
        const reconnectErrorMessage = reconnectError.message || '';
        if (reconnectErrorMessage.includes('Unexpected state') || 
            reconnectErrorMessage.includes('INTERNAL ASSERTION FAILED')) {
          // Firestore 已經連接，忽略此錯誤
          logger.debug('Firestore 已連接，無需重連');
        } else {
          logger.warn('重新連接 Firestore 失敗:', reconnectError);
        }
      }

      // 遞歸重試
      return this.retryOperation(operation, retryCount + 1);
    }
  }

  /**
   * 重新連接 Firestore
   */
  async reconnect() {
    try {
      await enableNetwork(db);
      this.retryCount = 0;
      logger.info('✅ Firestore 重新連接成功');
    } catch (error) {
      // ✅ 修正：過濾 "Unexpected state" 錯誤，避免影響功能
      const errorMessage = error.message || '';
      if (errorMessage.includes('Unexpected state') || 
          errorMessage.includes('INTERNAL ASSERTION FAILED')) {
        // Firestore 已經連接，忽略此錯誤
        logger.debug('Firestore 已連接，無需重連');
        this.retryCount = 0;
        return;
      }
      logger.error('❌ Firestore 重新連接失敗:', error);
    }
  }

  /**
   * 檢查 Firestore 連接狀態
   */
  async checkConnection() {
    try {
      // 嘗試一個簡單的讀取操作來檢查連接
      const { collection, getDocs, limit, query } = await import('firebase/firestore');
      const testQuery = query(collection(db, 'users'), limit(1));
      await getDocs(testQuery);
      return true;
    } catch (error) {
      logger.warn('Firestore 連接檢查失敗:', error);
      return false;
    }
  }
}

// 創建單例
const firestoreConnectionManager = new FirestoreConnectionManager();

/**
 * 帶重試的 Firestore 操作包裝器
 */
export async function withRetry(operation, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry = null,
  } = options;

  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      // 檢查是否為可重試錯誤
      if (!firestoreConnectionManager.isRetryableError(error)) {
        throw error;
      }

      if (retryCount >= maxRetries) {
        throw new Error(
          `操作失敗：已重試 ${maxRetries} 次。${error.message || '連接超時'}`
        );
      }

      const delay = retryDelay * Math.pow(2, retryCount);
      
      if (onRetry) {
        onRetry(retryCount + 1, maxRetries, delay, error);
      } else {
        logger.warn(
          `🔄 Firestore 操作重試 (${retryCount + 1}/${maxRetries})，${delay}ms 後重試...`
        );
      }

      await new Promise(resolve => setTimeout(resolve, delay));

      // 嘗試重新連接
      try {
        await enableNetwork(db);
      } catch (reconnectError) {
        // ✅ 修正：過濾 "Unexpected state" 錯誤，避免影響功能
        const reconnectErrorMessage = reconnectError.message || '';
        if (reconnectErrorMessage.includes('Unexpected state') || 
            reconnectErrorMessage.includes('INTERNAL ASSERTION FAILED')) {
          // Firestore 已經連接，忽略此錯誤
          logger.debug('Firestore 已連接，無需重連');
        } else {
          // 其他錯誤也忽略，繼續重試操作
          logger.debug('重新連接 Firestore 失敗，繼續重試操作');
        }
      }

      retryCount++;
    }
  }
}

/**
 * 安全的 Firestore 查詢
 */
export async function safeGetDocs(query, options = {}) {
  return withRetry(
    async () => {
      const { getDocs } = await import('firebase/firestore');
      return await getDocs(query);
    },
    {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      onRetry: options.onRetry,
    }
  );
}

/**
 * 安全的 Firestore 文檔讀取
 */
export async function safeGetDoc(docRef, options = {}) {
  return withRetry(
    async () => {
      const { getDoc } = await import('firebase/firestore');
      return await getDoc(docRef);
    },
    {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      onRetry: options.onRetry,
    }
  );
}

/**
 * 安全的 Firestore 寫入操作
 */
export async function safeSetDoc(docRef, data, options = {}) {
  return withRetry(
    async () => {
      const { setDoc } = await import('firebase/firestore');
      return await setDoc(docRef, data, options);
    },
    {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      onRetry: options.onRetry,
    }
  );
}

/**
 * 安全的 Firestore 更新操作
 */
export async function safeUpdateDoc(docRef, data, options = {}) {
  return withRetry(
    async () => {
      const { updateDoc } = await import('firebase/firestore');
      return await updateDoc(docRef, data);
    },
    {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      onRetry: options.onRetry,
    }
  );
}

// 導出連接管理器
export { firestoreConnectionManager };
export default firestoreConnectionManager;

