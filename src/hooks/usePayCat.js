import { useCallback } from 'react';
import logger from '../utils/logger';

/**
 * Phase 1-6: Shadow Monetization Hook (PayCat)
 * Handles Honor Seals economy, 1+2 consumption rule, and Early Adopter privileges
 */
export function usePayCat(userData) {
  /**
   * Check if user is Early Adopter
   * Early Adopters get unlimited seals and bypass all consumption checks
   */
  const isEarlyAdopter = useCallback(() => {
    return userData?.subscription?.isEarlyAdopter === true;
  }, [userData]);

  /**
   * Check total seal balance (honorSeals + monthlySeals)
   * @returns {number} Total available seals
   */
  const checkSealBalance = useCallback(() => {
    const honorSeals = Number(userData?.honorSeals) || 0;
    const monthlySeals = Number(userData?.monthlySeals) || 0;
    return honorSeals + monthlySeals;
  }, [userData]);

  /**
   * Calculate required seals based on 1+2 consumption rule
   * Rule: System automatically recommends consumption based on data characteristics
   * - 2 seals: Standard verification
   * - 3 seals: Advanced verification
   * - Suggestion: Subscribe for PRO (5 seals/month)
   * 
   * Phase 1-6 Enhancement: PRO Push - Auto-recommend subscription if total cost >= 3 seals
   * 
   * @param {Object} scores - User scores object
   * @param {number} scores.ladderScore - Ladder score
   * @param {Object} scores - Individual test scores
   * @returns {Object} { required: number, recommendation: string, reason: string, recommendSubscription: boolean }
   */
  const calculateRequiredSeals = useCallback(
    scores => {
      if (!scores || typeof scores !== 'object') {
        return {
          required: 0,
          recommendation: 'no_action',
          reason: 'No scores provided',
          recommendSubscription: false,
        };
      }

      const ladderScore = Number(scores.ladderScore) || 0;
      const strength = Number(scores.strength) || 0;
      const explosivePower = Number(scores.explosivePower) || 0;
      const cardio = Number(scores.cardio) || 0;
      const muscleMass = Number(scores.muscleMass) || 0;
      const bodyFat = Number(scores.bodyFat) || 0;

      // Check if user has exceeded 100 points (needs limit break verification)
      const hasExceededLimit = ladderScore > 100 || 
        strength > 100 || 
        explosivePower > 100 || 
        cardio > 100 || 
        muscleMass > 100 || 
        bodyFat > 100;

      // Check if user has high scores (80-100 range) - might need rank exam
      const hasHighScores = ladderScore >= 80 || 
        (strength >= 80 && explosivePower >= 80 && cardio >= 80 && muscleMass >= 80 && bodyFat >= 80);

      // 1+2 Rule Logic:
      // - If exceeded 100: Requires 3 seals (limit break verification)
      // - If high scores (80-100): Requires 2 seals (rank exam verification)
      // - If multiple high scores: Suggest PRO subscription

      if (hasExceededLimit) {
        const exceededCount = [
          ladderScore > 100,
          strength > 100,
          explosivePower > 100,
          cardio > 100,
          muscleMass > 100,
          bodyFat > 100,
        ].filter(Boolean).length;

        // PRO Push: If total cost >= 3 seals, recommend subscription
        const requiredSeals = 3;
        const recommendSubscription = requiredSeals >= 3 || exceededCount >= 2;

        if (exceededCount >= 2) {
          return {
            required: requiredSeals,
            recommendation: 'subscribe',
            reason: 'Multiple scores exceeded 100. Consider PRO subscription for unlimited seals.',
            recommendSubscription: true,
          };
        }

        return {
          required: requiredSeals,
          recommendation: 'limit_break',
          reason: 'Score exceeded 100. Requires limit break verification (3 seals).',
          recommendSubscription: recommendSubscription,
        };
      }

      if (hasHighScores) {
        const highScoreCount = [
          ladderScore >= 80,
          strength >= 80,
          explosivePower >= 80,
          cardio >= 80,
          muscleMass >= 80,
          bodyFat >= 80,
        ].filter(Boolean).length;

        // PRO Push: If multiple high scores (>= 4), recommend subscription
        const requiredSeals = 2;
        const recommendSubscription = highScoreCount >= 4;

        if (highScoreCount >= 4) {
          return {
            required: requiredSeals,
            recommendation: 'subscribe',
            reason: 'Multiple high scores. Consider PRO subscription for monthly seal quota.',
            recommendSubscription: true,
          };
        }

        return {
          required: requiredSeals,
          recommendation: 'rank_exam',
          reason: 'High scores detected. Rank exam verification recommended (2 seals).',
          recommendSubscription: recommendSubscription,
        };
      }

      return {
        required: 0,
        recommendation: 'no_action',
        reason: 'Scores are within normal range. No verification required.',
        recommendSubscription: false,
      };
    },
    []
  );

  /**
   * Consume seals based on tier and amount
   * Early Adopters bypass all consumption
   * 
   * @param {number} amount - Number of seals to consume
   * @param {string} tier - Verification tier: 'limit_break' | 'rank_exam'
   * @returns {Object} { success: boolean, remaining: number, message: string }
   */
  const consumeSeals = useCallback(
    (amount, tier = 'rank_exam') => {
      // Early Adopter bypass
      if (isEarlyAdopter()) {
        logger.info(
          `✅ [PayCat] Early Adopter detected. Bypassing seal consumption (${amount} seals for ${tier})`
        );
        return {
          success: true,
          remaining: checkSealBalance(),
          message: 'Early Adopter: Unlimited seals',
        };
      }

      const totalBalance = checkSealBalance();
      const requiredAmount = Number(amount) || 0;

      if (requiredAmount <= 0) {
        return {
          success: false,
          remaining: totalBalance,
          message: 'Invalid seal amount',
        };
      }

      if (totalBalance < requiredAmount) {
        return {
          success: false,
          remaining: totalBalance,
          message: `Insufficient seals. Required: ${requiredAmount}, Available: ${totalBalance}`,
        };
      }

      // Consumption logic: Prioritize monthlySeals, then honorSeals
      const monthlySeals = Number(userData?.monthlySeals) || 0;
      const honorSeals = Number(userData?.honorSeals) || 0;

      let remainingMonthly = monthlySeals;
      let remainingHonor = honorSeals;
      let consumed = 0;

      // First consume from monthlySeals
      if (remainingMonthly > 0) {
        const consumeFromMonthly = Math.min(remainingMonthly, requiredAmount);
        remainingMonthly -= consumeFromMonthly;
        consumed += consumeFromMonthly;
      }

      // Then consume from honorSeals if needed
      if (consumed < requiredAmount && remainingHonor > 0) {
        const consumeFromHonor = Math.min(
          remainingHonor,
          requiredAmount - consumed
        );
        remainingHonor -= consumeFromHonor;
        consumed += consumeFromHonor;
      }

      if (consumed < requiredAmount) {
        return {
          success: false,
          remaining: totalBalance,
          message: `Failed to consume ${requiredAmount} seals. Only consumed ${consumed}`,
        };
      }

      logger.info(
        `✅ [PayCat] Consumed ${consumed} seals (${requiredAmount - monthlySeals + remainingMonthly} from monthly, ${honorSeals - remainingHonor} from honor)`
      );

      return {
        success: true,
        remaining: remainingMonthly + remainingHonor,
        remainingMonthly,
        remainingHonor,
        consumed,
        message: `Successfully consumed ${consumed} seals`,
      };
    },
    [userData, isEarlyAdopter, checkSealBalance]
  );

  /**
   * Get monthly PRO quota (5 seals per month)
   * @returns {number} Monthly seal quota
   */
  const getMonthlyQuota = useCallback(() => {
    // PRO users get 5 seals per month
    // This is a placeholder for future subscription integration
    return 5;
  }, []);

  /**
   * Phase 1-6: Reset monthly seals for PRO users
   * Called when new month starts and user has PRO status
   * Monthly seals are reset to 5 (not accumulated, reset each month)
   * 
   * @param {Object} userData - Current user data
   * @returns {Object} { shouldReset: boolean, newMonthlySeals: number, lastResetMonth: string }
   */
  const resetMonthlySeals = useCallback(
    userData => {
      const isPro = userData?.subscription?.status === 'pro' || 
                    userData?.subscription?.isEarlyAdopter === true;
      
      if (!isPro) {
        return {
          shouldReset: false,
          newMonthlySeals: userData?.monthlySeals || 0,
          lastResetMonth: null,
        };
      }

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const lastResetMonth = userData?.lastMonthlyResetMonth || null;

      // Check if we need to reset (new month)
      if (lastResetMonth === currentMonth) {
        return {
          shouldReset: false,
          newMonthlySeals: userData?.monthlySeals || 0,
          lastResetMonth: currentMonth,
        };
      }

      // Reset to 5 seals for new month
      logger.info(
        `✅ [PayCat] Resetting monthly seals for PRO user. Month: ${currentMonth}, Previous: ${lastResetMonth}`
      );

      return {
        shouldReset: true,
        newMonthlySeals: 5,
        lastResetMonth: currentMonth,
      };
    },
    []
  );

  /**
   * Check if user has pending verification (concurrent limit: 1 pending per tier)
   * Phase 1-6: Strict enforcement - only 1 pending verification allowed at a time
   * @param {string} tier - Verification tier: 'limit_break' | 'rank_exam' (optional, checks all if not provided)
   * @returns {boolean} True if user has pending verification
   */
  const hasPendingVerification = useCallback(
    tier => {
      const verifications = userData?.verifications || {};
      
      if (tier) {
        // Check specific tier
        const tierVerification = verifications[tier];
        return tierVerification?.status === 'pending';
      }

      // Check all tiers for any pending status (strict concurrent limit)
      const tiers = Object.keys(verifications);
      for (const t of tiers) {
        if (verifications[t]?.status === 'pending') {
          return true;
        }
      }

      return false;
    },
    [userData]
  );

  /**
   * Phase 1-6: Check if cosmetic is unlocked
   * @param {string} id - Cosmetic ID to check
   * @returns {boolean} Whether the cosmetic is unlocked
   */
  const isCosmeticUnlocked = useCallback(
    id => {
      if (!id || !userData) {
        return false;
      }
      const unlockedCosmetics = userData?.unlockedCosmetics || [];
      return Array.isArray(unlockedCosmetics) && unlockedCosmetics.includes(id);
    },
    [userData]
  );

  return {
    isEarlyAdopter,
    checkSealBalance,
    calculateRequiredSeals,
    consumeSeals,
    getMonthlyQuota,
    resetMonthlySeals,
    hasPendingVerification,
    isCosmeticUnlocked,
  };
}

