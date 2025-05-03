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

function UserInfo({ testData, onLogout, clearTestData }) {
  const { userData, setUserData, saveUserData, clearUserData } = useUser();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) {
      setError('無法初始化身份驗證，請檢查 Firebase 配置並稍後再試。');
      console.error('UserInfo.js - auth 未初始化');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      console.log('UserInfo.js - auth 狀態變化, user:', user);
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (testData && Object.keys(testData).length > 0) {
      console.log('UserInfo.js - 更新 scores 基於 testData:', testData);
      setUserData(prev => {
        const updatedScores = {
          ...prev.scores,
          ...(testData.distance && { cardio: testData.score || 0 }),
          ...(testData.squat && { strength: testData.averageScore || 0 }),
          ...(testData.jumpHeight && {
            explosivePower: testData.finalScore || 0,
          }),
          ...(testData.smm && { muscleMass: testData.finalScore || 0 }),
          ...(testData.bodyFat && { bodyFat: testData.ffmiScore || 0 }),
        };
        if (JSON.stringify(prev.scores) !== JSON.stringify(updatedScores)) {
          return { ...prev, scores: updatedScores };
        }
        return prev;
      });
    }
  }, [testData, setUserData]); // 保持原有的依賴陣列，因為這裡只需要依賴 testData 和 setUserData

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
        console.log('UserInfo.js - 儲存資料成功:', updatedUserData);
      } catch (err) {
        setError(`儲存失敗：${err.message}`);
        console.error('UserInfo.js - 儲存失敗:', err);
      } finally {
        setLoading(false);
      }
    },
    [userData, validateData, saveUserData]
  );

  const handleNavigation = useCallback(
    async path => {
      console.log('導航前 userData:', userData);
      if (
        !userData.height ||
        !userData.weight ||
        !userData.age ||
        !userData.gender
      ) {
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
    clearUserData();
    if (auth.currentUser) {
      auth
        .signOut()
        .catch(err => console.error('UserInfo.js - 登出失敗:', err));
    }
    onLogout();
    navigate('/login');
  }, [clearUserData, onLogout, navigate]);

  const averageScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    const scoreValues = Object.values(scores)
      .map(Number)
      .filter(score => score > 0);
    const avg = scoreValues.length
      ? (
          scoreValues.reduce((sum, score) => sum + score, 0) /
          scoreValues.length
        ).toFixed(0)
      : 0;
    if (scoreValues.length > 0) {
      console.log(
        'UserInfo.js - 計算平均分數, scores:',
        scores,
        'averageScore:',
        avg
      );
    }
    return avg;
  }, [userData?.scores]);

  const scoreSlogan = useMemo(() => {
    const slogansMale = [
      '初試啼聲，繼續努力！',
      '點燃鬥志，挑戰極限！',
      '熱血啟動，突破自我！',
      '戰意初現，堅持到底！',
      '燃燒吧，展現潛能！',
      '鬥志昂揚，勇往直前！',
      '熱血沸騰，超越極限！',
      '戰力提升，無所畏懼！',
      '全力以赴，挑戰巔峰！',
      '強者之路，勢不可擋！',
      '戰神覺醒，霸氣外露！',
      '無畏挑戰，征服一切！',
      '熱血戰士，無人能敵！',
      '王者之路，勢如破竹！',
      '戰力爆發，震撼全場！',
      '不敗之姿，傲視群雄！',
      '熱血傳奇，無可匹敵！',
      '戰神降臨，統治全場！',
      '極限突破，創造奇蹟！',
      '傳說誕生，永不言敗！',
    ];
    const slogansFemale = [
      '初次嘗試，慢慢來哦！',
      '小有進步，繼續加油！',
      '你很努力，保持下去！',
      '進步中，真的不錯！',
      '展現潛力，你很棒！',
      '越來越好，繼續努力！',
      '表現出色，值得讚賞！',
      '很棒的進步，加油哦！',
      '你很厲害，繼續保持！',
      '表現穩定，超棒的！',
      '越來越強，你真棒！',
      '很棒的表現，繼續加油！',
      '你很出色，令人佩服！',
      '表現優異，超級棒！',
      '你很強大，繼續閃耀！',
      '表現完美，真的很棒！',
      '你太厲害了，超級棒！',
      '完美表現，令人驚艷！',
      '你是最棒的，繼續保持！',
      '完美無瑕，閃耀全場！',
    ];
    const index = Math.min(Math.floor(Number(averageScore) / 5), 19);
    return userData?.gender === 'male'
      ? slogansMale[index]
      : slogansFemale[index];
  }, [averageScore, userData?.gender]);

  const radarData = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    console.log('UserInfo.js - 渲染雷達圖, scores:', scores);
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

  const radarOptions = useMemo(
    () => ({
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
    }),
    []
  );

  const handleInputChange = useCallback(
    e => {
      const { name, value } = e.target;
      console.log(`UserInfo.js - 輸入變化, name: ${name}, value: ${value}`);
      const newValue =
        name === 'gender' ? value : isNaN(Number(value)) ? 0 : Number(value);
      setUserData(prev => {
        const updatedData = { ...prev, [name]: newValue };
        console.log('UserInfo.js - 更新後的 userData:', updatedData);
        return updatedData;
      });
    },
    [setUserData]
  );

  return (
    <div className="user-info-container">
      {error && <p className="error-message">{error}</p>}

      {currentUser ? (
        <div className="user-status">
          <p>歡迎，{currentUser.email}！</p>
          <button onClick={handleLogout} className="signout-btn">
            登出
          </button>
        </div>
      ) : (
        <p>正在載入用戶資訊...</p>
      )}

      {currentUser && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">
            身體狀態與表現總覽
          </h1>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                性別
              </label>
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
              <label
                htmlFor="height"
                className="block text-sm font-medium text-gray-700"
              >
                身高 (cm)
              </label>
              <input
                id="height"
                name="height"
                type="number"
                value={userData?.height || ''}
                onChange={handleInputChange}
                placeholder="身高 (cm)"
                className="input-field"
                required
                autoComplete="height"
                min="0"
              />
            </div>
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700"
              >
                體重 (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                value={userData?.weight || ''}
                onChange={handleInputChange}
                placeholder="體重 (kg)"
                className="input-field"
                required
                autoComplete="weight"
                min="0"
              />
            </div>
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-gray-700"
              >
                年齡
              </label>
              <input
                id="age"
                name="age"
                type="number"
                value={userData?.age || ''}
                onChange={handleInputChange}
                placeholder="年齡"
                className="input-field"
                required
                autoComplete="age"
                min="0"
              />
            </div>
            <div className="button-group-submit">
              <button
                type="button"
                onClick={saveData}
                className="submit-btn"
                disabled={loading}
              >
                {loading ? '儲存中...' : '儲存資料'}
              </button>
            </div>
          </form>
        </>
      )}

      {testData && (
        <div>
          <h2 className="text-xl font-semibold text-center mb-4">
            最新測驗結果
          </h2>
          <p>
            類型:{' '}
            {testData.squat
              ? '力量'
              : testData.distance
                ? '心肺耐力'
                : testData.jumpHeight
                  ? '爆發力'
                  : testData.smm
                    ? '骨骼肌肉量'
                    : testData.bodyFat
                      ? '體脂肪率與FFMI'
                      : '其他'}
          </p>
          <p>數據: {JSON.stringify(testData)}</p>
          <button onClick={clearTestData} className="nav-btn">
            清除測驗數據
          </button>
        </div>
      )}

      <div className="radar-section">
        <h2 className="text-xl font-semibold text-center mb-4">表現總覽</h2>
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
          <Radar data={radarData} options={radarOptions} />
        </div>
        {averageScore > 0 && (
          <div className="score-section">
            <p className="average-score">
              平均分數: <span className="score-value">{averageScore}</span>
            </p>
            <p className="score-slogan">{scoreSlogan}</p>
          </div>
        )}
      </div>

      <div className="button-group">
        <button
          onClick={() => handleNavigation('/strength')}
          className="nav-btn"
        >
          力量評測
        </button>
        <button
          onClick={() => handleNavigation('/explosive-power')}
          className="nav-btn"
        >
          爆發力測試
        </button>
        <button onClick={() => handleNavigation('/cardio')} className="nav-btn">
          心肺耐力測試
        </button>
        <button
          onClick={() => handleNavigation('/muscle-mass')}
          className="nav-btn"
        >
          骨骼肌肉量
        </button>
        <button
          onClick={() => handleNavigation('/body-fat')}
          className="nav-btn"
        >
          體脂肪率與FFMI
        </button>
        <button
          onClick={() => handleNavigation('/celebrity-comparison')}
          className="nav-btn"
        >
          名人數據參照表
        </button>
      </div>
    </div>
  );
}

export default UserInfo;