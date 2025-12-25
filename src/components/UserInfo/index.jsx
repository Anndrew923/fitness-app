import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../UserContext';
import { auth, db } from '../../firebase';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import { calculateLadderScore } from '../../utils';
import logger from '../../utils/logger';
import { getRPGClass } from '../../utils/rpgClassCalculator';
import SaveSuccessModal from './SaveSuccessModal';
import AvatarSection from './AvatarSection';
import RadarChartSection from './RadarChartSection/RadarChartSection';
import UserFormSection from './UserFormSection/UserFormSection';
import { useUserInfoForm } from '../../hooks/useUserInfoForm';
import { useLadderLogic } from '../../hooks/useLadderLogic';
import GeneralModal from './Modals/GeneralModal';
import RPGClassModal from './Modals/RPGClassModal';
import SubmitConfirmModal from './Modals/SubmitConfirmModal';
import { usePageScroll } from '../../hooks/usePageScroll';
import LadderStatusCard from '../Ladder/LadderStatusCard';
import { getDefaultMetric } from '../../config/rankingSystem';
import { useLadderData } from '../../hooks/useLadderData';

import './userinfo.css'; // Core layout
import './UserRadar.css';
import './UserForm.css';
import './UserModals.css';
import './UserHeader.css';
import { useTranslation } from 'react-i18next';

// 開發環境下載入調試工具
if (process.env.NODE_ENV === 'development') {
  import('../../utils/firebaseDebug.js').catch(() => {
    // 忽略導入錯誤，不影響主應用
  });
}

const DEFAULT_SCORES = {
  strength: 0,
  explosivePower: 0,
  cardio: 0,
  muscleMass: 0,
  bodyFat: 0,
};

// ✅ Phase 4: GENDER_OPTIONS 已移至 useUserInfoForm hook
// ✅ Phase 5: Modal 組件已移至 ./Modals/ 文件夾

