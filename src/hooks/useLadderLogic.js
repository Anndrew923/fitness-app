import { useState, useCallback, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import logger from '../utils/logger';
import {
  applyLimitBreak,
  calculateStatsAggregates,
  generateFilterTags,
} from '../utils/ladderUtils';

export const useLadderLogic = (
  userData,
  setUserData,
  auth,
  db,
  t,
  navigate,
  onShowModal,
  submittedLadderScore
) => {
  const [userRank, setUserRank] = useState(null);
  const [ladderSubmissionState, setLadderSubmissionState] = useState({
    lastSubmissionTime: null,
    dailySubmissionCount: 0,
    lastSubmissionDate: null,
  });
  const [submitConfirmModal, setSubmitConfirmModal] = useState({
    isOpen: false,
    remainingCount: 3,
  });

  // 1. Load Submission State
  useEffect(() => {
    const loadSubmissionState = () => {
      if (!auth.currentUser) return;
      try {
        const userId = auth.currentUser.uid;
        const storageKey = `ladderSubmissionState_${userId}`;
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          setLadderSubmissionState(JSON.parse(savedState));
        }
      } catch (error) {
        logger.error('Load submission state failed:', error);
      }
    };
    loadSubmissionState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser?.uid]); // Reduced deps

  // 2. Save Submission State
  useEffect(() => {
    if (!auth.currentUser || !ladderSubmissionState.lastSubmissionDate) return;
    try {
      const userId = auth.currentUser.uid;
      const storageKey = `ladderSubmissionState_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(ladderSubmissionState));
    } catch (error) {
      logger.error('Save submission state failed:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ladderSubmissionState, auth.currentUser?.uid]);

  // 3. Limits Check
  const checkLadderSubmissionLimit = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();

    if (ladderSubmissionState.lastSubmissionDate !== today) {
      setLadderSubmissionState(prev => ({
        ...prev,
        dailySubmissionCount: 0,
        lastSubmissionDate: today,
      }));
      return { canSubmit: true, reason: null };
    }

    if (ladderSubmissionState.dailySubmissionCount >= 3) {
      return {
        canSubmit: false,
        reason: t('userInfo.limits.limitReachedMessage'),
      };
    }

    if (ladderSubmissionState.lastSubmissionTime) {
      const timeDiff = now - new Date(ladderSubmissionState.lastSubmissionTime);
      const cooldownHours = 2;
      const cooldownMs = cooldownHours * 60 * 60 * 1000;

      if (timeDiff < cooldownMs) {
        const remainingMinutes = Math.ceil(
          (cooldownMs - timeDiff) / (60 * 1000)
        );
        return {
          canSubmit: false,
          reason: t('userInfo.limits.cooldownMessage', {
            minutes: remainingMinutes,
          }),
        };
      }
    }
    return { canSubmit: true, reason: null };
  }, [ladderSubmissionState, t]);

  const showSubmitConfirmModal = useCallback(() => {
    const limitCheck = checkLadderSubmissionLimit();
    if (!limitCheck.canSubmit) {
      onShowModal({
        isOpen: true,
        title: t('userInfo.limits.limitReached'),
        message: limitCheck.reason,
        type: 'warning',
        onAction: () => {
          onShowModal(prev => ({ ...prev, isOpen: false }));
          navigate('/ladder');
        },
        actionText: t('userInfo.modal.viewLadder'),
      });
      return;
    }
    const remainingCount =
      3 - (ladderSubmissionState.dailySubmissionCount || 0);
    setSubmitConfirmModal({
      isOpen: true,
      remainingCount: Math.max(0, remainingCount),
    });
  }, [
    ladderSubmissionState,
    checkLadderSubmissionLimit,
    t,
    navigate,
    onShowModal,
  ]);

  // 4. Confirm Submit (The Core Logic)
  const confirmSubmitToLadder = useCallback(async () => {
    setSubmitConfirmModal({ isOpen: false, remainingCount: 0 });

    try {
      const scores = userData.scores || {};

      // 1. Get Core 5 Stats ONLY
      const strength = Number(scores.strength) || 0;
      const explosive = Number(scores.explosive) || Number(scores.power) || 0;
      const muscleMass = Number(scores.muscleMass) || 0;
      const bodyFat = Number(scores.bodyFat) || 0;
      const baseCardio = Number(scores.cardio) || 0; // Cooper Test

      // 2. Calculate Average of 5 (Strictly / 5)
      // Do NOT include run_5km in this average.
      const rawCalculatedScore =
        (strength + explosive + muscleMass + bodyFat + baseCardio) / 5;

      // 3. Apply Limit Break Cap
      const isVerified = userData.isVerified === true;
      const finalScore = applyLimitBreak(rawCalculatedScore, isVerified);

      // 4. Prepare 5KM Stat (Standalone)
      const run5kmScore = Number(scores.run_5km) || 0;
      const run5kmInputs = userData.testInputs?.run_5km || {};
      const run5kmTime =
        Number(run5kmInputs.minutes) * 60 + Number(run5kmInputs.seconds) || 0;

      // 🛑 LOOP BREAKER: Only update if score actually changed
      if (userData.ladderScore === finalScore) {
        logger.debug(
          'Ladder score unchanged, skipping update to prevent loop.'
        );
        // Even if score is same, we might want to proceed to save to DB if user explicitly clicked submit
        // But for safety, let's allow flow to proceed to DB save, just be careful with setUserData
      } else {
        const updatedUserData = {
          ...userData,
          ladderScore: finalScore,
          lastLadderSubmission: new Date().toISOString(),
        };
        setUserData(updatedUserData);
      }

      // ... (Rest of DB save logic - Stats Aggregation) ...
      const testInputs = userData.testInputs || {};
      const strengthInputs = testInputs.strength || {};
      const powerInputs = testInputs.power || {};
      const cardioInputs = testInputs.cardio || {};
      const ffmiInputs = testInputs.ffmi || {};

      const exerciseScores = {
        benchPress: strengthInputs.benchPress?.max || 0,
        squat: strengthInputs.squat?.max || 0,
        deadlift: strengthInputs.deadlift?.max || 0,
        pullUp: strengthInputs.latPulldown?.max || 0,
        overheadPress: strengthInputs.shoulderPress?.max || 0,
        sprint: powerInputs.sprint || 0,
        verticalJump: powerInputs.verticalJump || 0,
        broadJump: powerInputs.standingLongJump || 0,
      };

      const stats = calculateStatsAggregates(exerciseScores);
      const filters = generateFilterTags(userData);

      const bodyFatVal = Number(ffmiInputs.bodyFat) || 0;

      // Arm Size Fallback Chain
      const armSizeInputs = testInputs.armSize || {};
      const stats_armSize =
        Number(armSizeInputs.arm) || Number(userData.armSize) || 0;

      // 5. Save to Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const updateData = {
        ladderScore: finalScore, // Pure 5-axis average score
        rawScore: rawCalculatedScore,
        // Save 5KM separately for the Elite Leaderboard sorting
        stats_5k_score: run5kmScore,
        stats_5k_time: run5kmTime,
        stats_sbdTotal: stats.sbdTotal,
        stats_bigFiveTotal: stats.bigFiveTotal,
        stats_bodyFat: bodyFatVal,
        stats_cooper: Number(cardioInputs.distance) || 0,
        stats_armSize: stats_armSize,
        filter_ageGroup: filters.filter_ageGroup,
        lastLadderSubmission: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isVerified) {
        updateData.isVerified = false;
        updateData.verifiedLadderScore = null;
      }

      await setDoc(userRef, updateData, { merge: true });

      // Update State & Show Modal
      const now = new Date();
      setLadderSubmissionState(prev => ({
        lastSubmissionTime: now,
        dailySubmissionCount: prev.dailySubmissionCount + 1,
        lastSubmissionDate: now.toDateString(),
      }));

      onShowModal({
        isOpen: true,
        title: t('userInfo.modal.submitSuccessTitle'),
        message: t('userInfo.modal.submitSuccessMessage', {
          score: finalScore,
        }),
        type: 'success',
        onAction: () => {
          onShowModal(prev => ({ ...prev, isOpen: false }));
          navigate('/ladder', { state: { forceReload: true } });
        },
        actionText: t('userInfo.modal.viewLadder'),
      });
    } catch (error) {
      logger.error('Submit to ladder failed:', error);
      onShowModal({
        isOpen: true,
        title: t('userInfo.modal.submitFailTitle'),
        message: t('userInfo.modal.submitFailMessage'),
        type: 'error',
      });
    }
  }, [userData, setUserData, auth, db, t, navigate, onShowModal]);

  // 5. Submit Handler
  const handleSubmitToLadder = useCallback(async () => {
    if (!auth.currentUser) {
      return;
    }
    const { canSubmit, reason } = checkLadderSubmissionLimit();
    if (!canSubmit) {
      onShowModal({
        isOpen: true,
        title: t('userInfo.limits.limitReached'),
        message: reason,
        type: 'warning',
      });
      return;
    }
    showSubmitConfirmModal();
  }, [
    auth,
    checkLadderSubmissionLimit,
    showSubmitConfirmModal,
    t,
    onShowModal,
  ]);

  // Rank Fetching Logic
  const fetchUserRank = useCallback(async () => {
    if (
      !userData?.userId ||
      !submittedLadderScore ||
      submittedLadderScore <= 0
    ) {
      setUserRank(null);
      return;
    }
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('ladderScore', 'desc'), limit(200));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach(doc => {
        const docData = doc.data();
        if (docData.ladderScore > 0) {
          users.push({ id: doc.id, ...docData });
        }
      });
      const userIndex = users.findIndex(user => user.id === userData.userId);
      if (userIndex !== -1) {
        setUserRank(userIndex + 1);
      } else {
        setUserRank(null);
      }
    } catch (error) {
      logger.error('Fetch user rank failed:', error);
      setUserRank(null);
    }
  }, [userData?.userId, submittedLadderScore, db]);

  // Debounced Fetching
  const fetchUserRankRef = useRef(null);
  const lastFetchParamsRef = useRef({ userId: null, score: null });
  useEffect(() => {
    if (fetchUserRankRef.current) {
      if (window.cancelIdleCallback)
        cancelIdleCallback(fetchUserRankRef.current);
      else clearTimeout(fetchUserRankRef.current);
    }
    const userId = userData?.userId;
    const score = submittedLadderScore;
    if (
      lastFetchParamsRef.current.userId === userId &&
      lastFetchParamsRef.current.score === score
    ) {
      return;
    }
    lastFetchParamsRef.current = { userId, score };

    if (userId && score > 0) {
      if (window.requestIdleCallback) {
        fetchUserRankRef.current = requestIdleCallback(() => fetchUserRank(), {
          timeout: 2000,
        });
      } else {
        fetchUserRankRef.current = setTimeout(() => fetchUserRank(), 800);
      }
    }
    return () => {
      if (fetchUserRankRef.current) {
        if (window.cancelIdleCallback)
          cancelIdleCallback(fetchUserRankRef.current);
        else clearTimeout(fetchUserRankRef.current);
      }
    };
  }, [userData?.userId, submittedLadderScore, fetchUserRank]);

  return {
    userRank,
    ladderSubmissionState,
    submitConfirmModal,
    handleSubmitToLadder,
    confirmSubmitToLadder,
    cancelSubmit: () =>
      setSubmitConfirmModal({ isOpen: false, remainingCount: 0 }),
  };
};
