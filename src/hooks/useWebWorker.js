import { useRef, useCallback, useEffect } from 'react';

/**
 * Web Worker Hook
 * @param {string} workerPath - Worker 文件路徑
 * @param {Object} options - 配置選項
 */
const useWebWorker = (workerPath, options = {}) => {
  const workerRef = useRef(null);
  const callbacksRef = useRef(new Map());
  const taskIdRef = useRef(0);

  // 初始化 Worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker(workerPath);

        workerRef.current.onmessage = e => {
          const { id, success, result, error } = e.data;
          const callback = callbacksRef.current.get(id);

          if (callback) {
            if (success) {
              callback.resolve(result);
            } else {
              callback.reject(new Error(error));
            }
            callbacksRef.current.delete(id);
          }
        };

        workerRef.current.onerror = error => {
          console.error('Web Worker error:', error);
          // 清理所有待處理的任務
          callbacksRef.current.forEach(callback => {
            callback.reject(error);
          });
          callbacksRef.current.clear();
        };
      } catch (error) {
        console.warn('Web Worker not supported:', error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      callbacksRef.current.clear();
    };
  }, [workerPath]);

  // 執行任務
  const executeTask = useCallback((type, data) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Web Worker not available'));
        return;
      }

      const id = ++taskIdRef.current;
      callbacksRef.current.set(id, { resolve, reject });

      workerRef.current.postMessage({
        id,
        type,
        data,
      });
    });
  }, []);

  // 計算天梯分數
  const calculateLadderScore = useCallback(
    data => {
      return executeTask('CALCULATE_LADDER_SCORE', data);
    },
    [executeTask]
  );

  // 計算雷達圖數據
  const calculateRadarData = useCallback(
    data => {
      return executeTask('CALCULATE_RADAR_DATA', data);
    },
    [executeTask]
  );

  // 處理用戶統計
  const processUserStats = useCallback(
    data => {
      return executeTask('PROCESS_USER_STATS', data);
    },
    [executeTask]
  );

  // 優化圖片
  const optimizeImage = useCallback(
    data => {
      return executeTask('OPTIMIZE_IMAGE_DATA', data);
    },
    [executeTask]
  );

  return {
    calculateLadderScore,
    calculateRadarData,
    processUserStats,
    optimizeImage,
    isSupported: !!workerRef.current,
  };
};

export default useWebWorker;
