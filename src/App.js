import { useState, Component } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
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

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
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

function App() {
  const [testData, setTestData] = useState(null);

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setTestData(null);
      console.log('登入成功, auth.currentUser:', auth.currentUser);
    } catch (error) {
      console.error('登入失敗:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    if (auth.currentUser) {
      signOut(auth)
        .then(() => {
          setTestData(null);
          console.log('登出成功');
        })
        .catch((error) => {
          console.error('登出失敗:', error);
        });
    }
  };

  const handleTestComplete = (data) => {
    setTestData(data);
    console.log('測驗完成, testData:', data);
  };

  const clearTestData = () => {
    setTestData(null);
    console.log('測驗數據已清除');
  };

  const ProtectedRoute = ({ element }) => {
    const { userData } = useUser();
    const currentPath = window.location.pathname;

    if (!auth.currentUser) {
      return <Navigate to="/login" />;
    }

    if (currentPath !== '/user-info') {
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

  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
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
                <UserInfo
                  testData={testData}
                  onLogout={handleLogout}
                  clearTestData={clearTestData}
                />
              }
            />
            <Route
              path="/strength"
              element={
                <ProtectedRoute
                  element={<Strength onComplete={handleTestComplete} clearTestData={clearTestData} />}
                />
              }
            />
            <Route
              path="/cardio"
              element={
                <ProtectedRoute
                  element={<Cardio onComplete={handleTestComplete} clearTestData={clearTestData} />}
                />
              }
            />
            <Route
              path="/explosive-power"
              element={
                <ProtectedRoute
                  element={<Power onComplete={handleTestComplete} clearTestData={clearTestData} />}
                />
              }
            />
            <Route
              path="/muscle-mass"
              element={
                <ProtectedRoute
                  element={<Muscle onComplete={handleTestComplete} clearTestData={clearTestData} />}
                />
              }
            />
            <Route
              path="/body-fat"
              element={
                <ProtectedRoute
                  element={<FFMI onComplete={handleTestComplete} clearTestData={clearTestData} />}
                />
              }
            />
            <Route path="/strength-instructions" element={<StrengthInstructions />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/history" element={<ProtectedRoute element={<History />} />} />
            <Route path="*" element={<div>404 - 頁面未找到</div>} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </UserProvider>
  );
}

export default App;