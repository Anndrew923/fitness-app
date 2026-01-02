import { useCallback } from 'react';
import { checkEarlyBirdStatus } from '../utils/rpgSystem';
import logger from '../utils/logger';

/**
 * Hook for managing subscription and verification logic
 * Handles Early Adopter protection and Honor Verification protection
 */
export function useSubscriptionLogic() {
  /**
   * Protect Early Adopter status during data migration
   * Priority A: If existing isEarlyAdopter === true, absolutely preserve it
   * Priority B: New user - check early bird status
   * Priority C: Migration - check early bird status
   */
  const protectEarlyAdopterStatus = useCallback(
    (existingSubscription, incomingSubscription) => {
      // Priority A: Existing Early Adopter - absolute protection
      if (existingSubscription?.isEarlyAdopter === true) {
        logger.info(
          '✅ [Phase 1-5] 檢測到既存 Early Adopter 權限，保持為 true (絕對不覆蓋)'
        );
        return {
          status:
            existingSubscription.status ||
            incomingSubscription?.status ||
            'active',
          isEarlyAdopter: true, // Absolute protection
        };
      }

      // If incoming data has isEarlyAdopter === true, preserve it
      if (incomingSubscription?.isEarlyAdopter === true) {
        logger.info(
          '✅ [Phase 1-5] 檢測到 Early Adopter 權限，保持為 true (絕對不覆蓋)'
        );
        return {
          status: incomingSubscription.status || 'active',
          isEarlyAdopter: true, // Absolute protection
        };
      }

      // Default: Use incoming data or check early bird status
      return (
        incomingSubscription ||
        existingSubscription || {
          status: 'active',
          isEarlyAdopter: checkEarlyBirdStatus(),
        }
      );
    },
    []
  );

  /**
   * Validate Early Adopter protection before save
   * Throws error if attempting to override existing Early Adopter status
   */
  const validateEarlyAdopterProtection = useCallback(
    (existingSubscription, incomingData) => {
      if (existingSubscription?.isEarlyAdopter === true) {
        const incomingIsEarlyAdopter = incomingData.subscription?.isEarlyAdopter;
        if (
          incomingIsEarlyAdopter === false ||
          (incomingData.subscription === undefined &&
            incomingIsEarlyAdopter === undefined)
        ) {
          logger.error(
            '🚨 [Phase 1-5] 嚴重錯誤：嘗試覆蓋 Early Adopter 權限！現有權限為 true，但傳入數據中為 false 或缺失。中止寫入以防止數據丟失。',
            {
              existing: existingSubscription,
              incoming: incomingData.subscription,
              fullData: incomingData,
            }
          );
          throw new Error(
            'Cannot override Early Adopter status: existing isEarlyAdopter=true cannot be changed to false'
          );
        }
        logger.info(
          '✅ [Phase 1-5] 檢測到既存 Early Adopter 權限，將保持為 true (絕對保護)'
        );
      }
    },
    []
  );

  /**
   * Protect Honor Verification fields during save
   * If existing isVerified === true and incoming is undefined, preserve it
   * If incoming isVerified === false, allow it (business logic: re-submission)
   */
  const protectVerificationFields = useCallback(
    (existingVerificationFields, incomingData) => {
      const existingIsVerified = existingVerificationFields?.isVerified;

      if (existingIsVerified === true && incomingData.isVerified === undefined) {
        // Preserve existing verification status
        return {
          isVerified: true,
          verifiedLadderScore: existingVerificationFields?.verifiedLadderScore,
          verificationStatus: existingVerificationFields?.verificationStatus,
          verifiedAt: existingVerificationFields?.verifiedAt,
          verificationExpiredAt: existingVerificationFields?.verificationExpiredAt,
          verificationRequestId: existingVerificationFields?.verificationRequestId,
        };
      }

      if (incomingData.isVerified !== undefined) {
        // Explicitly set isVerified
        if (incomingData.isVerified === false) {
          // Clear verification fields when explicitly set to false
          return {
            isVerified: false,
            verifiedLadderScore: null,
            verificationStatus: null,
            verifiedAt: null,
            verificationExpiredAt: null,
            verificationRequestId: null,
          };
        } else {
          // Preserve or use incoming verification fields
          return {
            isVerified: incomingData.isVerified,
            verifiedLadderScore:
              incomingData.verifiedLadderScore ??
              existingVerificationFields?.verifiedLadderScore,
            verificationStatus:
              incomingData.verificationStatus ??
              existingVerificationFields?.verificationStatus,
            verifiedAt:
              incomingData.verifiedAt ?? existingVerificationFields?.verifiedAt,
            verificationExpiredAt:
              incomingData.verificationExpiredAt ??
              existingVerificationFields?.verificationExpiredAt,
            verificationRequestId:
              incomingData.verificationRequestId ??
              existingVerificationFields?.verificationRequestId,
          };
        }
      }

      // No changes needed
      return {};
    },
    []
  );

  /**
   * Validate verification protection before save
   * Logs warning if attempting to override existing verification
   */
  const validateVerificationProtection = useCallback(
    (existingIsVerified, incomingIsVerified) => {
      if (existingIsVerified === true) {
        if (incomingIsVerified === undefined) {
          logger.info(
            '✅ [榮譽認證保護] 檢測到既存 isVerified=true，傳入數據中缺失，將保持為 true (絕對保護)'
          );
        } else if (incomingIsVerified === false) {
          logger.warn(
            '⚠️ [榮譽認證] 檢測到 isVerified 從 true 變為 false（可能是重新提交分數），允許此操作'
          );
        }
      }
    },
    []
  );

  /**
   * Initialize subscription for new user
   */
  const initializeSubscription = useCallback(() => {
    const isEarlyBird = checkEarlyBirdStatus();
    logger.info(
      `✅ [Phase 1-5] 新用戶註冊: isEarlyAdopter=${isEarlyBird} (${
        isEarlyBird ? 'Joined before deadline' : 'Joined after deadline'
      })`
    );
    return {
      status: 'active',
      isEarlyAdopter: isEarlyBird,
    };
  }, []);

  /**
   * Migrate subscription for existing user
   */
  const migrateSubscription = useCallback(firebaseData => {
    if (firebaseData.subscription) {
      // Priority A: Existing Early Adopter - preserve
      if (firebaseData.subscription.isEarlyAdopter === true) {
        logger.info(
          '✅ [Phase 1-5] 檢測到既存 Early Adopter 權限，保持為 true (絕對不覆蓋)'
        );
        return {
          status: firebaseData.subscription.status || 'active',
          isEarlyAdopter: true, // Absolute protection
        };
      }
      return firebaseData.subscription;
    }

    // Migration: Check early bird status
    const isEarlyBird = checkEarlyBirdStatus();
    logger.info(
      `✅ [Phase 1-5] 補全 subscription 欄位: isEarlyAdopter=${isEarlyBird} (${
        isEarlyBird ? 'Joined before deadline' : 'Joined after deadline'
      })`
    );
    return {
      status: 'active',
      isEarlyAdopter: isEarlyBird,
    };
  }, []);

  return {
    protectEarlyAdopterStatus,
    validateEarlyAdopterProtection,
    protectVerificationFields,
    validateVerificationProtection,
    initializeSubscription,
    migrateSubscription,
  };
}

