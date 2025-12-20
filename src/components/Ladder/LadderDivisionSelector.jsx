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
  {
    label: '🫁 心肺耐力',
    value: 'stats_cooper',
    desc: 'Cooper Test',
  },
  {
    label: '⚡ 爆發力',
    value: 'stats_vertical',
    desc: '垂直跳躍',
  },
  {
    label: '💪 肌肉巨獸',
    value: 'stats_ffmi',
    desc: 'FFMI 評分',
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

