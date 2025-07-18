import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import PropTypes from 'prop-types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

// 添加CSS動畫樣式
const cornerPulseAnimation = `
  @keyframes cornerPulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.2);
    }
  }
`;

// 注入CSS動畫
const style = document.createElement('style');
style.textContent = cornerPulseAnimation;
document.head.appendChild(style);

function SimpleUserInfo({ testData, onLogout, clearTestData }) {
  const [userData, setUserData] = useState({
    nickname: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
    scores: {
      strength: 0,
      explosivePower: 0,
      cardio: 0,
      muscleMass: 0,
      bodyFat: 0,
    },
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // 計算雷達圖數據
  const radarChartData = [
    { name: '力量', value: userData.scores.strength || 0, icon: '💪' },
    { name: '爆發力', value: userData.scores.explosivePower || 0, icon: '⚡' },
    { name: '心肺耐力', value: userData.scores.cardio || 0, icon: '❤️' },
    { name: '骨骼肌肉量', value: userData.scores.muscleMass || 0, icon: '🥩' },
    { name: 'FFMI', value: userData.scores.bodyFat || 0, icon: '📊' },
  ];

  // 自定義軸標籤組件
  const CustomAxisTick = ({ payload, x, y, textAnchor }) => {
    const data = radarChartData.find(item => item.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
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
        {/* 內圈裝飾 */}
        <circle
          cx={0}
          cy={0}
          r={10}
          fill="rgba(129, 216, 208, 0.05)"
          stroke="rgba(129, 216, 208, 0.2)"
          strokeWidth={1}
        />
        {/* 圖標 */}
        <text
          x={0}
          y={0}
          textAnchor={textAnchor}
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
          y={10}
          textAnchor={textAnchor}
          fill="rgba(129, 216, 208, 0.8)"
          fontSize="12"
          fontWeight="600"
          dominantBaseline="middle"
          filter="drop-shadow(0 1px 2px rgba(255, 255, 255, 0.8))"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // 監聽認證狀態
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('SimpleUserInfo - 認證狀態變更:', user?.email);
      setCurrentUser(user);
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 處理 testData 更新
  useEffect(() => {
    if (testData && Object.keys(testData).length > 0) {
      console.log('收到測試數據:', testData);

      setUserData(prev => {
        const updatedScores = {
          ...prev.scores,
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

        return {
          ...prev,
          scores: updatedScores,
        };
      });

      // 清除 testData
      if (clearTestData) {
        setTimeout(clearTestData, 1000);
      }
    }
  }, [testData, clearTestData]);

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 簡單驗證
    if (
      !userData.height ||
      !userData.weight ||
      !userData.age ||
      !userData.gender
    ) {
      setError('請填寫所有欄位');
      setLoading(false);
      return;
    }

    try {
      // 這裡可以添加保存邏輯
      console.log('保存用戶數據:', userData);
      setLoading(false);
    } catch (error) {
      console.error('保存失敗:', error);
      setError('保存失敗，請稍後再試');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  if (!currentUser) {
    return <div>載入中...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>身體狀態 & 表現概覽</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6f61',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          登出
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>暱稱:</label>
          <input
            type="text"
            value={userData.nickname}
            onChange={e => handleInputChange('nickname', e.target.value)}
            placeholder="輸入暱稱"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            身高 (cm):
          </label>
          <input
            type="number"
            value={userData.height}
            onChange={e => handleInputChange('height', e.target.value)}
            placeholder="輸入身高"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            體重 (kg):
          </label>
          <input
            type="number"
            value={userData.weight}
            onChange={e => handleInputChange('weight', e.target.value)}
            placeholder="輸入體重"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>年齡:</label>
          <input
            type="number"
            value={userData.age}
            onChange={e => handleInputChange('age', e.target.value)}
            placeholder="輸入年齡"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>性別:</label>
          <select
            value={userData.gender}
            onChange={e => handleInputChange('gender', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          >
            <option value="">選擇性別</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '保存中...' : '保存數據'}
        </button>
      </form>

      {/* 雷達圖 */}
      <div style={{ marginTop: '30px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            background:
              'linear-gradient(135deg, #81d8d0 0%, #5f9ea0 50%, #81d8d0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center',
            margin: '0 0 20px 0',
            textShadow: '0 2px 4px rgba(129, 216, 208, 0.1)',
          }}
        >
          評測分數雷達圖
        </h2>
        <div
          style={{
            width: '100%',
            height: '300px',
            padding: '25px',
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            borderRadius: '20px',
            boxShadow:
              'inset 0 2px 8px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(129, 216, 208, 0.1)',
            position: 'relative',
            border: '1px solid rgba(129, 216, 208, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* 裝飾性角落元素 */}
          <div
            style={{
              position: 'absolute',
              width: '15px',
              height: '15px',
              border: '2px solid rgba(129, 216, 208, 0.3)',
              borderRadius: '50%',
              top: '10px',
              left: '10px',
              animation: 'cornerPulse 3s ease-in-out infinite',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              width: '15px',
              height: '15px',
              border: '2px solid rgba(129, 216, 208, 0.3)',
              borderRadius: '50%',
              top: '10px',
              right: '10px',
              animation: 'cornerPulse 3s ease-in-out infinite 0.5s',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              width: '15px',
              height: '15px',
              border: '2px solid rgba(129, 216, 208, 0.3)',
              borderRadius: '50%',
              bottom: '10px',
              left: '10px',
              animation: 'cornerPulse 3s ease-in-out infinite 1s',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              width: '15px',
              height: '15px',
              border: '2px solid rgba(129, 216, 208, 0.3)',
              borderRadius: '50%',
              bottom: '10px',
              right: '10px',
              animation: 'cornerPulse 3s ease-in-out infinite 1.5s',
            }}
          ></div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarChartData}>
              <PolarGrid
                gridType="polygon"
                stroke="rgba(129, 216, 208, 0.15)"
                strokeWidth={1.5}
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
                  fontSize: 11,
                  fill: 'rgba(129, 216, 208, 0.7)',
                  fontWeight: 500,
                }}
                axisLine={false}
              />
              <Radar
                name="評測分數"
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
                  <stop offset="50%" stopColor="#5F9EA0" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#81D8D0" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 評測頁面導航 */}
      <div style={{ marginTop: '30px' }}>
        <h2>開始評測</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}
        >
          <button
            onClick={() => navigate('/strength')}
            style={{
              padding: '15px',
              backgroundColor: '#ff6f61',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            💪 力量評測
          </button>
          <button
            onClick={() => navigate('/explosive-power')}
            style={{
              padding: '15px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ⚡ 爆發力評測
          </button>
          <button
            onClick={() => navigate('/cardio')}
            style={{
              padding: '15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ❤️ 心肺耐力評測
          </button>
          <button
            onClick={() => navigate('/muscle-mass')}
            style={{
              padding: '15px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🥩 骨骼肌肉量評測
          </button>
          <button
            onClick={() => navigate('/body-fat')}
            style={{
              padding: '15px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📊 體脂率評測
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>評測分數</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}
        >
          <div
            style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <h3>力量: {userData.scores.strength}</h3>
          </div>
          <div
            style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <h3>爆發力: {userData.scores.explosivePower}</h3>
          </div>
          <div
            style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <h3>心肺耐力: {userData.scores.cardio}</h3>
          </div>
          <div
            style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <h3>骨骼肌肉量: {userData.scores.muscleMass}</h3>
          </div>
          <div
            style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <h3>FFMI: {userData.scores.bodyFat}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

SimpleUserInfo.propTypes = {
  testData: PropTypes.object,
  onLogout: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default SimpleUserInfo;
