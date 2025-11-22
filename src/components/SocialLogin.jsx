import { useState, useEffect } from 'react';
import NativeGoogleAuth from '../utils/nativeGoogleAuth';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './SocialLogin.css';

function SocialLogin({ onLogin, onError }) {
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { t } = useTranslation();

  // 初始化 Google Auth - 增強版本
  useEffect(() => {
    // ✅ 修正：安全地檢查 Bridge 錯誤和 Google API 載入錯誤
    const originalConsoleError = console.error;
    let isMounted = true;

    // 設置錯誤過濾器
    console.error = (...args) => {
      // ✅ 改進：安全地檢查字符串（如果 args[0] 是 Error 對象，轉換為字符串）
      const firstArg = args[0];
      if (firstArg) {
        const firstArgStr =
          typeof firstArg === 'string'
            ? firstArg
            : firstArg.toString
              ? firstArg.toString()
              : String(firstArg);

        // ✅ 新增：過濾 Google API platform.js 載入錯誤
        // 這些錯誤不影響功能，但會造成控制台噪音
        if (
          firstArgStr.includes('J[P] is not a function') ||
          firstArgStr.includes('platform.js') ||
          (firstArgStr.includes('gapi') && firstArgStr.includes('TypeError')) ||
          (firstArgStr.includes('gapi.loaded') && firstArgStr.includes('is not a function'))
        ) {
          // 靜默處理，不影響用戶體驗
          console.debug('🔇 Google API 載入警告（已過濾）:', firstArgStr);
          return; // 不輸出錯誤
        }

        if (firstArgStr.includes('androidBridge')) {
          console.log('🔍 檢測到 Bridge 通信錯誤，嘗試重新初始化...');
        }
      }
      originalConsoleError.apply(console, args);
    };

    const initializeGoogleAuth = async () => {
      try {
        await NativeGoogleAuth.initialize();
        if (isMounted) {
          setIsInitialized(true);
          console.log('✅ Google Auth 初始化完成');
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Google Auth 初始化失敗:', error);
          setIsInitialized(false);
          // 不阻止應用啟動，只是記錄錯誤
        }
      }
    };

    initializeGoogleAuth();

    // ✅ 清理函數：組件卸載時恢復原始 console.error
    return () => {
      isMounted = false;
      console.error = originalConsoleError;
    };
  }, []);

  // 處理 Google 登入 - Capacitor 版本
  const handleGoogleLogin = async () => {
    if (!isInitialized) {
      onError('Google 登入服務尚未初始化，請稍後重試');
      return;
    }

    setLoading(true);
    setRetryCount(0);

    try {
      console.log('🔄 開始 Google 登入流程...');

      // 使用 Capacitor Google Auth
      const user = await NativeGoogleAuth.signIn();

      console.log('✅ Google 登入成功:', user.email);
      onLogin(user.email, null);

    } catch (error) {
      console.error('❌ Google 登入失敗:', error);

      // 提供友好的錯誤訊息
      let errorMessage = 'Google 登入失敗，請重試';

      if (error.message.includes('Something went wrong')) {
        errorMessage = '登入服務暫時不可用，請稍後重試';
      } else if (error.message.includes('androidBridge')) {
        errorMessage = '登入通信錯誤，請重試';
      } else if (error.message.includes('cancelled')) {
        errorMessage = '登入已取消';
      } else if (error.message.includes('network')) {
        errorMessage = '網路連線問題，請檢查網路後重試';
      }

      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="social-login-container">
      <div className="divider">
        <span>{t('common.or')}</span>
      </div>

      <div className="social-buttons">
        <button
          type="button"
          className="social-btn google-btn"
          onClick={handleGoogleLogin}
          disabled={loading || !isInitialized}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? t('login.processing') : t('login.google')}
        </button>
      </div>

      {!isInitialized && (
        <div className="initialization-status">
          <small>正在初始化 Google 登入服務...</small>
        </div>
      )}

      {retryCount > 0 && (
        <div className="retry-status">
          <small>正在重試登入... ({retryCount}/3)</small>
        </div>
      )}
    </div>
  );
}

SocialLogin.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default SocialLogin;
