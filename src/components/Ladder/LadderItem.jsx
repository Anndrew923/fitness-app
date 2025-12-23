import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { formatScore } from '../../utils.js';
import './LadderItem.css';

/**
 * LadderItem - Single row component for ladder list
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const LadderItem = React.memo(
  ({
    user,
    rank,
    isCurrentUser,
    onUserClick,
    onToggleLike,
    isLiked,
    isLikeProcessing,
    displayMode = 'ladderScore',
    filterProject = 'total',
  }) => {
    const { t } = useTranslation();

    const getRankBadge = rank => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      if (rank <= 10) return '🏆';
      if (rank <= 50) return '⭐';
      return '';
    };

    const getAgeGroupLabel = ageGroup => {
      if (!ageGroup) return t('ladder.ageGroups.unknown');
      return t(`ladder.ageGroups.${ageGroup}`) || ageGroup;
    };

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

    const handleLikeClick = e => {
      e.stopPropagation();
      if (!isLikeProcessing && onToggleLike) {
        onToggleLike(user.id, e);
      }
    };

    // Get display value, unit, and label based on displayMode
    const getDisplayMetrics = () => {
      switch (displayMode) {
        case 'stats_totalLoginDays':
          return {
            value: user.stats_totalLoginDays || 0,
            unit: '天',
            label: '累計天數',
            icon: '🔥',
            formatValue: val => Math.floor(val).toLocaleString('zh-TW'),
          };
        case 'stats_sbdTotal':
          // Check if filtering by specific lift
          if (filterProject === 'total_five') {
            const fiveItemTotal =
              (user.stats_sbdTotal || 0) +
              (user.stats_ohp || 0) +
              (user.stats_latPull || 0);
            return {
              value: fiveItemTotal,
              unit: 'kg',
              label: '五項總和',
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'squat') {
            return {
              value: user.stats_squat || 0,
              unit: 'kg',
              label: '深蹲',
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'bench') {
            return {
              value: user.stats_bench || 0,
              unit: 'kg',
              label: '臥推',
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'deadlift') {
            return {
              value: user.stats_deadlift || 0,
              unit: 'kg',
              label: '硬舉',
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'ohp') {
            return {
              value: user.stats_ohp || 0,
              unit: 'kg',
              label: '站姿肩推',
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'latPull') {
            return {
              value: user.stats_latPull || 0,
              unit: 'kg',
              label: '滑輪下拉',
              formatValue: val => Number(val).toFixed(1),
            };
          }
          // Default: show total
          return {
            value: user.stats_sbdTotal || 0,
            unit: 'kg',
            label: user.weight ? `BW: ${user.weight}kg` : 'SBD 總和',
            formatValue: val => Number(val).toFixed(1),
          };
        case 'stats_bodyFat':
          return {
            value: user.stats_bodyFat || 0,
            unit: '%',
            label: '體脂率',
            icon: '💧',
            formatValue: val => Number(val).toFixed(1),
          };
        case 'local_district':
          // Local district uses ladderScore for display
          return {
            value: user.ladderScore || 0,
            unit: t('community.ui.pointsUnit'),
            label: '戰鬥力',
            formatValue: val => formatScore(val),
          };
        case 'stats_cooper':
          // Endurance: Check project filter
          if (filterProject === '5k') {
            // Format 5K time: convert seconds to minutes:seconds
            const format5KTime = val => {
              if (!val || val === 0) return '0:00';
              const minutes = Math.floor(val / 60);
              const seconds = Math.floor(val % 60);
              return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            };
            return {
              value: user.stats_5k || 0,
              unit: 'mins',
              label: '5K Run',
              formatValue: format5KTime,
            };
          }
          // Default: Cooper Test (distance in meters, convert to km)
          return {
            value: user.stats_cooper || 0,
            unit: 'km',
            label: 'Cooper Test',
            formatValue: val => (Number(val) / 1000).toFixed(2),
          };
        case 'stats_vertical':
          // Power: Check project filter
          if (filterProject === 'broad') {
            return {
              value: user.stats_broad || 0,
              unit: 'cm',
              label: '立定跳遠',
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'sprint') {
            return {
              value: user.stats_100m || 0,
              unit: 's',
              label: '100m 衝刺',
              formatValue: val => Number(val).toFixed(2),
            };
          }
          // Default: Vertical Jump
          return {
            value: user.stats_vertical || 0,
            unit: 'cm',
            label: '垂直跳躍',
            formatValue: val => Number(val).toFixed(1),
          };
        case 'stats_ffmi':
          // Hypertrophy: Check project filter
          if (filterProject === 'smm') {
            return {
              value: user.stats_smm || 0,
              unit: 'kg',
              label: '肌肉量 (SMM)',
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'armSize') {
            return {
              value: user.stats_armSize || 0,
              unit: 'cm',
              label: '臂圍',
              formatValue: val => Number(val).toFixed(1),
            };
          }
          // Default: FFMI
          return {
            value: user.stats_ffmi || 0,
            unit: '',
            label: 'FFMI',
            formatValue: val => Number(val).toFixed(2),
          };
        case 'ladderScore':
        default:
          return {
            value: user.ladderScore || 0,
            unit: t('community.ui.pointsUnit'),
            label: '戰鬥力',
            formatValue: val => formatScore(val),
          };
      }
    };

    const displayMetrics = getDisplayMetrics();

    // Modular badge system - returns array of active badges sorted by priority
    const getBadges = user => {
      const badges = [];

      // Priority 1: Verification (Highest Priority - always closest to name)
      if (!user.isAnonymous && user.isVerified) {
        badges.push({
          id: 'verified',
          icon: '🏅',
          text: '已認證',
          className: 'badge-verified',
          title: '榮譽認證',
        });
      }

      // Priority 2: 1000lb Club
      if (!user.isAnonymous && user.stats_sbdTotal >= 453.6) {
        badges.push({
          id: '1k',
          icon: '🏆',
          text: '1000lb',
          shortText: '1K',
          className: 'badge-1000lb',
          title: '1000lb Club',
        });
      }

      // Future badges can be added here with priority order

      return badges;
    };

    const badges = getBadges(user);

    return (
      <div
        id={`user-row-${user.id}`}
        data-user-id={user.id}
        className={`ladder__item ${
          isCurrentUser ? 'ladder__item--current-user' : ''
        } ${!user.isAnonymous ? 'clickable' : ''}`}
        style={{
          ...(isCurrentUser
            ? {
                background:
                  'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%)',
                borderLeft: '4px solid #ff6b35',
                fontWeight: '600',
              }
            : {}),
        }}
        onClick={!user.isAnonymous ? e => onUserClick?.(user, e) : undefined}
        title={!user.isAnonymous ? t('ladder.tooltips.viewTraining') : ''}
      >
        <div className="ladder__rank">
          <span
            className={`ladder__rank-number ${
              isCurrentUser ? 'rank-changing' : ''
            }`}
          >
            {rank}
          </span>
          <span className="ladder__rank-badge">{getRankBadge(rank)}</span>
        </div>

        <div className="ladder__user">
          <div
            className="ladder__avatar"
            style={{
              // 1. STRICT Box Model
              boxSizing: 'border-box',

              // 2. THE IRONCLAD FLEX LOCK (The most important part)
              // flex-grow: 0 (Don't grow)
              // flex-shrink: 0 (NEVER shrink)
              // flex-basis: 40px (Always start at 40px)
              flex: '0 0 40px',

              // 3. Explicit Dimensions (Redundant but necessary for safety)
              width: '40px',
              height: '40px',

              // 4. Perfect Circle Styling
              borderRadius: '50%',
              overflow: 'hidden',

              // 5. Placeholder & Layout Styling
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px', // Add spacing between avatar and name
            }}
          >
            {user.avatarUrl &&
            user.avatarUrl.trim() !== '' &&
            !user.isAnonymous ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={e => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.nextSibling;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className={`ladder__avatar-placeholder ${
                user.isAnonymous ? 'anonymous' : ''
              }`}
              style={{
                width: '100%',
                height: '100%',
                display:
                  user.avatarUrl &&
                  user.avatarUrl.trim() !== '' &&
                  !user.isAnonymous
                    ? 'none'
                    : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              } ${isCurrentUser ? 'current-user-flame' : ''}`}
            >
              <div className="ladder__user-name-container">
                <span className="ladder__user-name-text">
                  {user.displayName}
                  {user.isAnonymous && ' 🔒'}
                </span>
                {badges.length > 0 && (
                  <div className="ladder__badges">
                    {badges.map(badge => (
                      <span
                        key={badge.id}
                        className={badge.className}
                        title={badge.title}
                      >
                        <span className="badge-icon">{badge.icon}</span>
                        {badge.id === '1k' ? (
                          <>
                            <span className="badge-label">{badge.text}</span>
                            <span className="badge-short-label">
                              {badge.shortText}
                            </span>
                          </>
                        ) : (
                          <span className="badge-label">{badge.text}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
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

        <div className="ladder__score-section">
          <div className="ladder__score">
            <span className="ladder__score-value">
              {displayMetrics.icon && (
                <span className="ladder__score-icon">
                  {displayMetrics.icon}
                </span>
              )}
              {displayMetrics.formatValue(displayMetrics.value)}
            </span>
            <span className="ladder__score-label">{displayMetrics.unit}</span>
            <span className="ladder__score-sublabel">
              {displayMetrics.label}
            </span>
          </div>

          {user.isAnonymous ? (
            <div className="ladder__like-btn ladder__like-btn--placeholder">
              <span className="ladder__like-icon">👍</span>
              <span className="ladder__like-count">
                {user.ladderLikeCount || 0}
              </span>
            </div>
          ) : (
            <button
              className={`ladder__like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeClick}
              disabled={isLikeProcessing}
              title={isLiked ? t('ladder.unlike') : t('ladder.like')}
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
  },
  (prevProps, nextProps) => {
    // Custom comparison for React.memo
    const prevValue =
      prevProps.user[prevProps.displayMode || 'ladderScore'] || 0;
    const nextValue =
      nextProps.user[nextProps.displayMode || 'ladderScore'] || 0;

    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.rank === nextProps.rank &&
      prevProps.isCurrentUser === nextProps.isCurrentUser &&
      prevValue === nextValue &&
      prevProps.user.ladderLikeCount === nextProps.user.ladderLikeCount &&
      prevProps.isLiked === nextProps.isLiked &&
      prevProps.isLikeProcessing === nextProps.isLikeProcessing &&
      prevProps.displayMode === nextProps.displayMode
    );
  }
);

LadderItem.displayName = 'LadderItem';

LadderItem.propTypes = {
  user: PropTypes.object.isRequired,
  rank: PropTypes.number.isRequired,
  isCurrentUser: PropTypes.bool,
  onUserClick: PropTypes.func,
  onToggleLike: PropTypes.func,
  isLiked: PropTypes.bool,
  isLikeProcessing: PropTypes.bool,
  displayMode: PropTypes.string,
  filterProject: PropTypes.string,
};

export default LadderItem;
