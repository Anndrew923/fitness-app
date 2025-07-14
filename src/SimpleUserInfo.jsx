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
    { name: '力量', value: userData.scores.strength || 0 },
    { name: '爆發力', value: userData.scores.explosivePower || 0 },
    { name: '心肺耐力', value: userData.scores.cardio || 0 },
    { name: '骨骼肌肉量', value: userData.scores.muscleMass || 0 },
    { name: 'FFMI', value: userData.scores.bodyFat || 0 },
  ];

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
        <h2>評測分數雷達圖</h2>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="評測分數"
                dataKey="value"
                stroke="#667eea"
                fill="#667eea"
                fillOpacity={0.3}
              />
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
            }}
          >
            力量評測
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
            }}
          >
            爆發力評測
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
            }}
          >
            心肺耐力評測
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
            }}
          >
            骨骼肌肉量評測
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
            }}
          >
            體脂率評測
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
