import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
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
import { calculateLadderScore, generateNickname } from './utils';

import './userinfo.css';
import { useTranslation } from 'react-i18next';

// 開發環境下載入調試工具
if (process.env.NODE_ENV === 'development') {
  import('./utils/firebaseDebug');
}

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
  const { t } = useTranslation();

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
                {t('common.cancel')}
              </button>
              <button
                className={getButtonClass()}
                onClick={handleAction}
                style={{ position: 'relative', zIndex: 10001 }}
              >
                {actionText || t('common.confirm')}
              </button>
            </div>
          ) : (
            <button
              className={getButtonClass()}
              onClick={handleClose}
              style={{ position: 'relative', zIndex: 10001 }}
            >
              {t('common.confirm')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'warning', 'success', 'error']),
  onAction: PropTypes.func,
  actionText: PropTypes.string,
};

// 新增：提交確認對話框組件
const SubmitConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  remainingCount,
}) => {
  const { t } = useTranslation();

  // ✅ 新增：阻止背景滾動
  useEffect(() => {
    if (isOpen) {
      // 保存當前滾動位置
      const scrollY = window.scrollY;

      // 阻止背景滾動
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      // 恢復背景滾動
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';

      // 恢復滾動位置
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // 清理：確保在組件卸載時恢復
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen]);

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
          <h3 className="modal-title">{t('userInfo.submitConfirm.title')}</h3>
        </div>
        <div className="modal-body">
          <div className="submit-confirm-message">
            <p className="confirm-text">
              {t('userInfo.submitConfirm.descPrefix')}{' '}
              <span className="remaining-count">{remainingCount}</span>{' '}
              {t('userInfo.submitConfirm.descSuffix')}
            </p>

            {/* 新增：限制資訊顯示 */}
            <div className="limit-info">
              <div className="limit-item">
                <span className="limit-icon">🔄</span>
                <span className="limit-text">
                  {t('userInfo.limits.remainingUpdates', {
                    count: remainingCount,
                  })}
                </span>
              </div>
              <div className="limit-item">
                <span className="limit-icon">⏰</span>
                <span className="limit-text">
                  {t('userInfo.limits.nextResetTime')}
                </span>
              </div>
            </div>

            <div className="confirm-details">
              <div className="detail-item">
                <span className="detail-icon">📊</span>
                <span className="detail-text">
                  {t('userInfo.submitConfirm.ensureAccuracy')}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">⏰</span>
                <span className="detail-text">
                  {t('userInfo.submitConfirm.resetDaily')}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🎯</span>
                <span className="detail-text">
                  {t('userInfo.submitConfirm.improveValue')}
                </span>
              </div>
            </div>

            {/* ✅ 新增：內容規範提醒 */}
            <div className="moderation-notice">
              <div className="moderation-notice-header">
                <span className="moderation-icon">⚠️</span>
                <strong>{t('moderationNotice.title')}</strong>
              </div>
              <div className="moderation-notice-content">
                <p>{t('moderationNotice.description')}</p>
                <p>{t('moderationNotice.ensure')}</p>
                <ul>
                  <li>{t('moderationNotice.avoid.inappropriate')}</li>
                  <li>{t('moderationNotice.avoid.sensitive')}</li>
                  <li>{t('moderationNotice.avoid.uncomfortable')}</li>
                </ul>
                <p className="moderation-warning">
                  <strong>{t('moderationNotice.warning')}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer submit-confirm-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onCancel}>
            {t('userInfo.submitConfirm.cancel')}
          </button>
          <button className="modal-btn modal-btn-success" onClick={onConfirm}>
            {t('userInfo.submitConfirm.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

SubmitConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  remainingCount: PropTypes.number.isRequired,
};

// 移除儀式感動畫系統

// 新增：極致品質圖片壓縮工具
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

      // 計算最佳尺寸，保持長寬比
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });

      // 啟用最高品質圖像渲染
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 使用白色背景（針對透明圖片）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 繪製圖像
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => {
          if (blob.size > maxSize) {
            // 再壓縮一次，仍保持極高品質
            canvas.toBlob(
              blob2 => {
                resolve(blob2);
              },
              'image/jpeg',
              0.93
            );
          } else {
            resolve(blob);
          }
        },
        'image/jpeg',
        0.98
      );
    };
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function UserInfo({ testData, onLogout, clearTestData }) {
  const { userData, setUserData, saveHistory, loadUserData, isLoading } =
    useUser();
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const radarSectionRef = useRef(null);
  const testsSectionRef = useRef(null);
  const formSectionRef = useRef(null);
  const nicknameTimeoutRef = useRef(null); // 新增：暱稱輸入防抖定時器
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

  // 新增：體重提醒狀態
  const [weightReminder, setWeightReminder] = useState({
    show: false,
    message: '',
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
        reason: t('userInfo.limits.limitReachedMessage'),
      };
    }

    // 檢查冷卻時間（2小時）
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
          reason: t('userInfo.limits.cooldownMessage', {
            minutes: remainingMinutes,
          }),
        };
      }
    }

    return { canSubmit: true, reason: null };
  }, [ladderSubmissionState, t]);

  // 新增：顯示提交確認對話框
  const showSubmitConfirmModal = useCallback(() => {
    // 檢查天梯提交限制
    const limitCheck = checkLadderSubmissionLimit();

    if (!limitCheck.canSubmit) {
      // 顯示限制訊息
      setModalState({
        isOpen: true,
        title: t('userInfo.limits.limitReached'),
        message: limitCheck.reason,
        type: 'warning',
        onAction: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          // 導航到天梯頁面查看當前排名
          navigate('/ladder');
        },
        actionText: t('userInfo.modal.viewLadder'),
      });
      return;
    }

    // 可以提交，顯示確認對話框
    const remainingCount =
      3 - (ladderSubmissionState.dailySubmissionCount || 0);
    setSubmitConfirmModal({
      isOpen: true,
      remainingCount: Math.max(0, remainingCount),
    });
  }, [ladderSubmissionState, checkLadderSubmissionLimit, t, navigate]);

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

      // 使用寫入隊列機制，而不是直接寫入 Firebase
      try {
        // 將天梯分數更新加入寫入隊列，優先處理
        const ladderData = {
          ...userData,
          ladderScore: ladderScore,
          lastLadderSubmission: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // 立即保存到本地存儲
        localStorage.setItem('userData', JSON.stringify(ladderData));
        localStorage.setItem('lastSavedUserData', JSON.stringify(ladderData));

        // 立即寫入 Firebase，確保天梯分數能及時顯示
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
        console.error('保存天梯分數失敗:', error);
        throw error;
      }

      // 更新提交狀態
      const now = new Date();
      setLadderSubmissionState(prev => ({
        lastSubmissionTime: now,
        dailySubmissionCount: prev.dailySubmissionCount + 1,
        lastSubmissionDate: now.toDateString(),
      }));

      // 顯示成功訊息（國際化）
      setModalState({
        isOpen: true,
        title: t('userInfo.modal.submitSuccessTitle'),
        message: t('userInfo.modal.submitSuccessMessage', {
          score: ladderScore,
        }),
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
        actionText: t('userInfo.modal.viewLadder'),
      });

      // 5秒後自動關閉成功對話框（給用戶時間選擇）
      setTimeout(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
      }, 5000);
    } catch (error) {
      console.error('提交到天梯失敗:', error);
      setModalState({
        isOpen: true,
        title: t('userInfo.modal.submitFailTitle'),
        message: t('userInfo.modal.submitFailMessage'),
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
        title: t('community.messages.needLogin'),
        message: t('userInfo.limits.needLoginToSubmit'),
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
        title: t('userInfo.limits.assessmentIncomplete'),
        message: t('userInfo.limits.assessmentIncompleteMessage', {
          count: completedCount,
        }),
        type: 'warning',
      });
      return;
    }

    // 檢查天梯提交限制
    const { canSubmit, reason } = checkLadderSubmissionLimit();
    if (!canSubmit) {
      setModalState({
        isOpen: true,
        title: t('userInfo.limits.limitReached'),
        message: reason,
        type: 'warning',
        onAction: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          // 導航到天梯頁面查看當前排名
          navigate('/ladder');
        },
        actionText: t('userInfo.modal.viewLadder'),
      });
      return;
    }

    // 顯示提交確認對話框
    showSubmitConfirmModal();
  }, [
    userData,
    showSubmitConfirmModal,
    setModalState,
    checkLadderSubmissionLimit,
    t,
    navigate,
    auth.currentUser,
  ]);

  const radarChartData = useMemo(() => {
    const scores = userData.scores || DEFAULT_SCORES;
    return [
      {
        name: t('userInfo.radarLabels.strength'),
        value: scores.strength ? Number(scores.strength).toFixed(2) * 1 : 0,
        icon: '💪',
      },
      {
        name: t('userInfo.radarLabels.explosivePower'),
        value: scores.explosivePower
          ? Number(scores.explosivePower).toFixed(2) * 1
          : 0,
        icon: '⚡',
      },
      {
        name: t('userInfo.radarLabels.cardio'),
        value: scores.cardio ? Number(scores.cardio).toFixed(2) * 1 : 0,
        icon: '❤️',
      },
      {
        name: t('userInfo.radarLabels.muscle'),
        value: scores.muscleMass ? Number(scores.muscleMass).toFixed(2) * 1 : 0,
        icon: '🥩',
      },
      {
        name: t('userInfo.radarLabels.ffmi'),
        value: scores.bodyFat ? Number(scores.bodyFat).toFixed(2) * 1 : 0,
        icon: '📊',
      },
    ];
  }, [userData.scores]);

  const isGuest = useMemo(() => {
    return sessionStorage.getItem('guestMode') === 'true';
  }, []);

  // 自定義軸標籤組件
  const CustomAxisTick = ({ payload, x, y }) => {
    const data = radarChartData.find(item => item.name === payload.value);

    // 計算調整後的位置 - 使用相對偏移而不是固定像素值
    let adjustedX = x;
    let adjustedY = y;

    // 計算從中心到當前點的距離，用於相對偏移
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);

    // 力量標籤特殊處理：移到正上方
    if (payload.value === t('userInfo.radarLabels.strength')) {
      // 使用相對位置，保持在正上方
      adjustedX = x; // 保持原始x位置
      adjustedY = y - distance * 0.12; // 使用距離的12%作為向上偏移
    } else if (payload.value === t('userInfo.radarLabels.explosivePower')) {
      // 爆發力標籤微調：稍微往左、往上移動
      adjustedX = x + Math.cos(angle) * (distance * 0.03); // 減少到3%
      adjustedY = y + Math.sin(angle) * (distance * 0.06); // 減少到6%
    } else if (payload.value === t('userInfo.radarLabels.ffmi')) {
      // FFMI標籤微調：遠離雷達圖
      adjustedX = x + Math.cos(angle) * (distance * -0.2); // 減少到-20%
      adjustedY = y + Math.sin(angle) * (distance * 0.06); // 保持6%
    } else if (payload.value === t('userInfo.radarLabels.cardio')) {
      // 心肺耐力標籤：保持不變
      adjustedX = x + Math.cos(angle) * (distance * 0.01); // 保持1%
      adjustedY = y + Math.sin(angle) * (distance * 0.06); // 保持6%
    } else if (payload.value === t('userInfo.radarLabels.muscle')) {
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

  CustomAxisTick.propTypes = {
    payload: PropTypes.shape({
      value: PropTypes.string.isRequired,
    }).isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
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

          console.log('💾 防抖後更新測試數據分數（5秒防抖）');
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

  const validateData = useCallback(() => {
    const { height, weight, age, gender } = userData;
    if (!height || !weight || !age || !gender) {
      setError(t('errors.required'));
      return false;
    }
    if (height <= 0 || weight <= 0 || age <= 0) {
      setError(t('userInfo.modal.invalidPositive'));
      return false;
    }
    if (!GENDER_OPTIONS.includes(gender)) {
      setError(t('userInfo.modal.invalidGender'));
      return false;
    }
    return true;
  }, [userData]);

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
          title: t('userInfo.modal.saveSuccessTitle'),
          message: t('userInfo.modal.saveSuccessMessage'),
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
    [userData, validateData, isGuest, setUserData]
  );

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
        const docData = doc.data();
        if (docData.ladderScore > 0) {
          users.push({
            id: doc.id,
            ...docData,
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
  }, [userData?.userId, submittedLadderScore, setUserRank]);

  // 當用戶數據或完成狀態改變時，獲取用戶排名
  useEffect(() => {
    fetchUserRank();
  }, [fetchUserRank, setUserData]);

  // 計算年齡段
  // const ageGroup = useMemo(() => {
  //   return userData?.age ? getAgeGroup(userData.age) : '';
  // }, [userData?.age]);

  // 處理暱稱變更
  const handleNicknameChange = useCallback(
    e => {
      const nickname = e.target.value;

      // 檢查字數限制
      const isChinese = /[\u4e00-\u9fff]/.test(nickname);
      let isValid = true;
      let errorMessage = '';

      if (isChinese) {
        // 中文限制8個字
        if (nickname.length > 8) {
          isValid = false;
          errorMessage = '暱稱不能超過8個中文字';
        }
      } else {
        // 英文限制16個字元
        if (nickname.length > 16) {
          isValid = false;
          errorMessage = '暱稱不能超過16個英文字元';
        }
      }

      if (!isValid) {
        setModalState({
          isOpen: true,
          title: '字數限制',
          message: errorMessage,
          type: 'warning',
        });
        return;
      }

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
    [setUserData, setModalState]
  );

  // 生成預設暱稱
  const handleGenerateNickname = useCallback(() => {
    const email = auth.currentUser?.email;
    const generatedNickname = generateNickname(email);
    setUserData(prev => ({
      ...prev,
      nickname: generatedNickname,
      // 保持原有的天梯分數，不自動更新
      ladderScore: prev.ladderScore || 0,
    }));
  }, [setUserData]);

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
      title: t('userInfo.modal.resultSaveSuccessTitle'),
      message: t('userInfo.modal.resultSaveSuccessMessage'),
      type: 'success',
    });

    // 2秒後自動關閉成功對話框
    setTimeout(() => {
      setModalState(prev => ({ ...prev, isOpen: false }));
    }, 2000);
  }, [userData.scores, averageScore, saveHistory, setModalState]);

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

      if (validateData()) {
        // 傳遞當前路徑作為狀態，以便返回時知道從哪裡來
        navigate(path, { state: { from: '/user-info' } });
      } else {
        setModalState({
          isOpen: true,
          title: t('userInfo.modals.dataNotSaved.title'),
          message: t('userInfo.modals.dataNotSaved.message'),
          type: 'warning',
        });
      }
    },
    [userData, validateData, navigate, setModalState]
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

      // 檢查體重變化
      if (name === 'weight') {
        const oldWeight = userData.weight || 0;
        const newWeight = processedValue;

        // 如果體重有變化且不是從 0 開始
        if (oldWeight > 0 && newWeight > 0 && oldWeight !== newWeight) {
          setWeightReminder({
            show: true,
            message: t('userInfo.weightChangeReminder'),
          });

          // 3秒後自動隱藏提醒
          setTimeout(() => {
            setWeightReminder(prev => ({ ...prev, show: false }));
          }, 3000);
        }
      }

      setUserData(prev => ({
        ...prev,
        [name]: processedValue,
        // 保持原有的天梯分數，不自動更新
        ladderScore: prev.ladderScore || 0,
      }));
    },
    [setUserData, userData.weight, t]
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
    if (file.size > 7 * 1024 * 1024) {
      setAvatarError('圖片大小請勿超過 7MB');
      return;
    }
    setAvatarUploading(true);
    try {
      // 壓縮圖片 - 極致品質設定
      const compressed = await compressImage(file, 2000 * 1024, 512, 512);
      if (compressed.size > 2500 * 1024) {
        setAvatarError('壓縮後圖片仍超過 2.5MB，請選擇更小的圖片');
        setAvatarUploading(false);
        return;
      }
      // 上傳到 Storage
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('未登入，無法上傳頭像');

      // 添加更詳細的錯誤處理和調試信息
      console.log('🔧 開始上傳頭像:', { userId, fileSize: compressed.size });

      const avatarRef = ref(storage, `avatars/${userId}/avatar.jpg`);
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          'uploaded-by': userId,
          'upload-time': new Date().toISOString(),
        },
      };

      await uploadBytes(avatarRef, compressed, metadata);
      console.log('✅ 頭像上傳成功');

      const url = await getDownloadURL(avatarRef);
      console.log('✅ 獲取下載 URL 成功:', url);
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
          <p>{t('common.loading')}</p>
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
                : userData?.avatarUrl || '/default-avatar.svg'
            }
            alt={t('community.ui.avatarAlt')}
            className="user-avatar"
            loading="lazy"
            onError={e => {
              e.target.src = '/default-avatar.svg';
            }}
          />
        </div>

        <div className="avatar-actions-container">
          {!isGuest && (
            <label className="avatar-upload-label">
              {avatarUploading
                ? t('userInfo.avatar.uploading')
                : t('userInfo.avatar.change')}
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
            <h1 className="page-title">{t('userInfo.title')}</h1>
            <div className="page-subtitle">{t('userInfo.subtitle')}</div>
          </div>

          <div
            id="user-form-section"
            className="form-card"
            ref={formSectionRef}
          >
            <form className="user-form" onSubmit={saveData}>
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">{t('userInfo.basicInfo')}</h3>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="登出"
                      className="user-info__logout-btn"
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
                      <span className="user-info__logout-icon">⎋</span>
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="nickname" className="form-label">
                    {t('userInfo.nickname')}
                  </label>
                  <div className="nickname-input-group">
                    <input
                      id="nickname"
                      name="nickname"
                      type="text"
                      value={userData?.nickname || ''}
                      onChange={handleNicknameChange}
                      placeholder={t('userInfo.nicknamePlaceholder')}
                      className="form-input"
                      maxLength="16"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateNickname}
                      className="generate-nickname-btn"
                    >
                      {t('userInfo.generateNickname')}
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gender" className="form-label">
                      {t('userInfo.gender')}
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={userData?.gender || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      onInvalid={e =>
                        e.currentTarget.setCustomValidity(t('errors.required'))
                      }
                      onInput={e => e.currentTarget.setCustomValidity('')}
                    >
                      <option value="">{t('userInfo.selectGender')}</option>
                      <option value="male">{t('userInfo.male')}</option>
                      <option value="female">{t('userInfo.female')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="age" className="form-label">
                      {t('userInfo.age')}
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      value={userData?.age || ''}
                      onChange={handleInputChange}
                      placeholder={t('userInfo.age')}
                      className="form-input"
                      required
                      onInvalid={e =>
                        e.currentTarget.setCustomValidity(t('errors.required'))
                      }
                      onInput={e => e.currentTarget.setCustomValidity('')}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="height" className="form-label">
                      {t('userInfo.height')}
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      value={userData?.height || ''}
                      onChange={handleInputChange}
                      placeholder={t('userInfo.height')}
                      className="form-input"
                      required
                      onInvalid={e =>
                        e.currentTarget.setCustomValidity(t('errors.required'))
                      }
                      onInput={e => e.currentTarget.setCustomValidity('')}
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight" className="form-label">
                      {t('userInfo.weight')}
                    </label>
                    <div className="input-with-reminder">
                      <input
                        id="weight"
                        name="weight"
                        type="number"
                        value={userData?.weight || ''}
                        onChange={handleInputChange}
                        placeholder={t('userInfo.weight')}
                        className="form-input"
                        required
                        onInvalid={e =>
                          e.currentTarget.setCustomValidity(
                            t('errors.required')
                          )
                        }
                        onInput={e => e.currentTarget.setCustomValidity('')}
                        min="0"
                        step="0.1"
                      />
                      {weightReminder.show && (
                        <div className="weight-reminder-bubble">
                          <span className="reminder-icon">💡</span>
                          <span className="reminder-text">
                            {weightReminder.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 天梯隱私設置 */}
              <div className="form-section">
                <h3 className="section-title">
                  🏆 {t('userInfo.ladder.title')}
                </h3>
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
                        {t('userInfo.ladder.anonymousTitle')}
                      </span>
                      <span className="privacy-option-desc">
                        {t('userInfo.ladder.anonymousDesc')}
                      </span>
                    </div>
                  </label>
                </div>

                {/* 訓練背景信息（選填） */}
                <div className="training-info-section">
                  <h4 className="training-info-title">
                    💪 {t('userInfo.training.title')}
                  </h4>
                  <p className="training-info-desc">
                    {t('userInfo.training.desc')}
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="profession" className="form-label">
                        {t('userInfo.training.profession')}
                      </label>
                      <input
                        id="profession"
                        name="profession"
                        type="text"
                        value={userData?.profession || ''}
                        onChange={handleInputChange}
                        placeholder={t('userInfo.placeholders.profession')}
                        className="form-input"
                        maxLength="100"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="weeklyTrainingHours"
                        className="form-label"
                      >
                        {t('userInfo.training.weeklyHours')}
                      </label>
                      <input
                        id="weeklyTrainingHours"
                        name="weeklyTrainingHours"
                        type="number"
                        value={userData?.weeklyTrainingHours || ''}
                        onChange={handleInputChange}
                        placeholder={t('userInfo.placeholders.hours')}
                        className="form-input"
                        min="0"
                        max="168"
                        step="0.5"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="trainingYears" className="form-label">
                      {t('userInfo.training.years')}
                    </label>
                    <input
                      id="trainingYears"
                      name="trainingYears"
                      type="number"
                      value={userData?.trainingYears || ''}
                      onChange={handleInputChange}
                      placeholder={t('userInfo.placeholders.years')}
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
                  {loading ? t('userInfo.saving') : t('userInfo.saveData')}
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

          <h2 className="radar-title">{t('userInfo.radarOverview')}</h2>
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
                    name={t('userInfo.yourPerformance')}
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
                    ⭐ {t('userInfo.powerTitle')}{' '}
                    <span className="score-value-large">{averageScore}</span>
                  </p>
                  {completionStatus.isFullyCompleted && (
                    <div className="ladder-info">
                      <p className="ladder-rank">
                        🏆 {t('userInfo.ladder.rankLabel')}:{' '}
                        <span className="rank-value">
                          {userRank || '未上榜'}
                        </span>
                      </p>
                      {submittedLadderScore > 0 && (
                        <p className="submitted-score">
                          {t('userInfo.ladder.submittedScore')}:{' '}
                          <span className="score-value">
                            {submittedLadderScore}
                          </span>
                        </p>
                      )}
                      {currentLadderScore > 0 &&
                        currentLadderScore !== submittedLadderScore && (
                          <p className="current-score">
                            {t('userInfo.ladder.currentScore')}:{' '}
                            <span className="score-value">
                              {currentLadderScore}
                            </span>
                            <span className="score-note">
                              {t('userInfo.ladder.needsSubmit')}
                            </span>
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
                    <span className="btn-text">
                      {t('userInfo.saveResults')}
                    </span>
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
                      {submittedLadderScore > 0
                        ? t('userInfo.updateLadderScore')
                        : t('userInfo.submitToLadder')}
                    </span>
                  </button>
                )}

                {/* ✅ 新增：獲得榮譽認證按鈕 */}
                {submittedLadderScore > 0 && (
                  <button
                    onClick={() => navigate('/verification')}
                    className="action-btn verification-btn"
                    disabled={loading}
                  >
                    <span className="btn-icon">🏅</span>
                    <span className="btn-text">
                      {t('userInfo.getVerification')}
                    </span>
                  </button>
                )}
              </div>

              {/* 天梯限制資訊 */}
              {completionStatus.isFullyCompleted && (
                <div className="ladder-limits-info">
                  <div className="limit-info-item">
                    <span className="limit-icon">🔄</span>
                    <span className="limit-text">
                      {t('userInfo.limits.remainingUpdates', {
                        count:
                          3 - (ladderSubmissionState.dailySubmissionCount || 0),
                      })}
                    </span>
                  </div>
                  <div className="limit-info-item">
                    <span className="limit-icon">⏰</span>
                    <span className="limit-text">
                      {t('userInfo.limits.nextResetTime')}
                    </span>
                  </div>
                  <div className="limit-info-item">
                    <span className="limit-icon">ℹ️</span>
                    <span className="limit-text">
                      {t('userInfo.limits.limitInfo')}
                    </span>
                  </div>
                </div>
              )}

              {/* 天梯排名說明 */}
              <div className="ladder-info-card">
                <p className="ladder-info-text">
                  {completionStatus.isFullyCompleted
                    ? t('userInfo.ladder.ctaCompleted')
                    : t('userInfo.ladder.ctaNotCompleted', {
                        count: completionStatus.completedCount,
                      })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 評測頁面導航 */}
      <div className="test-buttons-section" ref={testsSectionRef}>
        <h3 className="section-title">{t('userInfo.startTests')}</h3>
        <div className="test-buttons-grid">
          <button
            onClick={() => handleNavigation('/strength')}
            className="test-btn strength-btn"
          >
            <span className="test-icon">💪</span>
            <span className="test-label">{t('tests.strength')}</span>
          </button>
          <button
            onClick={() => handleNavigation('/explosive-power')}
            className="test-btn explosive-btn"
          >
            <span className="test-icon">⚡</span>
            <span className="test-label">{t('tests.explosivePower')}</span>
          </button>
          <button
            onClick={() => handleNavigation('/cardio')}
            className="test-btn cardio-btn"
          >
            <span className="test-icon">❤️</span>
            <span className="test-label">{t('tests.cardio')}</span>
          </button>
          <button
            onClick={() => handleNavigation('/muscle-mass')}
            className="test-btn muscle-btn"
          >
            <span className="test-icon">🥩</span>
            <span className="test-label">{t('tests.muscleMass')}</span>
          </button>
          <button
            onClick={() => handleNavigation('/body-fat')}
            className="test-btn bodyfat-btn"
          >
            <span className="test-icon">📊</span>
            <span className="test-label">{t('tests.bodyFat')}</span>
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
    verticalJump: PropTypes.number,
    standingLongJump: PropTypes.number,
    sprint: PropTypes.number,
  }),
  onLogout: PropTypes.func.isRequired,
  clearTestData: PropTypes.func.isRequired,
};

export default React.memo(UserInfo);
