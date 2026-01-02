import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Run5KmForm({ 
  runMinutes, 
  setRunMinutes, 
  runSeconds, 
  setRunSeconds, 
  onCalculate 
}) {
  const { t } = useTranslation();

  return (
    <>
      <h2 className="text-lg font-semibold mb-2 text-yellow-600">
        {t('tests.cardioTabs.run5km')} ⚡
      </h2>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            {t('tests.cardioLabels.timeMin')}
          </label>
          <input
            type="number"
            value={runMinutes}
            onChange={e => setRunMinutes(e.target.value)}
            className="input-field"
            placeholder="20"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            {t('tests.cardioLabels.timeSec')}
          </label>
          <input
            type="number"
            value={runSeconds}
            onChange={e => setRunSeconds(e.target.value)}
            className="input-field"
            placeholder="00"
          />
        </div>
      </div>
      <button onClick={onCalculate} className="calculate-btn">
        {t('common.calculate')}
      </button>
    </>
  );
}

