import { useState, useCallback, useRef } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import logger from '../utils/logger';
import {
  applyLinearExtension,
  calculateStatsAggregates,
  generateFilterTags,
} from '../utils/ladderUtils';

export const useLadderSubmit = (
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
) => {
  // 防重复提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // 修复：4. Confirm Submit (Check date before incrementing)
  const confirmSubmitToLadder = useCallback(async () => {
    // 关键修复：防止重复提交
    if (isSubmitting || submittingRef.current) {
      logger.warn('Submission already in progress, ignoring duplicate call');
      return;
    }
    
    setIsSubmitting(true);
    submittingRef.current = true;
    setSubmitConfirmModal({ isOpen: false, remainingCount: 0 });

    try {
      // 关键修复：在提交前再次检查限制（防止并发提交）
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
      // 修复：优先读取 explosivePower（实际存储的字段名）
      const explosive = Number(scores.explosivePower) || Number(scores.explosive) || Number(scores.power) || 0;
      const muscleMass = Number(scores.muscleMass) || 0;
      const bodyFat = Number(scores.bodyFat) || 0;
      const baseCardio = Number(scores.cardio) || 0; // Cooper Test

      // 添加调试日志
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

      // 3. Phase 1-6: Apply Linear Extension (replaces Limit Break)
      const verificationStatus = userData?.verifications || {};
      const finalScore = applyLinearExtension(rawCalculatedScore, verificationStatus, 'limit_break');

      // 4. Prepare 5KM Stat (Standalone)
      const run5kmScore = Number(scores.run_5km) || 0;
      const run5kmInputs = userData.testInputs?.run_5km || {};
      const run5kmTime =
        Number(run5kmInputs.minutes) * 60 + Number(run5kmInputs.seconds) || 0;

      // LOOP BREAKER: Only update if score actually changed
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
      
      // ✅ 緊急修復：寫入前先讀取現有數據，保護認證相關欄位
      let existingVerificationFields = null;
      try {
        const existingDoc = await getDoc(userRef);
        if (existingDoc.exists()) {
          const existingData = existingDoc.data();
          existingVerificationFields = {
            isVerified: existingData.isVerified,
            verifiedLadderScore: existingData.verifiedLadderScore,
            verificationStatus: existingData.verificationStatus,
            verifiedAt: existingData.verifiedAt,
            verificationExpiredAt: existingData.verificationExpiredAt,
            verificationRequestId: existingData.verificationRequestId,
          };
        }
      } catch (readError) {
        logger.warn(
          '⚠️ [榮譽認證保護] 讀取現有數據失敗，繼續執行:',
          readError
        );
      }

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

      // ✅ 業務邏輯：如果用戶已認證，重新提交分數後認證失效
      // 但我們需要確保其他認證相關欄位也被正確清除
      if (isVerified) {
        updateData.isVerified = false;
        updateData.verifiedLadderScore = null;
        // 清除所有認證相關欄位
        updateData.verificationStatus = null;
        updateData.verifiedAt = null;
        updateData.verificationExpiredAt = null;
        updateData.verificationRequestId = null;
        logger.info(
          '✅ [榮譽認證] 用戶重新提交分數，認證狀態已清除（業務邏輯）'
        );
      } else if (existingVerificationFields?.isVerified === true) {
        // ✅ 防禦性編碼：如果現有數據中 isVerified === true，但當前 userData 中為 false
        // 這可能是因為 React 狀態未同步，我們應該「顯式」保持認證狀態
        logger.warn(
          '⚠️ [榮譽認證保護] 檢測到現有認證狀態與本地狀態不一致，顯式保持現有認證狀態'
        );
        // 顯式地將所有認證相關欄位重新賦值給 updateData，確保不會被覆蓋
        updateData.isVerified = true;
        updateData.verifiedLadderScore =
          existingVerificationFields.verifiedLadderScore ?? null;
        updateData.verificationStatus =
          existingVerificationFields.verificationStatus ?? null;
        updateData.verifiedAt = existingVerificationFields.verifiedAt ?? null;
        updateData.verificationExpiredAt =
          existingVerificationFields.verificationExpiredAt ?? null;
        updateData.verificationRequestId =
          existingVerificationFields.verificationRequestId ?? null;
        logger.info(
          '✅ [榮譽認證保護] 已顯式保持所有認證相關欄位，防止數據丟失'
        );
      }

      await setDoc(userRef, updateData, { merge: true });

      // 更新提交计数
      incrementSubmissionCount();

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
      // 关键修复：确保在 finally 中重置提交状态
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }, [
    userData,
    setUserData,
    auth,
    db,
    t,
    navigate,
    onShowModal,
    checkLadderSubmissionLimit,
    incrementSubmissionCount,
    setSubmitConfirmModal,
    isSubmitting,
  ]);

  return {
    isSubmitting,
    confirmSubmitToLadder,
  };
};

