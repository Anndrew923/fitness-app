// src/index.jsx - 修復後版本
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals'; // 暫時註釋掉

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 暫時禁用 reportWebVitals 來測試是否解決CSP問題
// reportWebVitals();