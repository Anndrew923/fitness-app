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

// 🔴 常量定义
const DAILY_SUBMISSION_LIMIT = 3;
// 🔴 移除：冷却时间常量（不再使用）
// const COOLDOWN_HOURS = 2;
// const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// 🔴 数据验证函数
const validateSubmissionState = (state) => {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const now = new Date();
  const today = now.toDateString();

  // 验证并修复日期
  if (!state.lastSubmissionDate || state.lastSubmissionDate !== today) {
    // 日期不同或无效，重置计数
    return {
      lastSubmissionTime: null,
      dailySubmissionCount: 0,
      lastSubmissionDate: today,
    };
  }

  // 验证计数
  const count = Number(state.dailySubmissionCount) || 0;
  if (count < 0 || count > DAILY_SUBMISSION_LIMIT) {
    logger.warn('Invalid submission count detected, resetting:', count);
    return {
      lastSubmissionTime: state.lastSubmissionTime || null,
      dailySubmissionCount: 0,
      lastSubmissionDate: today,
    };
  }

  // 验证时间戳
  let lastTime = null;
  if (state.lastSubmissionTime) {
    try {
      lastTime = new Date(state.lastSubmissionTime);
      if (isNaN(lastTime.getTime())) {
        logger.warn('Invalid lastSubmissionTime, resetting');
        lastTime = null;
      }
    } catch (error) {
      logger.warn('Error parsing lastSubmissionTime:', error);
      lastTime = null;
    }
  }

  return {
    lastSubmissionTime: lastTime,
    dailySubmissionCount: count,
    lastSubmissionDate: today,
  };
};

