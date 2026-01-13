import { useState, useEffect, useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import './RadarChartSection.css';

const DEFAULT_SCORES = {
  strength: 0,
  explosivePower: 0,
  cardio: 0,
  muscleMass: 0,
  bodyFat: 0,
};

// 自定義軸標籤組件 - 使用 React.memo 優化性能
const CustomAxisTick = memo(
  ({ payload, x, y, radarChartData, t, isLimitBreak, limitBreakColor }) => {
    const data = radarChartData.find(item => item.name === payload.value);
    const value = data?.value || 0;
    const isOverLimit = value > 100;

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

    // 🔥 Limit Break: 動態顏色
    // 將 hex 顏色轉換為 rgba（用於透明度效果）
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const circleStrokeColor =
      isLimitBreak && isOverLimit
        ? limitBreakColor
        : 'rgba(129, 216, 208, 0.4)';
    const circleGlowColor =
      isLimitBreak && isOverLimit
        ? hexToRgba(limitBreakColor, 0.2)
        : 'rgba(129, 216, 208, 0.1)';
    const labelColor =
      isLimitBreak && isOverLimit ? limitBreakColor : '#2d3748';
    const labelWeight = isLimitBreak && isOverLimit ? '900' : '700';

    return (
      <g transform={`translate(${adjustedX},${adjustedY})`}>
        {/* 外圈光暈 */}
        <circle
          cx={0}
          cy={0}
          r={16}
          fill={circleGlowColor}
          filter="url(#glow)"
        />
        {/* 主圓圈 */}
        <circle
          cx={0}
          cy={0}
          r={14}
          fill="rgba(255, 255, 255, 0.95)"
          stroke={circleStrokeColor}
          strokeWidth={isLimitBreak && isOverLimit ? 3 : 2}
          filter={
            isLimitBreak && isOverLimit
              ? `drop-shadow(0 2px 6px ${hexToRgba(limitBreakColor, 0.4)})`
              : 'drop-shadow(0 2px 4px rgba(129, 216, 208, 0.2))'
          }
        />
        {/* 圖標 */}
        <text
          x={0}
          y={-8}
          textAnchor="middle"
          fill={isLimitBreak && isOverLimit ? limitBreakColor : '#4a5568'}
          fontSize="16"
          fontWeight={isLimitBreak && isOverLimit ? '700' : '600'}
          dominantBaseline="middle"
          filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))"
        >
          {data?.icon}
        </text>
        {/* 標籤文字 - 使用 JetBrains Mono 字體 */}
        <text
          x={0}
          y={12}
          textAnchor="middle"
          fill={labelColor}
          fontSize="13"
          fontWeight={labelWeight}
          fontFamily="'JetBrains Mono', 'Courier New', 'Monaco', monospace"
          letterSpacing="0.05em"
          dominantBaseline="middle"
          filter="drop-shadow(0 1px 3px rgba(255, 255, 255, 0.9))"
        >
          {payload.value}
        </text>
        {/* 🔥 Limit Break: 顯示超過 100 的數值標籤 - 使用 JetBrains Mono 字體 */}
        {isOverLimit && (
          <text
            x={0}
            y={28}
            textAnchor="middle"
            fill={limitBreakColor}
            fontSize="11"
            fontWeight="900"
            fontFamily="'JetBrains Mono', 'Courier New', 'Monaco', monospace"
            letterSpacing="0.05em"
            dominantBaseline="middle"
            filter={`drop-shadow(0 1px 3px ${hexToRgba(limitBreakColor, 0.5)})`}
          >
            {value.toFixed(1)}
          </text>
        )}
      </g>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.payload.value === nextProps.payload.value &&
      Math.abs(prevProps.x - nextProps.x) < 0.1 &&
      Math.abs(prevProps.y - nextProps.y) < 0.1 &&
      prevProps.radarChartData === nextProps.radarChartData &&
      prevProps.t === nextProps.t &&
      prevProps.isLimitBreak === nextProps.isLimitBreak &&
      prevProps.limitBreakColor === nextProps.limitBreakColor
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
  isLimitBreak: PropTypes.bool,
  limitBreakColor: PropTypes.string,
};

const RadarChartSection = ({ scores, loading, t }) => {
  const radarContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({
    width: 750,
    height: 400,
  });

  // 計算雷達圖數據
  // 注意：只顯示核心5項屬性，明確過濾掉 armSize 等其他分數
  const radarChartData = useMemo(() => {
    try {
      // 明確只讀取核心5項，忽略 armSize 等其他分數
      const scoreData = scores || DEFAULT_SCORES;
      const coreScores = {
        strength: scoreData.strength,
        explosivePower: scoreData.explosivePower,
        cardio: scoreData.cardio,
        muscleMass: scoreData.muscleMass,
        bodyFat: scoreData.bodyFat,
      };

      const data = [
        {
          name: t('userInfo.radarLabels.strength'),
          value: coreScores.strength
            ? Number(coreScores.strength).toFixed(2) * 1
            : 0,
          icon: '💪',
        },
        {
          name: t('userInfo.radarLabels.explosivePower'),
          value: coreScores.explosivePower
            ? Number(coreScores.explosivePower).toFixed(2) * 1
            : 0,
          icon: '⚡',
        },
        {
          name: t('userInfo.radarLabels.cardio'),
          value: coreScores.cardio
            ? Number(coreScores.cardio).toFixed(2) * 1
            : 0,
          icon: '❤️',
        },
        {
          name: t('userInfo.radarLabels.muscle'),
          value: coreScores.muscleMass
            ? Number(coreScores.muscleMass).toFixed(2) * 1
            : 0,
          icon: '🥩',
        },
        {
          name: t('userInfo.radarLabels.ffmi'),
          value: coreScores.bodyFat
            ? Number(coreScores.bodyFat).toFixed(2) * 1
            : 0,
          icon: '📊',
        },
      ];
      // 確保只返回核心5項，過濾掉任何異常值
      const filtered = data.filter(
        item =>
          item.value !== null && item.value !== undefined && !isNaN(item.value)
      );
      return filtered.length > 0 ? filtered : data;
    } catch (error) {
      console.error('雷達圖數據計算錯誤:', error);
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
  }, [scores, t]);

  // 計算圖表尺寸
  useEffect(() => {
    const updateChartDimensions = () => {
      const container = radarContainerRef.current;
      if (container) {
        const width = Math.min(750, container.offsetWidth - 80);
        const height = Math.min(400, window.innerHeight * 0.5);
        setChartDimensions(prev => {
          if (prev.width !== width || prev.height !== height) {
            return { width, height };
          }
          return prev;
        });
      }
    };

    const checkAndUpdate = () => {
      if (radarContainerRef.current) {
        updateChartDimensions();
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (radarContainerRef.current) {
              updateChartDimensions();
            }
          });
        });
      }
    };

    checkAndUpdate();

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
  }, []);

  const hasValidData =
    radarChartData &&
    Array.isArray(radarChartData) &&
    radarChartData.length > 0;

  // 🔥 Limit Break: 檢測是否有任何數值超過 100
  const isLimitBreak = useMemo(() => {
    return radarChartData.some(item => item.value > 100);
  }, [radarChartData]);

  // 🔥 Limit Break: 動態顏色（Amber-500 或 Red-500）
  const limitBreakColor = '#f59e0b'; // Amber-500
  // 如果需要紅色，可以使用: '#ef4444' // Red-500

  // 🔥 Limit Break: 動態漸變色 ID
  const gradientId = isLimitBreak ? 'limitBreakGradient' : 'tiffanyGradient';

  if (loading) {
    return (
      <div className="radar-section">
        <div className="radar-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="radar-section">
      <div className="radar-card">
        {/* 裝飾性角落元素 */}
        <div className="corner-decoration top-left"></div>
        <div className="corner-decoration top-right"></div>
        <div className="corner-decoration bottom-left"></div>
        <div className="corner-decoration bottom-right"></div>

        <h2 className="radar-title">{t('userInfo.radarOverview')}</h2>

        {/* SVG defs */}
        <svg className="radar-svg-defs">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* ⚡ Phase 1: Magitek Gradient - Semi-transparent Blue */}
            <linearGradient
              id="tiffanyGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#00BFFF" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#0099CC" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00BFFF" stopOpacity={0.3} />
            </linearGradient>
            {/* 🔥 Limit Break: 覺醒狀態漸變（金色/紅色） */}
            <linearGradient
              id="limitBreakGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.7} />
              <stop offset="50%" stopColor="#d97706" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
            </linearGradient>
          </defs>
        </svg>

        {hasValidData && (
          <div className="radar-chart-container" ref={radarContainerRef}>
            <RadarChart
              width={chartDimensions.width}
              height={chartDimensions.height}
              data={radarChartData}
            >
              <PolarGrid
                gridType="polygon"
                stroke="rgba(255, 140, 0, 0.25)"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <PolarAngleAxis
                dataKey="name"
                tick={
                  <CustomAxisTick
                    radarChartData={radarChartData}
                    t={t}
                    isLimitBreak={isLimitBreak}
                    limitBreakColor={limitBreakColor}
                  />
                }
                axisLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tickCount={5}
                tick={{
                  fontSize: 12,
                  fill: '#FF8C00',
                  fontWeight: 600,
                  fontFamily:
                    "'JetBrains Mono', 'Courier New', 'Monaco', monospace",
                  letterSpacing: '0.05em',
                }}
                axisLine={false}
              />
              {/* ⚡ Phase 1: Magitek Radar - Semi-transparent Blue fill with Gold stroke */}
              <Radar
                name={t('userInfo.yourPerformance')}
                dataKey="value"
                stroke={isLimitBreak ? limitBreakColor : '#FF8C00'}
                fill="rgba(0, 191, 255, 0.4)"
                fillOpacity={isLimitBreak ? 0.6 : 0.4}
                strokeWidth={isLimitBreak ? 5 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                isAnimationActive={true}
              />
            </RadarChart>
          </div>
        )}
      </div>
    </div>
  );
};

RadarChartSection.propTypes = {
  scores: PropTypes.shape({
    strength: PropTypes.number,
    explosivePower: PropTypes.number,
    cardio: PropTypes.number,
    muscleMass: PropTypes.number,
    bodyFat: PropTypes.number,
  }),
  loading: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default RadarChartSection;
