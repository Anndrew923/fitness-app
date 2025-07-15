import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import * as standards from './standards';
import PropTypes from 'prop-types';
import './Strength.css';

function Strength({ onComplete, clearTestData }) {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { gender, height, weight, age } = userData;

  const [benchPress, setBenchPress] = useState({
    weight: userData.testInputs?.strength?.benchPress?.weight || '',
    reps: userData.testInputs?.strength?.benchPress?.reps || '',
    max: null,
    score: null,
  });
  const [squat, setSquat] = useState({
    weight: userData.testInputs?.strength?.squat?.weight || '',
    reps: userData.testInputs?.strength?.squat?.reps || '',
    max: null,
    score: null,
  });
  const [deadlift, setDeadlift] = useState({
    weight: userData.testInputs?.strength?.deadlift?.weight || '',
    reps: userData.testInputs?.strength?.deadlift?.reps || '',
    max: null,
    score: null,
  });
  const [latPulldown, setLatPulldown] = useState({
    weight: userData.testInputs?.strength?.latPulldown?.weight || '',
    reps: userData.testInputs?.strength?.latPulldown?.reps || '',
    max: null,
    score: null,
  });
  const [shoulderPress, setShoulderPress] = useState({
    weight: userData.testInputs?.strength?.shoulderPress?.weight || '',
    reps: userData.testInputs?.strength?.shoulderPress?.reps || '',
    max: null,
    score: null,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const debouncedSetUserData = useCallback(
    newUserData => {
      let timeoutId;
      const updateData = () => setUserData(newUserData);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateData, 1000);
      return () => clearTimeout(timeoutId);
    },
    [setUserData]
  );

  useEffect(() => {
    const updatedTestInputs = {
      ...userData.testInputs,
      strength: {
        benchPress: { weight: benchPress.weight, reps: benchPress.reps },
        squat: { weight: squat.weight, reps: squat.reps },
        deadlift: { weight: deadlift.weight, reps: deadlift.reps },
        latPulldown: { weight: latPulldown.weight, reps: latPulldown.reps },
        shoulderPress: {
          weight: shoulderPress.weight,
          reps: shoulderPress.reps,
        },
      },
    };
    const newUserData = { ...userData, testInputs: updatedTestInputs };
    const cleanup = debouncedSetUserData(newUserData);
    return cleanup;
  }, [
    benchPress,
    squat,
    deadlift,
    latPulldown,
    shoulderPress,
    userData,
    debouncedSetUserData,
  ]);

  const calculateScore = (value, standard) => {
    const { Beginner, Novice, Intermediate, Advanced, Elite } = standard;
    if (value < Beginner) return 0;
    if (value >= Elite) return 100;
    if (value >= Advanced)
      return 80 + ((100 - 80) * (value - Advanced)) / (Elite - Advanced);
    if (value >= Intermediate)
      return (
        60 + ((80 - 60) * (value - Intermediate)) / (Advanced - Intermediate)
      );
    if (value >= Novice)
      return 40 + ((60 - 40) * (value - Novice)) / (Intermediate - Novice);
    if (value >= Beginner)
      return 20 + ((40 - 20) * (value - Beginner)) / (Novice - Beginner);
    return 0;
  };

  const standardMap = useMemo(
    () => ({
      benchPress: {
        bodyweight:
          gender === 'female'
            ? standards.bodyweightStandardsFemaleBenchPress
            : standards.bodyweightStandardsMaleBenchPress,
        age:
          gender === 'female'
            ? standards.ageStandardsFemaleBenchPress
            : standards.ageStandardsMaleBenchPress,
      },
      squat: {
        bodyweight:
          gender === 'female'
            ? standards.bodyweightStandardsFemaleSquat
            : standards.bodyweightStandardsMaleSquat,
        age:
          gender === 'female'
            ? standards.ageStandardsFemaleSquat
            : standards.ageStandardsMaleSquat,
      },
      deadlift: {
        bodyweight:
          gender === 'female'
            ? standards.bodyweightStandardsFemaleDeadlift
            : standards.bodyweightStandardsMaleDeadlift,
        age:
          gender === 'female'
            ? standards.ageStandardsFemaleDeadlift
            : standards.ageStandardsMaleDeadlift,
      },
      latPulldown: {
        bodyweight:
          gender === 'female'
            ? standards.bodyweightStandardsFemaleLatPulldown
            : standards.bodyweightStandardsMaleLatPulldown,
        age:
          gender === 'female'
            ? standards.ageStandardsFemaleLatPulldown
            : standards.ageStandardsMaleLatPulldown,
      },
      shoulderPress: {
        bodyweight:
          gender === 'female'
            ? standards.bodyweightStandardsFemaleShoulderPress
            : standards.bodyweightStandardsMaleShoulderPress,
        age:
          gender === 'female'
            ? standards.ageStandardsFemaleShoulderPress
            : standards.ageStandardsMaleShoulderPress,
      },
    }),
    [gender, standards]
  );

  const calculateMaxStrength = useCallback(
    (weight, reps, setState, type) => {
      if (!weight || !reps) return alert('請輸入重量和次數！');
      const weightNum = parseFloat(weight);
      const repsNum = parseFloat(reps);
      const userWeight = parseFloat(userData.weight);
      const userAge = parseFloat(age);
      if (!userWeight || !userAge)
        return alert('請確保已輸入有效的體重和年齡！');
      if (repsNum > 12) {
        alert('可完成次數不得超過12次，請重新輸入！');
        setState(prev => ({ ...prev, reps: '' }));
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
      const scoreByBodyweight = calculateScore(
        valueToCompare,
        bodyweightStandard
      );
      const scoreByAge = calculateScore(valueToCompare, ageStandard);
      const finalScore = ((scoreByBodyweight + scoreByAge) / 2).toFixed(1);
      setState(prev => ({
        ...prev,
        max: valueToCompare.toFixed(1),
        score: finalScore,
      }));
    },
    [standardMap, userData.weight, age]
  );

  const getAverageScoreComment = (score, gender) => {
    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    if (score >= 90)
      return genderValue === 'male'
        ? '頂尖表現！你已達建力、舉重專項運動員水平！接受掌聲吧！'
        : '我願稱你為神力女超人!';
    if (score >= 80)
      return genderValue === 'male'
        ? '萬里挑一！你已達到職業運動員水平，繼續稱霸！'
        : '太驚艷了！你應該是朋友圈裡最強的吧？超棒的！';
    if (score >= 70)
      return genderValue === 'male'
        ? '超越常人！許多國手的力量指標也落在這，相當厲害!'
        : '真的很傑出！表現超棒，繼續保持哦！';
    if (score >= 60)
      return genderValue === 'male'
        ? '很強！業餘運動愛好者中的佼佼者，再拼一把！'
        : '表現超棒！超越大多數人，你很厲害！';
    if (score >= 50)
      return genderValue === 'male'
        ? '不錯的水準！訓練痕跡肉眼可見！'
        : '很棒的水準！再努力一點，你會更好！';
    if (score >= 40)
      return genderValue === 'male'
        ? '已經有基礎了，繼續進步，一切大有可為!'
        : '有規律良好的運動習慣了!再接再厲';
    return genderValue === 'male'
      ? '兄弟，該衝了！全力以赴，突破自己！'
      : '親愛的，還有進步空間，繼續加油哦！';
  };

  const radarData = useMemo(
    () => [
      { name: '臥推', value: parseFloat(benchPress.score) || 0 },
      { name: '深蹲', value: parseFloat(squat.score) || 0 },
      { name: '硬舉', value: parseFloat(deadlift.score) || 0 },
      { name: '滑輪下拉', value: parseFloat(latPulldown.score) || 0 },
      { name: '站姿肩推', value: parseFloat(shoulderPress.score) || 0 },
    ],
    [
      benchPress.score,
      squat.score,
      deadlift.score,
      latPulldown.score,
      shoulderPress.score,
    ]
  );

  const scores = [
    benchPress.score,
    squat.score,
    deadlift.score,
    latPulldown.score,
    shoulderPress.score,
  ].filter(score => score !== null);
  const averageScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + parseFloat(b), 0) / scores.length).toFixed(
          1
        )
      : null;

  const handleSubmit = async () => {
    if (!averageScore) return alert('請至少完成一項評測！');

    try {
      const updatedScores = {
        ...userData.scores,
        strength: parseFloat(averageScore),
      };

      await setUserData(prev => ({
        ...prev,
        scores: updatedScores,
      }));

      const testData = {
        squat: squat.max
          ? {
              weight: squat.weight,
              reps: squat.reps,
              max: squat.max,
              score: squat.score,
            }
          : null,
        benchPress: benchPress.max
          ? {
              weight: benchPress.weight,
              reps: benchPress.reps,
              max: benchPress.max,
              score: benchPress.score,
            }
          : null,
        deadlift: deadlift.max
          ? {
              weight: deadlift.weight,
              reps: deadlift.reps,
              max: deadlift.max,
              score: deadlift.score,
            }
          : null,
        latPulldown: latPulldown.max
          ? {
              weight: latPulldown.weight,
              reps: latPulldown.reps,
              max: latPulldown.max,
              score: latPulldown.score,
            }
          : null,
        shoulderPress: shoulderPress.max
          ? {
              weight: shoulderPress.weight,
              reps: shoulderPress.reps,
              max: shoulderPress.max,
              score: shoulderPress.score,
            }
          : null,
        averageScore: parseFloat(averageScore),
      };

      if (onComplete) {
        onComplete(testData);
      }

      setTimeout(() => {
        navigate('/user-info', { state: { from: '/strength' } });
      }, 500);
    } catch (error) {
      console.error('提交失敗:', error);
      alert('更新用戶數據或導航失敗，請稍後再試！');
    }
  };

  const scoreTableData = [
    {
      range: '90~100',
      description:
        '專業舉重、健力專項運動員、大力士水平，如魔山、輪子哥、阿諾、John Cena',
    },
    {
      range: '80~90',
      description:
        '職業運動員水平；職業格鬥、橄欖球運動員，如巨石強森、GSP(UFC次中量級世界冠軍)',
    },
    {
      range: '70~80',
      description: '國手水平、球類運動員，如大谷翔平、LBJ、傑森史塔森',
    },
    {
      range: '60~70',
      description:
        '業餘運動愛好者中的高手，如休傑克曼、克里斯漢斯沃、亨利卡維爾',
    },
    { range: '50~60', description: '中階運動愛好者' },
    { range: '40~50', description: '開始步入軌道' },
    { range: '40分以下', description: '初學者' },
  ];

  const scoreLevels = [
    { level: '初階-運動習慣培養中', score: 20, color: '#FF6B6B' },
    { level: '入門-業餘運動愛好者', score: 40, color: '#FFA726' },
    { level: '中等-訓練痕跡肉眼可見', score: 60, color: '#FFEE58' },
    { level: '高階-職業運動員等級', score: 80, color: '#66BB6A' },
    { level: '精英-舉重、健力運動員', score: 100, color: '#42A5F5' },
  ];

  return (
    <div className="strength-container">
      <h1 className="text-2xl font-bold text-center mb-4">力量評測</h1>
      <p>性別：{gender || '未選擇'}</p>
      <p>身高：{height ? `${height} 公分` : '未輸入'}</p>
      <p>體重：{weight ? `${weight} 公斤` : '未輸入'}</p>
      <p>年齡：{age || '未輸入'}</p>

      <div className="instructions-btn-container">
        <button
          onClick={() => navigate('/strength-instructions')}
          className="nav-btn"
        >
          動作說明
        </button>
      </div>

      <div className="standards-card">
        <div
          className="standards-header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-lg font-semibold">評測標準說明</h2>
          <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
        {isExpanded && (
          <div className="standards-content">
            <p>
              我們的評測標準基於 Strength Level 用戶提供的超過 1.34
              億次舉重數據，涵蓋男女標準，適用於臥推、深蹲、硬舉、肩推等多項健身動作。
            </p>
            <p className="mt-2 text-sm text-gray-600">
              來源：
              <a
                href="https://strengthlevel.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://strengthlevel.com/
              </a>
            </p>
          </div>
        )}
      </div>

      {/* 新增的分數等級表格 */}
      <div className="score-levels-table">
        <h3 className="text-lg font-semibold mb-3">分數等級</h3>
        <div className="levels-container">
          {scoreLevels.map((item, index) => (
            <div key={index} className="level-item">
              <div className="level-header">
                <span className="level-name">{item.level}</span>
                <span className="level-score">{item.score}</span>
              </div>
              <div className="level-bar-container">
                <div
                  className="level-bar"
                  style={{
                    width: `${item.score}%`,
                    background: `linear-gradient(to right, ${item.color}dd, ${item.color})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">臥推</h2>
        <label
          htmlFor="benchPressWeight"
          className="block text-sm font-medium text-gray-700"
        >
          重量 (kg)
        </label>
        <input
          id="benchPressWeight"
          name="benchPressWeight"
          type="number"
          placeholder="重量 (kg)"
          value={benchPress.weight}
          onChange={e =>
            setBenchPress(prev => ({ ...prev, weight: e.target.value }))
          }
          className="input-field"
        />
        <label
          htmlFor="benchPressReps"
          className="block text-sm font-medium text-gray-700"
        >
          次數 (12次以下較準確)
        </label>
        <input
          id="benchPressReps"
          name="benchPressReps"
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={benchPress.reps}
          onChange={e =>
            setBenchPress(prev => ({ ...prev, reps: e.target.value }))
          }
          className="input-field"
        />
        <button
          onClick={() =>
            calculateMaxStrength(
              benchPress.weight,
              benchPress.reps,
              setBenchPress,
              'benchPress'
            )
          }
          className="calculate-btn"
        >
          計算
        </button>
        {benchPress.max && <p>最大力量 (1RM): {benchPress.max} kg</p>}
        {benchPress.score && (
          <p className="score-display">分數: {benchPress.score}</p>
        )}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">深蹲</h2>
        <label
          htmlFor="squatWeight"
          className="block text-sm font-medium text-gray-700"
        >
          重量 (kg)
        </label>
        <input
          id="squatWeight"
          name="squatWeight"
          type="number"
          placeholder="重量 (kg)"
          value={squat.weight}
          onChange={e =>
            setSquat(prev => ({ ...prev, weight: e.target.value }))
          }
          className="input-field"
        />
        <label
          htmlFor="squatReps"
          className="block text-sm font-medium text-gray-700"
        >
          次數 (12次以下較準確)
        </label>
        <input
          id="squatReps"
          name="squatReps"
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={squat.reps}
          onChange={e => setSquat(prev => ({ ...prev, reps: e.target.value }))}
          className="input-field"
        />
        <button
          onClick={() =>
            calculateMaxStrength(squat.weight, squat.reps, setSquat, 'squat')
          }
          className="calculate-btn"
        >
          計算
        </button>
        {squat.max && <p>最大力量 (1RM): {squat.max} kg</p>}
        {squat.score && <p className="score-display">分數: {squat.score}</p>}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">硬舉</h2>
        <label
          htmlFor="deadliftWeight"
          className="block text-sm font-medium text-gray-700"
        >
          重量 (kg)
        </label>
        <input
          id="deadliftWeight"
          name="deadliftWeight"
          type="number"
          placeholder="重量 (kg)"
          value={deadlift.weight}
          onChange={e =>
            setDeadlift(prev => ({ ...prev, weight: e.target.value }))
          }
          className="input-field"
        />
        <label
          htmlFor="deadliftReps"
          className="block text-sm font-medium text-gray-700"
        >
          次數 (12次以下較準確)
        </label>
        <input
          id="deadliftReps"
          name="deadliftReps"
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={deadlift.reps}
          onChange={e =>
            setDeadlift(prev => ({ ...prev, reps: e.target.value }))
          }
          className="input-field"
        />
        <button
          onClick={() =>
            calculateMaxStrength(
              deadlift.weight,
              deadlift.reps,
              setDeadlift,
              'deadlift'
            )
          }
          className="calculate-btn"
        >
          計算
        </button>
        {deadlift.max && <p>最大力量 (1RM): {deadlift.max} kg</p>}
        {deadlift.score && (
          <p className="score-display">分數: {deadlift.score}</p>
        )}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">滑輪下拉</h2>
        <label
          htmlFor="latPulldownWeight"
          className="block text-sm font-medium text-gray-700"
        >
          重量 (kg)
        </label>
        <input
          id="latPulldownWeight"
          name="latPulldownWeight"
          type="number"
          placeholder="重量 (kg)"
          value={latPulldown.weight}
          onChange={e =>
            setLatPulldown(prev => ({ ...prev, weight: e.target.value }))
          }
          className="input-field"
        />
        <label
          htmlFor="latPulldownReps"
          className="block text-sm font-medium text-gray-700"
        >
          次數 (12次以下較準確)
        </label>
        <input
          id="latPulldownReps"
          name="latPulldownReps"
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={latPulldown.reps}
          onChange={e =>
            setLatPulldown(prev => ({ ...prev, reps: e.target.value }))
          }
          className="input-field"
        />
        <button
          onClick={() =>
            calculateMaxStrength(
              latPulldown.weight,
              latPulldown.reps,
              setLatPulldown,
              'latPulldown'
            )
          }
          className="calculate-btn"
        >
          計算
        </button>
        {latPulldown.max && <p>最大力量: {latPulldown.max} kg</p>}
        {latPulldown.score && (
          <p className="score-display">分數: {latPulldown.score}</p>
        )}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">站姿肩推</h2>
        <label
          htmlFor="shoulderPressWeight"
          className="block text-sm font-medium text-gray-700"
        >
          重量 (kg)
        </label>
        <input
          id="shoulderPressWeight"
          name="shoulderPressWeight"
          type="number"
          placeholder="重量 (kg)"
          value={shoulderPress.weight}
          onChange={e =>
            setShoulderPress(prev => ({ ...prev, weight: e.target.value }))
          }
          className="input-field"
        />
        <label
          htmlFor="shoulderPressReps"
          className="block text-sm font-medium text-gray-700"
        >
          次數 (12次以下較準確)
        </label>
        <input
          id="shoulderPressReps"
          name="shoulderPressReps"
          type="number"
          placeholder="次數 (12次以下較準確)"
          value={shoulderPress.reps}
          onChange={e =>
            setShoulderPress(prev => ({ ...prev, reps: e.target.value }))
          }
          className="input-field"
        />
        <button
          onClick={() =>
            calculateMaxStrength(
              shoulderPress.weight,
              shoulderPress.reps,
              setShoulderPress,
              'shoulderPress'
            )
          }
          className="calculate-btn"
        >
          計算
        </button>
        {shoulderPress.max && <p>最大力量 (1RM): {shoulderPress.max} kg</p>}
        {shoulderPress.score && (
          <p className="score-display">分數: {shoulderPress.score}</p>
        )}
      </div>

      <div className="radar-chart">
        <h2 className="text-lg font-semibold text-center mb-4">
          力量評測雷達圖
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="分數"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {averageScore && (
        <div className="average-score-section">
          <p className="average-score">平均分數: {averageScore}</p>
          <p className="average-comment">
            {getAverageScoreComment(averageScore, gender)}
          </p>
        </div>
      )}

      <div className="score-table">
        <h2 className="text-lg font-semibold text-center mb-4">分數說明</h2>
        <table className="table">
          <thead>
            <tr>
              <th>分數範圍</th>
              <th>說明</th>
            </tr>
          </thead>
          <tbody>
            {scoreTableData.map((row, index) => (
              <tr key={index}>
                <td>{row.range}</td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-group">
        <button onClick={handleSubmit} className="submit-btn">
          提交並返回總覽
        </button>
      </div>
    </div>
  );
}

Strength.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Strength;
