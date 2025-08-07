import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import LanguageSwitcher from './components/LanguageSwitcher';
import './Welcome.css';
import i18n from './i18n';

function Welcome({ onGuestMode }) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useUser();
  const { t } = useTranslation();
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  useEffect(() => {
    console.log('i18n current language:', i18n.language);
  }, []);

  useEffect(() => {
    const tryAutoLogin = async () => {
      if (autoLoginAttempted || isAuthenticated) return;

      const savedEmail = localStorage.getItem('savedEmail');
      const savedPassword = localStorage.getItem('savedPassword');

      if (savedEmail && savedPassword && !autoLoginAttempted) {
        console.log('Welcome - 嘗試自動登入:', savedEmail);
        setAutoLoginAttempted(true);

        try {
          // 嘗試自動登入
          const userCredential = await signInWithEmailAndPassword(
            auth,
            savedEmail,
            savedPassword
          );
          console.log('Welcome - 自動登入成功:', userCredential.user.email);

          // 等待一小段時間確保資料載入
          setTimeout(() => {
            navigate('/user-info');
          }, 500);
        } catch (error) {
          console.error('Welcome - 自動登入失敗:', error);
          // 清除無效的憑證
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }
      }
    };

    // 延遲執行自動登入，確保 Firebase 已初始化
    const timer = setTimeout(() => {
      tryAutoLogin();
    }, 100);

    return () => clearTimeout(timer);
  }, [autoLoginAttempted, isAuthenticated, navigate]);

  // 如果已經認證，直接導航到 user-info
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('Welcome - 用戶已認證，導航到 user-info');
      navigate('/user-info');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginRedirect = () => {
    // 不清除用戶資料，讓用戶可以正常登入
    navigate('/login');
  };

  const handleGuestMode = () => {
    if (onGuestMode) {
      onGuestMode();
    } else {
      navigate('/guest');
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <LanguageSwitcher />
      </div>
      <div className="welcome-content">
        <h1 className="welcome-title">{t('welcome.title')}</h1>
        <p className="welcome-subtitle">{t('welcome.subtitle')}</p>
        <div className="button-group-mode">
          <div className="button-with-tooltip">
            <button
              onClick={handleLoginRedirect}
              className="mode-btn login-btn"
            >
              {t('welcome.login')}
            </button>
            <span className="tooltip">將數據保存到雲端,隨時隨地訪問</span>
          </div>

          <div className="button-with-tooltip">
            <button onClick={handleGuestMode} className="mode-btn guest-btn">
              {t('welcome.guestMode')}
            </button>
            <span className="tooltip">無需註冊,立即開始評測</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Welcome.propTypes = {
  onLogin: PropTypes.func,
  onGuestMode: PropTypes.func,
};

export default Welcome;
