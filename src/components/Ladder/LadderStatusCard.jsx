import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { formatScore } from '../../utils.js';
import './LadderStatusCard.css';
import logger from '../../utils/logger';

// Cache configuration (matching useUserRank hook)
const CACHE_TTL = 300000; // 5 minutes
const CACHE_KEY_PREFIX = 'ladder_rank_cache_';

/**
 * LadderStatusCard - Black & Gold Premium Design
 * ✅ Fixed: Uses Lazy Initialization to prevent stuck loading state on remount
 *
 * @param {Object} userData - User data containing ladderScore, userId
 * @param {number} rank - User's rank (if provided, skips fetch)
 * @param {Function} onNavigate - Navigation handler (optional)
 * @param {Function} onOpenLadder - Legacy navigation handler (optional)
 * @param {string} title - Card title (optional)
 */
const LadderStatusCard = ({
  userData,
  rank: propRank,
  onNavigate,
  onOpenLadder,
  title,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Helper to read cache synchronously during initialization
  const getInitialState = () => {
    // 1. Priority: Props (if provided, use immediately)
    if (propRank !== null && propRank !== undefined) {
      logger.debug('⚡ [LadderCard] Using prop rank:', propRank);
      return { displayRank: propRank, loading: false };
    }

    // 2. Guard: No user data or score
    if (!userData || !userData.ladderScore || userData.ladderScore <= 0) {
      return { displayRank: 0, loading: false };
    }

    // 3. Try Cache (synchronous read for instant render)
    const userId = userData.userId || userData.id || auth.currentUser?.uid;
    if (userId) {
      try {
        const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const age = Date.now() - parsed.timestamp;
          const isFresh = age < CACHE_TTL;
          const isScoreSame = parsed.score === userData.ladderScore;

          if (isFresh && isScoreSame) {
            logger.debug('⚡ [LadderCard] Immediate Cache Hit:', parsed.rank);
            return { displayRank: parsed.rank, loading: false };
          } else {
            // Cache stale or score changed, remove it
            sessionStorage.removeItem(cacheKey);
          }
        }
      } catch (e) {
        logger.warn('⚠️ [LadderCard] Cache read error:', e);
      }
    }

    // 4. Default: Need to fetch
    return { displayRank: null, loading: true };
  };

  // ✅ Lazy Initialization: Check cache synchronously during state init
  const [{ displayRank, loading }, setState] = useState(getInitialState);

  // Effect for fetching (only if needed)
  useEffect(() => {
    // If we already have data (from Lazy Init or props), skip fetch
    if (!loading && displayRank !== null) {
      return;
    }

    // If prop provided, use it
    if (propRank !== null && propRank !== undefined) {
      setState({ displayRank: propRank, loading: false });
      return;
    }

    // Safety check: No user data or invalid score
    if (!userData || !userData.ladderScore || userData.ladderScore <= 0) {
      if (loading) {
        setState({ displayRank: 0, loading: false });
      }
      return;
    }

    const userId = userData.userId || userData.id || auth.currentUser?.uid;
    const currentScore = userData.ladderScore;
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;

    if (!userId) {
      setState({ displayRank: 0, loading: false });
      return;
    }

    let isMounted = true;

    const fetchRank = async () => {
      try {
        logger.debug('🔍 [LadderCard] Fetching from Firestore...', {
          userId,
          currentScore,
        });

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('ladderScore', '>', currentScore));
        const snapshot = await getCountFromServer(q);
        const myRank = snapshot.data().count + 1;

        if (isMounted) {
          setState({ displayRank: myRank, loading: false });

          // Update Cache
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                rank: myRank,
                score: currentScore,
                timestamp: Date.now(),
              })
            );
            logger.debug('💾 [LadderCard] Cache updated:', myRank);
          } catch (e) {
            logger.warn('⚠️ [LadderCard] Cache write error:', e);
          }
        }
      } catch (error) {
        logger.error('❌ [LadderCard] Rank fetch failed:', error);
        if (isMounted) {
          setState({ displayRank: 0, loading: false });
        }
      }
    };

    fetchRank();

    return () => {
      isMounted = false;
    };
    // ✅ Dependencies: Only re-run when these change (not loading/displayRank to avoid loops)
  }, [userData?.ladderScore, userData?.userId, propRank]);

  // Support both onNavigate and onOpenLadder for backward compatibility
  const handleClick = onNavigate || onOpenLadder || (() => navigate('/ladder'));

  // Determine final rank to display
  const finalRank =
    propRank !== null && propRank !== undefined ? propRank : displayRank;

  // Determine if user is ranked
  const hasValidScore = userData?.ladderScore && userData.ladderScore > 0;
  const isRanked =
    hasValidScore &&
    finalRank !== null &&
    finalRank !== undefined &&
    finalRank > 0;

  // Show loading only if explicitly loading AND no rank yet
  const isLoading = loading && (finalRank === null || finalRank === undefined);

  // Get rank badge icon (only for top 3)
  const getRankBadge = rank => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  // Get rank class for special styling
  const getRankClass = rank => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const rankBadge = isRanked ? getRankBadge(finalRank) : null;
  const rankClass = isRanked ? getRankClass(finalRank) : 'rank-unranked';

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
        <div className="ladder-status-card__rank-label">{t('userInfo.profileCard.myRank')}</div>
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
              <span className="ladder-status-card__rank-value">
                {finalRank}
              </span>
            </>
          ) : (
            <span className="ladder-status-card__rank-unranked">—</span>
          )}
        </div>
      </div>

      {/* Right: Score Section */}
      <div className="ladder-status-card__score-section">
        <div className="ladder-status-card__score-label">{t('userInfo.profileCard.combatPower')}</div>
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
