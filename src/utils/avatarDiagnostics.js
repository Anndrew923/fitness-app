// 頭像診斷工具 - 幫助診斷頭像載入問題

/**
 * 診斷頭像載入問題
 * @param {string} avatarUrl - 頭像 URL
 * @param {string} userId - 用戶 ID
 */
export async function diagnoseAvatarIssue(avatarUrl, userId) {
  console.group('🔍 頭像載入診斷');

  try {
    console.log('用戶 ID:', userId);
    console.log('頭像 URL:', avatarUrl);

    if (!avatarUrl) {
      console.warn('❌ 頭像 URL 為空');
      return { success: false, reason: 'URL為空' };
    }

    // 檢查 URL 格式
    if (!avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
      console.warn('❌ 無效的 URL 格式:', avatarUrl);
      return { success: false, reason: 'URL格式無效' };
    }

    // 檢查是否為 Firebase Storage URL
    if (avatarUrl.includes('firebasestorage.googleapis.com')) {
      console.log('🔥 Firebase Storage URL 檢測');

      // 檢查 URL 是否包含必要的參數
      if (!avatarUrl.includes('token=') && !avatarUrl.includes('alt=media')) {
        console.warn('⚠️ Firebase Storage URL 可能缺少必要的存取令牌');
      }

      // 嘗試獲取頭像
      try {
        const response = await fetch(avatarUrl, {
          method: 'HEAD',
          mode: 'cors',
        });

        if (response.ok) {
          console.log('✅ 頭像可以成功載入');
          return { success: true, reason: '載入成功' };
        } else {
          console.error('❌ 頭像載入失敗，狀態碼:', response.status);
          return {
            success: false,
            reason: `HTTP ${response.status}`,
            details: response.statusText,
          };
        }
      } catch (fetchError) {
        console.error('❌ 頭像載入錯誤:', fetchError.message);
        return {
          success: false,
          reason: '網路錯誤',
          details: fetchError.message,
        };
      }
    } else {
      console.log('📁 本地或其他 URL');
      return { success: true, reason: '本地資源' };
    }
  } catch (error) {
    console.error('❌ 診斷過程出錯:', error);
    return {
      success: false,
      reason: '診斷錯誤',
      details: error.message,
    };
  } finally {
    console.groupEnd();
  }
}

/**
 * 批量診斷多個頭像
 * @param {Array} avatars - 頭像列表 [{url, userId}]
 */
export async function batchDiagnoseAvatars(avatars) {
  console.group('🔍 批量頭像診斷');

  const results = [];

  for (const avatar of avatars) {
    const result = await diagnoseAvatarIssue(avatar.url, avatar.userId);
    results.push({
      ...avatar,
      ...result,
    });
  }

  console.table(results);
  console.groupEnd();

  return results;
}

/**
 * 檢查 Firebase Storage 規則配置
 */
export function checkFirebaseStorageRules() {
  console.group('🔧 Firebase Storage 規則檢查');

  console.log('請確認 Firebase Console 中的 Storage 規則包含以下內容：');
  console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`);

  console.log('如果規則不正確，請到 Firebase Console > Storage > Rules 更新');
  console.groupEnd();
}

/**
 * 檢查當前用戶的認證狀態
 */
export function checkAuthStatus() {
  console.group('🔐 認證狀態檢查');

  try {
    const auth = window.firebase?.auth?.currentUser;
    if (auth) {
      console.log('✅ 用戶已登入');
      console.log('用戶 ID:', auth.uid);
      console.log('郵箱:', auth.email);
    } else {
      console.warn('❌ 用戶未登入或認證失敗');
    }
  } catch (error) {
    console.error('❌ 無法檢查認證狀態:', error);
  }

  console.groupEnd();
}
