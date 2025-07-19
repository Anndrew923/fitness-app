import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../UserContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { calculateLadderScore, formatScore, getAgeGroup } from '../utils';
import './Ladder.css';

const Ladder = () => {
  const { userData } = useUser();
  const [ladderData, setLadderData] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedTab, setSelectedTab] = useState('total'); // 'total' 或 'weekly'
  const [loading, setLoading] = useState(true);
  const [showUserContext, setShowUserContext] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const ageGroups = [
    { value: 'all', label: '全部年齡' },
    { value: 'under20', label: '20歲以下' },
    { value: '21to30', label: '21~30歲' },
    { value: '31to40', label: '31~40歲' },
    { value: '41to50', label: '41~50歲' },
    { value: '51to60', label: '51~60歲' },
    { value: '61to70', label: '61~70歲' },
    { value: 'over70', label: '70歲以上' },
    { value: 'unknown', label: '未知年齡' },
  ];

  useEffect(() => {
    loadLadderData();
  }, [selectedAgeGroup, selectedTab]);

  const loadLadderData = async () => {
    setLoading(true);
    try {
      console.log('🚀 開始載入天梯數據...');

      // 簡化查詢：直接獲取前100名用戶
      const q = query(
        collection(db, 'users'),
        orderBy('ladderScore', 'desc'),
        limit(100) // 固定獲取前100名，確保第一名不會被過濾掉
      );

      const querySnapshot = await getDocs(q);
      let data = [];

      console.log(`📥 從 Firebase 獲取到 ${querySnapshot.size} 個文檔`);

      querySnapshot.forEach(doc => {
        const userData = doc.data();
        // 所有有分數的用戶都參與天梯排名
        if (userData.ladderScore > 0) {
          const isAnonymous = userData.isAnonymousInLadder === true;
          // 確保年齡段被正確計算
          const userWithAgeGroup = {
            ...userData,
            ageGroup: userData.age
              ? getAgeGroup(Number(userData.age))
              : userData.ageGroup || '',
          };

          data.push({
            id: doc.id,
            ...userWithAgeGroup,
            displayName: isAnonymous
              ? '匿名用戶'
              : userData.nickname ||
                userData.email?.split('@')[0] ||
                '未命名用戶',
            avatarUrl: isAnonymous ? '' : userData.avatarUrl,
            isAnonymous: isAnonymous,
          });
        }
      });

      console.log(`📊 過濾後有分數的用戶：${data.length} 名`);

      // 客戶端過濾年齡分段
      if (selectedAgeGroup !== 'all') {
        const beforeFilterCount = data.length;
        data = data.filter(user => user.ageGroup === selectedAgeGroup);
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

      // 簡化用戶排名計算
      if (userData && userData.ladderScore > 0) {
        const userRankIndex = data.findIndex(
          user => user.id === userData.userId
        );

        if (userRankIndex >= 0) {
          // 用戶在當前顯示範圍內
          const newRank = userRankIndex + 1;
          console.log(`🎯 用戶排名：第 ${newRank} 名`);
          setUserRank(newRank);
        } else {
          // 用戶不在當前顯示範圍內，需要計算實際排名
          console.log(`📋 用戶不在前50名內，計算實際排名...`);

          // 獲取所有用戶數據進行排名計算
          try {
            const rankQuery = query(
              collection(db, 'users'),
              orderBy('ladderScore', 'desc')
            );
            const rankSnapshot = await getDocs(rankQuery);
            let rankData = [];

            rankSnapshot.forEach(doc => {
              const userData = doc.data();
              if (userData.ladderScore > 0) {
                // 確保年齡段被正確計算
                const userWithAgeGroup = {
                  ...userData,
                  ageGroup: userData.age
                    ? getAgeGroup(Number(userData.age))
                    : userData.ageGroup || '',
                };
                rankData.push(userWithAgeGroup);
              }
            });

            // 客戶端過濾年齡分段
            if (selectedAgeGroup !== 'all') {
              rankData = rankData.filter(
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
              user => user.id === userData.userId
            );
            const newRank = userRankIndex >= 0 ? userRankIndex + 1 : 0;

            console.log(`🎯 用戶實際排名：第 ${newRank} 名`);
            setUserRank(newRank);
          } catch (error) {
            console.error('計算用戶實際排名失敗:', error);
            setUserRank(0);
          }
        }
      } else {
        setUserRank(0);
      }
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
    }
  };

  // 簡化動畫樣式 - 動畫已移除
  const getAnimationStyle = useMemo(() => {
    return (user, index) => {
      // 動畫已移除，返回空對象
      return {};
    };
  }, []);

  // 新增：獲取晉升提示文字
  const getPromotionMessage = () => {
    return null; // 動畫已移除，不再顯示提示
  };

  // 新增：獲取浮動排名顯示框
  const getFloatingRankDisplay = () => {
    console.log('🔍 檢查浮動排名框條件:', {
      hasUserData: !!userData,
      hasLadderScore: userData?.ladderScore > 0,
      userRank,
      ladderDataLength: ladderData.length,
    });

    if (!userData || !userData.ladderScore || userData.ladderScore === 0) {
      console.log('❌ 浮動框條件1不滿足：用戶數據或分數問題');
      return null;
    }

    // 如果用戶排名在前7名內，不顯示浮動框（因為應該在列表中）
    if (userRank > 0 && userRank <= 7) {
      console.log('❌ 浮動框條件2不滿足：用戶排名前7名內');
      return null;
    }

    // 如果用戶排名為0或未上榜，不顯示浮動框
    if (userRank === 0) {
      console.log('❌ 浮動框條件3不滿足：用戶未上榜');
      return null;
    }

    console.log('✅ 浮動框條件滿足，顯示浮動排名框，排名:', userRank);
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
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt="頭像" />
              ) : (
                <div className="ladder__avatar-placeholder">
                  {userData.nickname
                    ? userData.nickname.charAt(0).toUpperCase()
                    : 'U'}
                </div>
              )}
            </div>

            <div className="ladder__user-info">
              <div className="ladder__user-name current-user-flame">
                {userData.nickname ||
                  userData.email?.split('@')[0] ||
                  '未命名用戶'}
              </div>
              <div className="ladder__user-details">
                {getAgeGroupLabel(userData.ageGroup)} •{' '}
                {userData.gender === 'male' ? '男' : '女'}
                <br />
                <span className="last-update">我的排名</span>
              </div>
            </div>
          </div>

          <div className="ladder__score">
            <span className="ladder__score-value">
              {formatScore(userData.ladderScore)}
            </span>
            <span className="ladder__score-label">分</span>
          </div>
        </div>
      </div>
    );
  };

  const getUserRankDisplay = () => {
    if (!userData) {
      return '未參與';
    }

    // 檢查是否完成全部5個評測項目
    const scores = userData.scores || {};
    const completedCount = Object.values(scores).filter(
      score => score > 0
    ).length;

    if (completedCount < 5) {
      return `完成 ${completedCount}/5 項`;
    }

    if (userData.ladderScore === 0) {
      return '未參與';
    }

    // 使用userRank來顯示排名，讓用戶看到變化過程
    const rankToShow = userRank > 0 ? userRank : '未上榜';
    return rankToShow > 0 ? `第 ${rankToShow} 名` : '未上榜';
  };

  const getRankBadge = rank => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    if (rank <= 50) return '⭐';
    return '';
  };

  const getAgeGroupLabel = ageGroup => {
    const group = ageGroups.find(g => g.value === ageGroup);
    return group ? group.label : ageGroup;
  };

  // 處理用戶點擊，顯示訓練背景信息
  const handleUserClick = (user, event) => {
    if (user.isAnonymous) return; // 匿名用戶不顯示信息

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setSelectedUser(user);
  };

  // 關閉浮動框
  const closeTooltip = () => {
    setSelectedUser(null);
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
          <p>載入排行榜中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ladder">
      {/* 晉升動畫提示 */}
      {getPromotionMessage()}

      {/* 浮動排名顯示框 - 只在用戶不在列表中且排名超過10名時顯示 */}
      {getFloatingRankDisplay()}

      <div className="ladder__header">
        <h2>天梯排行榜</h2>

        {/* 合併的選項頁和年齡選擇框 */}
        <div className="ladder__filters">
          <div className="ladder__filter-container">
            <select
              value={selectedTab}
              onChange={e => setSelectedTab(e.target.value)}
              className="ladder__filter-select"
            >
              <option value="total">🏆 總排行榜</option>
              <option value="weekly">⭐ 本周新進榜</option>
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
                  {group.label}
                </option>
              ))}
            </select>
          </div>

          {userRank > 50 && (
            <button
              className="ladder__context-btn"
              onClick={() => setShowUserContext(!showUserContext)}
            >
              {showUserContext ? '顯示前50名精華區' : '顯示我的排名範圍'}
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
            🎯 您的排名範圍（第 {Math.max(1, userRank - 15)} - {userRank + 15}{' '}
            名）
          </div>
        )}
        {ladderData.length === 0 ? (
          <div className="ladder__empty">
            <p>
              {selectedTab === 'weekly'
                ? '暫無本周新進榜數據'
                : '暫無排行榜數據'}
            </p>
            <p>
              {selectedTab === 'weekly'
                ? '本周完成評測即可上榜！'
                : '完成評測即可上榜！'}
            </p>
          </div>
        ) : (
          ladderData.map((user, index) => (
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
              title={!user.isAnonymous ? '點擊查看訓練背景' : ''}
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
                  {user.avatarUrl && !user.isAnonymous ? (
                    <img src={user.avatarUrl} alt="頭像" />
                  ) : (
                    <div
                      className={`ladder__avatar-placeholder ${
                        user.isAnonymous ? 'anonymous' : ''
                      }`}
                    >
                      {user.isAnonymous
                        ? '👤'
                        : user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
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
                        {user.gender === 'male' ? '男' : '女'}
                        {user.lastActive && (
                          <>
                            <br />
                            <span className="last-update">
                              更新於 {formatLastUpdate(user.lastActive)}
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
                <span className="ladder__score-label">分</span>
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

      {/* 訓練背景浮動框 */}
      {selectedUser && (
        <div
          className="training-tooltip"
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 1000,
          }}
        >
          <div className="tooltip-content">
            <div className="tooltip-header">
              <h4>{selectedUser.displayName} 的訓練背景</h4>
              <button className="tooltip-close" onClick={closeTooltip}>
                ×
              </button>
            </div>
            <div className="tooltip-body">
              {selectedUser.profession && (
                <div className="tooltip-item">
                  <span className="tooltip-label">💼 職業：</span>
                  <span className="tooltip-value">
                    {selectedUser.profession}
                  </span>
                </div>
              )}
              {selectedUser.weeklyTrainingHours && (
                <div className="tooltip-item">
                  <span className="tooltip-label">⏰ 每周訓練時數：</span>
                  <span className="tooltip-value">
                    {selectedUser.weeklyTrainingHours} 小時
                  </span>
                </div>
              )}
              {selectedUser.trainingYears && (
                <div className="tooltip-item">
                  <span className="tooltip-label">📅 訓練年資：</span>
                  <span className="tooltip-value">
                    {selectedUser.trainingYears} 年
                  </span>
                </div>
              )}
              {!selectedUser.profession &&
                !selectedUser.weeklyTrainingHours &&
                !selectedUser.trainingYears && (
                  <div className="tooltip-empty">
                    <p>該用戶尚未填寫訓練背景信息</p>
                    <p>💡 在個人資料頁面填寫訓練背景，激勵其他健身愛好者！</p>
                  </div>
                )}
            </div>
          </div>
          <div className="tooltip-arrow"></div>
        </div>
      )}

      {/* 點擊外部關閉浮動框 */}
      {selectedUser && (
        <div
          className="tooltip-overlay"
          onClick={closeTooltip}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
};

export default Ladder;
