import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
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
        {/* 圖標 */}
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
        {/* 標籤文字 */}
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

const RadarChartSection = ({ scores, loading, t }) => {
  const radarContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({
    width: 750,
    height: 400,
  });

  // 計算雷達圖數據
  const radarChartData = useMemo(() => {
    try {
      const scoreData = scores || DEFAULT_SCORES;
      const data = [
        {
          name: t('userInfo.radarLabels.strength'),
          value: scoreData.strength ? Number(scoreData.strength).toFixed(2) * 1 : 0,
          icon: '💪',
        },
        {
          name: t('userInfo.radarLabels.explosivePower'),
          value: scoreData.explosivePower
            ? Number(scoreData.explosivePower).toFixed(2) * 1
            : 0,
          icon: '⚡',
        },
        {
          name: t('userInfo.radarLabels.cardio'),
          value: scoreData.cardio ? Number(scoreData.cardio).toFixed(2) * 1 : 0,
          icon: '❤️',
        },
        {
          name: t('userInfo.radarLabels.muscle'),
          value: scoreData.muscleMass
            ? Number(scoreData.muscleMass).toFixed(2) * 1
            : 0,
          icon: '🥩',
        },
        {
          name: t('userInfo.radarLabels.ffmi'),
          value: scoreData.bodyFat ? Number(scoreData.bodyFat).toFixed(2) * 1 : 0,
          icon: '📊',
        },
      ];
      const filtered = data.filter(
        item => item.value !== null && item.value !== undefined
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

        {hasValidData && (
          <div
            className="radar-chart-container"
            ref={radarContainerRef}
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

