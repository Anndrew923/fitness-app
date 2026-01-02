import { useTranslation } from 'react-i18next';
import { SCORE_LEVELS } from '../standards';
import PropTypes from 'prop-types';

function StrengthStandardsTab() {
  const { t } = useTranslation();

  const scoreLevelsWithTranslations = SCORE_LEVELS.map((level, index) => {
    const colors = ['#FF6B6B', '#FFA726', '#FFEE58', '#66BB6A', '#42A5F5'];
    return {
      ...level,
      label: t(`tests.${level.label}`),
      color: colors[index],
    };
  });

  return (
    <div className="standards-tab">
      <div className="standards-content">
        <p>{t('tests.standards_desc')}</p>
      </div>

      <div className="score-levels-table">
        <h3>{t('tests.strengthStandards.scoreLevelsTitle')}</h3>
        <div className="levels-container">
          {scoreLevelsWithTranslations.map((item, index) => (
            <div key={index} className="level-item">
              <div className="level-header">
                <span className="level-name">{item.label}</span>
                <span className="level-score">{item.score}</span>
              </div>
              <div className="level-bar-container">
                <div
                  className="level-bar"
                  style={{
                    width: `${item.score}%`,
                    background: `linear-gradient(to right, ${item.color}dd, ${item.color})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StrengthStandardsTab;

