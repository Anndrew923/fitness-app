import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

// 響應式 CSS
const styles = `
  .login-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .input-field {
    width: 100%;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  .submit-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #4bc0c0;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .submit-btn:hover {
    background-color: #3aa0a0;
  }

  .submit-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .toggle-btn {
    width: 100%;
    padding: 0.5rem;
    margin-top: 1rem;
    background: none;
    color: #4bc0c0;
    border: none;
    font-size: 0.875rem;
    cursor: pointer;
    text-align: center;
  }

  .toggle-btn:hover {
    color: #3aa0a0;
  }

  .back-btn {
    width: 100%;
    padding: 0.5rem;
    margin-top: 1rem;
    background-color: #cccccc;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  .back-btn:hover {
    background-color: #b3b3b3;
  }

  .error-message {
    color: #d32f2f;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  @media (min-width: 768px) {
    .login-container {
      max-width: 400px;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { height, weight, age } = location.state || {};

  useEffect(() => {
    if (auth.currentUser) {
      navigate('/user-info');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;

      if (height && weight && age) {
        const updatedUserData = {
          height: parseFloat(height),
          weight: parseFloat(weight),
          age: parseInt(age, 10),
          updatedAt: new Date().toISOString(),
          userId: user.uid,
        };
        await addDoc(collection(db, 'users'), updatedUserData);
        console.log('用戶數據已儲存，文檔 ID:', user.uid);
      }

      onLogin(email, password); // 調用父組件的回調
      navigate('/user-info');
    } catch (error) {
      console.error('登入/註冊失敗：', error);
      setError(error.message);
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
      <button onClick={() => navigate('/user-info')} className="back-btn">
        返回
      </button>
    </div>
  );
}

export default Login;