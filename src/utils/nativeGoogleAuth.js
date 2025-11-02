import { GoogleAuth } from '@belongnet/capacitor-google-auth';
import { auth, db } from '../firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

class NativeGoogleAuth {
  // 初始化 - 完整修正版本
  static async initialize() {
    try {
      console.log('🔍 初始化 Capacitor Google Auth...');

      // 檢測環境
      const isWebView =
        window.navigator.userAgent.includes('wv') ||
        window.navigator.userAgent.includes('WebView');
      const isCapacitor = window.Capacitor !== undefined;

      console.log('🔍 環境檢測:', { isWebView, isCapacitor });

      // 添加調試資訊
      console.log('🔍 當前配置檢查:');
      console.log(
        '- strings.xml server_client_id: 5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com'
      );
      console.log(
        '- capacitor.config.json serverClientId: 5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com'
      );
      console.log(
        '- AndroidManifest.xml GOOGLE_SIGN_IN_CLIENT_ID: 5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com'
      );
      console.log('- 準備初始化外掛...');

      // ✅ 恢復：使用完整版本 Client ID（之前能正常登入的配置）
      await GoogleAuth.initialize({
        clientId: '5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      console.log('✅ Google Auth 初始化成功');
      return true;
    } catch (error) {
      console.error('❌ Google Auth 初始化失敗:', error);
      console.error('🔍 初始化錯誤詳情:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      // 不拋出錯誤，允許應用繼續運行
      return false;
    }
  }

  // 執行 Google 登入 - 完整修正版本
  static async signIn() {
    try {
      console.log('🔄 開始 Google 登入...');

      // 添加調試資訊
      console.log('🔍 登入前檢查:');
      console.log('- 外掛狀態: 已初始化');
      console.log(
        '- Client ID: 5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com'
      );
      console.log('- 環境: Android WebView');

      // ✅ 改進：直接調用，不使用 Promise.race（避免錯誤被吞掉）
      let result;
      try {
        result = await GoogleAuth.signIn();
        console.log('✅ Google 登入調用成功，結果:', result);
      } catch (signInError) {
        // ✅ 新增：捕獲登入調用的錯誤
        console.error('❌ GoogleAuth.signIn() 調用失敗:', signInError);
        console.error('🔍 錯誤詳情:', {
          message: signInError.message,
          code: signInError.code,
          name: signInError.name,
        });

        // ✅ 檢查是否是用戶取消
        if (
          signInError.message?.includes('cancelled') ||
          signInError.code === 'CANCELLED'
        ) {
          throw new Error('登入已取消');
        }

        throw signInError; // 重新拋出錯誤
      }

      // ✅ 檢查結果
      if (!result) {
        throw new Error('登入結果為空');
      }

      // ✅ 檢查結果是否包含錯誤
      if (result.error) {
        console.error('❌ Google 登入結果包含錯誤:', result.error);
        throw new Error(result.error.message || '登入失敗');
      }

      console.log('✅ Google 登入成功:', result);
      console.log(
        '🔍 Google 結果完整結構:',
        JSON.stringify(result, null, 2)
      );

      // 驗證結果完整性
      if (!result.id || !result.email) {
        console.error('❌ 登入結果不完整:', result);
        throw new Error('登入結果不完整：缺少 id 或 email');
      }

      const firebaseUser = await this.convertToFirebaseUser(result);
      return firebaseUser;
    } catch (error) {
      console.error('❌ Google 登入失敗:', error);

      // 詳細錯誤分析
      console.error('🔍 錯誤詳情:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      if (error.message.includes('Something went wrong')) {
        console.error('🔍 可能原因分析:');
        console.error('1. Client ID 配置不正確');
        console.error('2. Google Console 設定問題');
        console.error('3. 外掛版本相容性問題');
        console.error('4. Android WebView 權限問題');
        console.error('🔍 建議檢查:');
        console.error(
          '- Firebase Console > Authentication > Sign-in method > Google'
        );
        console.error('- Google Cloud Console > OAuth 2.0 客戶端 ID');
        console.error('- Android 應用程式簽名 (SHA-1)');
      }

      // 重試機制
      if (
        error.message.includes('Something went wrong') ||
        error.message.includes('androidBridge') ||
        error.message.includes('iu:')
      ) {
        console.log('🔄 檢測到通信錯誤，嘗試重試...');
        return await this.retrySignIn();
      }

      throw error; // ✅ 確保錯誤被拋出
    }
  }

  // 重試機制 - 增強版本
  static async retrySignIn(retryCount = 0) {
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      throw new Error('重試次數已達上限');
    }

    try {
      // 等待後重試
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );

      console.log(`🔄 第 ${retryCount + 1} 次重試...`);
      console.log(
        `🔍 重試前檢查: Client ID = 5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com`
      );

      const result = await GoogleAuth.signIn();

      if (!result || !result.id || !result.email) {
        throw new Error('登入結果不完整');
      }

      const firebaseUser = await this.convertToFirebaseUser(result);
      return firebaseUser;
    } catch (error) {
      console.error(`❌ 第 ${retryCount + 1} 次重試失敗:`, error);
      console.error(`🔍 重試錯誤詳情:`, {
        message: error.message,
        code: error.code,
        retryCount: retryCount + 1,
      });

      if (retryCount < maxRetries - 1) {
        return await this.retrySignIn(retryCount + 1);
      }

      throw error;
    }
  }

  // 轉換 Google 結果為 Firebase 用戶格式
  static async convertToFirebaseUser(googleResult) {
    try {
      console.log('🔄 轉換 Google 結果為 Firebase 用戶...');
      console.log('🔍 Google 結果:', googleResult);

      // 嘗試從不同可能的欄位獲取 idToken
      // Capacitor Google Auth 可能返回 idToken、authentication.idToken 或 serverAuthCode
      const idToken =
        googleResult.idToken ||
        googleResult.authentication?.idToken ||
        googleResult.authenticationToken ||
        (googleResult.authentication && googleResult.authentication.idToken);

      if (!idToken) {
        console.error('❌ Google 結果中未找到 idToken');
        console.error('🔍 可用欄位:', Object.keys(googleResult));
        // 如果沒有 idToken，嘗試檢查是否有 serverAuthCode（需要後端處理）
        if (googleResult.serverAuthCode) {
          console.warn(
            '⚠️ 找到 serverAuthCode，但無法直接使用，需要後端交換 idToken'
          );
          throw new Error(
            'Google 登入結果缺少 idToken。如果只有 serverAuthCode，需要後端處理。'
          );
        }
        throw new Error('Google 登入結果缺少 idToken，無法進行 Firebase 認證');
      }

      console.log('✅ 找到 idToken，開始 Firebase 認證...');

      // 創建 Firebase 認證憑證
      const credential = GoogleAuthProvider.credential(idToken);

      // 通過 Firebase Authentication 認證用戶
      const firebaseAuthResult = await signInWithCredential(auth, credential);
      const firebaseUser = firebaseAuthResult.user;

      console.log('✅ Firebase 認證成功');
      console.log('✅ Firebase 用戶 UID:', firebaseUser.uid);
      console.log('✅ Firebase 用戶 Email:', firebaseUser.email);
      console.log('✅ Firebase 用戶 Display Name:', firebaseUser.displayName);

      // 現在用戶已經通過 Firebase Auth，可以保存到 Firestore
      await this.saveUserToFirestore(firebaseUser);

      // 返回包含 email 屬性的對象，以兼容現有的 SocialLogin 調用
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        ...firebaseUser, // 保留所有 Firebase User 屬性
      };
    } catch (error) {
      console.error('❌ 轉換 Firebase 用戶失敗:', error);
      console.error('🔍 錯誤詳情:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  }

  // 保存用戶資料到 Firestore - 使用 Firebase User 對象
  static async saveUserToFirestore(firebaseUser) {
    try {
      console.log('🔄 保存用戶資料到 Firestore...');
      console.log('🔍 使用 Firebase UID:', firebaseUser.uid);
      console.log('🔍 當前認證狀態:', auth.currentUser ? '已認證' : '未認證');
      console.log('🔍 當前認證 UID:', auth.currentUser?.uid);

      // 使用 Firebase Auth 的 uid（這是 Firebase 認證後的 uid）
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // 新用戶
        const initialUserData = {
          email: firebaseUser.email,
          userId: firebaseUser.uid, // 使用 Firebase Auth 的 uid
          nickname:
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0] ||
            'User',
          avatarUrl: firebaseUser.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          gender: '',
          height: 0,
          weight: 0,
          age: 0,
          scores: {
            strength: 0,
            explosivePower: 0,
            cardio: 0,
            muscleMass: 0,
            bodyFat: 0,
          },
          history: [],
          testInputs: {},
          friends: [],
          friendRequests: [],
          blockedUsers: [],
          ladderScore: 0,
          ladderRank: 0,
          ladderHistory: [],
          isGuest: false,
          lastActive: new Date().toISOString(),
        };

        await setDoc(userRef, initialUserData);
        console.log('✅ 新用戶資料已創建到 Firestore');
      } else {
        // 現有用戶 - 更新最後活躍時間和可能更新過的用戶資訊
        await setDoc(
          userRef,
          {
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // 更新用戶資訊（如果 Google 資訊更新了）
            email: firebaseUser.email,
            nickname: firebaseUser.displayName || userSnap.data().nickname,
            avatarUrl: firebaseUser.photoURL || userSnap.data().avatarUrl,
          },
          { merge: true }
        );
        console.log('✅ 現有用戶資料已更新');
      }
    } catch (error) {
      console.error('❌ 保存用戶資料失敗:', error);
      console.error('🔍 錯誤詳情:', {
        message: error.message,
        code: error.code,
      });
      throw error;
    }
  }

  // 登出
  static async signOut() {
    try {
      console.log('🔄 開始 Google 登出...');
      await GoogleAuth.signOut();
      console.log('✅ Google 登出成功');
    } catch (error) {
      console.error('❌ Google 登出失敗:', error);
      throw error;
    }
  }

  // 檢查登入狀態
  static async checkAuthState() {
    try {
      const result = await GoogleAuth.refresh();
      return result;
    } catch (error) {
      console.log('用戶未登入或 token 已過期');
      return null;
    }
  }
}

export default NativeGoogleAuth;
