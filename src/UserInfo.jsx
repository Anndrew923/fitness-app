import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { auth } from './firebase';
import PropTypes from 'prop-types';
import {
  calculateLadderScore,
  getAgeGroup,
  validateNickname,
  generateNickname,
} from './utils';
import './styles.css';

const DEFAULT_SCORES = {
  strength: 0,
  explosivePower: 0,
  cardio: 0,
  muscleMass: 0,
  bodyFat: 0,
};

const GENDER_OPTIONS = ['male', 'female'];

function UserInfo({ testData, onLogout, clearTestData }) {
  const {
    userData,
    setUserData,
    saveUserData,
    saveHistory,
    loadUserData,
    isLoading,
  } = useUser();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const radarSectionRef = useRef(null);

  const radarChartData = useMemo(() => {
    const scores = userData.scores || DEFAULT_SCORES;
    return [
      { name: '力量', value: scores.strength || 0 },
      { name: '爆發力', value: scores.explosivePower || 0 },
      { name: '心肺耐力', value: scores.cardio || 0 },
      { name: '骨骼肌肉量', value: scores.muscleMass || 0 },
      { name: 'FFMI', value: scores.bodyFat || 0 },
    ];
  }, [userData.scores]);

  const isGuest = sessionStorage.getItem('guestMode') === 'true';
  // 監聽認證狀態
  useEffect(() => {
    if (!auth) {
      setError('無法初始化身份驗證，請檢查 Firebase 配置並稍後再試。');
      console.error('auth 未初始化');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('UserInfo - 認證狀態變更:', user?.email);
      setCurrentUser(user);
      if (!user && !isGuest) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate, isGuest]);

  // 確保資料載入完成
  useEffect(() => {
    const checkDataLoaded = async () => {
      if (currentUser && !dataLoaded && !isLoading) {
        console.log('UserInfo - 檢查資料載入狀態');

        // 如果資料為空，嘗試重新載入
        if (!userData.height && !userData.weight && !userData.age) {
          console.log('UserInfo - 資料為空，嘗試重新載入');
          await loadUserData();
        }

        setDataLoaded(true);
      }
    };

    checkDataLoaded();
  }, [currentUser, dataLoaded, isLoading, userData, loadUserData]);

  // 處理從評測頁面返回時自動滾動到雷達圖
  useEffect(() => {
    // 檢查是否從評測頁面返回
    const fromTestPages = [
      '/strength',
      '/explosive-power',
      '/cardio',
      '/muscle-mass',
      '/body-fat',
    ];
    const previousPath = location.state?.from;

    if (previousPath && fromTestPages.includes(previousPath)) {
      // 延遲執行以確保頁面完全載入
      setTimeout(() => {
        if (radarSectionRef.current) {
          radarSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 300);
    }
  }, [location]);

  // 處理 testData 更新
  useEffect(() => {
    if (testData && Object.keys(testData).length > 0) {
      console.log('收到測試數據:', testData);

      // 使用 setUserData 更新分數
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
  }, [testData, setUserData, clearTestData]);

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
      setError('請選擇有效的性別');
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
        ...userData,
        height: Number(userData.height) || 0,
        weight: Number(userData.weight) || 0,
        age: Number(userData.age) || 0,
        gender: userData.gender,
        scores: userData.scores || DEFAULT_SCORES,
      };

      try {
        const success = await saveUserData(updatedUserData);
        if (success) {
          alert('資料已儲存成功！');
        } else {
          // 僅登入用戶才顯示錯誤，訪客模式不顯示
          if (!isGuest) {
            setError('儲存失敗，請稍後再試');
          }
        }
      } catch (err) {
        if (!isGuest) {
          setError(`儲存失敗：${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [userData, validateData, saveUserData, isGuest]
  );

  const averageScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    const scoreValues = Object.values(scores).filter(score => score > 0);
    const avg = scoreValues.length
      ? (
          scoreValues.reduce((sum, score) => sum + score, 0) /
          scoreValues.length
        ).toFixed(0)
      : 0;
    return avg;
  }, [userData?.scores]);

  // 計算天梯分數
  const ladderScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    return calculateLadderScore(scores);
  }, [userData?.scores]);

  // 計算年齡段
  const ageGroup = useMemo(() => {
    return userData?.age ? getAgeGroup(userData.age) : '';
  }, [userData?.age]);

  // 處理暱稱變更
  const handleNicknameChange = e => {
    const nickname = e.target.value;

    // 允許自由輸入，不進行即時驗證
    setUserData(prev => ({
      ...prev,
      nickname: nickname,
      ageGroup: ageGroup,
      ladderScore: ladderScore,
    }));
  };

  // 生成預設暱稱
  const handleGenerateNickname = () => {
    const email = auth.currentUser?.email;
    const generatedNickname = generateNickname(email);
    setUserData(prev => ({
      ...prev,
      nickname: generatedNickname,
    }));
  };

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
        // 傳遞當前路徑作為狀態，以便返回時知道從哪裡來
        navigate(path, { state: { from: '/user-info' } });
      } else {
        setError('請確保資料已正確保存後再進行評測！');
      }
    },
    [userData, validateData, navigate]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');

    if (auth.currentUser) {
      auth.signOut().catch(err => console.error('登出失敗:', err));
    }

    onLogout();
    navigate('/login');
  }, [onLogout, navigate]);

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
    const slogan =
      userData?.gender === 'male' ? slogansMale[index] : slogansFemale[index];
    return slogan;
  }, [averageScore, userData?.gender]);

  // 處理輸入變更
  const handleInputChange = useCallback(
    e => {
      const { name, value } = e.target;
      let processedValue = value;

      if (name !== 'gender') {
        processedValue = value === '' ? 0 : Number(value);
      }

      setUserData(prev => ({
        ...prev,
        [name]: processedValue,
      }));
    },
    [setUserData]
  );

  // 顯示載入中狀態
  if (isLoading && !dataLoaded) {
    return (
      <div className="user-info-container">
        <div className="loading-message">
          <p>正在載入用戶資料...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-container">
      {error && <p className="error-message">{error}</p>}

      {/* 只保留 currentUser 狀態區塊，移除載入提示 */}
      {(currentUser || isGuest) && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">
            身體狀態與表現總覽
          </h1>
          <form className="space-y-4" onSubmit={saveData}>
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700"
              >
                暱稱
              </label>
              <div
                className="nickname-input-group"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  value={userData?.nickname || ''}
                  onChange={handleNicknameChange}
                  placeholder="請輸入暱稱"
                  className="input-field"
                  maxLength="20"
                />
                <button
                  type="button"
                  onClick={handleGenerateNickname}
                  className="generate-nickname-btn"
                >
                  生成暱稱
                </button>
                {currentUser && (
                  <div
                    style={{ position: 'relative', display: 'inline-block' }}
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="登出"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#ff6f61',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        marginLeft: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(255,111,97,0.08)',
                      }}
                      onMouseEnter={e => {
                        const tooltip = document.createElement('div');
                        tooltip.innerText = '登出';
                        tooltip.style.position = 'absolute';
                        tooltip.style.bottom = '44px';
                        tooltip.style.left = '50%';
                        tooltip.style.transform = 'translateX(-50%)';
                        tooltip.style.background = 'rgba(60,60,60,0.95)';
                        tooltip.style.color = '#fff';
                        tooltip.style.padding = '6px 14px';
                        tooltip.style.borderRadius = '6px';
                        tooltip.style.fontSize = '13px';
                        tooltip.style.whiteSpace = 'nowrap';
                        tooltip.style.pointerEvents = 'none';
                        tooltip.style.zIndex = '1001';
                        tooltip.className = 'logout-tooltip';
                        e.currentTarget.parentNode.appendChild(tooltip);
                      }}
                      onMouseLeave={e => {
                        const tooltip =
                          e.currentTarget.parentNode.querySelector(
                            '.logout-tooltip'
                          );
                        if (tooltip) tooltip.remove();
                      }}
                    >
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        ⎋
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
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
                min="0"
                step="0.1"
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
                min="0"
                step="0.1"
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
                min="0"
                step="1"
              />
            </div>
            <div className="button-group-submit">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '儲存中...' : '儲存資料'}
              </button>
            </div>
          </form>
        </>
      )}

      <div id="radar-section" className="radar-section" ref={radarSectionRef}>
        <h2 className="text-xl font-semibold text-center mb-4">表現總覽</h2>
        {loading ? (
          <p>正在載入數據...</p>
        ) : (
          <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarChartData}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 14 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={5} />
                <Radar
                  name="您的表現"
                  dataKey="value"
                  stroke="#22CAEC"
                  fill="#22CAEC"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {averageScore > 0 && !loading && (
          <div className="score-section">
            <p className="average-score">
              平均分數: <span className="score-value">{averageScore}</span>
            </p>
            <p className="score-slogan">{scoreSlogan}</p>
          </div>
        )}
      </div>

      <div className="save-button-container">
        <button onClick={handleSaveResults} className="save-results-btn">
          儲存結果至歷史紀錄
        </button>
      </div>

      <div className="button-group" style={{ marginTop: '40px' }}>
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
      </div>
    </div>
  );
}

UserInfo.propTypes = {
  testData: PropTypes.shape({
    distance: PropTypes.number,
    score: PropTypes.number,
    squat: PropTypes.number,
    averageScore: PropTypes.number,
    jumpHeight: PropTypes.number,
    finalScore: PropTypes.number,
    smm: PropTypes.number,
    bodyFat: PropTypes.number,
    ffmiScore: PropTypes.number,
  }),
  onLogout: PropTypes.func.isRequired,
  clearTestData: PropTypes.func.isRequired,
};

export default UserInfo;