function UserInfo({ testData, onLogout, clearTestData }) {
  const {
    userData,
    setUserData,
    saveUserData,
    saveHistory,
    loadUserData,
    isLoading,
  } = useUser();
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false); // ✅ 新增：頁面準備狀態

  // ✅ Phase 5: 使用 usePageScroll hook
  const { performanceMode } = usePageScroll();

  const navigate = useNavigate();
  const location = useLocation();
  const radarSectionRef = useRef(null);
  const testsSectionRef = useRef(null);
  const formSectionRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  // 記錄上一次應用過的 testData，避免重複觸發寫入
  const lastAppliedTestDataKeyRef = useRef(null);

  // 新增：對話框狀態
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onAction: null,
    actionText: null,
  });

  // ✅ Phase 1 新增：職業描述 Modal 狀態
  const [rpgClassModalState, setRpgClassModalState] = useState({
    isOpen: false,
    classInfo: null,
  });

  // ✅ Phase 1.9.2 新增：儲存成功 Modal 狀態
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

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
    setModalState
  );

  const submittedLadderScore = userData?.ladderScore || 0;

  const {
    userRank,
    ladderSubmissionState,
    submitConfirmModal,
    handleSubmitToLadder,
    confirmSubmitToLadder,
    cancelSubmit,
  } = useLadderLogic(
    userData,
    setUserData,
    auth,
    db,
    t,
    navigate,
    setModalState,
    submittedLadderScore
  );

  // ✅ Phase 4: 天梯相關邏輯已移至 useLadderLogic hook

  // 監聽認證狀態
  useEffect(() => {
    if (!auth) {
      setModalState({
        isOpen: true,
        title: '初始化錯誤',
        message: '無法初始化身份驗證，請檢查 Firebase 配置並稍後再試。',
        type: 'error',
      });
      logger.error('auth 未初始化');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      logger.debug('UserInfo - 認證狀態變更:', user?.email);
      setCurrentUser(user);
      if (!user && !isGuest) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, []); // 移除依賴項，認證監聽只需要在組件掛載時設置一次

  // 確保資料載入完成
  useEffect(() => {
    const checkDataLoaded = async () => {
      if (currentUser && !dataLoaded && !isLoading) {
        logger.debug('UserInfo - 檢查資料載入狀態');

        // 如果資料為空，嘗試重新載入
        if (!userData.height && !userData.weight && !userData.age) {
          logger.debug('UserInfo - 資料為空，嘗試重新載入');
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

  // ✅ Phase 5: 滾動邏輯已移至 usePageScroll hook

  // ✅ 修復：移除 Intersection Observer 的動態樣式設置，避免干擾雷達圖顯示
  // 註釋掉可能導致顏色和格式問題的動態樣式設置
  // useEffect(() => {
  //   if (radarContainerRef.current) {
  //     requestAnimationFrame(() => {
  //       requestAnimationFrame(() => {
  //         if (radarContainerRef.current) {
  //           if (isRadarVisible && performanceMode !== 'scrolling') {
  //             radarContainerRef.current.style.setProperty(
  //               '--animation-play-state',
  //               'running'
  //             );
  //             radarContainerRef.current.style.setProperty(
  //               '--backdrop-blur',
  //               '10px'
  //             );
  //           } else if (!isRadarVisible) {
  //             radarContainerRef.current.style.setProperty(
  //               '--animation-play-state',
  //               'paused'
  //             );
  //             radarContainerRef.current.style.setProperty(
  //               '--backdrop-blur',
  //               '0px'
  //             );
  //           }
  //         }
  //       });
  //     });
  //   }
  // }, [isRadarVisible, performanceMode]);

  // ✅ 新增：檢查頁面是否準備好顯示
  useEffect(() => {
    const checkPageReady = () => {
      // 檢查所有必要條件：
      // 1. 數據已載入（dataLoaded 或 guest 模式）
      // 2. 用戶認證完成（currentUser 或 guest）
      // 3. 不在載入狀態
      // ✅ 修復：移除對 radarChartData 的依賴，避免循環依賴導致頁面無法顯示
      // radarChartData 會在組件渲染時自動計算，不需要在這裡等待
      const userReady = currentUser || isGuest;
      const dataReady = dataLoaded || isGuest;
      const notLoading = !isLoading && !loading;

      const ready = userReady && dataReady && notLoading;

      // ✅ 修復 5: 一旦設置為 true，就不再設置為 false，避免頁面重新進入載入狀態
      if (ready && !isPageReady) {
        // ✅ 使用雙重 requestAnimationFrame 確保渲染完成
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsPageReady(true);
          });
        });
      }
      // ✅ 移除：不再檢查 ready === false 的情況，避免重新進入載入狀態
    };

    checkPageReady();
  }, [
    currentUser,
    isGuest,
    dataLoaded,
    isLoading,
    loading,
    // ✅ 修復：移除 radarChartData 依賴，避免循環依賴
    isPageReady,
  ]);

  // 處理從評測頁面返回時自動滾動到雷達圖
  useEffect(() => {
    // 檢查是否從評測頁面返回
    const fromTestPages = [
      '/strength',
      '/explosive-power',
      '/cardio',
      '/muscle-mass',
      '/body-fat',
    ];
    const previousPath = location.state?.from;

    if (previousPath && fromTestPages.includes(previousPath)) {
      // 延遲執行以確保頁面完全載入
      setTimeout(() => {
        if (radarSectionRef.current) {
          radarSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 300);
    }

    // 新增：根據 state.scrollTo 滾動
    const scrollTo = location.state?.scrollTo;
    if (scrollTo) {
      setTimeout(() => {
        if (scrollTo === 'radar' && radarSectionRef.current) {
          radarSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        } else if (scrollTo === 'tests' && testsSectionRef.current) {
          testsSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        } else if (scrollTo === 'form' && formSectionRef.current) {
          formSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 300);
    }
  }, [location]);

  // ✅ Phase 4: 天梯提交狀態載入和保存已移至 useLadderLogic hook

  // 處理 testData 更新
  useEffect(() => {
    if (testData && Object.keys(testData).length > 0) {
      logger.debug('收到測試數據:', testData);

      // 防止重複應用相同 testData 導致的重複 setUserData
      const testDataKey = JSON.stringify(testData);
      if (lastAppliedTestDataKeyRef.current === testDataKey) {
        return;
      }
      lastAppliedTestDataKeyRef.current = testDataKey;

      // 使用更長的防抖處理 testData 更新，避免頻繁寫入
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
            // 爆發力測試：使用 finalScore（或存在任一 power 欄位時）
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
            // 保持原有的天梯分數，不自動更新
            ladderScore: prev.ladderScore || 0,
          };
        });
      }, 5000); // 優化為5秒防抖

      // 清除 testData
      if (clearTestData) {
        setTimeout(clearTestData, 6000); // 優化為6秒
      }

      return () => clearTimeout(timeoutId);
    }
  }, [testData, clearTestData]);

  // ✅ Phase 4: validateData 和 saveData 已移至 useUserInfoForm hook

  const averageScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    const scoreValues = Object.values(scores).filter(score => score > 0);
    const avg = scoreValues.length
      ? (
          scoreValues.reduce((sum, score) => sum + Number(score), 0) /
          scoreValues.length
        ).toFixed(2)
      : 0;
    return avg;
  }, [userData?.scores]);

  // 計算當前天梯分數（用於顯示，不影響已提交的分數）
  const currentLadderScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    return calculateLadderScore(scores);
  }, [userData?.scores]);

  // ✅ Phase 4: submittedLadderScore 已在 hooks 調用處定義

  // 計算完成狀態
  const completionStatus = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    const completedCount = Object.values(scores).filter(
      score => score > 0
    ).length;
    const isFullyCompleted = completedCount === 5;

    return {
      completedCount,
      isFullyCompleted,
      progress: (completedCount / 5) * 100,
    };
  }, [userData?.scores]);

  // ✅ UP-LADDER-EVO: 使用新的通用天梯數據 Hook
  const defaultMetric = getDefaultMetric();
  const { userRank: ladderUserRank } = useLadderData({
    metricId: 'total',
    enabled: completionStatus.isFullyCompleted && !!userData?.ladderScore,
  });

  // ✅ Phase 1 新增：計算 RPG 職業
  const rpgClassInfo = useMemo(() => {
    if (!userData?.scores) {
      return null;
    }
    return getRPGClass(userData.scores, {
      weight: userData.weight,
      height: userData.height,
    });
  }, [userData?.scores, userData?.weight, userData?.height]);

  // ✅ Phase 1 新增：自動計算並保存職業
  useEffect(() => {
    if (
      rpgClassInfo &&
      rpgClassInfo.class &&
      rpgClassInfo.class !== userData?.rpg_class &&
      Object.values(userData?.scores || {}).some(score => score > 0)
    ) {
      logger.debug('🔄 自動計算職業:', rpgClassInfo.class, rpgClassInfo.name);
      setUserData({ rpg_class: rpgClassInfo.class });
    }
  }, [rpgClassInfo, userData?.rpg_class, userData?.scores, setUserData]);

  // ✅ Phase 1.9 清理：處理職業標籤點擊（保留防禦性邏輯）
  const handleRpgClassClick = useCallback(() => {
    // ✅ 防禦性檢查：即使數據不完整，也允許打開 Modal（顯示預設內容）
    if (rpgClassInfo) {
      // 確保 classInfo 有必要的屬性，如果缺失則使用預設值
      const safeClassInfo = {
        icon: rpgClassInfo.icon || '❓',
        name: rpgClassInfo.name || '未知職業',
        description: rpgClassInfo.description || '尚未覺醒的潛在力量...',
        class: rpgClassInfo.class || 'UNKNOWN',
      };

      setRpgClassModalState({
        isOpen: true,
        classInfo: safeClassInfo,
      });
    }
  }, [rpgClassInfo]);

  // ✅ Phase 1 新增：關閉職業描述 Modal
  const handleCloseRpgClassModal = useCallback(() => {
    setRpgClassModalState({
      isOpen: false,
      classInfo: null,
    });
  }, []);

  // ✅ Phase 4: fetchUserRank 和相關 useEffect 已移至 useLadderLogic hook

  // 計算年齡段
  // const ageGroup = useMemo(() => {
  //   return userData?.age ? getAgeGroup(userData.age) : '';
  // }, [userData?.age]);

  // ✅ Phase 4: handleNicknameChange 和 handleGenerateNickname 已移至 useUserInfoForm hook

  const handleSaveResults = useCallback(() => {
    if (!auth.currentUser) {
      setModalState({
        isOpen: true,
        title: '需要登入',
        message: '請先登入以儲存結果',
        type: 'warning',
      });
      return;
    }
    const record = {
      date: new Date().toLocaleDateString('zh-TW'),
      scores: userData.scores,
      averageScore: averageScore,
    };
    saveHistory(record);
    // ✅ Phase 1.9.2 修正：改用新的 SaveSuccessModal
    setShowSaveSuccess(true);
  }, [userData.scores, averageScore, saveHistory]);

  // ✅ Phase 1.9.2 新增：導航至歷史紀錄頁面
  const handleNavigateToHistory = useCallback(() => {
    setShowSaveSuccess(false);
    navigate('/history');
  }, [navigate]);

  const handleNavigation = useCallback(
    async path => {
      if (
        !userData.height ||
        !userData.weight ||
        !userData.age ||
        !userData.gender
      ) {
        setModalState({
          isOpen: true,
          title: t('userInfo.modals.basicInfoRequired.title'),
          message: t('userInfo.modals.basicInfoRequired.message'),
          type: 'warning',
        });
        return;
      }

      // ✅ Phase 4: validateData 已移至 useUserInfoForm hook
      // 暫時保留此函數，但需要從 hook 獲取驗證邏輯
      // TODO: 重構 handleNavigation 以使用 hook 的驗證邏輯
      navigate(path, { state: { from: '/user-info' } });
    },
    [userData, navigate, setModalState, t]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');

    if (auth.currentUser) {
      auth.signOut().catch(err => logger.error('登出失敗:', err));
    }

    onLogout();
    navigate('/login');
  }, [onLogout, navigate]);

  // ✅ Phase 4: handleInputChange 已移至 useUserInfoForm hook

  // 新增：頭像上傳處理 - 接收已壓縮的 blob
  const handleAvatarChange = async blob => {
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      // 上傳到 Storage
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('未登入，無法上傳頭像');

      // 添加更詳細的錯誤處理和調試信息
      logger.debug('🔧 開始上傳頭像:', { userId, fileSize: blob.size });

      const avatarRef = ref(storage, `avatars/${userId}/avatar.jpg`);
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          'uploaded-by': userId,
          'upload-time': new Date().toISOString(),
        },
      };

      await uploadBytes(avatarRef, blob, metadata);
      logger.debug('✅ 頭像上傳成功');

      const url = await getDownloadURL(avatarRef);
      logger.debug('✅ 獲取下載 URL 成功:', url);
      // 更新 Firestore - 頭像上傳需要立即保存，不使用防抖
      setUserData(prev => ({
        ...prev,
        avatarUrl: url,
        // 保持原有的天梯分數，不自動更新
        ladderScore: prev.ladderScore || 0,
      }));

      // 立即保存到 Firebase，不等待防抖
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          avatarUrl: url,
          updatedAt: new Date().toISOString(),
        });
        logger.debug('✅ 頭像已立即保存到 Firebase');

        // 顯示成功提示
        setModalState({
          isOpen: true,
          title: '頭像上傳成功',
          message: '您的頭像已成功更新！',
          type: 'success',
        });

        // 2秒後自動關閉成功對話框
        setTimeout(() => {
          setModalState(prev => ({ ...prev, isOpen: false }));
        }, 2000);
      } catch (error) {
        logger.error(
          '⚠️ 頭像保存到 Firestore 失敗（但 Storage 上傳成功）:',
          error
        );
        // 不顯示錯誤訊息，因為頭像已經成功上傳到 Storage 並可以使用
        // 只在控制台記錄錯誤，方便調試
        logger.warn(
          '💡 提示：頭像已成功上傳，但資料庫同步失敗。頭像仍可正常使用，系統將在下次更新時自動同步。'
        );

        // 仍然顯示成功提示，因為頭像實際上已經上傳成功
        setModalState({
          isOpen: true,
          title: '頭像上傳成功',
          message: '您的頭像已成功更新！',
          type: 'success',
        });

        // 2秒後自動關閉成功對話框
        setTimeout(() => {
          setModalState(prev => ({ ...prev, isOpen: false }));
        }, 2000);
      }
    } catch (err) {
      setAvatarError('頭像上傳失敗: ' + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  // ✅ 修改：顯示全屏載入動畫，直到頁面準備好
  if (!isPageReady) {
    return (
      <div className="user-info-container page-loading">
        <div className="full-page-loader">
          <div className="loading-spinner-large"></div>
          <p className="loading-text">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // ✅ 修改：頁面準備好後，一次性顯示所有內容（帶淡入動畫）
  // ✅ 修復：強制設置 opacity 確保內容可見，避免動畫未執行時內容不可見
  return (
    <div
      className={`user-info-container page-ready performance-mode-${performanceMode}`}
      style={{ opacity: 1 }}
    >
      {/* 右上角設定按鈕 */}
      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="user-info__settings-btn"
        aria-label={t('navbar.settings')}
        title={t('navbar.settings')}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      {/* 對話框組件 */}
      <GeneralModal
        isOpen={modalState.isOpen}
        onClose={() => {
          logger.debug('Modal onClose triggered, current state:', modalState);
          setModalState(prev => {
            logger.debug('Setting modal state to closed');
            return { ...prev, isOpen: false };
          });
        }}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onAction={modalState.onAction}
        actionText={modalState.actionText}
      />

      {/* ✅ Phase 1.8 修正：職業描述 Modal - 使用條件渲染確保完全移除 DOM */}
      {rpgClassModalState.isOpen && (
        <RPGClassModal
          isOpen={rpgClassModalState.isOpen}
          onClose={handleCloseRpgClassModal}
          classInfo={rpgClassModalState.classInfo}
        />
      )}

      {/* ✅ Phase 1.9.2 新增：儲存成功 Modal */}
      <SaveSuccessModal
        isOpen={showSaveSuccess}
        onClose={() => setShowSaveSuccess(false)}
        onNavigate={handleNavigateToHistory}
      />

      {/* 移除儀式感動畫粒子效果 */}

      {/* 移除分數提升動畫 */}

      {error && <p className="error-message">{error}</p>}

      {/* ✅ UP-LADDER-EVO: 頂部身份區 */}
      <div className="user-info-identity">
        {/* 頭像 */}
        <AvatarSection
          avatarUrl={isGuest ? '/guest-avatar.svg' : userData?.avatarUrl}
          isGuest={isGuest}
          isUploading={avatarUploading}
          onImageSelected={handleAvatarChange}
          onError={setAvatarError}
          t={t}
        />

        {/* 名字 */}
        <h2 className="user-info-name">
          {userData?.nickname || userData?.email?.split('@')[0] || '用戶'}
        </h2>

        {/* 職業標籤 */}
        {rpgClassInfo && rpgClassInfo.class !== 'UNKNOWN' && (
          <div className="rpg-class-badge-inline" onClick={handleRpgClassClick}>
            <span className="rpg-class-badge-icon">{rpgClassInfo.icon}</span>
            <span className="rpg-class-badge-name">
              {t(
                `userInfo.classDescription.${rpgClassInfo.class.toLowerCase()}.title`
              )}
            </span>
          </div>
        )}
      </div>

      {/* ✅ UP-LADDER-EVO: 戰力資訊條 */}
      {completionStatus.isFullyCompleted && userData?.ladderScore > 0 && (
        <div className="ladder-status-wrapper">
          <LadderStatusCard
            userData={userData}
            rank={ladderUserRank || userRank}
            onNavigate={() => navigate('/ladder')}
          />
        </div>
      )}

      {/* ✅ UP-LADDER-EVO: 核心視覺 - 雷達圖 */}
      <div id="radar-section" ref={radarSectionRef}>
        <RadarChartSection
          scores={userData?.scores}
          loading={isLoading || loading}
          t={t}
        />
      </div>

      {/* ✅ UP-LADDER-EVO: 操作工具列 - 圖標按鈕組 */}
      <div className="action-toolbar">
        {averageScore > 0 && (
          <button
            onClick={handleSaveResults}
            className="action-toolbar-btn"
            disabled={loading}
            title={t('userInfo.saveResults')}
          >
            <span className="action-toolbar-icon">💾</span>
            <span className="action-toolbar-label">
              {t('userInfo.saveResults')}
            </span>
          </button>
        )}

        {completionStatus.isFullyCompleted && (
          <button
            onClick={handleSubmitToLadder}
            className="action-toolbar-btn"
            disabled={loading}
            title={
              submittedLadderScore > 0
                ? t('userInfo.updateLadderScore')
                : t('userInfo.submitToLadder')
            }
          >
            <span className="action-toolbar-icon">🏆</span>
            <span className="action-toolbar-label">
              {submittedLadderScore > 0
                ? t('userInfo.updateLadderScore')
                : t('userInfo.submitToLadder')}
            </span>
          </button>
        )}

        {submittedLadderScore > 0 && (
          <button
            onClick={() => navigate('/verification')}
            className="action-toolbar-btn"
            disabled={loading}
            title={t('userInfo.getVerification')}
          >
            <span className="action-toolbar-icon">🏅</span>
            <span className="action-toolbar-label">
              {t('userInfo.getVerification')}
            </span>
          </button>
        )}
      </div>

      {/* 保留 UserFormSection */}
      {(currentUser || isGuest) && (
        <>
          <div className="page-header">
            <h1 className="page-title">{t('userInfo.title')}</h1>
            <div className="page-subtitle">{t('userInfo.subtitle')}</div>
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
            onLogout={handleLogout}
            setUserData={setUserData}
            t={t}
          />
          {/* 保留 formSectionRef 用於滾動定位 */}
          <div ref={formSectionRef} style={{ display: 'none' }} />
        </>
      )}

      {/* 提交確認對話框 */}
      {submitConfirmModal.isOpen && (
        <SubmitConfirmModal
          isOpen={submitConfirmModal.isOpen}
          onConfirm={confirmSubmitToLadder}
          onCancel={cancelSubmit}
          remainingCount={submitConfirmModal.remainingCount}
        />
      )}
    </div>
  );
}

UserInfo.propTypes = {
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

export default React.memo(UserInfo);
