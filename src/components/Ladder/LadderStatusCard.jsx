import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { formatScore } from '../../utils.js';
import './LadderStatusCard.css';

/**
 * LadderStatusCard - Standalone card for embedding in UserInfo.jsx
 * Displays user's rank and score
 */
const LadderStatusCard = ({ userData, rank, onOpenLadder, onNavigate }) => {
  const { t } = useTranslation();

  if (!userData || !userData.ladderScore || userData.ladderScore === 0) {
    return null;
  }

  const getRankBadge = rank => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    if (rank <= 50) return '⭐';
    return '';
  };

  const rankBadge = getRankBadge(rank);

  // Support both onOpenLadder and onNavigate for backward compatibility
  const handleClick = onNavigate || onOpenLadder;

  return (
    <div
      className="ladder-status-card"
      onClick={handleClick}
      style={{ cursor: handleClick ? 'pointer' : 'default' }}
    >
      <div className="ladder-status-card__content">
        <div className="ladder-status-card__rank">
          <span className="ladder-status-card__rank-number">
            {rank > 0 ? rank : '未上榜'}
          </span>
          {rankBadge && (
            <span className="ladder-status-card__rank-badge">{rankBadge}</span>
          )}
        </div>

        <div className="ladder-status-card__info">
          <div className="ladder-status-card__label">{t('ladder.myRank')}</div>
          <div className="ladder-status-card__score">
            <span className="ladder-status-card__score-value">
              {formatScore(userData.ladderScore)}
            </span>
            <span className="ladder-status-card__score-label">
              {t('community.ui.pointsUnit')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

LadderStatusCard.propTypes = {
  userData: PropTypes.object,
  rank: PropTypes.number,
  onOpenLadder: PropTypes.func, // Legacy prop name
  onNavigate: PropTypes.func, // New prop name for navigation
};

export default LadderStatusCard;
