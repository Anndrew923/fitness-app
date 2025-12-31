import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import LadderItem from './LadderItem';
import LadderEmptyState from './LadderEmptyState';
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
  filterProject,
  scrollTrigger,
}) => {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const listRef = useRef(null);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 80; // Distance to trigger refresh

  // Manual scroll to user (only when scrollTrigger changes - user clicks bottom bar)
  // Uses manual coordinate calculation for precise centering (bypasses scrollIntoView quirks)
  // Finds the actual scrollable container (.main-content) instead of window
  useEffect(() => {
    if (scrollTrigger > 0 && currentUserId) {
      const element = document.getElementById(`user-row-${currentUserId}`);
      
      if (element) {
        // 1. Find the nearest scrollable parent (The "Drawer")
        // (Looks for the closest ancestor with overflow-y: auto/scroll)
        let container = element.parentElement;
        while (
          container &&
          container !== document.body &&
          window.getComputedStyle(container).overflowY !== 'auto' &&
          window.getComputedStyle(container).overflowY !== 'scroll'
        ) {
          container = container.parentElement;
        }
        // Fallback to window if no container found (safety)
        if (!container || container === document.body) {
          container = window;
        }

        // 2. Calculate coordinates relative to the CONTAINER
        // Logic: CurrentScroll + DistanceFromContainerTop - HalfContainerHeight + HalfElementHeight
        if (container !== window) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const relativeTop = elementRect.top - containerRect.top; // Distance from visible container top
          const targetScrollTop =
            container.scrollTop +
            relativeTop -
            container.clientHeight / 2 +
            elementRect.height / 2;

          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth',
          });
        } else {
          // Fallback logic for Window (just in case)
          const elementTop =
            element.getBoundingClientRect().top + window.pageYOffset;
          const targetY =
            elementTop -
            window.innerHeight / 2 +
            element.offsetHeight / 2;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      } else {
        console.warn("User row not found in DOM");
      }
    }
  }, [scrollTrigger, currentUserId]);

  useEffect(() => {
    const handleTouchStart = e => {
      // Check global window scroll instead of element scroll (since element has overflow: hidden)
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = e => {
      if (!isPulling.current) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;

      // Check global window scroll instead of element scroll
      if (distance > 0 && window.scrollY === 0) {
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
    <div 
      className="ladder__list"
      ref={listRef}
    >
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
            <span>{t('ladder.pullRefresh.release', '釋放以刷新')}</span>
          ) : (
            <span>{t('ladder.pullRefresh.pull', '下拉刷新')}</span>
          )}
        </div>
      )}

      {loading && ladderData.length === 0 ? (
        <div className="ladder__loading">
          <div className="ladder__loading-spinner"></div>
          <p>{t('ladder.loading')}</p>
        </div>
      ) : ladderData.length === 0 ? (
        <LadderEmptyState division={displayMode} />
      ) : (
        ladderData.map((user, index) => {
          const actualRank = displayStartRank + index;
          const isCurrentUser = user.id === currentUserId;

          return (
            <div
              id={`user-row-${user.id}`}
              key={user.id}
              style={{ minHeight: '60px' }}
            >
              <LadderItem
                user={user}
                rank={actualRank}
                isCurrentUser={isCurrentUser}
                onUserClick={onUserClick}
                onToggleLike={onToggleLike}
                isLiked={likedUsers?.has(user.id)}
                isLikeProcessing={likeProcessing?.has(user.id)}
                displayMode={displayMode}
                filterProject={filterProject}
              />
            </div>
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
  filterProject: PropTypes.string,
  scrollTrigger: PropTypes.number,
};

export default LadderList;
