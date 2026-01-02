import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import * as standards from '../standards';
import { useTranslation } from 'react-i18next';

export function useMuscleLogic() {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { weight, age, gender } = userData;
  const { t } = useTranslation();

  const [smm, setSmm] = useState(userData.testInputs?.muscle?.smm || '');
  const [result, setResult] = useState({
    smmScore: null,
    smPercent: null,
    smPercentScore: null,
    finalScore: null,
    smmRawScore: null,
    smPercentRawScore: null,
    finalRawScore: null,
    isSmmCapped: false,
    isSmPercentCapped: false,
    isFinalScoreCapped: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    if (smm) {
      const updatedTestInputs = {
        ...userData.testInputs,
        muscle: { ...userData.testInputs?.muscle, smm },
      };
      setUserData(prev => ({ ...prev, testInputs: updatedTestInputs }));
    }
  }, [smm, setUserData, userData.testInputs]);

  const getAgeRange = age => {
    if (!age) return null;
    const ageNum = parseInt(age);
    if (ageNum >= 10 && ageNum <= 12) return '10-12';
    if (ageNum >= 13 && ageNum <= 17) return '13-17';
    if (ageNum >= 18 && ageNum <= 30) return '18-30';
    if (ageNum >= 31 && ageNum <= 40) return '31-40';
    if (ageNum >= 41 && ageNum <= 50) return '41-50';
    if (ageNum >= 51 && ageNum <= 60) return '51-60';
    if (ageNum >= 61 && ageNum <= 70) return '61-70';
    if (ageNum >= 71 && ageNum <= 80) return '71-80';
    return null;
  };

  const calculateScoreFromStandard = (value, standard) => {
    if (!standard) return 0;

    let rawScore = 0;

    if (value >= standard[100]) {
      const valueDiff = standard[100] - standard[90];
      const slope = valueDiff > 0 ? 10 / valueDiff : 0;
      const extraValue = value - standard[100];
      let extendedScore = 100 + extraValue * slope;

      if (extendedScore > 120) {
        extendedScore = 120 + (extendedScore - 120) * 0.5;
      }

      rawScore = parseFloat(extendedScore.toFixed(2));
    } else {
      if (value <= standard[0]) {
        rawScore = 0;
      } else {
        let lower = 0;
        let upper = 100;
        for (let i = 10; i <= 100; i += 10) {
          if (value < standard[i]) {
            upper = i;
            lower = i - 10;
            break;
          }
        }
        
        const lowerValue = standard[lower];
        const upperValue = standard[upper];
        if (upperValue === lowerValue) {
          rawScore = upper;
        } else {
          rawScore =
            lower +
            ((value - lowerValue) / (upperValue - lowerValue)) * (upper - lower);
          rawScore = Math.round(rawScore * 100) / 100;
        }
      }
    }

    return rawScore;
  };

  const applyHonorLock = (score, isVerified) => {
    const roundedScore = parseFloat(Number(score).toFixed(2));
    const isCapped = !isVerified && roundedScore > 100;
    return { displayScore: roundedScore, isCapped: isCapped };
  };

  const calculateMuscleScore = () => {
    if (!weight || !smm || !age || !gender) {
      alert(t('tests.muscleErrors.missingPrerequisites'));
      return;
    }
    const weightNum = parseFloat(weight);
    const smmNum = parseFloat(smm);
    const ageRange = getAgeRange(age);
    if (!weightNum || !smmNum || !ageRange) {
      alert(t('tests.muscleErrors.invalidInputs'));
      return;
    }
    const smPercent = ((smmNum / weightNum) * 100).toFixed(2);
    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    const smmStandards =
      genderValue === 'male'
        ? standards.muscleStandardsMaleSMM
        : standards.muscleStandardsFemaleSMM;
    const smPercentStandards =
      genderValue === 'male'
        ? standards.muscleStandardsMaleSMPercent
        : standards.muscleStandardsFemaleSMPercent;
    const smmStandard = smmStandards[ageRange];
    const smPercentStandard = smPercentStandards[ageRange];
    if (!smmStandard || !smPercentStandard) {
      alert(t('tests.muscleErrors.standardsNotFound'));
      return;
    }
    
    const smmRawScore = calculateScoreFromStandard(smmNum, smmStandard, 'SMM');
    const smPercentScore = calculateScoreFromStandard(
      parseFloat(smPercent),
      smPercentStandard,
      'SM%'
    );
    
    const smmScoreRaw = parseFloat((smmRawScore * 1.25).toFixed(2));
    
    const isVerified = userData.isVerified === true;
    const smmLocked = applyHonorLock(smmScoreRaw, isVerified);
    const smPercentLocked = applyHonorLock(smPercentScore, isVerified);
    
    const finalScoreRaw = (smmScoreRaw + smPercentScore) / 2;
    const finalScoreLocked = applyHonorLock(finalScoreRaw, isVerified);
    
    setResult({
      smmScore: parseFloat(smmLocked.displayScore.toFixed(2)),
      smPercent,
      smPercentScore: smPercentLocked.displayScore,
      finalScore: finalScoreLocked.displayScore.toFixed(2),
      smmRawScore: smmScoreRaw,
      smPercentRawScore: smPercentScore,
      finalRawScore: finalScoreRaw,
      isSmmCapped: smmLocked.isCapped,
      isSmPercentCapped: smPercentLocked.isCapped,
      isFinalScoreCapped: finalScoreLocked.isCapped,
    });
  };

  const handleSubmit = async () => {
    if (!result.finalScore) {
      alert(t('tests.muscleErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      if (submitting) return;
      setSubmitting(true);
      
      const currentFinalRawScore = result.finalRawScore !== null ? result.finalRawScore : parseFloat(result.finalScore);
      const isVerified = userData.isVerified === true;
      const scoreToSave = (!isVerified && currentFinalRawScore > 100) ? 100 : currentFinalRawScore;
      
      const updatedScores = {
        ...userData.scores,
        muscleMass: parseFloat(scoreToSave.toFixed(2)),
      };
      const updatedUserData = {
        ...userData,
        scores: updatedScores,
      };

      const updatedTestInputs = {
        ...userData.testInputs,
        muscle: {
          ...userData.testInputs?.muscle,
          smm: parseFloat(smm),
          weight: parseFloat(weight),
        },
      };

      setUserData({
        ...updatedUserData,
        testInputs: updatedTestInputs,
        ladderScore: userData.ladderScore || 0,
      });

      const testData = {
        smm: parseFloat(smm),
        smPercent: parseFloat(result.smPercent),
        finalScore: parseFloat(result.finalScore),
      };
      if (onComplete && typeof onComplete === 'function') {
        onComplete(testData);
      }
      navigate('/user-info', { state: { from: '/muscle-mass' } });
    } catch (error) {
      console.error('提交失敗:', error);
      if (!isGuest) {
        alert(t('tests.muscleErrors.updateUserFail'));
      }
      navigate('/user-info', { state: { from: '/muscle-mass' } });
    } finally {
      setSubmitting(false);
    }
  };

  const barData1 = [
    { name: t('tests.muscleLabels.smmShort'), value: result.smmScore || 0 },
    {
      name: t('tests.muscleLabels.smPercentShort'),
      value: result.smPercentScore || 0,
    },
  ];

  const barData2 = [
    { name: t('tests.muscleLabels.finalScore'), value: result.finalScore || 0 },
  ];

  return {
    smm,
    setSmm,
    result,
    submitting,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    calculateMuscleScore,
    handleSubmit,
    weight,
    age,
    gender,
    t,
  };
}

