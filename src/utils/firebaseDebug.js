// Firebase 調試工具

import { auth, storage } from '../firebase';
import { ref, getDownloadURL, listAll } from 'firebase/storage';

/**
 * 檢查 Firebase 認證狀態
 */
export function checkAuth() {
  console.group('🔐 Firebase 認證檢查');

  if (auth.currentUser) {
    console.log('✅ 用戶已登入');
    console.log('用戶 ID:', auth.currentUser.uid);
    console.log('郵箱:', auth.currentUser.email);
    console.log(
      'Token 有效期:',
      new Date(auth.currentUser.stsTokenManager.expirationTime)
    );
  } else {
    console.error('❌ 用戶未登入');
  }

  console.groupEnd();
  return !!auth.currentUser;
}

/**
 * 檢查 Storage 連接
 */
export async function checkStorage() {
  console.group('💾 Firebase Storage 檢查');

  try {
    if (!auth.currentUser) {
      console.error('❌ 需要先登入');
      return false;
    }

    const userId = auth.currentUser.uid;
    const avatarsRef = ref(storage, `avatars/${userId}`);

    console.log('🔍 檢查用戶頭像目錄:', `avatars/${userId}`);

    const result = await listAll(avatarsRef);
    console.log('📁 找到的檔案數量:', result.items.length);

    if (result.items.length > 0) {
      console.log('📋 用戶頭像檔案列表:');
      for (const item of result.items) {
        console.log('  -', item.name);
        try {
          const url = await getDownloadURL(item);
          console.log('    URL:', url);
        } catch (error) {
          console.error('    ❌ 無法獲取 URL:', error.message);
        }
      }
    } else {
      console.log('📭 沒有找到頭像檔案');
    }

    console.groupEnd();
    return true;
  } catch (error) {
    console.error('❌ Storage 檢查失敗:', error);
    console.groupEnd();
    return false;
  }
}

/**
 * 測試頭像 URL 載入
 */
export async function testAvatarUrl(avatarUrl) {
  console.group('🖼️ 測試頭像 URL');

  try {
    console.log('URL:', avatarUrl);

    const response = await fetch(avatarUrl, {
      method: 'HEAD',
      mode: 'cors',
    });

    if (response.ok) {
      console.log('✅ 頭像載入成功');
      console.log('狀態碼:', response.status);
      console.log('內容類型:', response.headers.get('content-type'));
      console.log('檔案大小:', response.headers.get('content-length'));
    } else {
      console.error('❌ 頭像載入失敗');
      console.error('狀態碼:', response.status);
      console.error('狀態文字:', response.statusText);
    }

    console.groupEnd();
    return response.ok;
  } catch (error) {
    console.error('❌ 網路錯誤:', error.message);
    console.groupEnd();
    return false;
  }
}

/**
 * 完整的 Firebase 診斷
 */
export async function fullDiagnosis() {
  console.group('🔧 Firebase 完整診斷');

  const authOk = checkAuth();

  if (authOk) {
    await checkStorage();
  }

  console.log('\n📋 建議檢查項目:');
  console.log('1. Firebase Console > Storage > Rules 是否已更新');
  console.log('2. 等待 1-2 分鐘讓規則生效');
  console.log('3. 清除瀏覽器緩存');
  console.log('4. 確認網路連接正常');

  console.groupEnd();
}

// 將函數掛載到 window 對象，方便在控制台調用
if (typeof window !== 'undefined') {
  window.firebaseDebug = {
    checkAuth,
    checkStorage,
    testAvatarUrl,
    fullDiagnosis,
  };

  console.log('🔧 Firebase 調試工具已載入');
  console.log('在控制台輸入 firebaseDebug.fullDiagnosis() 開始診斷');
}
