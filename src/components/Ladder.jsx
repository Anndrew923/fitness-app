import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useUser } from '../UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatScore, getAgeGroup } from '../utils';
import './Ladder.css';
import { useTranslation } from 'react-i18next';
import LadderUserCard from './LadderUserCard';
import LadderLikeSystem from '../utils/ladderLikeSystem';

const Ladder = () => {
  const { userData } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ladderData, setLadderData] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedTab, setSelectedTab] = useState('total'); // 'total'、'weekly' 或 'verified'
  const [loading, setLoading] = useState(true);
  const [showUserContext, setShowUserContext] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [selectedUserForCard, setSelectedUserForCard] = useState(null);
  // const lastLadderScoreRef = useRef(null);
  const lastConditionCheckRef = useRef(null);
  const lastLoadParamsRef = useRef(null);
  const forceReloadRef = useRef(false);
  const loadingRef = useRef(false);
  const forceReloadProcessedRef = useRef(false);
  // ✅ 新增：記錄上次的 country 和 region，用於檢測變化
  const lastCountryRegionRef = useRef(null);
  // ✅ 新增：記錄是否已執行首次自動滾動
  const hasAutoScrolledRef = useRef(false);
  // ✅ 新增：記錄顯示的起始排名
  const [displayStartRank, setDisplayStartRank] = useState(1);
  // ✅ 新增：點讚相關狀態
  const [likeProcessing, setLikeProcessing] = useState(new Set());
  const [likedUsers, setLikedUsers] = useState(new Set());
  // ✅ 新增：提醒框相關狀態
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  // ✅ 新增：分頁相關狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userPage, setUserPage] = useState(0); // 用戶所在頁面
  const hasInitialPageSetRef = useRef(false); // 記錄是否已設置初始頁面

  const ageGroups = useMemo(
    () => [
      { value: 'all', label: t('ladder.ageGroups.all') },
      { value: 'under20', label: t('ladder.ageGroups.under20') },
      { value: '21to30', label: t('ladder.ageGroups.21to30') },
      { value: '31to40', label: t('ladder.ageGroups.31to40') },
      { value: '41to50', label: t('ladder.ageGroups.41to50') },
      { value: '51to60', label: t('ladder.ageGroups.51to60') },
      { value: '61to70', label: t('ladder.ageGroups.61to70') },
      { value: 'over70', label: t('ladder.ageGroups.over70') },
      { value: 'unknown', label: t('ladder.ageGroups.unknown') },
    ],
    [t]
  );

  // ✅ 新增：檢查並顯示提醒框（需要在 loadLadderData 之前定義）
  const checkAndShowNotification = useCallback(newRank => {
    try {
      // 讀取更新通知數據
      const savedNotification = localStorage.getItem(
        'ladderUpdateNotification'
      );
      if (!savedNotification) {
        return; // 沒有通知數據，不顯示
      }

      const notification = JSON.parse(savedNotification);

      // 檢查是否已顯示過
      if (notification.hasShown) {
        return; // 已顯示過，不重複顯示
      }

      // 檢查時間戳（5分鐘內有效）
      const timeDiff = Date.now() - notification.timestamp;
      if (timeDiff > 5 * 60 * 1000) {
        // 超過5分鐘，清除通知
        localStorage.removeItem('ladderUpdateNotification');
        return;
      }

      // 更新排名數據
      notification.newRank = newRank;
      notification.oldRank = notification.oldRank || 0;

      // ✅ 判斷變化類型
      const scoreImproved = notification.newScore > notification.oldScore;
      const rankImproved =
        notification.oldRank > 0 && notification.newRank < notification.oldRank;

      // 判斷提醒框類型
      if (notification.isFirstTime) {
        notification.type = 'first-time'; // 初次進榜 - 金紅色
      } else if (scoreImproved || rankImproved) {
        notification.type = 'improved'; // 提升 - 金紅色
      } else {
        // ✅ 修改：持平、退步、排名下滑都用金屬灰
        notification.type = 'declined'; // 持平、退步、排名下滑 - 金屬灰
      }

      // 設置提醒框數據並顯示
      setNotificationData(notification);
      setShowNotification(true);

      // 標記為已顯示
      notification.hasShown = true;
      localStorage.setItem(
        'ladderUpdateNotification',
        JSON.stringify(notification)
      );
    } catch (error) {
      console.error('檢查提醒框失敗:', error);
    }
  }, []);

  // 使用 useCallback 優化 loadLadderData 函數
  const loadLadderData = useCallback(async () => {
    // 防止重複載入
    if (loadingRef.current) {
      console.log('🔄 正在載入中，跳過重複請求');
      return;
    }

    // 創建載入參數的鍵值，用於防抖
    const loadParams = {
      selectedAgeGroup,
      selectedTab,
      userLadderScore: userData?.ladderScore || 0,
    };

    // 檢查是否與上次載入參數相同，避免重複載入
    // 但如果是強制重新載入，則忽略這個檢查
    if (
      !forceReloadRef.current &&
      lastLoadParamsRef.current &&
      JSON.stringify(lastLoadParamsRef.current) === JSON.stringify(loadParams)
    ) {
      console.log('🔄 載入參數未變化，跳過重複載入');
      return;
    }

    // 重置強制重新載入標記
    forceReloadRef.current = false;

    // 更新載入參數
    lastLoadParamsRef.current = loadParams;

    // 設置載入狀態
    loadingRef.current = true;
    setLoading(true);
    try {
      console.log('🚀 開始載入天梯數據...', loadParams);

      // 優化：使用更大的 limit 來減少查詢次數
      const q = query(
        collection(db, 'users'),
        orderBy('ladderScore', 'desc'),
        limit(200) // 增加到200名，確保涵蓋更多用戶
      );

      const querySnapshot = await getDocs(q);
      let data = [];

      console.log(`📥 從 Firebase 獲取到 ${querySnapshot.size} 個文檔`);

      querySnapshot.forEach(doc => {
        const docData = doc.data();
        // 所有有分數的用戶都參與天梯排名
        if (docData.ladderScore > 0) {
          const isAnonymous = docData.isAnonymousInLadder === true;
          // 確保年齡段被正確計算
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
            // ✅ 新增：載入 scores 數據用於雷達圖
            scores: docData.scores || {
              strength: 0,
              explosivePower: 0,
              cardio: 0,
              muscleMass: 0,
              bodyFat: 0,
            },
            // ✅ 新增：保留訓練背景資訊
            profession: docData.profession || '',
            weeklyTrainingHours: docData.weeklyTrainingHours || 0,
            trainingYears: docData.trainingYears || 0,
            // ✅ 新增：排行榜資訊
            country: docData.country || '',
            region: docData.region || '',
            // ✅ 新增：點讚相關數據
            ladderLikeCount: docData.ladderLikeCount || 0,
            ladderLikes: docData.ladderLikes || [],
            // ✅ 優化：明確添加認證狀態，確保類型一致性
            isVerified: docData.isVerified === true,
          });
        }
      });

      console.log(`📊 過濾後有分數的用戶：${data.length} 名`);

      // 客戶端過濾年齡分段
      if (selectedAgeGroup !== 'all') {
        const beforeFilterCount = data.length;
        console.log(`🔍 年齡段篩選調試 - 選擇的年齡段: ${selectedAgeGroup}`);
        console.log(
          `🔍 年齡段篩選調試 - 篩選前的用戶年齡段分布:`,
          data.reduce((acc, user) => {
            acc[user.ageGroup] = (acc[user.ageGroup] || 0) + 1;
            return acc;
          }, {})
        );

        data = data.filter(user => {
          const matches = user.ageGroup === selectedAgeGroup;
          if (!matches) {
            console.log(
              `🔍 用戶 ${user.displayName} (年齡: ${user.age}, 年齡段: ${user.ageGroup}) 不符合篩選條件 ${selectedAgeGroup}`
            );
          }
          return matches;
        });

        console.log(
          `👥 年齡段過濾：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // 客戶端過濾本周新進榜
      if (selectedTab === 'weekly') {
        const beforeFilterCount = data.length;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        data = data.filter(user => {
          if (!user.lastActive) return false;
          const lastActive = new Date(user.lastActive);
          return lastActive >= oneWeekAgo;
        });
        console.log(
          `📅 本周新進榜過濾：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // ✅ 新增：客戶端過濾通過榮譽認證的用戶
      if (selectedTab === 'verified') {
        const beforeFilterCount = data.length;
        data = data.filter(user => user.isVerified === true);
        console.log(
          `🏅 榮譽認證過濾：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // 重新排序
      data.sort((a, b) => b.ladderScore - a.ladderScore);

      // ✅ 修改：先計算用戶的實際排名，再決定顯示範圍（支持分頁）
      let displayData = [];
      let actualUserRank = 0;
      let startRank = 1; // 記錄起始排名（用於顯示）
      const usersPerPage = 50; // 每頁顯示50名

      // 保存總用戶數
      setTotalUsers(data.length);

      if (userData && userData.ladderScore > 0) {
        // 計算用戶在過濾後數據中的排名
        const userRankIndex = data.findIndex(
          user =>
            user.id === userData.userId || user.id === auth.currentUser?.uid
        );
        actualUserRank = userRankIndex >= 0 ? userRankIndex + 1 : 0;

        if (actualUserRank > 0) {
          // 計算用戶所在頁面
          const calculatedUserPage = Math.ceil(actualUserRank / usersPerPage);
          setUserPage(calculatedUserPage);

          // ✅ 新增：首次載入時，如果用戶不在第一頁，自動跳轉到用戶所在頁
          if (!hasInitialPageSetRef.current && calculatedUserPage > 1) {
            setCurrentPage(calculatedUserPage);
            hasInitialPageSetRef.current = true;
          }

          // 根據當前頁面計算顯示範圍
          const startIndex = (currentPage - 1) * usersPerPage;
          const endIndex = startIndex + usersPerPage;
          
          // 確保索引不超出範圍
          if (startIndex < data.length) {
            displayData = data.slice(startIndex, endIndex);
            startRank = startIndex + 1;
          } else {
            // 如果當前頁超出範圍，顯示最後一頁
            const lastPageStart = Math.max(0, data.length - usersPerPage);
            displayData = data.slice(lastPageStart);
            startRank = lastPageStart + 1;
            const lastPage = Math.ceil(data.length / usersPerPage) || 1;
            setCurrentPage(lastPage);
          }

          setUserRank(actualUserRank);
          // ✅ 檢查並顯示提醒框（排名計算完成後）
          checkAndShowNotification(actualUserRank);
          
          console.log(
            `🎯 用戶實際排名：第 ${actualUserRank} 名，總共 ${data.length} 名用戶，所在頁面：第 ${calculatedUserPage} 頁，當前顯示：第 ${currentPage} 頁`
          );
        } else {
          // 用戶不在過濾後的數據中，顯示第一頁
          displayData = data.slice(0, usersPerPage);
          startRank = 1;
          setUserPage(0);
          setUserRank(0);
          console.log(
            `📋 用戶不在過濾後的數據中，顯示前 ${displayData.length} 名`
          );
        }
      } else {
        // 用戶沒有分數，顯示第一頁
        displayData = data.slice(0, usersPerPage);
        startRank = 1;
        setUserPage(0);
        setUserRank(0);
        console.log(`📋 用戶沒有分數，顯示前 ${displayData.length} 名`);
      }

      console.log(
        `📊 天梯數據載入完成：顯示 ${displayData.length} 名用戶，用戶排名：第 ${actualUserRank} 名，起始排名：第 ${startRank} 名`
      );

      setDisplayStartRank(startRank);
      setLadderData(displayData);

      // 路由狀態已在 useEffect 中清除，這裡不需要重複清除
    } catch (error) {
      console.error('載入天梯數據失敗:', error);
      console.error('錯誤詳情:', {
        selectedAgeGroup,
        selectedTab,
        errorCode: error.code,
        errorMessage: error.message,
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
      // 重置強制重新載入處理標記
      forceReloadProcessedRef.current = false;
    }
  }, [selectedAgeGroup, selectedTab, userData, currentPage]);

  // ✅ 新增：分頁控制函數
  const totalPages = useMemo(() => {
    return Math.ceil(totalUsers / 50);
  }, [totalUsers]);

  const goToPage = useCallback((page) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
    hasAutoScrolledRef.current = false; // 重置自動滾動標記
    // 滾動到頂部，方便查看新頁面
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  // ✅ 新增：處理下拉表單頁面選擇
  const handlePageSelect = useCallback((e) => {
    const selectedPage = parseInt(e.target.value, 10);
    if (selectedPage && selectedPage >= 1 && selectedPage <= totalPages) {
      goToPage(selectedPage);
    }
  }, [totalPages, goToPage]);

  // ✅ 新增：切換年齡段或標籤時重置分頁
  useEffect(() => {
    setCurrentPage(1);
    hasInitialPageSetRef.current = false;
    hasAutoScrolledRef.current = false;
  }, [selectedAgeGroup, selectedTab]);

  // 合併所有載入觸發條件到一個 useEffect
  useEffect(() => {
    // 初始化時載入數據
    if (userData && !location.state?.forceReload) {
      loadLadderData();
    }
  }, [
    userData,
    selectedAgeGroup,
    selectedTab,
    loadLadderData,
    location.state?.forceReload,
  ]);

  // ✅ 新增：監聽 country 和 region 變化，自動重新載入天梯資料
  useEffect(() => {
    if (!userData) return;

    const currentCountryRegion = `${userData.country || ''}-${
      userData.region || ''
    }`;
    const lastCountryRegion = lastCountryRegionRef.current;

    // 如果 country 或 region 有變化，且不是首次載入
    if (
      lastCountryRegion !== null &&
      currentCountryRegion !== lastCountryRegion &&
      !loading
    ) {
      console.log(
        '🔄 檢測到國家/城市變化，等待 Firebase 寫入完成後重新載入天梯資料'
      );
      // 等待 1 秒，確保 Firebase 寫入完成並同步
      const reloadTimer = setTimeout(() => {
        // 設置強制重新載入標記
        forceReloadRef.current = true;
        // 清除載入參數緩存，確保重新載入
        lastLoadParamsRef.current = null;
        // 重新載入天梯資料
        loadLadderData();
      }, 1000); // 等待 1 秒，確保 Firebase 寫入完成

      // 清理定時器
      return () => clearTimeout(reloadTimer);
    }

    // 更新記錄
    lastCountryRegionRef.current = currentCountryRegion;
  }, [userData?.country, userData?.region, loading, loadLadderData]);

  // 監聽路由狀態變化，處理強制重新載入
  useEffect(() => {
    if (
      location.state?.forceReload &&
      userData &&
      !forceReloadProcessedRef.current
    ) {
      console.log('🔄 檢測到強制重新載入標記，立即重新載入天梯數據');

      // 設置已處理標記，避免重複處理
      forceReloadProcessedRef.current = true;

      // 立即清除路由狀態，避免重複觸發
      window.history.replaceState({}, document.title);

      // 使用 setTimeout 確保在當前渲染週期完成後執行
      setTimeout(() => {
        forceReloadRef.current = true;
        // 清除載入參數緩存，確保重新載入
        lastLoadParamsRef.current = null;

        // 直接載入天梯數據，不需要重新載入用戶數據
        // 因為用戶數據已經在 UserInfo 頁面更新過了
        loadLadderData();
      }, 0);
    }
  }, [location.state, userData, loadLadderData]);

  // ✅ 修改：首次載入或分頁切換時自動滾動到用戶排名位置（優化版本）
  useEffect(() => {
    if (
      !loading &&
      ladderData.length > 0 &&
      userRank > 0 &&
      !hasAutoScrolledRef.current
    ) {
      // 檢查用戶是否在顯示的數據中
      const userInDisplay = ladderData.some(
        user =>
          user.id === userData?.userId || user.id === auth.currentUser?.uid
      );

      if (userInDisplay) {
        // 用戶在顯示的數據中，自動滾動到用戶排名位置
        // 使用多層延遲確保 DOM 完全渲染
        const scrollTimer = setTimeout(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const userElement = document.querySelector(
                `[data-user-id="${userData?.userId || auth.currentUser?.uid}"]`
              );
              if (userElement) {
                // 計算用戶元素的實際位置
                const elementRect = userElement.getBoundingClientRect();
                const elementTop = elementRect.top;
                const currentScrollY =
                  window.scrollY || document.documentElement.scrollTop;
                const targetScrollY = currentScrollY + elementTop;

                // 使用 window.scrollTo 精確滾動到用戶位置（考慮可能的固定 header）
                window.scrollTo({
                  top: Math.max(0, targetScrollY),
                  behavior: 'smooth',
                });
                console.log(
                  '✅ 自動滾動到用戶排名:',
                  userRank,
                  '目標位置:',
                  targetScrollY
                );
                hasAutoScrolledRef.current = true;
              }
            });
          });
        }, 500); // 縮短延遲，因為 ScrollToTop 已經不會干擾

        return () => clearTimeout(scrollTimer);
      } else {
        // 用戶不在顯示的數據中（例如排名太後面），標記為已處理
        hasAutoScrolledRef.current = true;
        console.log('✅ 用戶不在顯示的數據中，無需滾動');
      }
    }
  }, [loading, ladderData, userRank, userData, currentPage]);

  // ✅ 新增：載入點讚狀態
  useEffect(() => {
    if (!auth.currentUser || ladderData.length === 0) return;

    const loadLikeStatus = async () => {
      const likedSet = new Set();
      for (const user of ladderData) {
        if (user.id === auth.currentUser.uid) continue; // 跳過自己
        try {
          const isLiked = await LadderLikeSystem.checkIfLiked(user.id);
          if (isLiked) {
            likedSet.add(user.id);
          }
        } catch (error) {
          console.error(`檢查用戶 ${user.id} 點讚狀態失敗:`, error);
        }
      }
      setLikedUsers(likedSet);
    };

    loadLikeStatus();
  }, [ladderData]);

  // ✅ 新增：點讚/取消點讚處理函數
  const handleToggleLike = useCallback(
    async (userId, e) => {
      if (e) {
        e.stopPropagation(); // 防止觸發卡片點擊
      }

      if (!auth.currentUser) {
        // 可以顯示需要登入提示
        return;
      }

      // ✅ 修改：允許點讚自己（移除限制）

      // 防抖：避免重複點擊
      if (likeProcessing.has(userId)) {
        return;
      }

      const isLiked = likedUsers.has(userId);

      // 樂觀更新：立即更新 UI
      setLikedUsers(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });

      // 更新本地數據
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

      // 設置處理狀態
      setLikeProcessing(prev => new Set(prev).add(userId));

      try {
        const result = isLiked
          ? await LadderLikeSystem.unlikeUser(userId)
          : await LadderLikeSystem.likeUser(userId);

        if (!result.success) {
          // 回滾樂觀更新
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
      } catch (error) {
        console.error('點讚操作失敗:', error);
        // 回滾樂觀更新
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
        // 清除處理狀態
        setLikeProcessing(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [likedUsers, likeProcessing]
  );

  // 簡化動畫樣式 - 動畫已移除
  const getAnimationStyle = useMemo(() => {
    return () => {
      // 動畫已移除，返回空對象
      return {};
    };
  }, []);

  // 新增：獲取晉升提示文字
  const getPromotionMessage = () => {
    return null; // 動畫已移除，不再顯示提示
  };

  // 獲取排名徽章
  const getRankBadge = rank => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    if (rank <= 50) return '⭐';
    return '';
  };

  // 獲取年齡組標籤
  const getAgeGroupLabel = useCallback(
    ageGroup => {
      const group = ageGroups.find(g => g.value === ageGroup);
      return group ? group.label : ageGroup;
    },
    [ageGroups]
  );

  // ✅ 新增：關閉提醒框（必須在所有條件返回之前定義，遵守 React Hooks 規則）
  const handleCloseNotification = useCallback(() => {
    setShowNotification(false);
    // 清除通知數據
    localStorage.removeItem('ladderUpdateNotification');
  }, []);

  // 新增：獲取浮動排名顯示框
  const floatingRankDisplay = useMemo(() => {
    // 創建條件檢查的鍵值，用於防抖
    const conditionKey = `${userData?.ladderScore}-${userRank}-${ladderData.length}-${loading}`;

    // 檢查是否需要輸出日誌（只在條件改變時）
    const shouldLog =
      process.env.NODE_ENV === 'development' &&
      !loading &&
      ladderData.length > 0 &&
      lastConditionCheckRef.current !== conditionKey;

    // 只在開發環境下輸出詳細日誌，並且只在數據穩定時輸出，且條件真正改變時
    if (shouldLog) {
      console.log('🔍 檢查浮動排名框條件:', {
        hasUserData: !!userData,
        hasLadderScore: userData?.ladderScore > 0,
        userRank,
        ladderDataLength: ladderData.length,
      });

      // 更新最後檢查的條件
      lastConditionCheckRef.current = conditionKey;
    }

    if (!userData || !userData.ladderScore || userData.ladderScore === 0) {
      if (shouldLog) {
        console.log('❌ 浮動框條件1不滿足：用戶數據或分數問題');
      }
      return null;
    }

    // 如果用戶排名在前7名內，不顯示浮動框（因為應該在列表中）
    if (userRank > 0 && userRank <= 7) {
      if (shouldLog) {
        console.log('❌ 浮動框條件2不滿足：用戶排名前7名內');
      }
      return null;
    }

    // 如果用戶排名為0或未上榜，不顯示浮動框
    if (userRank === 0) {
      if (shouldLog) {
        console.log('❌ 浮動框條件3不滿足：用戶未上榜');
      }
      return null;
    }

    if (shouldLog) {
      console.log('✅ 浮動框條件滿足，顯示浮動排名框，排名:', userRank);
    }

    const currentRank = userRank;
    const rankBadge = getRankBadge(currentRank);

    // ✅ 修改：點擊浮動排名框重新載入天梯（就像點擊底部導覽列的排行榜按鈕）
    const handleFloatingRankClick = () => {
      // 使用 navigate 重新導航到天梯頁面，觸發組件重新掛載
      // 這樣會重置所有狀態，並觸發「首次載入時自動跳轉到用戶所在頁面」的邏輯
      navigate('/ladder');
    };

    return (
      <div
        className="floating-rank-display"
        data-rank={currentRank}
        onClick={handleFloatingRankClick}
        style={{ cursor: 'pointer' }}
        title={t('ladder.floatingRank.clickToView')}
      >
        <div className="floating-rank-card">
          <div className="ladder__rank">
            <span className="ladder__rank-number">{currentRank}</span>
            <span className="ladder__rank-badge">{rankBadge}</span>
          </div>

          <div className="ladder__user">
            <div className="ladder__avatar">
              {(() => {
                const isGuest = sessionStorage.getItem('guestMode') === 'true';
                const avatarUrl = isGuest
                  ? '/guest-avatar.svg'
                  : userData.avatarUrl;

                if (avatarUrl && avatarUrl.trim() !== '') {
                  return (
                    <img
                      src={avatarUrl}
                      alt={t('community.ui.avatarAlt')}
                      loading="lazy"
                      onError={e => {
                        console.log('頭像載入失敗，使用預設頭像');
                        e.target.style.display = 'none';
                        const placeholder = e.target.nextSibling;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                      onLoad={() => {
                        console.log('頭像載入成功');
                      }}
                    />
                  );
                }
                return null;
              })()}
              <div
                className="ladder__avatar-placeholder"
                style={{
                  display: (() => {
                    const isGuest =
                      sessionStorage.getItem('guestMode') === 'true';
                    const avatarUrl = isGuest
                      ? '/guest-avatar.svg'
                      : userData.avatarUrl;
                    return avatarUrl && avatarUrl.trim() !== ''
                      ? 'none'
                      : 'flex';
                  })(),
                }}
              >
                {userData.nickname
                  ? userData.nickname.charAt(0).toUpperCase()
                  : 'U'}
              </div>
            </div>

            <div className="ladder__user-info">
              <div className="ladder__user-name current-user-flame">
                {userData.nickname ||
                  userData.email?.split('@')[0] ||
                  '未命名用戶'}
                {userData.isVerified && (
                  <span className="ladder__verification-badge" title="榮譽認證">
                    🏅
                  </span>
                )}
              </div>
              <div className="ladder__user-details">
                {getAgeGroupLabel(userData.ageGroup)} •{' '}
                {userData.gender === 'male'
                  ? t('userInfo.male')
                  : t('userInfo.female')}
                <br />
                <span className="last-update">我的排名</span>
              </div>
            </div>
          </div>

          <div className="ladder__score">
            <span className="ladder__score-value">
              {formatScore(userData.ladderScore)}
            </span>
            <span className="ladder__score-label">
              {t('community.ui.pointsUnit')}
            </span>
          </div>
        </div>
      </div>
    );
  }, [userData, userRank, ladderData.length, loading, getAgeGroupLabel, t, navigate]);

  // const getUserRankDisplay = () => {
  //   if (!userData) {
  //     return '未參與';
  //   }

  //   // 檢查是否完成全部5個評測項目
  //   const scores = userData.scores || {};
  //   const completedCount = Object.values(scores).filter(
  //     score => score > 0
  //   ).length;

  //   if (completedCount < 5) {
  //     return `完成 ${completedCount}/5 項`;
  //   }

  //   if (userData.ladderScore === 0) {
  //     return '未參與';
  //   }

  //   // 使用userRank來顯示排名，讓用戶看到變化過程
  //   const rankToShow = userRank > 0 ? userRank : '未上榜';
  //   return rankToShow > 0 ? `第 ${rankToShow} 名` : '未上榜';
  // };

  // 處理用戶點擊，顯示用戶名片
  const handleUserClick = (user, event) => {
    if (user.isAnonymous) return; // 匿名用戶不顯示信息

    // 顯示用戶卡片而不是工具提示
    setSelectedUserForCard(user);
    setShowUserCard(true);
  };

  // 格式化時間戳
  const formatLastUpdate = timestamp => {
    if (!timestamp) return '未知';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins}分鐘前`;
    if (diffHours < 24) return `${diffHours}小時前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString('zh-TW');
  };

  if (loading) {
    return (
      <div className="ladder">
        <div className="ladder__loading">
          <div className="ladder__loading-spinner"></div>
          <p>{t('ladder.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ladder">
      {/* ✅ 新增：提醒框 */}
      {showNotification && notificationData && (
        <div
          className="ladder-notification-overlay"
          onClick={handleCloseNotification}
        >
          <div
            className={`ladder-notification ${
              notificationData.type ||
              (notificationData.isFirstTime ? 'first-time' : 'declined')
            }`}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="ladder-notification__close"
              onClick={handleCloseNotification}
              aria-label={t('common.close')}
            >
              ×
            </button>

            {notificationData.isFirstTime ? (
              // 第一次參加排名
              <div className="ladder-notification__content first-time-content">
                <div className="ladder-notification__icon">🎉</div>
                <h2 className="ladder-notification__title">
                  {t('ladder.notification.firstTime.title')}
                </h2>
                <div className="ladder-notification__stats">
                  <div className="ladder-notification__stat">
                    <span className="ladder-notification__stat-label">
                      {t('ladder.notification.firstTime.combatPower')}
                    </span>
                    <span className="ladder-notification__stat-value">
                      {formatScore(notificationData.newScore)}
                    </span>
                  </div>
                  <div className="ladder-notification__stat">
                    <span className="ladder-notification__stat-label">
                      {t('ladder.notification.firstTime.rank')}
                    </span>
                    <span className="ladder-notification__stat-value">
                      {t('ladder.notification.firstTime.rankValue', {
                        rank: notificationData.newRank,
                      })}
                    </span>
                  </div>
                </div>
                <p className="ladder-notification__message">
                  {t('ladder.notification.firstTime.message')}
                </p>
                <button
                  className="ladder-notification__button"
                  onClick={handleCloseNotification}
                >
                  {t('ladder.notification.firstTime.button')}
                </button>
              </div>
            ) : notificationData.type === 'improved' ? (
              // 提升 - 金紅色
              <div className="ladder-notification__content improved-content">
                <div className="ladder-notification__icon">📈</div>
                <h2 className="ladder-notification__title">
                  {t('ladder.notification.improved.title')}
                </h2>
                <div className="ladder-notification__stats">
                  <div className="ladder-notification__stat">
                    <span className="ladder-notification__stat-label">
                      {t('ladder.notification.improved.combatPower')}
                    </span>
                    <div className="ladder-notification__stat-change">
                      <span className="ladder-notification__stat-old">
                        {formatScore(notificationData.oldScore)}
                      </span>
                      <span className="ladder-notification__stat-arrow">→</span>
                      <span className="ladder-notification__stat-new">
                        {formatScore(notificationData.newScore)}
                      </span>
                      {notificationData.newScore >
                        notificationData.oldScore && (
                        <span className="ladder-notification__stat-improvement">
                          (+
                          {formatScore(
                            notificationData.newScore -
                              notificationData.oldScore
                          )}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ladder-notification__stat">
                    <span className="ladder-notification__stat-label">
                      {t('ladder.notification.improved.rank')}
                    </span>
                    <div className="ladder-notification__stat-change">
                      <span className="ladder-notification__stat-old">
                        {notificationData.oldRank > 0
                          ? t('ladder.notification.improved.rankValue', {
                              rank: notificationData.oldRank,
                            })
                          : t('ladder.notification.improved.notRanked')}
                      </span>
                      <span className="ladder-notification__stat-arrow">→</span>
                      <span className="ladder-notification__stat-new">
                        {t('ladder.notification.improved.rankValue', {
                          rank: notificationData.newRank,
                        })}
                      </span>
                      {notificationData.oldRank > 0 &&
                        notificationData.newRank < notificationData.oldRank && (
                          <span className="ladder-notification__stat-improvement">
                            (
                            {t('ladder.notification.improved.rankImproved', {
                              improved:
                                notificationData.oldRank -
                                notificationData.newRank,
                            })}
                            )
                          </span>
                        )}
                    </div>
                  </div>
                </div>
                <button
                  className="ladder-notification__button"
                  onClick={handleCloseNotification}
                >
                  {t('ladder.notification.improved.button')}
                </button>
              </div>
            ) : (
              // 排名下滑、持平、退步 - 金屬灰
              <div className="ladder-notification__content declined-content">
                <div className="ladder-notification__icon">💪</div>
                <h2 className="ladder-notification__title">
                  {t('ladder.notification.declined.title')}
                </h2>
                <div className="ladder-notification__stats">
                  <div className="ladder-notification__stat">
                    <span className="ladder-notification__stat-label">
                      {t('ladder.notification.declined.combatPower')}
                    </span>
                    <div className="ladder-notification__stat-change">
                      <span className="ladder-notification__stat-old">
                        {formatScore(notificationData.oldScore)}
                      </span>
                      <span className="ladder-notification__stat-arrow">→</span>
                      <span className="ladder-notification__stat-new">
                        {formatScore(notificationData.newScore)}
                      </span>
                      {notificationData.newScore <
                        notificationData.oldScore && (
                        <span className="ladder-notification__stat-decline">
                          (-
                          {formatScore(
                            notificationData.oldScore -
                              notificationData.newScore
                          )}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ladder-notification__stat">
                    <span className="ladder-notification__stat-label">
                      {t('ladder.notification.declined.rank')}
                    </span>
                    <div className="ladder-notification__stat-change">
                      <span className="ladder-notification__stat-old">
                        {notificationData.oldRank > 0
                          ? t('ladder.notification.declined.rankValue', {
                              rank: notificationData.oldRank,
                            })
                          : t('ladder.notification.declined.notRanked')}
                      </span>
                      <span className="ladder-notification__stat-arrow">→</span>
                      <span className="ladder-notification__stat-new">
                        {t('ladder.notification.declined.rankValue', {
                          rank: notificationData.newRank,
                        })}
                      </span>
                      {notificationData.oldRank > 0 &&
                        notificationData.newRank > notificationData.oldRank && (
                          <span className="ladder-notification__stat-decline">
                            (
                            {t('ladder.notification.declined.rankDeclined', {
                              declined:
                                notificationData.newRank -
                                notificationData.oldRank,
                            })}
                            )
                          </span>
                        )}
                    </div>
                  </div>
                </div>
                <p className="ladder-notification__message">
                  {t('ladder.notification.declined.message')}
                </p>
                <button
                  className="ladder-notification__button"
                  onClick={handleCloseNotification}
                >
                  {t('ladder.notification.declined.button')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 晉升動畫提示 */}
      {getPromotionMessage()}

      {/* 浮動排名顯示框 - 只在用戶不在列表中且排名超過10名時顯示 */}
      {floatingRankDisplay}

      <div className="ladder__header">
        <h2>{t('ladder.title')}</h2>

        {/* 合併的選項頁和年齡選擇框 */}
        <div className="ladder__filters">
          <div className="ladder__filter-container">
            <select
              value={selectedTab}
              onChange={e => setSelectedTab(e.target.value)}
              className="ladder__filter-select"
            >
              <option value="total">{t('ladder.filters.total')}</option>
              <option value="weekly">{t('ladder.filters.weekly')}</option>
              <option value="verified">{t('ladder.filters.verified')}</option>
            </select>
          </div>

          <div className="ladder__filter-container">
            <select
              value={selectedAgeGroup}
              onChange={e => setSelectedAgeGroup(e.target.value)}
              className="ladder__filter-select"
            >
              {ageGroups.map(group => (
                <option key={group.value} value={group.value}>
                  {t(`ladder.ageGroups.${group.value}`)}
                </option>
              ))}
            </select>
          </div>

          {userRank > 50 && (
            <button
              className="ladder__context-btn"
              onClick={() => setShowUserContext(!showUserContext)}
            >
              {showUserContext
                ? t('ladder.buttons.showTop50')
                : t('ladder.buttons.showMyRange')}
            </button>
          )}
        </div>
      </div>

      <div className="ladder__list">
        {showUserContext && userRank > 50 && (
          <div
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              color: 'white',
              borderRadius: '8px 8px 0 0',
              fontSize: '12px',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {t('ladder.rangeInfo', {
              start: Math.max(1, userRank - 15),
              end: userRank + 15,
            })}
          </div>
        )}
        {ladderData.length === 0 ? (
          <div className="ladder__empty">
            <p>
              {selectedTab === 'weekly'
                ? t('ladder.emptyWeekly.title')
                : t('ladder.empty.title')}
            </p>
            <p>
              {selectedTab === 'weekly'
                ? t('ladder.emptyWeekly.subtitle')
                : t('ladder.empty.subtitle')}
            </p>
          </div>
        ) : (
          ladderData.map((user, index) => {
            // ✅ 計算實際排名（考慮顯示的起始位置）
            const actualRank = displayStartRank + index;

            return (
              <div
                key={user.id}
                data-user-id={user.id} // ✅ 新增：用於滾動定位
                className={`ladder__item ${
                  user.id === userData?.userId
                    ? 'ladder__item--current-user'
                    : ''
                } ${!user.isAnonymous ? 'clickable' : ''}`}
                style={{
                  ...(user.id === userData?.userId
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%)',
                        borderLeft: '4px solid #ff6b35',
                        fontWeight: '600',
                      }
                    : {}),
                  ...getAnimationStyle(user, index),
                }}
                onClick={
                  !user.isAnonymous ? e => handleUserClick(user, e) : undefined
                }
                title={
                  !user.isAnonymous ? t('ladder.tooltips.viewTraining') : ''
                }
              >
                <div className="ladder__rank">
                  <span
                    className={`ladder__rank-number ${
                      user.id === userData?.userId ? 'rank-changing' : ''
                    }`}
                  >
                    {actualRank} {/* ✅ 使用實際排名 */}
                  </span>
                  <span className="ladder__rank-badge">
                    {getRankBadge(actualRank)} {/* ✅ 使用實際排名 */}
                  </span>
                </div>

                <div className="ladder__user">
                  <div className="ladder__avatar">
                    {user.avatarUrl &&
                    user.avatarUrl.trim() !== '' &&
                    !user.isAnonymous ? (
                      <img
                        src={user.avatarUrl}
                        alt={
                          /* i18n not wired here; use generic alt */ 'avatar'
                        }
                        loading="lazy"
                        onError={e => {
                          console.log('頭像載入失敗，使用預設頭像');
                          e.target.style.display = 'none';
                          const placeholder = e.target.nextSibling;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                        onLoad={() => {
                          console.log('頭像載入成功');
                        }}
                      />
                    ) : null}
                    <div
                      className={`ladder__avatar-placeholder ${
                        user.isAnonymous ? 'anonymous' : ''
                      }`}
                      style={{
                        display:
                          user.avatarUrl &&
                          user.avatarUrl.trim() !== '' &&
                          !user.isAnonymous
                            ? 'none'
                            : 'flex',
                      }}
                    >
                      {user.isAnonymous
                        ? '👤'
                        : user.displayName.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="ladder__user-info">
                    <div
                      className={`ladder__user-name ${
                        user.isAnonymous ? 'anonymous' : ''
                      } ${
                        user.id === userData?.userId ? 'current-user-flame' : ''
                      }`}
                    >
                      {user.displayName}
                      {user.isVerified && (
                        <span
                          className="ladder__verification-badge"
                          title="榮譽認證"
                        >
                          🏅
                        </span>
                      )}
                      {user.isAnonymous && ' 🔒'}
                    </div>
                    <div className="ladder__user-details">
                      {user.isAnonymous ? (
                        '匿名用戶'
                      ) : (
                        <>
                          {getAgeGroupLabel(user.ageGroup)} •{' '}
                          {user.gender === 'male'
                            ? t('userInfo.male')
                            : t('userInfo.female')}
                          {(user.lastLadderSubmission || user.lastActive) && (
                            <>
                              <br />
                              <span className="last-update">
                                {t('ladder.labels.updatedAt')}{' '}
                                {formatLastUpdate(
                                  user.lastLadderSubmission || user.lastActive
                                )}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ 新增：分數區域容器（包含分數和點讚） */}
                <div className="ladder__score-section">
                  <div className="ladder__score">
                    <span className="ladder__score-value">
                      {formatScore(user.ladderScore)}
                    </span>
                    <span className="ladder__score-label">
                      {t('community.ui.pointsUnit')}
                    </span>
                  </div>

                  {/* ✅ 修改：點讚按鈕 - 所有用戶都顯示 */}
                  {user.isAnonymous ? (
                    // 匿名用戶：顯示佔位按鈕（不可點擊）
                    <div className="ladder__like-btn ladder__like-btn--placeholder">
                      <span className="ladder__like-icon">👍</span>
                      <span className="ladder__like-count">
                        {user.ladderLikeCount || 0}
                      </span>
                    </div>
                  ) : (
                    // 非匿名用戶：顯示可點擊的按鈕（包括自己）
                    <button
                      className={`ladder__like-btn ${
                        likedUsers.has(user.id) ? 'liked' : ''
                      }`}
                      onClick={e => handleToggleLike(user.id, e)}
                      disabled={likeProcessing.has(user.id)}
                      title={
                        likedUsers.has(user.id)
                          ? t('ladder.unlike')
                          : t('ladder.like')
                      }
                    >
                      <span className="ladder__like-icon">👍</span>
                      <span className="ladder__like-count">
                        {user.ladderLikeCount || 0}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ✅ 修改：總是顯示分頁控制，即使只有一頁 */}
      {totalPages >= 1 && totalUsers > 0 && (
        <div className="ladder__pagination">
          {/* 上一頁按鈕 */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="ladder__pagination-btn ladder__pagination-btn--prev"
            aria-label={t('history.pagination.prev')}
          >
            <span className="ladder__pagination-arrow">←</span>
          </button>

          {/* 頁面選擇下拉表單 */}
          <div className="ladder__pagination-select-wrapper">
            <select
              value={currentPage}
              onChange={handlePageSelect}
              className="ladder__pagination-select"
              aria-label={t('ladder.pagination.selectPage')}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <option key={page} value={page}>
                  {t('ladder.pagination.page', { page })}
                </option>
              ))}
            </select>
            <span className="ladder__pagination-total">
              / {t('ladder.pagination.total', { total: totalPages })}
            </span>
          </div>

          {/* 下一頁按鈕 */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ladder__pagination-btn ladder__pagination-btn--next"
            aria-label={t('history.pagination.next')}
          >
            <span className="ladder__pagination-arrow">→</span>
          </button>
        </div>
      )}

      <div className="ladder__footer">
        {selectedTab === 'weekly' && (
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            📅 本周新進榜：顯示過去7天內有活動的用戶
          </p>
        )}
        {userRank > 50 && (
          <p
            style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '8px',
              fontStyle: 'italic',
            }}
          >
            💡 提示：您的排名為第 {userRank}{' '}
            名，可以點擊上方按鈕查看您附近的競爭對手
          </p>
        )}
      </div>

      {/* 用戶名片 */}
      {showUserCard && selectedUserForCard && (
        <LadderUserCard
          user={selectedUserForCard}
          isOpen={showUserCard}
          onClose={() => {
            setShowUserCard(false);
            setSelectedUserForCard(null);
          }}
        />
      )}
    </div>
  );
};

export default React.memo(Ladder);
