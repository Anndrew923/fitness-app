import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import * as standards from './standards';

function Cardio() {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { age, gender } = userData;

  const [distance, setDistance] = useState(userData.testInputs?.cardio?.distance || '');
  const [score, setScore] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 當 distance 變化時，保存到 userData.testInputs
  useEffect(() => {
    if (distance) {
      const updatedTestInputs = {
        ...userData.testInputs,
        cardio: {
          ...userData.testInputs?.cardio,
          distance,
        },
      };
      setUserData({ ...userData, testInputs: updatedTestInputs });
    }
  }, [distance, userData, setUserData]);

  const getAgeRange = age => {
    if (!age) return null;
    const ageNum = parseInt(age);
    if (ageNum >= 13 && ageNum <= 14) return '13-14';
    if (ageNum >= 15 && ageNum <= 16) return '15-16';
    if (ageNum >= 17 && ageNum <= 20) return '17-20';
    if (ageNum >= 20 && ageNum <= 29) return '20-29';
    if (ageNum >= 30 && ageNum <= 39) return '30-39';
    if (ageNum >= 40 && ageNum <= 49) return '40-49';
    if (ageNum >= 50) return '50+';
    return null;
  };

  const calculateScoreFromStandard = (value, standard) => {
    if (value >= standard[100]) return 100;
    if (value >= standard[90]) return 90;
    if (value >= standard[80]) return 80;
    if (value >= standard[70]) return 70;
    if (value >= standard[60]) return 60;
    // 低於最低標準，按比例計算0到60分
    const minDistance = standard[60];
    if (value > 0) {
      return Math.round((value / minDistance) * 60);
    }
    return 0;
  };

  const getComment = (score, gender) => {
    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    const scoreRange = Math.floor(score / 10) * 10;

    const comments = {
      male: {
        0: '兄弟，該動起來了！全力衝刺吧！',
        10: '還不夠熱血！再加把勁，衝上去！',
        20: '起步了！再加速，展現你的實力！',
        30: '進步中！再拼一點，突破極限吧！',
        40: '不錯！再猛一點，超越自己！',
        50: '很棒了！再衝刺，成為王者吧！',
        60: '強者氣勢！再加速，稱霸全場！',
        70: '超強！熱血沸騰，繼續衝刺！',
        80: '頂尖表現！再拼，成為傳說！',
        90: '無敵了！你是真正的王者，保持！',
        100: '無敵了！你是真正的王者，保持！',
      },
      female: {
        0: '親愛的，別氣餒，慢慢進步哦！',
        10: '再努力一點，你會更好的，加油！',
        20: '小進步了！繼續加油，你很棒！',
        30: '進步了呢！再努力一點，會更好哦！',
        40: '很棒了！再加把勁，你會更棒的！',
        50: '表現很好！再努力一點，超棒的！',
        60: '好厲害！繼續保持，你很棒哦！',
        70: '真的很棒！保持下去，你最棒了！',
        80: '太厲害了！繼續努力，你超棒的！',
        90: '完美表現！超棒的你，繼續保持！',
        100: '完美表現！超棒的你，繼續保持！',
      },
    };

    return comments[genderValue][scoreRange] || '加油！';
  };

  const calculateCardioScore = () => {
    if (!distance || !age || !gender) {
      alert('請確保已在用戶信息中輸入年齡和性別，並在此輸入跑步距離！');
      return;
    }

    const distanceNum = parseFloat(distance);
    const ageRange = getAgeRange(age);

    if (!distanceNum || !ageRange) {
      alert('請輸入有效的跑步距離和年齡！');
      return;
    }

    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male'
        ? 'male'
        : gender === '女性' || gender.toLowerCase() === 'female'
          ? 'female'
          : null;
    const cooperStandards =
      genderValue === 'male'
        ? standards.cooperStandardsMale
        : standards.cooperStandardsFemale;

    const standard = cooperStandards[ageRange];

    if (!standard) {
      alert('無法找到對應的評測標準，請檢查年齡和性別！');
      return;
    }

    const score = calculateScoreFromStandard(distanceNum, standard);
    setScore(score);
    console.log(
      'Cardio.js - 計算心肺耐力分數:',
      score,
      '距離:',
      distanceNum,
      '年齡段:',
      ageRange
    );
  };

  const handleSubmit = async () => {
    if (!score) {
      alert('請先計算心肺耐力分數！');
      return;
    }

    try {
      const updatedScores = {
        ...userData.scores,
        cardio: parseFloat(score),
      };
      const updatedUserData = {
        ...userData,
        scores: updatedScores,
      };
      await setUserData(updatedUserData);
      console.log('Cardio.js - 已更新 userData.scores.cardio:', updatedScores);
      navigate('/user-info', { replace: false });
      console.log('Cardio.js - 導航調用完成');
    } catch (error) {
      console.error('Cardio.js - 更新 UserContext 或導航失敗:', error);
      alert('更新用戶數據或導航失敗，請稍後再試！');
    }
  };

  return (
    <div className="cardio-container">
      <div className="input-section">
        <h1 className="text-2xl font-bold text-center mb-4">心肺耐力測試</h1>
        <p>年齡：{age || '未輸入'}</p>
        <p>性別：{gender || '未選擇'}</p>

        <div className="exercise-section">
          <h2 className="text-lg font-semibold">Cooper 12 分鐘跑步測試</h2>
          <input
            type="number"
            placeholder="跑步距離 (公尺)"
            value={distance}
            onChange={e => setDistance(e.target.value)}
            className="input-field"
          />
          <button onClick={calculateCardioScore} className="calculate-btn">
            計算
          </button>
          {score !== null && (
            <>
              <p className="score-display">心肺耐力分數: {score}</p>
              <p className="score-display">{getComment(score, gender)}</p>
            </>
          )}
        </div>

        <div className="description-section">
          <div className="description-card">
            <div
              className="description-header"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <h2 className="text-lg font-semibold">動作說明</h2>
              <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isExpanded && (
              <div className="description-content">
                <p className="font-semibold">Cooper Test 簡介</p>
                <p>
                  傳統心肺耐力測試需在實驗室以極限強度測量最大攝氧量（VO₂
                  Max），但難以普及。Kenneth H. Cooper 博士發現 12
                  分鐘跑步距離與 VO₂ Max 高度相關，於 1968 年設計 Cooper
                  Test，廣泛應用於美軍體測，簡化測量並提升效率。測試以年齡、性別和跑步距離估算
                  VO₂ Max。
                </p>
                <p className="font-semibold mt-2">測量方式</p>
                <ul className="list-disc pl-5">
                  <li>
                    <strong>地點</strong>
                    ：選擇田徑場或安全跑步環境，方便記錄距離和配速。
                  </li>
                  <li>
                    <strong>記錄</strong>：用圈數或運動手錶記錄 12
                    分鐘跑步距離。
                  </li>
                  <li>
                    <strong>熱身</strong>：跑前動態熱身 10-15 分鐘，避免受傷。
                  </li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  本 Cooper 測試標準表可在 Cooper Test Chart 找到，由 Carl
                  Magnus Swahn 設計。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleSubmit} className="submit-btn">
          提交並返回總覽
        </button>
      </div>
    </div>
  );
}

export default Cardio;

// 響應式 CSS（保持不變）
const styles = `
  .cardio-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .input-section {
    margin-bottom: 1.5rem;
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
    margin-bottom: 1.5rem;
  }

  .description-card {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .description-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    cursor: pointer;
    background-color: #f1f1f1;
    transition: background-color 0.3s ease;
  }

  .description-header:hover {
    background-color: #e0e0e0;
  }

  .description-content {
    padding: 1rem;
    background-color: #fff;
  }

  .arrow {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }

  .arrow.expanded {
    transform: rotate(180deg);
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
    background-color: #4bc0c0;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  .submit-btn:hover {
    background-color: #3aa0a0;
  }

  @media (max-width: 767px) {
    .score-display {
      font-size: 1.25rem;
    }

    .description-content {
      font-size: 0.9rem;
    }
  }

  @media (min-width: 768px) {
    .cardio-container {
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

const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);