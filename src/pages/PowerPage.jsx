import React from 'react';
import PropTypes from 'prop-types';
import './PowerPage.css';
import { useTranslation } from 'react-i18next';
import BottomNavBar from '../components/BottomNavBar';
import AdBanner from '../components/AdBanner';
import HonorUnlockModal from '../components/shared/modals/HonorUnlockModal';
import { usePowerLogic } from '../hooks/usePowerLogic';
import PowerForms from './Power/PowerForms';
import PowerResult from './Power/PowerResult';

function Power({ onComplete }) {
  const { t } = useTranslation();
  const {
    verticalJump,
    setVerticalJump,
    standingLongJump,
    setStandingLongJump,
    sprint,
    setSprint,
    result,
    isDescriptionExpanded,
    setIsDescriptionExpanded,
    isStandardsExpanded,
    setIsStandardsExpanded,
    submitting,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    unlockModalData,
    setUnlockModalData,
    calculatePowerScore,
    handleSubmit,
    handleUnlockClick,
    age,
    gender,
  } = usePowerLogic();

  return (
    <div className="power-container">
      <div className="input-section">
        <h1 className="text-2xl font-bold text-center mb-4">
          {t('tests.powerTitle')}
        </h1>
        <p>
          {t('common.ageLabel')}：{age || t('common.notEntered')}
        </p>
        <p>
          {t('common.genderLabel')}：{gender || t('common.notSelected')}
        </p>

        <PowerForms
          verticalJump={verticalJump}
          setVerticalJump={setVerticalJump}
          standingLongJump={standingLongJump}
          setStandingLongJump={setStandingLongJump}
          sprint={sprint}
          setSprint={setSprint}
          onCalculate={calculatePowerScore}
        />

        <PowerResult
          result={result}
          handleUnlockClick={handleUnlockClick}
        />

        <div className="description-section">
          <div className="description-card">
            <div
              className="description-header"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <h2 className="text-lg font-semibold">
                {t('tests.powerLabels.descriptionTitle')}
              </h2>
              <span
                className={`arrow ${isDescriptionExpanded ? 'expanded' : ''}`}
              >
                {isDescriptionExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isDescriptionExpanded && (
              <div className="description-content">
                <p className="exercise-title">
                  {t('tests.powerLabels.verticalJump')}
                </p>
                <p className="exercise-description">
                  {t('tests.powerInfo.howTo.verticalJump')}
                </p>
                <p className="exercise-title mt-2">
                  {t('tests.powerLabels.standingLongJump')}
                </p>
                <p className="exercise-description">
                  {t('tests.powerInfo.howTo.standingLongJump')}
                </p>
                <p className="exercise-title mt-2">
                  {t('tests.powerLabels.sprint')}
                </p>
                <p className="exercise-description">
                  {t('tests.powerInfo.howTo.sprint')}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {t('tests.powerInfo.howTo.tip')}
                </p>
              </div>
            )}
          </div>

          <div className="standards-card">
            <div
              className="standards-header"
              onClick={() => setIsStandardsExpanded(!isStandardsExpanded)}
            >
              <h2 className="text-lg font-semibold">
                {t('tests.powerLabels.standardsTitle')}
              </h2>
              <span
                className={`arrow ${isStandardsExpanded ? 'expanded' : ''}`}
              >
                {isStandardsExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isStandardsExpanded && (
              <div className="standards-content">
                <p className="font-semibold">
                  {t('tests.powerLabels.sourceLabel')}
                </p>
                <p>{t('tests.powerInfo.standards.source')}</p>
                <p className="font-semibold mt-2">
                  {t('tests.powerLabels.basisLabel')}
                </p>
                <ul className="list-disc pl-5">
                  <li>{t('tests.powerInfo.standards.basedOn.vjump')}</li>
                  <li>{t('tests.powerInfo.standards.basedOn.slj')}</li>
                  <li>{t('tests.powerInfo.standards.basedOn.sprint')}</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  {t('tests.powerInfo.standards.remark')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
        onClose={() => {
          setIsUnlockModalOpen(false);
          setUnlockModalData(null);
        }}
        data={unlockModalData}
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

Power.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Power;
