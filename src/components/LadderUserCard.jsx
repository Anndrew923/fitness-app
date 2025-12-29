import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useUser } from '../UserContext';
import { auth } from '../firebase';
import { getRPGClassIcon, getRPGClassName } from '../utils/rpgClassCalculator';
import { getCityNameEn } from '../utils/taiwanDistricts';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import ReportModal from './ReportModal';
import {
  PROFESSION_REVERSE_MAP,
  RPG_CLASS_REVERSE_MAP,
} from '../utils/professionMaps';
import './LadderUserCard.css';

function LadderUserCard({ user, isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const { userData } = useUser();
  const currentUserId = auth.currentUser?.uid;
  const [showReportModal, setShowReportModal] = useState(false);
  const isEnglish = i18n.language === 'en-US';

  // 獲取年齡組標籤（與 Ladder.jsx 相同）
  const getAgeGroupLabel = useCallback(
    ageGroup => {
      if (!ageGroup) return t('ladder.ageGroups.unknown');
      return t(`ladder.ageGroups.${ageGroup}`) || ageGroup;
    },
    [t]
  );

  // 獲取職業顯示文本（處理舊數據的中文值）
  const getDisplayProfession = useCallback(
    profession => {
      if (!profession) return '';
      // 1. 嘗試反向映射（中文 -> Key）
      const key = PROFESSION_REVERSE_MAP[profession] || profession;
      // 2. 翻譯 Key
      const professionKey = `userInfo.profession.${key}`;
      const translated = t(professionKey, profession);
      // 3. 如果翻譯結果等於 key 本身（表示翻譯不存在），則顯示原值
      return translated === professionKey ? profession : translated;
    },
    [t]
  );

  // 獲取 RPG 職業 Key（處理舊數據的中文值）
  const getRPGClassKey = useCallback(rpgClass => {
    if (!rpgClass) return null;
    // 如果已經是 key 格式（大寫），直接返回
    if (rpgClass === rpgClass.toUpperCase() && rpgClass !== 'UNKNOWN') {
      return rpgClass;
    }
    // 如果是中文，映射到 key
    return RPG_CLASS_REVERSE_MAP[rpgClass] || rpgClass;
  }, []);

  // 獲取 RPG 職業顯示文本（處理舊數據的中文值）
  const getDisplayRPGClass = useCallback(
    rpgClass => {
      if (!rpgClass || rpgClass === 'UNKNOWN') return '';
      // 1. 獲取正確的 key
      const key = getRPGClassKey(rpgClass);
      // 2. 使用 i18n 翻譯，如果翻譯不存在則使用 getRPGClassName 的結果作為預設值
      const classKey = `userInfo.rpgClass.${key}`;
      const translated = t(classKey, getRPGClassName(key));
      // 3. 如果翻譯結果等於 key 本身（表示翻譯不存在），使用 getRPGClassName 的結果
      return translated === classKey ? getRPGClassName(key) : translated;
    },
    [t, getRPGClassKey]
  );

  // ✅ 新增：處理 body 滾動鎖定，防止背景頁面滾動
  useEffect(() => {
    if (isOpen) {
      // 保存當前滾動位置
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // 恢復滾動位置
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    // 清理函數
    return () => {
      if (isOpen) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  // 匿名用戶不顯示名片
  if (user.isAnonymous) return null;

  // 檢查是否為當前用戶
  const isCurrentUser = user.id === currentUserId;

  // 生成雷達圖數據
  const radarChartData = useMemo(() => {
    const scores = user.scores || {
      strength: 0,
      explosivePower: 0,
      cardio: 0,
      muscleMass: 0,
      bodyFat: 0,
    };
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
  }, [user.scores, t]);

  // 自定義軸標籤組件
  const CustomAxisTick = ({ payload, x, y }) => {
    const data = radarChartData.find(item => item.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#2d3748"
          fontSize={12}
          fontWeight={600}
        >
          {data?.icon} {payload.value}
        </text>
      </g>
    );
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="ladder-user-card-overlay" onClick={handleOverlayClick}>
      <div
        className="ladder-user-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ladder-user-card-header">
          <h3>{t('ladderCard.title')}</h3>
          <button className="ladder-user-card-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ladder-user-card-content">
          {/* 大頭照區域 */}
          <div className="ladder-user-card-avatar-section">
            <div className="ladder-user-card-avatar">
              {user.avatarUrl && user.avatarUrl.trim() !== '' ? (
                <img src={user.avatarUrl} alt={user.displayName} />
              ) : (
                <div className="ladder-user-card-avatar-placeholder">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            {/* ✅ 新增：榮譽認證按鈕 */}
            {user.isVerified && (
              <div className="ladder-user-card-verification-badge">
                🏅 {t('verification.badge.label')}
              </div>
            )}
          </div>

          {/* 雷達圖區域 */}
          <div className="ladder-user-card-radar-section">
            <h4 className="radar-section-title">
              📊 {t('userInfo.radarOverview')}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
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

          {/* 用戶基本資訊 */}
          <div className="ladder-user-card-info">
            <div className="ladder-user-card-name">{user.displayName}</div>
            <div className="ladder-user-card-details">
              <div className="detail-item">
                <span className="detail-label">{t('ladderCard.ageGroup')}：</span>
                <span className="detail-value">{getAgeGroupLabel(user.ageGroup)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('ladderCard.gender')}：</span>
                <span className="detail-value">
                  {user.gender === 'male' ? t('userInfo.male') : t('userInfo.female')}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('ladderCard.ladderScore')}：</span>
                <span className="detail-value">{user.ladderScore || 0}</span>
              </div>
              {/* 新增：國家和城市顯示 */}
              {user.country && (
                <div className="detail-item">
                  <span className="detail-label">{t('ladderCard.location')}：</span>
                  <span className="detail-value">
                    {(() => {
                      // 1. 翻譯國家名稱
                      const countryKey = `userInfo.countries.${user.country}`;
                      const countryName = t(countryKey, user.country);

                      // 2. 翻譯城市/地區名稱
                      let cityName = user.city || user.region || '';
                      
                      // 如果是英文模式且城市名稱存在，嘗試翻譯
                      if (isEnglish && cityName) {
                        const enName = getCityNameEn(cityName);
                        // 如果 getCityNameEn 返回了翻譯（不等於原值），使用翻譯
                        if (enName && enName !== cityName) {
                          cityName = enName;
                        }
                      }

                      return `${countryName}${cityName ? ` • ${cityName}` : ''}`;
                    })()}
                  </span>
                </div>
              )}
              {/* ✅ Phase 1 新增：戰鬥風格欄位 */}
              {user.rpg_class && user.rpg_class !== 'UNKNOWN' && (
                <div className="detail-item">
                  <span className="detail-label">{t('userInfo.combatStyle', '戰鬥風格')}：</span>
                  <span className="detail-value">
                    {(() => {
                      // 處理舊數據：獲取正確的 key 用於圖標，然後獲取翻譯後的名稱
                      const rpgClassKey = getRPGClassKey(user.rpg_class);
                      const icon = getRPGClassIcon(rpgClassKey);
                      const name = getDisplayRPGClass(user.rpg_class);
                      return `${icon} ${name}`;
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 訓練背景資訊 */}
          <div className="ladder-user-card-training">
            <h4 className="training-title">
              💪 {t('ladderCard.trainingBackground')}
            </h4>
            {user.profession || user.weeklyTrainingHours || user.trainingYears ? (
              <div className="training-details">
                {user.profession && (
                  <div className="training-item">
                    <span className="training-icon">💼</span>
                    <span className="training-label">{t('ladderCard.profession')}：</span>
                    <span className="training-value">
                      {getDisplayProfession(user.profession)}
                    </span>
                  </div>
                )}
                {user.weeklyTrainingHours && (
                  <div className="training-item">
                    <span className="training-icon">⏰</span>
                    <span className="training-label">
                      {t('ladderCard.weeklyTrainingHours')}：
                    </span>
                    <span className="training-value">
                      {user.weeklyTrainingHours} {t('ladderCard.hours')}
                    </span>
                  </div>
                )}
                {user.trainingYears && (
                  <div className="training-item">
                    <span className="training-icon">📅</span>
                    <span className="training-label">{t('ladderCard.trainingYears')}：</span>
                    <span className="training-value">
                      {user.trainingYears} {t('ladderCard.years')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="training-empty">
                <p>{t('ladderCard.noTrainingInfo')}</p>
                <p className="training-hint">
                  {t('ladderCard.trainingInfoHint')}
                </p>
              </div>
            )}
          </div>

          {/* 舉報按鈕（僅非當前用戶顯示） */}
          {!isCurrentUser && (
            <div className="ladder-user-card-actions">
              <button
                className="report-btn"
                onClick={handleReport}
              >
                <span className="report-icon">⚠️</span>
                {t('ladderCard.report')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 舉報對話框 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
        }}
        reportedUser={user}
      />
    </div>
  );
}

LadderUserCard.propTypes = {
  user: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LadderUserCard;
