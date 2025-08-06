// 頭像工具函數 - 統一處理頭像載入和錯誤處理

/**
 * 獲取用戶頭像 URL，提供備用選項
 * @param {string} avatarUrl - 用戶的頭像 URL
 * @param {boolean} isGuest - 是否為訪客模式
 * @param {boolean} isAnonymous - 是否為匿名用戶
 * @returns {string} 處理後的頭像 URL
 */
export function getAvatarUrl(avatarUrl, isGuest = false, isAnonymous = false) {
  if (isGuest) {
    return '/guest-avatar.svg';
  }

  if (isAnonymous) {
    return '/default-avatar.svg';
  }

  return avatarUrl && avatarUrl.trim() !== ''
    ? avatarUrl
    : '/default-avatar.svg';
}

/**
 * 處理頭像載入錯誤的統一函數
 * @param {Event} e - 錯誤事件
 */
export function handleAvatarError(e) {
  const originalSrc = e.target.src;
  console.group('🔍 頭像載入失敗分析');
  console.log('原始 URL:', originalSrc);
  console.log('錯誤時間:', new Date().toISOString());

  if (originalSrc.includes('firebasestorage.googleapis.com')) {
    console.log('🔥 Firebase Storage URL 載入失敗');
    console.log('可能原因: Storage 安全規則限制、認證問題、或檔案不存在');
  }

  console.log('🔄 切換到預設頭像');
  console.groupEnd();

  e.target.src = '/default-avatar.svg';

  // 防止無限循環
  e.target.onerror = null;
}

/**
 * 檢查頭像 URL 是否有效
 * @param {string} avatarUrl - 頭像 URL
 * @returns {boolean} 是否有效
 */
export function isValidAvatarUrl(avatarUrl) {
  return (
    avatarUrl &&
    typeof avatarUrl === 'string' &&
    avatarUrl.trim() !== '' &&
    !avatarUrl.includes('undefined') &&
    !avatarUrl.includes('null')
  );
}

/**
 * 清理無效的頭像 URL
 * @param {string} avatarUrl - 頭像 URL
 * @returns {string} 清理後的 URL 或空字符串
 */
export function sanitizeAvatarUrl(avatarUrl) {
  if (!isValidAvatarUrl(avatarUrl)) {
    return '';
  }
  return avatarUrl.trim();
}
