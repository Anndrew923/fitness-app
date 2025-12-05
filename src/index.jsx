import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import App from './App';
import './index.css';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// ✅ 關鍵修復：在 App 啟動前強制設定 StatusBar
const initializeStatusBar = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. 禁止 WebView 覆蓋狀態列（關鍵！這會讓內容自動往下擠，不會重疊）
      await StatusBar.setOverlaysWebView({ overlay: false });
      
      // 2. 設定狀態列背景為純白
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      
      // 3. 設定圖標為深色（因為背景是白的）
      await StatusBar.setStyle({ style: Style.Light });
      
      console.log('✅ StatusBar 初始化成功：白色背景、深色圖標、不覆蓋 WebView');
    } catch (error) {
      console.error('❌ StatusBar 初始化失敗:', error);
    }
  }
};

// 在渲染前初始化 StatusBar
initializeStatusBar();

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
