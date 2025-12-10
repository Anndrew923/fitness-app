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
import { calculateLadderScore } from '../utils';
import logger from '../utils/logger';

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

  // 載入天梯提交狀態
  useEffect(() => {
    const loadSubmissionState = () => {
      if (!auth.currentUser) {
        return;
      }

      try {
        const userId = auth.currentUser.uid;
        const storageKey = `ladderSubmissionState_${userId}`;
        const savedState = localStorage.getItem(storageKey);

        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setLadderSubmissionState(parsedState);
        }
      } catch (error) {
        logger.error('載入提交狀態失敗:', error);
        setLadderSubmissionState({
          lastSubmissionTime: null,
          dailySubmissionCount: 0,
          lastSubmissionDate: null,
        });
      }
    };

    loadSubmissionState();
  }, [userData?.userId, auth.currentUser?.uid]);

  // 保存天梯提交狀態到localStorage
  useEffect(() => {
    if (!auth.currentUser || !ladderSubmissionState.lastSubmissionDate) {
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const storageKey = `ladderSubmissionState_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(ladderSubmissionState));
    } catch (error) {
      logger.error('保存提交狀態失敗:', error);
    }
  }, [ladderSubmissionState, auth.currentUser?.uid]);

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
      const timeDiff = now - ladderSubmissionState.lastSubmissionTime;
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

  const confirmSubmitToLadder = useCallback(async () => {
    setSubmitConfirmModal({ isOpen: false, remainingCount: 0 });

    try {
      const oldLadderScore = userData.ladderScore || 0;
      const isFirstTime = oldLadderScore === 0;

      let oldRank = 0;
      if (oldLadderScore > 0 && auth.currentUser) {
        try {
          const q = query(
            collection(db, 'users'),
            orderBy('ladderScore', 'desc'),
            limit(200)
          );
          const querySnapshot = await getDocs(q);
          const allUsers = [];
          querySnapshot.forEach(doc => {
            const docData = doc.data();
            if (docData.ladderScore > 0) {
              allUsers.push({
                id: doc.id,
                ladderScore: docData.ladderScore,
              });
            }
          });

          allUsers.sort((a, b) => b.ladderScore - a.ladderScore);
          const currentUserIndex = allUsers.findIndex(
            user => user.id === auth.currentUser.uid
          );

          if (currentUserIndex >= 0) {
            oldRank = currentUserIndex + 1;
            logger.debug(`📊 查詢到當前排名：第 ${oldRank} 名`);
          }
        } catch (error) {
          logger.error('查詢當前排名失敗:', error);
        }
      }

      const scores = userData.scores || {};
      const ladderScore = calculateLadderScore(scores);

      localStorage.setItem(
        'ladderUpdateNotification',
        JSON.stringify({
          isFirstTime: isFirstTime,
          oldScore: oldLadderScore,
          newScore: ladderScore,
          oldRank: oldRank,
          timestamp: Date.now(),
          hasShown: false,
        })
      );

      const updatedUserData = {
        ...userData,
        ladderScore: ladderScore,
        lastLadderSubmission: new Date().toISOString(),
      };

      setUserData(updatedUserData);

      try {
        const ladderData = {
          ...userData,
          ladderScore: ladderScore,
          lastLadderSubmission: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem('userData', JSON.stringify(ladderData));
        localStorage.setItem('lastSavedUserData', JSON.stringify(ladderData));

        const userRef = doc(db, 'users', auth.currentUser.uid);

        const updateData = {
          ladderScore: ladderScore,
          lastLadderSubmission: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (userData.isVerified === true) {
          updateData.isVerified = false;
          updateData.verifiedLadderScore = null;
          updateData.verificationStatus = null;
          updateData.verifiedAt = null;
          updateData.verificationExpiredAt = null;
          updateData.verificationRequestId = null;
          logger.debug('✅ 已清除榮譽認證狀態（重新提交分數）');
        }

        await setDoc(userRef, updateData, { merge: true });

        logger.debug('天梯分數已立即保存到 Firebase:', ladderScore);
      } catch (error) {
        logger.error('保存天梯分數失敗:', error);
        throw error;
      }

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
          score: ladderScore,
        }),
        type: 'success',
        onAction: () => {
          onShowModal(prev => ({ ...prev, isOpen: false }));
          navigate('/ladder', {
            state: {
              forceReload: true,
              from: '/user-info',
              timestamp: Date.now(),
            },
          });
        },
        actionText: t('userInfo.modal.viewLadder'),
      });

      setTimeout(() => {
        onShowModal(prev => ({ ...prev, isOpen: false }));
      }, 5000);
    } catch (error) {
      logger.error('提交到天梯失敗:', error);
      onShowModal({
        isOpen: true,
        title: t('userInfo.modal.submitFailTitle'),
        message: t('userInfo.modal.submitFailMessage'),
        type: 'error',
      });
    }
  }, [
    userData,
    setUserData,
    auth,
    db,
    t,
    navigate,
    onShowModal,
  ]);

  const cancelSubmit = useCallback(() => {
    setSubmitConfirmModal({ isOpen: false, remainingCount: 0 });
  }, []);

  const handleSubmitToLadder = useCallback(async () => {
    if (!auth.currentUser) {
      onShowModal({
        isOpen: true,
        title: t('community.messages.needLogin'),
        message: t('userInfo.limits.needLoginToSubmit'),
        type: 'warning',
      });
      return;
    }

    const scores = userData.scores || {};
    const completedCount = Object.values(scores).filter(
      score => score > 0
    ).length;

    if (completedCount < 5) {
      onShowModal({
        isOpen: true,
        title: t('userInfo.limits.assessmentIncomplete'),
        message: t('userInfo.limits.assessmentIncompleteMessage', {
          count: completedCount,
        }),
        type: 'warning',
      });
      return;
    }

    const { canSubmit, reason } = checkLadderSubmissionLimit();
    if (!canSubmit) {
      onShowModal({
        isOpen: true,
        title: t('userInfo.limits.limitReached'),
        message: reason,
        type: 'warning',
        onAction: () => {
          onShowModal(prev => ({ ...prev, isOpen: false }));
          navigate('/ladder');
        },
        actionText: t('userInfo.modal.viewLadder'),
      });
      return;
    }

    showSubmitConfirmModal();
  }, [
    userData,
    showSubmitConfirmModal,
    checkLadderSubmissionLimit,
    t,
    navigate,
    auth,
    onShowModal,
  ]);

  // 獲取用戶排名
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
      const q = query(
        usersRef,
        orderBy('ladderScore', 'desc'),
        limit(200)
      );

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach(doc => {
        const docData = doc.data();
        if (docData.ladderScore > 0) {
          users.push({
            id: doc.id,
            ...docData,
          });
        }
      });

      const userIndex = users.findIndex(user => user.id === userData.userId);
      if (userIndex !== -1) {
        setUserRank(userIndex + 1);
      } else {
        setUserRank(null);
      }
    } catch (error) {
      logger.error('獲取用戶排名失敗:', error);
      setUserRank(null);
    }
  }, [userData?.userId, submittedLadderScore, db]);

  // 優化 Firebase 查詢（防抖 + 緩存 + requestIdleCallback）
  const fetchUserRankRef = useRef(null);
  const lastFetchParamsRef = useRef({ userId: null, score: null });

  useEffect(() => {
    if (fetchUserRankRef.current) {
      if (window.cancelIdleCallback) {
        cancelIdleCallback(fetchUserRankRef.current);
      } else {
        clearTimeout(fetchUserRankRef.current);
      }
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
        fetchUserRankRef.current = requestIdleCallback(
          () => {
            fetchUserRank();
          },
          { timeout: 2000 }
        );
      } else {
        fetchUserRankRef.current = setTimeout(() => {
          fetchUserRank();
        }, 800);
      }
    }

    return () => {
      if (fetchUserRankRef.current) {
        if (window.cancelIdleCallback) {
          cancelIdleCallback(fetchUserRankRef.current);
        } else {
          clearTimeout(fetchUserRankRef.current);
        }
      }
    };
  }, [userData?.userId, submittedLadderScore, fetchUserRank]);

  return {
    userRank,
    ladderSubmissionState,
    submitConfirmModal,
    handleSubmitToLadder,
    confirmSubmitToLadder,
    cancelSubmit,
  };
};

