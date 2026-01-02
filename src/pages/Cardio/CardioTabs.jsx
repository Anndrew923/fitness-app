import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CardioTabs({ activeTab, setActiveTab }) {
  const { t } = useTranslation();

  return (
    <div className="cardio-tabs">
      <button 
        className={`tab-btn ${activeTab === 'cooper' ? 'active' : ''}`} 
        onClick={() => setActiveTab('cooper')}
      >
        {t('tests.cardioTabs.cooper')}
      </button>
      <button 
        className={`tab-btn ${activeTab === '5km' ? 'active' : ''}`} 
        onClick={() => setActiveTab('5km')}
      >
        {t('tests.cardioTabs.run5km')}
      </button>
    </div>
  );
}