// 🔴 同步保存函数
const saveSubmissionStateSync = (userId, state) => {
  if (!userId || !state) return false;
  try {
    const storageKey = `ladderSubmissionState_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(state));
    logger.debug('Submission state saved:', state);
    return true;
  } catch (error) {
    logger.error('Failed to save submission state:', error);
    return false;
  }
};

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
  // 🔴 新增：防重复提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // 🔴 使用 ref 存储最新状态，避免闭包问题
  const stateRef = useRef(ladderSubmissionState);
  useEffect(() => {
    stateRef.current = ladderSubmissionState;
  }, [ladderSubmissionState]);

  // 🔴 修复：1. Load Submission State with Validation
  useEffect(() => {
    const loadSubmissionState = () => {
      if (!auth.currentUser) {
        logger.debug('No user, skipping state load');
        return;
      }
      try {
        const userId = auth.currentUser.uid;
        const storageKey = `ladderSubmissionState_${userId}`;
        const savedState = localStorage.getItem(storageKey);
        
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            const validated = validateSubmissionState(parsed);
            
            if (validated) {
              logger.debug('Loaded and validated submission state:', validated);
              setLadderSubmissionState(validated);
              // 🔴 关键修复：立即更新 stateRef，确保后续检查使用最新状态
              stateRef.current = validated;
              // 🔴 立即保存验证后的状态（修复损坏数据）
              saveSubmissionStateSync(userId, validated);
            } else {
              logger.warn('State validation failed, using default');
              const now = new Date();
              const defaultState = {
                lastSubmissionTime: null,
                dailySubmissionCount: 0,
                lastSubmissionDate: now.toDateString(),
              };
              setLadderSubmissionState(defaultState);
              // 🔴 关键修复：立即更新 stateRef
              stateRef.current = defaultState;
              saveSubmissionStateSync(userId, defaultState);
            }
          } catch (parseError) {
            logger.error('Failed to parse saved state:', parseError);
            // 清除损坏的数据
            localStorage.removeItem(storageKey);
            const now = new Date();
            const defaultState = {
              lastSubmissionTime: null,
              dailySubmissionCount: 0,
              lastSubmissionDate: now.toDateString(),
            };
            setLadderSubmissionState(defaultState);
            // 🔴 关键修复：立即更新 stateRef
            stateRef.current = defaultState;
          }
        } else {
          // 首次使用，初始化状态
          const now = new Date();
          const defaultState = {
            lastSubmissionTime: null,
            dailySubmissionCount: 0,
            lastSubmissionDate: now.toDateString(),
          };
          setLadderSubmissionState(defaultState);
          // 🔴 关键修复：立即更新 stateRef
          stateRef.current = defaultState;
          saveSubmissionStateSync(userId, defaultState);
        }
      } catch (error) {
        logger.error('Load submission state failed:', error);
        // 错误恢复：使用默认状态
        const now = new Date();
        const defaultState = {
          lastSubmissionTime: null,
          dailySubmissionCount: 0,
          lastSubmissionDate: now.toDateString(),
        };
        setLadderSubmissionState(defaultState);
        // 🔴 关键修复：立即更新 stateRef
        stateRef.current = defaultState;
      }
    };
    loadSubmissionState();
  }, [auth.currentUser?.uid]); // 🔴 关键：只在 userId 变化时加载，不要重复加载

  // 🔴 修复：2. Save Submission State (Always save, not conditional)
  useEffect(() => {
    if (!auth.currentUser) return;
    
    // 🔴 关键修复：使用 ladderSubmissionState（最新状态），而不是 stateRef.current
    try {
      const userId = auth.currentUser.uid;
      const currentState = ladderSubmissionState;
      
      // 🔴 在保存前再次验证日期
      const now = new Date();
      const today = now.toDateString();
      
      // 🔴 如果日期不同，重置计数（但不要覆盖正在进行的提交）
      if (currentState.lastSubmissionDate && currentState.lastSubmissionDate !== today) {
        const resetState = {
          lastSubmissionTime: null,
          dailySubmissionCount: 0,
          lastSubmissionDate: today,
        };
        setLadderSubmissionState(resetState);
        stateRef.current = resetState;
        saveSubmissionStateSync(userId, resetState);
      } else if (currentState.lastSubmissionDate === today) {
        // 🔴 日期相同，保存当前状态（确保计数正确）
        saveSubmissionStateSync(userId, currentState);
      }
    } catch (error) {
      logger.error('Save submission state failed:', error);
    }
  }, [ladderSubmissionState, auth.currentUser?.uid]);

  // 🔴 修复：3. Limits Check (Synchronous date check)
  const checkLadderSubmissionLimit = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();
    
    // 🔴 关键修复：在检查前，先从 localStorage 同步最新状态
    let currentState = stateRef.current;
    if (auth.currentUser) {
      try {
        const userId = auth.currentUser.uid;
        const storageKey = `ladderSubmissionState_${userId}`;
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          const validated = validateSubmissionState(parsed);
          if (validated && validated.lastSubmissionDate === today) {
            // 🔴 如果日期相同，使用保存的状态（确保计数正确）
            currentState = validated;
            // 🔴 立即更新 stateRef，确保后续使用最新状态
            stateRef.current = validated;
            logger.debug('Synced state from localStorage in checkLadderSubmissionLimit:', validated);
          }
        }
      } catch (error) {
        logger.warn('Failed to sync state in checkLadderSubmissionLimit:', error);
      }
    }
    
    logger.debug('Checking submission limit:', {
      currentState,
      today,
      count: currentState.dailySubmissionCount,
    });

    // 🔴 同步检查日期，如果不同则立即重置（不依赖异步更新）
    if (currentState.lastSubmissionDate !== today) {
      const resetState = {
        lastSubmissionTime: null,
        dailySubmissionCount: 0,
        lastSubmissionDate: today,
      };
      
      // 🔴 同步更新状态和保存
      setLadderSubmissionState(resetState);
      // 🔴 关键修复：立即更新 stateRef，确保后续检查使用最新状态
      stateRef.current = resetState;
      if (auth.currentUser) {
        saveSubmissionStateSync(auth.currentUser.uid, resetState);
      }
      
      logger.debug('Date changed, reset count to 0');
      return { canSubmit: true, reason: null, currentCount: 0 };
    }

    // 检查每日限制
    const currentCount = Number(currentState.dailySubmissionCount) || 0;
    if (currentCount >= DAILY_SUBMISSION_LIMIT) {
      logger.debug('Daily limit reached:', currentCount);
      return {
        canSubmit: false,
        reason: t('userInfo.limits.limitReachedMessage'),
        currentCount,
      };
    }

    // 🔴 移除：冷却时间检查（不再需要）
    // 用户可以在同一天内随时提交，只要不超过3次

    logger.debug('Submission allowed, current count:', currentCount);
    return { canSubmit: true, reason: null, currentCount };
  }, [t, auth.currentUser]);

  const showSubmitConfirmModal = useCallback(() => {
    // 🔴 关键修复：在检查前，先从 localStorage 同步最新状态
    if (auth.currentUser) {
      try {
        const userId = auth.currentUser.uid;
        const storageKey = `ladderSubmissionState_${userId}`;
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          const validated = validateSubmissionState(parsed);
          if (validated && validated.lastSubmissionDate === new Date().toDateString()) {
            // 🔴 如果日期相同，使用保存的状态（确保计数正确）
            stateRef.current = validated;
            setLadderSubmissionState(validated);
            logger.debug('Synced state from localStorage before check:', validated);
          }
        }
      } catch (error) {
        logger.warn('Failed to sync state before check:', error);
      }
    }
    
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
    
    const remainingCount = DAILY_SUBMISSION_LIMIT - (limitCheck.currentCount || 0);
    logger.debug('Showing confirm modal, remaining:', remainingCount, 'currentCount:', limitCheck.currentCount);
    
    setSubmitConfirmModal({
      isOpen: true,
      remainingCount: Math.max(0, remainingCount),
    });
  }, [checkLadderSubmissionLimit, t, navigate, onShowModal, auth.currentUser]);

  // 🔴 修复：4. Confirm Submit (Check date before incrementing)
  const confirmSubmitToLadder = useCallback(async () => {
    // 🔴 关键修复：防止重复提交
    if (isSubmitting || submittingRef.current) {
      logger.warn('Submission already in progress, ignoring duplicate call');
      return;
    }
    
    setIsSubmitting(true);
    submittingRef.current = true;
    setSubmitConfirmModal({ isOpen: false, remainingCount: 0 });

    try {
      // 🔴 关键修复：在提交前再次检查限制（防止并发提交）
      const limitCheck = checkLadderSubmissionLimit();
      if (!limitCheck.canSubmit) {
        logger.warn('Submission blocked by limit check:', limitCheck.reason);
        setIsSubmitting(false);
        submittingRef.current = false;
        onShowModal({
          isOpen: true,
          title: t('userInfo.limits.limitReached'),
          message: limitCheck.reason,
          type: 'warning',
        });
        return;
      }

      const scores = userData.scores || {};

      // 1. Get Core 5 Stats ONLY
      const strength = Number(scores.strength) || 0;
      // 🔴 修复：优先读取 explosivePower（实际存储的字段名）
      const explosive = Number(scores.explosivePower) || Number(scores.explosive) || Number(scores.power) || 0;
      const muscleMass = Number(scores.muscleMass) || 0;
      const bodyFat = Number(scores.bodyFat) || 0;
      const baseCardio = Number(scores.cardio) || 0; // Cooper Test

      // 🔴 添加调试日志
      logger.debug('Score calculation:', {
        scores: userData.scores,
        strength,
        explosivePower: explosive,
        muscleMass,
        bodyFat,
        cardio: baseCardio,
      });

      // 2. Calculate Average of 5 (Strictly / 5)
      const rawCalculatedScore =
        (strength + explosive + muscleMass + bodyFat + baseCardio) / 5;

      logger.debug('Calculated scores:', {
        rawCalculatedScore,
        sum: strength + explosive + muscleMass + bodyFat + baseCardio,
      });

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

      // 🔴 关键修复：原子操作 - 直接从 localStorage 读取最新状态，递增，保存
      const now = new Date();
      const today = now.toDateString();
      
      // 🔴 关键修复：直接从 localStorage 读取最新状态（不依赖 React 状态）
      let currentState = stateRef.current;
      if (auth.currentUser) {
        try {
          const userId = auth.currentUser.uid;
          const storageKey = `ladderSubmissionState_${userId}`;
          const savedState = localStorage.getItem(storageKey);
          if (savedState) {
            const parsed = JSON.parse(savedState);
            const validated = validateSubmissionState(parsed);
            if (validated && validated.lastSubmissionDate === today) {
              // 🔴 使用 localStorage 中的最新状态
              currentState = validated;
              logger.debug('Loaded latest state from localStorage for increment:', currentState);
            }
          }
        } catch (error) {
          logger.warn('Failed to load state from localStorage, using ref:', error);
        }
      }

      // 🔴 关键修复：基于最新状态计算新计数
      let newCount;
      if (currentState.lastSubmissionDate !== today) {
        newCount = 1;
        logger.debug('Date changed during submission, starting count at 1');
      } else {
        newCount = (Number(currentState.dailySubmissionCount) || 0) + 1;
        logger.debug('Incrementing count from localStorage:', currentState.dailySubmissionCount, '->', newCount);
      }

      const newState = {
        lastSubmissionTime: now,
        dailySubmissionCount: newCount,
        lastSubmissionDate: today,
      };

      // 🔴 关键修复：立即更新 stateRef 和 localStorage（原子操作）
      stateRef.current = newState;
      if (auth.currentUser) {
        saveSubmissionStateSync(auth.currentUser.uid, newState);
      }
      
      // 🔴 然后更新 React 状态
      setLadderSubmissionState(newState);

      // 🔴 修复：更新模态框的剩余次数
      const newRemainingCount = DAILY_SUBMISSION_LIMIT - newCount;
      setSubmitConfirmModal(prev => ({
        ...prev,
        remainingCount: Math.max(0, newRemainingCount),
      }));
      logger.debug('Updated remaining count:', newRemainingCount);
      logger.debug('Submission state updated:', newState);

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
    } finally {
      // 🔴 关键修复：确保在 finally 中重置提交状态
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }, [userData, setUserData, auth, db, t, navigate, onShowModal, checkLadderSubmissionLimit, isSubmitting]);

  // 5. Submit Handler
  const handleSubmitToLadder = useCallback(async () => {
    // ✅ 检查访客模式
    const isGuest = sessionStorage.getItem('guestMode') === 'true' && !auth.currentUser;
    
    if (isGuest) {
      // 访客模式：显示注册提醒
      onShowModal({
        isOpen: true,
        title: t('guestMode.modal.title'),
        message: t('guestMode.modal.message'),
        type: 'warning',
        onAction: () => {
          navigate('/login');
        },
        actionText: t('guestMode.modal.registerButton'),
      });
      return;
    }
    
    // 非访客模式但未登录：直接返回（保持原有逻辑）
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
    navigate, // ✅ 添加 navigate 到依赖数组
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
