/**
 * 留言數量限制工具類
 * 提供留言數量限制、自動清理和通知功能
 */

// 留言數量限制配置
export const COMMENT_LIMITS = {
  // 單一貼文留言上限
  SINGLE_POST_MAX: 500,
  // 留言板總留言上限（如果實作留言板功能）
  MESSAGE_BOARD_MAX: 1000,
  // 接近限制的警告閾值（90%）
  WARNING_THRESHOLD: 0.9,
  // 自動清理時保留的留言數量
  AUTO_CLEANUP_KEEP: 50,
};

/**
 * 檢查留言數量是否超過限制
 * @param {Array} comments - 留言陣列
 * @param {string} type - 限制類型 ('post' | 'board')
 * @returns {Object} 檢查結果
 */
export function checkCommentLimit(comments, type = 'post') {
  const maxLimit =
    type === 'post'
      ? COMMENT_LIMITS.SINGLE_POST_MAX
      : COMMENT_LIMITS.MESSAGE_BOARD_MAX;
  const currentCount = comments ? comments.length : 0;
  const warningThreshold = Math.floor(
    maxLimit * COMMENT_LIMITS.WARNING_THRESHOLD
  );

  return {
    currentCount,
    maxLimit,
    isAtLimit: currentCount >= maxLimit,
    isNearLimit: currentCount >= warningThreshold,
    remainingSlots: Math.max(0, maxLimit - currentCount),
    warningThreshold,
  };
}

/**
 * 自動清理舊留言
 * @param {Array} comments - 留言陣列
 * @param {string} type - 限制類型 ('post' | 'board')
 * @returns {Object} 清理結果
 */
export function autoCleanupComments(comments, type = 'post') {
  if (!comments || comments.length === 0) {
    return { cleanedComments: [], removedCount: 0 };
  }

  const maxLimit =
    type === 'post'
      ? COMMENT_LIMITS.SINGLE_POST_MAX
      : COMMENT_LIMITS.MESSAGE_BOARD_MAX;

  // 如果留言數量未超過限制，不需要清理
  if (comments.length <= maxLimit) {
    return { cleanedComments: comments, removedCount: 0 };
  }

  // 按時間戳排序（最新的在前）
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // 保留最新的留言，刪除最舊的
  const keepCount = Math.min(COMMENT_LIMITS.AUTO_CLEANUP_KEEP, maxLimit);
  const cleanedComments = sortedComments.slice(0, keepCount);
  const removedCount = comments.length - cleanedComments.length;

  console.log(
    `🧹 自動清理留言: 原始 ${comments.length} 條，保留 ${cleanedComments.length} 條，刪除 ${removedCount} 條`
  );

  return {
    cleanedComments,
    removedCount,
    removedComments: sortedComments.slice(keepCount),
  };
}

/**
 * 生成留言限制通知訊息
 * @param {Object} limitInfo - 限制檢查結果
 * @param {string} type - 限制類型 ('post' | 'board')
 * @returns {string|null} 通知訊息
 */
export function generateLimitNotification(limitInfo, type = 'post') {
  const { currentCount, maxLimit, isAtLimit, isNearLimit, remainingSlots } =
    limitInfo;

  if (isAtLimit) {
    const typeText = type === 'post' ? '貼文' : '留言板';
    return `⚠️ ${typeText}留言數量已達上限 (${currentCount}/${maxLimit})，無法再添加新留言`;
  }

  if (isNearLimit) {
    const typeText = type === 'post' ? '貼文' : '留言板';
    return `⚠️ ${typeText}留言數量接近上限 (${currentCount}/${maxLimit})，僅剩 ${remainingSlots} 個名額`;
  }

  return null;
}

/**
 * 驗證留言是否可以添加
 * @param {Array} currentComments - 當前留言陣列
 * @param {string} type - 限制類型 ('post' | 'board')
 * @returns {Object} 驗證結果
 */
export function validateCommentAddition(currentComments, type = 'post') {
  const limitInfo = checkCommentLimit(currentComments, type);

  return {
    canAdd: !limitInfo.isAtLimit,
    limitInfo,
    notification: generateLimitNotification(limitInfo, type),
  };
}

/**
 * 處理留言添加前的限制檢查和清理
 * @param {Array} currentComments - 當前留言陣列
 * @param {Object} newComment - 新留言物件
 * @param {string} type - 限制類型 ('post' | 'board')
 * @returns {Object} 處理結果
 */
export function processCommentAddition(
  currentComments,
  newComment,
  type = 'post'
) {
  // 先檢查是否可以添加
  const validation = validateCommentAddition(currentComments, type);

  if (!validation.canAdd) {
    return {
      success: false,
      error: 'COMMENT_LIMIT_EXCEEDED',
      message: validation.notification,
      limitInfo: validation.limitInfo,
    };
  }

  // 添加新留言
  const updatedComments = [...(currentComments || []), newComment];

  // 檢查是否需要自動清理
  const cleanupResult = autoCleanupComments(updatedComments, type);

  return {
    success: true,
    comments: cleanupResult.cleanedComments,
    wasAutoCleaned: cleanupResult.removedCount > 0,
    removedCount: cleanupResult.removedCount,
    notification:
      cleanupResult.removedCount > 0
        ? `🧹 已自動清理 ${cleanupResult.removedCount} 條舊留言，保留最新 ${cleanupResult.cleanedComments.length} 條`
        : null,
    limitInfo: checkCommentLimit(cleanupResult.cleanedComments, type),
  };
}

/**
 * 獲取留言統計資訊
 * @param {Array} comments - 留言陣列
 * @param {string} type - 限制類型 ('post' | 'board')
 * @returns {Object} 統計資訊
 */
export function getCommentStats(comments, type = 'post') {
  const limitInfo = checkCommentLimit(comments, type);
  const maxLimit =
    type === 'post'
      ? COMMENT_LIMITS.SINGLE_POST_MAX
      : COMMENT_LIMITS.MESSAGE_BOARD_MAX;

  return {
    current: limitInfo.currentCount,
    max: maxLimit,
    percentage: Math.round((limitInfo.currentCount / maxLimit) * 100),
    remaining: limitInfo.remainingSlots,
    isNearLimit: limitInfo.isNearLimit,
    isAtLimit: limitInfo.isAtLimit,
    status: limitInfo.isAtLimit
      ? 'full'
      : limitInfo.isNearLimit
      ? 'warning'
      : 'normal',
  };
}

export default {
  COMMENT_LIMITS,
  checkCommentLimit,
  autoCleanupComments,
  generateLimitNotification,
  validateCommentAddition,
  processCommentAddition,
  getCommentStats,
};
