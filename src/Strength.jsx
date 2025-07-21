import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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

  // 新增分頁狀態
  const [currentTab, setCurrentTab] = useState('exercises'); // 'exercises', 'results', 'standards'

  const [benchPress, setBenchPress] = useState({
    weight: userData.testInputs?.strength?.benchPress?.weight || '',
    reps: userData.testInputs?.strength?.benchPress?.reps || '',
    max: userData.testInputs?.strength?.benchPress?.max || null,
    score: userData.testInputs?.strength?.benchPress?.score || null,
  });
  const [squat, setSquat] = useState({
    weight: userData.testInputs?.strength?.squat?.weight || '',
    reps: userData.testInputs?.strength?.squat?.reps || '',
    max: userData.testInputs?.strength?.squat?.max || null,
    score: userData.testInputs?.strength?.squat?.score || null,
  });
  const [deadlift, setDeadlift] = useState({
    weight: userData.testInputs?.strength?.deadlift?.weight || '',
    reps: userData.testInputs?.strength?.deadlift?.reps || '',
    max: userData.testInputs?.strength?.deadlift?.max || null,
    score: userData.testInputs?.strength?.deadlift?.score || null,
  });
  const [latPulldown, setLatPulldown] = useState({
    weight: userData.testInputs?.strength?.latPulldown?.weight || '',
    reps: userData.testInputs?.strength?.latPulldown?.reps || '',
    max: userData.testInputs?.strength?.latPulldown?.max || null,
    score: userData.testInputs?.strength?.latPulldown?.score || null,
  });
  const [shoulderPress, setShoulderPress] = useState({
    weight: userData.testInputs?.strength?.shoulderPress?.weight || '',
    reps: userData.testInputs?.strength?.shoulderPress?.reps || '',
    max: userData.testInputs?.strength?.shoulderPress?.max || null,
    score: userData.testInputs?.strength?.shoulderPress?.score || null,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // 將 useRef 移到組件頂層
  const timeoutRef = useRef(null);

  const debouncedSetUserData = useCallback(
    newUserData => {
      const updateData = () => {
        // 只在測試輸入有實質變化時才更新
        const currentTestInputs = userData.testInputs?.strength || {};
        const newTestInputs = newUserData.testInputs?.strength || {};

        const hasChanges =
          JSON.stringify(currentTestInputs) !== JSON.stringify(newTestInputs);

        if (hasChanges) {
          console.log('💾 測試輸入變化，更新用戶數據');
          setUserData(newUserData);
        } else {
          console.log('⏭️ 測試輸入無變化，跳過更新');
        }
      };

      // 清除之前的定時器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 設置新的定時器
      timeoutRef.current = setTimeout(updateData, 3000); // 增加到3秒防抖
    },
    [setUserData, userData.testInputs]
  );

  useEffect(() => {
    const updatedTestInputs = {
      ...userData.testInputs,
      strength: {
        benchPress: {
          weight: benchPress.weight,
          reps: benchPress.reps,
          max: benchPress.max,
          score: benchPress.score,
        },
        squat: {
          weight: squat.weight,
          reps: squat.reps,
          max: squat.max,
          score: squat.score,
        },
        deadlift: {
          weight: deadlift.weight,
          reps: deadlift.reps,
          max: deadlift.max,
          score: deadlift.score,
        },
        latPulldown: {
          weight: latPulldown.weight,
          reps: latPulldown.reps,
          max: latPulldown.max,
          score: latPulldown.score,
        },
        shoulderPress: {
          weight: shoulderPress.weight,
          reps: shoulderPress.reps,
          max: shoulderPress.max,
          score: shoulderPress.score,
        },
      },
    };
    const newUserData = { ...userData, testInputs: updatedTestInputs };
    debouncedSetUserData(newUserData);

    // 清理函數
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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

  const standardMap = useMemo(() => {
    const isMale = gender === 'male' || gender === '男性';
    return {
      benchPress: {
        bodyweight: isMale
          ? standards.bodyweightStandardsMaleBenchPress
          : standards.bodyweightStandardsFemaleBenchPress,
        age: isMale
          ? standards.ageStandardsMaleBenchPress
          : standards.ageStandardsFemaleBenchPress,
      },
      squat: {
        bodyweight: isMale
          ? standards.bodyweightStandardsMaleSquat
          : standards.bodyweightStandardsFemaleSquat,
        age: isMale
          ? standards.ageStandardsMaleSquat
          : standards.ageStandardsFemaleSquat,
      },
      deadlift: {
        bodyweight: isMale
          ? standards.bodyweightStandardsMaleDeadlift
          : standards.bodyweightStandardsFemaleDeadlift,
        age: isMale
          ? standards.ageStandardsMaleDeadlift
          : standards.ageStandardsFemaleDeadlift,
      },
      latPulldown: {
        bodyweight: isMale
          ? standards.bodyweightStandardsMaleLatPulldown
          : standards.bodyweightStandardsFemaleLatPulldown,
        age: isMale
          ? standards.ageStandardsMaleLatPulldown
          : standards.ageStandardsFemaleLatPulldown,
      },
      shoulderPress: {
        bodyweight: isMale
          ? standards.bodyweightStandardsMaleShoulderPress
          : standards.bodyweightStandardsFemaleShoulderPress,
        age: isMale
          ? standards.ageStandardsMaleShoulderPress
          : standards.ageStandardsFemaleShoulderPress,
      },
    };
  }, [gender]);

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

  // 自動計算已有數據的分數（在 calculateMaxStrength 定義之後）
  useEffect(() => {
    if (gender && userData.weight && age) {
      const exercisesToCalculate = [
        { key: 'benchPress', state: benchPress, setState: setBenchPress },
        { key: 'squat', state: squat, setState: setSquat },
        { key: 'deadlift', state: deadlift, setState: setDeadlift },
        { key: 'latPulldown', state: latPulldown, setState: setLatPulldown },
        {
          key: 'shoulderPress',
          state: shoulderPress,
          setState: setShoulderPress,
        },
      ];

      exercisesToCalculate.forEach(({ key, state, setState }) => {
        // 如果有重量和次數但沒有分數，則自動計算
        if (state.weight && state.reps && !state.score) {
          calculateMaxStrength(state.weight, state.reps, setState, key);
        }
      });
    }
  }, [
    gender,
    userData.weight,
    age,
    benchPress,
    squat,
    deadlift,
    latPulldown,
    shoulderPress,
    calculateMaxStrength,
  ]);

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
      {
        name: '臥推',
        value: parseFloat(benchPress.score) || 0,
      },
      {
        name: '深蹲',
        value: parseFloat(squat.score) || 0,
      },
      {
        name: '硬舉',
        value: parseFloat(deadlift.score) || 0,
      },
      {
        name: '滑輪下拉',
        value: parseFloat(latPulldown.score) || 0,
      },
      {
        name: '站姿肩推',
        value: parseFloat(shoulderPress.score) || 0,
      },
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
        // 保持原有的天梯分數，不自動更新
        ladderScore: prev.ladderScore || 0,
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

  // 運動項目配置
  const exercises = [
    {
      key: 'benchPress',
      name: '平板臥推',
      state: benchPress,
      setState: setBenchPress,
    },
    {
      key: 'squat',
      name: '深蹲',
      state: squat,
      setState: setSquat,
    },
    {
      key: 'deadlift',
      name: '硬舉',

      state: deadlift,
      setState: setDeadlift,
    },
    {
      key: 'latPulldown',
      name: '滑輪下拉',
      state: latPulldown,
      setState: setLatPulldown,
    },
    {
      key: 'shoulderPress',
      name: '站姿肩推',
      state: shoulderPress,
      setState: setShoulderPress,
    },
  ];

  // 展開狀態管理 - 所有項目初始都是收著的
  const [expandedExercises, setExpandedExercises] = useState(new Set());

  // 渲染運動項目卡片
  const renderExerciseCard = exercise => {
    const { key, name, icon, state, setState } = exercise;
    const hasScore = state.score !== null;
    const isExpanded = expandedExercises.has(key);

    const toggleExpanded = () => {
      const newExpanded = new Set(expandedExercises);
      if (isExpanded) {
        newExpanded.delete(key);
      } else {
        newExpanded.add(key);
      }
      setExpandedExercises(newExpanded);
    };

    return (
      <div key={key} className={`exercise-card ${hasScore ? 'completed' : ''}`}>
        <div className="exercise-header" onClick={toggleExpanded}>
          <div className="exercise-header-left">
            <span className="exercise-icon">{icon}</span>
            <h3 className="exercise-name">{name}</h3>
          </div>
          <div className="exercise-header-right">
            {hasScore && <span className="score-badge">{state.score}</span>}
            <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="exercise-content">
            <div className="exercise-inputs">
              <div className="input-group">
                <label htmlFor={`${key}Weight`}>重量 (kg)</label>
                <input
                  id={`${key}Weight`}
                  type="number"
                  placeholder="重量"
                  value={state.weight}
                  onChange={e =>
                    setState(prev => ({ ...prev, weight: e.target.value }))
                  }
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label htmlFor={`${key}Reps`}>次數</label>
                <input
                  id={`${key}Reps`}
                  type="number"
                  placeholder="次數"
                  value={state.reps}
                  onChange={e =>
                    setState(prev => ({ ...prev, reps: e.target.value }))
                  }
                  className="input-field"
                />
              </div>

              <button
                onClick={() =>
                  calculateMaxStrength(state.weight, state.reps, setState, key)
                }
                className="calculate-btn"
                disabled={!state.weight || !state.reps}
              >
                計算
              </button>
            </div>

            {state.max && (
              <div className="exercise-result">
                <p className="max-strength">最大力量: {state.max} kg</p>
                {state.score && (
                  <p className="score-display">分數: {state.score}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="strength-container">
      <div className="strength-header">
        <h1 className="strength-title">💪 力量評測</h1>
        <p className="strength-safety-note">
          挑戰重量時記得綁上腰帶和手套，注意安全喔
        </p>
      </div>

      {/* 分頁導航 */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${currentTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setCurrentTab('exercises')}
        >
          🏋️ 評測項目
        </button>
        <button
          className={`tab-btn ${currentTab === 'standards' ? 'active' : ''}`}
          onClick={() => setCurrentTab('standards')}
        >
          📋 評測標準
        </button>
      </div>

      {/* 評測項目分頁 */}
      {currentTab === 'exercises' && (
        <div className="exercises-tab">
          <div className="exercises-grid">
            {exercises.map(renderExerciseCard)}
          </div>

          {averageScore && (
            <div className="results-section">
              <div className="radar-chart-card">
                {/* 裝飾性角落元素 */}
                <div className="corner-decoration top-left"></div>
                <div className="corner-decoration top-right"></div>
                <div className="corner-decoration bottom-left"></div>
                <div className="corner-decoration bottom-right"></div>

                <h3>📈 力量分佈圖</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid
                      gridType="polygon"
                      stroke="rgba(129, 216, 208, 0.25)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{
                        fontSize: 13,
                        fill: '#2d3748',
                        fontWeight: 700,
                      }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{
                        fontSize: 12,
                        fill: '#2d3748',
                        fontWeight: 600,
                      }}
                    />
                    <Radar
                      name="分數"
                      dataKey="value"
                      stroke="#81D8D0"
                      fill="url(#strengthTiffanyGradient)"
                      fillOpacity={0.8}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient
                        id="strengthTiffanyGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#81D8D0"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="50%"
                          stopColor="#5F9EA0"
                          stopOpacity={0.7}
                        />
                        <stop
                          offset="100%"
                          stopColor="#81D8D0"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="score-breakdown-card">
                <h3>📊 分數詳情</h3>
                <div className="score-breakdown">
                  {exercises.map(exercise => (
                    <div key={exercise.key} className="score-item">
                      <span className="score-label">{exercise.name}</span>
                      <span className="score-value">
                        {exercise.state.score || '未測試'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="average-score-display">
                  <p className="average-score">平均分數: {averageScore}</p>
                  <p className="average-comment">
                    {getAverageScoreComment(averageScore, gender)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 評測標準分頁 */}
      {currentTab === 'standards' && (
        <div className="standards-tab">
          <div className="standards-content">
            <p>
              我們的評測標準基於 Strength Level 用戶提供的超過 1.34
              億次舉重數據，涵蓋男女標準，適用於臥推、深蹲、硬舉、肩推等多項健身動作。
            </p>
            <p className="source-link">
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

          <div className="score-levels-table">
            <h3>分數等級</h3>
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

          <div className="score-table">
            <h3>分數說明</h3>
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
        </div>
      )}

      {/* 提交按鈕 */}
      <div className="submit-section">
        <button
          onClick={handleSubmit}
          className="submit-btn"
          disabled={!averageScore}
        >
          {averageScore ? '✅ 提交並返回總覽' : '請至少完成一項評測'}
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
