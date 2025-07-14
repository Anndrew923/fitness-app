import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function SimpleWelcome({ onLogin, onGuestMode }) {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          歡迎來到評測小能手
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          留下運動數據,進步多少馬上知道
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={handleLoginRedirect}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff6f61',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={e => (e.target.style.backgroundColor = '#e65a50')}
            onMouseOut={e => (e.target.style.backgroundColor = '#ff6f61')}
          >
            登入
          </button>

          <button
            onClick={handleGuestMode}
            style={{
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={e => (e.target.style.backgroundColor = '#5a6fd8')}
            onMouseOut={e => (e.target.style.backgroundColor = '#667eea')}
          >
            立即體驗（訪客模式）
          </button>
        </div>
      </div>
    </div>
  );
}

SimpleWelcome.propTypes = {
  onLogin: PropTypes.func,
  onGuestMode: PropTypes.func,
};

export default SimpleWelcome;
