import React from 'react';
import PropTypes from 'prop-types';
import './FFMIPage.css';
import { useTranslation } from 'react-i18next';
import BottomNavBar from '../components/BottomNavBar';
import AdBanner from '../components/AdBanner';
import HonorUnlockModal from '../components/shared/modals/HonorUnlockModal';
import { useFFMILogic } from '../hooks/useFFMILogic';

function FFMI({ onComplete }) {
  const { t } = useTranslation();
  const {
    bodyFat,
    setBodyFat,
    ffmi,
    ffmiScore,
    ffmiRawScore,
    isCapped,
    ffmiCategory,
    isExpanded,
    setIsExpanded,
    isTableExpanded,
    setIsTableExpanded,
    submitting,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    unlockModalData,
    setUnlockModalData,
    calculateScores,
    handleSubmit,
    handleUnlockClick,
    ffmiTable,
    userData,
  } = useFFMILogic();

  return (
    <div className="ffmi-container">
      <h1 className="ffmi-title">{t('tests.ffmiTitle')}</h1>
      <div className="input-section">
        <label htmlFor="bodyFat" className="input-label">
          {t('tests.ffmiLabels.bodyFatPercent')}
        </label>
        <input
          id="bodyFat"
          name="bodyFat"
          type="number"
          value={bodyFat}
          onChange={e => setBodyFat(e.target.value)}
          placeholder={t('tests.ffmiLabels.bodyFatPercent')}
          className="input-field"
          required
        />
        <button onClick={calculateScores} className="calculate-btn">
          {t('common.calculate')}
        </button>
      </div>
      {ffmi && (
        <div className="result-section">
          <h2 className="result-title">{t('tests.ffmiLabels.resultTitle')}</h2>
          <p className="result-text">
            {t('tests.ffmiLabels.ffmi')}：{ffmi}
          </p>
          <p className="score-text">
            {t('tests.ffmiLabels.ffmiScore')}：{ffmiScore} {t('common.points')}
            {ffmiRawScore && ffmiRawScore > 100 && !isCapped && (
              <span className="verified-badge" title={t('tests.verifiedBadge')}>
                {' '}
                ✓
              </span>
            )}
          </p>
          {isCapped && (
            <>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#f59e0b',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ⚠️{' '}
                {t(
                  'tests.civilianLimiter.warning',
                  '未驗證用戶提交時分數將鎖定為 100'
                )}
              </p>
              <button
                onClick={handleUnlockClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  width: 'fit-content',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(234, 179, 8, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: 'white',
                  fontSize: '0.875rem',
                  marginTop: '8px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.8)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.5)';
                }}
                title="點擊解鎖真實實力"
              >
                <span style={{ fontSize: '0.875rem' }}>🔒</span>
                <span>{t('actions.unlock_limit')}</span>
              </button>
            </>
          )}
          <p className="category-text">
            {t('tests.ffmiLabels.ffmiCategory')}：{ffmiCategory}
          </p>
          <p className="result-text note-text"></p>
        </div>
      )}
      <div className="description-section">
        <div className="description-card">
          <div
            className="description-header"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h2 className="description-title">
              {t('tests.ffmiLabels.whatIs')}
            </h2>
            <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>
          {isExpanded && (
            <div className="description-content">
              <p>{t('tests.ffmiInfo.whatIs')}</p>
              <ol className="list-decimal pl-5 mt-2">
                <li>{t('tests.ffmiInfo.caveats.tall')}</li>
                <li>{t('tests.ffmiInfo.caveats.highFat')}</li>
                <li>{t('tests.ffmiInfo.caveats.heavy')}</li>
              </ol>
            </div>
          )}
        </div>
      </div>
      <div className="table-section">
        <div className="table-card">
          <div
            className="table-header"
            onClick={() => setIsTableExpanded(!isTableExpanded)}
          >
            <h2 className="table-title">
              {t('tests.ffmiLabels.tableTitle')} (
              {userData.gender === 'male' || userData.gender === '男性'
                ? t('tests.ffmiLabels.male')
                : t('tests.ffmiLabels.female')}
              )
            </h2>
            <span className={`arrow ${isTableExpanded ? 'expanded' : ''}`}>
              {isTableExpanded ? '▲' : '▼'}
            </span>
          </div>
          {isTableExpanded && (
            <div className="table-content">
              <table className="ffmi-table">
                <thead>
                  <tr>
                    <th>{t('tests.ffmiLabels.columns.range')}</th>
                    <th>{t('tests.ffmiLabels.columns.evaluation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ffmiTable.map((row, index) => (
                    <tr key={index}>
                      <td>{row.range}</td>
                      <td>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="ffmi-submit-btn"
        disabled={submitting}
      >
        {submitting ? t('common.submitting') : t('common.submitAndReturn')}
      </button>

      {ffmiScore !== null && (
        <div
          className="ad-section"
          style={{ margin: '20px 0', textAlign: 'center' }}
        >
          <AdBanner position="inline" isFixed={false} showAd={true} />
        </div>
      )}

      <div style={{ height: '160px', width: '100%' }} />

      <BottomNavBar />

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

FFMI.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default FFMI;
