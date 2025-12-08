import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import App from './App';
import './index.css';

// ✅ 關鍵修復：移除 StatusBar JS 控制
// 原生 styles.xml 和 MainActivity 已接管系統 UI 佈局
// 不再需要 JS 層級的 StatusBar API 調用，避免與原生設定衝突

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 註冊 Service Worker（TWA 需求：提供離線備援與快取能力）
// 已停用 Service Worker 以解決快取問題
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(err => console.error('SW register failed:', err));
  });
}
*/
