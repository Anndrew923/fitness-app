import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CooperForm({ distance, setDistance, onCalculate }) {
  const { t } = useTranslation();

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">
        {t('tests.cardioInfo.cooperTitle')}
      </h2>
      <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
        {t('tests.cardioLabels.distanceMeters')}
      </label>
      <input
        id="distance"
        type="number"
        value={distance}
        onChange={e => setDistance(e.target.value)}
        className="input-field"
        placeholder="2400"
        required
      />
      <button onClick={onCalculate} className="calculate-btn">
        {t('common.calculate')}
      </button>
    </>
  );
}

