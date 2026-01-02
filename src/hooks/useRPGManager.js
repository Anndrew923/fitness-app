import { useCallback } from 'react';
import { getDailyGachaResult } from '../utils/rpgSystem';
import logger from '../utils/logger';

/**
 * Hook for managing RPG stats and daily gacha logic
 * Handles rpgStats updates and getDailyGachaResult triggering
 */
export function useRPGManager() {
  /**
   * Initialize rpgStats for new user
   */
  const initializeRpgStats = useCallback(() => {
    return {
      lastGachaDate: null,
      totalExp: 0,
      level: 1,
    };
  }, []);

  /**
   * Migrate rpgStats for existing user
   */
  const migrateRpgStats = useCallback(firebaseData => {
    if (firebaseData.rpgStats) {
      return firebaseData.rpgStats;
    }
    logger.info('✅ [Phase 1-5] 補全 rpgStats 欄位');
    return {
      lastGachaDate: null,
      totalExp: 0,
      level: 1,
    };
  }, []);

  /**
   * Check if user can trigger daily gacha
   * @param {Object} rpgStats - Current rpgStats object
   * @returns {boolean} True if user can trigger gacha today
   */
  const canTriggerDailyGacha = useCallback(rpgStats => {
    if (!rpgStats) return true;
    const today = new Date().toISOString().split('T')[0];
    return rpgStats.lastGachaDate !== today;
  }, []);

  /**
   * Trigger daily gacha and update rpgStats
   * @param {number} userRawScore - User's raw score for gacha calculation
   * @param {boolean} isEarlyAdopter - Whether user is early adopter
   * @param {Object} currentRpgStats - Current rpgStats object
   * @returns {Object} { gachaResult, updatedRpgStats }
   */
  const triggerDailyGacha = useCallback(
    (userRawScore, isEarlyAdopter, currentRpgStats = null) => {
      const today = new Date().toISOString().split('T')[0];

      // Check if already triggered today
      if (currentRpgStats?.lastGachaDate === today) {
        logger.debug('⚠️ [RPG Manager] Daily gacha already triggered today');
        return {
          gachaResult: null,
          updatedRpgStats: currentRpgStats,
        };
      }

      // Get gacha result
      const gachaResult = getDailyGachaResult(userRawScore, isEarlyAdopter);
      logger.debug('🎲 [RPG Manager] Daily gacha triggered:', gachaResult);

      // Calculate updated rpgStats
      const currentTotalExp = currentRpgStats?.totalExp || 0;
      const currentLevel = currentRpgStats?.level || 1;
      let newTotalExp = currentTotalExp;
      let newLevel = currentLevel;

      // Handle EXP reward
      if (gachaResult.type === 'EXP') {
        newTotalExp = currentTotalExp + gachaResult.value;
        // Level up calculation (simplified: 100 exp per level)
        newLevel = Math.floor(newTotalExp / 100) + 1;
        logger.debug(
          `💪 [RPG Manager] EXP gained: ${gachaResult.value}, Total: ${newTotalExp}, Level: ${newLevel}`
        );
      }

      const updatedRpgStats = {
        lastGachaDate: today,
        totalExp: newTotalExp,
        level: newLevel,
      };

      return {
        gachaResult,
        updatedRpgStats,
      };
    },
    []
  );

  /**
   * Update rpgStats with new values
   * @param {Object} currentRpgStats - Current rpgStats
   * @param {Object} updates - Partial rpgStats updates
   * @returns {Object} Updated rpgStats
   */
  const updateRpgStats = useCallback((currentRpgStats, updates) => {
    return {
      ...(currentRpgStats || initializeRpgStats()),
      ...updates,
    };
  }, [initializeRpgStats]);

  return {
    initializeRpgStats,
    migrateRpgStats,
    canTriggerDailyGacha,
    triggerDailyGacha,
    updateRpgStats,
  };
}

