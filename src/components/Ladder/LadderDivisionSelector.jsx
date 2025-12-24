import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './LadderDivisionSelector.css';

const LadderDivisionSelector = ({ currentFilter, onFilterChange }) => {
  const { t } = useTranslation();

  const DIVISION_OPTIONS = [
    {
      label: '👑 ' + t('ladder.zones.all'),
      value: 'ladderScore',
      desc: t('ladder.filter.filter'),
    },
    {
      label: '📅 ' + t('ladder.filters.weekly'),
      value: 'stats_totalLoginDays',
      desc: t('ladder.zones.district'),
    },
    {
      label: '💪 ' + t('tests.strength'),
      value: 'stats_sbdTotal',
      desc: 'SBD',
    },
    {
      label: '🔥 ' + t('tests.bodyFat'),
      value: 'stats_bodyFat',
      desc: t('tests.bodyFat'),
    },
    {
      label: '📍 ' + t('ladder.filter.zone'),
      value: 'local_district',
      desc: t('ladder.zones.district'),
    },
    {
      label: '🫁 ' + t('tests.cardio'),
      value: 'stats_cooper',
      desc: 'Cooper Test',
    },
    {
      label: '⚡ ' + t('tests.explosivePower'),
      value: 'stats_vertical',
      desc: t('tests.explosivePower'),
    },
    {
      label: '💪 ' + t('tests.muscleMass'),
      value: 'stats_ffmi',
      desc: 'FFMI',
    },
  ];

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
