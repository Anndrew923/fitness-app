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
    
    // 檢查是否已登入
    const unsubscribe = auth.onAuthStateChanged((user) => {
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
        
        // 初始化用戶資料
        const userRef = doc(db, 'users', user.uid);
        const initialUserData = {
          email: user.email,
          userId: user.uid,
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
        };
        
        console.log('儲存初始用戶數據:', initialUserData);
        await setDoc(userRef, initialUserData);
        console.log('用戶數據已儲存，文檔 ID:', user.uid);
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
      <div className="instructions-container">
        <h2 className="instructions-title">使用說明</h2>
        <ul className="instructions-list">
          <li><strong>公平評測</strong>：依性別、年齡、身高、體重，結合科學統計，分數化呈現，簡單易懂。</li>
          <li><strong>全面分析</strong>：五邊形雷達圖顯示弱項，指引補強方向。</li>
          <li><strong>成長追蹤</strong>：記錄進步軌跡，優化課表效率。</li>
        </ul>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;