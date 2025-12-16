import React from 'react';
import PropTypes from 'prop-types';
import './LadderStatusCard.css';

/**
 * 天梯狀態卡片組件
 * 支援兩種模式：default (完整卡片) 和 compact (精簡膠囊)
 */
const LadderStatusCard = ({
  userData,
  rank,
  metricConfig,
  variant = 'default',
  onNavigate,
}) => {
  if (!userData || !metricConfig) {
    return null;
  }

  // 提取指標值
  const extractValue = () => {
    // 處理簡單字段（如 ladderScore）
    if (metricConfig.dbField === 'ladderScore') {
      return Number(userData.ladderScore) || 0;
    }

    // 處理嵌套字段路徑（例如 'testInputs.strength.benchPress.max'）
    const fieldPath = metricConfig.dbField.split('.');
    let value = userData;

    for (const field of fieldPath) {
      if (value && typeof value === 'object' && field in value) {
        value = value[field];
      } else {
        return 0;
      }
    }

    return Number(value) || 0;
  };

  const metricValue = extractValue();

  if (variant === 'compact') {
    return (
      <div
        className="ladder-status-card ladder-status-card--compact"
        onClick={onNavigate}
      >
        <div className="ladder-status-card__content">
          <span className="ladder-status-card__icon">🏆</span>
          <span className="ladder-status-card__text">
            排名 #{rank || '未上榜'}
          </span>
          <span className="ladder-status-card__divider">|</span>
          <span className="ladder-status-card__text">戰力 {metricValue}</span>
        </div>
      </div>
    );
  }

  // default 模式
  return (
    <div className="ladder-status-card ladder-status-card--default">
      <div className="ladder-status-card__header">
        <h3 className="ladder-status-card__title">{metricConfig.label}</h3>
      </div>
      <div className="ladder-status-card__body">
        <div className="ladder-status-card__rank">
          <span className="ladder-status-card__rank-label">排名</span>
          <span className="ladder-status-card__rank-value">
            #{rank || '未上榜'}
          </span>
        </div>
        <div className="ladder-status-card__score">
          <span className="ladder-status-card__score-label">戰力</span>
          <span className="ladder-status-card__score-value">
            {metricValue} {metricConfig.unit}
          </span>
        </div>
      </div>
      {onNavigate && (
        <button className="ladder-status-card__action" onClick={onNavigate}>
          查看完整排名
        </button>
      )}
    </div>
  );
};

LadderStatusCard.propTypes = {
  userData: PropTypes.object,
  rank: PropTypes.number,
  metricConfig: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['default', 'compact']),
  onNavigate: PropTypes.func,
};

export default LadderStatusCard;
