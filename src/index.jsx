import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import App from './App';
import './index.css';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// ✅ 關鍵修復：畫框式佈局 - 在 App 啟動前強制設定系統 UI
const initializeSystemUI = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // ✅ Level 2-1: 鎖定頂部狀態列
      // 禁止 WebView 覆蓋狀態列（關鍵！這會讓內容自動往下擠，不會重疊）
      await StatusBar.setOverlaysWebView({ overlay: false });
      
      // 設定狀態列背景為純白
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      
      // 設定圖標為深色（因為背景是白的）
      await StatusBar.setStyle({ style: Style.Light });
      
      // ✅ Level 2-2: 底部導航列處理
      // 注意：@capacitor/status-bar 不支援導航列設定
      // 但透過 styles.xml 的 android:navigationBarColor 已可控制
      // 如果需要動態控制，可考慮安裝 @capacitor-community/navigation-bar
      // 目前先使用原生 XML 配置，更穩定可靠
      
      console.log('✅ 系統 UI 初始化成功：畫框式佈局已啟用');
      console.log('  - 狀態列：白色背景、深色圖標、不覆蓋 WebView');
      console.log('  - 導航列：由 styles.xml 控制（白色背景）');
    } catch (error) {
      console.error('❌ 系統 UI 初始化失敗:', error);
    }
  }
};

// 在渲染前初始化系統 UI
initializeSystemUI();

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
