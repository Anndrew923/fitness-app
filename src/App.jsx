import React, { useState, Component, useEffect, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import PropTypes from 'prop-types';
import ScrollToTop from './ScrollToTop';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import logger from './utils/logger';
import useAndroidBackButton from './hooks/useAndroidBackButton'; // ✅ Phase 1.9.5 新增
import useNativeViewport from './hooks/useNativeViewport'; // ✅ 原生视口管理
const WelcomeSplash = React.lazy(() => import('./WelcomeSplash'));
const LandingPage = React.lazy(() => import('./LandingPage'));
const Welcome = React.lazy(() => import('./Welcome'));
const UserInfo = React.lazy(() => import('./components/UserInfo/index'));
const Strength = React.lazy(() => import('./Strength'));
const Cardio = React.lazy(() => import('./Cardio'));
const Power = React.lazy(() => import('./Power'));
const Muscle = React.lazy(() => import('./Muscle'));
const FFMI = React.lazy(() => import('./FFMI'));
const ArmSize = React.lazy(() => import('./pages/tools/ArmSize'));

const Login = React.lazy(() => import('./Login'));
const History = React.lazy(() => import('./History'));
const PrivacyPolicy = React.lazy(() => import('./PrivacyPolicy'));
const Terms = React.lazy(() => import('./Terms'));
const About = React.lazy(() => import('./About'));
const Features = React.lazy(() => import('./Features'));
const Disclaimer = React.lazy(() => import('./Disclaimer'));
const Contact = React.lazy(() => import('./Contact'));
import BottomNavBar from './components/BottomNavBar';
const Ladder = React.lazy(() => import('./components/Ladder'));
const Settings = React.lazy(() => import('./components/Settings'));
const TrainingTools = React.lazy(() => import('./components/TrainingTools'));
const Community = React.lazy(() => import('./components/Community'));
const FriendFeed = React.lazy(() => import('./components/FriendFeed'));
const Verification = React.lazy(() => import('./pages/Verification'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const Timer = React.lazy(() => import('./pages/Timer'));
const SkillTreePage = React.lazy(() => import('./pages/SkillTreePage')); // ✅ Phase 1.5 新增
import GlobalAdBanner from './components/GlobalAdBanner';
import LoadingSpinner from './components/LoadingSpinner';
import performanceMonitor from './utils/performanceMonitor';
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
  const navigate = useNavigate();
  // ✅ Phase 1.9.5 新增：啟用 Android 返回鍵監聽
  useAndroidBackButton();
  // ✅ 原生视口管理（Status Bar、键盘检测、输入框滚动）
  useNativeViewport();
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

  const ProtectedRoute = ({ element }) => {
    const { userData } = useUser();
    const currentPath = window.location.pathname;
    const isGuest =
      sessionStorage.getItem('guestMode') === 'true' && !auth.currentUser;

    // 先檢查訪客模式，如果符合，直接允許進入
    const guestAllowedPaths = [
      '/user-info',
      '/strength',
      '/cardio',
      '/explosive-power',
      '/muscle-mass',
      '/body-fat',
      '/arm-size',
      '/settings', // 允許訪客進入設定頁面
      '/skill-tree', // 允許訪客進入技能數頁面
      '/training-tools', // 允許訪客進入工具頁面
    ];
    if (
      isGuest &&
      guestAllowedPaths.some(path => currentPath.startsWith(path))
    ) {
      return element;
    }

    // 再檢查登入狀態
    if (!auth.currentUser) {
      return <Navigate to="/login" />;
    }

    if (currentPath !== '/user-info' && currentPath !== '/login') {
      const isHeightValid =
        typeof userData?.height === 'number' && userData.height > 0;
      const isWeightValid =
        typeof userData?.weight === 'number' && userData.weight > 0;
      const isAgeValid = typeof userData?.age === 'number' && userData.age > 0;
      const isGenderValid =
        userData?.gender === 'male' || userData?.gender === 'female';

      if (!isHeightValid || !isWeightValid || !isAgeValid || !isGenderValid) {
        return <Navigate to="/user-info" />;
      }
    }

    return element;
  };

  ProtectedRoute.propTypes = {
    element: PropTypes.element.isRequired,
  };

  return (
    <div className={`app-container ${showFixedAd ? 'page-with-fixed-ad' : ''}`}>
      <ScrollToTop />
      <ErrorBoundary>
        {/* ✅ 優化：使用統一的載入組件 */}
        <Suspense
          fallback={
            <LoadingSpinner message={t('common.loading')} fullScreen={true} />
          }
        >
          <div className="main-content">
            <Routes>
              <Route path="/" element={<WelcomeSplash />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route
                path="/welcome"
                element={
                  auth.currentUser ? (
                    <Navigate to="/user-info" />
                  ) : (
                    <Welcome
                      onLogin={handleLogin}
                      onGuestMode={handleGuestMode}
                    />
                  )
                }
              />
              <Route
                path="/user-info"
                element={
                  <ProtectedRoute
                    element={
                      <UserInfo
                        testData={testData}
                        onLogout={handleLogout}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/strength"
                element={
                  <ProtectedRoute
                    element={
                      <Strength
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/cardio"
                element={
                  <ProtectedRoute
                    element={
                      <Cardio
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/explosive-power"
                element={
                  <ProtectedRoute
                    element={
                      <Power
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/muscle-mass"
                element={
                  <ProtectedRoute
                    element={
                      <Muscle
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/body-fat"
                element={
                  <ProtectedRoute
                    element={
                      <FFMI
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/arm-size"
                element={
                  <ProtectedRoute
                    element={
                      <ArmSize
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />

              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route
                path="/history"
                element={<ProtectedRoute element={<History />} />}
              />
              <Route
                path="/ladder"
                element={<ProtectedRoute element={<Ladder />} />}
              />
              <Route
                path="/settings"
                element={<ProtectedRoute element={<Settings />} />}
              />
              <Route
                path="/community"
                element={<ProtectedRoute element={<Community />} />}
              />
              <Route
                path="/friend-feed/:userId"
                element={<ProtectedRoute element={<FriendFeed />} />}
              />

              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/verification"
                element={<ProtectedRoute element={<Verification />} />}
              />
              <Route
                path="/training-tools"
                element={<ProtectedRoute element={<TrainingTools />} />}
              />
              <Route
                path="/timer"
                element={<ProtectedRoute element={<Timer />} />}
              />
              <Route
                path="/skill-tree"
                element={<ProtectedRoute element={<SkillTreePage />} />}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute element={<AdminPanel />} />}
              />
              <Route path="*" element={<div>{t('common.notFound')}</div>} />
            </Routes>
          </div>
        </Suspense>
      </ErrorBoundary>

      {/* 在天梯頁面隱藏廣告，保持頁面乾淨 */}
      {location.pathname !== '/ladder' && <GlobalAdBanner />}
      {showNavBar && <BottomNavBar />}
    </div>
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
