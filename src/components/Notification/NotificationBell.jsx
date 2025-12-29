import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import './NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const welcomeNotificationCreatedRef = useRef(false);

  // 監聽通知
  useEffect(() => {
    const currentUser = auth.currentUser;
    const currentUserId = currentUser?.uid;
    
    if (!currentUser || !currentUserId) {
      setLoading(false);
      return;
    }

    // ✅ 使用根集合 notifications，必須加上 where('userId', '==', currentUserId)
    // 規則要求：match /notifications/{id} 且 resource.data.userId == request.auth.uid
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUserId), // 👈 必須加上這行，規則才會通過
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    unsubscribeRef.current = onSnapshot(
      q,
      async snapshot => {
        const notificationList = [];
        let unread = 0;

        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          notificationList.push({
            id: docSnap.id,
            ...data,
          });
          if (!data.read) {
            unread++;
          }
        });

        setNotifications(notificationList);
        setUnreadCount(unread);
        setLoading(false);

        // ✅ 自動生成歡迎通知：如果通知列表為空且尚未創建過歡迎通知
        if (
          notificationList.length === 0 &&
          !welcomeNotificationCreatedRef.current &&
          currentUserId
        ) {
          try {
            welcomeNotificationCreatedRef.current = true;
            await addDoc(collection(db, 'notifications'), {
              userId: currentUserId,
              title: t('notifications.welcome.title'),
              message: t('notifications.welcome.message'),
              type: 'system',
              read: false,
              createdAt: serverTimestamp(),
            });
          } catch (error) {
            console.error('創建歡迎通知失敗:', error);
            welcomeNotificationCreatedRef.current = false; // 失敗時重置，允許重試
          }
        }
      },
      error => {
        console.error('監聽通知失敗:', error);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // 標記通知為已讀
  const markAsRead = async notificationId => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    try {
      // ✅ 使用根集合 notifications
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('標記通知為已讀失敗:', error);
    }
  };

  // 處理通知點擊
  const handleNotificationClick = async notification => {
    // 標記為已讀
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // 關閉下拉選單
    setIsDropdownOpen(false);

    // 如果有目標路徑，導航到該頁面（支援 targetPath 或 link）
    const targetPath = notification.targetPath || notification.link;
    if (targetPath) {
      navigate(targetPath);
    }
  };

  // 標記所有為已讀
  const markAllAsRead = async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || unreadCount === 0) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notification => {
        // ✅ 使用根集合 notifications
        const notificationRef = doc(db, 'notifications', notification.id);
        return updateDoc(notificationRef, {
          read: true,
          readAt: new Date().toISOString(),
        });
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('標記所有通知為已讀失敗:', error);
    }
  };

  // 格式化時間 - 使用 i18n locale
  const formatTime = timestamp => {
    if (!timestamp) return '';
    
    // 處理 Firestore Timestamp
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return '';
    }

    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    // 使用 i18n 的當前語言
    const currentLocale = i18n.language || 'zh-TW';
    const isZh = currentLocale.startsWith('zh');
    
    if (minutes < 1) return isZh ? '剛剛' : 'Just now';
    if (minutes < 60) return isZh ? `${minutes}分鐘前` : `${minutes}m ago`;
    if (hours < 24) return isZh ? `${hours}小時前` : `${hours}h ago`;
    if (days < 7) return isZh ? `${days}天前` : `${days}d ago`;
    
    return date.toLocaleDateString(currentLocale, {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!auth.currentUser) {
    return null;
  }

  return (
    <div
      className="notification-bell-container"
      ref={dropdownRef}
      style={{
        width: '40px', // ✅ Hardcoded Size
        height: '40px', // ✅ Hardcoded Size
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.95)', // ✅ Match visual style
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '2px solid rgba(102, 126, 234, 0.3)',
      }}
    >
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label={t('notifications.title')}
        title={t('notifications.title')}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: 0,
          background: 'transparent', // ✅ 透明，容器已有背景
          border: 'none', // ✅ 无边框，容器已有边框
          borderRadius: '50%',
          cursor: 'pointer',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3 className="notification-dropdown-title">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-mark-all-read"
                onClick={markAllAsRead}
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">{t('common.loading')}</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="notification-empty-icon"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                </svg>
                <p>{t('notifications.empty')}</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-content">
                    <div className="notification-item-header">
                      <h4 className="notification-item-title">{notification.title || t('notifications.title')}</h4>
                      {!notification.read && (
                        <span className="notification-item-unread-dot"></span>
                      )}
                    </div>
                    <p className="notification-item-message">{notification.message || ''}</p>
                    <span className="notification-item-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

