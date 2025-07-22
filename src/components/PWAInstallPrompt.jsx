import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

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

    // 檢查是否支援PWA
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // 註冊Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker註冊成功:', registration);
        })
        .catch(error => {
          console.log('Service Worker註冊失敗:', error);
        });

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

  // 如果已安裝或沒有提示，不顯示
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-prompt__content">
        <div className="pwa-install-prompt__icon">📱</div>
        <div className="pwa-install-prompt__text">
          <h3>安裝健身評測小能手</h3>
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
