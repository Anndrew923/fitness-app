import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useStrengthLogic } from './useStrengthLogic';
import StrengthExerciseCard from './StrengthExerciseCard';
import StrengthRadarChart from './StrengthRadarChart';
import StrengthScoreBreakdown from './StrengthScoreBreakdown';
import StrengthStandardsTab from './StrengthStandardsTab';
import StrengthSuccessModal from './StrengthSuccessModal';
import HonorUnlockModal from '../components/shared/modals/HonorUnlockModal';
import BottomNavBar from '../components/BottomNavBar';
import AdBanner from '../components/AdBanner';
import './StrengthPage.css';

function Strength() {
  const { t } = useTranslation();

  const {
    currentTab,
    setCurrentTab,
    exercises,
    expandedExercises,
    setExpandedExercises,
    averageScore,
    radarData,
    submitting,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    unlockModalData,
    setUnlockModalData,
    showSuccessModal,
    setShowSuccessModal,
    calculateMaxStrength,
    handleSubmit,
    handleUnlockClick,
    getStrengthFeedback,
    getLevelFromScore,
    userData: logicUserData,
  } = useStrengthLogic();

  const toggleExerciseExpanded = useMemo(
    () => key => {
      const newExpanded = new Set(expandedExercises);
      if (newExpanded.has(key)) {
        newExpanded.delete(key);
      } else {
        newExpanded.add(key);
      }
      setExpandedExercises(newExpanded);
    },
    [expandedExercises, setExpandedExercises]
  );

  return (
    <div className="strength-container">
      <div className="strength-header">
        <h1 className="strength-title">💪 {t('tests.strengthTitle')}</h1>
        <p className="strength-safety-note">{t('tests.strengthSafetyNote')}</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${currentTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setCurrentTab('exercises')}
        >
          🏋️ {t('tests.startTest')}
        </button>
        <button
          className={`tab-btn ${currentTab === 'standards' ? 'active' : ''}`}
          onClick={() => setCurrentTab('standards')}
        >
          📋 {t('tests.strengthStandards.tabTitle')}
        </button>
      </div>

      {currentTab === 'exercises' && (
        <div className="exercises-tab">
          <div className="exercises-grid">
            {exercises.map(exercise => (
              <StrengthExerciseCard
                key={exercise.key}
                exercise={exercise}
                isExpanded={expandedExercises.has(exercise.key)}
                onToggle={() => toggleExerciseExpanded(exercise.key)}
                onCalculate={calculateMaxStrength}
                onUnlock={handleUnlockClick}
              />
            ))}
          </div>

          {averageScore && (
            <div className="results-section">
              <StrengthRadarChart radarData={radarData} />
              <StrengthScoreBreakdown
                exercises={exercises}
                averageScore={averageScore}
                userData={logicUserData}
                onUnlock={handleUnlockClick}
                getStrengthFeedback={getStrengthFeedback}
                getLevelFromScore={getLevelFromScore}
                setIsUnlockModalOpen={setIsUnlockModalOpen}
                setUnlockModalData={setUnlockModalData}
              />
            </div>
          )}
        </div>
      )}

      {currentTab === 'standards' && <StrengthStandardsTab />}

      <div className="submit-section">
        <button
          type="button"
          onClick={handleSubmit}
          className="submit-btn"
          disabled={!averageScore || submitting}
        >
          {submitting
            ? t('common.submitting')
            : averageScore
            ? `✅ ${t('tests.gamified.submit_btn')}`
            : t('errors.required')}
        </button>
      </div>

      <HonorUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setUnlockModalData(null);
        }}
        data={unlockModalData}
      />

      {averageScore !== null && (
        <div
          className="ad-section"
          style={{ margin: '20px 0', textAlign: 'center' }}
        >
          <AdBanner position="inline" isFixed={false} showAd={true} />
        </div>
      )}

      <div style={{ height: '160px', width: '100%' }} />
      <BottomNavBar />

      <StrengthSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}

Strength.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Strength;
