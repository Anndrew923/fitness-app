import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CardioResult({
  activeTab,
  score,
  formattedScore,
  rawScore,
  isCapped,
  isLimitBroken,
  gender,
  getComment,
  handleUnlockClick,
  t,
}) {
  return (
    <>
      <p className="score-display" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span>
          {activeTab === 'cooper' 
            ? `${t('tests.cardioLabels.score')}: ${formattedScore}`
            : `${t('tests.cardioLabels.run5kmScore')}: ${formattedScore}`
          }
        </span>
        {isCapped && (
          <span style={{ fontSize: '0.875rem' }}>🔒</span>
        )}
        {!isCapped && isLimitBroken && (
          <span style={{ marginLeft: '8px', color: '#ef4444', fontWeight: '800', fontStyle: 'italic' }}>
            🚀 {t('assessment.limit_break', 'LIMIT BREAK!')}
          </span>
        )}
        {isCapped && (
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
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.8)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.5)';
            }}
            title={t('actions.unlock_limit_tooltip', '點擊解鎖真實實力')}
          >
            <span style={{ fontSize: '0.875rem' }}>🔒</span>
            <span>{t('actions.unlock_limit')}</span>
          </button>
        )}
      </p>
      {isCapped && (
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
      )}
      <p className="score-display">
        {activeTab === 'cooper' 
          ? getComment(rawScore || score, gender) 
          : ((rawScore || score) >= 100 
            ? t('assessment.ungodly_pace', '🔥🔥🔥 UNGODLY PACE') 
            : t('assessment.keep_pushing', 'Keep pushing for sub-20!'))
        }
      </p>
    </>
  );
}

