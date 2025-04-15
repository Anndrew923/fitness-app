import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { db, auth } from './firebase';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';

// 註冊 Chart.js 組件
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// 定義預設的成績數據
const DEFAULT_SCORES = {
  strength: 0,
  explosivePower: 0,
  cardio: 0,
  muscleMass: 0,
  bodyFat: 0,
};

// 定義有效的性別選項
const GENDER_OPTIONS = ['male', 'female'];

function UserInfo({ isGuestMode, setIsGuestMode, testData, onLogout, clearTestData }) {
  const { userData, setUserData } = useUser();
  const [height, setHeight] = useState(userData.height?.toString() || '');
  const [weight, setWeight] = useState(userData.weight?.toString() || '');
  const [age, setAge] = useState(userData.age?.toString() || '');
  const [gender, setGender] = useState(userData.gender || '');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const navigate = useNavigate();

  // 監聽用戶登入狀態並從 Firestore 載入資料（僅初次載入）
  useEffect(() => {
    if (!auth) {
      setError('無法初始化身份驗證，請檢查 Firebase 配置並稍後再試。');
      return;
    }

    console.log('useEffect triggered: isGuestMode=', isGuestMode, 'currentUser=', currentUser);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user && !isGuestMode) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userDoc = userSnap.data();
            console.log('Firebase userDoc.scores:', JSON.stringify(userDoc.scores, null, 2));
            const updatedData = {
              height: userDoc.height || undefined,
              weight: userDoc.weight || undefined,
              age: userDoc.age || undefined,
              gender: userDoc.gender || '',
              scores: userDoc.scores || DEFAULT_SCORES,
            };
            // 更新 userData
            setUserData(updatedData);
            // 僅在第一次載入時設置表單值，避免覆蓋用戶更改
            if (!height && updatedData.height) setHeight(updatedData.height.toString());
            if (!weight && updatedData.weight) setWeight(updatedData.weight.toString());
            if (!age && updatedData.age) setAge(updatedData.age.toString());
            if (!gender && updatedData.gender) setGender(updatedData.gender);
            if (!updatedData.height || !updatedData.weight || !updatedData.age || !updatedData.gender) {
              setError('請填寫並儲存您的身高、體重、年齡和性別！');
            }
          } else {
            setError('歡迎！請填寫並儲存您的身高、體重、年齡和性別。');
            setUserData({ scores: DEFAULT_SCORES });
          }
        } catch (err) {
          setError(`無法載入用戶資料：${err.message}`);
          setUserData({ scores: DEFAULT_SCORES });
        }
      } else if (isGuestMode) {
        // 訪客模式下，僅在第一次載入時設置表單值
        if (!height && userData.height) setHeight(userData.height.toString());
        if (!weight && userData.weight) setWeight(userData.weight.toString());
        if (!age && userData.age) setAge(userData.age.toString());
        if (!gender && userData.gender) setGender(userData.gender);
      }
    });

    return () => unsubscribe();
  }, [isGuestMode]); // 移除 setUserData 依賴，僅依賴 isGuestMode

  // 驗證數據
  const validateData = useCallback(() => {
    if (!height || !weight || !age || !gender) {
      setError('請填寫所有欄位');
      return false;
    }
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const ageNum = parseInt(age, 10);
    if (heightNum <= 0 || weightNum <= 0 || ageNum <= 0) {
      setError('身高、體重和年齡必須大於 0');
      return false;
    }
    if (!GENDER_OPTIONS.includes(gender)) {
      setError('請選擇有效的性別（男性或女性）');
      return false;
    }
    return true;
  }, [height, weight, age, gender]);

  // 儲存數據
  const saveData = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      if (!validateData()) {
        setLoading(false);
        return;
      }
      const heightNum = parseFloat(height);
      const weightNum = parseFloat(weight);
      const ageNum = parseInt(age, 10);
      const updatedUserData = {
        height: heightNum,
        weight: weightNum,
        age: ageNum,
        gender,
        updatedAt: new Date().toISOString(),
        scores: userData.scores || DEFAULT_SCORES, // 保留現有 scores
      };
      try {
        if (!isGuestMode && currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, updatedUserData, { merge: true });
        }
        setUserData(updatedUserData);
        setIsSaved(true);
      } catch (err) {
        setError(`儲存失敗：${err.message}`);
      } finally {
        setIsSaved(false);
        setLoading(false);
      }
    },
    [height, weight, age, gender, isGuestMode, currentUser, setUserData, validateData, userData.scores]
  );

  // 導航處理
  const handleNavigation = useCallback(
    (path) => {
      if (!userData.height || !userData.weight || !userData.age || !userData.gender) {
        if (height && weight && age && gender) {
          saveData({ preventDefault: () => {} });
        } else {
          setError('請先填寫並儲存您的身高、體重、年齡和性別！');
          return;
        }
      }
      setTimeout(() => {
        if (userData.height > 0 && userData.weight > 0 && userData.age > 0 && userData.gender) {
          navigate(path);
        } else {
          setError('請確保資料已正確保存後再進行評測！');
        }
      }, 100);
    },
    [userData, height, weight, age, gender, saveData, navigate]
  );

  // 獲取歷史數據
  const fetchHistory = useCallback(async () => {
    if (!auth?.currentUser || isGuestMode) {
      alert('請使用登入模式以查看歷史數據！');
      return;
    }
    try {
      const historyRef = collection(db, 'users', auth.currentUser.uid, 'history');
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHistoryData(history);
    } catch (error) {
      alert('獲取歷史數據失敗，請稍後再試！');
    }
  }, [isGuestMode]);

  // 格式化數據
  const formatData = useCallback((type, data) => {
    if (!data || typeof data !== 'object') return '無數據';
    switch (type) {
      case 'cardio':
        return `跑步距離: ${data.distance ?? '未知'} 公尺, 分數: ${data.score ?? '未知'}, 評語: ${data.comment ?? '無評語'}`;
      case 'muscle':
        return `SMM: ${data.smm ?? '未知'} kg, SM%: ${data.smPercent ?? '未知'}%, SMM 分數: ${data.smmScore ?? '未知'}, SM% 分數: ${data.smPercentScore ?? '未知'}, 最終分數: ${data.finalScore ?? '未知'}`;
      case 'ffmi':
        return `體脂肪率: ${data.bodyFat ?? '未知'}%, FFMI: ${data.ffmi ?? '未知'}, FFMI 評分: ${data.ffmiScore ?? '未知'}, 等級: ${data.ffmiCategory ?? '未知'}`;
      case 'strength':
        return `深蹲: ${data.squat ?? '未知'} (重量: ${data.squatWeight ?? '未知'} kg, 次數: ${data.squatReps ?? '未知'}), 硬舉: ${data.deadlift ?? '未知'} (重量: ${data.deadliftWeight ?? '未知'} kg, 次數: ${data.deadliftReps ?? '未知'}), 臥推: ${data.benchPress ?? '未知'} (重量: ${data.benchPressWeight ?? '未知'} kg, 次數: ${data.benchPressReps ?? '未知'}), 滑輪下拉: ${data.latPulldown ?? '未知'} (重量: ${data.latPulldownWeight ?? '未知'} kg, 次數: ${data.latPulldownReps ?? '未知'}), 站姿肩推: ${data.shoulderPress ?? '未知'} (重量: ${data.shoulderPressWeight ?? '未知'} kg, 次數: ${data.shoulderPressReps ?? '未知'}), 平均分數: ${data.averageScore ?? '未知'}`;
      case 'power':
        return `垂直跳: ${data.jumpHeight ?? '未知'} cm, 分數: ${data.jumpScore ?? '未知'}, 立定跳遠: ${data.jumpDistance ?? '未知'} cm, 分數: ${data.distanceScore ?? '未知'}, 最終分數: ${data.finalScore ?? '未知'}`;
      default:
        return JSON.stringify(data, null, 2);
    }
  }, []);

  // 計算平均分數
  const averageScore = useMemo(() => {
    const scores = userData.scores || DEFAULT_SCORES;
    const scoreValues = Object.values(scores).map(Number).filter((score) => score > 0);
    return scoreValues.length ? (scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length).toFixed(0) : 0;
  }, [userData.scores]);

  // 根據平均分數和性別生成鼓勵語
  const scoreSlogan = useMemo(() => {
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
    return gender === 'male' ? slogansMale[index] : slogansFemale[index];
  }, [averageScore, gender]);

  // 設置雷達圖數據
  const radarData = useMemo(() => {
    const scores = userData.scores || DEFAULT_SCORES;
    console.log('Radar Data Scores:', JSON.stringify(scores, null, 2));
    return {
      labels: ['力量', '爆發力', '心肺耐力', '骨骼肌肉量', 'FFMI'],
      datasets: [{
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
      }],
    };
  }, [userData.scores]);

  // 設置雷達圖選項
  const radarOptions = useMemo(() => ({
    scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } },
    plugins: { legend: { position: 'top' } },
    animation: false,
  }), []);

  return (
    <div className="user-info-container">
      {error && <p className="error-message">{error}</p>}

      {isGuestMode ? (
        <div className="user-status">
          <p>您正在使用訪客模式，數據不會儲存。</p>
          <button onClick={onLogout} className="signout-btn">返回登入頁面</button>
        </div>
      ) : currentUser ? (
        <div className="user-status">
          <p>歡迎，{currentUser.email}！</p>
          <button onClick={onLogout} className="signout-btn">登出</button>
        </div>
      ) : (
        <div className="mode-selection">
          <h2 className="text-xl font-semibold text-center mb-4">選擇使用模式</h2>
          <div className="button-group-mode">
            <div className="button-with-tooltip">
              <button onClick={() => setIsGuestMode(true)} className="mode-btn guest-btn">訪客模式</button>
              <span className="tooltip">僅儲存到本地，重新整理後可能遺失</span>
            </div>
            <div className="button-with-tooltip">
              <button onClick={() => navigate('/login')} className="mode-btn login-btn">登入模式</button>
              <span className="tooltip">將數據保存到雲端，隨時隨地訪問</span>
            </div>
          </div>
        </div>
      )}

      {(isGuestMode || currentUser) && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">身體狀態與表現總覽</h1>
          <form className="space-y-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">性別</label>
              <select
                id="gender"
                name="gender"
                value={gender}
                onChange={(e) => {
                  console.log('Gender changed:', e.target.value);
                  setGender(e.target.value);
                }}
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
                value={height}
                onChange={(e) => {
                  console.log('Height changed:', e.target.value);
                  setHeight(e.target.value);
                }}
                placeholder="身高 (cm)"
                className="input-field"
                required
                autoComplete="height"
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">體重 (kg)</label>
              <input
                id="weight"
                name="weight"
                type="number"
                value={weight}
                onChange={(e) => {
                  console.log('Weight changed:', e.target.value);
                  setWeight(e.target.value);
                }}
                placeholder="體重 (kg)"
                className="input-field"
                required
                autoComplete="weight"
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">年齡</label>
              <input
                id="age"
                name="age"
                type="number"
                value={age}
                onChange={(e) => {
                  console.log('Age changed:', e.target.value);
                  setAge(e.target.value);
                }}
                placeholder="年齡"
                className="input-field"
                required
                autoComplete="age"
              />
            </div>
            <div className="button-group-submit">
              <button
                type="button"
                onClick={saveData}
                className={`submit-btn ${isSaved ? 'saved' : ''}`}
                disabled={loading}
              >
                {loading ? '儲存中...' : isSaved ? '已儲存' : '儲存資料'}
              </button>
            </div>
          </form>
        </>
      )}

      {testData && (
        <div>
          <h2 className="text-xl font-semibold text-center mb-4">最新測驗結果</h2>
          <p>類型: {testData.squat ? '力量' : testData.distance ? '心肺耐力' : '其他'}</p>
          <p>數據: {JSON.stringify(testData)}</p>
          <button onClick={clearTestData} className="nav-btn">清除測驗數據</button>
        </div>
      )}

      <div className="radar-section">
        <h2 className="text-xl font-semibold text-center mb-4">表現總覽</h2>
        {console.log('Rendering radar section, scores:', JSON.stringify(userData.scores, null, 2))}
        {Object.values(userData.scores || DEFAULT_SCORES).some((score) => score > 0) ? (
          <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        ) : (
          <p className="error-message">請先完成至少一項評測以顯示表現總覽</p>
        )}
        {averageScore > 0 && (
          <div className="score-section">
            <p className="average-score">平均分數: <span className="score-value">{averageScore}</span></p>
            <p className="score-slogan">{scoreSlogan}</p>
          </div>
        )}
      </div>

      <div className="button-group">
        <button onClick={() => handleNavigation('/strength')} className="nav-btn">力量評測</button>
        <button onClick={() => handleNavigation('/explosive-power')} className="nav-btn">爆發力測試</button>
        <button onClick={() => handleNavigation('/cardio')} className="nav-btn">心肺耐力測試</button>
        <button onClick={() => handleNavigation('/muscle-mass')} className="nav-btn">骨骼肌肉量</button>
        <button onClick={() => handleNavigation('/body-fat')} className="nav-btn">體脂肪率與FFMI</button>
        <button onClick={() => handleNavigation('/celebrity-comparison')} className="nav-btn">名人數據參照表</button>
        {currentUser && !isGuestMode && (
          <button onClick={() => { setShowModal(true); fetchHistory(); }} className="nav-btn history-btn">歷史數據</button>
        )}
      </div>

      {showModal && !isGuestMode && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">歷史數據</h2>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              {historyData.length > 0 ? (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>類型</th>
                      <th>數據</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.data?.date || '未知日期'}</td>
                        <td>{entry.type || '未知類型'}</td>
                        <td>{formatData(entry.type, entry.data)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>暫無歷史數據</p>
              )}
            </div>
          </div>
        </div>
      )}
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
    overflow-x: hidden;
  }

  .user-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
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
    width: 100%;
    max-width: 200px;
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
    box-sizing: border-box;
  }

  .input-field::placeholder {
    color: #a0a0a0;
    opacity: 0.6;
    font-style: italic;
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
    width: 80%;
    max-width: 200px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    top: -40px;
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
    margin-top: 1rem;
  }

  .average-score {
    font-size: 1.25rem;
    font-weight: bold;
    color: #333;
  }

  .score-value {
    color: #d32f2f;
    font-size: 1.5rem;
  }

  .score-slogan {
    font-size: 1rem;
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

  .history-btn {
    background-color: #36a2eb;
  }

  .history-btn:hover {
    background-color: #2a82cb;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .modal-close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #4b5563;
  }

  .modal-close-btn:hover {
    color: #1f2937;
  }

  .modal-body {
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  .history-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .history-table th,
  .history-table td {
    padding: 0.5rem;
    font-size: 0.75rem;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    word-wrap: break-word;
  }

  .history-table th {
    background-color: #f3f4f6;
    font-weight: 600;
    color: #1f2937;
  }

  .history-table tr:last-child td {
    border-bottom: none;
  }

  @media (min-width: 768px) {
    .user-info-container {
      max-width: 800px;
    }

    .user-status {
      flex-direction: row;
      justify-content: space-between;
    }

    .signout-btn {
      width: auto;
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

    .modal-title {
      font-size: 1.25rem;
    }

    .modal-close-btn {
      font-size: 1.5rem;
    }

    .history-table th,
    .history-table td {
      font-size: 0.875rem;
      padding: 0.75rem;
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