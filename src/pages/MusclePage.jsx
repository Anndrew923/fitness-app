import React from 'react';
import PropTypes from 'prop-types';
import './MusclePage.css';
import { useTranslation } from 'react-i18next';
import HonorUnlockModal from '../components/shared/modals/HonorUnlockModal';
import BottomNavBar from '../components/BottomNavBar';
import AdBanner from '../components/AdBanner';
import { useMuscleLogic } from '../hooks/useMuscleLogic';
import MuscleResult from './Muscle/MuscleResult';
import MuscleCharts from './Muscle/MuscleCharts';

function Muscle({ onComplete }) {
  const { t } = useTranslation();
  const {
    smm,
    setSmm,
    result,
    submitting,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    calculateMuscleScore,
    handleSubmit,
    weight,
    age,
    gender,
  } = useMuscleLogic();

  return (
    <div className="muscle-container">
      <h1>{t('tests.muscleTitle')}</h1>

      <div className="input-section">
        <p className="result-text">
          {t('common.weightLabel')}：
          {weight ? `${weight} kg` : t('common.notEntered')}
        </p>
        <p className="result-text">
          {t('common.ageLabel')}：{age || t('common.notEntered')}
        </p>
        <p className="result-text">
          {t('common.genderLabel')}：{gender || t('common.notSelected')}
        </p>

        <label htmlFor="smm" className="input-label">
          {t('tests.muscleLabels.smmKg')}
        </label>
        <input
          id="smm"
          name="smm"
          type="number"
          placeholder={t('tests.muscleLabels.smmKg')}
          value={smm}
          onChange={e => setSmm(e.target.value)}
          className="input-field"
        />
        <button onClick={calculateMuscleScore} className="calculate-btn">
          {t('common.calculate')}
        </button>
      </div>

      {result.smmScore !== null && (
        <MuscleResult 
          result={result}
          setIsUnlockModalOpen={setIsUnlockModalOpen}
        />
      )}

      {result.finalScore && (
        <MuscleCharts result={result} />
      )}

      <div className="button-group">
        <button
          type="button"
          onClick={handleSubmit}
          className="submit-btn"
          disabled={submitting}
        >
          {submitting ? t('common.submitting') : t('common.submitAndReturn')}
        </button>
      </div>

      <HonorUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
      />

      {result.finalScore !== null && (
        <div className="ad-section" style={{ margin: '20px 0', textAlign: 'center' }}>
          <AdBanner position="inline" isFixed={false} showAd={true} />
        </div>
      )}

      <div style={{ height: '160px', width: '100%' }} />

      <BottomNavBar />
    </div>
  );
}

Muscle.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Muscle;
