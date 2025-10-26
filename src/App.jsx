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
const WelcomeSplash = React.lazy(() => import('./WelcomeSplash'));
const LandingPage = React.lazy(() => import('./LandingPage'));
const Welcome = React.lazy(() => import('./Welcome'));
const UserInfo = React.lazy(() => import('./UserInfo'));
const Strength = React.lazy(() => import('./Strength'));
const Cardio = React.lazy(() => import('./Cardio'));
const Power = React.lazy(() => import('./Power'));
const Muscle = React.lazy(() => import('./Muscle'));
const FFMI = React.lazy(() => import('./FFMI'));

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
const Community = React.lazy(() => import('./components/Community'));
const FriendFeed = React.lazy(() => import('./components/FriendFeed'));
import GlobalAdBanner from './components/GlobalAdBanner';
import performanceMonitor from './utils/performanceMonitor';
import './App.css';
import { useTranslation, withTranslation } from 'react-i18next';

class RawErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary 捕獲錯誤:', error, errorInfo);

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
  ].some(path => location.pathname.startsWith(path));

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

  // 處理 Android 返回按鈕
  useEffect(() => {
    const handleBackButton = () => {
      const currentPath = location.pathname;

      // 定義需要特殊處理的頁面（沒有底部導覽列的頁面）
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
        console.log('🔙 返回按鈕：從', currentPath, '回到首頁');
        navigate('/landing');
        return true; // 阻止默認行為
      }

      // 其他頁面使用默認行為
      return false;
    };

    // 監聽返回按鈕事件
    CapacitorApp.addListener('backButton', handleBackButton);

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [location.pathname, navigate]);

  // 2025-08: V1 不再自動彈出隱私權政策彈窗（保留設定頁/專頁入口）

  const handleLogin = async (email, password) => {
    try {
      console.log('App.jsx: handleLogin 被調用', {
        email,
        password: password ? '***' : 'undefined',
      });

      // 檢查密碼是否提供
      if (!password || password.trim() === '') {
        throw new Error('密碼不能為空');
      }

      console.log('App.jsx: 開始 Firebase 認證');
      await signInWithEmailAndPassword(auth, email, password);

      console.log('App.jsx: Firebase 認證成功');

      // 登入成功後清除 guestMode 標記
      sessionStorage.removeItem('guestMode');
      setTestData(null);

      if (process.env.NODE_ENV === 'development') {
        console.log('登入成功, auth.currentUser:', auth.currentUser);
      }

      console.log('App.jsx: handleLogin 完成');
    } catch (error) {
      console.error('App.jsx: 登入失敗:', error);
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
            console.log('登出成功');
          }
        })
        .catch(error => {
          console.error('登出失敗:', error);
        });
    }
  };

  const handleTestComplete = data => {
    setTestData(data);
    if (process.env.NODE_ENV === 'development') {
      console.log('測驗完成, testData:', data);
    }
  };

  const clearTestData = () => {
    setTestData(null);
    if (process.env.NODE_ENV === 'development') {
      console.log('測驗數據已清除');
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
      '/settings', // 允許訪客進入設定頁面
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
        <Suspense fallback={<div>{t('common.loading')}</div>}>
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
