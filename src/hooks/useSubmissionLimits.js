import { useState, useCallback, useEffect, useRef } from 'react';
import logger from '../utils/logger';

// 常量定义
const DAILY_SUBMISSION_LIMIT = 3;

// 数据验证函数
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

// 同步保存函数
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

export const useSubmissionLimits = (auth, t, navigate, onShowModal) => {
  const [ladderSubmissionState, setLadderSubmissionState] = useState({
    lastSubmissionTime: null,
    dailySubmissionCount: 0,
    lastSubmissionDate: null,
  });
  const [submitConfirmModal, setSubmitConfirmModal] = useState({
    isOpen: false,
    remainingCount: 3,
  });

  // 使用 ref 存储最新状态，避免闭包问题
  const stateRef = useRef(ladderSubmissionState);
  useEffect(() => {
    stateRef.current = ladderSubmissionState;
  }, [ladderSubmissionState]);

  // 修复：1. Load Submission State with Validation
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
              // 关键修复：立即更新 stateRef，确保后续检查使用最新状态
              stateRef.current = validated;
              // 立即保存验证后的状态（修复损坏数据）
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
              // 关键修复：立即更新 stateRef
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
            // 关键修复：立即更新 stateRef
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
          // 关键修复：立即更新 stateRef
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
        // 关键修复：立即更新 stateRef
        stateRef.current = defaultState;
      }
    };
    loadSubmissionState();
  }, [auth.currentUser?.uid]); // 关键：只在 userId 变化时加载，不要重复加载

  // 修复：2. Save Submission State (Always save, not conditional)
  useEffect(() => {
    if (!auth.currentUser) return;
    
    // 关键修复：使用 ladderSubmissionState（最新状态），而不是 stateRef.current
    try {
      const userId = auth.currentUser.uid;
      const currentState = ladderSubmissionState;
      
      // 在保存前再次验证日期
      const now = new Date();
      const today = now.toDateString();
      
      // 如果日期不同，重置计数（但不要覆盖正在进行的提交）
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
        // 日期相同，保存当前状态（确保计数正确）
        saveSubmissionStateSync(userId, currentState);
      }
    } catch (error) {
      logger.error('Save submission state failed:', error);
    }
  }, [ladderSubmissionState, auth.currentUser?.uid]);

  // 修复：3. Limits Check (Synchronous date check)
  const checkLadderSubmissionLimit = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();
    
    // 关键修复：在检查前，先从 localStorage 同步最新状态
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
            // 如果日期相同，使用保存的状态（确保计数正确）
            currentState = validated;
            // 立即更新 stateRef，确保后续使用最新状态
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

    // 同步检查日期，如果不同则立即重置（不依赖异步更新）
    if (currentState.lastSubmissionDate !== today) {
      const resetState = {
        lastSubmissionTime: null,
        dailySubmissionCount: 0,
        lastSubmissionDate: today,
      };
      
      // 同步更新状态和保存
      setLadderSubmissionState(resetState);
      // 关键修复：立即更新 stateRef，确保后续检查使用最新状态
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

    logger.debug('Submission allowed, current count:', currentCount);
    return { canSubmit: true, reason: null, currentCount };
  }, [t, auth.currentUser]);

  const showSubmitConfirmModal = useCallback(() => {
    // 关键修复：在检查前，先从 localStorage 同步最新状态
    if (auth.currentUser) {
      try {
        const userId = auth.currentUser.uid;
        const storageKey = `ladderSubmissionState_${userId}`;
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          const validated = validateSubmissionState(parsed);
          if (validated && validated.lastSubmissionDate === new Date().toDateString()) {
            // 如果日期相同，使用保存的状态（确保计数正确）
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

  // 更新提交计数（在提交成功后调用）
  const incrementSubmissionCount = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();
    
    // 关键修复：直接从 localStorage 读取最新状态（不依赖 React 状态）
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
            // 使用 localStorage 中的最新状态
            currentState = validated;
            logger.debug('Loaded latest state from localStorage for increment:', currentState);
          }
        }
      } catch (error) {
        logger.warn('Failed to load state from localStorage, using ref:', error);
      }
    }

    // 关键修复：基于最新状态计算新计数
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

    // 关键修复：立即更新 stateRef 和 localStorage（原子操作）
    stateRef.current = newState;
    if (auth.currentUser) {
      saveSubmissionStateSync(auth.currentUser.uid, newState);
    }
    
    // 然后更新 React 状态
    setLadderSubmissionState(newState);

    // 修复：更新模态框的剩余次数
    const newRemainingCount = DAILY_SUBMISSION_LIMIT - newCount;
    setSubmitConfirmModal(prev => ({
      ...prev,
      remainingCount: Math.max(0, newRemainingCount),
    }));
    logger.debug('Updated remaining count:', newRemainingCount);
    logger.debug('Submission state updated:', newState);
  }, [auth.currentUser]);

  return {
    ladderSubmissionState,
    submitConfirmModal,
    checkLadderSubmissionLimit,
    showSubmitConfirmModal,
    incrementSubmissionCount,
    setSubmitConfirmModal,
    DAILY_SUBMISSION_LIMIT,
  };
};

