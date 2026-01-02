import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function StrengthScoreBreakdown({
  exercises,
  averageScore,
  userData,
  onUnlock,
  getStrengthFeedback,
  getLevelFromScore,
  setIsUnlockModalOpen,
  setUnlockModalData,
}) {
  const { t } = useTranslation();

  return (
    <div className="score-breakdown-card">
      <h3>📊 {t('tests.score')}</h3>
      <div className="score-breakdown">
        {exercises.map(exercise => (
          <div key={exercise.key} className="score-item">
            <span className="score-label">{exercise.name}</span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '4px',
              }}
            >
              <span className="score-value">
                {exercise.state.score || t('community.ui.noScore')}
                {exercise.state.rawScore &&
                  exercise.state.rawScore > 100 &&
                  !exercise.state.isCapped && (
                    <span
                      className="verified-badge"
                      title="已認證顯示真實分數"
                    >
                      {' '}
                      ✓
                    </span>
                  )}
              </span>
              {exercise.state.isCapped && (
                <>
                  <p
                    style={{
                      fontSize: '0.7rem',
                      color: '#f59e0b',
                      margin: 0,
                      textAlign: 'right',
                    }}
                  >
                    ⚠️{' '}
                    {t(
                      'tests.civilianLimiter.warning',
                      '未驗證用戶提交時分數將鎖定為 100'
                    )}
                  </p>
                  <button
                    onClick={() => onUnlock(exercise)}
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
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                      e.currentTarget.style.borderColor =
                        'rgba(234, 179, 8, 0.8)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                      e.currentTarget.style.borderColor =
                        'rgba(234, 179, 8, 0.5)';
                    }}
                    title="點擊解鎖真實實力"
                  >
                    <span style={{ fontSize: '0.875rem' }}>🔒</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#facc15',
                        fontWeight: 500,
                      }}
                      className="flex-shrink-0 whitespace-normal"
                    >
                      {t('actions.unlock_limit')}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="average-score-display">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <p className="average-score" style={{ margin: 0 }}>
            {t('tests.averageScore')}: {averageScore}
          </p>
          {(() => {
            const hasCappedScore = exercises.some(ex => ex.state.isCapped);
            const avgScoreNum = parseFloat(averageScore);
            const isVerified = userData.isVerified === true;
            const shouldShowUnlock =
              (avgScoreNum > 100 && !isVerified) || hasCappedScore;

            return shouldShowUnlock ? (
              <>
                {!isVerified && (
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#f59e0b',
                      marginTop: '4px',
                      marginBottom: '4px',
                      textAlign: 'center',
                    }}
                  >
                    ⚠️{' '}
                    {t(
                      'tests.civilianLimiter.warning',
                      '未驗證用戶提交時分數將鎖定為 100'
                    )}
                  </p>
                )}
                <button
                  onClick={() => {
                    const cappedExercise = exercises.find(
                      ex => ex.state.isCapped
                    );
                    if (cappedExercise) {
                      onUnlock(cappedExercise);
                    } else {
                      const level = getLevelFromScore(avgScoreNum);
                      setUnlockModalData({
                        exercise: t('tests.averageScore'),
                        score: avgScoreNum,
                        level: level,
                        weight: null,
                      });
                      setIsUnlockModalOpen(true);
                    }
                  }}
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
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                    e.currentTarget.style.borderColor =
                      'rgba(234, 179, 8, 0.8)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                    e.currentTarget.style.borderColor =
                      'rgba(234, 179, 8, 0.5)';
                  }}
                  title="點擊解鎖真實實力"
                >
                  <span style={{ fontSize: '0.875rem' }}>🔒</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#facc15',
                      fontWeight: 500,
                    }}
                    className="flex-shrink-0 whitespace-normal"
                  >
                    {t('actions.unlock_limit')}
                  </span>
                </button>
              </>
            ) : null;
          })()}
        </div>
        <p className="average-comment">{getStrengthFeedback(averageScore)}</p>
      </div>
    </div>
  );
}

StrengthScoreBreakdown.propTypes = {
  exercises: PropTypes.array.isRequired,
  averageScore: PropTypes.string,
  userData: PropTypes.object.isRequired,
  onUnlock: PropTypes.func.isRequired,
  getStrengthFeedback: PropTypes.func.isRequired,
  getLevelFromScore: PropTypes.func.isRequired,
  setIsUnlockModalOpen: PropTypes.func.isRequired,
  setUnlockModalData: PropTypes.func.isRequired,
};

export default StrengthScoreBreakdown;

