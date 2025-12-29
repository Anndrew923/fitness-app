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
  Tooltip,
  LabelList,
} from 'recharts';
import PropTypes from 'prop-types';
import { calculateStrengthScore } from './utils/strength/scoring';
import { calculateOneRepMax } from './utils/strength/calculations';
import { SCORE_LEVELS } from './standards';

import './Strength.css';
import { useTranslation } from 'react-i18next';
import HonorUnlockModal from './components/shared/modals/HonorUnlockModal';
import BottomNavBar from './components/BottomNavBar';
import AdBanner from './components/AdBanner';

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
    rawScore: userData.testInputs?.strength?.benchPress?.rawScore || null,
    isCapped: userData.testInputs?.strength?.benchPress?.isCapped || false,
  });
  const [squat, setSquat] = useState({
    weight: userData.testInputs?.strength?.squat?.weight || '',
    reps: userData.testInputs?.strength?.squat?.reps || '',
    max: userData.testInputs?.strength?.squat?.max || null,
    score: userData.testInputs?.strength?.squat?.score || null,
    rawScore: userData.testInputs?.strength?.squat?.rawScore || null,
    isCapped: userData.testInputs?.strength?.squat?.isCapped || false,
  });
  const [deadlift, setDeadlift] = useState({
    weight: userData.testInputs?.strength?.deadlift?.weight || '',
    reps: userData.testInputs?.strength?.deadlift?.reps || '',
    max: userData.testInputs?.strength?.deadlift?.max || null,
    score: userData.testInputs?.strength?.deadlift?.score || null,
    rawScore: userData.testInputs?.strength?.deadlift?.rawScore || null,
    isCapped: userData.testInputs?.strength?.deadlift?.isCapped || false,
  });
  const [latPulldown, setLatPulldown] = useState({
    weight: userData.testInputs?.strength?.latPulldown?.weight || '',
    reps: userData.testInputs?.strength?.latPulldown?.reps || '',
    max: userData.testInputs?.strength?.latPulldown?.max || null,
    score: userData.testInputs?.strength?.latPulldown?.score || null,
    rawScore: userData.testInputs?.strength?.latPulldown?.rawScore || null,
    isCapped: userData.testInputs?.strength?.latPulldown?.isCapped || false,
  });
  const [shoulderPress, setShoulderPress] = useState({
    weight: userData.testInputs?.strength?.shoulderPress?.weight || '',
    reps: userData.testInputs?.strength?.shoulderPress?.reps || '',
    max: userData.testInputs?.strength?.shoulderPress?.max || null,
    score: userData.testInputs?.strength?.shoulderPress?.score || null,
    rawScore: userData.testInputs?.strength?.shoulderPress?.rawScore || null,
    isCapped: userData.testInputs?.strength?.shoulderPress?.isCapped || false,
  });
  // const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);

  // 將 useRef 移到組件頂層
  const timeoutRef = useRef(null);

  // 構建目前的 strength 測試輸入
  const buildUpdatedTestInputs = useCallback(() => {
    return {
      ...userData.testInputs,
      strength: {
        benchPress: {
          weight: benchPress.weight,
          reps: benchPress.reps,
          max: benchPress.max,
          score: benchPress.score,
          rawScore: benchPress.rawScore,
          isCapped: benchPress.isCapped,
        },
        squat: {
          weight: squat.weight,
          reps: squat.reps,
          max: squat.max,
          score: squat.score,
          rawScore: squat.rawScore,
          isCapped: squat.isCapped,
        },
        deadlift: {
          weight: deadlift.weight,
          reps: deadlift.reps,
          max: deadlift.max,
          score: deadlift.score,
          rawScore: deadlift.rawScore,
          isCapped: deadlift.isCapped,
        },
        latPulldown: {
          weight: latPulldown.weight,
          reps: latPulldown.reps,
          max: latPulldown.max,
          score: latPulldown.score,
          rawScore: latPulldown.rawScore,
          isCapped: latPulldown.isCapped,
        },
        shoulderPress: {
          weight: shoulderPress.weight,
          reps: shoulderPress.reps,
          max: shoulderPress.max,
          score: shoulderPress.score,
          rawScore: shoulderPress.rawScore,
          isCapped: shoulderPress.isCapped,
        },
      },
    };
  }, [
    userData.testInputs,
    benchPress,
    squat,
    deadlift,
    latPulldown,
    shoulderPress,
  ]);

  // 立即刷新當前的 strength 測試輸入至全域狀態（避免卸載時遺失）
  const flushTestInputs = useCallback(() => {
    const updatedTestInputs = buildUpdatedTestInputs();
    const currentTestInputs = userData.testInputs?.strength || {};
    const newTestInputs = updatedTestInputs.strength || {};
    const hasChanges =
      JSON.stringify(currentTestInputs) !== JSON.stringify(newTestInputs);
    if (hasChanges) {
      setUserData({ ...userData, testInputs: updatedTestInputs });
    }
  }, [buildUpdatedTestInputs, setUserData, userData]);

  useEffect(() => {
    // 即時同步到全域狀態（不再等候防抖）
    flushTestInputs();

    // 卸載或依賴變化時做最後一次刷新，避免遺失
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      flushTestInputs();
    };
  }, [
    benchPress,
    squat,
    deadlift,
    latPulldown,
    shoulderPress,
    flushTestInputs,
  ]);

  // 動作類型映射
  const exerciseTypeMap = {
    benchPress: 'Bench Press',
    squat: 'Squat',
    deadlift: 'Deadlift',
    latPulldown: 'Lat Pulldown',
    shoulderPress: 'Overhead Press',
  };

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

      // 使用新的計算邏輯
      const exerciseType = exerciseTypeMap[type];
      const genderValue =
        gender === 'male' || gender === '男性' ? 'male' : 'female';

      const finalScore = calculateStrengthScore(
        exerciseType,
        weightNum,
        repsNum,
        userWeight,
        genderValue,
        userAge
      );

      if (finalScore === null) {
        alert(t('tests.strengthErrors.invalidExercise'));
        return;
      }

      // 計算 1RM
      const liftWeight =
        exerciseType === 'Pull-ups' ? userWeight + weightNum : weightNum;
      const oneRepMax = calculateOneRepMax(liftWeight, repsNum);

      // 榮譽鎖邏輯
      const isVerified = userData.isVerified === true;
      let displayScore = finalScore;
      let isCapped = false;

      if (finalScore > 100) {
        if (isVerified) {
          // VIP/已認證：顯示真實分數
          displayScore = finalScore;
        } else {
          // 未認證：強制鎖在 100 分
          displayScore = 100;
          isCapped = true;
        }
      }

      setState(prev => ({
        ...prev,
        max: oneRepMax.toFixed(2),
        score: displayScore.toFixed(2),
        rawScore: finalScore,
        isCapped: isCapped,
      }));
    },
    [userData.weight, userData.isVerified, age, gender, t]
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

  const getStrengthFeedback = score => {
    const scoreNum = parseFloat(score);
    if (scoreNum >= 100)
      return t('tests.strength_rpg.feedback.legend');
    if (scoreNum >= 90)
      return t('tests.strength_rpg.feedback.apex');
    if (scoreNum >= 80)
      return t('tests.strength_rpg.feedback.elite');
    if (scoreNum >= 60)
      return t('tests.strength_rpg.feedback.steel');
    if (scoreNum >= 40)
      return t('tests.strength_rpg.feedback.growth');
    return t('tests.strength_rpg.feedback.potential');
  };

  const radarData = useMemo(
    () => [
      {
        name: t('tests.strengthExercises.benchPress'),
        value: Math.min(parseFloat(benchPress.score) || 0, 100), // 視覺封頂在 100
        rawValue: benchPress.rawScore || parseFloat(benchPress.score) || 0, // 真實分數用於標籤
        isCapped: benchPress.isCapped || false,
      },
      {
        name: t('tests.strengthExercises.squat'),
        value: Math.min(parseFloat(squat.score) || 0, 100),
        rawValue: squat.rawScore || parseFloat(squat.score) || 0,
        isCapped: squat.isCapped || false,
      },
      {
        name: t('tests.strengthExercises.deadlift'),
        value: Math.min(parseFloat(deadlift.score) || 0, 100),
        rawValue: deadlift.rawScore || parseFloat(deadlift.score) || 0,
        isCapped: deadlift.isCapped || false,
      },
      {
        name: t('tests.strengthExercises.latPulldown'),
        value: Math.min(parseFloat(latPulldown.score) || 0, 100),
        rawValue: latPulldown.rawScore || parseFloat(latPulldown.score) || 0,
        isCapped: latPulldown.isCapped || false,
      },
      {
        name: t('tests.strengthExercises.shoulderPress'),
        value: Math.min(parseFloat(shoulderPress.score) || 0, 100),
        rawValue:
          shoulderPress.rawScore || parseFloat(shoulderPress.score) || 0,
        isCapped: shoulderPress.isCapped || false,
      },
    ],
    [
      benchPress.score,
      benchPress.rawScore,
      benchPress.isCapped,
      squat.score,
      squat.rawScore,
      squat.isCapped,
      deadlift.score,
      deadlift.rawScore,
      deadlift.isCapped,
      latPulldown.score,
      latPulldown.rawScore,
      latPulldown.isCapped,
      shoulderPress.score,
      shoulderPress.rawScore,
      shoulderPress.isCapped,
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
    // 提交前強制刷新一次，確保輸入已保存
    flushTestInputs();
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

  // Map SCORE_LEVELS with translations and colors
  const scoreLevelsWithTranslations = SCORE_LEVELS.map((level, index) => {
    const colors = ['#FF6B6B', '#FFA726', '#FFEE58', '#66BB6A', '#42A5F5'];
    return {
      ...level,
      label: t(`tests.${level.label}`),
      color: colors[index],
    };
  });

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

  // 根據分數獲取等級
  const getLevelFromScore = score => {
    if (!score) return t('tests.strength_rpg.levels.novice');
    if (score >= 100) return t('tests.strength_rpg.levels.sovereign');
    if (score >= 80) return t('tests.strength_rpg.levels.knight');
    if (score >= 60) return t('tests.strength_rpg.levels.vanguard');
    if (score >= 40) return t('tests.strength_rpg.levels.guardian');
    return t('tests.strength_rpg.levels.novice');
  };

  // 處理解鎖按鈕點擊
  const handleUnlockClick = exercise => {
    const { name, state } = exercise;
    const level = getLevelFromScore(state.score);
    setUnlockModalData({
      exercise: name,
      score: state.score,
      level: level,
      weight: state.weight,
    });
    setIsUnlockModalOpen(true);
  };

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
                  <div className="score-display">
                    <p style={{ margin: 0 }}>
                      {t('tests.score')}: {state.score}
                      {state.rawScore &&
                        state.rawScore > 100 &&
                        !state.isCapped && (
                          <span
                            className="verified-badge"
                            title="已認證顯示真實分數"
                          >
                            {' '}
                            ✓
                          </span>
                        )}
                    </p>
                    {state.isCapped && (
                      <button
                        onClick={() => handleUnlockClick(exercise)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          width: 'fit-content',
                          background: 'rgba(0, 0, 0, 0.6)',
                          border: '1px solid rgba(234, 179, 8, 0.5)',
                          cursor: 'pointer',
                          marginTop: '8px',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background =
                            'rgba(0, 0, 0, 0.8)';
                          e.currentTarget.style.borderColor =
                            'rgba(234, 179, 8, 0.8)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background =
                            'rgba(0, 0, 0, 0.6)';
                          e.currentTarget.style.borderColor =
                            'rgba(234, 179, 8, 0.5)';
                        }}
                        title="點擊解鎖真實實力"
                      >
                        <span style={{ fontSize: '0.875rem' }}>🔒</span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#facc15',
                            fontWeight: 500,
                          }}
                          className="flex-shrink-0 whitespace-normal"
                        >
                          {t('actions.unlock_limit')}
                        </span>
                      </button>
                    )}
                  </div>
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
                      name={t('tests.score')}
                      dataKey="value"
                      stroke="#81D8D0"
                      fill="url(#strengthTiffanyGradient)"
                      fillOpacity={0.8}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <LabelList
                        dataKey="rawValue"
                        position="top"
                        formatter={value => {
                          if (value > 100) {
                            return value.toFixed(1);
                          }
                          return null;
                        }}
                      />
                    </Radar>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const rawValue = props.payload.rawValue;
                        if (rawValue && rawValue > 100) {
                          return [`真實分數: ${rawValue.toFixed(1)}`, name];
                        }
                        return [value.toFixed(1), name];
                      }}
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
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '4px',
                        }}
                      >
                        <span className="score-value">
                          {exercise.state.score || t('community.ui.noScore')}
                          {exercise.state.rawScore &&
                            exercise.state.rawScore > 100 &&
                            !exercise.state.isCapped && (
                              <span
                                className="verified-badge"
                                title="已認證顯示真實分數"
                              >
                                {' '}
                                ✓
                              </span>
                            )}
                        </span>
                        {exercise.state.isCapped && (
                          <button
                            onClick={() => handleUnlockClick(exercise)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              width: 'fit-content',
                              background: 'rgba(0, 0, 0, 0.6)',
                              border: '1px solid rgba(234, 179, 8, 0.5)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background =
                                'rgba(0, 0, 0, 0.8)';
                              e.currentTarget.style.borderColor =
                                'rgba(234, 179, 8, 0.8)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background =
                                'rgba(0, 0, 0, 0.6)';
                              e.currentTarget.style.borderColor =
                                'rgba(234, 179, 8, 0.5)';
                            }}
                            title="點擊解鎖真實實力"
                          >
                            <span style={{ fontSize: '0.875rem' }}>🔒</span>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#facc15',
                                fontWeight: 500,
                              }}
                              className="flex-shrink-0 whitespace-normal"
                            >
                              {t('actions.unlock_limit')}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="average-score-display">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <p className="average-score" style={{ margin: 0 }}>
                      {t('tests.averageScore')}: {averageScore}
                    </p>
                    {(() => {
                      // 檢查是否有任何單項被鎖定
                      const hasCappedScore = exercises.some(
                        ex => ex.state.isCapped
                      );
                      // 檢查平均分是否超過 100 且未認證
                      const avgScoreNum = parseFloat(averageScore);
                      const isVerified = userData.isVerified === true;
                      const shouldShowUnlock =
                        (avgScoreNum > 100 && !isVerified) || hasCappedScore;

                      return shouldShowUnlock ? (
                        <button
                          onClick={() => {
                            // 找到第一個 capped 的 exercise，如果沒有則使用平均分
                            const cappedExercise = exercises.find(ex => ex.state.isCapped);
                            if (cappedExercise) {
                              handleUnlockClick(cappedExercise);
                            } else {
                              // 使用平均分信息
                              const level = getLevelFromScore(avgScoreNum);
                              setUnlockModalData({
                                exercise: t('tests.averageScore'),
                                score: avgScoreNum,
                                level: level,
                                weight: null,
                              });
                              setIsUnlockModalOpen(true);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            width: 'fit-content',
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(234, 179, 8, 0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background =
                              'rgba(0, 0, 0, 0.8)';
                            e.currentTarget.style.borderColor =
                              'rgba(234, 179, 8, 0.8)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background =
                              'rgba(0, 0, 0, 0.6)';
                            e.currentTarget.style.borderColor =
                              'rgba(234, 179, 8, 0.5)';
                          }}
                          title="點擊解鎖真實實力"
                        >
                          <span style={{ fontSize: '0.875rem' }}>🔒</span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#facc15',
                              fontWeight: 500,
                            }}
                            className="flex-shrink-0 whitespace-normal"
                          >
                            {t('actions.unlock_limit')}
                          </span>
                        </button>
                      ) : null;
                    })()}
                  </div>
                  <p className="average-comment">
                    {getStrengthFeedback(averageScore)}
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
              {t('tests.standards_desc')}
            </p>
          </div>

          <div className="score-levels-table">
            <h3>{t('tests.strengthStandards.scoreLevelsTitle')}</h3>
            <div className="levels-container">
              {scoreLevelsWithTranslations.map((item, index) => (
                <div key={index} className="level-item">
                  <div className="level-header">
                    <span className="level-name">{item.label}</span>
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

      <HonorUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setUnlockModalData(null);
        }}
        data={unlockModalData}
      />

      {/* 廣告區塊 (置中顯示) */}
      {averageScore !== null && (
        <div className="ad-section" style={{ margin: '20px 0', textAlign: 'center' }}>
          <AdBanner position="inline" isFixed={false} showAd={true} />
        </div>
      )}

      {/* Spacer for Ad + Navbar scrolling - 确保按钮完全可见且可点击 */}
      <div style={{ height: '160px', width: '100%' }} />

      <BottomNavBar />
    </div>
  );
}

Strength.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Strength;
