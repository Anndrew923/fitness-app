import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import SocialLogin from './components/SocialLogin';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import './Login.css';
import { useTranslation } from 'react-i18next';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const { height, weight, age } = location.state || {};

  useEffect(() => {
    console.log('檢查 auth 初始化狀態:', auth);
    if (!auth) {
      setError('Firebase 未正確初始化，請檢查配置');
      return;
    }

    // 檢查是否已登入
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log('用戶已登入:', user.email);
        navigate('/user-info');
      }
    });

    // 載入已儲存的憑證
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      console.log('從 localStorage 恢復帳號:', savedEmail);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }

    return () => unsubscribe();
  }, [navigate]); // 移除依賴項，認證監聽只需要在組件掛載時設置一次

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    await performLogin();
  };

  const performLogin = async () => {
    setLoading(true);

    console.log(
      '開始處理表單提交，isRegistering:',
      isRegistering,
      'email:',
      email
    );
    if (!auth || !db) {
      setError('Firebase 未正確初始化，請檢查配置');
      console.error('auth 或 db 未初始化:', { auth, db });
      setLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isRegistering) {
        console.log('嘗試註冊用戶:', email);
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        console.log('註冊成功，用戶:', user.email, 'UID:', user.uid);

        // 初始化用戶資料
        const userRef = doc(db, 'users', user.uid);
        const initialUserData = {
          email: user.email,
          userId: user.uid,
          nickname: user.email.split('@')[0],
          avatarUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          gender: '',
          height: height ? parseFloat(height) : 0,
          weight: weight ? parseFloat(weight) : 0,
          age: age ? parseInt(age, 10) : 0,
          scores: {
            strength: 0,
            explosivePower: 0,
            cardio: 0,
            muscleMass: 0,
            bodyFat: 0,
          },
          history: [],
          testInputs: {},
          friends: [],
          friendRequests: [],
          blockedUsers: [],
          ladderScore: 0,
          ladderRank: 0,
          ladderHistory: [],
          isGuest: false,
          lastActive: new Date().toISOString(),
        };

        console.log('儲存初始用戶數據:', initialUserData);
        await setDoc(userRef, initialUserData);
        console.log('用戶數據已儲存，文檔 ID:', user.uid);
      } else {
        console.log('嘗試登入用戶:', email);
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(
          '登入成功，用戶:',
          userCredential.user.email,
          'UID:',
          userCredential.user.uid
        );
      }

      const user = userCredential.user;
      onLogin(user.email, password);

      if (rememberMe) {
        console.log('儲存帳號到 localStorage:', email);
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
      } else {
        console.log('清除 localStorage 中的帳號');
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }

      // 等待一下確保 UserContext 有時間載入資料
      setTimeout(() => {
        console.log('導航到 /user-info');
        navigate('/user-info');
      }, 500);
    } catch (error) {
      console.error('登入/註冊失敗:', error.code, error.message);
      setError(`發生錯誤：${error.message} (代碼: ${error.code})`);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = () => {
    // 社交登入不需要調用 onLogin，因為 Firebase 已經處理了認證
    // 直接導航到用戶信息頁面
    console.log('社交登入成功，導航到 /user-info');
    navigate('/user-info');
  };

  const handleSocialError = errorMessage => {
    setError(errorMessage);
  };

  const handlePrivacyAccept = () => {
    // 用戶已查看隱私權政策，可以記錄這個行為
    localStorage.setItem('privacyPolicyViewed', 'true');
  };

  return (
    <div className="login-container">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isRegistering ? t('login.register') : t('login.login')}
      </h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('login.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
            className="input-field"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('login.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            className="input-field"
            required
            disabled={loading}
          />
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '8px',
          }}
        >
          <label
            htmlFor="rememberMe"
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '14px',
              color: '#555',
            }}
          >
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              disabled={loading}
              style={{ margin: 0 }}
            />
            <span style={{ marginLeft: '6px' }}>{t('login.rememberMe')}</span>
          </label>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading
            ? t('common.loading')
            : isRegistering
            ? t('login.register')
            : t('login.login')}
        </button>
      </form>
      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className="toggle-btn"
      >
        {isRegistering ? t('login.switchToLogin') : t('login.switchToRegister')}
      </button>

      <div className="privacy-notice">
        {i18n.language && i18n.language.toLowerCase().startsWith('zh') ? (
          <p>
            若繼續操作，即表示你同意最強肉體
            <a className="privacy-link" href="/terms">
              使用條款
            </a>
            。請參閱我們的
            <a className="privacy-link" href="/privacy-policy">
              隱私權政策
            </a>
            。
          </p>
        ) : (
          <p>
            By continuing, you agree to the Ultimate Physique
            <a className="privacy-link" href="/terms">
              Terms of Service
            </a>
            . Please review our
            <a className="privacy-link" href="/privacy-policy">
              Privacy Policy
            </a>
            .
          </p>
        )}
      </div>

      <SocialLogin onLogin={handleSocialLogin} onError={handleSocialError} />

      <div className="instructions-container">
        <h2 className="instructions-title">{t('login.instructions.title')}</h2>
        <ul className="instructions-list">
          <li>
            <strong>{t('login.instructions.items.fair.title')}</strong>：
            {t('login.instructions.items.fair.desc')}
          </li>
          <li>
            <strong>{t('login.instructions.items.analysis.title')}</strong>：
            {t('login.instructions.items.analysis.desc')}
          </li>
          <li>
            <strong>{t('login.instructions.items.tracking.title')}</strong>：
            {t('login.instructions.items.tracking.desc')}
          </li>
        </ul>
      </div>

      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        onAccept={handlePrivacyAccept}
      />
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
