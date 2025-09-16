import { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // 檢查是否已經安裝
    const checkIfInstalled = () => {
      if (
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches
      ) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // 監聽安裝提示事件
    const handleBeforeInstallPrompt = e => {
      console.log('PWA安裝提示觸發');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // 監聽安裝完成事件
    const handleAppInstalled = () => {
      console.log('PWA安裝完成');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // 積極檢查更新
    const checkForUpdates = async registration => {
      try {
        // 強制檢查更新
        await registration.update();
        console.log('主動檢查更新完成');
      } catch (error) {
        console.log('檢查更新失敗:', error);
      }
    };

    // 定期檢查更新
    const startPeriodicUpdateCheck = registration => {
      // 每小時檢查一次更新
      setInterval(() => {
        checkForUpdates(registration);
      }, 60 * 60 * 1000); // 1小時

      // 頁面獲得焦點時檢查更新
      const handleFocus = () => {
        checkForUpdates(registration);
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    };

    // 檢查是否支援PWA
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // 註冊Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker註冊成功:', registration);

          // 立即檢查更新
          checkForUpdates(registration);

          // 開始定期檢查
          const cleanup = startPeriodicUpdateCheck(registration);

          // 監聽更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('檢測到新版本可用');
                setUpdateAvailable(true);
              }
            });
          });

          // 清理函數
          return cleanup;
        })
        .catch(error => {
          console.log('Service Worker註冊失敗:', error);
        });

      // 為開發者添加全局更新檢查函數
      if (process.env.NODE_ENV === 'development') {
        window.checkPWAUpdate = async () => {
          if ('serviceWorker' in navigator) {
            const registration =
              await navigator.serviceWorker.getRegistration();
            if (registration) {
              try {
                await registration.update();
                console.log('🔧 開發者手動檢查更新完成');
                return true;
              } catch (error) {
                console.log('🔧 開發者手動檢查更新失敗:', error);
                return false;
              }
            }
          }
          return false;
        };
        console.log('🔧 開發者工具：使用 window.checkPWAUpdate() 手動檢查更新');
      }

      // 檢查是否已安裝
      if (!checkIfInstalled()) {
        // 添加事件監聽器
        window.addEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt
        );
        window.addEventListener('appinstalled', handleAppInstalled);
      }
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // 顯示安裝提示
    deferredPrompt.prompt();

    // 等待用戶回應
    const { outcome } = await deferredPrompt.userChoice;
    console.log('用戶選擇:', outcome);

    // 清除提示
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  // 手動檢查更新
  const handleManualUpdateCheck = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        try {
          await registration.update();
          console.log('手動檢查更新完成');
        } catch (error) {
          console.log('手動檢查更新失敗:', error);
        }
      }
    }
  };

  // 顯示更新提示
  if (updateAvailable) {
    return (
      <div className="pwa-install-prompt">
        <div className="pwa-install-prompt__content">
          <div className="pwa-install-prompt__icon">🔄</div>
          <div className="pwa-install-prompt__text">
            <h3>有新版本可用</h3>
            <p>點擊更新以獲取最新功能</p>
          </div>
          <div className="pwa-install-prompt__actions">
            <button
              className="pwa-install-prompt__btn pwa-install-prompt__btn--primary"
              onClick={handleUpdate}
            >
              立即更新
            </button>
            <button
              className="pwa-install-prompt__btn pwa-install-prompt__btn--dismiss"
              onClick={() => setUpdateAvailable(false)}
            >
              稍後再說
            </button>
            <button
              className="pwa-install-prompt__btn pwa-install-prompt__btn--secondary"
              onClick={handleManualUpdateCheck}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              檢查更新
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 如果已安裝或沒有提示，不顯示
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-prompt__content">
        <div className="pwa-install-prompt__icon">📱</div>
        <div className="pwa-install-prompt__text">
          <h3>安裝最強肉體</h3>
          <p>將應用程式安裝到主畫面，享受更快的載入速度和離線使用體驗！</p>
        </div>
        <div className="pwa-install-prompt__actions">
          <button
            className="pwa-install-prompt__btn pwa-install-prompt__btn--install"
            onClick={handleInstallClick}
          >
            安裝
          </button>
          <button
            className="pwa-install-prompt__btn pwa-install-prompt__btn--dismiss"
            onClick={handleDismiss}
          >
            稍後再說
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
