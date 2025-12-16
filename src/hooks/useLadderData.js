import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getMetricConfig } from '../config/rankingSystem';
import { safeGetDocs } from '../utils/firestoreHelper';
import { getAgeGroup } from '../utils';
import logger from '../utils/logger';

/**
 * 通用天梯數據獲取 Hook
 * @param {Object} options - 配置選項
 * @param {string} options.metricId - 指標 ID (預設: 'total')
 * @param {string} options.filterAgeGroup - 年齡段篩選 (預設: 'all')
 * @param {number} options.pageSize - 每頁數量 (預設: 50)
 * @param {boolean} options.enabled - 是否啟用查詢 (預設: true)
 * @returns {Object} 返回數據和狀態
 */
export const useLadderData = ({
  metricId = 'total',
  filterAgeGroup = 'all',
  pageSize = 50,
  enabled = true,
} = {}) => {
  const [ladderData, setLadderData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  const loadingRef = useRef(false);
  const lastParamsRef = useRef(null);

  // 獲取指標配置
  const metricConfig = getMetricConfig(metricId);

  // 從用戶數據中提取指標值
  const extractMetricValue = useCallback(
    docData => {
      if (!metricConfig) return 0;

      // 處理簡單字段（如 ladderScore）
      if (metricConfig.dbField === 'ladderScore') {
        return Number(docData.ladderScore) || 0;
      }

      // 處理嵌套字段路徑（例如 'testInputs.strength.benchPress.max'）
      const fieldPath = metricConfig.dbField.split('.');
      let value = docData;

      for (const field of fieldPath) {
        if (value && typeof value === 'object' && field in value) {
          value = value[field];
        } else {
          return 0;
        }
      }

      return Number(value) || 0;
    },
    [metricConfig]
  );

  // 構建 Firestore 查詢
  const buildQuery = useCallback(
    (startAfterDoc = null) => {
      if (!metricConfig) {
        logger.error('無效的指標配置:', metricId);
        return null;
      }

      // 對於簡單字段（如 ladderScore），直接使用
      // 對於嵌套字段，使用第一層字段進行排序（Firestore 限制）
      const sortField = metricConfig.dbField.split('.')[0];

      // 構建基礎查詢
      let q = query(
        collection(db, 'users'),
        orderBy(sortField, metricConfig.sortOrder),
        limit(pageSize * 2) // 獲取更多數據以便客戶端過濾
      );

      // 如果有分頁標記，添加 startAfter
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      return q;
    },
    [metricConfig, pageSize]
  );

  // 載入天梯數據
  const loadLadderData = useCallback(
    async (reset = false) => {
      if (!enabled || !metricConfig) {
        return;
      }

      // 防止重複載入
      if (loadingRef.current) {
        logger.debug('正在載入中，跳過重複請求');
        return;
      }

      // 檢查參數是否變化
      const currentParams = JSON.stringify({ metricId, filterAgeGroup });
      if (
        !reset &&
        lastParamsRef.current === currentParams &&
        ladderData.length > 0
      ) {
        logger.debug('參數未變化且已有數據，跳過載入');
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const startAfterDoc = reset ? null : lastDoc;
        const q = buildQuery(startAfterDoc);

        if (!q) {
          throw new Error('無法構建查詢');
        }

        logger.debug('🚀 開始載入天梯數據...', {
          metricId,
          filterAgeGroup,
          pageSize,
        });

        // 使用安全查詢
        const querySnapshot = await safeGetDocs(q, {
          maxRetries: 3,
          retryDelay: 1000,
          onRetry: (retryCount, maxRetries, delay) => {
            logger.warn(
              `🔄 載入天梯數據重試 (${retryCount}/${maxRetries})，${delay}ms 後重試...`
            );
          },
        });

        let data = [];

        querySnapshot.forEach(doc => {
          const docData = doc.data();
          const metricValue = extractMetricValue(docData);

          // 只包含有有效值的用戶
          if (metricValue > 0) {
            // 年齡段篩選
            if (filterAgeGroup !== 'all') {
              const age = docData.age;
              if (age) {
                const userAgeGroup = getAgeGroup(Number(age));
                if (userAgeGroup !== filterAgeGroup) {
                  return; // 跳過不符合年齡段的用戶
                }
              } else {
                return; // 沒有年齡信息的用戶在非 'all' 模式下跳過
              }
            }

            data.push({
              id: doc.id,
              ...docData,
              metricValue,
            });
          }
        });

        // 客戶端排序（因為 Firestore 可能無法直接排序嵌套字段）
        data.sort((a, b) => {
          if (metricConfig.sortOrder === 'desc') {
            return b.metricValue - a.metricValue;
          }
          return a.metricValue - b.metricValue;
        });

        // 限制返回數量
        const limitedData = data.slice(0, pageSize);

        if (reset) {
          setLadderData(limitedData);
        } else {
          setLadderData(prev => [...prev, ...limitedData]);
        }

        // 更新分頁狀態
        if (
          limitedData.length < pageSize ||
          querySnapshot.size < pageSize * 2
        ) {
          setHasMore(false);
        } else {
          const lastDocument =
            querySnapshot.docs[querySnapshot.docs.length - 1];
          setLastDoc(lastDocument);
        }

        lastParamsRef.current = currentParams;
        logger.debug(`✅ 載入完成，獲取 ${limitedData.length} 條記錄`);
      } catch (err) {
        logger.error('載入天梯數據失敗:', err);
        setError(err.message);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [
      enabled,
      metricConfig,
      metricId,
      filterAgeGroup,
      pageSize,
      buildQuery,
      extractMetricValue,
      lastDoc,
      ladderData.length,
    ]
  );

  // 獲取用戶排名
  const fetchUserRank = useCallback(
    async userId => {
      if (!enabled || !metricConfig || !userId) {
        return;
      }

      try {
        const q = buildQuery();
        if (!q) return;

        const querySnapshot = await safeGetDocs(q, {
          maxRetries: 2,
          retryDelay: 500,
        });

        let rank = 1;
        let found = false;

        // 構建所有用戶數據並排序
        const allUsers = [];
        querySnapshot.forEach(doc => {
          const docData = doc.data();
          const metricValue = extractMetricValue(docData);
          if (metricValue > 0) {
            allUsers.push({
              id: doc.id,
              metricValue,
            });
          }
        });

        // 排序
        allUsers.sort((a, b) => {
          if (metricConfig.sortOrder === 'desc') {
            return b.metricValue - a.metricValue;
          }
          return a.metricValue - b.metricValue;
        });

        // 查找用戶排名
        const userIndex = allUsers.findIndex(user => user.id === userId);
        if (userIndex >= 0) {
          setUserRank(userIndex + 1);
          found = true;
        }

        if (!found) {
          setUserRank(null);
        }
      } catch (err) {
        logger.error('獲取用戶排名失敗:', err);
        setUserRank(null);
      }
    },
    [enabled, metricConfig, buildQuery, extractMetricValue]
  );

  // 初始載入
  useEffect(() => {
    if (enabled && metricConfig) {
      loadLadderData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricId, filterAgeGroup]); // 只在 metricId 或 filterAgeGroup 變化時重新載入

  return {
    ladderData,
    userRank,
    loading,
    error,
    hasMore,
    loadMore: () => loadLadderData(false),
    refresh: () => loadLadderData(true),
    fetchUserRank,
  };
};
