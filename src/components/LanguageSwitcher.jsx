import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const currentLanguage = i18n.language;

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${currentLanguage === 'zh-TW' ? 'active' : ''}`}
        onClick={() => changeLanguage('zh-TW')}
      >
        中文
      </button>
      <button
        className={`lang-btn ${currentLanguage === 'en-US' ? 'active' : ''}`}
        onClick={() => changeLanguage('en-US')}
      >
        English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
