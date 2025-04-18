// src/Power.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import * as standards from './standards';
import { db, auth } from './firebase'; // 引入 Firebase 配置
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // 引入模組化語法

function Power() {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { age, gender } = userData;

  // 管理輸入和結果
  const [verticalJump, setVerticalJump] = useState(''); // 垂直彈跳 (公分)
  const [standingLongJump, setStandingLongJump] = useState(''); // 立定跳遠 (公分)
  const [sprint, setSprint] = useState(''); // 100公尺衝刺跑 (秒)
  const [result, setResult] = useState({
    verticalJumpScore: null,
    standingLongJumpScore: null,
    sprintScore: null,
    finalScore: null,
  }); // 結果
  const [history, setHistory] = useState([]); // 歷史記錄
  // 新增：管理展開/收起狀態
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // 動作說明
  const [isStandardsExpanded, setIsStandardsExpanded] = useState(false); // 檢測標準說明

  // 載入歷史記錄
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('powerHistory')) || [];
    setHistory(savedHistory);
  }, []);

  // 根據年齡確定年齡段
  const getAgeRange = (age) => {
    if (!age) return null;
    const ageNum = parseInt(age);
    if (ageNum >= 12 && ageNum <= 15) return '12-15';
    if (ageNum >= 16 && ageNum <= 20) return '16-20';
    if (ageNum >= 21 && ageNum <= 30) return '21-30';
    if (ageNum >= 31 && ageNum <= 40) return '31-40';
    if (ageNum >= 41 && ageNum <= 50) return '41-50';
    if (ageNum >= 51 && ageNum <= 60) return '51-60';
    if (ageNum >= 61 && ageNum <= 70) return '61-70';
    if (ageNum >= 71 && ageNum <= 80) return '71-80';
    return null;
  };

  // 計算分數（值越大分數越高，例如垂直彈跳和立定跳遠）
  const calculateScoreIncreasing = (value, standard) => {
    if (value < standard[0]) return 0;
    if (value >= standard[100]) return 100;
    if (value < standard[50]) {
      // 0-50 分之間線性插值
      return ((value - standard[0]) / (standard[50] - standard[0])) * 50;
    }
    // 50-100 分之間線性插值
    return 50 + ((value - standard[50]) / (standard[100] - standard[50])) * 50;
  };

  // 計算分數（值越小分數越高，例如100公尺衝刺跑）
  const calculateScoreDecreasing = (value, standard) => {
    if (value > standard[0]) return 0;
    if (value <= standard[100]) return 100;
    if (value > standard[50]) {
      // 0-50 分之間線性插值
      return ((standard[0] - value) / (standard[0] - standard[50])) * 50;
    }
    // 50-100 分之間線性插值
    return 50 + ((standard[50] - value) / (standard[50] - standard[100])) * 50;
  };

  // 計算爆發力分數
  const calculatePowerScore = () => {
    if (!age || !gender) {
      alert('請確保已在用戶信息中輸入年齡和性別！');
      return;
    }

    // 檢查是否至少輸入了一項
    if (!verticalJump && !standingLongJump && !sprint) {
      alert('請至少輸入一項動作數據！');
      return;
    }

    const ageRange = getAgeRange(age);
    if (!ageRange) {
      alert('請輸入有效的年齡！');
      return;
    }

    // 處理輸入值，未輸入的項目保持為空（不設為 0）
    const verticalJumpNum = verticalJump ? parseFloat(verticalJump) : null;
    const standingLongJumpNum = standingLongJump ? parseFloat(standingLongJump) : null;
    const sprintNum = sprint ? parseFloat(sprint) : null;

    // 根據性別和年齡選擇標準
    const genderValue = gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : gender === '女性' || gender.toLowerCase() === 'female' ? 'female' : null;
    const verticalJumpStandards = genderValue === 'male' ? standards.verticalJumpStandardsMale : standards.verticalJumpStandardsFemale;
    const standingLongJumpStandards = genderValue === 'male' ? standards.standingLongJumpStandardsMale : standards.standingLongJumpStandardsFemale;
    const sprintStandards = genderValue === 'male' ? standards.sprintStandardsMale : standards.sprintStandardsFemale;

    const verticalJumpStandard = verticalJumpStandards[ageRange];
    const standingLongJumpStandard = standingLongJumpStandards[ageRange];
    const sprintStandard = sprintStandards[ageRange];

    if (!verticalJumpStandard || !standingLongJumpStandard || !sprintStandard) {
      alert('無法找到對應的評測標準，請檢查年齡和性別！');
      return;
    }

    // 計算各動作分數，未輸入的項目分數設為 null
    const verticalJumpScore = verticalJumpNum !== null ? calculateScoreIncreasing(verticalJumpNum, verticalJumpStandard) : null;
    const standingLongJumpScore = standingLongJumpNum !== null ? calculateScoreIncreasing(standingLongJumpNum, standingLongJumpStandard) : null;
    const sprintScore = sprintNum !== null ? calculateScoreDecreasing(sprintNum, sprintStandard) : null;

    // 收集有分數的項目
    const scores = [verticalJumpScore, standingLongJumpScore, sprintScore].filter(score => score !== null);
    if (scores.length === 0) {
      alert('請至少完成一項動作的測量！');
      return;
    }

    // 計算最終分數：只平均有分數的項目
    const finalScore = (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(0);

    setResult({
      verticalJumpScore: verticalJumpScore ? verticalJumpScore.toFixed(0) : null,
      standingLongJumpScore: standingLongJumpScore ? standingLongJumpScore.toFixed(0) : null,
      sprintScore: sprintScore ? sprintScore.toFixed(0) : null,
      finalScore,
    });
  };

  // 提交結果並儲存
  const handleSubmit = async () => {
    if (!result.finalScore) {
      alert('請先計算爆發力分數！');
      return;
    }

    // 確認用戶已登入
    const user = auth.currentUser;
    if (!user) {
      alert('請先登入！');
      return;
    }

    // 儲存歷史記錄，對於未輸入的項目設為 0
    const newHistoryEntry = {
      date: new Date().toLocaleString(),
      verticalJump: verticalJump ? parseFloat(verticalJump) : 0,
      standingLongJump: standingLongJump ? parseFloat(standingLongJump) : 0,
      sprint: sprint ? parseFloat(sprint) : 0, // 歷史記錄顯示為 0 秒
      verticalJumpScore: result.verticalJumpScore || 0,
      standingLongJumpScore: result.standingLongJumpScore || 0,
      sprintScore: result.sprintScore || 0,
      finalScore: result.finalScore,
    };

    // 儲存到 Firebase
    try {
      const userHistoryRef = collection(db, 'users', user.uid, 'history');
      await addDoc(userHistoryRef, {
        timestamp: serverTimestamp(),
        type: 'power',
        data: newHistoryEntry,
      });
      console.log('數據成功儲存到 Firebase！');
    } catch (error) {
      console.error('儲存到 Firebase 失敗:', error);
      alert('儲存數據失敗，請稍後再試！');
      return;
    }

    // 儲存到本地歷史記錄
    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);
    localStorage.setItem('powerHistory', JSON.stringify(updatedHistory));

    // 更新 UserContext
    setUserData({
      ...userData,
      scores: {
        ...userData.scores,
        explosivePower: parseFloat(result.finalScore),
      },
    });

    navigate('/user-info');
  };

  return (
    <div className="power-container">
      {/* 上半部：數據輸入和分數顯示 */}
      <div className="input-section">
        <h1 className="text-2xl font-bold text-center mb-4">爆發力測試</h1>
        <p>年齡：{age || '未輸入'}</p>
        <p>性別：{gender || '未選擇'}</p>

        <div className="exercise-section">
          <h2 className="text-lg font-semibold">爆發力動作</h2>
          <input
            type="number"
            placeholder="垂直彈跳 (公分)"
            value={verticalJump}
            onChange={(e) => setVerticalJump(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="立定跳遠 (公分)"
            value={standingLongJump}
            onChange={(e) => setStandingLongJump(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="100公尺衝刺跑 (秒)"
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
            className="input-field"
          />
          <button onClick={calculatePowerScore} className="calculate-btn">
            計算
          </button>
          {result.finalScore && (
            <>
              {result.verticalJumpScore && <p className="score-display">垂直彈跳分數: {result.verticalJumpScore}</p>}
              {result.standingLongJumpScore && <p className="score-display">立定跳遠分數: {result.standingLongJumpScore}</p>}
              {result.sprintScore && <p className="score-display">100公尺衝刺跑分數: {result.sprintScore}</p>}
              <p className="score-display">最終分數: {result.finalScore}</p>
            </>
          )}
        </div>

        {/* 動作說明與檢測標準說明 */}
        <div className="description-section">
          {/* 修改：將動作說明改為可展開/收起的卡片 */}
          <div className="description-card">
            <div
              className="description-header"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <h2 className="text-lg font-semibold">動作說明</h2>
              <span className={`arrow ${isDescriptionExpanded ? 'expanded' : ''}`}>
                {isDescriptionExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isDescriptionExpanded && (
              <div className="description-content">
                <p className="exercise-title">垂直彈跳</p>
                <p className="exercise-description">測量垂直跳躍高度，反映下肢爆發力。站立時伸手觸及最高點，然後全力跳起觸及最高點，兩者高度差即為垂直彈跳高度（單位：公分）。</p>
                <p className="exercise-title mt-2">立定跳遠</p>
                <p className="exercise-description">測量站立跳躍距離，反映下肢力量和協調性。雙腳站立於起跳線，無助跑直接跳出，測量起跳線(腳尖)到著地點(腳跟)最近處的距離（單位：公分）。</p>
                <p className="exercise-title mt-2">100公尺衝刺跑</p>
                <p className="exercise-description">測量短距離衝刺速度，反映全身爆發力和速度。從靜止起跑，盡全力衝刺100公尺，記錄完成時間（單位：秒）。</p>
                <p className="mt-2 text-sm text-gray-600">
                  建議：測量前充分熱身，避免受傷。使用專業設備或在標準場地進行測量以確保準確性。
                </p>
              </div>
            )}
          </div>

          {/* 修改：將檢測標準說明改為可展開/收起的卡片 */}
          <div className="standards-card">
            <div
              className="standards-header"
              onClick={() => setIsStandardsExpanded(!isStandardsExpanded)}
            >
              <h2 className="text-lg font-semibold">檢測標準說明</h2>
              <span className={`arrow ${isStandardsExpanded ? 'expanded' : ''}`}>
                {isStandardsExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isStandardsExpanded && (
              <div className="standards-content">
                <p className="font-semibold">來源：</p>
                <p>參考教育部體育署體適能網站、美國運動醫學會（ACSM）、世界田徑協會及全國中等學校運動會田徑標準。</p>
                <p className="font-semibold mt-2">依據：</p>
                <ul className="list-disc pl-5">
                  <li>原地垂直彈跳：ACSM標準與青少年數據。</li>
                  <li>立定跳遠：教育部常模與ACSM衰退研究。</li>
                  <li>100公尺衝刺跑：世界田徑與全國運動會標準。</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  本測驗包含推測值：12-80歲全齡數據不全，依ACSM每10年下降10-15%、性別差異70-90%推估。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 歷史記錄 */}
        {history.length > 0 && (
          <div className="history-section">
            <h2 className="text-lg font-semibold">歷史記錄</h2>
            <ul className="history-list">
              {history.map((entry, index) => (
                <li key={index} className="history-item">
                  <p>日期: {entry.date}</p>
                  <p>垂直彈跳: {entry.verticalJump} 公分 (分數: {entry.verticalJumpScore})</p>
                  <p>立定跳遠: {entry.standingLongJump} 公分 (分數: {entry.standingLongJumpScore})</p>
                  <p>100公尺衝刺跑: {entry.sprint} 秒 (分數: {entry.sprintScore})</p>
                  <p>最終分數: {entry.finalScore}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 按鈕 */}
      <div className="button-group">
        <button onClick={handleSubmit} className="submit-btn">
          提交並返回總覽
        </button>
      </div>
    </div>
  );
}

export default Power;

// 響應式 CSS
const styles = `
  .power-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .input-section {
    margin-bottom: 2rem;
  }

  .exercise-section {
    margin-bottom: 1.5rem;
  }

  .input-field {
    width: 100%;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  .calculate-btn {
    width: 100%;
    padding: 0.5rem;
    background-color: #4bc0c0;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .calculate-btn:hover {
    background-color: #3aa0a0;
  }

  .score-display {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1E90FF;
    margin-top: 0.5rem;
  }

  .description-section {
    margin-top: 2rem;
  }

  /* 修改：卡片式設計的樣式（共用於動作說明和檢測標準說明） */
  .description-card, .standards-card {
    margin-bottom: 1.5rem;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .description-header, .standards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    cursor: pointer;
    background-color: #f1f1f1;
    transition: background-color 0.3s ease;
  }

  .description-header:hover, .standards-header:hover {
    background-color: #e0e0e0;
  }

  .description-content, .standards-content {
    padding: 1rem;
    background-color: #fff;
    transition: max-height 0.3s ease, padding 0.3s ease;
    line-height: 1.6;
  }

  .arrow {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }

  .arrow.expanded {
    transform: rotate(180deg);
  }

  .exercise-title {
    font-size: 1.125rem; /* 比內文稍大 */
    font-weight: 600;
    color: #333;
  }

  .exercise-description {
    font-size: 1rem;
    color: #555;
  }

  .history-section {
    margin-top: 1.5rem;
  }

  .history-list {
    list-style: none;
    padding: 0;
  }

  .history-item {
    background-color: #fff;
    padding: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .submit-btn {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: #4bc0c0;
  }

  .submit-btn:hover {
    background-color: #3aa0a0;
  }

  @media (max-width: 767px) {
    .score-display {
      font-size: 1.25rem;
    }

    .description-content, .standards-content {
      font-size: 0.9rem;
    }

    .exercise-title {
      font-size: 1rem;
    }

    .exercise-description {
      font-size: 0.875rem;
    }
  }

  @media (min-width: 768px) {
    .power-container {
      max-width: 800px;
    }

    .button-group {
      flex-direction: row;
      justify-content: space-between;
    }

    .submit-btn {
      width: 48%;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);