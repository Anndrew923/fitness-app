// src/CelebrityComparison.js
import { useLocation, useNavigate } from 'react-router-dom';

function CelebrityComparison() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const userAverageScore = state?.averageScore || 0;

  // 名人數據
  const celebrities = [
    {
      name: '勒布朗·詹姆斯 (LeBron James)',
      gender: '男性',
      profession: '籃球運動員',
      weight: 113,
      age: 40,
      benchPress: 180,
      squat: 250,
      deadlift: 300,
      latPulldown: 120,
      shoulderPress: 100,
      averageScore: 92,
      singleScore: null,
    },
    {
      name: '巨石強森 (Dwayne Johnson)',
      gender: '男性',
      profession: '演員/前摔角手',
      weight: 118,
      age: 52,
      benchPress: 193,
      squat: 270,
      deadlift: 320,
      latPulldown: 130,
      shoulderPress: 110,
      averageScore: 90,
      singleScore: null,
    },
    {
      name: '瑟琳娜·威廉斯 (Serena Williams)',
      gender: '女性',
      profession: '網球運動員',
      weight: 70,
      age: 43,
      benchPress: 90,
      squat: 140,
      deadlift: 160,
      latPulldown: 80,
      shoulderPress: 60,
      averageScore: 85,
      singleScore: null,
    },
    {
      name: '克里斯·漢斯沃 (Chris Hemsworth)',
      gender: '男性',
      profession: '演員',
      weight: 100,
      age: 41,
      benchPress: 150,
      squat: 200,
      deadlift: 240,
      latPulldown: 110,
      shoulderPress: 90,
      averageScore: 82,
      singleScore: null,
    },
    {
      name: '湯姆·布雷迪 (Tom Brady)',
      gender: '男性',
      profession: '美式足球運動員',
      weight: 102,
      age: 47,
      benchPress: 120,
      squat: 180,
      deadlift: 200,
      latPulldown: 100,
      shoulderPress: 80,
      averageScore: 78,
      singleScore: null,
    },
    {
      name: '西蒙·拜爾斯 (Simone Biles)',
      gender: '女性',
      profession: '體操運動員',
      weight: 47,
      age: 27,
      benchPress: 70,
      squat: 110,
      deadlift: 130,
      latPulldown: 60,
      shoulderPress: 50,
      averageScore: 75,
      singleScore: null,
    },
    {
      name: '傑森·史塔森 (Jason Statham)',
      gender: '男性',
      profession: '演員',
      weight: 84,
      age: 57,
      benchPress: 130,
      squat: 170,
      deadlift: 190,
      latPulldown: 90,
      shoulderPress: 70,
      averageScore: 72,
      singleScore: null,
    },
    {
      name: '蓋爾·加朵 (Gal Gadot)',
      gender: '女性',
      profession: '演員',
      weight: 59,
      age: 39,
      benchPress: 65,
      squat: 100,
      deadlift: 120,
      latPulldown: 55,
      shoulderPress: 45,
      averageScore: 68,
      singleScore: null,
    },
    {
      name: '娜塔莉·波曼 (Natalie Portman)',
      gender: '女性',
      profession: '演員',
      weight: 53,
      age: 43,
      benchPress: 60,
      squat: 90,
      deadlift: 100,
      latPulldown: 50,
      shoulderPress: 40,
      averageScore: 65,
      singleScore: null,
    },
    {
      name: '麥可·B·喬丹 (Michael B. Jordan)',
      gender: '男性',
      profession: '演員',
      weight: 84,
      age: 37,
      benchPress: 120,
      squat: null,
      deadlift: null,
      latPulldown: null,
      shoulderPress: null,
      averageScore: null,
      singleScore: { type: '臥推', score: 70 },
    },
    {
      name: '碧昂絲 (Beyoncé)',
      gender: '女性',
      profession: '歌手',
      weight: 62,
      age: 43,
      benchPress: 55,
      squat: null,
      deadlift: null,
      latPulldown: null,
      shoulderPress: null,
      averageScore: null,
      singleScore: { type: '臥推', score: 60 },
    },
    {
      name: '萊恩·雷諾斯 (Ryan Reynolds)',
      gender: '男性',
      profession: '演員',
      weight: 86,
      age: 48,
      benchPress: 140,
      squat: null,
      deadlift: null,
      latPulldown: null,
      shoulderPress: null,
      averageScore: null,
      singleScore: { type: '臥推', score: 75 },
    },
  ];

  // 計算超越了多少位名人
  const getEncouragementMessage = () => {
    const userScore = parseFloat(userAverageScore);
    let surpassedCount = 0;

    celebrities.forEach((celeb) => {
      if (celeb.averageScore) {
        if (userScore >= celeb.averageScore) {
          surpassedCount++;
        }
      } else if (celeb.singleScore) {
        if (userScore >= celeb.singleScore.score) {
          surpassedCount++;
        }
      }
    });

    if (surpassedCount > 0) {
      return `你的分數是 ${userScore}，已經超越了 ${surpassedCount} 位知名選手，表現很棒！繼續努力，你會更強！`;
    } else {
      return `你的分數是 ${userScore}，雖然還沒超越這些名人，但你已經在進步的路上，繼續加油！`;
    }
  };

  // 按總評分排序（無總評分的排在後面）
  const sortedCelebrities = celebrities.sort((a, b) => {
    if (a.averageScore && b.averageScore) {
      return b.averageScore - a.averageScore;
    }
    if (a.averageScore) return -1;
    if (b.averageScore) return 1;
    return (b.singleScore?.score || 0) - (a.singleScore?.score || 0);
  });

  return (
    <div className="celebrity-comparison-container">
      <h1 className="text-2xl font-bold text-center mb-4">跟知名運動員PK一下吧!</h1>
      <p className="text-center mb-4">
        你的平均分數是 <span className="text-blue-600 font-bold">{userAverageScore}</span> 分，來看看你與知名運動員和藝人誰更厲害吧！
      </p>

      {/* 鼓勵訊息 */}
      <div className="encouragement-message">
        <p className="text-lg text-center">{getEncouragementMessage()}</p>
      </div>

      {/* 名人數據表格 */}
      <div className="celebrity-table">
        <table>
          <thead>
            <tr>
              <th>名人</th>
              <th>性別</th>
              <th>職業</th>
              <th>總評分</th>
              <th>單項分數</th>
            </tr>
          </thead>
          <tbody>
            {sortedCelebrities.map((celeb, index) => (
              <tr key={index}>
                <td>{celeb.name}</td>
                <td>{celeb.gender}</td>
                <td>{celeb.profession}</td>
                <td>{celeb.averageScore || '數據不足'}</td>
                <td>{celeb.singleScore ? `${celeb.singleScore.type}: ${celeb.singleScore.score}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 返回按鈕 */}
      <div className="button-group">
        <button onClick={() => navigate('/strength')} className="back-btn">
          返回力量評測
        </button>
      </div>
    </div>
  );
}

export default CelebrityComparison;

// 響應式 CSS
const styles = `
  .celebrity-comparison-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .encouragement-message {
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .celebrity-table {
    width: 100%;
    overflow-x: auto;
    margin-bottom: 2rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  th, td {
    padding: 0.75rem;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #4bc0c0;
    color: white;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  .button-group {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .back-btn {
    width: 100%;
    max-width: 300px;
    padding: 0.75rem;
    background-color: #666;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  .back-btn:hover {
    background-color: #555;
  }

  @media (max-width: 767px) {
    .celebrity-comparison-container {
      padding: 0.5rem;
    }

    th, td {
      padding: 0.5rem;
      font-size: 0.9rem;
    }

    .encouragement-message {
      font-size: 0.9rem;
    }
  }

  @media (min-width: 768px) {
    .celebrity-comparison-container {
      max-width: 800px;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);