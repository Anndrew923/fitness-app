import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './Login.css'; // 引入外部 CSS

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
    if (!auth) {
      setError('Firebase 未正確初始化，請檢查配置');
      return;
    }
    if (auth.currentUser) {
      navigate('/user-info');
      return;
    }

    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!auth || !db) {
      setError('Firebase 未正確初始化，請檢查配置');
      setLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (height && weight && age) {
          const userRef = doc(db, 'users', user.uid);
          const updatedUserData = {
            height: parseFloat(height),
            weight: parseFloat(weight),
            age: parseInt(age, 10),
            updatedAt: new Date().toISOString(),
            email: user.email,
          };
          await setDoc(userRef, updatedUserData);
          console.log('用戶數據已儲存，文檔 ID:', user.uid);
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      onLogin(user.email, password);

      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }

      navigate('/user-info');
    } catch (error) {
      console.error('登入/註冊失敗：', error);
      setError(`發生錯誤：${error.message}`);
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

export default Login;