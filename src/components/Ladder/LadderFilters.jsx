import React from 'react';
import PropTypes from 'prop-types';
import LadderDivisionSelector from './LadderDivisionSelector';
import './LadderFilters.css';

/**
 * LadderFilters - Division selector component
 * Renders the division card selector
 */
const LadderFilters = ({
  selectedDivision,
  onDivisionChange,
}) => {
  return (
    <div className="ladder__filters">
      <LadderDivisionSelector
        currentFilter={selectedDivision}
        onFilterChange={onDivisionChange}
      />
    </div>
  );
};

LadderFilters.propTypes = {
  selectedDivision: PropTypes.string.isRequired,
  onDivisionChange: PropTypes.func.isRequired,
};

export default LadderFilters;
