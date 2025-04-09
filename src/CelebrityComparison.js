// src/CelebrityComparison.js
import { useState } from 'react'; // 引入 useState 用於篩選和折疊功能
import { useNavigate } from 'react-router-dom';

function CelebrityComparison() {
  const navigate = useNavigate();

  // 名人數據（保持不變）
  const celebrities = [
    // 男性
    {
      name: '巨石強森 (Dwayne "The Rock" Johnson)',
      gender: '男性',
      profession: '演員/摔跤手',
      height: '6英尺5英寸 (196厘米)',
      weight: '260磅 (118公斤)',
      bodyFat: '10-12%',
      benchPress: '450磅 (204公斤)',
      deadlift: '500磅 (227公斤)',
      squat: '425磅 (193公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '勒布朗·詹姆斯 (LeBron James)',
      gender: '男性',
      profession: '籃球運動員',
      height: '6英尺9英寸 (206厘米)',
      weight: '250磅 (113公斤)',
      bodyFat: '6-8%',
      benchPress: '315磅 (143公斤)',
      deadlift: 'N/A',
      squat: '450磅 (204公斤)',
      verticalJump: '44英寸 (112厘米)',
      standingLongJump: 'N/A',
      sprint: '10.5秒 (估計)',
    },
    {
      name: '克里斯蒂亞諾·羅納爾多 (Cristiano Ronaldo)',
      gender: '男性',
      profession: '足球運動員',
      height: '6英尺2英寸 (188厘米)',
      weight: '183磅 (83公斤)',
      bodyFat: '7%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: '30英寸 (76厘米)',
      standingLongJump: 'N/A',
      sprint: '10.9秒',
    },
    {
      name: '湯姆·布雷迪 (Tom Brady)',
      gender: '男性',
      profession: '橄欖球運動員',
      height: '6英尺4英寸 (193厘米)',
      weight: '225磅 (102公斤)',
      bodyFat: '10-12%',
      benchPress: '225磅 (102公斤)',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: '24.5英寸 (62厘米)',
      standingLongJump: 'N/A',
      sprint: '4.8秒',
    },
    {
      name: '哈弗托·尤利烏斯·比約恩松 (Hafþór Júlíus Björnsson)',
      gender: '男性',
      profession: '大力士/演員',
      height: '6英尺9英寸 (206厘米)',
      weight: '441磅 (200公斤)',
      bodyFat: '15-20%',
      benchPress: '551磅 (250公斤)',
      deadlift: '1104磅 (501公斤)',
      squat: '970磅 (440公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '邁克爾·菲爾普斯 (Michael Phelps)',
      gender: '男性',
      profession: '游泳運動員',
      height: '6英尺4英寸 (193厘米)',
      weight: '194磅 (88公斤)',
      bodyFat: '8%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '尤塞恩·博爾特 (Usain Bolt)',
      gender: '男性',
      profession: '短跑運動員',
      height: '6英尺5英寸 (196厘米)',
      weight: '207磅 (94公斤)',
      bodyFat: '5-6%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: '40英寸 (102厘米，估計)',
      standingLongJump: '11英尺2英寸 (3.4米)',
      sprint: '9.58秒',
    },
    {
      name: '阿諾·施瓦辛格 (Arnold Schwarzenegger)',
      gender: '男性',
      profession: '演員/健美運動員（巔峰時期）',
      height: '6英尺2英寸 (188厘米)',
      weight: '235磅 (107公斤)',
      bodyFat: '5-6%',
      benchPress: '500磅 (227公斤)',
      deadlift: '710磅 (322公斤)',
      squat: '545磅 (247公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '凱文·哈特 (Kevin Hart)',
      gender: '男性',
      profession: '喜劇演員/演員',
      height: '5英尺4英寸 (163厘米)',
      weight: '141磅 (64公斤)',
      bodyFat: '12-15%',
      benchPress: '225磅 (102公斤)',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '傑森·史塔森 (Jason Statham)',
      gender: '男性',
      profession: '演員',
      height: '5英尺10英寸 (178厘米)',
      weight: '185磅 (84公斤)',
      bodyFat: '10-12%',
      benchPress: '225磅 (102公斤)',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '休·傑克曼 (Hugh Jackman)',
      gender: '男性',
      profession: '演員',
      height: '6英尺2英寸 (188厘米)',
      weight: '190磅 (86公斤)',
      bodyFat: '8-10%',
      benchPress: '235磅 (107公斤)',
      deadlift: '410磅 (186公斤)',
      squat: '355磅 (161公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '克里斯·海姆斯沃斯 (Chris Hemsworth)',
      gender: '男性',
      profession: '演員',
      height: '6英尺3英寸 (191厘米)',
      weight: '220磅 (100公斤)',
      bodyFat: '8-10%',
      benchPress: '275磅 (125公斤)',
      deadlift: '450磅 (204公斤)',
      squat: '350磅 (159公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '馬克·華伯格 (Mark Wahlberg)',
      gender: '男性',
      profession: '演員',
      height: '5英尺8英寸 (173厘米)',
      weight: '185磅 (84公斤)',
      bodyFat: '8-10%',
      benchPress: '335磅 (152公斤)',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '泰瑞·克魯斯 (Terry Crews)',
      gender: '男性',
      profession: '演員/前橄欖球運動員',
      height: '6英尺3英寸 (191厘米)',
      weight: '245磅 (111公斤)',
      bodyFat: '10-12%',
      benchPress: '475磅 (215公斤)',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '約翰·希南 (John Cena)',
      gender: '男性',
      profession: '摔跤手/演員',
      height: '6英尺1英寸 (185厘米)',
      weight: '251磅 (114公斤)',
      bodyFat: '8-10%',
      benchPress: '487磅 (221公斤)',
      deadlift: '650磅 (295公斤)',
      squat: '600磅 (272公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    // 女性
    {
      name: '塞雷娜·威廉姆斯 (Serena Williams)',
      gender: '女性',
      profession: '網球運動員',
      height: '5英尺9英寸 (175厘米)',
      weight: '155磅 (70公斤)',
      bodyFat: '15-18%',
      benchPress: '225磅 (102公斤)',
      deadlift: 'N/A',
      squat: '285磅 (129公斤)',
      verticalJump: '28英寸 (71厘米，估計)',
      standingLongJump: 'N/A',
      sprint: '11.8秒 (估計)',
    },
    {
      name: '隆達·羅西 (Ronda Rousey)',
      gender: '女性',
      profession: '綜合格鬥運動員/演員',
      height: '5英尺7英寸 (170厘米)',
      weight: '135磅 (61公斤)',
      bodyFat: '12-15%',
      benchPress: '135磅 (61公斤)',
      deadlift: '225磅 (102公斤)',
      squat: '185磅 (84公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '西蒙·拜爾斯 (Simone Biles)',
      gender: '女性',
      profession: '體操運動員',
      height: '4英尺8英寸 (142厘米)',
      weight: '104磅 (47公斤)',
      bodyFat: '10-12%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: '24英寸 (61厘米，估計)',
      standingLongJump: '8英尺6英寸 (2.6米)',
      sprint: 'N/A',
    },
    {
      name: '丹妮卡·帕特里克 (Danica Patrick)',
      gender: '女性',
      profession: '賽車手',
      height: '5英尺2英寸 (157厘米)',
      weight: '100磅 (45公斤)',
      bodyFat: '15-18%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '米斯蒂·科普蘭 (Misty Copeland)',
      gender: '女性',
      profession: '芭蕾舞者',
      height: '5英尺2英寸 (157厘米)',
      weight: '108磅 (49公斤)',
      bodyFat: '10-12%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: '30英寸 (76厘米，估計)',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '亞歷克斯·摩根 (Alex Morgan)',
      gender: '女性',
      profession: '足球運動員',
      height: '5英尺7英寸 (170厘米)',
      weight: '137磅 (62公斤)',
      bodyFat: '12-15%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: '24英寸 (61厘米，估計)',
      standingLongJump: 'N/A',
      sprint: '11.5秒 (估計)',
    },
    {
      name: '林賽·沃恩 (Lindsey Vonn)',
      gender: '女性',
      profession: '滑雪運動員',
      height: '5英尺10英寸 (178厘米)',
      weight: '160磅 (73公斤)',
      bodyFat: '15-18%',
      benchPress: '135磅 (61公斤)',
      deadlift: '225磅 (102公斤)',
      squat: '185磅 (84公斤)',
      verticalJump: '28英寸 (71厘米，估計)',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '吉娜·卡拉諾 (Gina Carano)',
      gender: '女性',
      profession: '綜合格鬥運動員/演員',
      height: '5英尺8英寸 (173厘米)',
      weight: '143磅 (65公斤)',
      bodyFat: '12-15%',
      benchPress: '135磅 (61公斤)',
      deadlift: '225磅 (102公斤)',
      squat: '185磅 (84公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '娜塔莉·考芙琳 (Natalie Coughlin)',
      gender: '女性',
      profession: '游泳運動員',
      height: '5英尺8英寸 (173厘米)',
      weight: '139磅 (63公斤)',
      bodyFat: '12-15%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '瑪麗亞·莎拉波娃 (Maria Sharapova)',
      gender: '女性',
      profession: '網球運動員',
      height: '6英尺2英寸 (188厘米)',
      weight: '130磅 (59公斤)',
      bodyFat: '10-12%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: '24英寸 (61厘米，估計)',
      standingLongJump: 'N/A',
      sprint: '12.0秒 (估計)',
    },
    {
      name: '蓋比·道格拉斯 (Gabby Douglas)',
      gender: '女性',
      profession: '體操運動員',
      height: '5英尺2英寸 (157厘米)',
      weight: '110磅 (50公斤)',
      bodyFat: '10-12%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: '24英寸 (61厘米，估計)',
      standingLongJump: '8英尺 (2.4米)',
      sprint: 'N/A',
    },
    {
      name: '萊拉·阿里 (Laila Ali)',
      gender: '女性',
      profession: '拳擊運動員',
      height: '5英尺10英寸 (178厘米)',
      weight: '175磅 (79公斤)',
      bodyFat: '15-18%',
      benchPress: '135磅 (61公斤)',
      deadlift: '225磅 (102公斤)',
      squat: '185磅 (84公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '霍普·索洛 (Hope Solo)',
      gender: '女性',
      profession: '足球運動員',
      height: '5英尺9英寸 (175厘米)',
      weight: '153磅 (69公斤)',
      bodyFat: '12-15%',
      benchPress: 'N/A',
      deadlift: 'N/A',
      squat: 'N/A',
      verticalJump: '24英寸 (61厘米，估計)',
      standingLongJump: 'N/A',
      sprint: '12.5秒 (估計)',
    },
    {
      name: '米歇爾·沃特森 (Michelle Waterson)',
      gender: '女性',
      profession: '綜合格鬥運動員',
      height: '5英尺3英寸 (160厘米)',
      weight: '115磅 (52公斤)',
      bodyFat: '10-12%',
      benchPress: '95磅 (43公斤)',
      deadlift: '135磅 (61公斤)',
      squat: '115磅 (52公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
    {
      name: '佩姬·範贊特 (Paige VanZant)',
      gender: '女性',
      profession: '綜合格鬥運動員',
      height: '5英尺4英寸 (163厘米)',
      weight: '115磅 (52公斤)',
      bodyFat: '10-12%',
      benchPress: '95磅 (43公斤)',
      deadlift: '135磅 (61公斤)',
      squat: '115磅 (52公斤)',
      verticalJump: 'N/A',
      standingLongJump: 'N/A',
      sprint: 'N/A',
    },
  ];

  // 性別篩選狀態
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', '男性', '女性'
  const [expandedCards, setExpandedCards] = useState({}); // 記錄每個卡片的展開狀態

  // 篩選名人數據
  const filteredCelebrities = celebrities.filter((celeb) => {
    if (genderFilter === 'all') return true;
    return celeb.gender === genderFilter;
  });

  // 切換卡片展開/折疊狀態
  const toggleCard = (index) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="celebrity-comparison-container">
      <h1 className="text-2xl font-bold text-center mb-4">與名人運動數據比較</h1>
      <p className="text-center mb-4">
      以下內容提供了關於知名運動員和訓練有素的娛樂明星的全面數據，盡可能從可靠來源獲取詳細數據，但也可能有所誤差。對於無法找到確切數字的部分，使用了估計值或「N/A」作為占位，以保持完整性，供大家參考。你可以與自己的分數進行比較，也許差距沒想像中大喔!
      </p>

      {/* 性別篩選 */}
      <div className="filter-section">
        <label className="filter-label">篩選性別：</label>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">全部</option>
          <option value="男性">男性</option>
          <option value="女性">女性</option>
        </select>
      </div>

      {/* 桌面端：表格佈局 */}
      <div className="celebrity-table desktop-table">
        <table>
          <thead>
            <tr>
              <th>名人</th>
              <th>性別</th>
              <th>職業</th>
              <th>身高</th>
              <th>體重</th>
              <th>體脂百分比</th>
              <th>臥推</th>
              <th>硬拉</th>
              <th>深蹲</th>
              <th>垂直跳</th>
              <th>立定跳遠</th>
              <th>100米衝刺</th>
            </tr>
          </thead>
          <tbody>
            {filteredCelebrities.map((celeb, index) => (
              <tr key={index}>
                <td>{celeb.name}</td>
                <td>{celeb.gender}</td>
                <td>{celeb.profession}</td>
                <td>{celeb.height}</td>
                <td>{celeb.weight}</td>
                <td>{celeb.bodyFat}</td>
                <td>{celeb.benchPress}</td>
                <td>{celeb.deadlift}</td>
                <td>{celeb.squat}</td>
                <td>{celeb.verticalJump}</td>
                <td>{celeb.standingLongJump}</td>
                <td>{celeb.sprint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 手機端：卡片佈局 */}
      <div className="celebrity-cards mobile-cards">
        {filteredCelebrities.map((celeb, index) => (
          <div key={index} className="celebrity-card">
            <h3 className="card-title">{celeb.name}</h3>
            <div className="card-content">
              <p><strong>性別：</strong>{celeb.gender}</p>
              <p><strong>職業：</strong>{celeb.profession}</p>
              <p><strong>身高：</strong>{celeb.height}</p>
              <p><strong>體重：</strong>{celeb.weight}</p>
              <p><strong>體脂百分比：</strong>{celeb.bodyFat}</p>
              {expandedCards[index] && (
                <div className="expanded-content">
                  <p><strong>臥推：</strong>{celeb.benchPress}</p>
                  <p><strong>硬拉：</strong>{celeb.deadlift}</p>
                  <p><strong>深蹲：</strong>{celeb.squat}</p>
                  <p><strong>垂直跳：</strong>{celeb.verticalJump}</p>
                  <p><strong>立定跳遠：</strong>{celeb.standingLongJump}</p>
                  <p><strong>100米衝刺：</strong>{celeb.sprint}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => toggleCard(index)}
              className="toggle-btn"
            >
              {expandedCards[index] ? '收起' : '展開更多'}
            </button>
          </div>
        ))}
      </div>

      {/* 返回按鈕 */}
      <div className="button-group">
        <button onClick={() => navigate('/user-info')} className="back-btn">
          返回總覽
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

  /* 篩選區域樣式 */
  .filter-section {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .filter-label {
    font-size: 1rem;
    font-weight: bold;
    margin-right: 0.5rem;
  }

  .filter-select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  /* 桌面端表格樣式 */
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
    white-space: nowrap;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  /* 手機端卡片樣式 */
  .celebrity-cards {
    display: none; /* 預設隱藏 */
  }

  .celebrity-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .card-content p {
    margin: 0.25rem 0;
    font-size: 1rem;
    color: #666;
  }

  .card-content p strong {
    color: #333;
  }

  .expanded-content {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #ddd;
  }

  .toggle-btn {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    background-color: #4bc0c0;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  .toggle-btn:hover {
    background-color: #3aa0a0;
  }

  /* 返回按鈕 */
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

  /* 響應式設計 */
  @media (max-width: 767px) {
    .celebrity-comparison-container {
      padding: 0.5rem;
    }

    /* 隱藏桌面端表格 */
    .desktop-table {
      display: none;
    }

    /* 顯示手機端卡片 */
    .mobile-cards {
      display: block;
    }

    .card-content p {
      font-size: 1rem; /* 確保字體大小易讀 */
    }
  }

  @media (min-width: 768px) {
    .celebrity-comparison-container {
      max-width: 1200px;
    }

    /* 顯示桌面端表格 */
    .desktop-table {
      display: block;
    }

    /* 隱藏手機端卡片 */
    .mobile-cards {
      display: none;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);