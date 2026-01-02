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

  // 國際化原生驗證訊息
  const handleEmailInvalid = e => {
    const v = e.target.validity;
    if (v.valueMissing) {
      e.target.setCustomValidity(t('errors.emailRequired'));
    } else if (v.typeMismatch) {
      e.target.setCustomValidity(t('errors.emailInvalid'));
    } else {
      e.target.setCustomValidity(t('errors.invalidFormat'));
    }
  };

  const handlePasswordInvalid = e => {
    const v = e.target.validity;
    if (v.valueMissing) {
      e.target.setCustomValidity(t('errors.passwordRequired'));
    } else if (v.tooShort) {
      e.target.setCustomValidity(t('errors.passwordTooShort'));
    } else {
      e.target.setCustomValidity(t('errors.invalidFormat'));
    }
  };

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

    // 檢查 Firebase 配置
    if (!auth || !db) {
      const errorMsg = 'Firebase 未正確初始化，請檢查配置';
      console.error(errorMsg, { auth, db });
      setError(errorMsg);
      setLoading(false);
      return;
    }

    // 檢查 Firebase 配置是否為 demo 配置
    if (auth.app?.options?.apiKey === 'demo-api-key') {
      const errorMsg =
        'Firebase 使用 demo 配置，無法進行真實認證。請檢查環境變數配置。';
      console.error(errorMsg);
      setError(errorMsg);
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
          // ✅ Phase 1 新增欄位
          city: '',
          job_category: '',
          gym_name: '',
          rpg_class: '',
          // ✅ Phase 1-5 新增：商業系統預埋
          subscription: {
            status: 'active',
            isEarlyAdopter: false, // 新用戶預設為 false
          },
          // ✅ Phase 1-5 新增：RPG 統計數據
          rpgStats: {
            lastGachaDate: null,
            totalExp: 0,
            level: 1,
          },
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
      console.log('調用 onLogin 回調函數');
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

      // 提供更友好的錯誤訊息
      let userFriendlyError = error.message;
      if (error.code === 'auth/user-not-found') {
        userFriendlyError = '找不到此電子郵件帳號，請檢查是否輸入正確或先註冊';
      } else if (error.code === 'auth/wrong-password') {
        userFriendlyError = '密碼錯誤，請重新輸入';
      } else if (error.code === 'auth/invalid-email') {
        userFriendlyError = '電子郵件格式不正確';
      } else if (error.code === 'auth/weak-password') {
        userFriendlyError = '密碼強度不足，請使用至少6個字符';
      } else if (error.code === 'auth/email-already-in-use') {
        userFriendlyError = '此電子郵件已被使用，請直接登入或使用其他郵箱註冊';
      }

      setError(userFriendlyError);
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

  const handleGuestMode = () => {
    // 設置 guestMode 標記並導向 user-info
    sessionStorage.setItem('guestMode', 'true');
    navigate('/user-info');
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
            onInvalid={handleEmailInvalid}
            onInput={e => e.currentTarget.setCustomValidity('')}
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
            minLength={6}
            onInvalid={handlePasswordInvalid}
            onInput={e => e.currentTarget.setCustomValidity('')}
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

      <button
        onClick={handleGuestMode}
        className="guest-btn"
        disabled={loading}
      >
        {t('login.guestMode')}
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
