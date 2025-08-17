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
import { useTranslation } from 'react-i18next';

function Strength({ onComplete }) {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { gender, age } = userData;
  const { t } = useTranslation();

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
  // const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

      // 設置新的定時器，增加到5秒防抖
      timeoutRef.current = setTimeout(updateData, 5000);
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
      if (!weight || !reps)
        return alert(t('tests.strengthErrors.missingInputs'));
      const weightNum = parseFloat(weight);
      const repsNum = parseFloat(reps);
      const userWeight = parseFloat(userData.weight);
      const userAge = parseFloat(age);
      if (!userWeight || !userAge)
        return alert(t('tests.strengthErrors.missingUserData'));
      if (repsNum > 12) {
        alert(t('tests.strengthErrors.repsTooHigh'));
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
      const finalScore = ((scoreByBodyweight + scoreByAge) / 2).toFixed(2);
      setState(prev => ({
        ...prev,
        max: valueToCompare.toFixed(2),
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
    const isMale =
      gender === '男性' || (gender && gender.toLowerCase() === 'male');
    const ns = isMale
      ? 'tests.strengthComments.male'
      : 'tests.strengthComments.female';
    if (score >= 90) return t(`${ns}.gte90`);
    if (score >= 80) return t(`${ns}.gte80`);
    if (score >= 70) return t(`${ns}.gte70`);
    if (score >= 60) return t(`${ns}.gte60`);
    if (score >= 50) return t(`${ns}.gte50`);
    if (score >= 40) return t(`${ns}.gte40`);
    return t(`${ns}.below40`);
  };

  const radarData = useMemo(
    () => [
      {
        name: t('tests.strengthExercises.benchPress'),
        value: parseFloat(benchPress.score) || 0,
      },
      {
        name: t('tests.strengthExercises.squat'),
        value: parseFloat(squat.score) || 0,
      },
      {
        name: t('tests.strengthExercises.deadlift'),
        value: parseFloat(deadlift.score) || 0,
      },
      {
        name: t('tests.strengthExercises.latPulldown'),
        value: parseFloat(latPulldown.score) || 0,
      },
      {
        name: t('tests.strengthExercises.shoulderPress'),
        value: parseFloat(shoulderPress.score) || 0,
      },
    ],
    [
      benchPress.score,
      squat.score,
      deadlift.score,
      latPulldown.score,
      shoulderPress.score,
      t,
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
          2
        )
      : null;

  const handleSubmit = async () => {
    if (!averageScore) return alert(t('tests.strengthErrors.needAtLeastOne'));
    if (submitting) return;
    setSubmitting(true);

    try {
      const updatedScores = {
        ...userData.scores,
        strength: parseFloat(averageScore),
      };

      setUserData(prev => ({
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

      navigate('/user-info', { state: { from: '/strength' } });
    } catch (error) {
      console.error('提交失敗:', error);
      alert(t('tests.strengthErrors.updateFail'));
      navigate('/user-info', { state: { from: '/strength' } });
    } finally {
      setSubmitting(false);
    }
  };

  const scoreTableData = [
    {
      range: '90~100',
      description: t('tests.strengthStandards.guide.items.90_100'),
    },
    {
      range: '80~90',
      description: t('tests.strengthStandards.guide.items.80_90'),
    },
    {
      range: '70~80',
      description: t('tests.strengthStandards.guide.items.70_80'),
    },
    {
      range: '60~70',
      description: t('tests.strengthStandards.guide.items.60_70'),
    },
    {
      range: '50~60',
      description: t('tests.strengthStandards.guide.items.50_60'),
    },
    {
      range: '40~50',
      description: t('tests.strengthStandards.guide.items.40_50'),
    },
    {
      range: t('tests.strengthStandards.guide.rangeBelow40'),
      description: t('tests.strengthStandards.guide.items.below40'),
    },
  ];

  const scoreLevels = [
    {
      level: t('tests.strengthStandards.levels.beginner'),
      score: 20,
      color: '#FF6B6B',
    },
    {
      level: t('tests.strengthStandards.levels.novice'),
      score: 40,
      color: '#FFA726',
    },
    {
      level: t('tests.strengthStandards.levels.intermediate'),
      score: 60,
      color: '#FFEE58',
    },
    {
      level: t('tests.strengthStandards.levels.advanced'),
      score: 80,
      color: '#66BB6A',
    },
    {
      level: t('tests.strengthStandards.levels.elite'),
      score: 100,
      color: '#42A5F5',
    },
  ];

  // 運動項目配置
  const exercises = [
    {
      key: 'benchPress',
      name: t('tests.strengthExercises.benchPress'),
      state: benchPress,
      setState: setBenchPress,
    },
    {
      key: 'squat',
      name: t('tests.strengthExercises.squat'),
      state: squat,
      setState: setSquat,
    },
    {
      key: 'deadlift',
      name: t('tests.strengthExercises.deadlift'),

      state: deadlift,
      setState: setDeadlift,
    },
    {
      key: 'latPulldown',
      name: t('tests.strengthExercises.latPulldown'),
      state: latPulldown,
      setState: setLatPulldown,
    },
    {
      key: 'shoulderPress',
      name: t('tests.strengthExercises.shoulderPress'),
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
                <label htmlFor={`${key}Weight`}>
                  {t('tests.strengthLabels.weightKg')}
                </label>
                <input
                  id={`${key}Weight`}
                  type="number"
                  placeholder={t('tests.strengthLabels.weightKg')}
                  value={state.weight}
                  onChange={e =>
                    setState(prev => ({ ...prev, weight: e.target.value }))
                  }
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label htmlFor={`${key}Reps`}>
                  {t('tests.strengthLabels.reps')}
                </label>
                <input
                  id={`${key}Reps`}
                  type="number"
                  placeholder={t('tests.strengthLabels.reps')}
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
                {t('common.calculate')}
              </button>
            </div>

            {state.max && (
              <div className="exercise-result">
                <p className="max-strength">
                  {t('tests.strengthLabels.maxStrength')}: {state.max} kg
                </p>
                {state.score && (
                  <p className="score-display">
                    {t('tests.score')}: {state.score}
                  </p>
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
        <h1 className="strength-title">💪 {t('tests.strengthTitle')}</h1>
        <p className="strength-safety-note">{t('tests.strengthSafetyNote')}</p>
      </div>

      {/* 分頁導航 */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${currentTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setCurrentTab('exercises')}
        >
          🏋️ {t('tests.startTest')}
        </button>
        <button
          className={`tab-btn ${currentTab === 'standards' ? 'active' : ''}`}
          onClick={() => setCurrentTab('standards')}
        >
          📋 {t('tests.strengthStandards.tabTitle')}
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

                <h3>📈 {t('tests.strengthTitle')}</h3>
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
                <h3>📊 {t('tests.score')}</h3>
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
                  <p className="average-score">
                    {t('tests.averageScore')}: {averageScore}
                  </p>
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
            <p>{t('tests.strengthStandards.intro')}</p>
            <p className="source-link">
              {t('tests.strengthStandards.sourceLabel')}
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
            <h3>{t('tests.strengthStandards.scoreLevelsTitle')}</h3>
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
            <h3>{t('tests.strengthStandards.scoreTableTitle')}</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>{t('tests.strengthStandards.table.range')}</th>
                  <th>{t('tests.strengthStandards.table.description')}</th>
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
          type="button"
          onClick={handleSubmit}
          className="submit-btn"
          disabled={!averageScore || submitting}
        >
          {submitting
            ? t('common.submitting')
            : averageScore
            ? `✅ ${t('common.submitAndReturn')}`
            : t('errors.required')}
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
