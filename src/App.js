import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './UserContext';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import ScrollToTop from './ScrollToTop';
import Welcome from './Welcome';
import Home from './Home';
import UserInfo from './UserInfo';
import Strength from './Strength';
import Cardio from './Cardio';
import Power from './Power';
import Muscle from './Muscle';
import FFMI from './FFMI';
import StrengthInstructions from './StrengthInstructions';
import CelebrityComparison from './CelebrityComparison';
import Login from './Login';

function App() {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [testData, setTestData] = useState(null);

  // 處理登入
  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsGuestMode(false);
      setTestData(null);
    } catch (error) {
      console.error('登入失敗:', error);
      alert('登入失敗，請檢查帳號密碼！');
    }
  };

  // 處理訪客模式
  const handleGuestMode = () => {
    console.log('handleGuestMode 觸發');
    setIsGuestMode(true);
    setTestData(null);
    if (auth.currentUser) {
      signOut(auth);
    }
  };

  // 處理登出
  const handleLogout = () => {
    if (auth.currentUser) {
      signOut(auth)
        .then(() => {
          setIsGuestMode(false);
          setTestData(null);
        })
        .catch((error) => {
          console.error('登出失敗:', error);
        });
    } else {
      // 訪客模式下僅重置狀態，不改變 isGuestMode
      setTestData(null);
    }
  };

  // 處理測驗完成
  const handleTestComplete = (data) => {
    setTestData(data);
  };

  // 清除測驗數據
  const clearTestData = () => {
    setTestData(null);
  };

  // 保護路由：確保未登入且未選擇訪客模式時不能訪問評測頁面
  const ProtectedRoute = ({ element }) => {
    console.log('ProtectedRoute 檢查 - auth.currentUser:', auth.currentUser, 'isGuestMode:', isGuestMode);
    if (!auth.currentUser && !isGuestMode) {
      return <Navigate to="/" />;
    }
    return element;
  };

  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            element={
              auth.currentUser || isGuestMode ? (
                <Navigate to="/user-info" />
              ) : (
                <Welcome onLogin={handleLogin} onGuestMode={handleGuestMode} />
              )
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute
                element={<Home isGuestMode={isGuestMode} />}
              />
            }
          />
          <Route
            path="/user-info"
            element={
              <UserInfo
                isGuestMode={isGuestMode}
                testData={testData}
                onLogout={handleLogout}
                clearTestData={clearTestData}
                onGuestMode={handleGuestMode}
              />
            }
          />
          <Route
            path="/strength"
            element={
              <ProtectedRoute
                element={
                  <Strength
                    isGuestMode={isGuestMode}
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
                    isGuestMode={isGuestMode}
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
                    isGuestMode={isGuestMode}
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
                    isGuestMode={isGuestMode}
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
                    isGuestMode={isGuestMode}
                    onComplete={handleTestComplete}
                    clearTestData={clearTestData}
                  />
                }
              />
            }
          />
          <Route path="/strength-instructions" element={<StrengthInstructions />} />
          <Route
            path="/celebrity-comparison"
            element={<CelebrityComparison isGuestMode={isGuestMode} />}
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<div>404 - 頁面未找到</div>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;