// src/Strength.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import * as standards from './standards'; // 導入基準標準

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function Strength() {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { gender, height, weight, age } = userData;

  const [benchPress, setBenchPress] = useState({ weight: '', reps: '', max: null, score: null });
  const [squat, setSquat] = useState({ weight: '', reps: '', max: null, score: null });
  const [deadlift, setDeadlift] = useState({ weight: '', reps: '', max: null, score: null });
  const [latPulldown, setLatPulldown] = useState({ weight: '', reps: '', max: null, score: null });
  const [shoulderPress, setShoulderPress] = useState({ weight: '', reps: '', max: null, score: null });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('strengthHistory')) || [];
    setHistory(savedHistory);
  }, []);

  const calculateScore = (value, standard) => {
    const { Beginner, Novice, Intermediate, Advanced, Elite } = standard;
    if (value < Beginner) return 0;
    if (value >= Beginner && value < Novice) return 20 + (40 - 20) * (value - Beginner) / (Novice - Beginner);
    if (value >= Novice && value < Intermediate) return 40 + (60 - 40) * (value - Novice) / (Intermediate - Novice);
    if (value >= Intermediate && value < Advanced) return 60 + (80 - 60) * (value - Intermediate) / (Advanced - Intermediate);
    if (value >= Advanced && value < Elite) return 80 + (100 - 80) * (value - Advanced) / (Elite - Advanced);
    return 100;
  };

  const standardMap = {
    benchPress: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleBenchPress : standards.bodyweightStandardsMaleBenchPress,
      age: gender === 'female' ? standards.ageStandardsFemaleBenchPress : standards.ageStandardsMaleBenchPress,
    },
    squat: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleSquat : standards.bodyweightStandardsMaleSquat,
      age: gender === 'female' ? standards.ageStandardsFemaleSquat : standards.ageStandardsMaleSquat,
    },
    deadlift: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleDeadlift : standards.bodyweightStandardsMaleDeadlift,
      age: gender === 'female' ? standards.ageStandardsFemaleDeadlift : standards.ageStandardsMaleDeadlift,
    },
    latPulldown: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleLatPulldown : standards.bodyweightStandardsMaleLatPulldown,
      age: gender === 'female' ? standards.ageStandardsFemaleLatPulldown : standards.ageStandardsMaleLatPulldown,
    },
    shoulderPress: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleShoulderPress : standards.bodyweightStandardsMaleShoulderPress,
      age: gender === 'female' ? standards.ageStandardsFemaleShoulderPress : standards.ageStandardsMaleShoulderPress,
    },
  };

  const calculateMaxStrength = (weight, reps, setState, type) => {
    if (!weight || !reps) {
      alert('請輸入重量和次數！');
      return;
    }

    const weightNum = parseFloat(weight);
    const repsNum = parseFloat(reps);
    const userWeight = parseFloat(userData.weight);
    const userAge = parseFloat(userData.age);

    if (!userWeight || !userAge) {
      alert('請確保已輸入有效的體重和年齡！');
      return;
    }

    if (repsNum > 12) {
      alert('可完成次數不得超過12次，請重新輸入！');
      setState((prev) => ({ ...prev, reps: '' }));
      return;
    }

    const valueToCompare = weightNum / (1.0278 - 0.0278 * repsNum);

    const standardsForType = standardMap[type];
    const weightKeys = Object.keys(standardsForType.bodyweight).map(Number);
    const ageKeys = Object.keys(standardsForType.age).map(Number);

    const closestWeight = weightKeys.reduce((prev, curr) =>
      Math.abs(curr - userWeight) < Math.abs(prev - userWeight) ? curr : prev
    );
    const closestAge = ageKeys.reduce((prev, curr) =>
      Math.abs(curr - userAge) < Math.abs(prev - userAge) ? curr : prev
    );

    const bodyweightStandard = standardsForType.bodyweight[closestWeight];
    const ageStandard = standardsForType.age[closestAge];

    const scoreByBodyweight = calculateScore(valueToCompare, bodyweightStandard);
    const scoreByAge = calculateScore(valueToCompare, ageStandard);
    const finalScore = ((scoreByBodyweight + scoreByAge) / 2).toFixed(0);

    setState((prev) => ({
      ...prev,
      max: valueToCompare.toFixed(1),
      score: finalScore,
    }));
  };

  const getAverageScoreComment = (score, gender) => {
    const genderValue = gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    let comment = '';

    if (score >= 80) {
      comment = genderValue === 'male' ? '無敵強者！你是力量之王，繼續稱霸！' : '太驚艷了！你是力量女神，超棒的！';
    } else if (score >= 70) {
      comment = genderValue === 'male' ? '超猛表現！頂尖水準，衝向巔峰吧！' : '真的很傑出！表現超棒，繼續保持哦！';
    } else if (score >= 60) {
      comment = genderValue === 'male' ? '很強！超越業餘極限，再拼一把！' : '表現超棒！超越大多數人，你很厲害！';
    } else if (score >= 50) {
      comment = genderValue === 'male' ? '不錯的水準！再加把勁，突破極限！' : '很棒的水準！再努力一點，你會更好！';
    } else {
      comment = genderValue === 'male' ? '兄弟，該衝了！全力以赴，突破自己！' : '親愛的，還有進步空間，繼續加油哦！';
    }

    return comment;
  };

  const radarData = {
    labels: ['臥推', '深蹲', '硬舉', '滑輪下拉', '站姿肩推'],
    datasets: [
      {
        label: '力量評測分數',
        data: [
          benchPress.score || 0,
          squat.score || 0,
          deadlift.score || 0,
          latPulldown.score || 0,
          shoulderPress.score || 0,
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
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

  const scores = [
    benchPress.score,
    squat.score,
    deadlift.score,
    latPulldown.score,
    shoulderPress.score,
  ].filter((score) => score !== null);
  const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + parseFloat(b), 0) / scores.length).toFixed(0) : null;

  const handleSubmit = () => {
    if (!averageScore) {
      alert('請至少完成一項評測！');
      return;
    }

    const newHistoryEntry = {
      date: new Date().toLocaleString(),
      benchPress: benchPress.score,
      squat: squat.score,
      deadlift: deadlift.score,
      latPulldown: latPulldown.score,
      shoulderPress: shoulderPress.score,
      averageScore,
      comment: getAverageScoreComment(averageScore, gender),
    };

    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);
    localStorage.setItem('strengthHistory', JSON.stringify(updatedHistory));

    setUserData({
      ...userData,
      scores: {
        ...userData.scores,
        strength: parseFloat(averageScore),
      },
    });

    navigate('/user-info');
  };

  return (
    <div className="strength-container">
      <h1 className="text-2xl font-bold text-center mb-4">力量評測</h1>
      <p>性別：{gender || '未選擇'}</p>
      <p>身高：{height ? `${height} 公分` : '未輸入'}</p>
      <p>體重：{weight ? `${weight} 公斤` : '未輸入'}</p>
      <p>年齡：{age || '未輸入'}</p>

      <div className="instructions-btn-container">
        <button onClick={() => navigate('/strength-instructions')} className="nav-btn">
          動作說明
        </button>
      </div>

      {/* 新增評測標準說明區塊 */}
      <div className="standards-description">
        <h2 className="text-lg font-semibold mb-2">評測標準說明</h2>
        <p>
          我們的評測標準基於 Strength Level 用戶提供的超過 1.34 億次舉重數據，涵蓋男女標準，適用於臥推、深蹲、硬舉、肩推等多項健身動作。
        </p>
        <p className="mt-2 text-sm text-gray-600">
          來源：<a href="https://strengthlevel.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://strengthlevel.com/</a>
        </p>
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">臥推</h2>
        <input
          type="number"
          placeholder="重量 (kg)"
          value={benchPress.weight}
          onChange={(e) => setBenchPress((prev) => ({ ...prev, weight: e.target.value }))}
          className="input-field"
        />
        <input
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={benchPress.reps}
          onChange={(e) => setBenchPress((prev) => ({ ...prev, reps: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => calculateMaxStrength(benchPress.weight, benchPress.reps, setBenchPress, 'benchPress')} className="calculate-btn">
          計算
        </button>
        {benchPress.max && <p>最大力量 (1RM): {benchPress.max} kg</p>}
        {benchPress.score && <p className="score-display">分數: {benchPress.score}</p>}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">深蹲</h2>
        <input
          type="number"
          placeholder="重量 (kg)"
          value={squat.weight}
          onChange={(e) => setSquat((prev) => ({ ...prev, weight: e.target.value }))}
          className="input-field"
        />
        <input
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={squat.reps}
          onChange={(e) => setSquat((prev) => ({ ...prev, reps: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => calculateMaxStrength(squat.weight, squat.reps, setSquat, 'squat')} className="calculate-btn">
          計算
        </button>
        {squat.max && <p>最大力量 (1RM): {squat.max} kg</p>}
        {squat.score && <p className="score-display">分數: {squat.score}</p>}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">硬舉</h2>
        <input
          type="number"
          placeholder="重量 (kg)"
          value={deadlift.weight}
          onChange={(e) => setDeadlift((prev) => ({ ...prev, weight: e.target.value }))}
          className="input-field"
        />
        <input
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={deadlift.reps}
          onChange={(e) => setDeadlift((prev) => ({ ...prev, reps: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => calculateMaxStrength(deadlift.weight, deadlift.reps, setDeadlift, 'deadlift')} className="calculate-btn">
          計算
        </button>
        {deadlift.max && <p>最大力量 (1RM): {deadlift.max} kg</p>}
        {deadlift.score && <p className="score-display">分數: {deadlift.score}</p>}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">滑輪下拉</h2>
        <input
          type="number"
          placeholder="重量 (kg)"
          value={latPulldown.weight}
          onChange={(e) => setLatPulldown((prev) => ({ ...prev, weight: e.target.value }))}
          className="input-field"
        />
        <input
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={latPulldown.reps}
          onChange={(e) => setLatPulldown((prev) => ({ ...prev, reps: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => calculateMaxStrength(latPulldown.weight, latPulldown.reps, setLatPulldown, 'latPulldown')} className="calculate-btn">
          計算
        </button>
        {latPulldown.max && <p>最大力量: {latPulldown.max} kg</p>}
        {latPulldown.score && <p className="score-display">分數: {latPulldown.score}</p>}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">站姿肩推</h2>
        <input
          type="number"
          placeholder="重量 (kg)"
          value={shoulderPress.weight}
          onChange={(e) => setShoulderPress((prev) => ({ ...prev, weight: e.target.value }))}
          className="input-field"
        />
        <input
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={shoulderPress.reps}
          onChange={(e) => setShoulderPress((prev) => ({ ...prev, reps: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => calculateMaxStrength(shoulderPress.weight, shoulderPress.reps, setShoulderPress, 'shoulderPress')} className="calculate-btn">
          計算
        </button>
        {shoulderPress.max && <p>最大力量 (1RM): {shoulderPress.max} kg</p>}
        {shoulderPress.score && <p className="score-display">分數: {shoulderPress.score}</p>}
      </div>

      <div className="radar-chart">
        <Radar data={radarData} options={radarOptions} />
      </div>
      {averageScore && (
        <div className="average-score-section">
          <p className="average-score-display">平均分數: {averageScore}</p>
          <p className="average-score-display">{getAverageScoreComment(averageScore, gender)}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-section">
          <h2 className="text-lg font-semibold">歷史記錄</h2>
          <ul className="history-list">
            {history.map((entry, index) => (
              <li key={index} className="history-item">
                <p>日期: {entry.date}</p>
                <p>臥推: {entry.benchPress}</p>
                <p>深蹲: {entry.squat}</p>
                <p>硬舉: {entry.deadlift}</p>
                <p>滑輪下拉: {entry.latPulldown}</p>
                <p>站姿肩推: {entry.shoulderPress}</p>
                <p>平均分數: {entry.averageScore}</p>
                <p>評語: {entry.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="button-group">
        <button onClick={handleSubmit} className="submit-btn">
          提交並返回總覽
        </button>
      </div>
    </div>
  );
}

export default Strength;

// 響應式 CSS
const styles = `
  .strength-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    color: #1E90FF; /* 亮眼的藍色 */
    margin-top: 0.5rem;
  }

  .average-score-section {
    text-align: center;
    margin: 1rem 0;
  }

  .average-score-display {
    font-size: 2rem;
    font-weight: bold;
    color: #1E90FF; /* 亮眼的藍色 */
    margin-top: 0.5rem;
  }

  .radar-chart {
    max-width: 100%;
    margin: 1.5rem 0;
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
  }

  .instructions-btn-container {
    margin-bottom: 1rem;
  }

  .standards-description {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .nav-btn, .submit-btn {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .nav-btn {
    background-color: #666;
  }

  .nav-btn:hover {
    background-color: #555;
  }

  .submit-btn {
    background-color: #4bc0c0;
  }

  .submit-btn:hover {
    background-color: #3aa0a0;
  }

  @media (max-width: 767px) {
    .score-display {
      font-size: 1.25rem; /* 手機端稍小 */
    }

    .average-score-display {
      font-size: 1.5rem; /* 手機端稍小 */
      word-break: break-word; /* 自動換行 */
    }

    .standards-description {
      font-size: 0.9rem;
    }
  }

  @media (min-width: 768px) {
    .strength-container {
      max-width: 800px;
    }

    .button-group {
      flex-direction: row;
      justify-content: space-between;
    }

    .nav-btn, .submit-btn {
      width: 48%;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);