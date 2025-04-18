// src/FFMI.js
import { useState, useEffect } from 'react'; // 引入 useEffect
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { db, auth } from './firebase'; // 引入 Firebase 配置
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // 引入模組化語法

function FFMI() {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const [bodyFat, setBodyFat] = useState('');
  const [ffmi, setFfmi] = useState(null);
  const [ffmiScore, setFfmiScore] = useState(null);
  const [ffmiCategory, setFfmiCategory] = useState('');
  const [history, setHistory] = useState([]); // 新增：歷史記錄狀態
  // 新增：管理展開/收起狀態
  const [isExpanded, setIsExpanded] = useState(false);

  // 載入歷史記錄
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('ffmiHistory')) || [];
    setHistory(savedHistory);
  }, []);

  const calculateScores = () => {
    if (!userData.gender || !userData.height || !userData.weight || !userData.age) {
      alert('請先在用戶信息頁面填寫性別、身高、體重和年齡');
      return;
    }

    if (!bodyFat) {
      alert('請輸入體脂肪率');
      return;
    }

    const isMale = userData.gender === 'male' || userData.gender === '男性';
    const heightInMeters = parseFloat(userData.height) / 100;
    const weight = parseFloat(userData.weight);
    const bodyFatValue = parseFloat(bodyFat) / 100;

    // 計算 FFMI
    const fatFreeMass = weight * (1 - bodyFatValue);
    const rawFfmi = fatFreeMass / (heightInMeters * heightInMeters);
    const adjustedFfmi = heightInMeters > 1.8 ? rawFfmi + 6.0 * (heightInMeters - 1.8) : rawFfmi;
    setFfmi(adjustedFfmi.toFixed(1));

    // 計算 FFMI 分數（分段線性插值）
    let newFfmiScore;
    if (isMale) {
      const baseFfmi = 18.5; // 60 分基準
      const maxFfmi = 28; // 100 分上限
      if (adjustedFfmi <= 0) {
        newFfmiScore = 0;
      } else if (adjustedFfmi <= baseFfmi) {
        // 0 到 18.5，映射到 0-60 分
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      } else if (adjustedFfmi < maxFfmi) {
        // 18.5 到 28，映射到 60-100 分
        newFfmiScore = 60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      } else {
        // ≥28 為 100 分
        newFfmiScore = 100;
      }
    } else {
      const baseFfmi = 15.5; // 60 分基準
      const maxFfmi = 22; // 100 分上限
      if (adjustedFfmi <= 0) {
        newFfmiScore = 0;
      } else if (adjustedFfmi <= baseFfmi) {
        // 0 到 15.5，映射到 0-60 分
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      } else if (adjustedFfmi < maxFfmi) {
        // 15.5 到 22，映射到 60-100 分
        newFfmiScore = 60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      } else {
        // ≥22 為 100 分
        newFfmiScore = 100;
      }
    }
    setFfmiScore(newFfmiScore.toFixed(1));

    // FFMI 等級評價
    if (isMale) {
      if (adjustedFfmi < 16) setFfmiCategory('肌肉量低於平均');
      else if (adjustedFfmi < 18) setFfmiCategory('肌肉量在平均值');
      else if (adjustedFfmi < 20) setFfmiCategory('肌肉量高於平均值');
      else if (adjustedFfmi < 22) setFfmiCategory('肌肉量很高');
      else if (adjustedFfmi < 25) setFfmiCategory('肌肉量極高');
      else if (adjustedFfmi < 28) setFfmiCategory('肌肉量已經高到可能有使用藥物');
      else setFfmiCategory('不用藥不可能達到的數值');
    } else {
      if (adjustedFfmi < 13) setFfmiCategory('肌肉量低於平均');
      else if (adjustedFfmi < 15) setFfmiCategory('肌肉量在平均值');
      else if (adjustedFfmi < 17) setFfmiCategory('肌肉量高於平均值');
      else if (adjustedFfmi < 19) setFfmiCategory('肌肉量很高');
      else setFfmiCategory('不用藥不可能達到的數值');
    }
  };

  // 提交結果並儲存
  const handleSubmit = async () => {
    if (!ffmi || !ffmiScore) {
      alert('請先計算 FFMI 分數！');
      return;
    }

    // 確認用戶已登入
    const user = auth.currentUser;
    if (!user) {
      alert('請先登入！');
      return;
    }

    // 儲存歷史記錄
    const newHistoryEntry = {
      date: new Date().toLocaleString(),
      bodyFat: parseFloat(bodyFat),
      ffmi: parseFloat(ffmi),
      ffmiScore: parseFloat(ffmiScore),
      ffmiCategory: ffmiCategory,
    };

    // 儲存到 Firebase
    try {
      const userHistoryRef = collection(db, 'users', user.uid, 'history');
      await addDoc(userHistoryRef, {
        timestamp: serverTimestamp(),
        type: 'ffmi',
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
    localStorage.setItem('ffmiHistory', JSON.stringify(updatedHistory));

    // 更新 UserContext
    setUserData({
      ...userData,
      scores: {
        ...userData.scores,
        bodyFat: parseFloat(ffmiScore),
      },
    });

    navigate('/user-info');
  };

  // 男性 FFMI 對照表數據
  const maleFfmiTable = [
    { range: '16 - 17', description: '肌肉量低於平均' },
    { range: '18 - 19', description: '肌肉量在平均值' },
    { range: '20 - 21', description: '肌肉量高於平均值' },
    { range: '22', description: '肌肉量很高' },
    { range: '23 - 25', description: '肌肉量極高' },
    { range: '26 - 27', description: '肌肉量已經高到可能有使用藥物' },
    { range: '28 - 30', description: '不用藥不可能達到的數值' },
  ];

  // 女性 FFMI 對照表數據
  const femaleFfmiTable = [
    { range: '13 - 14', description: '肌肉量低於平均' },
    { range: '15 - 16', description: '肌肉量在平均值' },
    { range: '17 - 18', description: '肌肉量高於平均值' },
    { range: '19 - 21', description: '肌肉量很高' },
    { range: '> 22', description: '不用藥不可能達到的數值' },
  ];

  // 根據性別選擇對照表
  const ffmiTable = (userData.gender === 'male' || userData.gender === '男性') ? maleFfmiTable : femaleFfmiTable;

  return (
    <div className="ffmi-container">
      <h1 className="ffmi-title">體脂肪率與 FFMI</h1>
      <div className="input-section">
        <label className="input-label">體脂肪率 (%)</label>
        <input
          type="number"
          value={bodyFat}
          onChange={(e) => setBodyFat(e.target.value)}
          placeholder="輸入體脂肪率 (%)"
          className="input-field"
        />
        <button onClick={calculateScores} className="calculate-btn">
          計算分數
        </button>
      </div>
      {ffmi && (
        <div className="result-section">
          <h2 className="result-title">您的評估結果</h2>
          <p className="result-text">FFMI：{ffmi}</p>
          <p className="score-text">FFMI 評分：{ffmiScore} 分</p>
          <p className="category-text">FFMI 等級：{ffmiCategory}</p>
          <p className="result-text note-text"></p>
        </div>
      )}
      {/* 修改：將 FFMI 是什麼？改為可展開/收起的卡片 */}
      <div className="description-section">
        <div className="description-card">
          <div
            className="description-header"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h2 className="description-title">FFMI 是什麼？</h2>
            <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>
          {isExpanded && (
            <div className="description-content">
              <p>
                FFMI（Fat Free Mass Index 無脂肪質量指數）用來評估肌肉量多寡，考量身高與體脂，比 BMI 更準確。數值越高，代表肌肉量越多，是健身評估常用指標。在以下幾個狀況下易造成結果失真：
              </p>
              <ol className="list-decimal pl-5 mt-2">
                <li>受測者身高高於平均標準 (190 以上)</li>
                <li>受測者體脂肪率顯著高於平均標準</li>
                <li>受測者體重高於平均標準</li>
              </ol>
            </div>
          )}
        </div>
      </div>
      <div className="table-section">
        <h2 className="table-title">
          FFMI 對照表 ({(userData.gender === 'male' || userData.gender === '男性') ? '男性' : '女性'})
        </h2>
        <table className="ffmi-table">
          <thead>
            <tr>
              <th>FFMI 範圍</th>
              <th>評價</th>
            </tr>
          </thead>
          <tbody>
            {ffmiTable.map((row, index) => (
              <tr key={index}>
                <td>{row.range}</td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {history.length > 0 && (
        <div className="history-section">
          <h2 className="table-title">歷史記錄</h2>
          <ul className="history-list">
            {history.map((entry, index) => (
              <li key={index} className="history-item">
                <p>日期: {entry.date}</p>
                <p>體脂肪率: {entry.bodyFat}%</p>
                <p>FFMI: {entry.ffmi}</p>
                <p>FFMI 評分: {entry.ffmiScore} 分</p>
                <p>FFMI 等級: {entry.ffmiCategory}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleSubmit} className="back-btn">
        提交並返回總覽
      </button>
    </div>
  );
}

export default FFMI;

// 內聯 CSS
const styles = `
  .ffmi-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f9fafb;
    min-height: 100vh;
  }

  .ffmi-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .input-section {
    width: 90%;
    max-width: 400px;
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  .input-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
    text-align: left;
  }

  .input-field {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s;
  }

  .input-field:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .calculate-btn {
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .calculate-btn:hover {
    background: linear-gradient(90deg, #2563eb, #3b82f6);
  }

  .result-section {
    width: 90%;
    max-width: 400px;
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  .result-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    text-align: center;
  }

  .result-text {
    font-size: 0.875rem;
    color: #4b5563;
    margin: 0.5rem 0;
    text-align: center;
  }

  .score-text {
    font-size: 1.25rem;
    font-weight: bold;
    color: #3b82f6;
    margin: 0.5rem 0;
    text-align: center;
  }

  .category-text {
    font-size: 1.125rem;
    font-weight: 600;
    color: #3b82f6;
    margin: 0.5rem 0;
    text-align: center;
  }

  .note-text {
    font-size: 0.75rem;
    color: #e11d48;
    font-style: italic;
  }

  /* 修改：FFMI 是什麼？的卡片式設計樣式 */
  .description-section {
    width: 90%;
    max-width: 400px;
    margin-bottom: 1.5rem;
  }

  .description-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .description-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    cursor: pointer;
    background-color: #f1f1f1;
    transition: background-color 0.3s ease;
  }

  .description-header:hover {
    background-color: #e0e0e0;
  }

  .description-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .description-content {
    padding: 1.5rem;
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.6;
    background-color: white;
    transition: max-height 0.3s ease, padding 0.3s ease;
  }

  .arrow {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }

  .arrow.expanded {
    transform: rotate(180deg);
  }

  .table-section {
    width: 90%;
    max-width: 400px;
    margin-bottom: 1.5rem;
  }

  .table-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    text-align: center;
  }

  .ffmi-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .ffmi-table th,
  .ffmi-table td {
    padding: 0.75rem;
    font-size: 0.875rem;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
    text-align: center;
  }

  .ffmi-table th {
    background-color: #f3f4f6;
    font-weight: 600;
    color: #1f2937;
  }

  .ffmi-table tr:last-child td {
    border-bottom: none;
  }

  .history-section {
    width: 90%;
    max-width: 400px;
    margin-bottom: 1.5rem;
  }

  .history-list {
    list-style: none;
    padding: 0;
  }

  .history-item {
    background: white;
    padding: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-size: 0.875rem;
    color: #4b5563;
  }

  .back-btn {
    width: 90%;
    max-width: 400px;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .back-btn:hover {
    background: linear-gradient(90deg, #2563eb, #3b82f6);
  }

  @media (min-width: 768px) {
    .ffmi-title {
      font-size: 2rem;
    }
    .result-title,
    .table-title,
    .description-title {
      font-size: 1.5rem;
    }
    .result-text,
    .ffmi-table th,
    .ffmi-table td,
    .description-content,
    .history-item {
      font-size: 1rem;
    }
    .score-text {
      font-size: 1.5rem;
    }
    .category-text {
      font-size: 1.25rem;
    }
    .note-text {
      font-size: 0.875rem;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);