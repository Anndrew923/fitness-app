import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { useUser } from './UserContext';
import PropTypes from 'prop-types';
import LoadingSpinner from './components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

// Lazy load all page components
const WelcomeSplash = React.lazy(() => import('./pages/WelcomeSplashPage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Welcome = React.lazy(() => import('./pages/WelcomePage'));
const UserInfo = React.lazy(() => import('./components/UserInfo/index'));
const Strength = React.lazy(() => import('./pages/StrengthPage'));
const Cardio = React.lazy(() => import('./pages/CardioPage'));
const Power = React.lazy(() => import('./pages/PowerPage'));
const Muscle = React.lazy(() => import('./pages/MusclePage'));
const FFMI = React.lazy(() => import('./pages/FFMIPage'));
const ArmSize = React.lazy(() => import('./pages/tools/ArmSize'));

const Login = React.lazy(() => import('./pages/Login/LoginPage'));
const History = React.lazy(() => import('./pages/HistoryPage'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const Terms = React.lazy(() => import('./pages/TermsPage'));
const About = React.lazy(() => import('./pages/AboutPage'));
const Features = React.lazy(() => import('./pages/FeaturesPage'));
const Disclaimer = React.lazy(() => import('./pages/DisclaimerPage'));
const Contact = React.lazy(() => import('./pages/ContactPage'));

const Ladder = React.lazy(() => import('./components/Ladder'));
const Settings = React.lazy(() => import('./components/Settings'));
const TrainingTools = React.lazy(() => import('./components/TrainingTools'));
const Community = React.lazy(() => import('./components/Community'));
const FriendFeed = React.lazy(() => import('./components/FriendFeed'));
const Verification = React.lazy(() => import('./pages/Verification'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const Timer = React.lazy(() => import('./pages/Timer'));
const SkillTreePage = React.lazy(() => import('./pages/SkillTreePage'));
const DebugToolPage = React.lazy(() => import('./pages/DebugToolPage'));

function ProtectedRoute({ element }) {
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
    '/debug-tool', // 允許訪客進入測試頁面
  ];
  if (isGuest && guestAllowedPaths.some(path => currentPath.startsWith(path))) {
    return element;
  }

  // 再檢查登入狀態
  if (!auth.currentUser) {
    // 保存原始路徑，以便登入後返回
    const returnPath = currentPath !== '/login' ? currentPath : '/user-info';
    sessionStorage.setItem('returnPath', returnPath);
    return <Navigate to="/login" />;
  }

  // 測試頁面跳過基本資料驗證
  if (currentPath === '/debug-tool') {
    return element;
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
}

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

function AppRoutes({
  testData,
  onLogin,
  onLogout,
  handleTestComplete,
  clearTestData,
  handleGuestMode,
}) {
  const { t } = useTranslation();

  return (
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
                <Welcome onLogin={onLogin} onGuestMode={handleGuestMode} />
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
                    onLogout={onLogout}
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

          <Route path="/login" element={<Login onLogin={onLogin} />} />
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
          <Route
            path="/debug-tool"
            element={<ProtectedRoute element={<DebugToolPage />} />}
          />
          <Route path="*" element={<div>{t('common.notFound')}</div>} />
        </Routes>
      </div>
    </Suspense>
  );
}

AppRoutes.propTypes = {
  testData: PropTypes.any,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  handleTestComplete: PropTypes.func.isRequired,
  clearTestData: PropTypes.func.isRequired,
  handleGuestMode: PropTypes.func.isRequired,
};

export default AppRoutes;
