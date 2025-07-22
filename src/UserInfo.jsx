import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { auth, db } from './firebase';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  updateDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import PropTypes from 'prop-types';
import {
  calculateLadderScore,
  getAgeGroup,
  validateNickname,
  generateNickname,
} from './utils';

import './userinfo.css';

const DEFAULT_SCORES = {
  strength: 0,
  explosivePower: 0,
  cardio: 0,
  muscleMass: 0,
  bodyFat: 0,
};

const GENDER_OPTIONS = ['male', 'female'];

// 新增：對話框組件
const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onAction = null,
  actionText = null,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'warning':
        return 'modal-btn modal-btn-warning';
      case 'success':
        return 'modal-btn modal-btn-success';
      case 'error':
        return 'modal-btn modal-btn-error';
      default:
        return 'modal-btn modal-btn-info';
    }
  };

  const handleClose = () => {
    console.log('Modal close button clicked');
    onClose();
  };

  const handleOverlayClick = () => {
    console.log('Modal overlay clicked');
    onClose();
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">{getIcon()}</span>
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-footer">
          {onAction && actionText ? (
            <div className="modal-footer-actions">
              <button
                className="modal-btn modal-btn-secondary"
                onClick={handleClose}
              >
                稍後查看
              </button>
              <button
                className={getButtonClass()}
                onClick={handleAction}
                style={{ position: 'relative', zIndex: 10001 }}
              >
                {actionText}
              </button>
            </div>
          ) : (
            <button
              className={getButtonClass()}
              onClick={handleClose}
              style={{ position: 'relative', zIndex: 10001 }}
            >
              確定
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 新增：提交確認對話框組件
const SubmitConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  remainingCount,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="modal-overlay submit-confirm-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="modal-content submit-confirm-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-icon">🏆</span>
          <h3 className="modal-title">提交確認</h3>
        </div>
        <div className="modal-body">
          <div className="submit-confirm-message">
            <p className="confirm-text">
              為提升天梯參考價值，防止誤植，今天還剩下{' '}
              <span className="remaining-count">{remainingCount}</span>{' '}
              次提交機會，每天凌晨12點將重置
            </p>
            <div className="confirm-details">
              <div className="detail-item">
                <span className="detail-icon">📊</span>
                <span className="detail-text">確保數據準確性</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">⏰</span>
                <span className="detail-text">每日凌晨重置次數</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🎯</span>
                <span className="detail-text">提升天梯參考價值</span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer submit-confirm-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onCancel}>
            還沒填好
          </button>
          <button className="modal-btn modal-btn-success" onClick={onConfirm}>
            確定提交
          </button>
        </div>
      </div>
    </div>
  );
};

// 移除儀式感動畫系統

