import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { auth } from './firebase';
import './styles.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const DEFAULT_SCORES = {
  strength: 0,
  explosivePower: 0,
  cardio: 0,
  muscleMass: 0,
  bodyFat: 0,
};

const GENDER_OPTIONS = ['male', 'female'];

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function UserInfo({ testData, onLogout, clearTestData }) {
  const { userData, setUserData, saveUserData, saveHistory } = useUser();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) {
      setError('無法初始化身份驗證，請檢查 Firebase 配置並稍後再試。');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (testData && Object.keys(testData).length > 0) {
      setUserData(prev => {
        const updatedScores = {
          ...prev.scores,
          ...(testData.distance && { cardio: testData.score || 0 }),
          ...(testData.squat && { strength: testData.averageScore || 0 }),
          ...(testData.jumpHeight && { explosivePower: testData.finalScore || 0 }),
          ...(testData.smm && { muscleMass: testData.finalScore || 0 }),
          ...(testData.bodyFat && { bodyFat: testData.ffmiScore || 0 }),
        };
        if (JSON.stringify(prev.scores) !== JSON.stringify(updatedScores)) {
          return { ...prev, scores: updatedScores };
        }
        return prev;
      });
    }
  }, [testData, setUserData]);

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
      setError('請選擇有效的性別（男性或女性）');
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
        height: Number(userData.height),
        weight: Number(userData.weight),
        age: Number(userData.age),
        gender: userData.gender,
        updatedAt: new Date().toISOString(),
        scores: userData.scores || DEFAULT_SCORES,
      };

      try {
        await saveUserData(updatedUserData);
      } catch (err) {
        setError(`儲存失敗：${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [userData, validateData, saveUserData]
  );

  const averageScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    const scoreValues = Object.values(scores).filter(score => score > 0);
    return scoreValues.length
      ? (scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length).toFixed(0)
      : 0;
  }, [userData?.scores]);

  const handleSaveResults = useCallback(() => {
    if (!auth.currentUser) {
      setError('請先登入以儲存結果');
      return;
    }
    const record = {
      date: new Date().toLocaleDateString('zh-TW'),
      scores: userData.scores,
      averageScore: averageScore,
    };
    saveHistory(record);
    alert('結果已儲存');
  }, [userData.scores, averageScore, saveHistory]);

  const handleNavigation = useCallback(
    async path => {
      if (!userData.height || !userData.weight || !userData.age || !userData.gender) {
        setError('請先填寫並儲存您的身高、體重、年齡和性別！');
        return;
      }

      if (validateData()) {
        await saveData({ preventDefault: () => {} });
        navigate(path);
      } else {
        setError('請確保資料已正確保存後再進行評測！');
      }
    },
    [userData, validateData, saveData, navigate]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');
    
    if (auth.currentUser) {
      auth.signOut().catch(err => console.error('UserInfo.js - 登出失敗:', err));
    }
    
    onLogout();
    
    navigate('/login');
  }, [onLogout, navigate]);

  const scoreSlogan = useMemo(() => {
    const slogansMale = [
      '初試啼聲，繼續努力！', '點燃鬥志，挑戰極限！', '熱血啟動，突破自我！',
      '戰意初現，堅持到底！', '燃燒吧，展現潛能！', '鬥志昂揚，勇往直前！',
      '熱血沸騰，超越極限！', '戰力提升，無所畏懼！', '全力以赴，挑戰巔峰！',
      '強者之路，勢不可擋！', '戰神覺醒，霸氣外露！', '無畏挑戰，征服一切！',
      '熱血戰士，無人能敵！', '王者之路，勢如破竹！', '戰力爆發，震撼全場！',
      '不敗之姿，傲視群雄！', '熱血傳奇，無可匹敵！', '戰神降臨，統治全場！',
      '極限突破，創造奇蹟！', '傳說誕生，永不言敗！',
    ];
    const slogansFemale = [
      '初次嘗試，慢慢來哦！', '小有進步，繼續加油！', '你很努力，保持下去！',
      '進步中，真的不錯！', '展現潛力，你很棒！', '越來越好，繼續努力！',
      '表現出色，值得讚賞！', '很棒的進步，加油哦！', '你很厲害，繼續保持！',
      '表現穩定，超棒的！', '越來越強，你真棒！', '很棒的表現，繼續加油！',
      '你很出色，令人佩服！', '表現優異，超級棒！', '你很強大，繼續閃耀！',
      '表現完美，真的很棒！', '你太厲害了，超級棒！', '完美表現，令人驚艷！',
      '你是最棒的，繼續保持！', '完美無瑕，閃耀全場！',
    ];
    const index = Math.min(Math.floor(Number(averageScore) / 5), 19);
    return userData?.gender === 'male' ? slogansMale[index] : slogansFemale[index];
  }, [averageScore, userData?.gender]);

  const radarData = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    return {
      labels: ['力量', '爆發力', '心肺耐力', '骨骼肌肉量', 'FFMI'],
      datasets: [
        {
          label: '您的表現',
          data: [
            scores.strength || 0,
            scores.explosivePower || 0,
            scores.cardio || 0,
            scores.muscleMass || 0,
            scores.bodyFat || 0,
          ],
          backgroundColor: 'rgba(34, 202, 236, 0.2)',
          borderColor: 'rgba(34, 202, 236, 1)',
          borderWidth: 2,
        },
      ],
    };
  }, [userData?.scores]);

  const radarOptions = useMemo(() => ({
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
      },
    },
    plugins: {
      legend: { position: 'top' },
    },
    animation: false,
  }), []);

  const handleInputChange = useCallback(
    ({ target: { name, value } }) => {
      const newValue = name === 'gender' ? value : isNaN(Number(value)) ? 0 : Number(value);
      setUserData(prev => ({ ...prev, [name]: newValue }));
    },
    [setUserData]
  );

  const debouncedHandleInputChange = useMemo(
    () => debounce((name, value) => handleInputChange({ target: { name, value } }), 100),
    [handleInputChange]
  );

  return (
    <div className="user-info-container">
      {error && <p className="error-message">{error}</p>}

      {currentUser ? (
        <div className="user-status">
          <p>歡迎，{currentUser.email}！</p>
          <button onClick={handleLogout} className="signout-btn">登出</button>
        </div>
      ) : (
        <p>正在載入用戶資訊...</p>
      )}

      {currentUser && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">身體狀態與表現總覽</h1>
          <form className="space-y-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">性別</label>
              <select
                id="gender"
                name="gender"
                value={userData?.gender || ''}
                onChange={handleInputChange}
                className="input-field"
                required
                autoComplete="sex"
              >
                <option value="">請選擇性別</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">身高 (cm)</label>
              <input
                id="height"
                name="height"
                type="number"
                value={userData?.height || ''}
                onChange={(e) => debouncedHandleInputChange(e.target.name, e.target.value)}
                placeholder="身高 (cm)"
                className="input-field"
                required
                autoComplete="height"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">體重 (kg)</label>
              <input
                id="weight"
                name="weight"
                type="number"
                value={userData?.weight || ''}
                onChange={(e) => debouncedHandleInputChange(e.target.name, e.target.value)}
                placeholder="體重 (kg)"
                className="input-field"
                required
                autoComplete="weight"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">年齡</label>
              <input
                id="age"
                name="age"
                type="number"
                value={userData?.age || ''}
                onChange={(e) => debouncedHandleInputChange(e.target.name, e.target.value)}
                placeholder="年齡"
                className="input-field"
                required
                autoComplete="age"
                min="0"
              />
            </div>
            <div className="button-group-submit">
              <button type="button" onClick={saveData} className="submit-btn" disabled={loading}>
                {loading ? '儲存中...' : '儲存資料'}
              </button>
            </div>
          </form>
        </>
      )}

      {testData && (
        <div>
          <h2 className="text-xl font-semibold text-center mb-4">最新測驗結果</h2>
          <p>
            類型:{' '}
            {testData.squat ? '力量' : testData.distance ? '心肺耐力' : testData.jumpHeight ? '爆發力' : testData.smm ? '骨骼肌肉量' : testData.bodyFat ? '體脂肪率與FFMI' : '其他'}
          </p>
          <p>數據: {JSON.stringify(testData)}</p>
          <button onClick={clearTestData} className="nav-btn">清除測驗數據</button>
        </div>
      )}

      <div id="radar-section" className="radar-section" style={{ position: 'relative' }}>
        <h2 className="text-xl font-semibold text-center mb-4">表現總覽</h2>
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
          <Radar data={radarData} options={radarOptions} />
        </div>
        {averageScore > 0 && (
          <div className="score-section">
            <p className="average-score">平均分數: <span className="score-value">{averageScore}</span></p>
            <p className="score-slogan">{scoreSlogan}</p>
          </div>
        )}
      </div>

      <button
        onClick={handleSaveResults}
        className="save-results-btn"
        style={{
          width: '33.33%',
          backgroundColor: 'rgba(34, 202, 236, 1)',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          margin: '10px auto',
          display: 'block'
        }}
      >
        儲存結果
      </button>

      <div className="button-group">
        <button onClick={() => handleNavigation('/strength')} className="nav-btn">力量評測</button>
        <button onClick={() => handleNavigation('/explosive-power')} className="nav-btn">爆發力測試</button>
        <button onClick={() => handleNavigation('/cardio')} className="nav-btn">心肺耐力測試</button>
        <button onClick={() => handleNavigation('/muscle-mass')} className="nav-btn">骨骼肌肉量</button>
        <button onClick={() => handleNavigation('/body-fat')} className="nav-btn">體脂肪率與FFMI</button>
        <button onClick={() => handleNavigation('/celebrity-comparison')} className="nav-btn">名人數據參照表</button>
        <button onClick={() => navigate('/history')} className="nav-btn">歷史紀錄</button>
      </div>
    </div>
  );
}

export default UserInfo;