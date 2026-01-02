import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PowerResult({
  result,
  handleUnlockClick,
}) {
  const { t } = useTranslation();

  if (!result.finalScore) return null;

  return (
    <>
      {result.verticalJumpScore && (
        <p className="score-display">
          {t('tests.powerLabels.scoreLabels.verticalJump')}:{' '}
          {result.verticalJumpScore}
        </p>
      )}
      {result.standingLongJumpScore && (
        <p className="score-display">
          {t('tests.powerLabels.scoreLabels.standingLongJump')}:{' '}
          {result.standingLongJumpScore}
        </p>
      )}
      {result.sprintScore && (
        <p className="score-display">
          {t('tests.powerLabels.scoreLabels.sprint')}:{' '}
          {result.sprintScore}
        </p>
      )}
      <p className="score-display">
        {t('tests.powerLabels.scoreLabels.final')}: {result.finalScore}
        {result.finalRawScore && result.finalRawScore > 100 && !result.isCapped && (
          <span className="verified-badge" title={t('tests.verifiedBadge')}>
            {' '}✓
          </span>
        )}
      </p>
      {result.isCapped && (
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
    </>
  );
}

