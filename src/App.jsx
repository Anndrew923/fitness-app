import { useState, Component } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
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

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  const [testData, setTestData] = useState(null);

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        .catch((error) => {
          console.error('登出失敗:', error);
        });
    }
  };

  const handleTestComplete = (data) => {
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

  const ProtectedRoute = ({ element }) => {
    const { userData } = useUser();
    const currentPath = window.location.pathname;

    if (!auth.currentUser) {
      return <Navigate to="/login" />;
    }

    if (currentPath !== '/user-info' && currentPath !== '/login') {
      const isHeightValid = typeof userData?.height === 'number' && userData.height > 0;
      const isWeightValid = typeof userData?.weight === 'number' && userData.weight > 0;
      const isAgeValid = typeof userData?.age === 'number' && userData.age > 0;
      const isGenderValid = userData?.gender === 'male' || userData?.gender === 'female';

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
    <UserProvider>
      <Router>
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
                      <Welcome onLogin={handleLogin} />
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
                <Route path="/strength-instructions" element={<StrengthInstructions />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute element={<History />} />
                  }
                />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="*" element={<div>404 - 頁面未找到</div>} />
              </Routes>
            </div>
          </ErrorBoundary>
          <footer className="app-footer">
            <Link to="/privacy-policy">隱私權政策</Link>
          </footer>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;