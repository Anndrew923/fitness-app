import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
  updateDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import PropTypes from 'prop-types';
import { calculateLadderScore, generateNickname } from './utils';
import logger from './utils/logger';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import {
  getRPGClass,
  getRPGClassIcon,
  getRPGClassName,
} from './utils/rpgClassCalculator';

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

// 自定義軸標籤組件 - 使用 React.memo 優化性能
const CustomAxisTick = memo(
  ({ payload, x, y, radarChartData, t }) => {
    const data = radarChartData.find(item => item.name === payload.value);

    // 計算調整後的位置 - 使用相對偏移而不是固定像素值
    let adjustedX = x;
    let adjustedY = y;

    // 計算從中心到當前點的距離，用於相對偏移
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);

    // 力量標籤特殊處理：移到正上方
    if (payload.value === t('userInfo.radarLabels.strength')) {
      adjustedX = x;
      adjustedY = y - distance * 0.12;
    } else if (payload.value === t('userInfo.radarLabels.explosivePower')) {
      adjustedX = x + Math.cos(angle) * (distance * 0.03);
      adjustedY = y + Math.sin(angle) * (distance * 0.06);
    } else if (payload.value === t('userInfo.radarLabels.ffmi')) {
      adjustedX = x + Math.cos(angle) * (distance * -0.2);
      adjustedY = y + Math.sin(angle) * (distance * 0.06);
    } else if (payload.value === t('userInfo.radarLabels.cardio')) {
      adjustedX = x + Math.cos(angle) * (distance * 0.01);
      adjustedY = y + Math.sin(angle) * (distance * 0.06);
    } else if (payload.value === t('userInfo.radarLabels.muscle')) {
      adjustedX = x + Math.cos(angle) * (distance * -0.05);
      adjustedY = y + Math.sin(angle) * (distance * 0.06);
    } else {
      adjustedX = x + Math.cos(angle) * (distance * 0.1);
      adjustedY = y + Math.sin(angle) * (distance * 0.1);
    }

    return (
      <g transform={`translate(${adjustedX},${adjustedY})`}>
        {/* 外圈光暈 - 使用外部定義的 filter */}
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
  },
  (prevProps, nextProps) => {
    // 自定義比較函數，只在必要時重新渲染
    return (
      prevProps.payload.value === nextProps.payload.value &&
      Math.abs(prevProps.x - nextProps.x) < 0.1 &&
      Math.abs(prevProps.y - nextProps.y) < 0.1 &&
      prevProps.radarChartData === nextProps.radarChartData &&
      prevProps.t === nextProps.t
    );
  }
);

CustomAxisTick.displayName = 'CustomAxisTick';

