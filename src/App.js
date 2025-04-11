import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
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
      console.log('登入成功, auth.currentUser:', auth.currentUser);
    } catch (error) {
      console.error('登入失敗:', error);
      alert('登入失敗，請檢查帳號密碼！');
    }
  };

  // 處理訪客模式
  const handleGuestMode = (setUserData) => {
    console.log('handleGuestMode 觸發');
    setIsGuestMode(true);
    setTestData(null);
    // 重置 userData
    setUserData({
      gender: '',
      height: 0,
      weight: 0,
      age: 0,
      scores: {
        strength: 0,
        explosivePower: 0,
        cardio: 0,
        muscleMass: 0,
        bodyFat: 0,
      },
    });
    if (auth.currentUser) {
      signOut(auth);
    }
  };

  // 處理登出
  const handleLogout = (setUserData) => {
    if (auth.currentUser) {
      signOut(auth)
        .then(() => {
          setIsGuestMode(false);
          setTestData(null);
          // 重置 userData
          setUserData({
            gender: '',
            height: 0,
            weight: 0,
            age: 0,
            scores: {
              strength: 0,
              explosivePower: 0,
              cardio: 0,
              muscleMass: 0,
              bodyFat: 0,
            },
          });
          console.log('登出成功');
        })
        .catch((error) => {
          console.error('登出失敗:', error);
        });
    } else {
      // 訪客模式下僅重置狀態
      setTestData(null);
      setUserData({
        gender: '',
        height: 0,
        weight: 0,
        age: 0,
        scores: {
          strength: 0,
          explosivePower: 0,
          cardio: 0,
          muscleMass: 0,
          bodyFat: 0,
        },
      });
      console.log('訪客模式下重置數據');
    }
  };

  // 處理測驗完成
  const handleTestComplete = (data) => {
    setTestData(data);
    console.log('測驗完成, testData:', data);
  };

  // 清除測驗數據
  const clearTestData = () => {
    setTestData(null);
    console.log('測驗數據已清除');
  };

  // 保護路由：確保未登入且未選擇訪客模式時不能訪問評測頁面，並檢查必要數據
  const ProtectedRoute = ({ element }) => {
    const { userData } = useUser();
    console.log('ProtectedRoute 檢查 - auth.currentUser:', auth.currentUser, 'isGuestMode:', isGuestMode, 'userData:', userData);

    // 檢查是否登入或在訪客模式
    if (!auth.currentUser && !isGuestMode) {
      console.log('未登入且未選擇訪客模式，重定向到 /');
      return <Navigate to="/" />;
    }

    // 檢查是否填寫了必要數據
    const isHeightValid = typeof userData.height === 'number' && userData.height > 0;
    const isWeightValid = typeof userData.weight === 'number' && userData.weight > 0;
    const isAgeValid = typeof userData.age === 'number' && userData.age > 0;
    const isGenderValid = userData.gender === 'male' || userData.gender === 'female';

    if (!isHeightValid || !isWeightValid || !isAgeValid || !isGenderValid) {
      console.log('缺少必要數據或數據無效，重定向到 /user-info');
      console.log('檢查詳情:', {
        height: userData.height,
        isHeightValid,
        weight: userData.weight,
        isWeightValid,
        age: userData.age,
        isAgeValid,
        gender: userData.gender,
        isGenderValid,
      });
      return <Navigate to="/user-info" />;
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
            element={<ProtectedRoute element={<CelebrityComparison isGuestMode={isGuestMode} />} />}
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<div>404 - 頁面未找到</div>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;