import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PowerForms({
  verticalJump,
  setVerticalJump,
  standingLongJump,
  setStandingLongJump,
  sprint,
  setSprint,
  onCalculate,
}) {
  const { t } = useTranslation();

  return (
    <div className="exercise-section">
      <h2 className="text-lg font-semibold">
        {t('tests.powerLabels.movementsTitle')}
      </h2>
      <label
        htmlFor="verticalJump"
        className="block text-sm font-medium text-gray-700"
      >
        {t('tests.powerLabels.verticalJump')}
      </label>
      <input
        id="verticalJump"
        name="verticalJump"
        type="number"
        placeholder={t('tests.powerLabels.verticalJump')}
        value={verticalJump}
        onChange={e => setVerticalJump(e.target.value)}
        className="input-field"
      />
      <label
        htmlFor="standingLongJump"
        className="block text-sm font-medium text-gray-700"
      >
        {t('tests.powerLabels.standingLongJump')}
      </label>
      <input
        id="standingLongJump"
        name="standingLongJump"
        type="number"
        placeholder={t('tests.powerLabels.standingLongJump')}
        value={standingLongJump}
        onChange={e => setStandingLongJump(e.target.value)}
        className="input-field"
      />
      <label
        htmlFor="sprint"
        className="block text-sm font-medium text-gray-700"
      >
        {t('tests.powerLabels.sprint')}
      </label>
      <input
        id="sprint"
        name="sprint"
        type="number"
        placeholder={t('tests.powerLabels.sprint')}
        value={sprint}
        onChange={e => setSprint(e.target.value)}
        className="input-field"
      />
      <button onClick={onCalculate} className="calculate-btn">
        {t('common.calculate')}
      </button>
    </div>
  );
}

