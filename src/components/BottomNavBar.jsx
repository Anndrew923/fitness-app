import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import GeneralModal from './UserInfo/Modals/GeneralModal';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';

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
    path: '/skill-tree', // ✅ Phase 1.6 修正：指向技能樹頁面
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
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onAction: null,
    actionText: null,
  });
  const [screenSize, setScreenSize] = useState('medium');
  // ✅ 新增：鍵盤可見狀態
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  // ✅ 新增：監聽鍵盤狀態變化（僅在原生平台）
  useEffect(() => {
    // 只在原生平台監聽
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleKeyboardToggle = event => {
      setIsKeyboardVisible(event.detail.isVisible);
    };

    // 監聽鍵盤狀態變化事件
    window.addEventListener('keyboardToggle', handleKeyboardToggle);

    // 初始檢查 CSS 變數
    const checkInitialState = () => {
      const isVisible =
        getComputedStyle(document.documentElement).getPropertyValue(
          '--is-keyboard-visible'
        ) === '1';
      setIsKeyboardVisible(isVisible);
    };

    // 延遲檢查，確保 CSS 變數已設置
    const timer = setTimeout(checkInitialState, 200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keyboardToggle', handleKeyboardToggle);
    };
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
      // 显示注册提醒 modal
      setModalState({
        isOpen: true,
        title: t('guestMode.modal.title'),
        message: t('guestMode.modal.message'),
        type: 'warning',
        onAction: () => {
          navigate('/login');
        },
        actionText: t('guestMode.modal.registerButton'),
      });
    } else {
      if (item.key === 'home') {
        // 智能首頁：已登入用戶或訪客模式導向 /user-info，未登入用戶導向 /landing
        const hasAuthUser = auth.currentUser;
        const isGuest = isGuestMode();
        if (hasAuthUser || isGuest) {
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

  return (
    <>
      <nav
        style={{
          // 全域透視：修復導覽列「固定定位」失效 - 強制固定
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100vw', // 全域透視：使用 100vw 確保填滿整個視窗寬度
          // 🔧 修正：使用 minHeight + calc 計算總高度（參考 Material Design 標準做法）
          // 總高度 = 內容高度(64px) + 安全區域
          // Android 15: calc(64px + 48px) = 112px（正確高度）
          // Android 14: calc(64px + 0px) = 64px（保持原樣，向後兼容）
          minHeight: '64px',
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          // 全域透視：安全區域 - 加入 padding-bottom 以適應手機螢幕底部
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          // 魔導主題：廢除「白色禁區」- 深色半透明材質，讓星空背景透出
          background: 'rgba(5, 5, 5, 0.85)',
          // 魔導主題：實裝奧術毛玻璃 - 厚實水晶折射感
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          // 魔導主題：邊框同步 - 使用奧術藍邊框替代灰色
          borderTop: '1px solid rgba(0, 191, 255, 0.4)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          // 全域透視：絕對最高權限 - 將導覽列的 z-index 設定為絕對最高
          zIndex: 9999, // 全域透視：絕對最高權限
          // 魔導主題：光暈效果統一 - 使用奧術藍陰影
          boxShadow: '0 -2px 8px rgba(0, 191, 255, 0.2)',
          // ✅ 新增：鍵盤開啟時隱藏導覽列（原生應用優化）
          transform: isKeyboardVisible ? 'translateY(100%)' : 'translateY(0)',
          // ✅ 改進：更快的動畫（150ms 而不是 250ms），避免短暫顯示
          transition:
            'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isKeyboardVisible ? 0 : 1,
          visibility: isKeyboardVisible ? 'hidden' : 'visible',
          pointerEvents: isKeyboardVisible ? 'none' : 'auto',
          // 優化性能
          willChange: isKeyboardVisible ? 'transform, opacity' : 'auto',
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
                // 魔導主題：當前頁面使用奧術藍，非當前頁面使用半透明白色
                color:
                  location.pathname === item.path
                    ? 'rgba(0, 191, 255, 1)' // 奧術藍 - 當前頁面
                    : 'rgba(255, 255, 255, 0.7)', // 半透明白色 - 非當前頁面
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
      <GeneralModal
        isOpen={modalState.isOpen}
        onClose={() => {
          setModalState(prev => ({ ...prev, isOpen: false }));
        }}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onAction={modalState.onAction}
        actionText={modalState.actionText}
      />
    </>
  );
}

export default React.memo(BottomNavBar);
