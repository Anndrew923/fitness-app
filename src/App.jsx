import React, { useState, Component, useEffect, useMemo } from 'react';
import {
  BrowserRouter as Router,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import PropTypes from 'prop-types';
import ScrollToTop from './ScrollToTop';
import { Capacitor } from '@capacitor/core';
import logger from './utils/logger';
import useAndroidBackButton from './hooks/useAndroidBackButton'; // ✅ Phase 1.9.5 新增
import useNativeViewport from './hooks/useNativeViewport'; // ✅ 原生视口管理
import BottomNavBar from './components/BottomNavBar';
import GlobalAdBanner from './components/GlobalAdBanner';
import MagitekFrame from './components/Layout/MagitekFrame';
import performanceMonitor from './utils/performanceMonitor';
import AppRoutes from './AppRoutes';
import AvatarSection from './components/UserInfo/AvatarSection'; // ⚡ 2. 大頭照「越獄」行動
import GeneralModal from './components/UserInfo/Modals/GeneralModal'; // ⚡ V6.21: 錯誤提示 Modal
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { compressImage } from './utils/imageUtils';
import './App.css';
import { useTranslation, withTranslation } from 'react-i18next';

class RawErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary 捕獲錯誤:', error, errorInfo);

    // 記錄錯誤到性能監控
    if (performanceMonitor) {
      performanceMonitor.logError(error, 'ErrorBoundary');
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
            🚨 {t('errorBoundary.title')}
          </h2>
          <p style={{ marginBottom: '20px', color: '#6c757d' }}>
            {t('errorBoundary.description')}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {t('errorBoundary.reload')}
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>{t('errorBoundary.detailsDev')}</summary>
              <pre
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '5px',
                  overflow: 'auto',
                  maxWidth: '100%',
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

RawErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  t: PropTypes.func.isRequired,
};

const ErrorBoundary = withTranslation()(RawErrorBoundary);

// 創建一個內部組件來使用 useNavigate
function AppContent() {
  const { t } = useTranslation();
  const [testData, setTestData] = useState(null);
  const location = useLocation();
  // ⚡ 2. 大頭照「越獄」行動：從 UserContext 獲取數據
  const { userData, setUserData } = useUser();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  // ⚡ V6.21: 錯誤提示 Modal 狀態
  const [avatarModalState, setAvatarModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
  });
  // ✅ Phase 1.9.5 新增：啟用 Android 返回鍵監聽
  useAndroidBackButton();
  // ✅ 原生视口管理（Status Bar、键盘检测、输入框滚动）
  useNativeViewport();
  
  // ⚡ 2. 大頭照「越獄」行動：處理頭像上傳
  const handleAvatarChange = async blob => {
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('未登入，無法上傳頭像');
      
      const avatarRef = ref(storage, `avatars/${userId}/avatar.jpg`);
      const metadata = {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      };
      
      await uploadBytes(avatarRef, blob, metadata);
      const downloadURL = await getDownloadURL(avatarRef);
      
      await updateDoc(doc(db, 'users', userId), {
        avatarUrl: downloadURL,
      });
      
      setUserData(prev => ({ ...prev, avatarUrl: downloadURL }));
      logger.debug('✅ 頭像上傳成功');
      
      // ⚡ V6.21: 顯示成功提示
      setAvatarModalState({
        isOpen: true,
        title: '頭像上傳成功',
        message: '您的頭像已成功更新！',
        type: 'success',
      });
      
      // 2秒後自動關閉成功對話框
      setTimeout(() => {
        setAvatarModalState(prev => ({ ...prev, isOpen: false }));
      }, 2000);
    } catch (error) {
      const errorMessage = error.message || '未知錯誤';
      logger.error('❌ 頭像上傳失敗:', error);
      setAvatarError('頭像上傳失敗: ' + errorMessage);
      
      // ⚡ V6.21: 顯示錯誤提示 Modal
      setAvatarModalState({
        isOpen: true,
        title: '頭像上傳失敗',
        message: `頭像上傳失敗：${errorMessage}`,
        type: 'error',
      });
      
      // 5秒後自動關閉錯誤對話框
      setTimeout(() => {
        setAvatarModalState(prev => ({ ...prev, isOpen: false }));
      }, 5000);
    } finally {
      setAvatarUploading(false);
    }
  };
  
  // ⚡ V6.21: 處理 AvatarSection 的 onError 回調（壓縮階段錯誤）
  const handleAvatarError = (errorMessage) => {
    if (!errorMessage) {
      // 清除錯誤
      setAvatarError(null);
      return;
    }
    
    setAvatarError(errorMessage);
    logger.error('❌ 頭像處理錯誤:', errorMessage);
    
    // 顯示錯誤提示 Modal
    setAvatarModalState({
      isOpen: true,
      title: '頭像處理失敗',
      message: errorMessage,
      type: 'error',
    });
    
    // 5秒後自動關閉錯誤對話框
    setTimeout(() => {
      setAvatarModalState(prev => ({ ...prev, isOpen: false }));
    }, 5000);
  };
  
  // ⚡ V6.23: 使用 useMemo 穩定 avatarSection，避免路由切換時重新掛載
  const isUserInfoPage = location.pathname === '/user-info';
  const isGuest = sessionStorage.getItem('guestMode') === 'true';
  const avatarSection = useMemo(() => {
    return isUserInfoPage ? (
      <AvatarSection
        avatarUrl={isGuest ? '/guest-avatar.svg' : userData?.avatarUrl}
        isGuest={isGuest}
        isUploading={avatarUploading}
        onImageSelected={handleAvatarChange}
        onError={handleAvatarError}
        t={t}
      />
    ) : null;
  }, [isUserInfoPage, isGuest, userData?.avatarUrl, avatarUploading, t]);
  
  const showNavBar = [
    '/user-info',
    '/history',
    '/ladder',
    '/community',
    '/friend-feed',
    '/strength',
    '/explosive-power',
    '/cardio',
    '/muscle-mass',
    '/body-fat',
    '/settings',
    '/training-tools',
    '/timer',
  ].some(path => location.pathname.startsWith(path));
  
  // ⚡ V6.23: 使用 useMemo 穩定 extraChildren，避免路由切換時重新掛載
  const extraChildren = useMemo(() => {
    return showNavBar ? <BottomNavBar /> : null;
  }, [showNavBar]);

  // 檢查是否需要為固定廣告預留空間
  const showFixedAd = [
    '/user-info',
    '/ladder',
    '/community',
    '/friend-feed',
    '/history',
    '/strength',
    '/cardio',
    '/explosive-power',
    '/muscle-mass',
    '/body-fat',
    '/settings',
    '/training-tools',
    '/timer',
  ].some(path => location.pathname.startsWith(path));

  // AdMob 初始化（僅在 Android/iOS 平台）
  useEffect(() => {
    const initializeAdMob = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const { AdMob } = await import('@capacitor-community/admob');
          const isDevelopment = import.meta.env.MODE === 'development';
          const isTestMode = import.meta.env.VITE_ADMOB_TEST_MODE === 'true';

          await AdMob.initialize({
            requestTrackingAuthorization: true,
            // 注意：testingDevices 應為測試設備 ID 陣列，空陣列表示所有設備為測試設備
            // initializeForTesting 參數在 6.0.0 版本中可能不存在，已移除
          });

          logger.debug('✅ AdMob 初始化成功');
        } catch (error) {
          logger.error('❌ AdMob 初始化失敗:', error);
          // 不影響 App 啟動，只記錄錯誤
        }
      }
    };

    initializeAdMob();
  }, []);

  // 性能監控：監控頁面載入時間
  useEffect(() => {
    const pageName = location.pathname || '/';

    // 開始監控頁面載入
    performanceMonitor.startPageLoad(pageName);

    // 使用 setTimeout 來模擬頁面載入完成
    const timer = setTimeout(() => {
      performanceMonitor.measurePageLoad(pageName);
    }, 100); // 給組件一點時間來渲染

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // ✅ 原生视口管理已移至 useNativeViewport hook

  // ✅ 預載入常用頁面（在空閒時間）
  useEffect(() => {
    const preloadPages = () => {
      // 檢查是否支援 requestIdleCallback
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            // 預載入最常用的頁面
            Promise.all([
              import('./components/UserInfo/index'),
              import('./components/Ladder'),
              import('./components/Community'),
            ]).catch(error => {
              logger.debug('預載入頁面失敗:', error);
            });
          },
          { timeout: 2000 } // 最多等待 2 秒
        );
      } else {
        // 降級方案：使用 setTimeout
        setTimeout(() => {
          Promise.all([
            import('./components/UserInfo/index'),
            import('./components/Ladder'),
            import('./components/Community'),
          ]).catch(error => {
            logger.debug('預載入頁面失敗:', error);
          });
        }, 3000); // 3 秒後預載入
      }
    };

    // 只在用戶已登入時預載入
    if (auth.currentUser) {
      preloadPages();
    }
  }, []);

  // ✅ Phase 1.9.5 修正：移除舊的返回鍵處理邏輯，已整合到 useAndroidBackButton hook
  // 舊的實現已移除，避免與新的 hook 衝突

  // 2025-08: V1 不再自動彈出隱私權政策彈窗（保留設定頁/專頁入口）

  const handleLogin = async (email, password) => {
    try {
      logger.debug('App.jsx: handleLogin 被調用', {
        email,
        password: password ? '***' : 'undefined',
      });

      // 檢查密碼是否提供
      if (!password || password.trim() === '') {
        throw new Error('密碼不能為空');
      }

      logger.debug('App.jsx: 開始 Firebase 認證');
      await signInWithEmailAndPassword(auth, email, password);

      logger.debug('App.jsx: Firebase 認證成功');

      // 登入成功後清除 guestMode 標記
      sessionStorage.removeItem('guestMode');
      setTestData(null);

      if (process.env.NODE_ENV === 'development') {
        logger.debug('登入成功, auth.currentUser:', auth.currentUser);
      }

      logger.debug('App.jsx: handleLogin 完成');
    } catch (error) {
      logger.error('App.jsx: 登入失敗:', error);
      // 不要拋出新的錯誤，讓調用者處理原始錯誤
      throw error;
    }
  };

  const handleLogout = () => {
    if (auth.currentUser) {
      signOut(auth)
        .then(() => {
          setTestData(null);
          if (process.env.NODE_ENV === 'development') {
            logger.debug('登出成功');
          }
        })
        .catch(error => {
          logger.error('登出失敗:', error);
        });
    }
  };

  const handleTestComplete = data => {
    setTestData(data);
    if (process.env.NODE_ENV === 'development') {
      logger.debug('測驗完成, testData:', data);
    }
  };

  const clearTestData = () => {
    setTestData(null);
    if (process.env.NODE_ENV === 'development') {
      logger.debug('測驗數據已清除');
    }
  };

  const handleGuestMode = () => {
    // 設置 guestMode 標記並導向 user-info
    sessionStorage.setItem('guestMode', 'true');
    window.location.href = '/user-info';
  };

  return (
    <>
      {/* ⚡ V6.21: 頭像上傳錯誤提示 Modal */}
      <GeneralModal
        isOpen={avatarModalState.isOpen}
        onClose={() => {
          setAvatarModalState(prev => ({ ...prev, isOpen: false }));
        }}
        title={avatarModalState.title}
        message={avatarModalState.message}
        type={avatarModalState.type}
      />
      
      {/* ⚡ V6.23: MagitekFrame 位於路由器之上，HUD 和背景不會在路由切換時重新掛載 */}
      <MagitekFrame
        avatarSection={avatarSection}
        extraChildren={extraChildren}
      >
        {/* ⚡ V4.2 外科手術：移除所有中間容器，讓數據直接裝在 #layer-scroll-content 裡面 */}
        <ScrollToTop />
        <ErrorBoundary>
          <AppRoutes
            testData={testData}
            onLogin={handleLogin}
            onLogout={handleLogout}
            handleTestComplete={handleTestComplete}
            clearTestData={clearTestData}
            handleGuestMode={handleGuestMode}
          />
        </ErrorBoundary>

        {/* 在天梯頁面隱藏廣告，保持頁面乾淨 */}
        {location.pathname !== '/ladder' && <GlobalAdBanner />}
      </MagitekFrame>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
