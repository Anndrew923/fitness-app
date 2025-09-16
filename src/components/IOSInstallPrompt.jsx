import { useState, useEffect } from 'react';
import './IOSInstallPrompt.css';

const IOSInstallPrompt = () => {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 檢測是否為iOS設備
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);

      // 檢測是否已經安裝為PWA
      const isStandaloneMode =
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(isStandaloneMode);

      // 如果是iOS且未安裝，顯示提示
      if (isIOSDevice && !isStandaloneMode) {
        setShowIOSPrompt(true);
      }
    };

    detectIOS();
  }, []);

  const handleDismiss = () => {
    setShowIOSPrompt(false);
    // 儲存到localStorage，避免重複顯示
    localStorage.setItem('ios-install-prompt-dismissed', 'true');
  };

  const handleInstall = () => {
    // 顯示安裝說明
    setShowIOSPrompt(false);
    // 可以顯示一個模態框說明安裝步驟
  };

  // 如果已經安裝或不是iOS，不顯示
  if (isStandalone || !isIOS || !showIOSPrompt) {
    return null;
  }

  // 檢查是否已經關閉過提示
  if (localStorage.getItem('ios-install-prompt-dismissed') === 'true') {
    return null;
  }

  return (
    <div className="ios-install-prompt">
      <div className="ios-install-prompt__content">
        <div className="ios-install-prompt__icon">📱</div>
        <div className="ios-install-prompt__text">
          <h3>安裝到主畫面</h3>
          <p>點擊分享按鈕，選擇「添加到主畫面」即可安裝應用程式</p>
        </div>
        <div className="ios-install-prompt__steps">
          <div className="ios-install-prompt__step">
            <span className="ios-install-prompt__step-number">1</span>
            <span>點擊底部的分享按鈕</span>
          </div>
          <div className="ios-install-prompt__step">
            <span className="ios-install-prompt__step-number">2</span>
            <span>選擇「添加到主畫面」</span>
          </div>
          <div className="ios-install-prompt__step">
            <span className="ios-install-prompt__step-number">3</span>
            <span>點擊「添加」完成安裝</span>
          </div>
        </div>
        <div className="ios-install-prompt__actions">
          <button
            className="ios-install-prompt__btn ios-install-prompt__btn--primary"
            onClick={handleInstall}
          >
            我知道了
          </button>
          <button
            className="ios-install-prompt__btn ios-install-prompt__btn--dismiss"
            onClick={handleDismiss}
          >
            稍後再說
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;
