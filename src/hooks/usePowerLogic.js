import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as standards from '../standards';
import { useTranslation } from 'react-i18next';

export function usePowerLogic() {
  const { userData, setUserData, saveUserData } = useUser();
  const navigate = useNavigate();
  const { age, gender } = userData;
  const isVerified = userData.isVerified === true;
  const { t } = useTranslation();

  const [verticalJump, setVerticalJump] = useState(
    userData.testInputs?.power?.verticalJump || ''
  );
  const [standingLongJump, setStandingLongJump] = useState(
    userData.testInputs?.power?.standingLongJump || ''
  );
  const [sprint, setSprint] = useState(
    userData.testInputs?.power?.sprint || ''
  );
  const [result, setResult] = useState({
    verticalJumpScore: null,
    standingLongJumpScore: null,
    sprintScore: null,
    finalScore: null,
    verticalJumpRawScore: null,
    standingLongJumpRawScore: null,
    sprintRawScore: null,
    finalRawScore: null,
    isCapped: false,
  });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isStandardsExpanded, setIsStandardsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);

  useEffect(() => {
    const updatedTestInputs = {
      ...userData.testInputs,
      power: { verticalJump, standingLongJump, sprint },
    };
    setUserData(prev => ({ ...prev, testInputs: updatedTestInputs }));
  }, [
    verticalJump,
    standingLongJump,
    sprint,
    setUserData,
    userData.testInputs,
  ]);

  const getAgeRange = age => {
    if (!age) return null;
    const ageNum = parseInt(age);
    if (ageNum >= 12 && ageNum <= 15) return '12-15';
    if (ageNum >= 16 && ageNum <= 20) return '16-20';
    if (ageNum >= 21 && ageNum <= 30) return '21-30';
    if (ageNum >= 31 && ageNum <= 40) return '31-40';
    if (ageNum >= 41 && ageNum <= 50) return '41-50';
    if (ageNum >= 51 && ageNum <= 60) return '51-60';
    if (ageNum >= 61 && ageNum <= 70) return '61-70';
    if (ageNum >= 71 && ageNum <= 80) return '71-80';
    return null;
  };

  const calculateScoreIncreasing = (value, standard) => {
    if (value < standard[0]) return 0;
    
    if (value >= standard[100]) {
      const excess = value - standard[100];
      const bonus = excess * 2;
      return 100 + bonus;
    }
    
    if (value < standard[50])
      return ((value - standard[0]) / (standard[50] - standard[0])) * 50;
    return 50 + ((value - standard[50]) / (standard[100] - standard[50])) * 50;
  };

  const calculateScoreDecreasing = (value, standard) => {
    if (value > standard[0]) return 0;
    
    if (value <= standard[100]) {
      const excess = standard[100] - value;
      const bonus = excess * 20;
      return 100 + bonus;
    }
    
    if (value > standard[50])
      return ((standard[0] - value) / (standard[0] - standard[50])) * 50;
    return 50 + ((standard[50] - value) / (standard[50] - standard[100])) * 50;
  };

  const calculatePowerScore = () => {
    if (!age || !gender) {
      alert(t('tests.powerErrors.missingPrerequisites'));
      return;
    }
    if (!verticalJump && !standingLongJump && !sprint) {
      alert(t('tests.powerErrors.noAnyInput'));
      return;
    }

    const ageRange = getAgeRange(age);
    if (!ageRange) {
      alert(t('tests.powerErrors.invalidAge'));
      return;
    }

    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    const verticalJumpStandards =
      genderValue === 'male'
        ? standards.verticalJumpStandardsMale
        : standards.verticalJumpStandardsFemale;
    const standingLongJumpStandards =
      genderValue === 'male'
        ? standards.standingLongJumpStandardsMale
        : standards.standingLongJumpStandardsFemale;
    const sprintStandards =
      genderValue === 'male'
        ? standards.sprintStandardsMale
        : standards.sprintStandardsFemale;

    const verticalJumpStandard = verticalJumpStandards[ageRange];
    const standingLongJumpStandard = standingLongJumpStandards[ageRange];
    const sprintStandard = sprintStandards[ageRange];

    if (!verticalJumpStandard || !standingLongJumpStandard || !sprintStandard) {
      alert(t('tests.powerErrors.standardsNotFound'));
      return;
    }

    const verticalJumpNum = verticalJump ? parseFloat(verticalJump) : null;
    const standingLongJumpNum = standingLongJump
      ? parseFloat(standingLongJump)
      : null;
    const sprintNum = sprint ? parseFloat(sprint) : null;

    const verticalJumpRawScore =
      verticalJumpNum !== null
        ? calculateScoreIncreasing(verticalJumpNum, verticalJumpStandard)
        : null;
    const standingLongJumpRawScore =
      standingLongJumpNum !== null
        ? calculateScoreIncreasing(
            standingLongJumpNum,
            standingLongJumpStandard
          )
        : null;
    const sprintRawScore =
      sprintNum !== null
        ? calculateScoreDecreasing(sprintNum, sprintStandard)
        : null;

    const rawScores = [
      verticalJumpRawScore,
      standingLongJumpRawScore,
      sprintRawScore,
    ].filter(score => score !== null);
    if (rawScores.length === 0) {
      alert(t('tests.powerErrors.needMeasure'));
      return;
    }

    const finalRawScore = rawScores.reduce((sum, score) => sum + score, 0) / rawScores.length;
    
    const isCapped = !isVerified && finalRawScore > 100;

    setResult({
      verticalJumpScore: verticalJumpRawScore !== null ? verticalJumpRawScore.toFixed(2) : null,
      standingLongJumpScore: standingLongJumpRawScore !== null ? standingLongJumpRawScore.toFixed(2) : null,
      sprintScore: sprintRawScore !== null ? sprintRawScore.toFixed(2) : null,
      finalScore: finalRawScore.toFixed(2),
      verticalJumpRawScore,
      standingLongJumpRawScore,
      sprintRawScore,
      finalRawScore,
      isCapped,
    });
  };

  const handleUnlockClick = () => {
    const level = result.finalRawScore >= 100 ? 'legend' : 'apex';
    setUnlockModalData({
      exercise: t('tests.powerTitle'),
      score: result.finalRawScore,
      level: level,
      weight: null,
    });
    setIsUnlockModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!result.finalScore) {
      alert(t('tests.powerErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      if (submitting) return;
      setSubmitting(true);
      
      const currentRawScore = result.finalRawScore !== null ? result.finalRawScore : parseFloat(result.finalScore);
      const scoreToSave = (!isVerified && currentRawScore > 100) ? 100 : currentRawScore;
      
      const updatedScores = {
        ...userData.scores,
        explosivePower: parseFloat(scoreToSave.toFixed(2)),
      };
      const updatedUserData = {
        ...userData,
        scores: updatedScores,
      };

      setUserData({
        ...updatedUserData,
        ladderScore: userData.ladderScore || 0,
      });

      if (!isGuest) {
        const userId = userData.userId || auth.currentUser?.uid;
        if (userId) {
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, {
            scores: updatedScores,
            testInputs: {
              ...userData.testInputs,
              power: { verticalJump, standingLongJump, sprint },
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        await saveUserData(updatedUserData);
      }

      const testData = {
        verticalJump: verticalJump || null,
        standingLongJump: standingLongJump || null,
        sprint: sprint || null,
        finalScore: scoreToSave.toFixed(2),
      };
      if (onComplete && typeof onComplete === 'function') {
        onComplete(testData);
      }
      navigate('/user-info', { state: { from: '/explosive-power' } });
    } catch (error) {
      console.error('Power.js - 更新 UserContext 或導航失敗:', error);
      if (!isGuest) {
        alert(t('tests.powerErrors.updateUserFail'));
      }
      navigate('/user-info', { state: { from: '/explosive-power' } });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    verticalJump,
    setVerticalJump,
    standingLongJump,
    setStandingLongJump,
    sprint,
    setSprint,
    result,
    isDescriptionExpanded,
    setIsDescriptionExpanded,
    isStandardsExpanded,
    setIsStandardsExpanded,
    submitting,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    unlockModalData,
    setUnlockModalData,
    calculatePowerScore,
    handleSubmit,
    handleUnlockClick,
    age,
    gender,
    t,
  };
}

