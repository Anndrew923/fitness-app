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
      <h1 className="text-2xl font-bold text-center mb-6">用戶信息與總覽</h1>
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
        <h2 className="text-xl font-semibold text-center mb-4">您的表現總覽</h2>
        <Radar data={radarData} options={radarOptions} />
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
        <button onClick={() => navigate('/instructions')} className="nav-btn coach-btn">
          教練的話
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

  .coach-btn {
    background-color: #28a745;
  }

  .coach-btn:hover {
    background-color: #218838;
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