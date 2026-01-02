import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as standards from '../standards';
import { useTranslation } from 'react-i18next';

export function useCardioLogic() {
  const { userData, setUserData, saveUserData } = useUser();
  const navigate = useNavigate();
  const { age, gender } = userData;
  const isVerified = userData.isVerified === true;
  const { t } = useTranslation();

  // --- State Management ---
  const [activeTab, setActiveTab] = useState('cooper');
  // Cooper Inputs
  const [distance, setDistance] = useState(userData.testInputs?.cardio?.distance || '');
  // 5KM Inputs
  const [runMinutes, setRunMinutes] = useState('');
  const [runSeconds, setRunSeconds] = useState('');

  const [score, setScore] = useState(null);
  const [rawScore, setRawScore] = useState(null);
  const [isCapped, setIsCapped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);

  // Reset score on tab switch
  useEffect(() => {
    setScore(null);
    setRawScore(null);
    setIsCapped(false);
  }, [activeTab]);

  // Persistence Effects
  useEffect(() => {
    if (activeTab === 'cooper' && distance) {
      const currentDistance = userData.testInputs?.cardio?.distance;
      if (currentDistance !== Number(distance)) {
        setUserData(prev => {
          const updated = { 
            ...prev.testInputs, 
            cardio: { 
              ...prev.testInputs?.cardio, 
              distance: Number(distance) 
            } 
          };
          return { ...prev, testInputs: updated };
        });
      }
    }
  }, [distance, activeTab]);

  useEffect(() => {
    if (activeTab === '5km' && (runMinutes || runSeconds)) {
      const currentMinutes = userData.testInputs?.run_5km?.minutes;
      const currentSeconds = userData.testInputs?.run_5km?.seconds;
      const newMinutes = Number(runMinutes) || 0;
      const newSeconds = Number(runSeconds) || 0;
      
      if (currentMinutes !== newMinutes || currentSeconds !== newSeconds) {
        setUserData(prev => {
          const updated = { 
            ...prev.testInputs, 
            run_5km: { 
              minutes: newMinutes, 
              seconds: newSeconds 
            } 
          };
          return { ...prev, testInputs: updated };
        });
      }
    }
  }, [runMinutes, runSeconds, activeTab]);

  // Load 5KM Data
  useEffect(() => {
    if (userData.testInputs?.run_5km) {
      setRunMinutes(userData.testInputs.run_5km.minutes || '');
      setRunSeconds(userData.testInputs.run_5km.seconds || '');
    }
  }, [userData.testInputs?.run_5km]);

  // --- Logic Helpers ---
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

  // Cooper: Limit Break Enabled (Linear Slope)
  const calculateScoreFromStandard = (value, standard) => {
    const min = standard[60];
    const max = standard[100];
    if (value <= 0) return 0;
    const slope = 40 / (max - min);
    const calculatedScore = 60 + (value - min) * slope;
    return parseFloat(calculatedScore.toFixed(2));
  };

  // 5KM: Benchmark 20min = 100pts
  const calculate5KmScoreLogic = (totalSeconds) => {
    const benchmarkSeconds = 20 * 60;
    const baselineSeconds = 45 * 60;

    if (totalSeconds <= benchmarkSeconds) {
      const bonus = (benchmarkSeconds - totalSeconds) / 10;
      return parseFloat((100 + bonus).toFixed(2));
    }
    if (totalSeconds >= baselineSeconds) return 0;
    const range = baselineSeconds - benchmarkSeconds;
    const diff = totalSeconds - benchmarkSeconds;
    const calculatedScore = 100 - (diff / range) * 100;
    return parseFloat(calculatedScore.toFixed(2));
  };

  const getComment = (score, gender) => {
    const genderValue =
      gender === '男性' || `${gender}`.toLowerCase() === 'male'
        ? 'male'
        : 'female';
    const bucket = Math.min(100, Math.max(0, Math.floor(score / 10) * 10));
    const key = `tests.cardioComments.${genderValue}.r${bucket}`;
    const fallback = t('tests.cardioComments.default');
    const msg = t(key);
    return msg === key ? fallback : msg;
  };

  const getLevelFromScore = (scoreNum) => {
    if (scoreNum >= 100) return 'legend';
    if (scoreNum >= 90) return 'apex';
    if (scoreNum >= 80) return 'elite';
    if (scoreNum >= 60) return 'steel';
    if (scoreNum >= 40) return 'growth';
    return 'potential';
  };

  // Calculation Handler
  const handleCalculate = () => {
    if (!age || !gender) {
      alert(t('tests.cardioErrors.missingPrerequisites'));
      return;
    }

    if (activeTab === 'cooper') {
      if (!distance) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      const ageRange = getAgeRange(age);
      if (!ageRange) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      
      const genderVal = gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
      const standardsObj = genderVal === 'male' ? standards.cooperStandardsMale : standards.cooperStandardsFemale;
      const standard = standardsObj[ageRange];

      if (!standard) { alert(t('tests.cardioErrors.standardsNotFound')); return; }
      
      const calculatedScore = calculateScoreFromStandard(parseFloat(distance), standard);
      
      const formattedRawScore = parseFloat(Number(calculatedScore).toFixed(2));
      const capped = !isVerified && calculatedScore > 100;
      
      setRawScore(formattedRawScore);
      setScore(formattedRawScore);
      setIsCapped(capped);

    } else if (activeTab === '5km') {
      const m = parseInt(runMinutes || 0);
      const s = parseInt(runSeconds || 0);
      if (!runMinutes && !runSeconds) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      const totalSec = (m * 60) + s;
      if (totalSec <= 0) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      
      const calculatedScore = calculate5KmScoreLogic(totalSec);
      
      const formattedRawScore = parseFloat(Number(calculatedScore).toFixed(2));
      const capped = !isVerified && calculatedScore > 100;
      
      setRawScore(formattedRawScore);
      setScore(formattedRawScore);
      setIsCapped(capped);
    }
  };

  // Handle unlock button click
  const handleUnlockClick = () => {
    const testName = activeTab === 'cooper' 
      ? t('tests.cardioTabs.cooper')
      : t('tests.cardioTabs.run5km');
    const level = getLevelFromScore(rawScore || score);
    setUnlockModalData({
      exercise: testName,
      score: rawScore || score,
      level: level,
      weight: null,
    });
    setIsUnlockModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (score === null || score === undefined || score === '') {
      alert(t('tests.cardioErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';
    setSubmitting(true);

    try {
      const updatedScores = JSON.parse(JSON.stringify(userData.scores || {}));
      const updatedTestInputs = JSON.parse(JSON.stringify(userData.testInputs || {}));

      const currentRawScore = rawScore !== null ? rawScore : score;
      const scoreToSave = (!isVerified && currentRawScore > 100) ? 100 : currentRawScore;
      const scoreToSaveFormatted = parseFloat(Number(scoreToSave).toFixed(2));

      if (activeTab === 'cooper') {
        updatedScores.cardio = scoreToSaveFormatted;
        updatedTestInputs.cardio = { 
          ...(updatedTestInputs.cardio || {}), 
          distance: Number(distance) || 0 
        };
      } else {
        const totalSec = (parseInt(runMinutes || 0) * 60) + parseInt(runSeconds || 0);
        const paceInSeconds = totalSec > 0 ? Math.round(totalSec / 5) : 0;
        
        updatedTestInputs.run_5km = { 
          minutes: Number(runMinutes) || 0, 
          seconds: Number(runSeconds) || 0 
        };
      }

      const s_str = Number(updatedScores.strength) || 0;
      const s_exp = Number(updatedScores.explosive) || Number(updatedScores.power) || 0;
      const s_mus = Number(updatedScores.muscleMass) || 0;
      const s_fat = Number(updatedScores.bodyFat) || 0;
      const s_cardio = Number(updatedScores.cardio) || 0;

      const currentRawTotal = (s_str + s_exp + s_mus + s_fat + s_cardio) / 5;

      let updatedUserData;

      if (activeTab === '5km') {
        const totalSec = (parseInt(runMinutes || 0) * 60) + parseInt(runSeconds || 0);
        const paceInSeconds = totalSec > 0 ? Math.round(totalSec / 5) : 0;
        
        updatedUserData = {
          ...userData,
          record_5km: {
            bestTime: totalSec,
            date: new Date().toISOString(),
            pace: paceInSeconds,
            location: userData.record_5km?.location || '',
            score: scoreToSaveFormatted,
          },
          stats_5k: totalSec,
          stats_5k_time: totalSec,
          stats_5k_score: scoreToSaveFormatted,
          scores: {
            ...userData.scores,
          },
          testInputs: updatedTestInputs,
          ladderScore: userData.ladderScore || 0,
          lastActive: new Date().toISOString()
        };
      } else {
        updatedUserData = {
          ...userData,
          scores: updatedScores,
          testInputs: updatedTestInputs,
          ladderScore: userData.ladderScore || 0,
          stats_5k: userData.stats_5k || 0,
          stats_5k_time: userData.stats_5k_time || 0,
          stats_cooper: Number(distance) || 0
        };
      }

      let firestoreUpdatePayload;
      
      if (activeTab === '5km') {
        const totalSec = (parseInt(runMinutes || 0) * 60) + parseInt(runSeconds || 0);
        const paceInSeconds = totalSec > 0 ? Math.round(totalSec / 5) : 0;
        
        firestoreUpdatePayload = {
          record_5km: {
            bestTime: totalSec,
            date: new Date().toISOString(),
            pace: paceInSeconds,
            location: userData.record_5km?.location || '',
            score: scoreToSaveFormatted,
          },
          stats_5k: totalSec,
          stats_5k_time: totalSec,
          stats_5k_score: scoreToSaveFormatted,
          testInputs: updatedTestInputs,
          updatedAt: new Date().toISOString()
        };
      } else {
        firestoreUpdatePayload = {
          scores: updatedScores,
          testInputs: updatedTestInputs,
          stats_cooper: Number(distance) || 0,
          updatedAt: new Date().toISOString()
        };
      }

      setUserData(updatedUserData);
      
      if (!isGuest) {
        const userId = userData.userId || auth.currentUser?.uid;
        if (userId) {
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, firestoreUpdatePayload, { merge: true });
        }
        await saveUserData(updatedUserData);
      }

      setShowSuccessModal(true);

    } catch (error) {
      console.error('Submit Failed:', error);
      if (!isGuest) alert(t('tests.cardioErrors.updateUserFail'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatScore = (val) => {
    return Number(val).toFixed(2);
  };

  const isLimitBroken = rawScore !== null && rawScore > 100;
  const displayScoreValue = score !== null ? score : 0;
  const formattedScore = formatScore(displayScoreValue);

  return {
    // State
    activeTab,
    setActiveTab,
    distance,
    setDistance,
    runMinutes,
    setRunMinutes,
    runSeconds,
    setRunSeconds,
    score,
    rawScore,
    isCapped,
    isExpanded,
    setIsExpanded,
    submitting,
    showSuccessModal,
    setShowSuccessModal,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    unlockModalData,
    setUnlockModalData,
    // Computed
    formattedScore,
    isLimitBroken,
    // Functions
    handleCalculate,
    handleSubmit,
    handleUnlockClick,
    getComment,
    navigate,
    age,
    gender,
  };
}

