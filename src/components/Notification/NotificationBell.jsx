import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import './NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // 監聽通知
  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'users', currentUserId, 'notifications');
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    unsubscribeRef.current = onSnapshot(
      q,
      snapshot => {
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
      const notificationRef = doc(
        db,
        'users',
        currentUserId,
        'notifications',
        notificationId
      );
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

    // 如果有目標路徑，導航到該頁面
    if (notification.targetPath) {
      navigate(notification.targetPath);
    }
  };

  // 標記所有為已讀
  const markAllAsRead = async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || unreadCount === 0) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notification => {
        const notificationRef = doc(
          db,
          'users',
          currentUserId,
          'notifications',
          notification.id
        );
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

  // 格式化時間
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

    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes}分鐘前`;
    if (hours < 24) return `${hours}小時前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!auth.currentUser) {
    return null;
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="通知"
        title="通知"
      >
        <span className="notification-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3 className="notification-dropdown-title">通知</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-mark-all-read"
                onClick={markAllAsRead}
              >
                全部標記為已讀
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">載入中...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">暫無通知</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-content">
                    <div className="notification-item-header">
                      <h4 className="notification-item-title">{notification.title || '通知'}</h4>
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

