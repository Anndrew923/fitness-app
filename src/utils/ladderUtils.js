/**
 * Ladder Utilities - Pre-calculation functions for Multi-dimensional Ranking
 * Pure functions for Limit Break, Stats Aggregates, and Filter Tags
 */

/**
 * Apply Limit Break: Cap unverified users' scores at 100
 * @param {number} rawScore - Raw calculated score
 * @param {boolean} isVerified - Whether user is verified
 * @returns {number} Capped score (100.00 if unverified and > 100, otherwise rawScore)
 */
export const applyLimitBreak = (rawScore, isVerified) => {
  if (!isVerified && rawScore > 100) {
    return 100.0;
  }
  return rawScore;
};

/**
 * Calculate Stats Aggregates from exercise scores
 * @param {Object} scores - Object containing individual exercise scores
 * @param {number} scores.benchPress - Bench press max weight (kg)
 * @param {number} scores.squat - Squat max weight (kg)
 * @param {number} scores.deadlift - Deadlift max weight (kg)
 * @param {number} scores.pullUp - Pull-up max weight (kg) or reps
 * @param {number} scores.overheadPress - Overhead press max weight (kg)
 * @param {number} scores.sprint - Sprint time or score
 * @param {number} scores.verticalJump - Vertical jump height (cm)
 * @param {number} scores.broadJump - Broad jump distance (cm)
 * @returns {Object} Aggregated stats
 * @returns {number} returns.sbdTotal - Sum of Bench + Squat + Deadlift (kg)
 * @returns {number} returns.bigFiveTotal - Sum of SBD + Pull-up + Overhead Press (kg)
 * @returns {number} returns.explosiveAvg - Average of Sprint, Vertical Jump, Broad Jump
 * @returns {boolean} returns.is1000lbClub - Whether SBD total >= 453.6kg (1000lbs)
 */
export const calculateStatsAggregates = scores => {
  if (!scores || typeof scores !== 'object') {
    return {
      sbdTotal: 0,
      bigFiveTotal: 0,
      explosiveAvg: 0,
      is1000lbClub: false,
    };
  }

  // Extract values, defaulting to 0 if not present
  const benchPress = Number(scores.benchPress) || 0;
  const squat = Number(scores.squat) || 0;
  const deadlift = Number(scores.deadlift) || 0;
  const pullUp = Number(scores.pullUp) || 0;
  const overheadPress = Number(scores.overheadPress) || 0;
  const sprint = Number(scores.sprint) || 0;
  const verticalJump = Number(scores.verticalJump) || 0;
  const broadJump = Number(scores.broadJump) || 0;

  // Calculate SBD Total (Sum of Bench + Squat + Deadlift)
  const sbdTotal = benchPress + squat + deadlift;

  // Calculate Big Five Total (SBD + Pull-up + Overhead Press)
  const bigFiveTotal = sbdTotal + pullUp + overheadPress;

  // Calculate Explosive Average (Average of Sprint, Vertical Jump, Broad Jump)
  const explosiveValues = [sprint, verticalJump, broadJump].filter(
    val => val > 0
  );
  const explosiveAvg =
    explosiveValues.length > 0
      ? explosiveValues.reduce((sum, val) => sum + val, 0) /
        explosiveValues.length
      : 0;

  // Check if user is in 1000lb Club (SBD total >= 453.6kg / 1000lbs)
  const is1000lbClub = sbdTotal >= 453.6;

  return {
    sbdTotal: Math.round(sbdTotal * 100) / 100, // Round to 2 decimal places
    bigFiveTotal: Math.round(bigFiveTotal * 100) / 100,
    explosiveAvg: Math.round(explosiveAvg * 100) / 100,
    is1000lbClub,
  };
};

/**
 * Generate Filter Tags for multi-dimensional ranking
 * @param {Object} userData - User data object
 * @param {string|Date} userData.birthDate - Birth date (ISO string or Date)
 * @param {number} userData.weight - Weight in kg
 * @param {number} userData.height - Height in cm
 * @param {string} userData.city - City name
 * @param {string} userData.district - District/area name (optional)
 * @returns {Object} Filter tags object
 * @returns {string} returns.filter_ageGroup - Age group (e.g., "20-29", "30-39")
 * @returns {string} returns.filter_weightClass - Weight class (e.g., "60-70kg", "70-80kg")
 * @returns {string} returns.filter_heightClass - Height class (e.g., "170-179cm", "180-189cm")
 * @returns {string} returns.filter_region_city - City name
 * @returns {string} returns.filter_region_district - District name (empty if not provided)
 */
export const generateFilterTags = userData => {
  if (!userData || typeof userData !== 'object') {
    return {
      filter_ageGroup: '',
      filter_weightClass: '',
      filter_heightClass: '',
      filter_region_city: '',
      filter_region_district: '',
    };
  }

  // Calculate age from birthDate
  let age = null;
  if (userData.birthDate) {
    try {
      const birthDate = new Date(userData.birthDate);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
      }
    } catch (e) {
      // Invalid date, age remains null
    }
  }

  // Generate age group filter (format: "20-29", "30-39", etc.)
  let filter_ageGroup = '';
  if (age !== null && age >= 0) {
    if (age < 20) {
      filter_ageGroup = 'under-20';
    } else if (age < 30) {
      filter_ageGroup = '20-29';
    } else if (age < 40) {
      filter_ageGroup = '30-39';
    } else if (age < 50) {
      filter_ageGroup = '40-49';
    } else if (age < 60) {
      filter_ageGroup = '50-59';
    } else if (age < 70) {
      filter_ageGroup = '60-69';
    } else {
      filter_ageGroup = '70+';
    }
  }

  // Generate weight class filter (format: "60-70kg", "70-80kg", etc.)
  let filter_weightClass = '';
  const weight = Number(userData.weight) || 0;
  if (weight > 0) {
    if (weight < 50) {
      filter_weightClass = 'under-50kg';
    } else if (weight < 60) {
      filter_weightClass = '50-60kg';
    } else if (weight < 70) {
      filter_weightClass = '60-70kg';
    } else if (weight < 80) {
      filter_weightClass = '70-80kg';
    } else if (weight < 90) {
      filter_weightClass = '80-90kg';
    } else if (weight < 100) {
      filter_weightClass = '90-100kg';
    } else if (weight < 110) {
      filter_weightClass = '100-110kg';
    } else {
      filter_weightClass = '110kg+';
    }
  }

  // Generate height class filter (format: "170-179cm", "180-189cm", etc.)
  // Using 10cm increments for height classification
  let filter_heightClass = '';
  const height = Number(userData.height) || 0;
  if (height > 0) {
    // Round down to nearest 10cm for lower bound
    const lowerBound = Math.floor(height / 10) * 10;
    const upperBound = lowerBound + 9;

    if (height < 150) {
      filter_heightClass = 'under-150cm';
    } else if (height < 200) {
      filter_heightClass = `${lowerBound}-${upperBound}cm`;
    } else {
      filter_heightClass = '200cm+';
    }
  }

  // Extract region filters
  const filter_region_city = String(userData.city || '').trim();
  const filter_region_district = String(userData.district || '').trim();

  return {
    filter_ageGroup,
    filter_weightClass,
    filter_heightClass,
    filter_region_city,
    filter_region_district,
  };
};
