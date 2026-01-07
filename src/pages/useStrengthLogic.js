import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useUser } from '../UserContext';
import { calculateStrengthScore } from '../utils/strength/scoring';
import { calculateOneRepMax } from '../utils/strength/calculations';
import { useTranslation } from 'react-i18next';
import { applyLinearExtension } from '../utils/ladderUtils';
import { isUserVerified } from '../utils/verificationSystem';

// Exercise type mapping
const exerciseTypeMap = {
  benchPress: 'Bench Press',
  squat: 'Squat',
  deadlift: 'Deadlift',
  latPulldown: 'Lat Pulldown',
  shoulderPress: 'Overhead Press',
};

export function useStrengthLogic() {
  const { userData, setUserData } = useUser();
  const { gender, age } = userData;
  const { t } = useTranslation();

  // Tab state
  const [currentTab, setCurrentTab] = useState('exercises');

  // Exercise states
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

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState(new Set());
  const timeoutRef = useRef(null);

  // Build updated test inputs
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
  }, [userData.testInputs, benchPress, squat, deadlift, latPulldown, shoulderPress]);

  // Flush test inputs to global state
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

  // Sync test inputs effect
  useEffect(() => {
    flushTestInputs();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      flushTestInputs();
    };
  }, [benchPress, squat, deadlift, latPulldown, shoulderPress, flushTestInputs]);

  // Calculate max strength
  const calculateMaxStrength = useCallback(
    (weight, reps, setState, type) => {
      if (!weight || !reps) return alert(t('tests.strengthErrors.missingInputs'));
      const weightNum = parseFloat(weight);
      const repsNum = parseFloat(reps);
      const userWeight = parseFloat(userData.weight);
      const userAge = parseFloat(age);
      if (!userWeight || !userAge)
        return alert(t('tests.strengthErrors.missingUserData'));
      if (repsNum > 10) {
        alert(t('tests.strengthErrors.repsTooHigh'));
        setState(prev => ({ ...prev, reps: '' }));
        return;
      }

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

      const liftWeight =
        exerciseType === 'Pull-ups' ? userWeight + weightNum : weightNum;
      const oneRepMax = calculateOneRepMax(liftWeight, repsNum);

      // Phase 1-6: Apply linear extension with tier support
      const verificationStatus = userData?.verifications || {};
      const extendedScore = applyLinearExtension(finalScore, verificationStatus, 'limit_break');
      const isVerified = isUserVerified(userData, 'limit_break');
      const isCapped = !isVerified && finalScore > 100;

      setState(prev => ({
        ...prev,
        max: oneRepMax.toFixed(2),
        score: extendedScore.toFixed(2), // Display extended score
        rawScore: finalScore, // Store raw score for unlock modal
        isCapped: isCapped,
      }));
    },
    [userData.weight, userData.isVerified, age, gender, t, exerciseTypeMap]
  );

  // Auto-calculate existing data
  useEffect(() => {
    if (gender && userData.weight && age) {
      const exercisesToCalculate = [
        { key: 'benchPress', state: benchPress, setState: setBenchPress },
        { key: 'squat', state: squat, setState: setSquat },
        { key: 'deadlift', state: deadlift, setState: setDeadlift },
        { key: 'latPulldown', state: latPulldown, setState: setLatPulldown },
        { key: 'shoulderPress', state: shoulderPress, setState: setShoulderPress },
      ];

      exercisesToCalculate.forEach(({ key, state, setState }) => {
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

  // Get strength feedback
  const getStrengthFeedback = score => {
    const scoreNum = parseFloat(score);
    if (scoreNum >= 100) return t('tests.strength_rpg.feedback.legend');
    if (scoreNum >= 90) return t('tests.strength_rpg.feedback.apex');
    if (scoreNum >= 80) return t('tests.strength_rpg.feedback.elite');
    if (scoreNum >= 60) return t('tests.strength_rpg.feedback.steel');
    if (scoreNum >= 40) return t('tests.strength_rpg.feedback.growth');
    return t('tests.strength_rpg.feedback.potential');
  };

  // Calculate average score
  const rawScores = [
    benchPress.rawScore !== null && benchPress.rawScore !== undefined
      ? benchPress.rawScore
      : parseFloat(benchPress.score) || null,
    squat.rawScore !== null && squat.rawScore !== undefined
      ? squat.rawScore
      : parseFloat(squat.score) || null,
    deadlift.rawScore !== null && deadlift.rawScore !== undefined
      ? deadlift.rawScore
      : parseFloat(deadlift.score) || null,
    latPulldown.rawScore !== null && latPulldown.rawScore !== undefined
      ? latPulldown.rawScore
      : parseFloat(latPulldown.score) || null,
    shoulderPress.rawScore !== null && shoulderPress.rawScore !== undefined
      ? shoulderPress.rawScore
      : parseFloat(shoulderPress.score) || null,
  ].filter(score => score !== null);
  const averageScore =
    rawScores.length > 0
      ? (rawScores.reduce((a, b) => a + b, 0) / rawScores.length).toFixed(2)
      : null;

  // Handle submit
  const handleSubmit = async () => {
    flushTestInputs();
    if (!averageScore) return alert(t('tests.strengthErrors.needAtLeastOne'));
    if (submitting) return;
    setSubmitting(true);

    try {
      const rawScores = [
        benchPress.rawScore,
        squat.rawScore,
        deadlift.rawScore,
        latPulldown.rawScore,
        shoulderPress.rawScore,
      ].filter(score => score !== null && score !== undefined);

      if (rawScores.length === 0) {
        alert(t('tests.strengthErrors.needAtLeastOne'));
        setSubmitting(false);
        return;
      }

      const rawAverageScore =
        rawScores.reduce((a, b) => a + b, 0) / rawScores.length;
      // Phase 1-6: Apply linear extension on submit
      const verificationStatus = userData?.verifications || {};
      const scoreToSave = applyLinearExtension(rawAverageScore, verificationStatus, 'limit_break');

      const updatedScores = {
        ...userData.scores,
        strength: parseFloat(scoreToSave.toFixed(2)),
      };

      const updatedTestInputs = {
        ...userData.testInputs,
        strength: {
          ...buildUpdatedTestInputs().strength,
          bodyWeight: parseFloat(userData.weight),
        },
      };

      setUserData(prev => ({
        ...prev,
        scores: updatedScores,
        testInputs: updatedTestInputs,
        ladderScore: prev.ladderScore || 0,
      }));

      setShowSuccessModal(true);
    } catch (error) {
      console.error('提交失敗:', error);
      alert(t('tests.strengthErrors.updateFail'));
    } finally {
      setSubmitting(false);
    }
  };

  // Get level from score
  const getLevelFromScore = score => {
    if (!score) return t('tests.strength_rpg.levels.novice');
    if (score >= 100) return t('tests.strength_rpg.levels.sovereign');
    if (score >= 80) return t('tests.strength_rpg.levels.knight');
    if (score >= 60) return t('tests.strength_rpg.levels.vanguard');
    if (score >= 40) return t('tests.strength_rpg.levels.guardian');
    return t('tests.strength_rpg.levels.novice');
  };

  // Handle unlock click
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

  // Exercises config
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

  // Radar chart data
  const radarData = useMemo(
    () => [
      {
        name: t('tests.strengthExercises.benchPress'),
        value: Math.min(parseFloat(benchPress.score) || 0, 100),
        rawValue: benchPress.rawScore || parseFloat(benchPress.score) || 0,
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

  return {
    // State
    currentTab,
    setCurrentTab,
    exercises,
    expandedExercises,
    setExpandedExercises,
    averageScore,
    radarData,
    submitting,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    unlockModalData,
    setUnlockModalData,
    showSuccessModal,
    setShowSuccessModal,
    // Functions
    calculateMaxStrength,
    handleSubmit,
    handleUnlockClick,
    getStrengthFeedback,
    getLevelFromScore,
    exerciseTypeMap,
    userData,
  };
}

