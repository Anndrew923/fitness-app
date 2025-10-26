import { GoogleAuth } from '@belongnet/capacitor-google-auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

class NativeGoogleAuth {
  // 初始化 Google Auth - 增強版本
  static async initialize() {
    try {
      // 檢測 WebView 環境
      const isWebView =
        window.navigator.userAgent.includes('wv') ||
        window.navigator.userAgent.includes('WebView');

      console.log('🔍 WebView 環境檢測:', isWebView);

      await GoogleAuth.initialize({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
        // 添加 WebView 特定配置
        webClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      });

      console.log('✅ Google Auth 初始化成功');
      return true;
    } catch (error) {
      console.error('❌ Google Auth 初始化失敗:', error);
      throw error;
    }
  }

  // 執行 Google 登入 - 增強版本
  static async signIn() {
    try {
      console.log('🔄 開始原生 Google 登入...');

      // 添加超時處理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('登入超時')), 30000);
      });

      const signInPromise = GoogleAuth.signIn();

      // 使用 Promise.race 處理超時
      const result = await Promise.race([signInPromise, timeoutPromise]);

      console.log('✅ 原生 Google 登入成功:', result);

      // 驗證結果完整性
      if (!result || !result.id || !result.email) {
        throw new Error('登入結果不完整');
      }

      const firebaseUser = await this.convertToFirebaseUser(result);
      return firebaseUser;
    } catch (error) {
      console.error('❌ 原生 Google 登入失敗:', error);

      // 如果是 Bridge 通信錯誤，嘗試重試
      if (
        error.message.includes('Something went wrong') ||
        error.message.includes('androidBridge') ||
        error.message.includes('iu:')
      ) {
        console.log('🔄 檢測到 Bridge 通信錯誤，嘗試重試...');
        return await this.retrySignIn();
      }

      throw error;
    }
  }

  // 重試機制 - 新增
  static async retrySignIn(retryCount = 0) {
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      throw new Error('重試次數已達上限');
    }

    try {
      // 等待一段時間後重試
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );

      console.log(`🔄 第 ${retryCount + 1} 次重試...`);
      const result = await GoogleAuth.signIn();

      if (!result || !result.id || !result.email) {
        throw new Error('登入結果不完整');
      }

      const firebaseUser = await this.convertToFirebaseUser(result);
      return firebaseUser;
    } catch (error) {
      console.error(`❌ 第 ${retryCount + 1} 次重試失敗:`, error);

      if (retryCount < maxRetries - 1) {
        return await this.retrySignIn(retryCount + 1);
      }

      throw error;
    }
  }

  // 將 Google Auth 結果轉換為 Firebase 用戶格式
  static async convertToFirebaseUser(googleResult) {
    try {
      console.log('🔄 轉換 Google 結果為 Firebase 用戶...');

      // 創建 Firebase 用戶資料
      const userData = {
        uid: googleResult.id,
        email: googleResult.email,
        displayName: googleResult.name,
        photoURL: googleResult.imageUrl,
        emailVerified: true,
        providerData: [
          {
            providerId: 'google.com',
            uid: googleResult.id,
            email: googleResult.email,
            displayName: googleResult.name,
            photoURL: googleResult.imageUrl,
          },
        ],
      };

      console.log('✅ Firebase 用戶資料創建成功:', userData);

      // 保存到 Firestore
      await this.saveUserToFirestore(userData);

      return userData;
    } catch (error) {
      console.error('❌ 轉換 Firebase 用戶失敗:', error);
      throw error;
    }
  }

  // 保存用戶資料到 Firestore
  static async saveUserToFirestore(userData) {
    try {
      console.log('🔄 保存用戶資料到 Firestore...');

      const userRef = doc(db, 'users', userData.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // 新用戶，創建初始資料
        const initialUserData = {
          email: userData.email,
          userId: userData.uid,
          nickname: userData.displayName || userData.email.split('@')[0],
          avatarUrl: userData.photoUrl || '',
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
        console.log('✅ 新用戶資料已創建');
      } else {
        // 現有用戶，更新最後登入時間
        await setDoc(
          userRef,
          {
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('✅ 現有用戶資料已更新');
      }
    } catch (error) {
      console.error('❌ 保存用戶資料失敗:', error);
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
