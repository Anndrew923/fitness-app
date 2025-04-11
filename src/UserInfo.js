import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { db, auth } from './firebase';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';

// 註冊 Chart.js 組件
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function UserInfo({ isGuestMode, testData, onLogout, clearTestData, onGuestMode }) {
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

  // 檢查 auth 和 db 是否正確初始化
  console.log('auth:', auth);
  console.log('db:', db);

  // 監聽用戶登入狀態並從 Firestore 載入資料
  useEffect(() => {
    console.log('UserInfo useEffect 觸發, isGuestMode:', isGuestMode, 'auth.currentUser:', auth?.currentUser);
    if (!auth) {
      console.error('auth 未初始化');
      setError('無法初始化身份驗證，請檢查 Firebase 配置並稍後再試。');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('onAuthStateChanged 觸發, user:', user);
      setCurrentUser(user);
      if (user && !isGuestMode) {
        try {
          if (!db) {
            throw new Error('Firestore 未初始化');
          }
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userDoc = userSnap.data();
            console.log('從 Firestore 載入的用戶數據：', userDoc);
            console.log('載入的 scores 數據：', userDoc.scores);
            setHeight(userDoc.height?.toString() || '');
            setWeight(userDoc.weight?.toString() || '');
            setAge(userDoc.age?.toString() || '');
            setGender(userDoc.gender || '');
            setUserData((prev) => ({
              ...prev,
              height: userDoc.height || 0,
              weight: userDoc.weight || 0,
              age: userDoc.age || 0,
              gender: userDoc.gender || '',
              scores: userDoc.scores || {},
            }));
          } else {
            console.log('沒有找到該用戶的資料');
            setError('沒有找到用戶資料，請填寫並儲存新資料。');
            setUserData((prev) => ({ ...prev, height: 0, weight: 0, age: 0, gender: '', scores: {} }));
          }
        } catch (err) {
          console.error('從 Firestore 讀取資料失敗：', err);
          if (err.code === 'permission-denied') {
            setError('您沒有權限訪問這些資料，請聯繫管理員。');
          } else if (err.code === 'network-request-failed') {
            setError('無法連接到伺服器，請檢查您的網路連線並稍後再試。');
          } else {
            setError(`無法載入用戶資料：${err.message}`);
          }
          setUserData((prev) => ({ ...prev, height: 0, weight: 0, age: 0, gender: '', scores: {} }));
        }
      } else {
        setHeight(userData.height?.toString() || '');
        setWeight(userData.weight?.toString() || '');
        setAge(userData.age?.toString() || '');
        setGender(userData.gender || '');
        setError(null);
      }
    });

    return () => unsubscribe();
  }, [setUserData, isGuestMode, userData.height, userData.weight, userData.age, userData.gender]);

  // 訪客模式儲存（僅更新本地狀態）
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
      height: parseFloat(height),
      weight: parseFloat(weight),
      age: parseInt(age, 10),
      gender,
      updatedAt: new Date().toISOString(),
      scores: userData.scores || {},
    };

    setUserData(updatedUserData);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
      setLoading(false);
    }, 2000);
  };

  // 登入模式儲存（儲存到 Firestore 的 users/{userId}）
  const handleLoginSave = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!height || !weight || !age || !gender) {
      setError('請填寫所有欄位');
      setLoading(false);
      return;
    }

    if (!currentUser || !db) {
      setError('無法儲存資料：Firebase 未正確初始化。');
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updatedUserData = {
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age, 10),
        gender,
        updatedAt: new Date().toISOString(),
        scores: userData.scores || {},
      };
      await setDoc(userRef, updatedUserData, { merge: true });
      setUserData((prev) => ({
        ...prev,
        ...updatedUserData,
      }));
      setIsSaved(true);
    } catch (err) {
      console.error('儲存到 Firestore 失敗：', err);
      if (err.code === 'network-request-failed') {
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

  // 獲取歷史數據
  const fetchHistory = async () => {
    const user = auth?.currentUser;
    if (!user || isGuestMode) {
      console.log('fetchHistory: 用戶未登入或為訪客模式，跳過歷史數據載入');
      alert('請使用登入模式以查看歷史數據！');
      return;
    }

    if (!db) {
      alert('無法載入歷史數據：Firebase 未正確初始化。');
      return;
    }

    try {
      const historyRef = collection(db, 'users', user.uid, 'history');
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('歷史記錄文檔：', data);
        return {
          id: doc.id,
          ...data,
        };
      });
      console.log('提取的歷史數據：', history);
      setHistoryData(history);
    } catch (error) {
      console.error('獲取歷史數據失敗:', error);
      alert('獲取歷史數據失敗，請稍後再試！');
    }
  };

  // 點擊「歷史數據」按鈕時觸發
  const handleShowHistory = () => {
    setShowModal(true);
    fetchHistory();
  };

  // 關閉模態框
  const handleCloseModal = () => {
    setShowModal(false);
    setHistoryData([]);
  };

  // 格式化數據顯示，添加更多容錯處理
  const formatData = (type, data) => {
    if (!data || typeof data !== 'object') {
      return '無數據';
    }
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
  };

  // 計算平均分數，確保數據為數值
  const calculateAverageScore = () => {
    const scoreValues = [
      Number(userData.scores?.strength) || 0,
      Number(userData.scores?.explosivePower) || 0,
      Number(userData.scores?.cardio) || 0,
      Number(userData.scores?.muscleMass) || 0,
      Number(userData.scores?.bodyFat) || 0,
    ];
    console.log('計算平均分數的數據：', scoreValues);
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

  // 檢查 scores 是否為空，並確保數據為數值
  const scoresToUse = userData.scores || {};
  const scoreValues = {
    strength: Number(scoresToUse.strength) || 0,
    explosivePower: Number(scoresToUse.explosivePower) || 0,
    cardio: Number(scoresToUse.cardio) || 0,
    muscleMass: Number(scoresToUse.muscleMass) || 0,
    bodyFat: Number(scoresToUse.bodyFat) || 0,
  };
  const hasScores = Object.values(scoreValues).some((score) => score > 0);
  console.log('hasScores:', hasScores);
  console.log('userData.scores:', userData.scores);
  console.log('scoresToUse:', scoresToUse);
  console.log('scoreValues:', scoreValues);

  // 設置雷達圖數據，確保數據為數值
  const radarData = {
    labels: ['力量', '爆發力', '心肺耐力', '骨骼肌肉量', 'FFMI'],
    datasets: [
      {
        label: '您的表現',
        data: [
          scoreValues.strength,
          scoreValues.explosivePower,
          scoreValues.cardio,
          scoreValues.muscleMass,
          scoreValues.bodyFat,
        ],
        backgroundColor: 'rgba(34, 202, 236, 0.2)',
        borderColor: 'rgba(34, 202, 236, 1)',
        borderWidth: 2,
      },
    ],
  };

  // 設置雷達圖選項，禁用動畫以避免 eval
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
    animation: false, // 明確禁用動畫
  };

  const averageScore = calculateAverageScore();
  const scoreSlogan = getScoreSlogan(averageScore, gender);

  console.log('UserInfo 渲染, isGuestMode:', isGuestMode, 'currentUser:', currentUser, 'testData:', testData);

  return (
    <div className="user-info-container">
      {/* 顯示錯誤訊息，即使未進入訪客或登入模式 */}
      {error && <p className="error-message">{error}</p>}

      {/* 顯示登入狀態 */}
      {isGuestMode ? (
        <div className="user-status">
          <p>您正在使用訪客模式，數據不會儲存。</p>
          <button onClick={onLogout} className="signout-btn">
            返回登入頁面
          </button>
        </div>
      ) : currentUser ? (
        <div className="user-status">
          <p>歡迎，{currentUser.email}！</p>
          <button onClick={onLogout} className="signout-btn">
            登出
          </button>
        </div>
      ) : (
        <div className="mode-selection">
          <h2 className="text-xl font-semibold text-center mb-4">選擇使用模式</h2>
          <div className="button-group-mode">
            <div className="button-with-tooltip">
              <button
                onClick={() => onGuestMode()}
                className="mode-btn guest-btn"
              >
                訪客模式
              </button>
              <span className="tooltip">僅儲存到本地，重新整理後可能遺失</span>
            </div>
            <div className="button-with-tooltip">
              <button
                onClick={() => navigate('/login')}
                className="mode-btn login-btn"
              >
                登入模式
              </button>
              <span className="tooltip">將數據保存到雲端，隨時隨地訪問</span>
            </div>
          </div>
        </div>
      )}

      {/* 表單顯示 */}
      {(isGuestMode || currentUser) && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">身體狀態與表現總覽</h1>
          <form className="space-y-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">性別</label>
              <select
                id="gender"
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
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">身高 (cm)</label>
              <input
                id="height"
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
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">體重 (kg)</label>
              <input
                id="weight"
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
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">年齡</label>
              <input
                id="age"
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
                onClick={isGuestMode ? handleGuestSave : handleLoginSave}
                className={`submit-btn ${isSaved ? 'saved' : ''}`}
                disabled={loading}
              >
                {loading ? '儲存中...' : isSaved ? '已儲存' : '儲存資料'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* 顯示測驗數據 */}
      {testData && (
        <div>
          <h2 className="text-xl font-semibold text-center mb-4">最新測驗結果</h2>
          <p>類型: {testData.squat ? '力量' : testData.distance ? '心肺耐力' : '其他'}</p>
          <p>數據: {JSON.stringify(testData)}</p>
          <button onClick={clearTestData} className="nav-btn">清除測驗數據</button>
        </div>
      )}

      {/* 雷達圖和導航按鈕 */}
      <div className="radar-section">
        <h2 className="text-xl font-semibold text-center mb-4">表現總覽</h2>
        {hasScores ? (
          <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        ) : (
          <p className="error-message">請先完成至少一項評測以顯示表現總覽</p>
        )}
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
        {currentUser && !isGuestMode && (
          <button onClick={handleShowHistory} className="nav-btn history-btn">
            歷史數據
          </button>
        )}
      </div>

      {/* 模態框 */}
      {showModal && !isGuestMode && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">歷史數據</h2>
              <button onClick={handleCloseModal} className="modal-close-btn">×</button>
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

  .history-btn {
    background-color: #36a2eb;
  }

  .history-btn:hover {
    background-color: #2a82cb;
  }

  /* 模態框樣式 */
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
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .modal-close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #4b5563;
  }

  .modal-close-btn:hover {
    color: #1f2937;
  }

  .modal-body {
    padding: 1rem;
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
    padding: 0.75rem;
    font-size: 0.875rem;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
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

    .history-table th,
    .history-table td {
      font-size: 1rem;
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