import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import PropTypes from 'prop-types';
import './FFMI.css';

function FFMI({ onComplete, clearTestData }) {
  const { userData, setUserData, saveUserData } = useUser();
  const navigate = useNavigate();
  const [bodyFat, setBodyFat] = useState(
    userData.testInputs?.ffmi?.bodyFat || ''
  );
  const [ffmi, setFfmi] = useState(null);
  const [ffmiScore, setFfmiScore] = useState(null);
  const [ffmiCategory, setFfmiCategory] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false); // 新增：控制對照表展開狀態

  useEffect(() => {
    if (bodyFat) {
      const updatedTestInputs = {
        ...userData.testInputs,
        ffmi: { ...userData.testInputs?.ffmi, bodyFat },
      };
      setUserData(prev => ({ ...prev, testInputs: updatedTestInputs }));
    }
  }, [bodyFat]);

  const calculateScores = () => {
    if (
      !userData.gender ||
      !userData.height ||
      !userData.weight ||
      !userData.age
    ) {
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

    const fatFreeMass = weight * (1 - bodyFatValue);
    const rawFfmi = fatFreeMass / (heightInMeters * heightInMeters);
    const adjustedFfmi =
      heightInMeters > 1.8 ? rawFfmi + 6.0 * (heightInMeters - 1.8) : rawFfmi;
    setFfmi(adjustedFfmi.toFixed(2));

    let newFfmiScore;
    if (isMale) {
      const baseFfmi = 18.5;
      const maxFfmi = 28;
      if (adjustedFfmi <= 0) newFfmiScore = 0;
      else if (adjustedFfmi <= baseFfmi)
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      else if (adjustedFfmi < maxFfmi)
        newFfmiScore =
          60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      else newFfmiScore = 100;
    } else {
      const baseFfmi = 15.5;
      const maxFfmi = 22;
      if (adjustedFfmi <= 0) newFfmiScore = 0;
      else if (adjustedFfmi <= baseFfmi)
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      else if (adjustedFfmi < maxFfmi)
        newFfmiScore =
          60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      else newFfmiScore = 100;
    }
    setFfmiScore(newFfmiScore.toFixed(2));

    if (isMale) {
      if (adjustedFfmi < 18) setFfmiCategory('肌肉量低於平均');
      else if (adjustedFfmi < 20) setFfmiCategory('肌肉量在平均值');
      else if (adjustedFfmi < 22) setFfmiCategory('肌肉量高於平均值');
      else if (adjustedFfmi < 23) setFfmiCategory('肌肉量很高');
      else if (adjustedFfmi < 26) setFfmiCategory('肌肉量極高');
      else if (adjustedFfmi < 28)
        setFfmiCategory('肌肉量已經高到可能有使用藥物');
      else setFfmiCategory('不用藥不可能達到的數值');
    } else {
      if (adjustedFfmi < 15) setFfmiCategory('肌肉量低於平均');
      else if (adjustedFfmi < 17) setFfmiCategory('肌肉量在平均值');
      else if (adjustedFfmi < 19) setFfmiCategory('肌肉量高於平均值');
      else if (adjustedFfmi < 22) setFfmiCategory('肌肉量很高');
      else setFfmiCategory('不用藥不可能達到的數值');
    }
  };

  const handleSubmit = async () => {
    if (!ffmi || !ffmiScore) {
      alert('請先計算 FFMI 分數！');
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      // 準備更新的數據
      const updatedScores = {
        ...userData.scores,
        bodyFat: parseFloat(ffmiScore),
      };
      const updatedUserData = {
        ...userData,
        scores: updatedScores,
      };

      setUserData({
        ...updatedUserData,
        // 保持原有的天梯分數，不自動更新
        ladderScore: userData.ladderScore || 0,
      });

      if (!isGuest) {
        const success = await saveUserData(updatedUserData);
        if (!success) throw new Error('保存數據失敗');
      }

      // 準備測試數據
      const testData = {
        bodyFat: parseFloat(bodyFat),
        ffmi: parseFloat(ffmi),
        ffmiScore: parseFloat(ffmiScore),
      };
      if (onComplete && typeof onComplete === 'function') {
        onComplete(testData);
      }
      setTimeout(() => {
        navigate('/user-info', { state: { from: '/body-fat' } });
      }, 100);
    } catch (error) {
      console.error('提交失敗:', error);
      if (!isGuest) {
        alert('更新用戶數據失敗，請稍後再試！');
      }
      setTimeout(() => {
        navigate('/user-info', { state: { from: '/body-fat' } });
      }, 100);
    }
  };

  const maleFfmiTable = [
    { range: '16 - 17', description: '肌肉量低於平均' },
    { range: '18 - 19', description: '肌肉量在平均值' },
    { range: '20 - 21', description: '肌肉量高於平均值' },
    { range: '22', description: '肌肉量很高' },
    { range: '23 - 25', description: '肌肉量極高' },
    { range: '26 - 27', description: '肌肉量已經高到可能有使用藥物' },
    { range: '28 - 30', description: '不用藥不可能達到的數值' },
  ];

  const femaleFfmiTable = [
    { range: '13 - 14', description: '肌肉量低於平均' },
    { range: '15 - 16', description: '肌肉量在平均值' },
    { range: '17 - 18', description: '肌肉量高於平均值' },
    { range: '19 - 21', description: '肌肉量很高' },
    { range: '> 22', description: '不用藥不可能達到的數值' },
  ];

  const ffmiTable =
    userData.gender === 'male' || userData.gender === '男性'
      ? maleFfmiTable
      : femaleFfmiTable;

  return (
    <div className="ffmi-container">
      <h1 className="ffmi-title">體脂肪率與 FFMI</h1>
      <div className="input-section">
        <label htmlFor="bodyFat" className="input-label">
          體脂肪率 (%)
        </label>
        <input
          id="bodyFat"
          name="bodyFat"
          type="number"
          value={bodyFat}
          onChange={e => setBodyFat(e.target.value)}
          placeholder="輸入體脂肪率 (%)"
          className="input-field"
          required
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
                FFMI（Fat Free Mass Index
                無脂肪質量指數）用來評估肌肉量多寡，考量身高與體脂，比 BMI
                更準確。數值越高，代表肌肉量越多，是健身評估常用指標。在以下幾個狀況下易造成結果失真：
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
        <div className="table-card">
          <div
            className="table-header"
            onClick={() => setIsTableExpanded(!isTableExpanded)}
          >
            <h2 className="table-title">
              FFMI 對照表 (
              {userData.gender === 'male' || userData.gender === '男性'
                ? '男性'
                : '女性'}
              )
            </h2>
            <span className={`arrow ${isTableExpanded ? 'expanded' : ''}`}>
              {isTableExpanded ? '▲' : '▼'}
            </span>
          </div>
          {isTableExpanded && (
            <div className="table-content">
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
          )}
        </div>
      </div>
      <button onClick={handleSubmit} className="ffmi-submit-btn">
        提交並返回總覽
      </button>
    </div>
  );
}

FFMI.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default FFMI;
