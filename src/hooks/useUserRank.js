import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import logger from '../utils/logger';

/**
 * Custom hook to fetch a single user's rank efficiently
 * Uses Firestore aggregation query (getCountFromServer) for performance
 *
 * @param {number} ladderScore - User's ladder score
 * @param {number} rankProp - Optional rank prop from parent (if provided, skips fetch)
 * @returns {Object} { rank, loading, error }
 */
export const useUserRank = (ladderScore, rankProp = null) => {
  const [rank, setRank] = useState(
    rankProp !== null && rankProp !== undefined ? rankProp : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);
  const lastScoreRef = useRef(null);

  useEffect(() => {
    // Scenario A: Use prop if provided (e.g., from Ladder page)
    if (rankProp !== null && rankProp !== undefined) {
      setRank(rankProp);
      setLoading(false);
      setError(null);
      return;
    }

    // Scenario B: Fetch rank if score is valid
    if (!ladderScore || ladderScore <= 0) {
      setRank(0);
      setLoading(false);
      setError(null);
      lastScoreRef.current = ladderScore;
      return;
    }

    // Skip if score hasn't changed
    if (lastScoreRef.current === ladderScore) {
      return;
    }

    isMountedRef.current = true;
    lastScoreRef.current = ladderScore;

    const fetchRank = async () => {
      setLoading(true);
      setError(null);

      try {
        logger.debug('🔍 開始獲取用戶排名...', { ladderScore });

        // Count how many users have a higher score
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('ladderScore', '>', ladderScore));

        const snapshot = await getCountFromServer(q);

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) {
          logger.debug('⏹️ 組件已卸載，跳過狀態更新');
          return;
        }

        const higherScoreCount = snapshot.data().count;
        const calculatedRank = higherScoreCount + 1;

        logger.debug('✅ 排名獲取成功', {
          ladderScore,
          higherScoreCount,
          rank: calculatedRank,
        });

        setRank(calculatedRank);
      } catch (err) {
        // Check if component is still mounted before updating state
        if (!isMountedRef.current) {
          logger.debug('⏹️ 組件已卸載，跳過錯誤處理');
          return;
        }

        logger.error('❌ 排名獲取失敗', err);
        setError(err);
        // On error, set rank to null to show unranked state
        setRank(null);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchRank();

    // Cleanup: mark as unmounted
    return () => {
      isMountedRef.current = false;
    };
  }, [ladderScore, rankProp]);

  return { rank, loading, error };
};
