import React, { useState } from 'react';
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

    guestBlock: false,
  },
  {
    key: 'settings',
    label: '設定',
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
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 8c0 .24.03.47.09.69A1.65 1.65 0 0 0 16.6 9a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z" />
      </svg>
    ),
    path: '/settings',
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
  // const [pendingPath, setPendingPath] = useState('');

  const handleNav = item => {
    if (item.guestBlock && isGuestMode()) {
      // setPendingPath(item.path);
      setModalOpen(true);
    } else {
      if (item.key === 'home') {
        navigate(item.path, { state: { scrollTo: 'radar' } });
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
          background: '#fff',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1200,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
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
                fontSize: '12px',
                width: '100%',
                height: '64px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.2s',
              }}
              aria-label={item.label}
            >
              {item.icon}
              <span style={{ marginTop: '4px' }}>
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
