import { useCallback } from 'react';
import { useSubmissionLimits } from './useSubmissionLimits';
import { useLadderRank } from './useLadderRank';
import { useLadderSubmit } from './useLadderSubmit';

/**
 * 主入口 Hook - 整合三個子 Hook
 * - useSubmissionLimits: 處理每日限制與 localStorage
 * - useLadderRank: 處理排行榜抓取與排名計算
 * - useLadderSubmit: 處理 Firestore 保存與榮譽認證保護
 */
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
  // 1. 每日限制管理
  const {
    ladderSubmissionState,
    submitConfirmModal,
    checkLadderSubmissionLimit,
    showSubmitConfirmModal,
    incrementSubmissionCount,
    setSubmitConfirmModal,
  } = useSubmissionLimits(auth, t, navigate, onShowModal);

  // 2. 排行榜排名計算
  const { userRank } = useLadderRank(userData, submittedLadderScore, db);

  // 3. 提交邏輯（包含 Firestore 保存與榮譽認證保護）
  const { confirmSubmitToLadder } = useLadderSubmit(
    userData,
    setUserData,
    auth,
    db,
    t,
    navigate,
    onShowModal,
    checkLadderSubmissionLimit,
    incrementSubmissionCount,
    setSubmitConfirmModal
  );

  // 整合提交處理邏輯
  const handleSubmitToLadder = useCallback(async () => {
    // ✅ 检查访客模式
    const isGuest =
      sessionStorage.getItem('guestMode') === 'true' && !auth.currentUser;

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

    // 如果通過檢查，顯示確認模態框
    showSubmitConfirmModal();
  }, [
    auth,
    checkLadderSubmissionLimit,
    t,
    navigate,
    onShowModal,
    showSubmitConfirmModal,
  ]);

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
