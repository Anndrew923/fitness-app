import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import GuestModal from './GuestModal';

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
    tooltip: '健身社群',
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
    tooltip: '個人主頁',
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
    tooltip: '開始評測',
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
    tooltip: '天梯排行榜',
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
    tooltip: '歷史紀錄',
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
  const [hovered, setHovered] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState('');

  const handleNav = item => {
    if (item.guestBlock && isGuestMode()) {
      setPendingPath(item.path);
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
          zIndex: 1000,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {navItems.map(item => (
          <div
            key={item.key}
            style={{ position: 'relative', flex: 1, textAlign: 'center' }}
          >
            <button
              onClick={() => handleNav(item)}
              onMouseDown={e => e.preventDefault()}
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(item.key)}
              onTouchEnd={() => setHovered(null)}
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
              <span style={{ marginTop: '4px' }}>{item.label}</span>
              {/* 氣泡提示 */}
              {hovered === item.key && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '70px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(60,60,60,0.95)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 1001,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {item.tooltip}
                </span>
              )}
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

export default BottomNavBar;
