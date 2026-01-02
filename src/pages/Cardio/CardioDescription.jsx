import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CardioDescription({ 
  activeTab, 
  isExpanded, 
  setIsExpanded 
}) {
  const { t } = useTranslation();

  return (
    <div className="description-section">
      <div className="description-card">
        <div
          className="description-header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-lg font-semibold">
            {activeTab === 'cooper' 
              ? t('tests.cardioInfo.sectionTitle') 
              : t('tests.cardioInfo.run5kmTitle')
            }
          </h2>
          <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
        {isExpanded && (
          <div className="description-content">
            {activeTab === 'cooper' ? (
              <>
                <p className="font-semibold">{t('tests.cardioInfo.introTitle')}</p>
                <p>{t('tests.cardioInfo.introText')}</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-yellow-600">{t('assessment.elite_challenge', 'ELITE CHALLENGE')}</p>
                <p>{t('tests.cardioInfo.run5kmIntro')}</p>
                <p className="mt-2 font-bold">{t('tests.cardioInfo.run5kmBenchmark')}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