CustomAxisTick.propTypes = {
  payload: PropTypes.shape({
    value: PropTypes.string.isRequired,
  }).isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  radarChartData: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
};

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
    logger.debug('Modal close button clicked');
    onClose();
  };

  const handleOverlayClick = () => {
    logger.debug('Modal overlay clicked');
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

// ✅ Phase 1.7 防禦性修正：RPG 風格職業描述 Modal - 使用絕對定位重構 + 防禦性檢查
const RPGClassModal = ({ isOpen, onClose, classInfo }) => {
  const { t } = useTranslation();

  // ✅ Phase 1.7 新增：除錯日誌
  useEffect(() => {
    if (isOpen) {
      console.log('🎭 [DEBUG] RPGClassModal 已打開', {
        isOpen,
        classInfo,
        hasIcon: !!classInfo?.icon,
        hasName: !!classInfo?.name,
        hasDescription: !!classInfo?.description,
      });
    }
  }, [isOpen, classInfo]);

  // 阻止背景滾動
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
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

  // ✅ Phase 1.7 防禦性修正：即使 classInfo 為空也顯示 Modal（顯示預設內容）
  if (!isOpen) return null;

  // ✅ Phase 1.7 防禦性修正：提供安全的預設值
  const safeClassInfo = classInfo || {
    icon: '❓',
    name: '未知職業',
    description: '尚未覺醒的潛在力量...',
    class: 'UNKNOWN',
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 99999, // ✅ Phase 1.7 修正：提升到 99999 確保在最上層
        // ✅ 移除 flexbox 佈局，改用絕對定位控制子元素
      }}
      onClick={handleOverlayClick}
    >
      {/* 點擊背景關閉 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={handleOverlayClick}
      />

      {/* 卡片本體 - 強制絕對定位 */}
      <div
        style={{
          position: 'absolute', // ✅ 關鍵：絕對定位
          bottom: 160, // ✅ 關鍵：距離底部固定像素（避開橘色卡片與 Tab Bar）
          left: '50%', // ✅ 水平居中技巧
          transform: 'translateX(-50%)', // ✅ 水平居中
          width: '85%',
          maxWidth: '500px',
          backgroundColor: '#1E1E1E',
          borderRadius: '20px',
          border: '2px solid #FF5722',
          padding: '25px',
          boxShadow:
            '0 0 30px rgba(255, 87, 34, 0.8), 0 0 60px rgba(255, 87, 34, 0.4)',
          animation: 'rpgModalSlideIn 0.4s ease-out',
          zIndex: 99999, // ✅ Phase 1.7 修正：提升到 99999 確保在背景層之上
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 標題區域 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid rgba(255, 87, 34, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: '40px',
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            {/* ✅ Phase 1.7 防禦性修正：如果沒有 icon，顯示預設問號 */}
            {safeClassInfo.icon || '❓'}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FFD700',
              textAlign: 'center',
              textShadow:
                '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
            }}
          >
            {/* ✅ Phase 1.7 防禦性修正：如果沒有 name，顯示預設文字 */}
            {safeClassInfo.name || '未知職業'}
          </h3>
        </div>

        {/* 描述內容 */}
        <div
          style={{
            fontSize: '16px',
            color: '#E0E0E0',
            lineHeight: '26px',
            textAlign: 'justify',
            marginBottom: '25px',
            minHeight: '80px',
          }}
        >
          {/* ✅ Phase 1.7 防禦性修正：如果沒有 description，顯示預設文字 */}
          {safeClassInfo.description || '尚未覺醒的潛在力量...'}
        </div>

        {/* 確認按鈕 - 使用 div 避免 button 標籤被全域 CSS 污染 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
              }
            }}
            style={{
              backgroundColor: '#FF5722', // ✅ 預設橘色
              padding: '12px 30px',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #FF8A65', // ✅ 亮橘色邊框增加立體感
              boxShadow:
                '0 4px 15px rgba(255, 87, 34, 0.5), 0 0 20px rgba(255, 87, 34, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              outline: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.setProperty(
                'background-color',
                '#FF7043',
                'important'
              );
              e.currentTarget.style.setProperty(
                'border-color',
                '#FFAB91',
                'important'
              );
              e.currentTarget.style.setProperty(
                'transform',
                'translateY(-2px)',
                'important'
              );
              e.currentTarget.style.setProperty(
                'box-shadow',
                '0 6px 25px rgba(255, 87, 34, 0.7), 0 0 30px rgba(255, 87, 34, 0.4)',
                'important'
              );
            }}
            onMouseLeave={e => {
              e.currentTarget.style.setProperty(
                'background-color',
                '#FF5722',
                'important'
              );
              e.currentTarget.style.setProperty(
                'border-color',
                '#FF8A65',
                'important'
              );
              e.currentTarget.style.setProperty(
                'transform',
                'translateY(0)',
                'important'
              );
              e.currentTarget.style.setProperty(
                'box-shadow',
                '0 4px 15px rgba(255, 87, 34, 0.5), 0 0 20px rgba(255, 87, 34, 0.3)',
                'important'
              );
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                userSelect: 'none',
              }}
            >
              確 認
            </span>
          </div>
        </div>
      </div>

      {/* 添加動畫樣式 */}
      <style>{`
        @keyframes rpgModalSlideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

RPGClassModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classInfo: PropTypes.shape({
    icon: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  }),
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
  const {
    userData,
    setUserData,
    saveUserData,
    saveHistory,
    loadUserData,
    isLoading,
  } = useUser();
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false); // ✅ 新增：頁面準備狀態
  // ✅ 終極優化：性能模式狀態管理
  const [performanceMode, setPerformanceMode] = useState('normal'); // 'normal' | 'scrolling' | 'idle'
  const navigate = useNavigate();
  const location = useLocation();
  const radarSectionRef = useRef(null);
  const radarContainerRef = useRef(null);
  const testsSectionRef = useRef(null);
  const formSectionRef = useRef(null);
  const nicknameTimeoutRef = useRef(null); // 新增：暱稱輸入防抖定時器
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  // 記錄上一次應用過的 testData，避免重複觸發寫入
  const lastAppliedTestDataKeyRef = useRef(null);
  // ✅ 終極優化：滾動性能優化 refs
  const scrollTimeoutRef = useRef(null);
  const rafIdRef = useRef(null);
  const lastScrollTimeRef = useRef(0);
  const isScrollingRef = useRef(false);
  const idleCallbackIdRef = useRef(null); // ✅ 修復 2: 保存 idle callback ID 用於清理
  // ✅ 修復 1: 使用穩定的 ref 追蹤雷達圖是否已渲染，防止消失
  const radarChartRenderedRef = useRef(false);
  // ✅ 修復 4: 使用固定尺寸替代 ResponsiveContainer，減少重新計算
  const [chartDimensions, setChartDimensions] = useState({
    width: 750,
    height: 400,
  });

  // ✅ 修復：暫時移除 Intersection Observer，避免干擾雷達圖顯示
  // 保留 intersectionRef 用於 ref 附加，但不使用 isRadarVisible
  const { elementRef: intersectionRef } = useIntersectionObserver(
    {
      threshold: 0.1,
      rootMargin: '100px',
    },
    []
  );

  // ✅ 將 intersectionRef 附加到 radarContainerRef（使用回調 ref）
  const setRadarContainerRef = useCallback(
    node => {
      radarContainerRef.current = node;
      if (intersectionRef) {
        intersectionRef.current = node;
      }
      // ✅ 修復 4: 當容器設置後，立即計算圖表尺寸
      if (node) {
        requestAnimationFrame(() => {
          const width = Math.min(750, node.offsetWidth - 80);
          const height = Math.min(400, window.innerHeight * 0.5);
          setChartDimensions({ width, height });
        });
      }
    },
    [intersectionRef]
  );

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

  // ✅ Phase 1 新增：職業描述 Modal 狀態
  const [rpgClassModalState, setRpgClassModalState] = useState({
    isOpen: false,
    classInfo: null,
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

      // ✅ 在計算新分數之前，保存舊的分數（用於提醒框顯示）
      const oldLadderScore = userData.ladderScore || 0;
      const isFirstTime = oldLadderScore === 0;

      // ✅ 新增：如果用戶有舊分數，先查詢當前排名
      let oldRank = 0;
      if (oldLadderScore > 0 && auth.currentUser) {
        try {
          // 查詢所有有分數的用戶，按分數排序
          const q = query(
            collection(db, 'users'),
            orderBy('ladderScore', 'desc'),
            limit(200)
          );
          const querySnapshot = await getDocs(q);
          const allUsers = [];
          querySnapshot.forEach(doc => {
            const docData = doc.data();
            if (docData.ladderScore > 0) {
              allUsers.push({
                id: doc.id,
                ladderScore: docData.ladderScore,
              });
            }
          });

          // 排序並查找當前用戶的排名
          allUsers.sort((a, b) => b.ladderScore - a.ladderScore);
          const currentUserIndex = allUsers.findIndex(
            user => user.id === auth.currentUser.uid
          );

          if (currentUserIndex >= 0) {
            oldRank = currentUserIndex + 1;
            logger.debug(`📊 查詢到當前排名：第 ${oldRank} 名`);
          }
        } catch (error) {
          logger.error('查詢當前排名失敗:', error);
        }
      }

      // 計算天梯分數
      const scores = userData.scores || {};
      const ladderScore = calculateLadderScore(scores);

      // ✅ 保存更新通知數據到 localStorage，使用查詢到的 oldRank
      localStorage.setItem(
        'ladderUpdateNotification',
        JSON.stringify({
          isFirstTime: isFirstTime,
          oldScore: oldLadderScore,
          newScore: ladderScore,
          oldRank: oldRank, // ✅ 使用查詢到的排名
          timestamp: Date.now(),
          hasShown: false, // 標記是否已顯示
        })
      );

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

        // ✅ 檢查是否已認證，如果已認證則清除認證狀態（重新提交分數後認證失效）
        const updateData = {
          ladderScore: ladderScore,
          lastLadderSubmission: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // 如果用戶已認證，清除認證相關欄位（重新提交分數後認證失效）
        if (userData.isVerified === true) {
          updateData.isVerified = false;
          updateData.verifiedLadderScore = null;
          updateData.verificationStatus = null;
          updateData.verifiedAt = null;
          updateData.verificationExpiredAt = null;
          updateData.verificationRequestId = null;
          logger.debug('✅ 已清除榮譽認證狀態（重新提交分數）');
        }

        await setDoc(userRef, updateData, { merge: true });

        logger.debug('天梯分數已立即保存到 Firebase:', ladderScore);
      } catch (error) {
        logger.error('保存天梯分數失敗:', error);
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
      logger.error('提交到天梯失敗:', error);
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

  // ✅ 改進：確保雷達圖數據始終有值，添加錯誤處理
  const radarChartData = useMemo(() => {
    try {
      const scores = userData?.scores || DEFAULT_SCORES;
      const data = [
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
          value: scores.muscleMass
            ? Number(scores.muscleMass).toFixed(2) * 1
            : 0,
          icon: '🥩',
        },
        {
          name: t('userInfo.radarLabels.ffmi'),
          value: scores.bodyFat ? Number(scores.bodyFat).toFixed(2) * 1 : 0,
          icon: '📊',
        },
      ];
      // ✅ 修復 7: 確保數據有效，防止過濾後為空導致雷達圖消失
      const filtered = data.filter(
        item => item.value !== null && item.value !== undefined
      );
      // ✅ 如果過濾後為空，返回原始數據（至少保證有數據顯示）
      return filtered.length > 0 ? filtered : data;
    } catch (error) {
      console.error('雷達圖數據計算錯誤:', error);
      // 返回默認數據
      return [
        { name: t('userInfo.radarLabels.strength'), value: 0, icon: '💪' },
        {
          name: t('userInfo.radarLabels.explosivePower'),
          value: 0,
          icon: '⚡',
        },
        { name: t('userInfo.radarLabels.cardio'), value: 0, icon: '❤️' },
        { name: t('userInfo.radarLabels.muscle'), value: 0, icon: '🥩' },
        { name: t('userInfo.radarLabels.ffmi'), value: 0, icon: '📊' },
      ];
    }
  }, [userData?.scores, t]);

  const isGuest = useMemo(() => {
    return sessionStorage.getItem('guestMode') === 'true';
  }, []);

  // 監聽認證狀態
  useEffect(() => {
    if (!auth) {
      setError('無法初始化身份驗證，請檢查 Firebase 配置並稍後再試。');
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

  // ✅ 移除：不再需要 Intersection Observer ref 附加

  // ✅ 終極優化 1: 智能滾動檢測（使用被動監聽器 + RAF）
  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      // ✅ 修復 1: 移除未使用的 timeSinceLastScroll 變量

      // ✅ 使用 requestAnimationFrame 優化滾動處理
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (!isScrollingRef.current) {
          isScrollingRef.current = true;
          setPerformanceMode('scrolling');
          // ✅ 滾動時優化 DOM
          if (radarContainerRef.current) {
            radarContainerRef.current.classList.add('scrolling');
            radarContainerRef.current.style.setProperty(
              '--performance-mode',
              'scrolling'
            );
          }
        }

        lastScrollTimeRef.current = now;

        // ✅ 清除之前的定時器
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // ✅ 滾動停止後恢復（使用 requestIdleCallback 優化）
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          setPerformanceMode('idle');

          // ✅ 修復 2: 取消之前的 idle callback（如果存在）
          if (idleCallbackIdRef.current && window.cancelIdleCallback) {
            cancelIdleCallback(idleCallbackIdRef.current);
            idleCallbackIdRef.current = null;
          }

          // ✅ 使用 requestIdleCallback 在空閒時恢復
          if (window.requestIdleCallback) {
            idleCallbackIdRef.current = requestIdleCallback(
              () => {
                if (radarContainerRef.current) {
                  radarContainerRef.current.classList.remove('scrolling');
                  radarContainerRef.current.style.setProperty(
                    '--performance-mode',
                    'normal'
                  );
                }
                setPerformanceMode('normal');
                idleCallbackIdRef.current = null; // ✅ 清理引用
              },
              { timeout: 200 }
            );
          } else {
            setTimeout(() => {
              if (radarContainerRef.current) {
                radarContainerRef.current.classList.remove('scrolling');
                radarContainerRef.current.style.setProperty(
                  '--performance-mode',
                  'normal'
                );
              }
              setPerformanceMode('normal');
            }, 200);
          }
        }, 150);
      });
    };

    // ✅ 使用被動監聽器提升滾動性能
    const options = { passive: true, capture: false };
    window.addEventListener('scroll', handleScroll, options);
    window.addEventListener('touchmove', handleScroll, options);
    window.addEventListener('wheel', handleScroll, options);

    return () => {
      window.removeEventListener('scroll', handleScroll, options);
      window.removeEventListener('touchmove', handleScroll, options);
      window.removeEventListener('wheel', handleScroll, options);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      // ✅ 修復 2: 清理 idle callback
      if (idleCallbackIdRef.current && window.cancelIdleCallback) {
        cancelIdleCallback(idleCallbackIdRef.current);
        idleCallbackIdRef.current = null;
      }
    };
  }, []);

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

  // ✅ 修復 4: 計算圖表尺寸（只在必要時更新），替代 ResponsiveContainer
  useEffect(() => {
    const updateChartDimensions = () => {
      const container = radarContainerRef.current;
      if (container) {
        const width = Math.min(750, container.offsetWidth - 80); // 減去 padding
        const height = Math.min(400, window.innerHeight * 0.5);
        setChartDimensions(prev => {
          // ✅ 只在尺寸真正改變時更新，避免不必要的重新渲染
          if (prev.width !== width || prev.height !== height) {
            return { width, height };
          }
          return prev;
        });
      }
    };

    // ✅ 等待容器渲染後再計算尺寸
    const checkAndUpdate = () => {
      if (radarContainerRef.current) {
        updateChartDimensions();
      } else {
        // ✅ 如果容器還沒渲染，使用 requestAnimationFrame 等待
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (radarContainerRef.current) {
              updateChartDimensions();
            }
          });
        });
      }
    };

    // ✅ 初始化時檢查並更新尺寸
    checkAndUpdate();

    // ✅ 只在窗口大小變化時更新，使用防抖
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(updateChartDimensions);
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []); // ✅ 只在組件掛載時設置一次

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

  // 初始化天梯提交狀態
  useEffect(() => {
    const loadSubmissionState = () => {
      // ✅ 檢查是否有登入用戶
      if (!auth.currentUser) {
        // 未登入，重置狀態
        setLadderSubmissionState({
          lastSubmissionTime: null,
          dailySubmissionCount: 0,
          lastSubmissionDate: null,
        });
        return;
      }

      try {
        // ✅ 使用帶用戶 ID 的 key，確保每個用戶有獨立的提交次數
        const userId = auth.currentUser.uid;
        const storageKey = `ladderSubmissionState_${userId}`;
        const savedState = localStorage.getItem(storageKey);

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
        } else {
          // 沒有保存的狀態，初始化為空
          setLadderSubmissionState({
            lastSubmissionTime: null,
            dailySubmissionCount: 0,
            lastSubmissionDate: null,
          });
        }
      } catch (error) {
        logger.error('載入提交狀態失敗:', error);
        // 錯誤時重置狀態
        setLadderSubmissionState({
          lastSubmissionTime: null,
          dailySubmissionCount: 0,
          lastSubmissionDate: null,
        });
      }
    };

    loadSubmissionState();
  }, [userData?.userId, auth.currentUser?.uid]); // ✅ 添加依賴，用戶切換時重新載入

  // 保存天梯提交狀態到localStorage
  useEffect(() => {
    // ✅ 檢查是否有登入用戶
    if (!auth.currentUser || !ladderSubmissionState.lastSubmissionDate) {
      return;
    }

    try {
      // ✅ 使用帶用戶 ID 的 key，確保每個用戶有獨立的提交次數
      const userId = auth.currentUser.uid;
      const storageKey = `ladderSubmissionState_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(ladderSubmissionState));
    } catch (error) {
      logger.error('保存提交狀態失敗:', error);
    }
  }, [ladderSubmissionState, auth.currentUser?.uid]); // ✅ 添加依賴

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
        // 排行榜資訊（選填）
        country: userData.country || '',
        region: userData.region || '',
        scores: userData.scores || DEFAULT_SCORES,
        // 保持原有的天梯分數，不自動更新
        ladderScore: userData.ladderScore || 0,
        lastActive: new Date().toISOString(),
      };

      try {
        // ✅ 檢查是否只改變了 country 或 region
        const countryChanged =
          (userData.country || '') !== (updatedUserData.country || '');
        const regionChanged =
          (userData.region || '') !== (updatedUserData.region || '');
        const onlyCountryRegionChanged =
          (countryChanged || regionChanged) &&
          // 確保其他重要欄位沒有變化
          userData.height === updatedUserData.height &&
          userData.weight === updatedUserData.weight &&
          userData.age === updatedUserData.age &&
          userData.gender === updatedUserData.gender &&
          JSON.stringify(userData.scores || {}) ===
            JSON.stringify(updatedUserData.scores || {});

        if (onlyCountryRegionChanged) {
          // 如果只改變了 country/region，立即保存到 Firebase（不使用防抖）
          logger.debug('🌍 國家/城市變化，立即保存到 Firebase');
          await saveUserData(updatedUserData);
          // 同時更新本地狀態
          setUserData(updatedUserData);
        } else {
          // 其他情況使用防抖機制
          setUserData(updatedUserData);
        }

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
    [userData, validateData, isGuest, setUserData, saveUserData, t]
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

  // ✅ Phase 1.8 新增：在 rpgClassInfo 計算後加入生命週期 Log
  useEffect(() => {
    console.log('🔄 [DEBUG] UserInfo Component Rendered (After rpgClassInfo)', {
      timestamp: new Date().toISOString(),
      rpgClassInfo: rpgClassInfo
        ? {
            class: rpgClassInfo.class,
            name: rpgClassInfo.name,
            hasIcon: !!rpgClassInfo.icon,
            hasDescription: !!rpgClassInfo.description,
          }
        : null,
      modalState: rpgClassModalState,
      userScores: userData?.scores,
    });
  }, [rpgClassInfo, rpgClassModalState, userData?.scores]);

  // ✅ Phase 1.7 防禦性修正：處理職業標籤點擊（添加除錯與安全檢查）
  const handleRpgClassClick = useCallback(() => {
    console.log('🔍 [DEBUG] 職業標籤被點擊', {
      rpgClassInfo,
      hasClass: !!rpgClassInfo?.class,
      classValue: rpgClassInfo?.class,
      userScores: userData?.scores,
    });

    // ✅ 防禦性檢查：即使數據不完整，也允許打開 Modal（顯示預設內容）
    if (rpgClassInfo) {
      // 確保 classInfo 有必要的屬性，如果缺失則使用預設值
      const safeClassInfo = {
        icon: rpgClassInfo.icon || '❓',
        name: rpgClassInfo.name || '未知職業',
        description: rpgClassInfo.description || '尚未覺醒的潛在力量...',
        class: rpgClassInfo.class || 'UNKNOWN',
      };

      console.log('✅ [DEBUG] 打開職業 Modal', safeClassInfo);
      setRpgClassModalState({
        isOpen: true,
        classInfo: safeClassInfo,
      });
    } else {
      console.warn('⚠️ [DEBUG] 無法打開職業 Modal: rpgClassInfo 為空', {
        rpgClassInfo,
        userData: userData?.scores,
      });
    }
  }, [rpgClassInfo, userData?.scores]);

  // ✅ Phase 1 新增：關閉職業描述 Modal
  const handleCloseRpgClassModal = useCallback(() => {
    setRpgClassModalState({
      isOpen: false,
      classInfo: null,
    });
  }, []);

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
      // ✅ 優化：使用客戶端過濾，避免複合索引需求
      // 獲取前200名用戶（增加限制以確保有足夠數據）
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('ladderScore', 'desc'),
        limit(200) // 增加到200名，確保涵蓋更多用戶
      );

      const querySnapshot = await getDocs(q);
      const users = [];

      // 客戶端過濾：只保留 ladderScore > 0 的用戶
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
        // 如果用戶不在前200名中，設置為未上榜
        setUserRank(null);
      }
    } catch (error) {
      logger.error('獲取用戶排名失敗:', error);
      setUserRank(null);
    }
  }, [userData?.userId, submittedLadderScore]);

  // ✅ 終極優化 4: 優化 Firebase 查詢（防抖 + 緩存 + requestIdleCallback）
  const fetchUserRankRef = useRef(null);
  const lastFetchParamsRef = useRef({ userId: null, score: null });

  useEffect(() => {
    if (fetchUserRankRef.current) {
      if (window.cancelIdleCallback) {
        cancelIdleCallback(fetchUserRankRef.current);
      } else {
        clearTimeout(fetchUserRankRef.current);
      }
    }

    const userId = userData?.userId;
    const score = submittedLadderScore;

    // ✅ 如果參數沒變，跳過查詢
    if (
      lastFetchParamsRef.current.userId === userId &&
      lastFetchParamsRef.current.score === score
    ) {
      return;
    }

    lastFetchParamsRef.current = { userId, score };

    if (userId && score > 0) {
      // ✅ 使用 requestIdleCallback 在空閒時查詢
      if (window.requestIdleCallback) {
        fetchUserRankRef.current = requestIdleCallback(
          () => {
            fetchUserRank();
          },
          { timeout: 2000 }
        );
      } else {
        fetchUserRankRef.current = setTimeout(() => {
          fetchUserRank();
        }, 800);
      }
    }

    return () => {
      if (fetchUserRankRef.current) {
        if (window.cancelIdleCallback) {
          cancelIdleCallback(fetchUserRankRef.current);
        } else {
          clearTimeout(fetchUserRankRef.current);
        }
      }
    };
  }, [userData?.userId, submittedLadderScore, fetchUserRank]);

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
      auth.signOut().catch(err => logger.error('登出失敗:', err));
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
      } else if (['profession', 'country', 'region'].includes(name)) {
        // 職業、國家、行政區欄位保持字符串
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
      logger.debug('🔧 開始上傳頭像:', { userId, fileSize: compressed.size });

      const avatarRef = ref(storage, `avatars/${userId}/avatar.jpg`);
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          'uploaded-by': userId,
          'upload-time': new Date().toISOString(),
        },
      };

      await uploadBytes(avatarRef, compressed, metadata);
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
      <Modal
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

      {/* 提交確認對話框 */}
      <SubmitConfirmModal
        isOpen={submitConfirmModal.isOpen}
        onConfirm={confirmSubmitToLadder}
        onCancel={cancelSubmit}
        remainingCount={submitConfirmModal.remainingCount}
      />

      {/* ✅ Phase 1.8 修正：職業描述 Modal - 使用條件渲染確保完全移除 DOM */}
      {rpgClassModalState.isOpen && (
        <RPGClassModal
          isOpen={rpgClassModalState.isOpen}
          onClose={handleCloseRpgClassModal}
          classInfo={rpgClassModalState.classInfo}
        />
      )}

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

                  {/* 排行榜資訊（選填） */}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="country" className="form-label">
                        {t('userInfo.ranking.country')}{' '}
                        <span className="optional-badge">選填</span>
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={userData?.country || ''}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="">
                          {t('userInfo.ranking.selectCountry')}
                        </option>
                        <option value="TW">台灣</option>
                        <option value="CN">中國</option>
                        <option value="US">美國</option>
                        <option value="JP">日本</option>
                        <option value="KR">韓國</option>
                        <option value="SG">新加坡</option>
                        <option value="MY">馬來西亞</option>
                        <option value="HK">香港</option>
                        <option value="MO">澳門</option>
                        <option value="TH">泰國</option>
                        <option value="VN">越南</option>
                        <option value="PH">菲律賓</option>
                        <option value="ID">印尼</option>
                        <option value="AU">澳洲</option>
                        <option value="NZ">紐西蘭</option>
                        <option value="CA">加拿大</option>
                        <option value="GB">英國</option>
                        <option value="DE">德國</option>
                        <option value="FR">法國</option>
                        <option value="OTHER">其他</option>
                      </select>
                      <p className="field-hint">
                        💡 {t('userInfo.ranking.countryHint')}
                      </p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="region" className="form-label">
                        {t('userInfo.ranking.region')}{' '}
                        <span className="optional-badge">選填</span>
                      </label>
                      {userData?.country === 'TW' ? (
                        // 台灣行政區選單
                        <select
                          id="region"
                          name="region"
                          value={userData?.region || ''}
                          onChange={handleInputChange}
                          className="form-input"
                        >
                          <option value="">
                            {t('userInfo.ranking.selectRegion')}
                          </option>
                          <optgroup label="直轄市">
                            <option value="台北市">台北市</option>
                            <option value="新北市">新北市</option>
                            <option value="桃園市">桃園市</option>
                            <option value="台中市">台中市</option>
                            <option value="台南市">台南市</option>
                            <option value="高雄市">高雄市</option>
                          </optgroup>
                          <optgroup label="省轄市">
                            <option value="基隆市">基隆市</option>
                            <option value="新竹市">新竹市</option>
                            <option value="嘉義市">嘉義市</option>
                          </optgroup>
                          <optgroup label="縣">
                            <option value="新竹縣">新竹縣</option>
                            <option value="苗栗縣">苗栗縣</option>
                            <option value="彰化縣">彰化縣</option>
                            <option value="南投縣">南投縣</option>
                            <option value="雲林縣">雲林縣</option>
                            <option value="嘉義縣">嘉義縣</option>
                            <option value="屏東縣">屏東縣</option>
                            <option value="宜蘭縣">宜蘭縣</option>
                            <option value="花蓮縣">花蓮縣</option>
                            <option value="台東縣">台東縣</option>
                            <option value="澎湖縣">澎湖縣</option>
                            <option value="金門縣">金門縣</option>
                            <option value="連江縣">連江縣</option>
                          </optgroup>
                        </select>
                      ) : userData?.country &&
                        userData?.country !== '' &&
                        userData?.country !== 'OTHER' ? (
                        // 其他國家使用下拉選單（預留未來擴充）
                        <select
                          id="region"
                          name="region"
                          value={userData?.region || ''}
                          onChange={handleInputChange}
                          className="form-input"
                        >
                          <option value="">
                            {t('userInfo.ranking.selectRegion')}
                          </option>
                          {/* 未來可根據選擇的國家動態載入城市列表 */}
                          <option value="">
                            {t('userInfo.ranking.regionComingSoon')}
                          </option>
                        </select>
                      ) : (
                        // 未選擇國家或選擇「其他」時顯示文字輸入
                        <input
                          id="region"
                          name="region"
                          type="text"
                          value={userData?.region || ''}
                          onChange={handleInputChange}
                          placeholder={
                            userData?.country === 'OTHER'
                              ? t('userInfo.ranking.regionPlaceholderOther')
                              : t('userInfo.ranking.selectCountryFirst')
                          }
                          className="form-input"
                          maxLength="50"
                          disabled={
                            !userData?.country || userData?.country === ''
                          }
                        />
                      )}
                      <p className="field-hint">
                        💡 {t('userInfo.ranking.regionHint')}
                      </p>
                    </div>
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
          {/* ✅ 修復：增強條件邏輯，確保雷達圖穩定顯示 */}
          {/* ✅ 修復：將 SVG defs 移到外部，避免重複 ID 導致顏色和格式問題 */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient
                id="tiffanyGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#81D8D0" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#5F9EA0" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#81D8D0" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </svg>
          {(() => {
            // ✅ 防禦性檢查：確保 radarChartData 是有效的數組
            const hasValidData =
              radarChartData &&
              Array.isArray(radarChartData) &&
              radarChartData.length > 0;

            // ✅ 優先級 1: 如果已渲染過且有有效數據，保持顯示（穩定性最高）
            if (radarChartRenderedRef.current && hasValidData) {
              return (
                <div
                  className="radar-chart-container"
                  ref={setRadarContainerRef}
                >
                  <RadarChart
                    width={chartDimensions.width}
                    height={chartDimensions.height}
                    data={radarChartData}
                  >
                    <PolarGrid
                      gridType="polygon"
                      stroke="rgba(129, 216, 208, 0.25)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={
                        <CustomAxisTick radarChartData={radarChartData} t={t} />
                      }
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
                  </RadarChart>
                </div>
              );
            }

            // ✅ 優先級 2: 如果有有效數據，立即渲染（首次渲染或數據更新）
            if (hasValidData) {
              // ✅ 立即標記為已渲染，避免條件競爭
              radarChartRenderedRef.current = true;
              return (
                <div
                  className="radar-chart-container"
                  ref={setRadarContainerRef}
                >
                  <RadarChart
                    width={chartDimensions.width}
                    height={chartDimensions.height}
                    data={radarChartData}
                  >
                    <PolarGrid
                      gridType="polygon"
                      stroke="rgba(129, 216, 208, 0.25)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={
                        <CustomAxisTick radarChartData={radarChartData} t={t} />
                      }
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
                  </RadarChart>
                </div>
              );
            }

            // ✅ 優先級 3: 數據未準備好時顯示載入狀態（提供用戶反饋）
            return (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>正在載入數據...</p>
              </div>
            );
          })()}

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
                  {/* ✅ Phase 1.8 修正：RPG 職業標籤 - 加入視覺除錯與點擊穿透保護 */}
                  {rpgClassInfo && rpgClassInfo.class !== 'UNKNOWN' && (
                    <div
                      className="rpg-class-badge"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🎯 [DEBUG] 職業標籤 onClick 事件觸發', {
                          timestamp: new Date().toISOString(),
                          rpgClassInfo,
                          event: e,
                        });
                        handleRpgClassClick();
                      }}
                      onMouseDown={() => {
                        console.log(
                          '🖱️ [DEBUG] 職業標籤 onMouseDown 事件觸發',
                          {
                            timestamp: new Date().toISOString(),
                          }
                        );
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '12px',
                        padding: '8px 16px',
                        background:
                          'linear-gradient(135deg, rgba(129, 216, 208, 0.2) 0%, rgba(95, 158, 160, 0.2) 100%)',
                        borderRadius: '20px',
                        // ✅ Phase 1.8 新增：視覺除錯邊框（紅色）
                        borderWidth: '2px',
                        borderColor: 'red',
                        borderStyle: 'solid',
                        // ✅ Phase 1.8 新增：確保按鈕在最上層
                        position: 'relative',
                        zIndex: 99999,
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#2d3748',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        // ✅ Phase 1.8 新增：確保點擊區域可觸發
                        pointerEvents: 'auto',
                        userSelect: 'none',
                      }}
                      onMouseEnter={e => {
                        console.log('🖱️ [DEBUG] 職業標籤 onMouseEnter', {
                          timestamp: new Date().toISOString(),
                        });
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, rgba(129, 216, 208, 0.3) 0%, rgba(95, 158, 160, 0.3) 100%)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px rgba(129, 216, 208, 0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, rgba(129, 216, 208, 0.2) 0%, rgba(95, 158, 160, 0.2) 100%)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>
                        {rpgClassInfo.icon}
                      </span>
                      <span>{rpgClassInfo.name}</span>
                    </div>
                  )}
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
