import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import * as standards from './standards';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Muscle() {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { weight, age, gender } = userData;

  // 管理骨骼肌肉量輸入和結果
  const [smm, setSmm] = useState(userData.testInputs?.muscle?.smm || '');
  const [result, setResult] = useState({
    smmScore: null,
    smPercent: null,
    smPercentScore: null,
    finalScore: null,
  });

  // 當 smm 變化時，保存到 userData.testInputs
  useEffect(() => {
    if (smm) {
      const updatedTestInputs = {
        ...userData.testInputs,
        muscle: {
          ...userData.testInputs?.muscle,
          smm,
        },
      };
      setUserData({ ...userData, testInputs: updatedTestInputs });
    }
  }, [smm, userData, setUserData]);

  // 根據年齡確定年齡段
  const getAgeRange = age => {
    if (!age) return null;
    const ageNum = parseInt(age);
    if (ageNum >= 10 && ageNum <= 12) return '10-12';
    if (ageNum >= 13 && ageNum <= 17) return '13-17';
    if (ageNum >= 18 && ageNum <= 30) return '18-30';
    if (ageNum >= 31 && ageNum <= 40) return '31-40';
    if (ageNum >= 41 && ageNum <= 50) return '41-50';
    if (ageNum >= 51 && ageNum <= 60) return '51-60';
    if (ageNum >= 61 && ageNum <= 70) return '61-70';
    if (ageNum >= 71 && ageNum <= 80) return '71-80';
    return null;
  };

  // 根據標準計算分數
  const calculateScoreFromStandard = (value, standard, label) => {
    console.log(`[${label}] 比較值：`, value, '標準：', standard);
    if (value >= standard[100]) return 100;
    if (value >= standard[90]) return 90;
    if (value >= standard[80]) return 80;
    if (value >= standard[70]) return 70;
    if (value >= standard[60]) return 60;
    if (value >= standard[50]) return 50;
    if (value >= standard[40]) return 40;
    if (value >= standard[30]) return 30;
    if (value >= standard[20]) return 20;
    if (value >= standard[10]) return 10;
    if (value >= standard[0]) return 0;
    return 0; // 小於最低標準得 0 分
  };

  // 計算骨骼肌肉量分數
  const calculateMuscleScore = () => {
    if (!weight || !smm || !age || !gender) {
      alert('請確保已在用戶信息中輸入體重、年齡和性別，並在此輸入骨骼肌肉量！');
      return;
    }

    const weightNum = parseFloat(weight);
    const smmNum = parseFloat(smm);
    const ageRange = getAgeRange(age);

    if (!weightNum || !smmNum || !ageRange) {
      alert('請輸入有效的體重、骨骼肌肉量和年齡！');
      return;
    }

    // 計算 SM% (骨骼肌肉量百分比)
    const smPercent = ((smmNum / weightNum) * 100).toFixed(1);

    // 根據性別和年齡選擇標準
    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male'
        ? 'male'
        : gender === '女性' || gender.toLowerCase() === 'female'
          ? 'female'
          : null;
    const smmStandards =
      genderValue === 'male'
        ? standards.muscleStandardsMaleSMM
        : standards.muscleStandardsFemaleSMM;
    const smPercentStandards =
      genderValue === 'male'
        ? standards.muscleStandardsMaleSMPercent
        : standards.muscleStandardsFemaleSMPercent;

    const smmStandard = smmStandards[ageRange];
    const smPercentStandard = smPercentStandards[ageRange];

    if (!smmStandard || !smPercentStandard) {
      alert('無法找到對應的評測標準，請檢查年齡和性別！');
      return;
    }

    // 日誌：顯示輸入值和選擇的標準
    console.log('輸入值：', {
      weightNum,
      smmNum,
      smPercent,
      ageRange,
      genderValue,
    });
    console.log('SMM 標準：', smmStandard);
    console.log('SM% 標準：', smPercentStandard);

    // 計算 SMM 分數和 SM% 分數
    const smmScore = calculateScoreFromStandard(smmNum, smmStandard, 'SMM');
    const smPercentScore = calculateScoreFromStandard(
      parseFloat(smPercent),
      smPercentStandard,
      'SM%'
    );

    // 日誌：顯示計算結果
    console.log('計算結果：', { smmScore, smPercentScore });

    // 最終分數 = (SMM 分數 + SM% 分數) / 2
    const finalScore = ((smmScore + smPercentScore) / 2).toFixed(0);

    // 日誌：顯示最終分數
    console.log('最終分數：', finalScore);

    setResult({ smmScore, smPercent, smPercentScore, finalScore });
    console.log('設置的 result：', {
      smmScore,
      smPercent,
      smPercentScore,
      finalScore,
    });
  };

  // 提交結果並儲存
  const handleSubmit = async () => {
    if (!result.finalScore) {
      alert('請先計算骨骼肌肉量分數！');
      return;
    }

    try {
      const updatedScores = {
        ...userData.scores,
        muscleMass: parseFloat(result.finalScore),
      };
      const updatedUserData = {
        ...userData,
        scores: updatedScores,
      };
      await setUserData(updatedUserData);
      console.log('Muscle.js - 已更新 userData.scores.muscleMass:', updatedScores);
      navigate('/user-info', { replace: false });
      console.log('Muscle.js - 導航調用完成');
    } catch (error) {
      console.error('Muscle.js - 更新 UserContext 或導航失敗:', error);
      alert('更新用戶數據或導航失敗，請稍後再試！');
    }
  };

  // 長條圖數據：SMM 和 SM% 分數
  const barData1 = {
    labels: ['骨骼肌肉量 (SMM)', '肌肉量百分比 (SM%)'],
    datasets: [
      {
        label: '分數',
        data: [result.smmScore || 0, result.smPercentScore || 0],
        backgroundColor: ['#4bc0c0', '#ff9f40'],
        borderColor: ['#3aa0a0', '#e08e36'],
        borderWidth: 1,
        barPercentage: 0.4,
      },
    ],
  };

  // 長條圖數據：最終分數
  const barData2 = {
    labels: ['最終分數'],
    datasets: [
      {
        label: '分數',
        data: [result.finalScore || 0],
        backgroundColor: ['#36a2eb'],
        borderColor: ['#2a82cb'],
        borderWidth: 1,
        barPercentage: 0.4,
      },
    ],
  };

  // 長條圖選項
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '分數',
          font: {
            size: 14,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: '項目',
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
  };

  return (
    <div className="muscle-container">
      <h1 className="text-2xl font-bold text-center mb-4">骨骼肌肉量評測</h1>
      <p>體重：{weight ? `${weight} 公斤` : '未輸入'}</p>
      <p>年齡：{age || '未輸入'}</p>
      <p>性別：{gender || '未選擇'}</p>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">骨骼肌肉量 (SMM)</h2>
        <input
          type="number"
          placeholder="骨骼肌肉量 (kg)"
          value={smm}
          onChange={e => setSmm(e.target.value)}
          className="input-field"
        />
        <button onClick={calculateMuscleScore} className="calculate-btn">
          計算
        </button>
        {result.smmScore && (
          <p className="score-text">骨骼肌肉量 (SMM) 分數: {result.smmScore}</p>
        )}
        {result.smPercent && (
          <p className="score-text">
            骨骼肌肉量百分比 (SM%): {result.smPercent}%
          </p>
        )}
        {result.smPercentScore && (
          <p className="score-text">
            骨骼肌肉量百分比 (SM%) 分數: {result.smPercentScore}
          </p>
        )}
        {result.finalScore && (
          <p className="score-text">最終分數: {result.finalScore}</p>
        )}
      </div>

      {/* 長條圖區域 */}
      {result.finalScore && (
        <div className="chart-section">
          <h2 className="text-lg font-semibold mb-2">數值比較</h2>
          <div className="chart-container">
            <Bar data={barData1} options={barOptions} />
          </div>
          <h2 className="text-lg font-semibold mt-4 mb-2">最終分數</h2>
          <div className="chart-container">
            <Bar data={barData2} options={barOptions} />
          </div>
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

export default Muscle;

// 響應式 CSS（移除歷史記錄相關樣式）
const styles = `
  .muscle-container {
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

  /* 新增分數文字樣式 */
  .score-text {
    font-size: 1.5rem; /* 字體調大到 24px */
    color: #d32f2f; /* 顯眼的深紅色 */
    font-weight: 600; /* 稍微加粗 */
    margin: 0.5rem 0; /* 增加上下間距 */
  }

  .chart-section {
    margin-top: 1.5rem;
  }

  .chart-container {
    position: relative;
    height: 200px; /* 圖表高度 */
    width: 100%;
    margin-bottom: 1rem;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.5rem;
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

  @media (min-width: 768px) {
    .muscle-container {
      max-width: 800px;
    }

    .chart-container {
      height: 300px; /* 桌面設備上圖表更高 */
    }

    .button-group {
      flex-direction: row;
      justify-content: space-between;
    }

    .submit-btn {
      width: 48%;
    }

    /* 桌面設備上分數文字更大 */
    .score-text {
      font-size: 1.75rem; /* 桌面設備上設為 28px */
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);