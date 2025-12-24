import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTW from './locales/zh-TW';
import enUS from './locales/en-US';

// 取得初始語言：localStorage > 瀏覽器 > 預設 zh-TW
function getInitialLanguage() {
  try {
    const saved = localStorage.getItem('language');
    if (saved) return saved;
  } catch (error) {
    console.warn('無法讀取語言設定:', error);
  }
  const nav = (
    navigator.language ||
    navigator.userLanguage ||
    ''
  ).toLowerCase();
  if (nav.startsWith('zh')) return 'zh-TW';
  return 'en-US';
}

// 初始化 i18n（不強制覆蓋使用者選擇）
i18n.use(initReactI18next).init({
  resources: {
    'zh-TW': zhTW,
    'en-US': enUS,
  },
  lng: getInitialLanguage(),
  fallbackLng: 'zh-TW',
  supportedLngs: ['zh-TW', 'en-US'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
