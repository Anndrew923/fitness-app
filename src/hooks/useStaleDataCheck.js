import { useMemo } from 'react';

/**
 * Hook to check if test data is stale based on weight changes
 * @param {Object} userData - User data object
 * @param {string} testType - Type of test: 'muscle' (SMM) or 'strength' (SBD)
 * @returns {Object} { isStale, currentWeight, recordWeight, message }
 */
export const useStaleDataCheck = (userData, testType) => {
  return useMemo(() => {
    const currentWeight = Number(userData.weight) || 0;
    
    if (!currentWeight) {
      return {
        isStale: false,
        currentWeight: 0,
        recordWeight: null,
        message: null,
      };
    }

    let recordWeight = null;

    // Get record weight based on test type
    if (testType === 'muscle') {
      // SMM: Check if muscle test has been done and get recorded weight
      if (userData.testInputs?.muscle?.weight) {
        recordWeight = Number(userData.testInputs.muscle.weight);
      }
      // If weight not stored, we can't determine if data is stale
      // Only check if SMM data exists (meaning test was done)
      // but without weight snapshot, we can't compare, so return not stale
    } else if (testType === 'strength') {
      // Strength: Check if strength test has been done and get recorded bodyWeight
      if (userData.testInputs?.strength?.bodyWeight) {
        recordWeight = Number(userData.testInputs.strength.bodyWeight);
      }
      // If bodyWeight not stored, we can't determine if data is stale
      // Only check if strength data exists but without bodyWeight snapshot,
      // we can't compare, so return not stale
    }

    // If no record weight found, data is not stale (no test done yet)
    if (recordWeight === null || recordWeight === 0) {
      return {
        isStale: false,
        currentWeight,
        recordWeight: null,
        message: null,
      };
    }

    // Calculate difference
    const weightDiff = Math.abs(currentWeight - recordWeight);
    const weightDiffPercent = recordWeight > 0 
      ? (weightDiff / recordWeight) * 100 
      : 0;

    // Check if stale: >= 2kg OR >= 3%
    const isStale = weightDiff >= 2 || weightDiffPercent >= 3;

    const message = isStale
      ? `偵測到您的體重已變更 (${currentWeight.toFixed(1)}kg)，與此紀錄 (${recordWeight.toFixed(1)}kg) 不符。建議重新評測以確保排名精準。`
      : null;

    return {
      isStale,
      currentWeight,
      recordWeight,
      message,
    };
  }, [userData, testType]);
};

