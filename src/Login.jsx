import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import './Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { height, weight, age } = location.state || {};

  useEffect(() => {
    console.log('檢查 auth 初始化狀態:', auth);
    if (!auth) {
      setError('Firebase 未正確初始化，請檢查配置');
      return;
    }
    if (auth.currentUser) {
      console.log('已有登入用戶:', auth.currentUser.email);
      navigate('/user-info');
      return;
    }

    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      console.log('從 localStorage 恢復帳號:', savedEmail);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log('開始處理表單提交，isRegistering:', isRegistering, 'email:', email);
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
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('註冊成功，用戶:', user.email, 'UID:', user.uid);
        if (height && weight && age) {
          const userRef = doc(db, 'users', user.uid);
          const updatedUserData = {
            height: parseFloat(height),
            weight: parseFloat(weight),
            age: parseInt(age, 10),
            updatedAt: new Date().toISOString(),
            email: user.email,
          };
          console.log('儲存用戶數據:', updatedUserData);
          await setDoc(userRef, updatedUserData);
          console.log('用戶數據已儲存，文檔 ID:', user.uid);
        }
      } else {
        console.log('嘗試登入用戶:', email);
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('登入成功，用戶:', userCredential.user.email, 'UID:', userCredential.user.uid);
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

      console.log('導航到 /user-info');
      navigate('/user-info');
    } catch (error) {
      console.error('登入/註冊失敗:', error.code, error.message);
      setError(`發生錯誤：${error.message} (代碼: ${error.code})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isRegistering ? '註冊' : '登入'}
      </h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            電子郵件
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="輸入你的電子郵件"
            className="input-field"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            密碼
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="輸入你的密碼"
            className="input-field"
            required
            disabled={loading}
          />
        </div>
        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
          />
          <label className="checkbox-label">記住我的帳號(登出時清除資料)</label>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '處理中...' : isRegistering ? '註冊' : '登入'}
        </button>
      </form>
      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className="toggle-btn"
      >
        {isRegistering ? '已有帳號？點此登入' : '沒有帳號？點此註冊'}
      </button>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;