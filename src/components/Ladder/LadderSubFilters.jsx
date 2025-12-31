import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './LadderSubFilters.css';

const LadderSubFilters = ({
  filterGender,
  filterAge,
  filterHeight,
  filterWeight,
  filterJob,
  filterProject,
  currentDivision,
  onGenderChange,
  onAgeChange,
  onHeightChange,
  onWeightChange,
  onJobChange,
  onProjectChange,
}) => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en-US';

  const heightOptions = [
    { value: 'all', label: t('common.all') },
    { value: '<160', label: '< 160 cm' },
    { value: '160-170', label: '160 - 170 cm' },
    { value: '170-180', label: '170 - 180 cm' },
    { value: '180-190', label: '180 - 190 cm' },
    { value: '>190', label: '> 190 cm' },
  ];

  const JOB_OPTIONS = [
    { value: 'all', label: t('common.all') },
    { value: 'engineering', label: t('userInfo.profession.engineering') },
    { value: 'medical', label: t('userInfo.profession.medical') },
    { value: 'coach', label: t('userInfo.profession.coach') },
    { value: 'student', label: t('userInfo.profession.student') },
    {
      value: 'police_military',
      label: t('userInfo.profession.police_military'),
    },
    { value: 'business', label: t('userInfo.profession.business') },
    { value: 'freelance', label: t('userInfo.profession.freelance') },
    { value: 'service', label: t('userInfo.profession.service') },
    {
      value: 'professional_athlete',
      label: t('userInfo.profession.professional_athlete'),
    },
    {
      value: 'artist_performer',
      label: t('userInfo.profession.artist_performer'),
    },
    { value: 'other', label: t('userInfo.profession.other') },
  ];

  // Determine which project filter to show based on division
  const getProjectOptions = () => {
    switch (currentDivision) {
      case 'stats_sbdTotal':
        return [
          {
            value: 'total_five',
            label: t('ladder.filter.totalFive', '五項總和'),
          },
          {
            value: 'total',
            label: t('ladder.filter.sbdTotal', '三項總和'),
          },
          { value: 'squat', label: t('tests.strengthExercises.squat') },
          { value: 'bench', label: t('tests.strengthExercises.benchPress') },
          { value: 'deadlift', label: t('tests.strengthExercises.deadlift') },
          { value: 'ohp', label: t('tests.strengthExercises.shoulderPress') },
          { value: 'latPull', label: t('tests.strengthExercises.latPulldown') },
        ];
      case 'stats_cooper':
        return [
          { value: 'cooper', label: t('tests.cardioTabs.cooper') },
          { value: '5km', label: t('tests.cardioTabs.run5km') },
        ];
      case 'stats_vertical':
        return [
          { value: 'vertical', label: t('tests.powerLabels.verticalJump') },
          { value: 'broad', label: t('tests.powerLabels.standingLongJump') },
          { value: 'sprint', label: t('tests.powerLabels.sprint') },
        ];
      case 'stats_bodyFat':
        return [
          { value: 'bodyFat', label: t('tests.bodyFat') },
          { value: 'ffmi', label: t('tests.ffmiLabels.ffmi') },
        ];
      case 'stats_ffmi':
        return [
          {
            value: 'score',
            label: t('tests.muscleLabels.smmScore', '骨骼肌分數'),
          },
          {
            value: 'weight',
            label: t('tests.muscleLabels.smmKg', '骨骼肌重 kg'),
          },
          {
            value: 'ratio',
            label: t('tests.muscleLabels.smPercentShort', '骨骼肌率 %'),
          },
        ];
      default:
        return [];
    }
  };

  const projectOptions = getProjectOptions();
  const showProjectFilter = projectOptions.length > 0;

  return (
    <div className="ladder-sub-filters">
      <div className="ladder-sub-filter-group">
        <label className="ladder-sub-filter-label">
          {t('userInfo.gender')}
        </label>
        <select
          value={filterGender}
          onChange={e => onGenderChange(e.target.value)}
          className="ladder-sub-filter-select"
        >
          <option value="all">{t('common.all')}</option>
          <option value="male">{t('userInfo.male')}</option>
          <option value="female">{t('userInfo.female')}</option>
        </select>
      </div>

      <div className="ladder-sub-filter-group">
        <label className="ladder-sub-filter-label">
          {t('common.ageLabel')}
        </label>
        <select
          value={filterAge}
          onChange={e => onAgeChange(e.target.value)}
          className="ladder-sub-filter-select"
        >
          <option value="all">{t('common.all')}</option>
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
        <label className="ladder-sub-filter-label">
          {t('ladder.filter.height')}
        </label>
        <select
          value={filterHeight || 'all'}
          onChange={e => onHeightChange(e.target.value)}
          className="ladder-sub-filter-select"
        >
          {heightOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ladder-sub-filter-group">
        <label className="ladder-sub-filter-label">
          {t('userInfo.weight')}
        </label>
        <select
          value={filterWeight}
          onChange={e => onWeightChange(e.target.value)}
          className="ladder-sub-filter-select"
        >
          <option value="all">{t('common.all')}</option>
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
        <label className="ladder-sub-filter-label">
          {t('userInfo.training.profession', '職業')}
        </label>
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

      {showProjectFilter && (
        <div className="ladder-sub-filter-group">
          <label className="ladder-sub-filter-label">
            {t('ladder.filter.filter')}
          </label>
          <select
            value={filterProject}
            onChange={e => onProjectChange(e.target.value)}
            className="ladder-sub-filter-select"
          >
            {projectOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

LadderSubFilters.propTypes = {
  filterGender: PropTypes.string.isRequired,
  filterAge: PropTypes.string.isRequired,
  filterHeight: PropTypes.string,
  filterWeight: PropTypes.string.isRequired,
  filterJob: PropTypes.string.isRequired,
  filterProject: PropTypes.string.isRequired,
  currentDivision: PropTypes.string.isRequired,
  onGenderChange: PropTypes.func.isRequired,
  onAgeChange: PropTypes.func.isRequired,
  onHeightChange: PropTypes.func.isRequired,
  onWeightChange: PropTypes.func.isRequired,
  onJobChange: PropTypes.func.isRequired,
  onProjectChange: PropTypes.func.isRequired,
};

export default LadderSubFilters;
