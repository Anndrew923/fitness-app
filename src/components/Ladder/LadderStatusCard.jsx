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

  // ✅ Show loading ONLY if:
  // 1. No rank prop provided (need to fetch)
  // 2. Hook is actually loading
  // 3. No cached rank available (if cached, it should be instant)
  const isLoading =
    (rankProp === null || rankProp === undefined) &&
    rankLoading &&
    rank === null;

  // Get rank badge icon (only for top 3)
  const getRankBadge = rank => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null; // No icon for others
  };

  // Get rank class for special styling
  const getRankClass = rank => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const rankBadge = isRanked ? getRankBadge(rank) : null;
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
      {/* Left: Rank Section */}
      <div className="ladder-status-card__rank-section">
        <div className="ladder-status-card__rank-label">我的排名</div>
        <div className="ladder-status-card__rank-number">
          {isLoading ? (
            <span className="ladder-status-card__loading-dots skeleton-loader">
              &nbsp;
            </span>
          ) : isRanked ? (
            <>
              {rankBadge && (
                <span className="ladder-status-card__rank-badge">
                  {rankBadge}
                </span>
              )}
              <span className="ladder-status-card__rank-value">{rank}</span>
            </>
          ) : (
            <span className="ladder-status-card__rank-unranked">—</span>
          )}
        </div>
      </div>

      {/* Right: Score Section */}
      <div className="ladder-status-card__score-section">
        <div className="ladder-status-card__score-label">戰鬥力</div>
        {isLoading ? (
          <div className="ladder-status-card__score-value-wrapper">
            <span className="ladder-status-card__loading-skeleton skeleton-loader">
              &nbsp;
            </span>
          </div>
        ) : hasValidScore && isRanked ? (
          <div className="ladder-status-card__score-value-wrapper">
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
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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
