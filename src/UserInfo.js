// src/UserInfo.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function UserInfo() {
  const { userData, setUserData } = useUser();
  const [height, setHeight] = useState(userData.height || '');
  const [weight, setWeight] = useState(userData.weight || '');
  const [age, setAge] = useState(userData.age || '');
  const [isSaved, setIsSaved] = useState(false); // 新增狀態：是否已儲存
  const navigate = useNavigate();

  // 從 userData 中獲取性別和五項分數
  const { gender, scores } = userData;
  const strengthScore = scores?.strength || 0;
  const explosivePowerScore = scores?.explosivePower || 0;
  const cardioScore = scores?.cardio || 0;
  const muscleMassScore = scores?.muscleMass || 0;
  const bodyFatScore = scores?.bodyFat || 0;

  // 計算平均分（忽略未完成項目）
  const calculateAverageScore = () => {
    const scoreValues = [
      strengthScore,
      explosivePowerScore,
      cardioScore,
      muscleMassScore,
      bodyFatScore,
    ];
    // 過濾掉未完成的分數（0 分）
    const completedScores = scoreValues.filter((score) => score > 0);
    if (completedScores.length === 0) return 0; // 如果沒有完成任何項目，返回 0
    const total = completedScores.reduce((sum, score) => sum + score, 0);
    return (total / completedScores.length).toFixed(0); // 計算平均分並取整
  };

  // 根據平均分和性別生成評語
  const getScoreSlogan = (averageScore, gender) => {
    // 每 5 分一個區間，共 20 個區間（0-5, 6-10, ..., 96-100）
    const slogansMale = [
      '初試啼聲，繼續努力！', // 0-5
      '點燃鬥志，挑戰極限！', // 6-10
      '熱血啟動，突破自我！', // 11-15
      '戰意初現，堅持到底！', // 16-20
      '燃燒吧，展現潛能！', // 21-25
      '鬥志昂揚，勇往直前！', // 26-30
      '熱血沸騰，超越極限！', // 31-35
      '戰力提升，無所畏懼！', // 36-40
      '全力以赴，挑戰巔峰！', // 41-45
      '強者之路，勢不可擋！', // 46-50
      '戰神覺醒，霸氣外露！', // 51-55
      '無畏挑戰，征服一切！', // 56-60
      '熱血戰士，無人能敵！', // 61-65
      '王者之路，勢如破竹！', // 66-70
      '戰力爆發，震撼全場！', // 71-75
      '不敗之姿，傲視群雄！', // 76-80
      '熱血傳奇，無可匹敵！', // 81-85
      '戰神降臨，統治全場！', // 86-90
      '極限突破，創造奇蹟！', // 91-95
      '傳說誕生，永不言敗！', // 96-100
    ];

    const slogansFemale = [
      '初次嘗試，慢慢來哦！', // 0-5
      '小有進步，繼續加油！', // 6-10
      '你很努力，保持下去！', // 11-15
      '進步中，真的不錯！', // 16-20
      '展現潛力，你很棒！', // 21-25
      '越來越好，繼續努力！', // 26-30
      '表現出色，值得讚賞！', // 31-35
      '很棒的進步，加油哦！', // 36-40
      '你很厲害，繼續保持！', // 41-45
      '表現穩定，超棒的！', // 46-50
      '越來越強，你真棒！', // 51-55
      '很棒的表現，繼續加油！', // 56-60
      '你很出色，令人佩服！', // 61-65
      '表現優異，超級棒！', // 66-70
      '你很強大，繼續閃耀！', // 71-75
      '表現完美，真的很棒！', // 76-80
      '你太厲害了，超級棒！', // 81-85
      '完美表現，令人驚艷！', // 86-90
      '你是最棒的，繼續保持！', // 91-95
      '完美無瑕，閃耀全場！', // 96-100
    ];

    // 計算區間（每 5 分一個區間）
    const index = Math.min(Math.floor(averageScore / 5), 19); // 確保不超過陣列長度
    const isMale = gender === 'male' || gender === '男性';
    return isMale ? slogansMale[index] : slogansFemale[index];
  };

  const averageScore = calculateAverageScore();
  const scoreSlogan = getScoreSlogan(averageScore, gender);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData({ ...userData, height, weight, age });
    setIsSaved(true); // 設置為已儲存狀態
    // 2 秒後恢復按鈕原始狀態
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const radarData = {
    labels: ['力量', '爆發力', '心肺耐力', '骨骼肌肉量', 'FFMI'],
    datasets: [
      {
        label: '您的表現',
        data: [
          userData.scores.strength || 0,
          userData.scores.explosivePower || 0,
          userData.scores.cardio || 0,
          userData.scores.muscleMass || 0,
          userData.scores.bodyFat || 0,
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
      <h1 className="text-2xl font-bold text-center mb-6">身體狀態與表現總覽</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">身高 (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="身高 (cm)"
            className="input-field"
            required
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
          />
        </div>
        <button type="submit" className={`submit-btn ${isSaved ? 'saved' : ''}`}>
          {isSaved ? '已儲存' : '儲存'}
        </button>
      </form>
      <div className="radar-section">
        <h2 className="text-xl font-semibold text-center mb-4">表現總覽</h2>
        <Radar data={radarData} options={radarOptions} />
        {/* 平均分和標語顯示 */}
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
      </div>
    </div>
  );
}

export default UserInfo;

// 響應式 CSS
const styles = `
  .user-info-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    transition: background-color 0.3s ease; /* 添加過渡效果 */
  }

  .submit-btn:hover {
    background-color: #3aa0a0;
  }

  .submit-btn.saved {
    background-color: #28a745; /* 綠色，表示已儲存 */
  }

  .submit-btn.saved:hover {
    background-color: #218838; /* 綠色懸停效果 */
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
    color: #d32f2f; /* 顯眼的深紅色 */
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