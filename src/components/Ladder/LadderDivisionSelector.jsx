import React from 'react';
import PropTypes from 'prop-types';
import './LadderDivisionSelector.css';

const DIVISION_OPTIONS = [
  {
    label: '👑 全服戰力',
    value: 'ladderScore',
    desc: '綜合評分',
  },
  {
    label: '📅 自律狂人',
    value: 'stats_totalLoginDays',
    desc: '累積登入',
  },
  {
    label: '💪 三項總和',
    value: 'stats_sbdTotal',
    desc: 'SBD 總和',
  },
  {
    label: '🔥 極致體脂',
    value: 'stats_bodyFat',
    desc: '低體脂排行',
  },
  {
    label: '📍 我的賽區',
    value: 'local_district',
    desc: '地區排名',
  },
];

const LadderDivisionSelector = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="ladder-division-selector">
      {DIVISION_OPTIONS.map(option => (
        <div
          key={option.value}
          className={`ladder-division-card ${
            currentFilter === option.value ? 'ladder-division-card--active' : ''
          }`}
          onClick={() => onFilterChange(option.value)}
        >
          <div className="ladder-division-card__label">{option.label}</div>
          <div className="ladder-division-card__desc">{option.desc}</div>
        </div>
      ))}
    </div>
  );
};

LadderDivisionSelector.propTypes = {
  currentFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default LadderDivisionSelector;

