import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './LadderSubFilters.css';

const LadderSubFilters = ({
  filterGender,
  filterAge,
  filterWeight,
  filterJob,
  filterProject,
  currentDivision,
  onGenderChange,
  onAgeChange,
  onWeightChange,
  onJobChange,
  onProjectChange,
}) => {
  const { t } = useTranslation();

  const JOB_OPTIONS = [
    { value: 'all', label: '全部' },
    { value: 'engineering', label: '工程師' },
    { value: 'medical', label: '醫療人員' },
    { value: 'coach', label: '健身教練' },
    { value: 'student', label: '學生' },
    { value: 'police_military', label: '軍警消' },
    { value: 'business', label: '商業/金融' },
    { value: 'freelance', label: '自由業/設計' },
    { value: 'service', label: '服務業' },
    { value: 'other', label: '其他' },
  ];

  const showLiftFilter = currentDivision === 'stats_sbdTotal';

  return (
    <div className="ladder-sub-filters">
      <div className="ladder-sub-filter-group">
        <label className="ladder-sub-filter-label">性別</label>
        <select
          value={filterGender}
          onChange={e => onGenderChange(e.target.value)}
          className="ladder-sub-filter-select"
        >
          <option value="all">全部</option>
          <option value="male">{t('userInfo.male')}</option>
          <option value="female">{t('userInfo.female')}</option>
        </select>
      </div>

      <div className="ladder-sub-filter-group">
        <label className="ladder-sub-filter-label">年齡</label>
        <select
          value={filterAge}
          onChange={e => onAgeChange(e.target.value)}
          className="ladder-sub-filter-select"
        >
          <option value="all">全部</option>
          <option value="under-20">&lt; 20</option>
          <option value="20-29">20-29</option>
          <option value="30-39">30-39</option>
          <option value="40-49">40-49</option>
          <option value="50-59">50-59</option>
          <option value="60-69">60-69</option>
          <option value="70+">70+</option>
        </select>
      </div>

      <div className="ladder-sub-filter-group">
        <label className="ladder-sub-filter-label">體重</label>
        <select
          value={filterWeight}
          onChange={e => onWeightChange(e.target.value)}
          className="ladder-sub-filter-select"
        >
          <option value="all">全部</option>
          <option value="under-50kg">&lt; 50kg</option>
          <option value="50-60kg">50-60kg</option>
          <option value="60-70kg">60-70kg</option>
          <option value="70-80kg">70-80kg</option>
          <option value="80-90kg">80-90kg</option>
          <option value="90-100kg">90-100kg</option>
          <option value="100-110kg">100-110kg</option>
          <option value="110kg+">110kg+</option>
        </select>
      </div>

      <div className="ladder-sub-filter-group">
        <label className="ladder-sub-filter-label">職業</label>
        <select
          value={filterJob}
          onChange={e => onJobChange(e.target.value)}
          className="ladder-sub-filter-select"
        >
          {JOB_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {showLiftFilter && (
        <div className="ladder-sub-filter-group">
          <label className="ladder-sub-filter-label">項目</label>
          <select
            value={filterProject}
            onChange={e => onProjectChange(e.target.value)}
            className="ladder-sub-filter-select"
          >
            <option value="total">總和</option>
            <option value="squat">深蹲</option>
            <option value="bench">臥推</option>
            <option value="deadlift">硬舉</option>
          </select>
        </div>
      )}
    </div>
  );
};

LadderSubFilters.propTypes = {
  filterGender: PropTypes.string.isRequired,
  filterAge: PropTypes.string.isRequired,
  filterWeight: PropTypes.string.isRequired,
  filterJob: PropTypes.string.isRequired,
  filterProject: PropTypes.string.isRequired,
  currentDivision: PropTypes.string.isRequired,
  onGenderChange: PropTypes.func.isRequired,
  onAgeChange: PropTypes.func.isRequired,
  onWeightChange: PropTypes.func.isRequired,
  onJobChange: PropTypes.func.isRequired,
  onProjectChange: PropTypes.func.isRequired,
};

export default LadderSubFilters;

