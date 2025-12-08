import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';

const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // ✅ Phase 1.9.6 新增：記錄上次按下返回鍵的時間
  const lastBackPressTime = useRef(0);

  useEffect(() => {
    // 只在原生平台（Android/iOS）上啟用
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let backButtonListener;

    const setupListener = async () => {
      try {
        backButtonListener = await App.addListener('backButton', async () => {
          const currentPath = location.pathname;

          // ✅ Phase 1.9.5 整合：沒有底部導覽列的頁面，返回首頁
          const pagesWithoutNavBar = [
            '/features',
            '/about',
            '/privacy-policy',
            '/terms',
            '/contact',
            '/disclaimer',
          ];

          if (pagesWithoutNavBar.includes(currentPath)) {
            // 這些頁面沒有導覽列，返回按鈕應該回到首頁
            navigate('/landing');
            return;
          }

          // ✅ 定義底部導航的主頁面 (Tab Pages)
          const mainPages = [
            '/',
            '/user-info',
            '/skill-tree',
            '/ladder',
            '/history',
            '/community',
          ];

          if (!mainPages.includes(currentPath)) {
            // 如果是子頁面 (如 /settings, /strength, /cardio 等)，則返回上一頁
            navigate(-1);
          } else {
            // ✅ Phase 1.9.6 新增：主頁面雙擊退出機制
            const now = Date.now();
            const timeDiff = now - lastBackPressTime.current;

            if (timeDiff < 2000) {
              // 情境 B：兩秒內連按，真的退出 App
              App.exitApp();
            } else {
              // 情境 A：超過兩秒，顯示提示並更新時間戳
              lastBackPressTime.current = now;

              try {
                await Toast.show({
                  text: '再按一次退出應用程式',
                  duration: 'short',
                  position: 'bottom',
                });
              } catch (toastError) {
                // 如果 Toast 顯示失敗，使用 fallback（不影響功能）
                console.warn('Toast 顯示失敗:', toastError);
              }
            }
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
