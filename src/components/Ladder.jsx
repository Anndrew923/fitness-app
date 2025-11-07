import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useUser } from '../UserContext';
import { useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatScore, getAgeGroup } from '../utils';
import './Ladder.css';
import { useTranslation } from 'react-i18next';
import LadderUserCard from './LadderUserCard';

const Ladder = () => {
  const { userData } = useUser();
  const location = useLocation();
  const { t } = useTranslation();
  const [ladderData, setLadderData] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedTab, setSelectedTab] = useState('total'); // 'total' 或 'weekly'
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

      // 重新排序並顯示前50名
      data.sort((a, b) => b.ladderScore - a.ladderScore);
      data = data.slice(0, 50); // 固定顯示前50名

      console.log(
        `📊 天梯數據載入完成：共 ${data.length} 名用戶，最高分：${
          data[0]?.ladderScore || 0
        }`
      );

      setLadderData(data);

      // 優化：簡化用戶排名計算，使用已載入的數據
      if (userData && userData.ladderScore > 0) {
        const userRankIndex = data.findIndex(
          user =>
            user.id === userData.userId || user.id === auth.currentUser?.uid
        );

        if (userRankIndex >= 0) {
          // 用戶在當前顯示範圍內
          const newRank = userRankIndex + 1;
          console.log(`🎯 用戶排名：第 ${newRank} 名`);
          setUserRank(newRank);
        } else {
          // 用戶不在當前顯示範圍內，需要計算實際排名
          console.log(`📋 用戶不在前50名內，計算實際排名...`);

          // 使用已載入的完整數據進行排名計算，避免額外的 Firebase 查詢
          const allUsers = querySnapshot.docs
            .map(doc => {
              const docData = doc.data();
              if (docData.ladderScore > 0) {
                return {
                  id: doc.id,
                  ...docData,
                  ageGroup: docData.age
                    ? getAgeGroup(Number(docData.age))
                    : docData.ageGroup || '',
                };
              }
              return null;
            })
            .filter(Boolean);

          // 客戶端過濾年齡分段
          let rankData = allUsers;
          if (selectedAgeGroup !== 'all') {
            rankData = allUsers.filter(
              user => user.ageGroup === selectedAgeGroup
            );
          }

          // 客戶端過濾本周新進榜
          if (selectedTab === 'weekly') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            rankData = rankData.filter(user => {
              if (!user.lastActive) return false;
              const lastActive = new Date(user.lastActive);
              return lastActive >= oneWeekAgo;
            });
          }

          // 重新排序
          rankData.sort((a, b) => b.ladderScore - a.ladderScore);

          // 計算用戶在過濾後數據中的排名
          const userRankIndex = rankData.findIndex(
            user =>
              user.id === userData.userId || user.id === auth.currentUser?.uid
          );
          const newRank = userRankIndex >= 0 ? userRankIndex + 1 : 0;

          console.log(`🎯 用戶實際排名：第 ${newRank} 名`);
          setUserRank(newRank);
        }
      } else {
        setUserRank(0);
      }

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
  }, [selectedAgeGroup, selectedTab, userData]);

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

    return (
      <div className="floating-rank-display" data-rank={currentRank}>
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
  }, [userData, userRank, ladderData.length, loading, getAgeGroupLabel]);

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
          ladderData.slice(0, 200).map((user, index) => (
            <div
              key={user.id}
              className={`ladder__item ${
                user.id === userData?.userId ? 'ladder__item--current-user' : ''
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
              title={!user.isAnonymous ? t('ladder.tooltips.viewTraining') : ''}
            >
              <div className="ladder__rank">
                <span
                  className={`ladder__rank-number ${
                    user.id === userData?.userId ? 'rank-changing' : ''
                  }`}
                >
                  {index + 1}
                </span>
                <span className="ladder__rank-badge">
                  {getRankBadge(index + 1)}
                </span>
              </div>

              <div className="ladder__user">
                <div className="ladder__avatar">
                  {user.avatarUrl &&
                  user.avatarUrl.trim() !== '' &&
                  !user.isAnonymous ? (
                    <img
                      src={user.avatarUrl}
                      alt={/* i18n not wired here; use generic alt */ 'avatar'}
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

              <div className="ladder__score">
                <span className="ladder__score-value">
                  {formatScore(user.ladderScore)}
                </span>
                <span className="ladder__score-label">
                  {t('community.ui.pointsUnit')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

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
