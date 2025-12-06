import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 只在原生平台（Android/iOS）上啟用
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let backButtonListener;

    const setupListener = async () => {
      try {
        backButtonListener = await App.addListener('backButton', () => {
          // 定義底部導航的主頁面 (Tab Pages)，在這些頁面按返回鍵會退出 App
          const mainPages = [
            '/',
            '/user-info',
            '/skill-tree',
            '/ladder',
            '/history',
            '/community',
          ];

          if (!mainPages.includes(location.pathname)) {
            // 如果是子頁面 (如 /settings, /strength, /cardio 等)，則返回上一頁
            navigate(-1);
          } else {
            // 如果是主頁面，則退出 App
            App.exitApp();
          }
        });
      } catch (error) {
        // 如果監聽器設置失敗（例如在 Web 環境），靜默忽略
        console.warn('無法設置 Android 返回鍵監聽器:', error);
      }
    };

    setupListener();

    // Cleanup
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [navigate, location.pathname]);
};

export default useAndroidBackButton;

