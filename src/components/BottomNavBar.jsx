import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import GuestModal from './GuestModal';
import { useTranslation } from 'react-i18next';

const navItems = [
  {
    key: 'community',
    label: '社群',
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    path: '/community',
    guestBlock: true,
  },

  {
    key: 'home',
    label: '首頁',
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
    path: '/user-info',
    guestBlock: false,
  },
  {
    key: 'assessment',
    label: '開始評測',
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 9v6" />
        <path d="M9 12h6" />
      </svg>
    ),
    path: '/user-info',
    guestBlock: false,
  },
  {
    key: 'ladder',
    label: '天梯',
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 3v18M17 3v18M3 9h18M3 15h18" />
      </svg>
    ),
    path: '/ladder',
    guestBlock: true,
  },
  {
    key: 'history',
    label: '歷史',
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    path: '/history',
    guestBlock: true, // 改為 true，訪客模式下顯示註冊邀請modal
  },
  {
    key: 'tools',
    label: '工具',
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 15h6M12 9v6" />
      </svg>
    ),
    path: '/training-tools',
    guestBlock: false,
  },
];

function isGuestMode() {
  // 檢查是否為訪客模式，但也要檢查是否有登入用戶
  const guestMode = sessionStorage.getItem('guestMode') === 'true';
  const hasAuthUser = auth.currentUser;

  // 如果有登入用戶，就不是訪客模式
  if (hasAuthUser) {
    return false;
  }

  return guestMode;
}

function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [screenSize, setScreenSize] = useState('medium');

  // 檢測螢幕大小並分類
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 360) {
        setScreenSize('small'); // 小螢幕
      } else if (width < 400) {
        setScreenSize('medium'); // 中等螢幕
      } else {
        setScreenSize('large'); // 大螢幕
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 檢測是否為英文
  const isEnglish = () => {
    const currentLang = t('common.language');
    return (
      currentLang === 'en' ||
      window.navigator.language.startsWith('en') ||
      document.documentElement.lang === 'en'
    );
  };

  // 根據螢幕大小和語言調整樣式
  const getTextStyles = () => {
    const isEng = isEnglish();

    if (screenSize === 'small') {
      return {
        fontSize: isEng ? '7px' : '9px', // 英文稍小，容納較長文字
        padding: '2px 1px',
        lineHeight: isEng ? '1.15' : '1.1', // 英文稍緊湊
        fontWeight: isEng ? '500' : 'normal',
      };
    } else if (screenSize === 'medium') {
      return {
        fontSize: isEng ? '8px' : '10px', // 英文稍小
        padding: '3px 2px',
        lineHeight: isEng ? '1.15' : '1.2',
        fontWeight: isEng ? '500' : 'normal',
      };
    } else {
      return {
        fontSize: isEng ? '9px' : '11px', // 英文稍小
        padding: '4px 2px',
        lineHeight: isEng ? '1.15' : '1.2',
        fontWeight: isEng ? '500' : 'normal',
      };
    }
  };

  const handleNav = item => {
    if (item.guestBlock && isGuestMode()) {
      // setPendingPath(item.path);
      setModalOpen(true);
    } else {
      if (item.key === 'home') {
        // 智能首頁：已登入用戶導向 /user-info，未登入用戶導向 /landing
        const hasAuthUser = auth.currentUser;
        if (hasAuthUser) {
          navigate('/user-info', { state: { scrollTo: 'radar' } });
        } else {
          navigate('/landing');
        }
      } else if (item.key === 'assessment') {
        navigate(item.path, { state: { scrollTo: 'tests' } });
      } else {
        navigate(item.path);
      }
    }
  };

  const handleRegister = () => {
    setModalOpen(false);
    navigate('/login');
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          // 🔧 階段 4：添加底部安全區域 padding，解決 Android 15 導覽列重疊問題
          // env(safe-area-inset-bottom, 0px) 的行為：
          // - Android 15: 提供實際安全區域值（例如 48px），為系統導覽列預留空間
          // - Android 14 及以下: 回退為 0px，不影響現有布局（向後兼容）
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: '#fff',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1200,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
          // 確保不受硬體加速影響
          transform: 'none',
          willChange: 'auto',
        }}
      >
        {navItems.map(item => (
          <div
            key={item.key}
            style={{ position: 'relative', flex: 1, textAlign: 'center' }}
          >
            <button
              type="button"
              onClick={() => handleNav(item)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: location.pathname === item.path ? '#667eea' : '#888',
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                fontSize: getTextStyles().fontSize,
                width: '100%',
                height: '64px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.2s',
                padding: getTextStyles().padding,
                boxSizing: 'border-box',
              }}
              aria-label={item.label}
            >
              {item.icon}
              <span
                style={{
                  marginTop: '4px',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: isEnglish() ? 'normal' : 'nowrap', // 英文允許換行
                  fontSize: getTextStyles().fontSize,
                  lineHeight: getTextStyles().lineHeight,
                  fontWeight: getTextStyles().fontWeight,
                  letterSpacing: '0.02em', // 增加字母間距，提升可讀性
                  wordBreak: isEnglish() ? 'break-word' : 'normal', // 英文允許斷字
                  display: 'block',
                  maxHeight: isEnglish() ? '24px' : 'auto', // 限制英文最多兩行
                }}
              >
                {t(
                  `navbar.${
                    item.key === 'assessment' ? 'assessment' : item.key
                  }`
                )}
              </span>
            </button>
          </div>
        ))}
      </nav>
      <GuestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRegister={handleRegister}
      />
    </>
  );
}

export default React.memo(BottomNavBar);
