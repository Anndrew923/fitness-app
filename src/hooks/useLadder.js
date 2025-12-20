import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { formatScore, getAgeGroup } from '../utils.js';
import { safeGetDocs } from '../utils/firestoreHelper';
import LadderLikeSystem from '../utils/ladderLikeSystem';
import logger from '../utils/logger';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for Ladder data management
 * Handles all Firestore interactions, pagination, and state
 */
export const useLadder = () => {
  const { userData } = useUser();
  const { t } = useTranslation();
  const [ladderData, setLadderData] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedTab, setSelectedTab] = useState('total');
  const [selectedDivision, setSelectedDivision] = useState('ladderScore');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [displayStartRank, setDisplayStartRank] = useState(1);
  const [likeProcessing, setLikeProcessing] = useState(new Set());
  const [likedUsers, setLikedUsers] = useState(new Set());

  const loadingRef = useRef(false);
  const lastLoadParamsRef = useRef(null);
  const forceReloadRef = useRef(false);
  const hasInitialPageSetRef = useRef(false);
  const hasDataRef = useRef(false);

  const usersPerPage = 50;

  /**
   * Build dynamic query based on filters
   * Future expansion: supports job, region filters
   * Note: We always query by ladderScore for Firestore index compatibility,
   * then sort client-side by selectedDivision
   */
  const buildQuery = useCallback((filters = {}) => {
    // Base query: always orderBy ladderScore (has index)
    // Client-side sorting will handle selectedDivision
    let q = query(collection(db, 'users'), orderBy('ladderScore', 'desc'));

    // Future expansion: if (filters.job) ...
    // Future expansion: if (filters.region) ...

    // Limit for performance (can be adjusted for pagination with cursors)
    q = query(q, limit(200));

    return q;
  }, []);

  /**
   * Load ladder data from Firestore
   */
  const loadLadderData = useCallback(async () => {
    // Prevent duplicate loading
    if (loadingRef.current) {
      logger.debug('🔄 正在載入中，跳過重複請求');
      return;
    }

    // Create load params key for debouncing
    const loadParams = {
      selectedAgeGroup,
      selectedTab,
      selectedDivision,
      userLadderScore: userData?.ladderScore || 0,
      userCity: userData?.city || '',
      userDistrict: userData?.district || '',
    };

    // Check if params changed, skip if same (unless force reload)
    if (
      !forceReloadRef.current &&
      lastLoadParamsRef.current &&
      JSON.stringify(lastLoadParamsRef.current) === JSON.stringify(loadParams)
    ) {
      logger.debug('🔄 載入參數未變化，跳過重複載入');
      return;
    }

    forceReloadRef.current = false;
    lastLoadParamsRef.current = loadParams;
    loadingRef.current = true;

    // Silent refresh if data already exists
    if (ladderData.length === 0) {
      setLoading(true);
    } else {
      logger.debug('🔄 執行無感更新 (Silent Refresh)，保留目前列表視圖');
    }

    try {
      logger.debug('🚀 開始載入天梯數據...', loadParams);

      const q = buildQuery({ 
        ageGroup: selectedAgeGroup, 
        tab: selectedTab,
        sortBy: selectedDivision,
      });
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
      logger.debug(`📥 從 Firebase 獲取到 ${querySnapshot.size} 個文檔`);

      querySnapshot.forEach(doc => {
        const docData = doc.data();
        if (docData.ladderScore > 0) {
          const isAnonymous = docData.isAnonymousInLadder === true;
          const userWithAgeGroup = {
            ...docData,
            ageGroup: docData.age
              ? getAgeGroup(Number(docData.age))
              : docData.ageGroup || '',
          };

          data.push({
            id: doc.id,
            ...userWithAgeGroup,
            displayName: isAnonymous
              ? t('community.fallback.anonymousUser')
              : docData.nickname ||
                docData.email?.split('@')[0] ||
                t('community.fallback.unnamedUser'),
            avatarUrl: isAnonymous ? '' : docData.avatarUrl,
            isAnonymous: isAnonymous,
            scores: docData.scores || {
              strength: 0,
              explosivePower: 0,
              cardio: 0,
              muscleMass: 0,
              bodyFat: 0,
            },
            profession: docData.profession || '',
            weeklyTrainingHours: docData.weeklyTrainingHours || 0,
            trainingYears: docData.trainingYears || 0,
            country: docData.country || '',
            region: docData.region || '',
            city: docData.city || '',
            district: docData.district || '',
            ladderLikeCount: docData.ladderLikeCount || 0,
            ladderLikes: docData.ladderLikes || [],
            isVerified: docData.isVerified === true,
          });
        }
      });

      logger.debug(`📊 過濾後有分數的用戶：${data.length} 名`);

      // Client-side filtering: Age Group
      if (selectedAgeGroup !== 'all') {
        const beforeFilterCount = data.length;
        data = data.filter(user => user.ageGroup === selectedAgeGroup);
        logger.debug(
          `👥 年齡段過濾：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Weekly
      if (selectedTab === 'weekly') {
        const beforeFilterCount = data.length;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        data = data.filter(user => {
          if (!user.lastActive) return false;
          const lastActive = new Date(user.lastActive);
          return lastActive >= oneWeekAgo;
        });
        logger.debug(
          `📅 本周新進榜過濾：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Verified
      if (selectedTab === 'verified') {
        const beforeFilterCount = data.length;
        data = data.filter(user => user.isVerified === true);
        logger.debug(
          `🏅 榮譽認證過濾：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Local District
      if (selectedDivision === 'local_district') {
        const beforeFilterCount = data.length;
        const currentUserCity = userData?.city || '';
        const currentUserDistrict = userData?.district || '';
        
        if (!currentUserCity || !currentUserDistrict) {
          // User hasn't set location, return empty list
          logger.debug('📍 用戶未設定地區，返回空列表');
          data = [];
        } else {
          data = data.filter(user => {
            const userCity = user.city || '';
            const userDistrict = user.district || '';
            return userCity === currentUserCity && userDistrict === currentUserDistrict;
          });
          logger.debug(
            `📍 地區過濾 (${currentUserCity} ${currentUserDistrict})：${beforeFilterCount} → ${data.length} 名用戶`
          );
        }
      }

      // Re-sort based on selected division
      // For local_district, always sort by ladderScore (descending)
      const sortField = selectedDivision === 'local_district' ? 'ladderScore' : selectedDivision;
      data.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        // Special case: Body Fat (lower is better)
        if (sortField === 'stats_bodyFat') {
          // Handle missing data: push to bottom (undefined, null, or invalid)
          const aHasData = aValue !== undefined && aValue !== null && !isNaN(aValue);
          const bHasData = bValue !== undefined && bValue !== null && !isNaN(bValue);
          
          if (!aHasData && !bHasData) return 0; // Both missing, keep order
          if (!aHasData) return 1; // a missing, push to bottom
          if (!bHasData) return -1; // b missing, push to bottom
          
          // Both have data: sort ascending (lower is better)
          return aValue - bValue;
        }
        
        // Default: Higher is better (descending)
        const aVal = aValue || 0;
        const bVal = bValue || 0;
        return bVal - aVal;
      });

      // Calculate user rank and pagination
      let displayData = [];
      let actualUserRank = 0;
      let startRank = 1;

      setTotalUsers(data.length);

      if (userData && userData.ladderScore > 0) {
        const userRankIndex = data.findIndex(
          user =>
            user.id === userData.userId || user.id === auth.currentUser?.uid
        );
        actualUserRank = userRankIndex >= 0 ? userRankIndex + 1 : 0;

        if (actualUserRank > 0) {
          const calculatedUserPage = Math.ceil(actualUserRank / usersPerPage);
          setUserRank(actualUserRank);

          // Auto-jump to user page on first load
          if (!hasInitialPageSetRef.current && calculatedUserPage > 1) {
            setCurrentPage(calculatedUserPage);
            hasInitialPageSetRef.current = true;
          }

          const startIndex = (currentPage - 1) * usersPerPage;
          const endIndex = startIndex + usersPerPage;

          if (startIndex < data.length) {
            displayData = data.slice(startIndex, endIndex);
            startRank = startIndex + 1;
          } else {
            const lastPageStart = Math.max(0, data.length - usersPerPage);
            displayData = data.slice(lastPageStart);
            startRank = lastPageStart + 1;
            const lastPage = Math.ceil(data.length / usersPerPage) || 1;
            setCurrentPage(lastPage);
          }
        } else {
          displayData = data.slice(0, usersPerPage);
          startRank = 1;
          setUserRank(0);
        }
      } else {
        displayData = data.slice(0, usersPerPage);
        startRank = 1;
        setUserRank(0);
      }

      logger.debug(
        `📊 天梯數據載入完成：顯示 ${displayData.length} 名用戶，用戶排名：第 ${actualUserRank} 名，起始排名：第 ${startRank} 名`
      );

      setDisplayStartRank(startRank);
      setLadderData(displayData);
      hasDataRef.current = displayData.length > 0;
      setError(null);
    } catch (err) {
      logger.error('載入天梯數據失敗:', err);
      setError(err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [
    selectedAgeGroup,
    selectedTab,
    selectedDivision,
    userData,
    currentPage,
    ladderData.length,
    buildQuery,
    t,
  ]);

  /**
   * Refresh data (for pull-to-refresh)
   */
  const refresh = useCallback(() => {
    forceReloadRef.current = true;
    lastLoadParamsRef.current = null;
    loadLadderData();
  }, [loadLadderData]);

  /**
   * Load more data (for pagination)
   */
  const loadMore = useCallback(() => {
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalUsers, usersPerPage]);

  /**
   * Toggle like for a user
   */
  const toggleLike = useCallback(
    async userId => {
      if (!auth.currentUser) {
        return;
      }

      if (likeProcessing.has(userId)) {
        return;
      }

      const isLiked = likedUsers.has(userId);

      // Optimistic update
      setLikedUsers(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });

      setLadderData(prevData =>
        prevData.map(user =>
          user.id === userId
            ? {
                ...user,
                ladderLikeCount: isLiked
                  ? Math.max((user.ladderLikeCount || 0) - 1, 0)
                  : (user.ladderLikeCount || 0) + 1,
              }
            : user
        )
      );

      setLikeProcessing(prev => new Set(prev).add(userId));

      try {
        const result = isLiked
          ? await LadderLikeSystem.unlikeUser(userId)
          : await LadderLikeSystem.likeUser(userId);

        if (!result.success) {
          // Rollback optimistic update
          setLikedUsers(prev => {
            const newSet = new Set(prev);
            if (isLiked) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return newSet;
          });

          setLadderData(prevData =>
            prevData.map(user =>
              user.id === userId
                ? {
                    ...user,
                    ladderLikeCount: isLiked
                      ? (user.ladderLikeCount || 0) + 1
                      : Math.max((user.ladderLikeCount || 0) - 1, 0),
                  }
                : user
            )
          );
        }
      } catch (err) {
        logger.error('點讚操作失敗:', err);
        // Rollback
        setLikedUsers(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });

        setLadderData(prevData =>
          prevData.map(user =>
            user.id === userId
              ? {
                  ...user,
                  ladderLikeCount: isLiked
                    ? (user.ladderLikeCount || 0) + 1
                    : Math.max((user.ladderLikeCount || 0) - 1, 0),
                }
              : user
          )
        );
      } finally {
        setLikeProcessing(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [likedUsers, likeProcessing]
  );

  /**
   * Load like status for displayed users
   */
  useEffect(() => {
    if (!auth.currentUser || ladderData.length === 0) return;

    const loadLikeStatus = async () => {
      const likedSet = new Set();
      for (const user of ladderData) {
        if (user.id === auth.currentUser.uid) continue;
        try {
          const isLiked = await LadderLikeSystem.checkIfLiked(user.id);
          if (isLiked) {
            likedSet.add(user.id);
          }
        } catch (err) {
          logger.error(`檢查用戶 ${user.id} 點讚狀態失敗:`, err);
        }
      }
      setLikedUsers(likedSet);
    };

    loadLikeStatus();
  }, [ladderData]);

  /**
   * Initial load and reload on filter changes
   */
  useEffect(() => {
    if (userData) {
      setLadderData([]);
      setLoading(true);
      setCurrentPage(1);
      hasInitialPageSetRef.current = false;
      hasDataRef.current = false;
    }
  }, [selectedAgeGroup, selectedTab, selectedDivision, userData]);

  useEffect(() => {
    if (userData) {
      loadLadderData();
    }
  }, [userData, selectedAgeGroup, selectedTab, currentPage, loadLadderData]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalUsers / usersPerPage);
  }, [totalUsers, usersPerPage]);

  return {
    // State
    ladderData,
    userRank,
    loading,
    error,
    selectedAgeGroup,
    selectedTab,
    selectedDivision,
    currentPage,
    totalPages,
    totalUsers,
    displayStartRank,
    likedUsers,
    likeProcessing,

    // Actions
    setSelectedAgeGroup,
    setSelectedTab,
    setSelectedDivision,
    setCurrentPage,
    refresh,
    loadMore,
    toggleLike,
    buildQuery, // Expose for future expansion
  };
};
