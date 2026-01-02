import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

export function useFFMILogic() {
  const { userData, setUserData, saveUserData } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isVerified = userData.isVerified === true;
  const [bodyFat, setBodyFat] = useState(
    userData.testInputs?.ffmi?.bodyFat || ''
  );
  const [ffmi, setFfmi] = useState(null);
  const [ffmiScore, setFfmiScore] = useState(null);
  const [ffmiRawScore, setFfmiRawScore] = useState(null);
  const [isCapped, setIsCapped] = useState(false);
  const [ffmiCategory, setFfmiCategory] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);

  useEffect(() => {
    if (bodyFat) {
      const updatedTestInputs = {
        ...userData.testInputs,
        ffmi: { ...userData.testInputs?.ffmi, bodyFat },
      };
      setUserData(prev => ({ ...prev, testInputs: updatedTestInputs }));
    }
  }, [bodyFat, setUserData, userData.testInputs]);

  const calculateScores = () => {
    if (
      !userData.gender ||
      !userData.height ||
      !userData.weight ||
      !userData.age
    ) {
      alert(t('tests.ffmiErrors.missingPrerequisites'));
      return;
    }
    if (!bodyFat) {
      alert(t('tests.ffmiErrors.missingBodyFat'));
      return;
    }

    const isMale = userData.gender === 'male' || userData.gender === '男性';
    const heightInMeters = parseFloat(userData.height) / 100;
    const weight = parseFloat(userData.weight);
    const bodyFatValue = parseFloat(bodyFat) / 100;

    const fatFreeMass = weight * (1 - bodyFatValue);
    const rawFfmi = fatFreeMass / (heightInMeters * heightInMeters);
    const adjustedFfmi =
      heightInMeters > 1.8 ? rawFfmi + 6.0 * (heightInMeters - 1.8) : rawFfmi;
    setFfmi(adjustedFfmi.toFixed(2));

    let newFfmiScore;
    if (isMale) {
      const baseFfmi = 18.5;
      const maxFfmi = 25;
      if (adjustedFfmi <= 0) newFfmiScore = 0;
      else if (adjustedFfmi <= baseFfmi)
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      else if (adjustedFfmi < maxFfmi)
        newFfmiScore =
          60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      else {
        newFfmiScore = 100 + (adjustedFfmi - maxFfmi) * 5;
      }
    } else {
      const baseFfmi = 15.5;
      const maxFfmi = 21;
      if (adjustedFfmi <= 0) newFfmiScore = 0;
      else if (adjustedFfmi <= baseFfmi)
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      else if (adjustedFfmi < maxFfmi)
        newFfmiScore =
          60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      else {
        newFfmiScore = 100 + (adjustedFfmi - maxFfmi) * 5;
      }
    }

    setFfmiRawScore(newFfmiScore);

    const capped = !isVerified && newFfmiScore > 100;
    setIsCapped(capped);
    setFfmiScore(newFfmiScore.toFixed(2));

    if (isMale) {
      if (adjustedFfmi < 18)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r16_17'));
      else if (adjustedFfmi < 20)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r18_19'));
      else if (adjustedFfmi < 22)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r20_21'));
      else if (adjustedFfmi < 23)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r22'));
      else if (adjustedFfmi < 26)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r23_25'));
      else if (adjustedFfmi < 28)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r26_27'));
      else setFfmiCategory(t('tests.ffmiInfo.maleTable.r28_30'));
    } else {
      if (adjustedFfmi < 15)
        setFfmiCategory(t('tests.ffmiInfo.femaleTable.r13_14'));
      else if (adjustedFfmi < 17)
        setFfmiCategory(t('tests.ffmiInfo.femaleTable.r15_16'));
      else if (adjustedFfmi < 19)
        setFfmiCategory(t('tests.ffmiInfo.femaleTable.r17_18'));
      else if (adjustedFfmi < 22)
        setFfmiCategory(t('tests.ffmiInfo.femaleTable.r19_21'));
      else setFfmiCategory(t('tests.ffmiInfo.femaleTable.r22plus'));
    }
  };

  const handleUnlockClick = () => {
    const level = ffmiRawScore >= 100 ? 'legend' : 'apex';
    setUnlockModalData({
      exercise: t('tests.ffmiTitle'),
      score: ffmiRawScore,
      level: level,
      weight: null,
    });
    setIsUnlockModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!ffmi || !ffmiScore) {
      alert(t('tests.ffmiErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      if (submitting) return;
      setSubmitting(true);

      const currentRawScore =
        ffmiRawScore !== null ? ffmiRawScore : parseFloat(ffmiScore);
      const scoreToSave =
        !isVerified && currentRawScore > 100 ? 100 : currentRawScore;

      const updatedScores = {
        ...userData.scores,
        bodyFat: parseFloat(scoreToSave.toFixed(2)),
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
          await setDoc(
            userRef,
            {
              scores: updatedScores,
              testInputs: {
                ...userData.testInputs,
                ffmi: { bodyFat },
              },
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
        await saveUserData(updatedUserData);
      }

      const testData = {
        bodyFat: parseFloat(bodyFat),
        ffmi: parseFloat(ffmi),
        ffmiScore: parseFloat(ffmiScore),
      };
      if (onComplete && typeof onComplete === 'function') {
        onComplete(testData);
      }
      navigate('/user-info', { state: { from: '/body-fat' } });
    } catch (error) {
      console.error('提交失敗:', error);
      if (!isGuest) {
        alert(t('tests.ffmiErrors.updateUserFail'));
      }
      navigate('/user-info', { state: { from: '/body-fat' } });
    } finally {
      setSubmitting(false);
    }
  };

  const maleFfmiTable = [
    { range: '16 - 17', description: t('tests.ffmiInfo.maleTable.r16_17') },
    { range: '18 - 19', description: t('tests.ffmiInfo.maleTable.r18_19') },
    { range: '20 - 21', description: t('tests.ffmiInfo.maleTable.r20_21') },
    { range: '22', description: t('tests.ffmiInfo.maleTable.r22') },
    { range: '23 - 25', description: t('tests.ffmiInfo.maleTable.r23_25') },
    { range: '26 - 27', description: t('tests.ffmiInfo.maleTable.r26_27') },
    { range: '28 - 30', description: t('tests.ffmiInfo.maleTable.r28_30') },
  ];

  const femaleFfmiTable = [
    { range: '13 - 14', description: t('tests.ffmiInfo.femaleTable.r13_14') },
    { range: '15 - 16', description: t('tests.ffmiInfo.femaleTable.r15_16') },
    { range: '17 - 18', description: t('tests.ffmiInfo.femaleTable.r17_18') },
    { range: '19 - 21', description: t('tests.ffmiInfo.femaleTable.r19_21') },
    { range: '> 22', description: t('tests.ffmiInfo.femaleTable.r22plus') },
  ];

  const ffmiTable =
    userData.gender === 'male' || userData.gender === '男性'
      ? maleFfmiTable
      : femaleFfmiTable;

  return {
    bodyFat,
    setBodyFat,
    ffmi,
    ffmiScore,
    ffmiRawScore,
    isCapped,
    ffmiCategory,
    isExpanded,
    setIsExpanded,
    isTableExpanded,
    setIsTableExpanded,
    submitting,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    unlockModalData,
    setUnlockModalData,
    calculateScores,
    handleSubmit,
    handleUnlockClick,
    ffmiTable,
    userData,
    t,
  };
}

