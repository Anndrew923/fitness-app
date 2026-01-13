import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../UserContext';
import { auth } from '../../firebase';
import PropTypes from 'prop-types';
import logger from '../../utils/logger';
import RadarChartSection from './RadarChartSection/RadarChartSection';
import UserFormSection from './UserFormSection/UserFormSection';
import { useUserInfoForm } from '../../hooks/useUserInfoForm';
import { usePageScroll } from '../../hooks/usePageScroll';
import { useTranslation } from 'react-i18next';
import './UserInfoV5.css';
import './VoidProjectionV6.0.css';

const DEFAULT_SCORES = {
  strength: 0,
  explosivePower: 0,
  cardio: 0,
  muscleMass: 0,
  bodyFat: 0,
};

/**
 * UserInfoV5 - 靈魂轉生計畫 V5.2 (Style Detox)
 * 
 * V5.2 功能去毒植入：
 * - 恢復功能邏輯（Hooks + 組件）
 * - 組件「去毒」樣式覆蓋
 * - 保持真空環境（外殼層隱藏）
 */
function UserInfoV5({ testData, onLogout, clearTestData }) {
  const {
    userData,
    setUserData,
    saveUserData,
    loadUserData,
    isLoading,
  } = useUser();
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  // ✅ Core Hooks
  const { performanceMode } = usePageScroll();

  const navigate = useNavigate();
  const location = useLocation();
  const radarSectionRef = useRef(null);
  const formSectionRef = useRef(null);
  const lastAppliedTestDataKeyRef = useRef(null);

  // ✅ Phase 4: 使用自定義 hooks
  const isGuest = useMemo(() => {
    return sessionStorage.getItem('guestMode') === 'true';
  }, []);

  const {
    loading,
    error,
    weightReminder,
    handleInputChange,
    handleNicknameChange,
    handleGenerateNickname,
    saveData,
  } = useUserInfoForm(
    userData,
    setUserData,
    saveUserData,
    t,
    isGuest,
    null, // setModalState - 暫時不處理 Modal
    navigate
  );

  // 監聽認證狀態
  useEffect(() => {
    if (!auth) {
      logger.error('auth 未初始化');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      logger.debug('UserInfoV5 - 認證狀態變更:', user?.email);
      setCurrentUser(user);
      if (!user && !isGuest) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [isGuest, navigate]);

  // 確保資料載入完成
  useEffect(() => {
    const checkDataLoaded = async () => {
      if (currentUser && !dataLoaded && !isLoading) {
        logger.debug('UserInfoV5 - 檢查資料載入狀態');

        if (!userData.height && !userData.weight && !userData.age) {
          logger.debug('UserInfoV5 - 資料為空，嘗試重新載入');
          await loadUserData(currentUser, true);
        }

        setDataLoaded(true);
      }
    };

    checkDataLoaded();
  }, [
    currentUser,
    dataLoaded,
    isLoading,
    loadUserData,
    userData.height,
    userData.weight,
    userData.age,
  ]);

  // 檢查頁面是否準備好顯示
  useEffect(() => {
    const checkPageReady = () => {
      const userReady = currentUser || isGuest;
      const dataReady = dataLoaded || isGuest;
      const notLoading = !isLoading && !loading;

      const ready = userReady && dataReady && notLoading;

      if (ready && !isPageReady) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsPageReady(true);
          });
        });
      }
    };

    checkPageReady();
  }, [
    currentUser,
    isGuest,
    dataLoaded,
    isLoading,
    loading,
    isPageReady,
  ]);

  // 處理 testData 更新
  useEffect(() => {
    if (testData && Object.keys(testData).length > 0) {
      logger.debug('收到測試數據:', testData);

      const testDataKey = JSON.stringify(testData);
      if (lastAppliedTestDataKeyRef.current === testDataKey) {
        return;
      }
      lastAppliedTestDataKeyRef.current = testDataKey;

      const timeoutId = setTimeout(() => {
        setUserData(prev => {
          const currentScores = prev.scores || DEFAULT_SCORES;
          const updatedScores = {
            ...currentScores,
            ...(testData.distance !== undefined && {
              cardio: testData.score || 0,
            }),
            ...(testData.squat !== undefined && {
              strength: testData.averageScore || 0,
            }),
            ...((testData.finalScore !== undefined ||
              testData.verticalJump !== undefined ||
              testData.standingLongJump !== undefined ||
              testData.sprint !== undefined) && {
              explosivePower: testData.finalScore || 0,
            }),
            ...(testData.smm !== undefined && {
              muscleMass: testData.finalScore || 0,
            }),
            ...(testData.bodyFat !== undefined && {
              bodyFat: testData.ffmiScore || 0,
            }),
          };

          logger.debug('💾 防抖後更新測試數據分數（5秒防抖）');
          return {
            ...prev,
            scores: updatedScores,
            ladderScore: prev.ladderScore || 0,
          };
        });
      }, 5000);

      if (clearTestData) {
        setTimeout(clearTestData, 6000);
      }

      return () => clearTimeout(timeoutId);
    }
  }, [testData, clearTestData, setUserData]);

  // ✅ Loading State
  if (!isPageReady) {
    return (
      <div className="user-info-v5-loader">
        <div className="user-info-v5-spinner"></div>
        <p className="user-info-v5-loading-text">{t('common.loading')}</p>
      </div>
    );
  }

  // ✅ Main Render
  return (
    <div className="user-info-v5-container">
      {/* Radar Chart Section */}
      <div
        id="radar-section"
        ref={radarSectionRef}
        className="user-info-v5-radar-section"
      >
        <RadarChartSection
          scores={userData?.scores}
          loading={isLoading || loading}
          t={t}
        />
      </div>

      {/* User Form Section */}
      {(currentUser || isGuest) && (
        <>
          <div className="user-info-v5-page-header">
            <h1 className="user-info-v5-page-title">{t('userInfo.title')}</h1>
            <div className="user-info-v5-page-subtitle">
              {t('userInfo.subtitle')}
            </div>
          </div>

          <UserFormSection
            userData={userData}
            loading={loading}
            weightReminder={weightReminder}
            currentUser={currentUser}
            onSubmit={saveData}
            onChange={handleInputChange}
            onNicknameChange={handleNicknameChange}
            onGenerateNickname={handleGenerateNickname}
            onLogout={onLogout}
            setUserData={setUserData}
            t={t}
          />
          <div ref={formSectionRef} className="user-info-v5-form-ref" />
        </>
      )}

      {error && <p className="user-info-v5-error">{error}</p>}
    </div>
  );
}

UserInfoV5.propTypes = {
  testData: PropTypes.shape({
    distance: PropTypes.number,
    score: PropTypes.number,
    squat: PropTypes.number,
    averageScore: PropTypes.number,
    jumpHeight: PropTypes.number,
    finalScore: PropTypes.number,
    smm: PropTypes.number,
    bodyFat: PropTypes.number,
    ffmiScore: PropTypes.number,
    verticalJump: PropTypes.number,
    standingLongJump: PropTypes.number,
    sprint: PropTypes.number,
  }),
  onLogout: PropTypes.func.isRequired,
  clearTestData: PropTypes.func.isRequired,
};

export default UserInfoV5;
