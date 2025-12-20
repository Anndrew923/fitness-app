import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import LadderItem from './LadderItem';
import './LadderList.css';

/**
 * LadderList - Scrollable container with pull-to-refresh support
 * Uses simple pull-to-refresh (can be enhanced with framer-motion later)
 */
const LadderList = ({
  ladderData,
  displayStartRank,
  currentUserId,
  onUserClick,
  onToggleLike,
  likedUsers,
  likeProcessing,
  onRefresh,
  loading,
  displayMode,
}) => {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const listRef = useRef(null);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 80; // Distance to trigger refresh

  useEffect(() => {
    const handleTouchStart = e => {
      if (listRef.current && listRef.current.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = e => {
      if (!isPulling.current) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;

      if (distance > 0 && listRef.current?.scrollTop === 0) {
        e.preventDefault();
        const pullDistance = Math.min(distance, PULL_THRESHOLD * 1.5);
        setPullDistance(pullDistance);
      }
    };

    const handleTouchEnd = () => {
      if (isPulling.current && pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        onRefresh?.();
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 1000);
      } else {
        setPullDistance(0);
      }
      isPulling.current = false;
    };

    const container = listRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      container.addEventListener('touchend', handleTouchEnd);

      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [pullDistance, onRefresh]);

  return (
    <div className="ladder__list" ref={listRef}>
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="ladder__pull-refresh"
          style={{
            transform: `translateY(${Math.min(
              pullDistance,
              PULL_THRESHOLD
            )}px)`,
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
          }}
        >
          {pullDistance >= PULL_THRESHOLD ? (
            <span>釋放以刷新</span>
          ) : (
            <span>下拉刷新</span>
          )}
        </div>
      )}

      {loading && ladderData.length === 0 ? (
        <div className="ladder__loading">
          <div className="ladder__loading-spinner"></div>
          <p>{t('ladder.loading')}</p>
        </div>
      ) : ladderData.length === 0 ? (
        <div className="ladder__empty">
          <p>{t('ladder.empty.title')}</p>
          <p>{t('ladder.empty.subtitle')}</p>
        </div>
      ) : (
        ladderData.map((user, index) => {
          const actualRank = displayStartRank + index;
          const isCurrentUser = user.id === currentUserId;

          return (
            <LadderItem
              key={user.id}
              user={user}
              rank={actualRank}
              isCurrentUser={isCurrentUser}
              onUserClick={onUserClick}
              onToggleLike={onToggleLike}
              isLiked={likedUsers?.has(user.id)}
              isLikeProcessing={likeProcessing?.has(user.id)}
              displayMode={displayMode}
            />
          );
        })
      )}
    </div>
  );
};

LadderList.propTypes = {
  ladderData: PropTypes.array.isRequired,
  displayStartRank: PropTypes.number.isRequired,
  currentUserId: PropTypes.string,
  onUserClick: PropTypes.func,
  onToggleLike: PropTypes.func,
  likedUsers: PropTypes.instanceOf(Set),
  likeProcessing: PropTypes.instanceOf(Set),
  onRefresh: PropTypes.func,
  loading: PropTypes.bool,
  displayMode: PropTypes.string,
};

export default LadderList;
