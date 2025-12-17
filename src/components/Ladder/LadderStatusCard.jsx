import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { formatScore } from '../../utils.js';
import { useUserRank } from '../../hooks/useUserRank';
import './LadderStatusCard.css';

/**
 * LadderStatusCard - Modern Dashboard Widget
 * Displays user's rank and score with a professional, scalable design
 *
 * ✅ Self-Fetching: If rank prop is not provided, automatically fetches user's rank
 * using efficient Firestore aggregation query.
 *
 * @param {Object} userData - User data containing ladderScore
 * @param {number} rank - User's rank (0 or null means unranked). If not provided, will be fetched automatically.
 * @param {Function} onNavigate - Navigation handler
 * @param {Function} onOpenLadder - Legacy navigation handler (for backward compatibility)
 * @param {string} title - Card title (default: "全服排名") - For future expansion (Job Rank, Region Rank)
 */
const LadderStatusCard = ({
  userData,
  rank: rankProp,
  onNavigate,
  onOpenLadder,
  title,
}) => {
  const { t } = useTranslation();

  // ✅ Self-Fetching: Use hook to fetch rank if prop is not provided
  const { rank: fetchedRank, loading: rankLoading } = useUserRank(
    userData?.ladderScore,
    rankProp
  );

  // Use prop if provided, otherwise use fetched rank
  const rank =
    rankProp !== null && rankProp !== undefined ? rankProp : fetchedRank;

  // Support both onNavigate and onOpenLadder for backward compatibility
  const handleClick = onNavigate || onOpenLadder;

  // Determine if user is ranked
  // ✅ rank === 0, null, or undefined means unranked
  // ✅ ladderScore === 0 also means unranked
  const hasValidScore = userData?.ladderScore && userData.ladderScore > 0;
  const isRanked =
    hasValidScore && rank !== null && rank !== undefined && rank > 0;
  // ✅ Show loading only when fetching (rankProp not provided)
  const isLoading =
    rankLoading && (rankProp === null || rankProp === undefined);

  // Get rank badge icon
  const getRankBadge = rank => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    if (rank <= 50) return '⭐';
    return '🛡️';
  };

  // Get rank class for special styling
  const getRankClass = rank => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const rankBadge = isRanked ? getRankBadge(rank) : '📊';
  const rankClass = isRanked ? getRankClass(rank) : 'rank-unranked';

  // Display title (default to translation key)
  const displayTitle = title || t('ladder.myRank');

  return (
    <div
      className={`ladder-status-card ${rankClass} ${
        handleClick ? 'clickable' : ''
      }`}
      onClick={handleClick}
      role={handleClick ? 'button' : undefined}
      tabIndex={handleClick ? 0 : undefined}
      onKeyDown={
        handleClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      {/* Left: Rank Icon + Number */}
      <div className="ladder-status-card__rank-section">
        <div className="ladder-status-card__rank-icon">{rankBadge}</div>
        <div className="ladder-status-card__rank-number">
          {isLoading ? (
            <span className="ladder-status-card__loading-dots">...</span>
          ) : isRanked ? (
            rank
          ) : (
            '—'
          )}
        </div>
      </div>

      {/* Middle: Label + Score */}
      <div className="ladder-status-card__info-section">
        <div className="ladder-status-card__label">{displayTitle}</div>
        {isLoading ? (
          <div className="ladder-status-card__score">
            <span className="ladder-status-card__loading-skeleton">
              載入中...
            </span>
          </div>
        ) : hasValidScore && isRanked ? (
          <div className="ladder-status-card__score">
            <span className="ladder-status-card__score-value">
              {formatScore(userData.ladderScore)}
            </span>
            <span className="ladder-status-card__score-unit">
              {t('community.ui.pointsUnit')}
            </span>
          </div>
        ) : (
          <div className="ladder-status-card__unranked-message">
            {t('ladder.notRanked') || '尚未入榜'}
          </div>
        )}
      </div>

      {/* Right: Navigation Arrow */}
      {handleClick && (
        <div className="ladder-status-card__arrow">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

LadderStatusCard.propTypes = {
  userData: PropTypes.object,
  rank: PropTypes.number,
  onNavigate: PropTypes.func,
  onOpenLadder: PropTypes.func, // Legacy prop name for backward compatibility
  title: PropTypes.string, // For future expansion (Job Rank, Region Rank, etc.)
};

LadderStatusCard.defaultProps = {
  title: null, // Will use translation key by default
};

export default LadderStatusCard;
