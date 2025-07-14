import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const SimpleGuestMode = ({ onComplete, onRegister }) => {
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  const startGuestMode = () => {
    // 設置訪客模式標記
    sessionStorage.setItem('guestMode', 'true');
    setIsGuest(true);

    // 導航到用戶資料頁面
    navigate('/user-info');
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      navigate('/login');
    }
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    sessionStorage.removeItem('guestMode');
    navigate('/');
  };

  if (!isGuest) {
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
            padding: '40px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginBottom: '10px', color: '#333' }}>
            歡迎使用健身評測
          </h2>
          <p style={{ marginBottom: '30px', color: '#666' }}>
            您可以選擇註冊帳號或直接體驗
          </p>

          <div style={{ marginBottom: '30px' }}>
            <button
              onClick={startGuestMode}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '15px',
              }}
            >
              立即體驗（訪客模式）
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '20px 0',
                color: '#666',
              }}
            >
              <div
                style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}
              ></div>
              <span style={{ margin: '0 15px' }}>或</span>
              <div
                style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}
              ></div>
            </div>

            <button
              onClick={handleRegister}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              註冊帳號
            </button>
          </div>

          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                marginBottom: '10px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              訪客模式功能：
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
              <li>✓ 完整體驗所有評測功能</li>
              <li>✓ 本地儲存評測結果</li>
              <li>✓ 隨時可註冊同步資料</li>
              <li>⚠ 無法使用好友、天梯等社交功能</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#667eea',
        color: 'white',
        padding: '10px 20px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>訪客模式 - 您的資料僅儲存在本地</span>
      <div>
        <button
          onClick={handleRegister}
          style={{
            marginRight: '10px',
            padding: '5px 15px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          註冊同步
        </button>
        <button
          onClick={exitGuestMode}
          style={{
            padding: '5px 15px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          退出
        </button>
      </div>
    </div>
  );
};

SimpleGuestMode.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

export default SimpleGuestMode;
