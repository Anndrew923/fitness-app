import React, { useState, useEffect } from 'react';
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
      let q;
      const limitCount = showUserContext && userRank > 50 ? userRank + 15 : 50;

      // 簡化查詢：只按分數排序，在客戶端進行過濾
      q = query(
        collection(db, 'users'),
        orderBy('ladderScore', 'desc'),
        limit(limitCount * 2) // 增加限制以確保有足夠數據進行客戶端過濾
      );

      const querySnapshot = await getDocs(q);
      let data = [];

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

      // 客戶端過濾年齡分段
      if (selectedAgeGroup !== 'all') {
        data = data.filter(user => user.ageGroup === selectedAgeGroup);
      }

      // 客戶端過濾本周新進榜
      if (selectedTab === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        data = data.filter(user => {
          if (!user.lastActive) return false;
          const lastActive = new Date(user.lastActive);
          return lastActive >= oneWeekAgo;
        });
      }

      // 重新排序並限制數量
      data.sort((a, b) => b.ladderScore - a.ladderScore);
      data = data.slice(0, limitCount);

      setLadderData(data);

      // 計算用戶排名
      if (userData && userData.ladderScore > 0) {
        const userRankIndex = data.findIndex(
          user => user.id === userData.userId
        );

        if (userRankIndex >= 0) {
          // 用戶在當前顯示範圍內
          setUserRank(userRankIndex + 1);
        } else {
          // 用戶不在當前顯示範圍內，需要計算實際排名
          try {
            // 獲取所有用戶數據進行排名計算
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

            // 計算用戶在過濾後數據中的排名
            const userRankIndex = rankData.findIndex(
              user => user.ladderScore > userData.ladderScore
            );
            setUserRank(
              userRankIndex >= 0 ? userRankIndex + 1 : rankData.length + 1
            );
          } catch (error) {
            console.error('計算用戶排名失敗:', error);
            setUserRank(0);
          }
        }
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

  const getUserRankDisplay = () => {
    if (!userData || userData.ladderScore === 0) {
      return '未參與';
    }
    return userRank > 0 ? `第 ${userRank} 名` : '未上榜';
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
      <div className="ladder__header">
        <h2>天梯排行榜</h2>

        {/* 我的天梯排名 - 緊貼標題下方 */}
        <div className="ladder__user-stats">
          <div className="ladder__user-rank">
            <span className="ladder__user-label">
              {selectedTab === 'weekly' ? '本周排名' : '我的天梯排名'}
            </span>
            <span className="ladder__user-value">{getUserRankDisplay()}</span>
          </div>
          <div className="ladder__user-score">
            <span className="ladder__user-label">我的分數</span>
            <span className="ladder__user-value">
              {userData?.ladderScore ? formatScore(userData.ladderScore) : '0'}
            </span>
          </div>
          {selectedTab === 'weekly' && (
            <div className="ladder__user-note">
              <span className="ladder__user-label">💡 提示</span>
              <span className="ladder__user-value">顯示本周活躍用戶</span>
            </div>
          )}
        </div>

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
              style={
                user.id === userData?.userId
                  ? {
                      background:
                        'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%)',
                      borderLeft: '4px solid #ff6b35',
                      fontWeight: '600',
                    }
                  : {}
              }
              onClick={
                !user.isAnonymous ? e => handleUserClick(user, e) : undefined
              }
              title={!user.isAnonymous ? '點擊查看訓練背景' : ''}
            >
              <div className="ladder__rank">
                <span className="ladder__rank-number">{index + 1}</span>
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
        <p>完成所有評測項目即可計算天梯分數</p>
        <p>天梯分數 = (力量 + 爆發力 + 心肺 + 肌肉量 + 體脂) ÷ 5</p>
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
