import React from 'react';
import PropTypes from 'prop-types';
import './CardioPage.css';
import { useTranslation } from 'react-i18next';
import BottomNavBar from '../components/BottomNavBar';
import AdBanner from '../components/AdBanner';
import HonorUnlockModal from '../components/shared/modals/HonorUnlockModal';
import { useCardioLogic } from '../hooks/useCardioLogic';
import CardioTabs from './Cardio/CardioTabs';
import CooperForm from './Cardio/CooperForm';
import Run5KmForm from './Cardio/Run5KmForm';
import CardioResult from './Cardio/CardioResult';
import CardioSuccessModal from './Cardio/CardioSuccessModal';
import CardioDescription from './Cardio/CardioDescription';

function Cardio({ onComplete }) {
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    distance,
    setDistance,
    runMinutes,
    setRunMinutes,
    runSeconds,
    setRunSeconds,
    score,
    rawScore,
    isCapped,
    isExpanded,
    setIsExpanded,
    submitting,
    showSuccessModal,
    setShowSuccessModal,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    unlockModalData,
    setUnlockModalData,
    formattedScore,
    isLimitBroken,
    handleCalculate,
    handleSubmit,
    handleUnlockClick,
    getComment,
    navigate,
    age,
    gender,
  } = useCardioLogic();

  return (
    <div className="cardio-container">
      <h1 className="text-2xl font-bold text-center mb-4">{t('tests.cardioTitle')}</h1>
      
      <CardioTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="input-section">
        <p>
          {t('common.ageLabel')}：{age || t('common.notEntered')}
        </p>
        <p>
          {t('common.genderLabel')}：{gender || t('common.notSelected')}
        </p>

        <div className="exercise-section">
          {activeTab === 'cooper' ? (
            <CooperForm 
              distance={distance}
              setDistance={setDistance}
              onCalculate={handleCalculate}
            />
          ) : (
            <Run5KmForm
              runMinutes={runMinutes}
              setRunMinutes={setRunMinutes}
              runSeconds={runSeconds}
              setRunSeconds={setRunSeconds}
              onCalculate={handleCalculate}
            />
          )}

          {score !== null && (
            <CardioResult
              activeTab={activeTab}
              score={score}
              formattedScore={formattedScore}
              rawScore={rawScore}
              isCapped={isCapped}
              isLimitBroken={isLimitBroken}
              gender={gender}
              getComment={getComment}
              handleUnlockClick={handleUnlockClick}
              t={t}
            />
          )}
        </div>
      </div>

      <CardioDescription 
        activeTab={activeTab}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

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

      {score !== null && (
        <div className="ad-section" style={{ margin: '20px 0', textAlign: 'center' }}>
          <AdBanner position="inline" isFixed={false} showAd={true} />
        </div>
      )}

      <div style={{ height: '160px', width: '100%' }} />
      <BottomNavBar />

      <CardioSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        activeTab={activeTab}
        navigate={navigate}
      />

      <HonorUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setUnlockModalData(null);
        }}
        data={unlockModalData}
      />
    </div>
  );
}

Cardio.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Cardio;
