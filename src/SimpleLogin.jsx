import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import PropTypes from 'prop-types';

function SimpleLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      const user = userCredential.user;
      console.log('登入/註冊成功:', user.email);

      if (onLogin) {
        onLogin(user.email, password);
      }

      navigate('/user-info');
    } catch (error) {
      console.error('登入/註冊失敗:', error);
      setError(`發生錯誤：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1
          style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}
        >
          {isRegistering ? '註冊' : '登入'}
        </h1>

        {error && (
          <div
            style={{
              color: 'red',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#ffe6e6',
              borderRadius: '5px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label
              style={{ display: 'block', marginBottom: '5px', color: '#333' }}
            >
              電子郵件
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="輸入你的電子郵件"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              style={{ display: 'block', marginBottom: '5px', color: '#333' }}
            >
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="輸入你的密碼"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '16px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '處理中...' : isRegistering ? '註冊' : '登入'}
          </button>
        </form>

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          style={{
            width: '100%',
            marginTop: '15px',
            padding: '10px',
            backgroundColor: 'transparent',
            color: '#667eea',
            border: '1px solid #667eea',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {isRegistering ? '已有帳號？點此登入' : '沒有帳號？點此註冊'}
        </button>
      </div>
    </div>
  );
}

SimpleLogin.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default SimpleLogin;
