import { useState, Component } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import PropTypes from 'prop-types';
import ScrollToTop from './ScrollToTop';
import Welcome from './Welcome';
import UserInfo from './UserInfo';
import Strength from './Strength';
import Cardio from './Cardio';
import Power from './Power';
import Muscle from './Muscle';
import FFMI from './FFMI';
import StrengthInstructions from './StrengthInstructions';
import Login from './Login';
import History from './History';
import PrivacyPolicy from './PrivacyPolicy';
import TestPage from './TestPage';
import BottomNavBar from './components/BottomNavBar';
import './App.css';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary 捕獲錯誤:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>發生錯誤，請稍後再試或聯繫支持團隊。</div>;
    }
    return this.props.children;
  }
}

// 創建一個內部組件來使用 useNavigate
function AppContent() {
  const [testData, setTestData] = useState(null);
  const location = useLocation();
  const showNavBar = [
    '/user-info',
    '/history',
    '/ladder',
    '/friends',
    '/strength',
    '/explosive-power',
    '/cardio',
    '/muscle-mass',
    '/body-fat',
  ].some(path => location.pathname.startsWith(path));

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // 登入成功後清除 guestMode 標記
      sessionStorage.removeItem('guestMode');
      setTestData(null);
      if (process.env.NODE_ENV === 'development') {
        console.log('登入成功, auth.currentUser:', auth.currentUser);
      }
    } catch (error) {
      console.error('登入失敗:', error);
      throw new Error('登入失敗');
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
    const isGuest = sessionStorage.getItem('guestMode') === 'true';
    console.log('ProtectedRoute debug:', {
      currentPath,
      isGuest,
      hasUser: !!auth.currentUser,
    });

    // 先檢查訪客模式，如果符合，直接允許進入
    const guestAllowedPaths = [
      '/user-info',
      '/strength',
      '/cardio',
      '/explosive-power',
      '/muscle-mass',
      '/body-fat',
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
    <div className="app-container">
      <ScrollToTop />
      <ErrorBoundary>
        <div className="main-content">
          <Routes>
            <Route
              path="/"
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
              path="/strength-instructions"
              element={<StrengthInstructions />}
            />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/history"
              element={<ProtectedRoute element={<History />} />}
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="*" element={<div>404 - 頁面未找到</div>} />
          </Routes>
        </div>
      </ErrorBoundary>
      <footer className="app-footer">
        <Link to="/privacy-policy">隱私權政策</Link>
      </footer>
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