// 新增：圖片壓縮工具
async function compressImage(
  file,
  maxSize = 300 * 1024,
  maxWidth = 192,
  maxHeight = 192
) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => {
          if (blob.size > maxSize) {
            // 再壓縮一次
            canvas.toBlob(
              blob2 => {
                resolve(blob2);
              },
              'image/jpeg',
              0.7
            );
          } else {
            resolve(blob);
          }
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function UserInfo({ testData, onLogout, clearTestData }) {
  const {
    userData,
    setUserData,
    saveUserData,
    saveHistory,
    loadUserData,
    isLoading,
  } = useUser();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const radarSectionRef = useRef(null);
  const testsSectionRef = useRef(null);
  const nicknameTimeoutRef = useRef(null); // 新增：暱稱輸入防抖定時器
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  // 新增：對話框狀態
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onAction: null,
    actionText: null,
  });

  // 移除動畫系統，簡化狀態管理
  const [userRank, setUserRank] = useState(null);

  // 新增：天梯提交相關狀態
  const [ladderSubmissionState, setLadderSubmissionState] = useState({
    lastSubmissionTime: null,
    dailySubmissionCount: 0,
    lastSubmissionDate: null,
  });

  // 新增：提交確認對話框狀態
  const [submitConfirmModal, setSubmitConfirmModal] = useState({
    isOpen: false,
    remainingCount: 3, // 暫時固定為3次，之後會動態計算
  });

  // 新增：檢查天梯提交限制
  const checkLadderSubmissionLimit = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();

    // 檢查是否是新的一天
    if (ladderSubmissionState.lastSubmissionDate !== today) {
      setLadderSubmissionState(prev => ({
        ...prev,
        dailySubmissionCount: 0,
        lastSubmissionDate: today,
      }));
      return { canSubmit: true, reason: null };
    }

    // 檢查每日限制
    if (ladderSubmissionState.dailySubmissionCount >= 3) {
      return {
        canSubmit: false,
        reason: '今日已達提交上限（3次），請明天再試',
      };
    }

    // 檢查冷卻時間
    if (ladderSubmissionState.lastSubmissionTime) {
      const timeDiff = now - ladderSubmissionState.lastSubmissionTime;
      const cooldownHours = 2;
      const cooldownMs = cooldownHours * 60 * 60 * 1000;

      if (timeDiff < cooldownMs) {
        const remainingMinutes = Math.ceil(
          (cooldownMs - timeDiff) / (60 * 1000)
        );
        return {
          canSubmit: false,
          reason: `請等待 ${remainingMinutes} 分鐘後再提交`,
        };
      }
    }

    return { canSubmit: true, reason: null };
  }, [ladderSubmissionState]);

  // 新增：顯示提交確認對話框
  const showSubmitConfirmModal = useCallback(() => {
    // 暫時不啟用實際限制，直接顯示確認對話框
    const remainingCount =
      3 - (ladderSubmissionState.dailySubmissionCount || 0);
    setSubmitConfirmModal({
      isOpen: true,
      remainingCount: Math.max(0, remainingCount),
    });
  }, [ladderSubmissionState.dailySubmissionCount]);

  // 新增：確認提交到天梯
  const confirmSubmitToLadder = useCallback(async () => {
    // 關閉確認對話框
    setSubmitConfirmModal({ isOpen: false, remainingCount: 0 });

    // 防止重複提交
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      // 計算天梯分數
      const scores = userData.scores || {};
      const ladderScore = calculateLadderScore(scores);

      // 更新用戶數據，明確設置天梯分數和提交時間
      const updatedUserData = {
        ...userData,
        ladderScore: ladderScore,
        lastLadderSubmission: new Date().toISOString(),
      };

      // 立即更新本地狀態
      setUserData(updatedUserData);

      // 立即保存到 Firebase，不等待防抖
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(
          userRef,
          {
            ladderScore: ladderScore,
            lastLadderSubmission: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        console.log('天梯分數已立即保存到 Firebase:', ladderScore);
      } catch (error) {
        console.error('保存天梯分數到 Firebase 失敗:', error);
        throw error;
      }

      // 更新提交狀態
      const now = new Date();
      setLadderSubmissionState(prev => ({
        lastSubmissionTime: now,
        dailySubmissionCount: prev.dailySubmissionCount + 1,
        lastSubmissionDate: now.toDateString(),
      }));

      // 顯示成功訊息
      setModalState({
        isOpen: true,
        title: '提交成功',
        message: `您的分數 ${ladderScore} 已成功提交到天梯！`,
        type: 'success',
        onAction: () => {
          // 關閉對話框
          setModalState(prev => ({ ...prev, isOpen: false }));

          // 導航到天梯頁面時，傳遞強制重新載入的標記
          navigate('/ladder', {
            state: {
              forceReload: true,
              from: '/user-info',
              timestamp: Date.now(), // 添加時間戳確保每次都是新的
            },
          });
        },
        actionText: '立即查看天梯',
      });

      // 5秒後自動關閉成功對話框（給用戶時間選擇）
      setTimeout(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
      }, 5000);
    } catch (error) {
      console.error('提交到天梯失敗:', error);
      setModalState({
        isOpen: true,
        title: '提交失敗',
        message: '提交到天梯時發生錯誤，請稍後再試',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [userData.scores, setUserData, loading, navigate]);

  // 新增：取消提交
  const cancelSubmit = useCallback(() => {
    setSubmitConfirmModal({ isOpen: false, remainingCount: 0 });
  }, []);

  // 新增：提交到天梯（修改為顯示確認對話框）
  const handleSubmitToLadder = useCallback(async () => {
    if (!auth.currentUser) {
      setModalState({
        isOpen: true,
        title: '需要登入',
        message: '請先登入以提交到天梯',
        type: 'warning',
      });
      return;
    }

    // 檢查是否完成全部評測
    const scores = userData.scores || {};
    const completedCount = Object.values(scores).filter(
      score => score > 0
    ).length;

    if (completedCount < 5) {
      setModalState({
        isOpen: true,
        title: '評測未完成',
        message: `請先完成全部5項評測（目前完成 ${completedCount}/5 項）`,
        type: 'warning',
      });
      return;
    }

    // 暫時不啟用實際限制檢查，直接顯示確認對話框
    // const { canSubmit, reason } = checkLadderSubmissionLimit();
    // if (!canSubmit) {
    //   setModalState({
    //     isOpen: true,
    //     title: '提交限制',
    //     message: reason,
    //     type: 'warning',
    //   });
    //   return;
    // }

    // 顯示提交確認對話框
    showSubmitConfirmModal();
  }, [userData, showSubmitConfirmModal]);

  const radarChartData = useMemo(() => {
    const scores = userData.scores || DEFAULT_SCORES;
    return [
      {
        name: '力量',
        value: scores.strength ? Number(scores.strength).toFixed(1) * 1 : 0,
        icon: '💪',
      },
      {
        name: '爆發力',
        value: scores.explosivePower
          ? Number(scores.explosivePower).toFixed(1) * 1
          : 0,
        icon: '⚡',
      },
      {
        name: '心肺耐力',
        value: scores.cardio ? Number(scores.cardio).toFixed(1) * 1 : 0,
        icon: '❤️',
      },
      {
        name: '骨骼肌肉量',
        value: scores.muscleMass ? Number(scores.muscleMass).toFixed(1) * 1 : 0,
        icon: '🥩',
      },
      {
        name: 'FFMI',
        value: scores.bodyFat ? Number(scores.bodyFat).toFixed(1) * 1 : 0,
        icon: '📊',
      },
    ];
  }, [userData.scores]);

  const isGuest = sessionStorage.getItem('guestMode') === 'true';

  // 自定義軸標籤組件
  const CustomAxisTick = ({ payload, x, y, textAnchor }) => {
    const data = radarChartData.find(item => item.name === payload.value);

    // 計算調整後的位置 - 使用相對偏移而不是固定像素值
    let adjustedX = x;
    let adjustedY = y;

    // 計算從中心到當前點的距離，用於相對偏移
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);

    // 力量標籤特殊處理：移到正上方
    if (payload.value === '力量') {
      // 使用相對位置，保持在正上方
      adjustedX = x; // 保持原始x位置
      adjustedY = y - distance * 0.12; // 使用距離的12%作為向上偏移
    } else if (payload.value === '爆發力') {
      // 爆發力標籤微調：稍微往左、往上移動
      adjustedX = x + Math.cos(angle) * (distance * 0.03); // 減少到3%
      adjustedY = y + Math.sin(angle) * (distance * 0.06); // 減少到6%
    } else if (payload.value === 'FFMI') {
      // FFMI標籤微調：遠離雷達圖
      adjustedX = x + Math.cos(angle) * (distance * -0.2); // 減少到-20%
      adjustedY = y + Math.sin(angle) * (distance * 0.06); // 保持6%
    } else if (payload.value === '心肺耐力') {
      // 心肺耐力標籤：保持不變
      adjustedX = x + Math.cos(angle) * (distance * 0.01); // 保持1%
      adjustedY = y + Math.sin(angle) * (distance * 0.06); // 保持6%
    } else if (payload.value === '骨骼肌肉量') {
      // 骨骼肌肉量標籤：遠離雷達圖
      adjustedX = x + Math.cos(angle) * (distance * -0.05); // 調整到-5%
      adjustedY = y + Math.sin(angle) * (distance * 0.06); // 保持6%
    } else {
      // 其他標籤增加小幅偏移，避免重疊雷達圖
      adjustedX = x + Math.cos(angle) * (distance * 0.1); // 使用距離的10%作為偏移
      adjustedY = y + Math.sin(angle) * (distance * 0.1);
    }

    return (
      <g transform={`translate(${adjustedX},${adjustedY})`}>
        {/* 圖標背景圓圈 - 更精緻的設計 */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* 外圈光暈 */}
        <circle
          cx={0}
          cy={0}
          r={16}
          fill="rgba(129, 216, 208, 0.1)"
          filter="url(#glow)"
        />
        {/* 主圓圈 */}
        <circle
          cx={0}
          cy={0}
          r={14}
          fill="rgba(255, 255, 255, 0.95)"
          stroke="rgba(129, 216, 208, 0.4)"
          strokeWidth={2}
          filter="drop-shadow(0 2px 4px rgba(129, 216, 208, 0.2))"
        />

        {/* 圖標 - 垂直排列上方 */}
        <text
          x={0}
          y={-8}
          textAnchor="middle"
          fill="#4a5568"
          fontSize="16"
          fontWeight="600"
          dominantBaseline="middle"
          filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))"
        >
          {data?.icon}
        </text>
        {/* 標籤文字 - 垂直排列下方 */}
        <text
          x={0}
          y={12}
          textAnchor="middle"
          fill="#2d3748"
          fontSize="13"
          fontWeight="700"
          dominantBaseline="middle"
          filter="drop-shadow(0 1px 3px rgba(255, 255, 255, 0.9))"
        >
          {payload.value}
        </text>
      </g>
    );
  };
  // 監聽認證狀態
  useEffect(() => {
    if (!auth) {
      setError('無法初始化身份驗證，請檢查 Firebase 配置並稍後再試。');
      console.error('auth 未初始化');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('UserInfo - 認證狀態變更:', user?.email);
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
        console.log('UserInfo - 檢查資料載入狀態');

        // 如果資料為空，嘗試重新載入
        if (!userData.height && !userData.weight && !userData.age) {
          console.log('UserInfo - 資料為空，嘗試重新載入');
          await loadUserData();
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
        }
      }, 300);
    }
  }, [location]);

  // 初始化天梯提交狀態
  useEffect(() => {
    const loadSubmissionState = () => {
      try {
        const savedState = localStorage.getItem('ladderSubmissionState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // 檢查是否是新的一天，如果是則重置計數
          const today = new Date().toDateString();
          if (parsedState.lastSubmissionDate !== today) {
            setLadderSubmissionState({
              lastSubmissionTime: null,
              dailySubmissionCount: 0,
              lastSubmissionDate: today,
            });
          } else {
            setLadderSubmissionState(parsedState);
          }
        }
      } catch (error) {
        console.error('載入提交狀態失敗:', error);
      }
    };

    loadSubmissionState();
  }, []);

  // 保存天梯提交狀態到localStorage
  useEffect(() => {
    if (ladderSubmissionState.lastSubmissionDate) {
      localStorage.setItem(
        'ladderSubmissionState',
        JSON.stringify(ladderSubmissionState)
      );
    }
  }, [ladderSubmissionState]);

  // 處理 testData 更新
  useEffect(() => {
    if (testData && Object.keys(testData).length > 0) {
      console.log('收到測試數據:', testData);

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
            ...(testData.jumpHeight !== undefined && {
              explosivePower: testData.finalScore || 0,
            }),
            ...(testData.smm !== undefined && {
              muscleMass: testData.finalScore || 0,
            }),
            ...(testData.bodyFat !== undefined && {
              bodyFat: testData.ffmiScore || 0,
            }),
          };

          console.log('💾 防抖後更新測試數據分數（10秒防抖）');
          return {
            ...prev,
            scores: updatedScores,
            // 保持原有的天梯分數，不自動更新
            ladderScore: prev.ladderScore || 0,
          };
        });

        // 移除 previousScores 更新，因為該狀態變量未定義
      }, 10000); // 增加到10秒防抖

      // 清除 testData
      if (clearTestData) {
        setTimeout(clearTestData, 11000); // 延長到11秒
      }

      return () => clearTimeout(timeoutId);
    }
  }, [testData, clearTestData]);

  const validateData = useCallback(() => {
    const { height, weight, age, gender } = userData;
    if (!height || !weight || !age || !gender) {
      setError('請填寫所有欄位');
      return false;
    }
    if (height <= 0 || weight <= 0 || age <= 0) {
      setError('身高、體重和年齡必須大於 0');
      return false;
    }
    if (!GENDER_OPTIONS.includes(gender)) {
      setError('請選擇有效的性別');
      return false;
    }
    return true;
  }, [userData.height, userData.weight, userData.age, userData.gender]);

  const saveData = useCallback(
    async e => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      if (!validateData()) {
        setLoading(false);
        return;
      }

      const updatedUserData = {
        ...userData,
        height: Number(userData.height) || 0,
        weight: Number(userData.weight) || 0,
        age: Number(userData.age) || 0,
        gender: userData.gender,
        scores: userData.scores || DEFAULT_SCORES,
        // 保持原有的天梯分數，不自動更新
        ladderScore: userData.ladderScore || 0,
        lastActive: new Date().toISOString(),
      };

      try {
        // 使用 setUserData 而不是直接 saveUserData，讓防抖機制生效
        setUserData(updatedUserData);

        setModalState({
          isOpen: true,
          title: '儲存成功',
          message: '資料已儲存成功！',
          type: 'success',
        });
      } catch (err) {
        if (isGuest) {
          setModalState({
            isOpen: true,
            title: '訪客模式',
            message: '訪客模式下無法保存到雲端，但您現在可以開始進行評測了！',
            type: 'info',
          });
        } else {
          setModalState({
            isOpen: true,
            title: '儲存失敗',
            message: `儲存失敗：${err.message}`,
            type: 'error',
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [
      userData.height,
      userData.weight,
      userData.age,
      userData.gender,
      userData.scores,
      userData.ladderScore,
      validateData,
      isGuest,
    ]
  );

  const averageScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    const scoreValues = Object.values(scores).filter(score => score > 0);
    const avg = scoreValues.length
      ? (
          scoreValues.reduce((sum, score) => sum + Number(score), 0) /
          scoreValues.length
        ).toFixed(1)
      : 0;
    return avg;
  }, [userData?.scores]);

  // 計算當前天梯分數（用於顯示，不影響已提交的分數）
  const currentLadderScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    return calculateLadderScore(scores);
  }, [userData?.scores]);

  // 獲取已提交的天梯分數
  const submittedLadderScore = userData?.ladderScore || 0;

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

  // 獲取用戶排名（基於已提交的天梯分數）
  const fetchUserRank = useCallback(async () => {
    if (
      !userData?.userId ||
      !submittedLadderScore ||
      submittedLadderScore <= 0
    ) {
      setUserRank(null);
      return;
    }

    try {
      // 獲取前100名用戶
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('ladderScore', '>', 0),
        orderBy('ladderScore', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.ladderScore > 0) {
          users.push({
            id: doc.id,
            ...userData,
          });
        }
      });

      // 找到用戶的排名
      const userIndex = users.findIndex(user => user.id === userData.userId);
      if (userIndex !== -1) {
        setUserRank(userIndex + 1);
      } else {
        // 如果用戶不在前100名，設置為未上榜
        setUserRank(null);
      }
    } catch (error) {
      console.error('獲取用戶排名失敗:', error);
      setUserRank(null);
    }
  }, [userData?.userId, submittedLadderScore]);

  // 當用戶數據或完成狀態改變時，獲取用戶排名
  useEffect(() => {
    fetchUserRank();
  }, [fetchUserRank]);

  // 計算年齡段
  const ageGroup = useMemo(() => {
    return userData?.age ? getAgeGroup(userData.age) : '';
  }, [userData?.age]);

  // 處理暱稱變更
  const handleNicknameChange = useCallback(
    e => {
      const nickname = e.target.value;

      // 立即更新本地狀態，提供即時反饋
      setUserData(prev => ({
        ...prev,
        nickname: nickname,
      }));

      // 清除之前的定時器
      if (nicknameTimeoutRef.current) {
        clearTimeout(nicknameTimeoutRef.current);
      }

      // 設置新的防抖定時器，延遲保存到 Firebase
      nicknameTimeoutRef.current = setTimeout(() => {
        nicknameTimeoutRef.current = null;
      }, 1000); // 增加到1秒防抖，減少寫入頻率
    },
    [setUserData]
  );

  // 生成預設暱稱
  const handleGenerateNickname = () => {
    const email = auth.currentUser?.email;
    const generatedNickname = generateNickname(email);
    setUserData(prev => ({
      ...prev,
      nickname: generatedNickname,
      // 保持原有的天梯分數，不自動更新
      ladderScore: prev.ladderScore || 0,
    }));
  };

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
    setModalState({
      isOpen: true,
      title: '儲存成功',
      message: '結果已儲存',
      type: 'success',
    });

    // 2秒後自動關閉成功對話框
    setTimeout(() => {
      setModalState(prev => ({ ...prev, isOpen: false }));
    }, 2000);
  }, [userData.scores, averageScore, saveHistory]);

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
          title: '需要基本資料',
          message: '請先填寫並儲存您的身高、體重、年齡和性別，才能開始評測！',
          type: 'warning',
        });
        return;
      }

      if (validateData()) {
        // 傳遞當前路徑作為狀態，以便返回時知道從哪裡來
        navigate(path, { state: { from: '/user-info' } });
      } else {
        setModalState({
          isOpen: true,
          title: '資料未保存',
          message: '請確保資料已正確保存後再進行評測！',
          type: 'warning',
        });
      }
    },
    [
      userData.height,
      userData.weight,
      userData.age,
      userData.gender,
      validateData,
      navigate,
    ]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');

    if (auth.currentUser) {
      auth.signOut().catch(err => console.error('登出失敗:', err));
    }

    onLogout();
    navigate('/login');
  }, [onLogout, navigate]);

  // 處理輸入變更
  const handleInputChange = useCallback(
    e => {
      const { name, value } = e.target;
      let processedValue = value;

      // 處理不同類型的欄位
      if (name === 'gender') {
        // 性別欄位保持字符串
        processedValue = value;
      } else if (['profession'].includes(name)) {
        // 職業欄位保持字符串
        processedValue = value;
      } else if (['weeklyTrainingHours', 'trainingYears'].includes(name)) {
        // 訓練相關數字欄位
        processedValue = value === '' ? '' : Number(value);
      } else {
        // 其他數字欄位
        processedValue = value === '' ? 0 : Number(value);
      }

      setUserData(prev => ({
        ...prev,
        [name]: processedValue,
        // 保持原有的天梯分數，不自動更新
        ladderScore: prev.ladderScore || 0,
      }));
    },
    [setUserData]
  );

  // 新增：頭像上傳處理
  const handleAvatarChange = async e => {
    setAvatarError(null);
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('請選擇圖片檔案');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('圖片大小請勿超過 2MB');
      return;
    }
    setAvatarUploading(true);
    try {
      // 壓縮圖片
      const compressed = await compressImage(file, 300 * 1024, 192, 192);
      if (compressed.size > 350 * 1024) {
        setAvatarError('壓縮後圖片仍超過 350KB，請選擇更小的圖片');
        setAvatarUploading(false);
        return;
      }
      // 上傳到 Storage
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('未登入，無法上傳頭像');
      const avatarRef = ref(storage, `avatars/${userId}/avatar.jpg`);
      await uploadBytes(avatarRef, compressed, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(avatarRef);
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
        console.log('頭像已立即保存到 Firebase');

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
        console.error('頭像保存到 Firebase 失敗:', error);
        setAvatarError('頭像保存失敗: ' + error.message);
      }
    } catch (err) {
      setAvatarError('頭像上傳失敗: ' + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  // 顯示載入中狀態
  if (isLoading && !dataLoaded) {
    return (
      <div className="user-info-container">
        <div className="loading-message">
          <p>正在載入用戶資料...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-container">
      {/* 對話框組件 */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => {
          console.log('Modal onClose triggered, current state:', modalState);
          setModalState(prev => {
            console.log('Setting modal state to closed');
            return { ...prev, isOpen: false };
          });
        }}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onAction={modalState.onAction}
        actionText={modalState.actionText}
      />

      {/* 提交確認對話框 */}
      <SubmitConfirmModal
        isOpen={submitConfirmModal.isOpen}
        onConfirm={confirmSubmitToLadder}
        onCancel={cancelSubmit}
        remainingCount={submitConfirmModal.remainingCount}
      />

      {/* 移除儀式感動畫粒子效果 */}

      {/* 移除分數提升動畫 */}

      {error && <p className="error-message">{error}</p>}

      {/* 頭像區域 - 美化設計 */}
      <div className="avatar-section">
        <div className="avatar-container">
          <img
            src={
              isGuest
                ? '/guest-avatar.svg'
                : userData?.avatarUrl || '/logo192.png'
            }
            alt="頭像"
            className="user-avatar"
          />
        </div>

        <div className="avatar-actions-container">
          {!isGuest && (
            <label className="avatar-upload-label">
              {avatarUploading ? '上傳中...' : '更換頭像'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
            </label>
          )}
          {isGuest && (
            <div className="guest-avatar-note">
              <span>訪客模式</span>
            </div>
          )}
        </div>

        {avatarError && <div className="avatar-error">{avatarError}</div>}
      </div>

      {/* 只保留 currentUser 狀態區塊，移除載入提示 */}
      {(currentUser || isGuest) && (
        <>
          <div className="page-header">
            <h1 className="page-title">身體狀態與表現總覽</h1>
            <div className="page-subtitle">完善您的個人資料，開始健身之旅</div>
          </div>

          <div className="form-card">
            <form className="user-form" onSubmit={saveData}>
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">基本資料</h3>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="登出"
                      className="logout-btn"
                      onMouseEnter={e => {
                        const tooltip = document.createElement('div');
                        tooltip.innerText = '登出';
                        tooltip.style.position = 'absolute';
                        tooltip.style.bottom = '44px';
                        tooltip.style.left = '50%';
                        tooltip.style.transform = 'translateX(-50%)';
                        tooltip.style.background = 'rgba(60,60,60,0.95)';
                        tooltip.style.color = '#fff';
                        tooltip.style.padding = '6px 14px';
                        tooltip.style.borderRadius = '6px';
                        tooltip.style.fontSize = '13px';
                        tooltip.style.whiteSpace = 'nowrap';
                        tooltip.style.pointerEvents = 'none';
                        tooltip.style.zIndex = '1001';
                        tooltip.className = 'logout-tooltip';
                        e.currentTarget.parentNode.appendChild(tooltip);
                      }}
                      onMouseLeave={e => {
                        const tooltip =
                          e.currentTarget.parentNode.querySelector(
                            '.logout-tooltip'
                          );
                        if (tooltip) tooltip.remove();
                      }}
                    >
                      <span className="logout-icon">⎋</span>
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="nickname" className="form-label">
                    暱稱
                  </label>
                  <div className="nickname-input-group">
                    <input
                      id="nickname"
                      name="nickname"
                      type="text"
                      value={userData?.nickname || ''}
                      onChange={handleNicknameChange}
                      placeholder="請輸入暱稱"
                      className="form-input"
                      maxLength="20"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateNickname}
                      className="generate-nickname-btn"
                    >
                      生成暱稱
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gender" className="form-label">
                      性別
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={userData?.gender || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">請選擇性別</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="age" className="form-label">
                      年齡
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      value={userData?.age || ''}
                      onChange={handleInputChange}
                      placeholder="年齡"
                      className="form-input"
                      required
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="height" className="form-label">
                      身高 (cm)
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      value={userData?.height || ''}
                      onChange={handleInputChange}
                      placeholder="身高 (cm)"
                      className="form-input"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight" className="form-label">
                      體重 (kg)
                    </label>
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      value={userData?.weight || ''}
                      onChange={handleInputChange}
                      placeholder="體重 (kg)"
                      className="form-input"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* 天梯隱私設置 */}
              <div className="form-section">
                <h3 className="section-title">🏆 天梯排行榜設置</h3>
                <div className="privacy-options">
                  <label className="privacy-option">
                    <input
                      type="checkbox"
                      checked={userData.isAnonymousInLadder === true}
                      onChange={e =>
                        setUserData(prev => ({
                          ...prev,
                          isAnonymousInLadder: e.target.checked,
                        }))
                      }
                    />
                    <div className="privacy-option-content">
                      <span className="privacy-option-title">
                        匿名參與天梯排名
                      </span>
                      <span className="privacy-option-desc">
                        勾選後將隱藏您的暱稱和頭像，以匿名方式顯示在排行榜中
                      </span>
                    </div>
                  </label>
                </div>

                {/* 訓練背景信息（選填） */}
                <div className="training-info-section">
                  <h4 className="training-info-title">💪 訓練背景（選填）</h4>
                  <p className="training-info-desc">
                    分享您的訓練背景，激勵其他健身愛好者！
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="profession" className="form-label">
                        職業
                      </label>
                      <input
                        id="profession"
                        name="profession"
                        type="text"
                        value={userData?.profession || ''}
                        onChange={handleInputChange}
                        placeholder="例如：工程師、學生、教師..."
                        className="form-input"
                        maxLength="100"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="weeklyTrainingHours"
                        className="form-label"
                      >
                        每周訓練時數
                      </label>
                      <input
                        id="weeklyTrainingHours"
                        name="weeklyTrainingHours"
                        type="number"
                        value={userData?.weeklyTrainingHours || ''}
                        onChange={handleInputChange}
                        placeholder="小時"
                        className="form-input"
                        min="0"
                        max="168"
                        step="0.5"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="trainingYears" className="form-label">
                      訓練年資
                    </label>
                    <input
                      id="trainingYears"
                      name="trainingYears"
                      type="number"
                      value={userData?.trainingYears || ''}
                      onChange={handleInputChange}
                      placeholder="年"
                      className="form-input"
                      min="0"
                      max="50"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? '儲存中...' : '儲存資料'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* 雷達圖區域 */}
      <div id="radar-section" className="radar-section" ref={radarSectionRef}>
        <div className="radar-card">
          {/* 裝飾性角落元素 */}
          <div className="corner-decoration top-left"></div>
          <div className="corner-decoration top-right"></div>
          <div className="corner-decoration bottom-left"></div>
          <div className="corner-decoration bottom-right"></div>

          <h2 className="radar-title">表現總覽</h2>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>正在載入數據...</p>
            </div>
          ) : (
            <div className="radar-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarChartData}>
                  <PolarGrid
                    gridType="polygon"
                    stroke="rgba(129, 216, 208, 0.25)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={<CustomAxisTick />}
                    axisLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tickCount={5}
                    tick={{
                      fontSize: 12,
                      fill: '#2d3748',
                      fontWeight: 600,
                    }}
                    axisLine={false}
                  />
                  <Radar
                    name="您的表現"
                    dataKey="value"
                    stroke="#81D8D0"
                    fill="url(#tiffanyGradient)"
                    fillOpacity={0.8}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient
                      id="tiffanyGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#81D8D0" stopOpacity={0.9} />
                      <stop
                        offset="50%"
                        stopColor="#5F9EA0"
                        stopOpacity={0.7}
                      />
                      <stop
                        offset="100%"
                        stopColor="#81D8D0"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 分數顯示區域 */}
          {!loading && (
            <div className="score-section">
              {/* 平均分數 */}
              {averageScore > 0 && (
                <div className="average-score-display">
                  <p className="average-score">
                    ⭐ 戰鬥力{' '}
                    <span className="score-value-large">{averageScore}</span>
                  </p>
                  {completionStatus.isFullyCompleted && (
                    <div className="ladder-info">
                      <p className="ladder-rank">
                        🏆 天梯排名:{' '}
                        <span className="rank-value">
                          {userRank || '未上榜'}
                        </span>
                      </p>
                      {submittedLadderScore > 0 && (
                        <p className="submitted-score">
                          已提交分數:{' '}
                          <span className="score-value">
                            {submittedLadderScore}
                          </span>
                        </p>
                      )}
                      {currentLadderScore > 0 &&
                        currentLadderScore !== submittedLadderScore && (
                          <p className="current-score">
                            當前分數:{' '}
                            <span className="score-value">
                              {currentLadderScore}
                            </span>
                            <span className="score-note">（需提交更新）</span>
                          </p>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* 按鈕區域 */}
              <div className="action-buttons-section">
                {/* 儲存評測結果按鈕 */}
                {averageScore > 0 && (
                  <button
                    onClick={handleSaveResults}
                    className="action-btn save-results-btn"
                    disabled={loading}
                  >
                    <span className="btn-icon">💾</span>
                    <span className="btn-text">儲存評測結果</span>
                  </button>
                )}

                {/* 提交到天梯按鈕 */}
                {completionStatus.isFullyCompleted && (
                  <button
                    onClick={handleSubmitToLadder}
                    className="action-btn submit-ladder-btn"
                    disabled={loading}
                  >
                    <span className="btn-icon">🏆</span>
                    <span className="btn-text">
                      {submittedLadderScore > 0 ? '更新天梯分數' : '提交到天梯'}
                    </span>
                  </button>
                )}
              </div>

              {/* 天梯排名說明 */}
              <div className="ladder-info-card">
                <p className="ladder-info-text">
                  {completionStatus.isFullyCompleted
                    ? '完成五項評測，可參與天梯排名'
                    : `完成 ${completionStatus.completedCount}/5 項評測後可參與天梯排名`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 評測頁面導航 */}
      <div className="test-buttons-section" ref={testsSectionRef}>
        <h3 className="section-title">開始評測</h3>
        <div className="test-buttons-grid">
          <button
            onClick={() => handleNavigation('/strength')}
            className="test-btn strength-btn"
          >
            <span className="test-icon">💪</span>
            <span className="test-label">力量評測</span>
          </button>
          <button
            onClick={() => handleNavigation('/explosive-power')}
            className="test-btn explosive-btn"
          >
            <span className="test-icon">⚡</span>
            <span className="test-label">爆發力測試</span>
          </button>
          <button
            onClick={() => handleNavigation('/cardio')}
            className="test-btn cardio-btn"
          >
            <span className="test-icon">❤️</span>
            <span className="test-label">心肺耐力測試</span>
          </button>
          <button
            onClick={() => handleNavigation('/muscle-mass')}
            className="test-btn muscle-btn"
          >
            <span className="test-icon">🥩</span>
            <span className="test-label">骨骼肌肉量</span>
          </button>
          <button
            onClick={() => handleNavigation('/body-fat')}
            className="test-btn bodyfat-btn"
          >
            <span className="test-icon">📊</span>
            <span className="test-label">體脂肪率與FFMI</span>
          </button>
        </div>
      </div>

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
  }),
  onLogout: PropTypes.func.isRequired,
  clearTestData: PropTypes.func.isRequired,
};

export default UserInfo;
