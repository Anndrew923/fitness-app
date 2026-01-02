import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function StrengthExerciseCard({ exercise, isExpanded, onToggle, onCalculate, onUnlock }) {
  const { t } = useTranslation();
  const { key, name, state, setState } = exercise;
  const hasScore = state.score !== null;

  return (
    <div className={`exercise-card ${hasScore ? 'completed' : ''}`}>
      <div className="exercise-header" onClick={onToggle}>
        <div className="exercise-header-left">
          <span className="exercise-icon"></span>
          <h3 className="exercise-name">{name}</h3>
        </div>
        <div className="exercise-header-right">
          {hasScore && <span className="score-badge">{state.score}</span>}
          <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="exercise-content">
          <div className="exercise-inputs">
            <div className="input-group">
              <label htmlFor={`${key}Weight`}>
                {t('tests.strengthLabels.weightKg')}
              </label>
              <input
                id={`${key}Weight`}
                type="number"
                placeholder={t('tests.strengthLabels.weightKg')}
                value={state.weight}
                onChange={e =>
                  setState(prev => ({ ...prev, weight: e.target.value }))
                }
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label htmlFor={`${key}Reps`}>
                {t('tests.strengthLabels.reps')}
              </label>
              <input
                id={`${key}Reps`}
                type="number"
                placeholder={t('tests.strengthLabels.reps')}
                value={state.reps}
                onChange={e =>
                  setState(prev => ({ ...prev, reps: e.target.value }))
                }
                className="input-field"
              />
            </div>

            <button
              onClick={() => onCalculate(state.weight, state.reps, setState, key)}
              className="calculate-btn"
              disabled={!state.weight || !state.reps}
            >
              {t('common.calculate')}
            </button>
          </div>

          {state.max && (
            <div className="exercise-result">
              <p className="max-strength">
                {t('tests.strengthLabels.maxStrength')}: {state.max} kg
              </p>
              {state.score && (
                <div className="score-display">
                  <p style={{ margin: 0 }}>
                    {t('tests.score')}: {state.score}
                    {state.rawScore &&
                      state.rawScore > 100 &&
                      !state.isCapped && (
                        <span
                          className="verified-badge"
                          title="已認證顯示真實分數"
                        >
                          {' '}
                          ✓
                        </span>
                      )}
                  </p>
                  {state.isCapped && (
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
                          marginTop: '8px',
                          marginLeft: 'auto',
                          marginRight: 'auto',
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
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

StrengthExerciseCard.propTypes = {
  exercise: PropTypes.object.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onCalculate: PropTypes.func.isRequired,
  onUnlock: PropTypes.func.isRequired,
};

export default StrengthExerciseCard;

