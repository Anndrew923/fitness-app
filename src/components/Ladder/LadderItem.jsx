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
          if (filterProject === 'squat' && user.stats_squat) {
            return {
              value: user.stats_squat || 0,
              unit: 'kg',
              label: '深蹲',
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'bench' && user.stats_bench) {
            return {
              value: user.stats_bench || 0,
              unit: 'kg',
              label: '臥推',
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'deadlift' && user.stats_deadlift) {
            return {
              value: user.stats_deadlift || 0,
              unit: 'kg',
              label: '硬舉',
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

    return (
      <div
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
          <div className="ladder__avatar">
            {user.avatarUrl &&
            user.avatarUrl.trim() !== '' &&
            !user.isAnonymous ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                loading="lazy"
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
              } ${isCurrentUser ? 'current-user-flame' : ''}`}
            >
              {user.displayName}
              {user.isVerified && (
                <span className="ladder__verification-badge" title="榮譽認證">
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

        <div className="ladder__score-section">
          <div className="ladder__score">
            <span className="ladder__score-value">
              {displayMetrics.icon && (
                <span className="ladder__score-icon">{displayMetrics.icon}</span>
              )}
              {displayMetrics.formatValue(displayMetrics.value)}
            </span>
            <span className="ladder__score-label">
              {displayMetrics.unit}
            </span>
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
    const prevValue = prevProps.user[prevProps.displayMode || 'ladderScore'] || 0;
    const nextValue = nextProps.user[nextProps.displayMode || 'ladderScore'] || 0;
    
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
