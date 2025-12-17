import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './Ladder.css';

/**
 * LadderFilters - Filter dropdowns component
 * Communicates with useLadder via props
 */
const LadderFilters = ({
  selectedAgeGroup,
  selectedTab,
  onAgeGroupChange,
  onTabChange,
  ageGroups,
}) => {
  const { t } = useTranslation();

  return (
    <div className="ladder__filters">
      <div className="ladder__filter-container">
        <select
          value={selectedTab}
          onChange={e => onTabChange(e.target.value)}
          className="ladder__filter-select"
        >
          <option value="total">{t('ladder.filters.total')}</option>
          <option value="weekly">{t('ladder.filters.weekly')}</option>
          <option value="verified">{t('ladder.filters.verified')}</option>
        </select>
      </div>

      <div className="ladder__filter-container">
        <select
          value={selectedAgeGroup}
          onChange={e => onAgeGroupChange(e.target.value)}
          className="ladder__filter-select"
        >
          {ageGroups.map(group => (
            <option key={group.value} value={group.value}>
              {t(`ladder.ageGroups.${group.value}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

LadderFilters.propTypes = {
  selectedAgeGroup: PropTypes.string.isRequired,
  selectedTab: PropTypes.string.isRequired,
  onAgeGroupChange: PropTypes.func.isRequired,
  onTabChange: PropTypes.func.isRequired,
  ageGroups: PropTypes.array.isRequired,
};

export default LadderFilters;
