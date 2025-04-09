// src/UserInfo.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function UserInfo() {
  const { userData, setUserData } = useUser();
  const [height, setHeight] = useState(userData.height || '');
  const [weight, setWeight] = useState(userData.weight || '');
  const [age, setAge] = useState(userData.age || '');
  const [gender, setGender] = useState(userData.gender || '');
  const [mode, setMode] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // 監聽用戶登入狀態並從 Firestore 載入資料
  useEffect(() => {
    // 檢查 auth 是否已初始化
    if (!auth) {
      console.error('auth 未初始化');
      setError('無法初始化身份驗證，請稍後再試。');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        setMode('login');
        try {
          console.log('正在查詢 Firestore，user.uid:', user.uid); // 調試：檢查 user.uid
          const q = query(
            collection(db, 'users'),
            where('userId', '==', user.uid),
            orderBy('updatedAt', 'desc'),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          console.log('查詢結果：', querySnapshot.docs.map(doc => doc.data())); // 調試：檢查查詢結果
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            console.log('載入的資料：', userDoc); // 調試：檢查載入的資料
            setHeight(userDoc.height || '');
            setWeight(userDoc.weight || '');
            setAge(userDoc.age || '');
            setGender(userDoc.gender || '');
            setUserData({
              ...userData,
              height: userDoc.height,
              weight: userDoc.weight,
              age: userDoc.age,
              gender: userDoc.gender,
              updatedAt: userDoc.updatedAt,
            });
          } else {
            console.log('沒有找到該用戶的歷史資料'); // 調試：如果沒有資料
            setError('沒有找到歷史資料，請填寫並儲存新資料。');
          }
        } catch (err) {
          console.error('從 Firestore 讀取資料失敗：', err); // 詳細錯誤日誌
          console.error('錯誤代碼：', err.code); // 調試：檢查錯誤代碼
          console.error('錯誤訊息：', err.message); // 調試：檢查錯誤訊息
          // 改進：提供更友好的錯誤訊息
          if (err.message.includes('The query requires an index')) {
            setError('資料庫索引尚未創建，請聯繫管理員或稍後再試。');
          } else if (err.code === 'auth/network-request-failed') {
            setError('無法連接到伺服器，請檢查您的網路連線並稍後再試。');
          } else if (err.code === 'permission-denied') {
            setError('您沒有權限訪問這些資料，請聯繫管理員。');
          } else {
            setError(`無法載入歷史資料：${err.message}`);
          }
        }
      } else {
        setMode('');
        setHeight(userData.height || '');
        setWeight(userData.weight || '');
        setAge(userData.age || '');
        setGender(userData.gender || '');
        setError(null); // 改進：在訪客模式下清除錯誤訊息
      }
    });

    return () => unsubscribe();
  }, []); // 改進：移除 userData 和 setUserData 依賴，確保 useEffect 只在組件掛載時執行

  // 登出功能
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setMode('');
      alert('已成功登出！');
    } catch (error) {
      console.error('登出失敗：', error);
      setError('登出失敗，請稍後再試。');
    }
  };

  // 選擇模式
  const handleModeSelect = (selectedMode) => {
    if (selectedMode === 'login' && !currentUser) {
      navigate('/login');
    } else {
      setMode(selectedMode);
    }
  };

  // 訪客模式儲存
  const handleGuestSave = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!height || !weight || !age || !gender) {
      setError('請填寫所有欄位');
      setLoading(false);
      return;
    }

    const updatedUserData = {
      ...userData,
      height: parseFloat(height),
      weight: parseFloat(weight),
      age: parseInt(age, 10),
      gender,
      updatedAt: new Date().toISOString(),
    };

    setUserData(updatedUserData);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
      setLoading(false);
    }, 2000);
  };

  // 登入模式儲存（直接儲存到 Firestore）
  const handleLoginSave = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!height || !weight || !age || !gender) {
      setError('請填寫所有欄位');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'users'), {
        userId: currentUser.uid,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age, 10),
        gender,
        updatedAt: new Date().toISOString(),
      });
      setUserData({
        ...userData,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age, 10),
        gender,
        updatedAt: new Date().toISOString(),
      });
      setIsSaved(true);
    } catch (err) {
      console.error('儲存到 Firestore 失敗：', err);
      console.error('錯誤代碼：', err.code);
      console.error('錯誤訊息：', err.message);
      // 改進：提供更友好的錯誤訊息
      if (err.code === 'auth/network-request-failed') {
        setError('無法連接到伺服器，請檢查您的網路連線並稍後再試。');
      } else if (err.code === 'permission-denied') {
        setError('您沒有權限儲存資料，請聯繫管理員。');
      } else {
        setError(`儲存失敗：${err.message}`);
      }
    } finally {
      setTimeout(() => {
        setIsSaved(false);
        setLoading(false);
      }, 2000);
    }
  };

  const calculateAverageScore = () => {
    const scoreValues = [
      userData.scores?.strength || 0,
      userData.scores?.explosivePower || 0,
      userData.scores?.cardio || 0,
      userData.scores?.muscleMass || 0,
      userData.scores?.bodyFat || 0,
    ];
    const completedScores = scoreValues.filter((score) => score > 0);
    if (completedScores.length === 0) return 0;
    const total = completedScores.reduce((sum, score) => sum + score, 0);
    return (total / completedScores.length).toFixed(0);
  };

  const getScoreSlogan = (averageScore, gender) => {
    const slogansMale = [
      '初試啼聲，繼續努力！', '點燃鬥志，挑戰極限！', '熱血啟動，突破自我！', '戰意初現，堅持到底！',
      '燃燒吧，展現潛能！', '鬥志昂揚，勇往直前！', '熱血沸騰，超越極限！', '戰力提升，無所畏懼！',
      '全力以赴，挑戰巔峰！', '強者之路，勢不可擋！', '戰神覺醒，霸氣外露！', '無畏挑戰，征服一切！',
      '熱血戰士，無人能敵！', '王者之路，勢如破竹！', '戰力爆發，震撼全場！', '不敗之姿，傲視群雄！',
      '熱血傳奇，無可匹敵！', '戰神降臨，統治全場！', '極限突破，創造奇蹟！', '傳說誕生，永不言敗！',
    ];

    const slogansFemale = [
      '初次嘗試，慢慢來哦！', '小有進步，繼續加油！', '你很努力，保持下去！', '進步中，真的不錯！',
      '展現潛力，你很棒！', '越來越好，繼續努力！', '表現出色，值得讚賞！', '很棒的進步，加油哦！',
      '你很厲害，繼續保持！', '表現穩定，超棒的！', '越來越強，你真棒！', '很棒的表現，繼續加油！',
      '你很出色，令人佩服！', '表現優異，超級棒！', '你很強大，繼續閃耀！', '表現完美，真的很棒！',
      '你太厲害了，超級棒！', '完美表現，令人驚艷！', '你是最棒的，繼續保持！', '完美無瑕，閃耀全場！',
    ];

    const index = Math.min(Math.floor(averageScore / 5), 19);
    const isMale = gender === 'male' || gender === '男性';
    return isMale ? slogansMale[index] : slogansFemale[index];
  };

  const averageScore = calculateAverageScore();
  const scoreSlogan = getScoreSlogan(averageScore, gender);

  const radarData = {
    labels: ['力量', '爆發力', '心肺耐力', '骨骼肌肉量', 'FFMI'],
    datasets: [
      {
        label: '您的表現',
        data: [
          userData.scores?.strength || 0,
          userData.scores?.explosivePower || 0,
          userData.scores?.cardio || 0,
          userData.scores?.muscleMass || 0,
          userData.scores?.bodyFat || 0,
        ],
        backgroundColor: 'rgba(34, 202, 236, 0.2)',
        borderColor: 'rgba(34, 202, 236, 1)',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
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
  };

  return (
    <div className="user-info-container">
      {/* 顯示登入狀態 */}
      {currentUser ? (
        <div className="user-status">
          <p>歡迎，{currentUser.email}！</p>
          <button onClick={handleSignOut} className="signout-btn">
            登出
          </button>
        </div>
      ) : (
        <div className="mode-selection">
          <h2 className="text-xl font-semibold text-center mb-4">選擇使用模式</h2>
          <div className="button-group-mode">
            <div className="button-with-tooltip">
              <button
                onClick={() => handleModeSelect('guest')}
                className="mode-btn guest-btn"
              >
                訪客模式
              </button>
              <span className="tooltip">僅儲存到本地，重新整理後可能遺失</span>
            </div>
            <div className="button-with-tooltip">
              <button
                onClick={() => handleModeSelect('login')}
                className="mode-btn login-btn"
              >
                登入模式
              </button>
              <span className="tooltip">將數據保存到雲端，隨時隨地訪問</span>
            </div>
          </div>
        </div>
      )}

      {/* 模式選擇後顯示表單 */}
      {(mode === 'guest' || (mode === 'login' && currentUser)) && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">身體狀態與表現總覽</h1>
          {error && <p className="error-message">{error}</p>}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">性別</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-field"
                required
                disabled={loading}
              >
                <option value="">請選擇性別</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">身高 (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="身高 (cm)"
                className="input-field"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">體重 (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="體重 (kg)"
                className="input-field"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">年齡</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="年齡"
                className="input-field"
                required
                disabled={loading}
              />
            </div>
            <div className="button-group-submit">
              <button
                type="button"
                onClick={mode === 'guest' ? handleGuestSave : handleLoginSave}
                className={`submit-btn ${isSaved ? 'saved' : ''}`}
                disabled={loading}
              >
                {loading ? '儲存中...' : isSaved ? '已儲存' : '儲存資料'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* 雷達圖和導航按鈕始終顯示 */}
      <div className="radar-section">
        <h2 className="text-xl font-semibold text-center mb-4">表現總覽</h2>
        <Radar data={radarData} options={radarOptions} />
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
        <button onClick={() => navigate('/strength')} className="nav-btn">
          力量評測
        </button>
        <button onClick={() => navigate('/explosive-power')} className="nav-btn">
          爆發力測試
        </button>
        <button onClick={() => navigate('/cardio')} className="nav-btn">
          心肺耐力測試
        </button>
        <button onClick={() => navigate('/muscle-mass')} className="nav-btn">
          骨骼肌肉量
        </button>
        <button onClick={() => navigate('/body-fat')} className="nav-btn">
          體脂肪率與FFMI
        </button>
        <button onClick={() => navigate('/celebrity-comparison')} className="nav-btn">
          名人數據參照表
        </button>
      </div>
    </div>
  );
}

export default UserInfo;

// 響應式 CSS（保持不變）
const styles = `
  .user-info-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .user-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: #e0f7fa;
    border-radius: 4px;
  }

  .signout-btn {
    padding: 0.5rem 1rem;
    background-color: #ff6f61;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .signout-btn:hover {
    background-color: #e65a50;
  }

  .mode-selection {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .button-group-mode {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .mode-btn {
    width: 100%;
    padding: 0.75rem;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .guest-btn {
    background-color: #4bc0c0;
  }

  .guest-btn:hover {
    background-color: #3aa0a0;
  }

  .login-btn {
    background-color: #ff6f61;
  }

  .login-btn:hover {
    background-color: #e65a50;
  }

  .input-field {
    width: 100%;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  .submit-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #4bc0c0;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .submit-btn:hover {
    background-color: #3aa0a0;
  }

  .submit-btn.saved {
    background-color: #28a745;
  }

  .submit-btn.saved:hover {
    background-color: #218838;
  }

  .submit-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .button-group-submit {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .button-with-tooltip {
    position: relative;
    width: 100%;
  }

  .tooltip {
    visibility: hidden;
    width: 200px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.75rem;
  }

  .button-with-tooltip:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }

  .error-message {
    color: #d32f2f;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .radar-section {
    margin: 1.5rem 0;
    text-align: center;
  }

  .score-section {
    margin-top: 1.5rem;
  }

  .average-score {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
  }

  .score-value {
    color: #d32f2f;
    font-size: 1.75rem;
  }

  .score-slogan {
    font-size: 1.2rem;
    color: #666;
    margin-top: 0.5rem;
    font-style: italic;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .nav-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #4bc0c0;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  .nav-btn:hover {
    background-color: #3aa0a0;
  }

  @media (min-width: 768px) {
    .user-info-container {
      max-width: 800px;
    }

    .button-group-mode {
      flex-direction: row;
      gap: 1rem;
    }

    .button-with-tooltip {
      width: 48%;
    }

    .button-group {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .nav-btn {
      width: 48%;
    }
  }

  @media (min-width: 1024px) {
    .nav-btn {
      width: 18%;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);