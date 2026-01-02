import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MuscleResult({ 
  result, 
  setIsUnlockModalOpen 
}) {
  const { t } = useTranslation();

  return (
    <div className="result-section">
      <h2 className="result-title">
        {t('tests.muscleLabels.sectionTitle')}
      </h2>

      <div className="concise-explanation">
        <h3>{t('tests.muscleLabels.muscleExplanation.title')}</h3>

        <div className="dual-metrics">
          <div className="metric">
            <h4>
              📏 {t('tests.muscleLabels.muscleExplanation.weightTitle')}
            </h4>
            <p>{t('tests.muscleLabels.muscleExplanation.weightDesc')}</p>
          </div>
          <div className="metric">
            <h4>
              📊 {t('tests.muscleLabels.muscleExplanation.percentTitle')}
            </h4>
            <p>{t('tests.muscleLabels.muscleExplanation.percentDesc')}</p>
          </div>
        </div>

        <div className="why-both">
          <h4>{t('tests.muscleLabels.muscleExplanation.whyBoth')}</h4>
          <div className="examples">
            <p>
              <strong>
                {t('tests.muscleLabels.muscleExplanation.example1')}
              </strong>
            </p>
            <p>
              <strong>
                {t('tests.muscleLabels.muscleExplanation.example2')}
              </strong>
            </p>
          </div>
          <div className="solution">
            <p>
              <strong>
                {t('tests.muscleLabels.muscleExplanation.solution')}
              </strong>
            </p>
          </div>
        </div>
      </div>

      <div className="scoring-reference">
        <h3>{t('tests.muscleLabels.scoringReference.title')}</h3>

        <div className="reference-levels">
          <div className="level average">
            <div className="level-icon">👤</div>
            <div className="level-content">
              <h4>
                {t('tests.muscleLabels.scoringReference.average.title')}
              </h4>
              <p className="score-range">
                {t('tests.muscleLabels.scoringReference.average.range')}
              </p>
              <p className="description">
                {t('tests.muscleLabels.scoringReference.average.desc')}
              </p>
            </div>
          </div>

          <div className="level above-average">
            <div className="level-icon">💪</div>
            <div className="level-content">
              <h4>
                {t('tests.muscleLabels.scoringReference.aboveAverage.title')}
              </h4>
              <p className="score-range">
                {t('tests.muscleLabels.scoringReference.aboveAverage.range')}
              </p>
              <p className="description">
                {t('tests.muscleLabels.scoringReference.aboveAverage.desc')}
              </p>
            </div>
          </div>

          <div className="level intermediate">
            <div className="level-icon">🏃</div>
            <div className="level-content">
              <h4>
                {t('tests.muscleLabels.scoringReference.intermediate.title')}
              </h4>
              <p className="score-range">
                {t('tests.muscleLabels.scoringReference.intermediate.range')}
              </p>
              <p className="description">
                {t('tests.muscleLabels.scoringReference.intermediate.desc')}
              </p>
            </div>
          </div>

          <div className="level excellent">
            <div className="level-icon">⭐</div>
            <div className="level-content">
              <h4>
                {t('tests.muscleLabels.scoringReference.excellent.title')}
              </h4>
              <p className="score-range">
                {t('tests.muscleLabels.scoringReference.excellent.range')}
              </p>
              <p className="description">
                {t('tests.muscleLabels.scoringReference.excellent.desc')}
              </p>
            </div>
          </div>

          <div className="level elite">
            <div className="level-icon">🏆</div>
            <div className="level-content">
              <h4>
                {t('tests.muscleLabels.scoringReference.elite.title')}
              </h4>
              <p className="score-range">
                {t('tests.muscleLabels.scoringReference.elite.range')}
              </p>
              <p className="description">
                {t('tests.muscleLabels.scoringReference.elite.desc')}
              </p>
            </div>
          </div>
        </div>

        <div className="your-score">
          <p>
            <strong>
              {t('tests.muscleLabels.scoringReference.yourScore')}:{' '}
              {result.finalScore}分
              {result.finalRawScore && result.finalRawScore > 100 && !result.isFinalScoreCapped && (
                <span className="verified-badge" title={t('tests.verifiedBadge')}>
                  {' '}✓
                </span>
              )}
            </strong>
          </p>
          {result.isFinalScoreCapped && (
            <>
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#f59e0b', 
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⚠️ {t('tests.civilianLimiter.warning', '未驗證用戶提交時分數將鎖定為 100')}
              </p>
              <button
                type="button"
                className="honor-lock-btn"
                onClick={() => setIsUnlockModalOpen(true)}
                title="點擊解鎖真實實力"
              >
                <span>🔒</span>
                <span className="flex-shrink-0 whitespace-normal">{t('actions.unlock_limit')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <p className="result-text">
        {t('tests.muscleLabels.smmShort')}: {result.smmScore}
        {result.smmRawScore && result.smmRawScore > 100 && !result.isSmmCapped && (
          <span className="verified-badge" title={t('tests.verifiedBadge')}>
            {' '}✓
          </span>
        )}
        {result.isSmmCapped && (
          <>
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', marginLeft: '8px' }}>
              ⚠️ {t('tests.civilianLimiter.warning', '未驗證用戶提交時分數將鎖定為 100')}
            </span>
            <button
              type="button"
              className="honor-lock-btn"
              onClick={() => setIsUnlockModalOpen(true)}
              title="點擊解鎖真實實力"
            >
              <span>🔒</span>
              <span className="flex-shrink-0 whitespace-normal">{t('actions.unlock_limit')}</span>
            </button>
          </>
        )}
      </p>
      <p className="result-text">
        {t('tests.muscleLabels.smPercentShort')}: {result.smPercent}%
      </p>
      <p className="result-text">
        {t('tests.muscleLabels.smPercentScore')}: {result.smPercentScore}
        {result.smPercentRawScore && result.smPercentRawScore > 100 && !result.isSmPercentCapped && (
          <span className="verified-badge" title={t('tests.verifiedBadge')}>
            {' '}✓
          </span>
        )}
        {result.isSmPercentCapped && (
          <>
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', marginLeft: '8px' }}>
              ⚠️ {t('tests.civilianLimiter.warning', '未驗證用戶提交時分數將鎖定為 100')}
            </span>
            <button
              type="button"
              className="honor-lock-btn"
              onClick={() => setIsUnlockModalOpen(true)}
              title="點擊解鎖真實實力"
            >
              <span>🔒</span>
              <span className="flex-shrink-0 whitespace-normal">{t('actions.unlock_limit')}</span>
            </button>
          </>
        )}
      </p>
      <p className="score-text final-score">
        {t('tests.muscleLabels.finalScore')}: {result.finalScore}
        {result.finalRawScore && result.finalRawScore > 100 && !result.isFinalScoreCapped && (
          <span className="verified-badge" title={t('tests.verifiedBadge')}>
            {' '}✓
          </span>
        )}
        {result.isFinalScoreCapped && (
          <>
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', marginLeft: '8px' }}>
              ⚠️ {t('tests.civilianLimiter.warning', '未驗證用戶提交時分數將鎖定為 100')}
            </span>
            <button
              type="button"
              className="honor-lock-btn"
              onClick={() => setIsUnlockModalOpen(true)}
              title="點擊解鎖真實實力"
            >
              <span>🔒</span>
              <span className="flex-shrink-0 whitespace-normal">{t('actions.unlock_limit')}</span>
            </button>
          </>
        )}
      </p>
    </div>
  );
}

