import React from 'react';
import PropTypes from 'prop-types';
import './SkeletonLoader.css';

/**
 * 骨架屏載入組件
 * 用於提升用戶感知性能
 */
const SkeletonLoader = ({ type = 'default', count = 1 }) => {
  if (type === 'ladder') {
    return (
      <div className="skeleton-ladder">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton-ladder-item">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-content">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'community') {
    return (
      <div className="skeleton-community">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton-post">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-line short"></div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-line long"></div>
              <div className="skeleton-line medium"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 默認骨架屏
  return (
    <div className="skeleton-default">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton-item">
          <div className="skeleton-line"></div>
        </div>
      ))}
    </div>
  );
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(['default', 'ladder', 'community']),
  count: PropTypes.number,
};

export default React.memo(SkeletonLoader);

