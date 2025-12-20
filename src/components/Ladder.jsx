import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useUser } from '../UserContext';
import { useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { formatScore, getAgeGroup } from '../utils.js';
import { useTranslation } from 'react-i18next';
import LadderUserCard from './LadderUserCard';
import logger from '../utils/logger';
import { useLadder } from '../hooks/useLadder';
import { useDopamineFeedback } from '../hooks/useDopamineFeedback';
import LadderList from './Ladder/LadderList';
import LadderFilters from './Ladder/LadderFilters';
import LadderSubFilters from './Ladder/LadderSubFilters';
import './Ladder/Ladder.css';
import './Ladder/LadderItem.css'; // For shared styles used in floating-rank-card
import './Ladder/LadderStatusCard.css'; // For floating-rank-display styles

const Ladder = () => {
  const { userData } = useUser();
  const location = useLocation();
  const { t } = useTranslation();
  const { triggerVibrate, triggerRankUp } = useDopamineFeedback();

  // Define filter states FIRST (before useLadder)
  const [filterGender, setFilterGender] = useState('all');
  const [filterAge, setFilterAge] = useState('all');
  const [filterWeight, setFilterWeight] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [filterProject, setFilterProject] = useState('total');
  const [showUserContext, setShowUserContext] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [selectedUserForCard, setSelectedUserForCard] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);

  // Use the new useLadder hook (AFTER filter states are defined)
  const {
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
    setSelectedAgeGroup,
    setSelectedTab,
    setSelectedDivision,
    setCurrentPage,
    refresh,
    toggleLike,
  } = useLadder({
    filterGender,
    filterAge,
    filterWeight,
    filterJob,
    filterProject,
  });

  const lastConditionCheckRef = useRef(null);
  const forceReloadProcessedRef = useRef(null);

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

  // Check and show notification
  const checkAndShowNotification = useCallback(newRank => {
    try {
      const savedNotification = localStorage.getItem(
        'ladderUpdateNotification'
      );
      if (!savedNotification) return;

      const notification = JSON.parse(savedNotification);
      if (notification.hasShown) return;

      const timeDiff = Date.now() - notification.timestamp;
      if (timeDiff > 5 * 60 * 1000) {
        localStorage.removeItem('ladderUpdateNotification');
        return;
      }

      notification.newRank = newRank;
      notification.oldRank = notification.oldRank || 0;

      const scoreImproved = notification.newScore > notification.oldScore;
      const rankImproved =
        notification.oldRank > 0 && notification.newRank < notification.oldRank;

      if (notification.isFirstTime) {
        notification.type = 'first-time';
      } else if (scoreImproved || rankImproved) {
        notification.type = 'improved';
      } else {
        notification.type = 'declined';
      }

      setNotificationData(notification);
      setShowNotification(true);

      notification.hasShown = true;
      localStorage.setItem(
        'ladderUpdateNotification',
        JSON.stringify(notification)
      );
    } catch (error) {
      logger.error('檢查提醒框失敗:', error);
    }
  }, []);

  // Jump to current user (with scroll trigger signal)
  const jumpToCurrentUser = useCallback(() => {
    if (!userData?.userId && !auth.currentUser?.uid) return;
    if (userRank === 0) return;

    const usersPerPage = 50;
    const targetPage = Math.ceil(userRank / usersPerPage);

    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
      // The page change will trigger a reload, which will handle the scroll naturally.
    } else {
      // SAME PAGE? Fire the trigger!
      setScrollTrigger(prev => prev + 1);
    }
  }, [userRank, currentPage, userData, setCurrentPage]);

  // Disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Check notification when rank changes
  useEffect(() => {
    if (userRank > 0) {
      checkAndShowNotification(userRank);
    }
  }, [userRank, checkAndShowNotification]);

  // Handle route state force reload
  useEffect(() => {
    if (
      location.state?.forceReload &&
      userData &&
      !forceReloadProcessedRef.current
    ) {
      forceReloadProcessedRef.current = true;
      window.history.replaceState({}, document.title);
      setTimeout(() => {
        refresh();
      }, 0);
    }
  }, [location.state, userData, refresh]);

  // Get rank badge
  const getRankBadge = rank => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    if (rank <= 50) return '⭐';
    return '';
  };

  // Get age group label
  const getAgeGroupLabel = useCallback(
    ageGroup => {
      const group = ageGroups.find(g => g.value === ageGroup);
      return group ? group.label : ageGroup;
    },
    [ageGroups]
  );

  // Close notification
  const handleCloseNotification = useCallback(() => {
    setShowNotification(false);
    localStorage.removeItem('ladderUpdateNotification');
  }, []);

  // Helper function to get display metrics for floating bar (same logic as LadderItem)
  const getFloatingBarMetrics = useCallback(() => {
    if (!userData)
      return { value: 0, unit: '', label: '', formatValue: val => val };

    switch (selectedDivision) {
      case 'stats_totalLoginDays':
        return {
          value: userData.stats_totalLoginDays || 0,
          unit: '天',
          label: '累計天數',
          formatValue: val => Math.floor(val).toLocaleString('zh-TW'),
        };
      case 'stats_sbdTotal':
        if (filterProject === 'squat' && userData.stats_squat) {
          return {
            value: userData.stats_squat || 0,
            unit: 'kg',
            label: '深蹲',
            formatValue: val => Number(val).toFixed(1),
          };
        } else if (filterProject === 'bench' && userData.stats_bench) {
          return {
            value: userData.stats_bench || 0,
            unit: 'kg',
            label: '臥推',
            formatValue: val => Number(val).toFixed(1),
          };
        } else if (filterProject === 'deadlift' && userData.stats_deadlift) {
          return {
            value: userData.stats_deadlift || 0,
            unit: 'kg',
            label: '硬舉',
            formatValue: val => Number(val).toFixed(1),
          };
        }
        return {
          value: userData.stats_sbdTotal || 0,
          unit: 'kg',
          label: 'SBD 總和',
          formatValue: val => Number(val).toFixed(1),
        };
      case 'stats_bodyFat':
        return {
          value: userData.stats_bodyFat || 0,
          unit: '%',
          label: '體脂率',
          formatValue: val => Number(val).toFixed(1),
        };
      case 'local_district':
        return {
          value: userData.ladderScore || 0,
          unit: t('community.ui.pointsUnit'),
          label: '戰鬥力',
          formatValue: val => formatScore(val),
        };
      case 'stats_cooper':
        if (filterProject === '5k') {
          const format5KTime = val => {
            if (!val || val === 0) return '0:00';
            const minutes = Math.floor(val / 60);
            const seconds = Math.floor(val % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
          };
          return {
            value: userData.stats_5k || 0,
            unit: 'mins',
            label: '5K Run',
            formatValue: format5KTime,
          };
        }
        return {
          value: userData.stats_cooper || 0,
          unit: 'km',
          label: 'Cooper Test',
          formatValue: val => (Number(val) / 1000).toFixed(2),
        };
      case 'stats_vertical':
        if (filterProject === 'broad') {
          return {
            value: userData.stats_broad || 0,
            unit: 'cm',
            label: '立定跳遠',
            formatValue: val => Number(val).toFixed(1),
          };
        } else if (filterProject === 'sprint') {
          return {
            value: userData.stats_100m || 0,
            unit: 's',
            label: '100m 衝刺',
            formatValue: val => Number(val).toFixed(2),
          };
        }
        return {
          value: userData.stats_vertical || 0,
          unit: 'cm',
          label: '垂直跳躍',
          formatValue: val => Number(val).toFixed(1),
        };
      case 'stats_ffmi':
        if (filterProject === 'smm') {
          return {
            value: userData.stats_smm || 0,
            unit: 'kg',
            label: '肌肉量 (SMM)',
            formatValue: val => Number(val).toFixed(1),
          };
        } else if (filterProject === 'armSize') {
          return {
            value: userData.stats_armSize || 0,
            unit: 'cm',
            label: '臂圍',
            formatValue: val => Number(val).toFixed(1),
          };
        }
        return {
          value: userData.stats_ffmi || 0,
          unit: '',
          label: 'FFMI',
          formatValue: val => Number(val).toFixed(2),
        };
      case 'ladderScore':
      default:
        return {
          value: userData.ladderScore || 0,
          unit: t('community.ui.pointsUnit'),
          label: '戰鬥力',
          formatValue: val => formatScore(val),
        };
    }
  }, [userData, selectedDivision, filterProject, t]);

  // Floating rank display
  const floatingRankDisplay = useMemo(() => {
    if (!userData || !userData.ladderScore || userData.ladderScore === 0) {
      return null;
    }
    if (userRank > 0 && userRank <= 7) {
      return null;
    }
    if (userRank === 0) {
      return null;
    }

    const currentRank = userRank;
    const rankBadge = getRankBadge(currentRank);
    const metrics = getFloatingBarMetrics();

    return (
      <div
        className="floating-rank-display"
        data-rank={currentRank}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          jumpToCurrentUser();
        }}
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
              {userData.avatarUrl && userData.avatarUrl.trim() !== '' ? (
                <img
                  src={userData.avatarUrl}
                  alt={t('community.ui.avatarAlt')}
                  loading="lazy"
                />
              ) : null}
              <div
                className="ladder__avatar-placeholder"
                style={{
                  display:
                    userData.avatarUrl && userData.avatarUrl.trim() !== ''
                      ? 'none'
                      : 'flex',
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
              {metrics.formatValue(metrics.value)}
            </span>
            <span className="ladder__score-label">{metrics.unit}</span>
          </div>
        </div>
      </div>
    );
  }, [
    userData,
    userRank,
    getAgeGroupLabel,
    t,
    jumpToCurrentUser,
    getFloatingBarMetrics,
  ]);

  // Handle user click
  const handleUserClick = (user, event) => {
    if (user.isAnonymous) return;
    setSelectedUserForCard(user);
    setShowUserCard(true);
  };

  // Handle refresh with haptics
  const handleRefresh = useCallback(async () => {
    await triggerVibrate(100);
    refresh();
  }, [triggerVibrate, refresh]);

  // Pagination
  const goToPage = useCallback(
    page => {
      const targetPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(targetPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [totalPages, setCurrentPage]
  );

  const handlePageSelect = useCallback(
    e => {
      const selectedPage = parseInt(e.target.value, 10);
      if (selectedPage && selectedPage >= 1 && selectedPage <= totalPages) {
        goToPage(selectedPage);
      }
    },
    [totalPages, goToPage]
  );

  if (loading && ladderData.length === 0) {
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
      {/* Notification */}
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

      {/* Floating rank display */}
      {floatingRankDisplay}

      <div className="ladder__header">
        <h2>{t('ladder.title')}</h2>

        <LadderFilters
          selectedDivision={selectedDivision}
          onDivisionChange={setSelectedDivision}
        />

        <LadderSubFilters
          filterGender={filterGender}
          filterAge={filterAge}
          filterWeight={filterWeight}
          filterJob={filterJob}
          filterProject={filterProject}
          currentDivision={selectedDivision}
          onGenderChange={setFilterGender}
          onAgeChange={setFilterAge}
          onWeightChange={setFilterWeight}
          onJobChange={setFilterJob}
          onProjectChange={setFilterProject}
        />

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

      <LadderList
        ladderData={ladderData}
        displayStartRank={displayStartRank}
        currentUserId={userData?.userId || auth.currentUser?.uid}
        onUserClick={handleUserClick}
        onToggleLike={toggleLike}
        likedUsers={likedUsers}
        likeProcessing={likeProcessing}
        onRefresh={handleRefresh}
        loading={loading}
        displayMode={selectedDivision}
        filterProject={filterProject}
        scrollTrigger={scrollTrigger}
      />

      {/* Pagination */}
      {totalPages >= 1 && totalUsers > 0 && (
        <div className="ladder__pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="ladder__pagination-btn ladder__pagination-btn--prev"
            aria-label={t('history.pagination.prev')}
          >
            <span className="ladder__pagination-arrow">←</span>
          </button>

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

      {/* User card */}
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
