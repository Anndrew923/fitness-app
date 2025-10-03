import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 數據快取 Hook
 * @param {string} cacheKey - 快取鍵值
 * @param {Function} fetchFunction - 數據獲取函數
 * @param {Object} options - 配置選項
 * @param {number} options.cacheTime - 快取時間（毫秒），預設 5 分鐘
 * @param {boolean} options.enabled - 是否啟用快取，預設 true
 * @param {Function} options.onSuccess - 成功回調
 * @param {Function} options.onError - 錯誤回調
 * @param {Array} options.dependencies - 依賴數組，變化時會重新獲取數據
 */
const useDataCache = (cacheKey, fetchFunction, options = {}) => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 分鐘
    enabled = true,
    onSuccess,
    onError,
    dependencies = [],
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);

  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  // 檢查快取是否有效
  const isCacheValid = useCallback(() => {
    if (!enabled) return false;

    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    return now - cached.timestamp < cacheTime;
  }, [cacheKey, cacheTime, enabled]);

  // 獲取快取數據
  const getCachedData = useCallback(() => {
    if (!enabled) return null;

    const cached = cacheRef.current.get(cacheKey);
    return cached ? cached.data : null;
  }, [cacheKey, enabled]);

  // 設置快取數據
  const setCachedData = useCallback(
    newData => {
      if (!enabled) return;

      cacheRef.current.set(cacheKey, {
        data: newData,
        timestamp: Date.now(),
      });
    },
    [cacheKey, enabled]
  );

  // 清除快取
  const clearCache = useCallback(() => {
    cacheRef.current.delete(cacheKey);
  }, [cacheKey]);

  // 清除所有快取
  const clearAllCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // 獲取數據
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      // 如果快取有效且不是強制刷新，使用快取數據
      if (!forceRefresh && isCacheValid()) {
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setError(null);
          return cachedData;
        }
      }

      // 取消之前的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 創建新的 AbortController
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await fetchFunction(abortControllerRef.current.signal);

        // 檢查請求是否被取消
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        setData(result);
        setCachedData(result);
        setLastFetch(Date.now());

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          if (onError) {
            onError(err);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [
      fetchFunction,
      isCacheValid,
      getCachedData,
      setCachedData,
      onSuccess,
      onError,
    ]
  );

  // 依賴變化時重新獲取數據
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, dependencies);

  // 組件卸載時取消請求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastFetch,
    fetchData,
    clearCache,
    clearAllCache,
    isCacheValid: isCacheValid(),
    refetch: () => fetchData(true),
  };
};

export default useDataCache;
