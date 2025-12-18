/**
 * Activity Tracker - Daily Login Tracking for Discipline Rank
 * Tracks cumulative login days and current streaks
 */

import logger from './logger';

/**
 * Get current date string in YYYY-MM-DD format (based on user's locale)
 * @returns {string} Current date string (YYYY-MM-DD)
 */
const getCurrentDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate the difference in days between two date strings
 * @param {string} dateStr1 - First date (YYYY-MM-DD)
 * @param {string} dateStr2 - Second date (YYYY-MM-DD)
 * @returns {number} Difference in days
 */
const getDaysDifference = (dateStr1, dateStr2) => {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Handle daily login check and update login stats
 * @param {Object} userData - Current user data object
 * @returns {Object|null} Update object with login stats, or null if no update needed
 * @returns {string} returns.lastLoginDate - Current date (YYYY-MM-DD)
 * @returns {number} returns.loginStreak - Current consecutive login streak
 * @returns {number} returns.totalLoginDays - Total cumulative login days
 */
export const handleDailyLogin = userData => {
  if (!userData || typeof userData !== 'object') {
    logger.warn('⚠️ [ActivityTracker] Invalid userData provided');
    return null;
  }

  const currentDate = getCurrentDateString();
  const lastLoginDate = userData.lastLoginDate || null;

  // Scenario A: Same Day - No update needed
  if (lastLoginDate === currentDate) {
    logger.debug(
      '✅ [ActivityTracker] Already logged in today, no update needed'
    );
    return null;
  }

  // Get current stats (default to 0 if not set)
  const currentStreak = Number(userData.stats_loginStreak) || 0;
  const currentTotal = Number(userData.stats_totalLoginDays) || 0;

  let newStreak;
  let newTotal;

  if (!lastLoginDate) {
    // First time login - Initialize
    newStreak = 1;
    newTotal = 1;
    logger.debug('🎉 [ActivityTracker] First login detected');
  } else {
    // Calculate days difference
    const daysDiff = getDaysDifference(lastLoginDate, currentDate);

    if (daysDiff === 1) {
      // Scenario B: Consecutive Day
      newStreak = currentStreak + 1;
      newTotal = currentTotal + 1;
      logger.debug(
        '🔥 [ActivityTracker] Consecutive login - Streak:',
        newStreak
      );
    } else {
      // Scenario C: Broken Streak (daysDiff > 1) or invalid date
      newStreak = 1;
      newTotal = currentTotal + 1;
      if (daysDiff > 1) {
        logger.debug(
          `⚠️ [ActivityTracker] Streak broken (${daysDiff} days gap) - Reset to 1`
        );
      } else {
        logger.debug(
          '⚠️ [ActivityTracker] Invalid date or future date - Reset streak'
        );
      }
    }
  }

  return {
    lastLoginDate: currentDate,
    stats_loginStreak: newStreak,
    stats_totalLoginDays: newTotal,
  };
};
