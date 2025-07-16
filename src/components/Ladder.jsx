import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from 'firebase/firestore';
import { calculateLadderScore, formatScore, getAgeGroup } from '../utils';
import './Ladder.css';

const Ladder = () => {
  const { userData } = useUser();
  const [ladderData, setLadderData] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [loading, setLoading] = useState(true);

  const ageGroups = [
    { value: 'all', label: '全部年齡' },
    { value: 'teen', label: '18歲以下' },
    { value: 'young', label: '18-24歲' },
    { value: 'adult', label: '25-34歲' },
    { value: 'middle', label: '35-49歲' },
    { value: 'senior', label: '50歲以上' },
  ];

  useEffect(() => {
    loadLadderData();
  }, [selectedAgeGroup]);

  const loadLadderData = async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'users'),
        orderBy('ladderScore', 'desc'),
        limit(100)
      );

      if (selectedAgeGroup !== 'all') {
        q = query(
          collection(db, 'users'),
          where('ageGroup', '==', selectedAgeGroup),
          orderBy('ladderScore', 'desc'),
          limit(100)
        );
      }

      const querySnapshot = await getDocs(q);
      const data = [];

      querySnapshot.forEach(doc => {
        const userData = doc.data();
        // 所有有分數的用戶都參與天梯排名
        if (userData.ladderScore > 0) {
          const isAnonymous = userData.isAnonymousInLadder === true;

          data.push({
            id: doc.id,
            ...userData,
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

      setLadderData(data);

      // 計算用戶排名
      if (userData && userData.ladderScore > 0) {
        const userRankIndex = data.findIndex(
          user => user.id === userData.userId
        );
        setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : 0);
      }
    } catch (error) {
      console.error('載入天梯數據失敗:', error);
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
        <div className="ladder__filters">
          <select
            value={selectedAgeGroup}
            onChange={e => setSelectedAgeGroup(e.target.value)}
            className="ladder__filter"
          >
            {ageGroups.map(group => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ladder__user-stats">
        <div className="ladder__user-score">
          <span className="ladder__user-label">我的天梯分數</span>
          <span className="ladder__user-value">
            {userData?.ladderScore ? formatScore(userData.ladderScore) : '0'}
          </span>
        </div>
        <div className="ladder__user-rank">
          <span className="ladder__user-label">我的排名</span>
          <span className="ladder__user-value">{getUserRankDisplay()}</span>
        </div>
      </div>

      <div className="ladder__list">
        {ladderData.length === 0 ? (
          <div className="ladder__empty">
            <p>暫無排行榜數據</p>
            <p>完成評測即可上榜！</p>
          </div>
        ) : (
          ladderData.map((user, index) => (
            <div key={user.id} className="ladder__item">
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
                        ? '🥷'
                        : user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="ladder__user-info">
                  <div
                    className={`ladder__user-name ${
                      user.isAnonymous ? 'anonymous' : ''
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
      </div>
    </div>
  );
};

export default Ladder;
