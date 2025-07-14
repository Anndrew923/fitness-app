import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function MinimalWelcome() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1>歡迎來到評測小能手</h1>
        <p>測試頁面</p>
        <button
          onClick={() => alert('按鈕正常工作！')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff6f61',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          測試按鈕
        </button>
      </div>
    </div>
  );
}

function MinimalApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MinimalWelcome />} />
        <Route path="*" element={<MinimalWelcome />} />
      </Routes>
    </Router>
  );
}

export default MinimalApp;
