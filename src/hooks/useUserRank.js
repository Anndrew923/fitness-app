import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import logger from '../utils/logger';

// Cache configuration
const CACHE_TTL = 300000; // 5 minutes in milliseconds
const CACHE_KEY_PREFIX = 'ladder_rank_cache_';

/**
 * Get cache key for user
 */
const getCacheKey = userId => {
  return `${CACHE_KEY_PREFIX}${userId}`;
};

/**
 * Get cached rank from sessionStorage
 * @param {string} userId - User ID
 * @param {number} currentScore - Current ladder score (optional, for validation)
 * @returns {number|null} Cached rank or null
 */
const getCachedRank = (userId, currentScore = null) => {
  if (!userId) return null;
  try {
    const cacheKey = getCacheKey(userId);
    const cached = sessionStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const now = Date.now();
    const age = now - parsed.timestamp;

    // Check if cache is valid (TTL check)
    if (age >= CACHE_TTL) {
      logger.debug('⏰ 緩存已過期', {
        userId,
        age: Math.round(age / 1000) + 's',
      });
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    // If currentScore provided, also validate score match
    if (currentScore !== null && parsed.score !== currentScore) {
      logger.debug('🔄 分數已變更，緩存無效', {
        userId,
        cachedScore: parsed.score,
        currentScore,
      });
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    logger.debug('✅ 使用緩存排名', {
      userId,
      cachedRank: parsed.rank,
      cachedScore: parsed.score,
      age: Math.round(age / 1000) + 's',
    });
    return parsed.rank;
  } catch (err) {
    logger.warn('⚠️ 讀取緩存失敗', err);
    return null;
  }
};

/**
 * Save rank to sessionStorage
 */
const saveCachedRank = (userId, rank, score) => {
  if (!userId) return;
  try {
    const cacheKey = getCacheKey(userId);
    const cacheData = {
      rank,
      score,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    logger.debug('💾 保存排名到緩存', { userId, rank, score });
  } catch (err) {
    logger.warn('⚠️ 保存緩存失敗', err);
  }
};

/**
 * Custom hook to fetch a single user's rank efficiently
 * Uses Firestore aggregation query (getCountFromServer) for performance
 * ✅ Includes sessionStorage caching for instant load
 *
 * @param {number} ladderScore - User's ladder score
 * @param {number} rankProp - Optional rank prop from parent (if provided, skips fetch)
 * @param {string} userId - Optional user ID for caching (if not provided, uses auth.currentUser)
 * @returns {Object} { rank, loading, error }
 */
export const useUserRank = (ladderScore, rankProp = null, userId = null) => {
  // Get userId from auth if not provided
  const currentUserId = userId || auth.currentUser?.uid;

  // ✅ Try to get cached rank immediately (for instant load)
  // Validate score match during initialization for accurate cache
  const cachedRank =
    currentUserId && ladderScore > 0
      ? getCachedRank(currentUserId, ladderScore)
      : null;
  const initialRank =
    rankProp !== null && rankProp !== undefined
      ? rankProp
      : cachedRank !== null
      ? cachedRank
      : null;

  // ✅ If cache exists and score is valid, we don't need to show loading state
  const hasValidCache =
    cachedRank !== null && currentUserId && ladderScore && ladderScore > 0;

  const [rank, setRank] = useState(initialRank);
  // ✅ Initial loading state: false if we have cache or prop, true only if we need to fetch
  const [loading, setLoading] = useState(
    !hasValidCache &&
      rankProp === null &&
      rankProp === undefined &&
      ladderScore > 0
  );
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);
  const lastScoreRef = useRef(null);

  useEffect(() => {
    // Scenario A: Use prop if provided (e.g., from Ladder page)
    if (rankProp !== null && rankProp !== undefined) {
      setRank(rankProp);
      setLoading(false);
      setError(null);
      // Save to cache if userId is available
      if (currentUserId && ladderScore > 0) {
        saveCachedRank(currentUserId, rankProp, ladderScore);
      }
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

    // ✅ If we already have a cached rank from initial state, just verify and return
    if (currentUserId && rank === cachedRank && cachedRank !== null) {
      // Cache was already validated during initialization, just ensure state is correct
      setLoading(false);
      setError(null);
      lastScoreRef.current = ladderScore;
      return;
    }

    // ✅ Check cache if we don't have it yet (fallback check)
    if (currentUserId && rank !== cachedRank) {
      const cached = getCachedRank(currentUserId, ladderScore);
      if (cached !== null) {
        // Valid cache found, use it
        setRank(cached);
        setLoading(false);
        setError(null);
        lastScoreRef.current = ladderScore;
        logger.debug('⚡ 使用緩存排名（即時載入）', {
          userId: currentUserId,
          rank: cached,
          score: ladderScore,
        });
        return;
      }
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
        logger.debug('🔍 開始獲取用戶排名...', {
          ladderScore,
          userId: currentUserId,
        });

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

        // ✅ Save to cache after successful fetch
        if (currentUserId) {
          saveCachedRank(currentUserId, calculatedRank, ladderScore);
        }
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
  }, [ladderScore, rankProp, currentUserId]);

  return { rank, loading, error };
};
