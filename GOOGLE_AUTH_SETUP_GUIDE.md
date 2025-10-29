# Google 登入功能建構指南

## 📋 目的

本指南提供完整的 Google 登入功能建構步驟，確保從零開始一次到位完成整合。

---

## 🔑 核心概念（必讀）

### 關鍵理解

**⚠️ 最重要的概念：Google 登入成功 ≠ Firebase 認證成功**

流程必須是：

```
Google 登入 → 獲取 idToken → Firebase 認證 → auth.currentUser 設置 → Firestore 寫入
```

如果跳過 Firebase 認證步驟，會導致：

- ❌ Firestore "Missing or insufficient permissions" 錯誤
- ❌ `request.auth` 為 `null`
- ❌ 無法通過 Firestore 安全規則

### Firestore 安全規則要求

**⚠️ 關鍵理解：Firestore 安全規則依賴 `request.auth`**

Firestore 安全規則必須正確配置：

```javascript
match /users/{userId} {
  allow create, update, delete: if isOwner(userId)
    && request.resource.data.userId == userId;
}

function isOwner(uid) {
  return signedIn() && request.auth.uid == uid;
}

function signedIn() {
  return request.auth != null;  // ⚠️ 必須存在
}
```

**為什麼必須通過 Firebase Authentication：**

- Firestore 安全規則中的 `request.auth` 只有在通過 Firebase Authentication 後才會設置
- 只有 Google 登入（Capacitor）並不會設置 `request.auth`
- 必須使用 `signInWithCredential` 才能讓 `request.auth` 有值

---

## 📦 第一步：安裝依賴

### Capacitor Google Auth 插件

```bash
npm install @belongnet/capacitor-google-auth
```

**⚠️ 版本說明：**

- `@belongnet/capacitor-google-auth: ^6.0.0-rc.0` 是 RC（Release Candidate）版本
- 雖然是 RC，但這是目前最穩定的 Capacitor 6 兼容版本
- 如果遇到問題，可以嘗試更新到最新版本
- 需要 Capacitor 6.0.0 或更高版本

**版本升級時注意事項：**

- ⚠️ 升級 `@belongnet/capacitor-google-auth` 後，檢查是否有配置變更
- ⚠️ 升級 Capacitor 版本後，確認插件兼容性
- ⚠️ 升級 Firebase SDK 後，檢查 API 變更（特別是 `signInWithCredential` 的使用方式）
- ⚠️ 升級後務必清除快取並重新測試
- ⚠️ 建議在測試環境先驗證升級後的版本，再應用到生產環境

### Firebase Auth（已在專案中）

確保已安裝：

```bash
npm install firebase
```

### Firebase Console 配置檢查

在開始之前，確認 Firebase Console 中：

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 選擇您的專案
3. 前往 **Authentication** → **Sign-in method**
4. 確認 **Google** 已啟用
5. 確認已配置正確的 Web Client ID

---

## 🔧 第二步：配置文件設置

### 0. 獲取 `google-services.json` 檔案

**如何獲取 `google-services.json`：**

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 選擇您的專案
3. 點擊左側 ⚙️ **Project Settings**（專案設定）
4. 向下滾動到「您的應用程式」區塊
5. 找到 Android 應用（或點擊「新增應用」→ Android 來建立）
6. 下載 **google-services.json** 檔案
7. 將檔案放到 `android/app/` 目錄（覆蓋現有檔案）

**⚠️ 重要：** 這個檔案包含了所有 Firebase 配置，包括：

- API Key
- Client ID（Android 和 Web）
- OAuth 配置
- 其他 Firebase 服務配置

### 1. 找到正確的 Client ID

在下載的 `android/app/google-services.json` 中查找：

```json
{
  "services": {
    "appinvite_service": {
      "other_platform_oauth_client": [
        {
          "client_id": "YOUR-WEB-CLIENT-ID.apps.googleusercontent.com",
          "client_type": 3 // ← 這是 Web Client ID（必須使用）
        }
      ]
    }
  }
}
```

**⚠️ 關鍵：必須使用 Web Client ID（client_type: 3），不是 Android Client ID（client_type: 1）**

---

### 2. android/app/src/main/AndroidManifest.xml

```xml
<application>
    <!-- Google Auth 配置 -->
    <meta-data
        android:name="com.google.android.gms.version"
        android:value="@integer/google_play_services_version" />

    <!-- ⚠️ 關鍵：使用 Web Client ID -->
    <meta-data
        android:name="com.google.android.gms.auth.GOOGLE_SIGN_IN_CLIENT_ID"
        android:value="YOUR-WEB-CLIENT-ID.apps.googleusercontent.com" />
</application>

<!-- 必要的權限 -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.GET_ACCOUNTS" />
<uses-permission android:name="android.permission.USE_CREDENTIALS" />
```

---

### 3. android/app/src/main/res/values/strings.xml

```xml
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <!-- ⚠️ 關鍵：必須使用 Web Client ID -->
    <string name="server_client_id">YOUR-WEB-CLIENT-ID.apps.googleusercontent.com</string>
</resources>
```

---

### 4. capacitor.config.json

```json
{
  "appId": "YOUR_APP_ID",
  "plugins": {
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "YOUR-WEB-CLIENT-ID.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  }
}
```

---

### 5. android/app/build.gradle

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'  // 必須添加

dependencies {
    // Google Play Services Auth
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

---

### 6. android/build.gradle (Project-level)

⚠️ **關鍵：Project-level 的 build.gradle 必須包含 google-services classpath**

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.7.2'
        classpath 'com.google.gms:google-services:4.4.2'  // ⚠️ 必須添加
    }
}
```

---

### 7. 配置 SHA-1 指紋（必須完成）

**⚠️ 關鍵：Google Auth 需要 SHA-1 指紋來驗證應用程式身份**

#### 步驟 1: 獲取 SHA-1 指紋

**方法 1: 使用 keytool（推薦）**

```bash
# Windows (Command Prompt，不是 PowerShell)
keytool -list -v -keystore android.keystore -alias YOUR_KEY_ALIAS

# 或指定完整路徑
keytool -list -v -keystore "C:\path\to\your\keystore\file.jks" -alias YOUR_KEY_ALIAS
```

**方法 2: 使用 Gradle**

```bash
cd android
gradlew signingReport
# 在輸出中查找 "SHA1:" 後面的值
```

**方法 3: 從 Google Play Console（如果應用已上傳）**

1. 前往 [Google Play Console](https://play.google.com/console)
2. 選擇您的應用程式
3. 前往 **發布** → **應用程式簽名**
4. 在「應用程式簽名金鑰憑證」區塊中複製 **SHA-1 憑證指紋**

#### 步驟 2: 添加到 Firebase Console

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 選擇您的專案
3. 點擊 ⚙️ **Project Settings**（專案設定）
4. 在 **General** 標籤中找到 **Your apps** 區塊
5. 找到您的 Android 應用程式
6. 在 **SHA certificate fingerprints** 區塊中：
   - 點擊 **Add fingerprint**
   - 輸入 SHA-1 指紋（格式：`XX:XX:XX:XX:XX:...`，每兩個字符用冒號分隔）
   - 點擊 **Save**

**⚠️ 重要：** 如果有多個簽名金鑰（debug、release），必須添加所有 SHA-1 指紋。

#### 步驟 3: 下載更新的 google-services.json

1. 在 Firebase Console 的 **Project Settings** 頁面
2. 找到您的 Android 應用
3. 點擊 **Download google-services.json**
4. 替換 `android/app/google-services.json` 檔案

#### 步驟 4: 驗證 google-services.json

確認檔案中的 `certificate_hash` 與您的 SHA-1 指紋匹配：

```json
{
  "oauth_client": [
    {
      "android_info": {
        "certificate_hash": "YOUR-SHA1-FINGERPRINT" // 應該與您的 SHA-1 一致
      }
    }
  ]
}
```

**⚠️ 如果 SHA-1 不匹配，Google 登入會失敗！**

---

## 🔄 第二步半：同步到 Android

完成所有配置後，必須同步到 Android：

```bash
# 建置 Web 版本
npm run build

# 同步到 Android（這會將所有配置和 Web 資源複製到 Android 專案）
npx cap sync android
```

**⚠️ 重要：每次修改配置文件後都必須執行 `npx cap sync android`**

---

### ⚠️ 極度重要：清除快取

**如果修改配置後問題依然存在，必須清除所有快取：**

```bash
# 清除所有快取
# Windows
rmdir /s /q node_modules\.vite
rmdir /s /q dist
cd android
call gradlew clean
rmdir /s /q app\build
rmdir /s /q .gradle
cd ..

# 重新建置
npm run build
npx cap sync android
```

**或者使用提供的完整清除建置腳本：**

```bash
# 如果有 build-clean-complete.bat
build-clean-complete.bat
```

**為什麼需要清除快取：**

- ✅ Vite 快取可能保留舊配置
- ✅ Gradle 快取可能保留舊的資源
- ✅ Android 資產快取可能未更新
- ✅ **這些快取會導致配置修改不生效，即使執行了 `npx cap sync android`**

**建議：在以下情況清除快取：**

- 修改了 `capacitor.config.json`
- 修改了 `AndroidManifest.xml`
- 修改了 `strings.xml`
- 更新了 `google-services.json`
- 遇到 "Something went wrong" 錯誤且已確認配置正確

---

## 💻 第三步：實現核心代碼

### src/utils/nativeGoogleAuth.js

**完整的實現：**

```javascript
import { GoogleAuth } from '@belongnet/capacitor-google-auth';
import { auth, db } from '../firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth'; // ⚠️ 必須導入
import { doc, setDoc, getDoc } from 'firebase/firestore';

class NativeGoogleAuth {
  // 初始化
  static async initialize() {
    try {
      console.log('🔍 初始化 Capacitor Google Auth...');

      // ⚠️ 環境檢測
      const isWebView =
        window.navigator.userAgent.includes('wv') ||
        window.navigator.userAgent.includes('WebView');
      const isCapacitor = window.Capacitor !== undefined;

      console.log('🔍 環境檢測:', { isWebView, isCapacitor });

      // ⚠️ 配置檢查日誌（用於調試）
      console.log('🔍 當前配置檢查:');
      console.log(
        '- strings.xml server_client_id: YOUR-WEB-CLIENT-ID.apps.googleusercontent.com'
      );
      console.log(
        '- capacitor.config.json serverClientId: YOUR-WEB-CLIENT-ID.apps.googleusercontent.com'
      );
      console.log(
        '- AndroidManifest.xml GOOGLE_SIGN_IN_CLIENT_ID: YOUR-WEB-CLIENT-ID.apps.googleusercontent.com'
      );
      console.log('- 準備初始化外掛...');

      // ⚠️ 使用 Web Client ID
      await GoogleAuth.initialize({
        clientId: 'YOUR-WEB-CLIENT-ID.apps.googleusercontent.com',
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
      // ⚠️ 不拋出錯誤，允許應用繼續運行
      return false;
    }
  }

  // 執行登入
  static async signIn() {
    try {
      console.log('🔄 開始 Google 登入...');

      // 添加調試資訊
      console.log('🔍 登入前檢查:');
      console.log('- 外掛狀態: 已初始化');
      console.log('- Client ID: YOUR-WEB-CLIENT-ID.apps.googleusercontent.com');
      console.log('- 環境: Android WebView');

      // ⚠️ 添加超時處理（30秒）
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('登入超時')), 30000);
      });

      const signInPromise = GoogleAuth.signIn();
      const result = await Promise.race([signInPromise, timeoutPromise]);

      console.log('✅ Google 登入成功:', result);
      console.log('🔍 Google 結果完整結構:', JSON.stringify(result, null, 2));

      // ⚠️ 驗證結果完整性
      if (!result || !result.id || !result.email) {
        throw new Error('登入結果不完整');
      }

      // 2. 轉換為 Firebase 用戶（⚠️ 關鍵步驟）
      const firebaseUser = await this.convertToFirebaseUser(result);

      return firebaseUser;
    } catch (error) {
      console.error('❌ Google 登入失敗:', error);
      console.error('🔍 錯誤詳情:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      // ⚠️ 詳細錯誤分析（用於診斷問題）
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

      // ⚠️ 重試機制（處理通信錯誤）
      if (
        error.message.includes('Something went wrong') ||
        error.message.includes('androidBridge') ||
        error.message.includes('iu:')
      ) {
        console.log('🔄 檢測到通信錯誤，嘗試重試...');
        return await this.retrySignIn();
      }

      throw error;
    }
  }

  // ⚠️ 重試機制（新增）
  static async retrySignIn(retryCount = 0) {
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      throw new Error('重試次數已達上限');
    }

    try {
      // 等待後重試（遞增延遲：1秒、2秒、3秒）
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );

      console.log(`🔄 第 ${retryCount + 1} 次重試...`);
      console.log(
        `🔍 重試前檢查: Client ID = YOUR-WEB-CLIENT-ID.apps.googleusercontent.com`
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

  // ⚠️ 最關鍵的方法：轉換 Google 結果為 Firebase 用戶
  static async convertToFirebaseUser(googleResult) {
    try {
      console.log('🔄 轉換 Google 結果為 Firebase 用戶...');

      // 步驟 1: 提取 idToken（嘗試多種可能的欄位名）
      const idToken =
        googleResult.idToken ||
        googleResult.authentication?.idToken ||
        googleResult.authenticationToken ||
        (googleResult.authentication && googleResult.authentication.idToken);

      if (!idToken) {
        console.error('❌ Google 結果中未找到 idToken');
        console.error('🔍 可用欄位:', Object.keys(googleResult));

        // ⚠️ 檢查是否有 serverAuthCode（需要後端處理）
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

      // 步驟 2: 創建 Firebase 認證憑證
      const credential = GoogleAuthProvider.credential(idToken);

      // 步驟 3: ⚠️ 關鍵：通過 Firebase Authentication 認證用戶
      const firebaseAuthResult = await signInWithCredential(auth, credential);
      const firebaseUser = firebaseAuthResult.user;

      console.log('✅ Firebase 認證成功');
      console.log('✅ Firebase 用戶 UID:', firebaseUser.uid);

      // 步驟 4: 現在 auth.currentUser 已設置，可以保存到 Firestore
      await this.saveUserToFirestore(firebaseUser);

      // 步驟 5: 返回兼容對象
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        ...firebaseUser,
      };
    } catch (error) {
      console.error('❌ 轉換 Firebase 用戶失敗:', error);
      throw error;
    }
  }

  // 保存用戶資料到 Firestore
  static async saveUserToFirestore(firebaseUser) {
    try {
      console.log('🔄 保存用戶資料到 Firestore...');
      console.log('🔍 使用 Firebase UID:', firebaseUser.uid);
      console.log('🔍 當前認證狀態:', auth.currentUser ? '已認證' : '未認證');
      console.log('🔍 當前認證 UID:', auth.currentUser?.uid);

      // ⚠️ 使用 Firebase Auth 的 uid（不是 Google ID）
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // 新用戶
        const initialUserData = {
          email: firebaseUser.email,
          userId: firebaseUser.uid, // Firebase UID
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

  // 登出（可選）
  static async signOut() {
    try {
      console.log('🔄 開始 Google 登出...');
      await GoogleAuth.signOut();
      // 如果需要在登出時也登出 Firebase，取消下面的註解：
      // await auth.signOut();
      console.log('✅ Google 登出成功');
    } catch (error) {
      console.error('❌ Google 登出失敗:', error);
      throw error;
    }
  }

  // 檢查登入狀態（可選）
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
```

---

## 🔄 Token 刷新與認證狀態管理

### checkAuthState() 使用場景

**何時使用：**

1. **應用啟動時檢查登入狀態**

   ```javascript
   // 在 App.jsx 或類似的根組件中
   import { useEffect } from 'react';
   import NativeGoogleAuth from './utils/nativeGoogleAuth';

   useEffect(() => {
     const checkGoogleAuth = async () => {
       const googleAuth = await NativeGoogleAuth.checkAuthState();
       if (googleAuth) {
         // Google 已登入，嘗試刷新 token
         console.log('Google Auth 狀態有效');
       } else {
         // Google 未登入或 token 已過期
         console.log('Google Auth 需要重新登入');
       }
     };
     checkGoogleAuth();
   }, []);
   ```

2. **在重要操作前驗證 token**

   - 訪問需要認證的 API 前
   - 保存重要資料到 Firestore 前

3. **實現自動登入**
   - 如果 `checkAuthState()` 返回有效結果
   - 可以使用返回的結果進行 Firebase 認證

**⚠️ 注意：**

- `checkAuthState()` 只檢查 Google Auth 的狀態
- 不能替代 Firebase Auth 的狀態檢查
- 如果 Google token 有效但 Firebase 認證已過期，仍需要重新登入

### 登出流程說明

**Google Auth 登出：**

```javascript
// 登出 Google Auth
await GoogleAuth.signOut();
```

**Firebase Auth 登出：**

```javascript
// 登出 Firebase Auth（會清除 Firestore 訪問權限）
await auth.signOut();
```

**完整登出流程：**

1. 登出 Google Auth（清除 Google 認證狀態）
2. 登出 Firebase Auth（清除 Firebase 認證狀態）
3. 清除本地緩存的用戶資料（可選）
4. 導航到登入頁面（可選）

**建議實現：**

```javascript
// 在 nativeGoogleAuth.js 中
static async signOut() {
  try {
    console.log('🔄 開始登出流程...');

    // 1. 登出 Google Auth
    await GoogleAuth.signOut();
    console.log('✅ Google Auth 已登出');

    // 2. 登出 Firebase Auth（重要：確保 Firestore 無法訪問）
    await auth.signOut();
    console.log('✅ Firebase Auth 已登出');

    // 3. 清除本地緩存（如果需要）
    // localStorage.clear();
    // sessionStorage.clear();

    console.log('✅ 登出成功');
    return true;
  } catch (error) {
    console.error('❌ 登出失敗:', error);
    throw error;
  }
}
```

**⚠️ 重要注意事項：**

- **只登出 Google Auth**：Firebase 認證狀態仍然存在，用戶仍可訪問 Firestore（如果之前已認證）
- **只登出 Firebase Auth**：Google Auth 狀態仍然存在，但無法訪問 Firestore
- **建議同時登出兩者**：保持認證狀態一致，確保用戶完全登出
- **登出後處理**：清除本地用戶資料、導航到登入頁面、重置應用狀態

**使用範例：**

```javascript
// 在組件中調用
const handleLogout = async () => {
  try {
    await NativeGoogleAuth.signOut();
    // 清除本地狀態
    setUser(null);
    // 導航到登入頁面
    navigate('/login');
  } catch (error) {
    console.error('登出失敗:', error);
  }
};
```

---

### Firebase 認證狀態監聽

**最佳實踐：** 在應用的根組件中監聽 Firebase 認證狀態

```javascript
import { useEffect } from 'react';
import { auth } from './firebase';

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async user => {
    if (user) {
      // 用戶已登入（包括 Google 登入後的 Firebase 認證）
      console.log('Firebase 認證狀態：已登入', user.email);
      // 載入用戶資料
    } else {
      // 用戶未登入
      console.log('Firebase 認證狀態：未登入');
      // 清除本地資料
    }
  });

  return () => {
    unsubscribe(); // 清理監聽器
  };
}, []);
```

**為什麼需要雙重檢查：**

- **Google Auth：** 原生層的 Google 登入狀態
- **Firebase Auth：** 應用層的認證狀態（用於 Firestore 訪問）
- 兩者應該同步，但不總是如此

### Email 驗證狀態

**Google 登入的帳號特點：**

- ✅ Google 登入後，Firebase 會自動設置 `emailVerified: true`
- ✅ 不需要額外的電子郵件驗證步驟
- ✅ 可以直接使用需要驗證的功能

**檢查方式：**

```javascript
// 在 convertToFirebaseUser 或保存用戶資料時
if (firebaseUser.emailVerified) {
  // Google 登入的帳號始終為 true
  console.log('✅ 電子郵件已驗證（Google 登入）');
}
```

**與電子郵件/密碼註冊的區別：**

- **電子郵件/密碼註冊**：需要發送驗證郵件，`emailVerified` 初始為 `false`，需要用戶點擊驗證連結
- **Google 登入**：`emailVerified` 自動為 `true`，因為 Google 已經驗證了用戶的電子郵件

**在 Firestore 中使用：**

```javascript
// 可以在安全規則中檢查 emailVerified
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null
    && request.auth.uid == userId
    && request.auth.token.email_verified == true; // Google 登入用戶為 true
}
```

---

### grantOfflineAccess 和 Refresh Token 的作用

**grantOfflineAccess: true 的作用：**

- 啟用此選項後，Google Auth 可能會返回 `serverAuthCode`
- `serverAuthCode` 可以用於後端交換 refresh token
- Refresh token 可以用於長期離線訪問（無需重新登入）

**⚠️ 重要理解：**

- `serverAuthCode` **不能直接用於 Firebase 認證**
- 需要後端使用 Google OAuth API 將 `serverAuthCode` 交換為 `idToken` 或 `refreshToken`
- 如果只需要完成登入（不需要後端操作），`grantOfflineAccess: true` 不是必須的

**實際使用場景：**

- ✅ **僅前端登入**：不需要 `grantOfflineAccess`，使用 `idToken` 即可完成 Firebase 認證
- ✅ **需要後端 API 訪問**：啟用 `grantOfflineAccess`，後端處理 `serverAuthCode` 以獲取長期 access token

**當前實現中的處理：**

```javascript
// 在 convertToFirebaseUser 方法中
if (googleResult.serverAuthCode) {
  console.warn('⚠️ 找到 serverAuthCode，但無法直接使用，需要後端交換 idToken');
  // 如果有 serverAuthCode 但沒有 idToken，無法進行 Firebase 認證
}
```

**建議：**

- 如果應用只需要前端登入功能，可以將 `grantOfflineAccess` 設為 `false`
- 如果需要後端 API 訪問，保留 `grantOfflineAccess: true`，並在後端實現 `serverAuthCode` 交換邏輯

---

## 🔐 環境變數與配置管理

### .env 文件的正確使用

**開發環境：**

- 使用 `.env` 或 `.env.local`（會被 gitignore 忽略）
- 可以包含測試用的 Client ID

**生產環境：**

- 必須在 CI/CD 或構建系統中設置環境變數
- 不要將生產環境的 `.env` 提交到版本控制

**⚠️ 安全建議：**

1. ✅ 在 `.gitignore` 中確保 `.env` 被忽略

   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

2. ✅ 使用 `.env.example` 作為模板

   ```bash
   # 創建模板文件
   cp .env .env.example
   # 然後移除敏感信息
   ```

3. ✅ 不要在代碼中硬編碼敏感的 Client ID

   - ❌ 錯誤：直接在代碼中寫 `clientId: '5144099869-xxx'`
   - ✅ 正確：使用環境變數或配置文件

4. ✅ 生產環境使用環境變數，而不是 `.env` 文件
   - 在構建系統中設置環境變數
   - 使用 CI/CD 的環境變數管理

### Firebase 配置的環境區分

**開發環境：**

- 可以使用 `defaultConfig` 作為 fallback
- 方便快速開發和測試

**生產環境：**

- 建議嚴格檢查環境變數
- 如果缺少必要變數，應該拋出錯誤
- 不要在生產環境使用 `defaultConfig`

**檢查清單：**

- [ ] `.env` 在 `.gitignore` 中
- [ ] 有 `.env.example` 模板文件
- [ ] 生產環境的環境變數在安全的地方配置
- [ ] 沒有將敏感的 Client ID 硬編碼在代碼中
- [ ] Firebase 配置區分開發和生產環境

### 生產環境的日誌控制

**問題：** 生產環境中不應該輸出過多調試日誌（console.log）

**解決方案 1：使用環境變數控制日誌級別**

```javascript
// 在 nativeGoogleAuth.js 開頭
const isDevelopment = import.meta.env.MODE === 'development';

// 創建條件日誌函數
const debugLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

const debugError = (...args) => {
  if (isDevelopment) {
    console.error(...args);
  } else {
    // 生產環境只記錄關鍵錯誤
    console.error(...args); // 或發送到錯誤追蹤服務
  }
};

// 使用範例
debugLog('🔍 初始化 Capacitor Google Auth...'); // 開發環境顯示，生產環境隱藏
debugError('❌ Google Auth 初始化失敗:', error); // 兩者都顯示
```

**解決方案 2：分類日誌級別**

```javascript
const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = isDevelopment ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR;

const log = (level, ...args) => {
  if (level <= currentLogLevel) {
    const method =
      level === LOG_LEVEL.ERROR
        ? 'error'
        : level === LOG_LEVEL.WARN
        ? 'warn'
        : 'log';
    console[method](...args);
  }
};

// 使用範例
log(LOG_LEVEL.DEBUG, '🔍 初始化 Capacitor Google Auth...'); // 僅開發環境
log(LOG_LEVEL.ERROR, '❌ Google Auth 初始化失敗:', error); // 所有環境
```

**解決方案 3：使用專用的日誌工具**

可以考慮使用第三方日誌庫，如 `pino` 或 `winston`，它們提供了更完善的日誌級別控制。

**生產環境日誌檢查清單：**

- [ ] 生產環境移除或條件化所有 `console.log`（使用環境變數檢查）
- [ ] 保留 `console.error` 用於錯誤追蹤（或發送到錯誤追蹤服務）
- [ ] 使用環境變數控制日誌輸出
- [ ] 確認沒有暴露敏感的 Client ID 或 token 信息
- [ ] 確認調試日誌不會影響性能

**建議實現位置：**

```javascript
// src/utils/logger.js (新建)
const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  debug: (...args) => {
    if (isDevelopment) console.log(...args);
  },
  info: (...args) => {
    if (isDevelopment) console.log(...args);
  },
  warn: (...args) => {
    console.warn(...args);
  },
  error: (...args) => {
    console.error(...args);
    // 生產環境可以發送到錯誤追蹤服務
  },
};

// 在 nativeGoogleAuth.js 中使用
import { logger } from './logger';

logger.debug('🔍 初始化 Capacitor Google Auth...');
logger.error('❌ Google Auth 初始化失敗:', error);
```

---

## 🎨 第四步：UI 整合

### src/components/SocialLogin.jsx

```javascript
import { useState, useEffect } from 'react';
import NativeGoogleAuth from '../utils/nativeGoogleAuth';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './SocialLogin.css'; // ⚠️ 必須導入 CSS

function SocialLogin({ onLogin, onError }) {
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // ⚠️ 重試計數器
  const { t } = useTranslation();

  // 初始化
  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        // ⚠️ Bridge 錯誤監聽（處理 Capacitor Bridge 通信問題）
        const originalConsoleError = console.error;
        console.error = (...args) => {
          if (args[0] && args[0].includes('androidBridge')) {
            console.log('🔍 檢測到 Bridge 通信錯誤，嘗試重新初始化...');
            // 可以嘗試重新初始化
          }
          originalConsoleError.apply(console, args);
        };

        await NativeGoogleAuth.initialize();
        setIsInitialized(true);
        console.log('✅ Google Auth 初始化完成');
      } catch (error) {
        console.error('❌ Google Auth 初始化失敗:', error);
        setIsInitialized(false);
        // ⚠️ 不阻止應用啟動，只是記錄錯誤
      }
    };
    initializeGoogleAuth();
  }, []);

  // 處理 Google 登入
  const handleGoogleLogin = async () => {
    if (!isInitialized) {
      onError('Google 登入服務尚未初始化，請稍後重試');
      return;
    }

    setLoading(true);

    try {
      const user = await NativeGoogleAuth.signIn();
      console.log('✅ Google 登入成功:', user.email);
      onLogin(user.email, null);
    } catch (error) {
      console.error('❌ Google 登入失敗:', error);

      let errorMessage = 'Google 登入失敗，請重試';
      if (error.message.includes('Something went wrong')) {
        errorMessage = '登入服務暫時不可用，請稍後重試';
      } else if (error.message.includes('androidBridge')) {
        errorMessage = '登入通信錯誤，請重試';
      } else if (error.message.includes('cancelled')) {
        errorMessage = '登入已取消';
      } else if (error.message.includes('network')) {
        errorMessage = '網路連線問題，請檢查網路後重試';
      }

      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="social-login-container">
      <div className="divider">
        <span>{t('common.or')}</span>
      </div>

      <div className="social-buttons">
        <button
          type="button"
          className="social-btn google-btn"
          onClick={handleGoogleLogin}
          disabled={loading || !isInitialized}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            {/* Google 圖標 SVG 路徑 */}
          </svg>
          {loading ? t('login.processing') : t('login.google')}
        </button>
      </div>

      {/* ⚠️ 初始化狀態顯示 */}
      {!isInitialized && (
        <div className="initialization-status">
          <small>正在初始化 Google 登入服務...</small>
        </div>
      )}

      {/* ⚠️ 重試狀態顯示 */}
      {retryCount > 0 && (
        <div className="retry-status">
          <small>正在重試登入... ({retryCount}/3)</small>
        </div>
      )}
    </div>
  );
}

// ⚠️ PropTypes 驗證
SocialLogin.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default SocialLogin;
```

---

## ✅ 檢查清單

在完成整合後，確認以下項目：

### 前置準備檢查

- [ ] 已從 Firebase Console 下載 `google-services.json` 並放到 `android/app/` 目錄
- [ ] Firebase Console 中已啟用 Google 登入方法
- [ ] Firestore 安全規則要求 `request.auth != null`（確認 `signedIn()` 函數正確實現）

### 配置文件檢查

- [ ] `AndroidManifest.xml` 中 `GOOGLE_SIGN_IN_CLIENT_ID` 使用 Web Client ID
- [ ] `strings.xml` 中 `server_client_id` 使用 Web Client ID
- [ ] `capacitor.config.json` 中 `serverClientId` 使用 Web Client ID
- [ ] `nativeGoogleAuth.js` 中 `clientId` 使用 Web Client ID
- [ ] `android/app/build.gradle` 中已添加 `play-services-auth` 依賴
- [ ] `android/app/build.gradle` 中已應用 `com.google.gms.google-services` 插件
- [ ] `android/build.gradle` (Project-level) 中已添加 `com.google.gms:google-services` classpath

### 代碼檢查

- [ ] 已導入 `signInWithCredential` 和 `GoogleAuthProvider`
- [ ] `initialize()` 方法中有環境檢測和配置檢查日誌
- [ ] `signIn()` 方法中有超時處理（30 秒）
- [ ] `signIn()` 方法中有重試機制
- [ ] `signIn()` 方法中有結果完整性驗證
- [ ] `convertToFirebaseUser` 方法中有提取 `idToken` 的邏輯（嘗試多種欄位名）
- [ ] `convertToFirebaseUser` 方法中使用 `signInWithCredential` 進行 Firebase 認證
- [ ] `saveUserToFirestore` 方法中使用 `firebaseUser.uid`（不是 Google ID）
- [ ] `saveUserToFirestore` 方法中有完整的初始用戶資料結構
- [ ] SocialLogin 組件中有 Bridge 錯誤監聽
- [ ] 有完整的錯誤處理和調試日誌

### 測試檢查

- [ ] Google 登入流程可以啟動
- [ ] 登入選擇 Google 帳號後可以成功完成
- [ ] 控制台顯示 "✅ Firebase 認證成功"
- [ ] 登入後 `auth.currentUser` 不為 `null`
- [ ] 控制台顯示正確的 Firebase UID
- [ ] 用戶資料可以成功保存到 Firestore
- [ ] 沒有 "Missing or insufficient permissions" 錯誤
- [ ] 登出功能正常運作（如果實作了 signOut）

### 建置和同步檢查

- [ ] 完成配置後已執行 `npm run build`
- [ ] 完成配置後已執行 `npx cap sync android`
- [ ] 已確認 `android/app/src/main/assets` 中有最新資源
- [ ] 如遇配置不生效，已清除所有快取（Vite、dist、Gradle、build 目錄）

### SHA-1 指紋檢查

- [ ] 已獲取 SHA-1 指紋（使用 keytool 或 Gradle）
- [ ] SHA-1 指紋已添加到 Firebase Console
- [ ] 已下載更新後的 `google-services.json`
- [ ] 驗證 `google-services.json` 中的 `certificate_hash` 與 SHA-1 一致
- [ ] 如果有 debug 和 release 兩個簽名，都已添加

### Debug vs Release 測試流程

**開發階段（Debug 簽名）：**

1. **獲取 Debug SHA-1**

   ```bash
   # 使用 Gradle 獲取（推薦）
   cd android
   gradlew signingReport
   # 查找 "Variant: debug" 下的 SHA1
   ```

2. **添加 Debug SHA-1 到 Firebase Console**

   - 前往 Firebase Console → Project Settings → Your apps → Android app
   - 在 SHA certificate fingerprints 區塊添加 debug SHA-1

3. **下載更新的 google-services.json**

   - 包含 debug 簽名的 certificate_hash

4. **測試 Google 登入**
   - 使用 `gradlew assembleDebug` 建置
   - 在模擬器或真機上測試

**發布前（Release 簽名）：**

1. **獲取 Release SHA-1**

   ```bash
   # 使用 keytool（需要 release keystore）
   keytool -list -v -keystore YOUR_RELEASE_KEYSTORE -alias YOUR_ALIAS
   ```

2. **添加 Release SHA-1 到 Firebase Console**

   - 在同一個位置添加 release SHA-1
   - **重要**：不要移除 debug SHA-1，兩者都需要保留

3. **下載最新的 google-services.json**

   - 現在應該包含兩個 certificate_hash（debug 和 release）

4. **驗證 google-services.json**

   ```json
   {
     "oauth_client": [
       {
         "android_info": {
           "certificate_hash": "DEBUG_SHA1" // debug 簽名
         }
       },
       {
         "android_info": {
           "certificate_hash": "RELEASE_SHA1" // release 簽名
         }
       }
     ]
   }
   ```

5. **使用 Release 簽名建置並測試**
   ```bash
   cd android
   gradlew assembleRelease  # APK
   gradlew bundleRelease     # AAB
   ```
   - 在真實設備上安裝測試
   - 確認 Google 登入正常運作

**⚠️ 重要：**

- ✅ 必須同時有 debug 和 release 的 SHA-1，才能在開發和發布環境中正常測試
- ✅ 如果只添加了 release SHA-1，開發時會無法使用 Google 登入
- ✅ 每次更新 keystore 後，都需要重新添加 SHA-1 並下載 google-services.json

---

### 詳細測試步驟

**測試 1: 配置驗證**

```bash
# 檢查配置是否正確傳遞
npx cap run android
# 打開 Android Studio，查看 Logcat
# 搜尋 "當前配置檢查" 確認所有 Client ID 一致
# 應該看到以下日誌：
# - strings.xml server_client_id: YOUR-WEB-CLIENT-ID
# - capacitor.config.json serverClientId: YOUR-WEB-CLIENT-ID
# - AndroidManifest.xml GOOGLE_SIGN_IN_CLIENT_ID: YOUR-WEB-CLIENT-ID
```

**測試 2: 登入流程驗證**

1. ✅ 啟動應用
2. ✅ 檢查控制台是否有 "✅ Google Auth 初始化成功"
3. ✅ 點擊 Google 登入按鈕
4. ✅ 觀察控制台輸出：
   - 應看到 "🔍 登入前檢查"
   - 應看到 "✅ Google 登入成功"
   - 應看到 "✅ Firebase 認證成功"
   - 應看到 "✅ Firebase 用戶 UID: xxx"
   - 應看到 "✅ 新用戶資料已創建" 或 "✅ 現有用戶資料已更新"
5. ✅ 檢查 Firestore，確認用戶資料已正確保存

**測試 3: 錯誤處理驗證**

- ✅ 測試網路中斷情況下的錯誤訊息
- ✅ 測試取消登入的處理
- ✅ 測試重試機制的運作

### 發布前最終檢查

在發布到 Google Play Store 之前，確認：

- [ ] 已使用 release 簽名測試 Google 登入
- [ ] Release 版本的 SHA-1 已添加到 Firebase Console
- [ ] 已下載包含 release SHA-1 的 `google-services.json`
- [ ] 所有配置都使用生產環境的值（不是測試值）
- [ ] 已確認環境變數在生產構建中正確設置
- [ ] 已在真實設備上測試（不是模擬器）
- [ ] 已測試應用重啟後的認證狀態恢復
- [ ] 已測試網路不穩定環境下的登入流程
- [ ] 已驗證所有錯誤訊息對用戶友好
- [ ] 已確認沒有調試日誌泄露敏感信息（或使用環境變數控制）

### 安全檢查清單

在發布到生產環境之前，確認以下安全事項：

- [ ] **沒有在代碼中硬編碼 Client ID 或 API Key**

  - 使用環境變數或配置文件
  - 檢查所有 `.js`、`.jsx`、`.ts` 文件中是否有硬編碼的敏感信息

- [ ] **`.env` 文件在 `.gitignore` 中**

  ```gitignore
  .env
  .env.local
  .env.*.local
  ```

- [ ] **生產環境使用環境變數而不是 `.env` 文件**

  - 在 CI/CD 系統中設置環境變數
  - 使用構建系統的環境變數管理功能

- [ ] **調試日誌不會暴露敏感信息**

  - 確認 `console.log` 不會輸出完整的 Client ID
  - 確認不會輸出 idToken 或 refreshToken
  - 使用生產環境日誌控制機制

- [ ] **使用 HTTPS 進行所有 API 通信**

  - Firebase API 默認使用 HTTPS
  - 確認沒有混合內容（HTTP/HTTPS）警告

- [ ] **Firestore 安全規則已正確配置**

  - 確認要求 `request.auth != null`
  - 確認用戶只能訪問自己的資料
  - 測試安全規則是否有效

- [ ] **不會在前端暴露 Server Auth Code**

  - 如果使用 `grantOfflineAccess: true`
  - 確保 `serverAuthCode` 只發送到信任的後端服務
  - 不要在前端日誌中輸出 `serverAuthCode`

- [ ] **Client ID 權限範圍正確**

  - 確認 OAuth 範圍只請求必要的權限（`profile`, `email`）
  - 不要請求過多的權限

- [ ] **定期更新依賴**
  - 檢查 `package.json` 中依賴是否有安全漏洞
  - 使用 `npm audit` 檢查已知漏洞
  - 及時更新到安全版本

**安全最佳實踐：**

- ✅ 使用最小權限原則（只請求必要的權限）
- ✅ 定期審查和更新依賴
- ✅ 監控錯誤日誌，及時發現異常登入嘗試
- ✅ 實施速率限制以防止濫用（Firebase Authentication 有內建保護）

---

## 🔍 系統化排錯流程

當遇到 Google 登入問題時，按照以下順序排查：

### 第 1 步：檢查配置一致性

**檢查所有配置文件中的 Client ID 是否一致：**

```bash
# 在 Windows 上（PowerShell）
Select-String -Pattern "GOOGLE.*CLIENT|serverClientId|server_client_id" -Path android\app\src\main\AndroidManifest.xml,capacitor.config.json,android\app\src\main\res\values\strings.xml -CaseSensitive:$false

# 或在專案中手動檢查
# 1. AndroidManifest.xml
# 2. strings.xml
# 3. capacitor.config.json
# 4. nativeGoogleAuth.js 中的 clientId
```

**檢查點：**

- [ ] 4 個位置的 Client ID 都相同
- [ ] 確認是 Web Client ID（不是 Android Client ID）
- [ ] 確認在 `google-services.json` 中使用 `client_type: 3` 的 ID

### 第 2 步：檢查 SHA-1 指紋

```bash
# 獲取當前使用的 SHA-1
keytool -list -v -keystore YOUR_KEYSTORE -alias YOUR_ALIAS

# 檢查 google-services.json 中的 certificate_hash
# 打開 android/app/google-services.json 並查找 certificate_hash
```

**檢查點：**

- [ ] SHA-1 已添加到 Firebase Console
- [ ] `google-services.json` 中的 `certificate_hash` 與 SHA-1 一致（去除冒號和轉大寫）
- [ ] 如果有 debug 和 release，兩者都已添加

### 第 3 步：檢查日誌輸出

**查看初始化階段日誌：**

- 應該看到："✅ Google Auth 初始化成功"
- 如果沒有，查看錯誤詳情中的 `message`、`code`、`stack`

**查看登入階段日誌：**

- 應該看到："🔍 登入前檢查"
- 應該看到："✅ Google 登入成功"
- 應該看到："🔍 Google 結果完整結構"（完整的 JSON）
- 應該看到："✅ 找到 idToken"
- 應該看到："✅ Firebase 認證成功"
- 如果中斷，確定在哪個步驟失敗

### 第 4 步：清除快取並重新建置

如果所有配置都正確但問題依然存在：

```bash
# 執行完整的清除和重建
build-clean-complete.bat

# 或手動清除
rmdir /s /q node_modules\.vite
rmdir /s /q dist
cd android
call gradlew clean
rmdir /s /q app\build
cd ..
npm run build
npx cap sync android
```

### 第 5 步：驗證 Firebase Console 設置

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 選擇您的專案
3. 前往 **Authentication** → **Sign-in method**
4. 確認 **Google** 已啟用
5. 確認已配置正確的 **Web Client ID**
6. 確認已添加正確的 **SHA-1 指紋**

### 第 6 步：檢查網絡和權限

- [ ] 確認設備有網絡連接
- [ ] 確認 `AndroidManifest.xml` 中有必要的權限
- [ ] 確認 Google Play Services 已安裝且是最新版本

---

## 🚨 常見錯誤和解決方案

### 常見問題快速索引

| 錯誤信息                                   | 章節位置                                                   | 主要原因                 |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------ |
| "Missing or insufficient permissions"      | [錯誤 1](#錯誤-1-missing-or-insufficient-permissions)      | 未通過 Firebase 認證     |
| "Something went wrong"                     | [錯誤 2](#錯誤-2-something-went-wrong)                     | Client ID 配置錯誤       |
| "缺少 idToken"                             | [錯誤 3](#錯誤-3-缺少-idtoken)                             | Google 結果結構問題      |
| "登入超時"                                 | [錯誤 4](#錯誤-4-登入超時)                                 | 網路或用戶未響應         |
| "androidBridge" 通信錯誤                   | [錯誤 5](#錯誤-5-androidbridge-通信錯誤)                   | Capacitor Bridge 問題    |
| "SHA-1 指紋不匹配"                         | [錯誤 6](#錯誤-6-sha-1-指紋不匹配)                         | 指紋配置問題             |
| "配置修改不生效"                           | [錯誤 7](#錯誤-7-配置修改不生效)                           | 快取未清除               |
| "account-exists-with-different-credential" | [錯誤 8](#錯誤-8-account-exists-with-different-credential) | 帳號已存在但認證方式不同 |

---

### 錯誤 1: "Missing or insufficient permissions"

**原因：**

- 沒有通過 Firebase Authentication
- `request.auth` 為 `null`

**解決：**

- 確認使用 `signInWithCredential` 進行 Firebase 認證
- 確認在保存到 Firestore 前，`auth.currentUser` 不為 `null`

### 錯誤 2: "Something went wrong"

**原因：**

- Client ID 配置不一致或錯誤
- 使用了 Android Client ID 而不是 Web Client ID

**解決：**

- 檢查所有配置文件是否使用相同的 Web Client ID
- 確認在 `google-services.json` 中使用 `client_type: 3` 的 ID

### 錯誤 3: "缺少 idToken"

**原因：**

- Google Auth 插件返回的結構可能不同
- 欄位名稱可能不是 `idToken`
- 插件可能返回 `serverAuthCode` 而不是 `idToken`

**解決：**

- 使用多種可能的欄位名嘗試提取：
  ```javascript
  const idToken =
    googleResult.idToken ||
    googleResult.authentication?.idToken ||
    googleResult.authenticationToken ||
    (googleResult.authentication && googleResult.authentication.idToken);
  ```
- 如果只有 `serverAuthCode`：
  - ⚠️ `serverAuthCode` 無法直接用於 Firebase 認證
  - 需要後端協助，將 `serverAuthCode` 交換為 `idToken`
  - 或者檢查 Google Auth 插件配置，確保返回 `idToken`
- 添加日誌查看完整結構：`JSON.stringify(googleResult, null, 2)`
- 檢查控制台輸出中的 "Google 結果完整結構"

### 錯誤 4: "登入超時"

**原因：**

- 網路連線問題
- Google 服務暫時不可用
- 用戶沒有回應選擇帳號

**解決：**

- 確認網路連線正常
- 檢查超時時間設定（預設 30 秒）
- 重試登入

### 錯誤 5: "androidBridge" 通信錯誤

**原因：**

- Capacitor Bridge 通信問題
- WebView 環境不穩定

**解決：**

- 實現 Bridge 錯誤監聽（已在 SocialLogin.jsx 範例中）
- 重試機制會自動處理此類錯誤
- 如果持續失敗，可能需要重啟應用

### 錯誤 6: "SHA-1 指紋不匹配"

**原因：**

- Firebase Console 中未添加正確的 SHA-1 指紋
- 使用 debug 簽名但只添加了 release SHA-1
- `google-services.json` 中的 `certificate_hash` 與實際 SHA-1 不一致

**解決：**

- 確認獲取的 SHA-1 指紋正確（使用正確的 keystore 和 alias）
- 在 Firebase Console 中添加 **所有** 需要的 SHA-1 指紋（debug、release）
- 下載更新後的 `google-services.json`
- 清除快取並重新建置
- 驗證 `google-services.json` 中的 `certificate_hash` 與 SHA-1 一致

### 錯誤 7: "配置修改不生效"

**原因：**

- 建置快取未清除
- Vite 或 Gradle 快取保留舊配置

**解決：**

- **清除所有快取**（參見「清除快取」章節）
- 重新執行 `npm run build` 和 `npx cap sync android`
- 確認 `android/app/src/main/assets` 中的資源已更新
- 如果仍不生效，嘗試完全刪除 `android/app/build` 和 `.gradle` 目錄

### 錯誤 8: "account-exists-with-different-credential"

**原因：**

- 用戶已經用電子郵件/密碼註冊過帳號
- 嘗試用同一個電子郵件的 Google 帳號登入
- Firebase 檢測到相同電子郵件但不同的認證方式

**解決：**

Firebase 不會自動合併帳號，需要手動處理：

1. **選項 1：提示用戶使用原有登入方式**

   ```javascript
   if (error.code === 'auth/account-exists-with-different-credential') {
     const email = error.customData?.email;
     // 提示用戶：「此電子郵件已使用其他方式註冊，請使用原登入方式」
     throw new Error(
       `此電子郵件 ${email} 已使用其他方式註冊，請使用原登入方式`
     );
   }
   ```

2. **選項 2：使用 `linkWithCredential` 鏈接帳號**（需要用戶已登入）

   - 先讓用戶用電子郵件/密碼登入
   - 然後用 `linkWithCredential` 鏈接 Google 認證

   ```javascript
   import { linkWithCredential } from 'firebase/auth';

   // 用戶已用電子郵件登入後
   try {
     await linkWithCredential(auth.currentUser, credential);
     console.log('✅ Google 帳號已成功鏈接到現有帳號');
   } catch (linkError) {
     console.error('❌ 鏈接帳號失敗:', linkError);
   }
   ```

**建議：** 在 `convertToFirebaseUser` 方法中添加此錯誤的處理邏輯

```javascript
// 在 convertToFirebaseUser 方法中添加
try {
  const firebaseAuthResult = await signInWithCredential(auth, credential);
  // ...
} catch (error) {
  if (error.code === 'auth/account-exists-with-different-credential') {
    const email = error.customData?.email;
    console.error(`❌ 此電子郵件 ${email} 已使用其他方式註冊`);
    throw new Error(
      `此電子郵件已使用其他方式註冊。請使用電子郵件/密碼登入，或聯繫客服協助鏈接帳號。`
    );
  }
  throw error;
}
```

---

## 🔧 調試技巧與工具

### Android Studio Logcat 使用

1. **打開 Logcat**

   - 在 Android Studio 中，點擊底部 **Logcat** 標籤
   - 或使用快捷鍵 `Alt + 6` (Windows) / `Cmd + 6` (Mac)

2. **過濾關鍵日誌**

   - 使用過濾器：`tag:chromium` 或 `tag:SystemWebChromeClient`
   - 或直接搜尋關鍵字：
     - `🔍 初始化 Capacitor Google Auth`
     - `✅ Google Auth 初始化成功`
     - `❌ Google 登入失敗`
     - `🔍 當前配置檢查`

3. **查看完整錯誤堆疊**
   - 確保 Logcat 級別設定為 **Verbose** 或 **Debug**
   - 搜尋包含 `Error` 或 `Exception` 的日誌

### Chrome DevTools（WebView 遠程調試）

**啟用 WebView 調試：**

1. 在 `capacitor.config.json` 中確保：

   ```json
   {
     "android": {
       "webContentsDebuggingEnabled": true
     }
   }
   ```

2. 在 Chrome 中打開 `chrome://inspect`
3. 找到您的應用並點擊 **inspect**

**調試技巧：**

- 在 Console 中可以執行 JavaScript
- 檢查 `window.Capacitor` 是否存在
- 查看 Network 標籤確認 API 調用
- 使用 Sources 標籤設置斷點

### 關鍵日誌檢查點

**初始化階段：**

```
✅ 應該看到：
- 🔍 環境檢測: { isWebView: true, isCapacitor: true }
- 🔍 當前配置檢查
- ✅ Google Auth 初始化成功

❌ 如果有問題：
- ❌ Google Auth 初始化失敗
- 檢查錯誤詳情中的 message、code、stack
```

**登入階段：**

```
✅ 應該看到：
- 🔍 登入前檢查
- ✅ Google 登入成功
- 🔍 Google 結果完整結構（完整的 JSON 結構）
- ✅ 找到 idToken
- ✅ Firebase 認證成功
- ✅ Firebase 用戶 UID: xxx

❌ 如果有問題：
- ❌ Google 登入失敗
- 🔍 可能原因分析（如果看到這個，說明是 "Something went wrong"）
- 🔍 重試錯誤詳情（如果進入重試）
```

---

## ⚡ 性能優化與最佳實踐

### 超時時間的調整

**預設值：** 30 秒

**何時調整：**

- 如果網路環境較差，可以增加到 60 秒
- 如果追求快速響應，可以減少到 15-20 秒（但可能增加超時風險）

```javascript
// 在 signIn() 方法中
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('登入超時')), 30000); // 30 秒
});
```

**建議：**

- 根據實際網路環境調整
- 考慮用戶體驗，不要太長也不要太短
- 可以在配置文件中設置，而不是硬編碼

### 重試機制的優化

**當前設定：** 最多重試 3 次，遞增延遲（1 秒、2 秒、3 秒）

**優化建議：**

- 第一次失敗後立即重試可能太快
- 考慮增加初始延遲到 2 秒
- 根據錯誤類型決定是否重試：
  - **通信錯誤**（androidBridge）：✅ 重試
  - **配置錯誤**：❌ 不重試（立即失敗）
  - **用戶取消**：❌ 不重試
  - **網路錯誤**：✅ 重試

```javascript
// 優化後的重試延遲
await new Promise(
  resolve => setTimeout(resolve, 2000 * (retryCount + 1)) // 2秒、4秒、6秒
);
```

### 初始化的最佳時機

**當前實現：** 在 `SocialLogin` 組件的 `useEffect` 中

**建議：**

- ✅ 在應用啟動時初始化（App.jsx）
- ✅ 不要在每次顯示登入頁面時都初始化
- ✅ 如果初始化失敗，允許用戶稍後重試（不阻止應用運行）

```javascript
// 在 App.jsx 中全局初始化一次
useEffect(() => {
  NativeGoogleAuth.initialize().catch(error => {
    console.error('Google Auth 初始化失敗，但允許應用繼續運行', error);
  });
}, []);
```

### 認證狀態持久化

**Firebase 認證狀態：**

- Firebase Auth 會自動持久化認證狀態
- 應用重啟後，`auth.currentUser` 會自動恢復
- 不需要手動存儲 token

**Google Auth 狀態：**

- Capacitor Google Auth 插件也可能持久化狀態
- 但建議每次應用啟動時檢查狀態
- 使用 `checkAuthState()` 驗證 token 是否仍然有效

**最佳實踐：**

```javascript
// 應用啟動時的完整檢查流程
useEffect(() => {
  const initializeAuth = async () => {
    // 1. 初始化 Google Auth
    await NativeGoogleAuth.initialize();

    // 2. 檢查 Google Auth 狀態
    const googleAuth = await NativeGoogleAuth.checkAuthState();

    // 3. Firebase 會自動恢復認證狀態（如果之前已認證）
    // 4. 監聽 Firebase 認證狀態變化
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // 用戶已認證，載入資料
      }
    });

    return () => unsubscribe();
  };

  initializeAuth();
}, []);
```

### 多個 Google 帳號的處理

**場景：** 用戶設備上有多個 Google 帳號

**當前實現：**

在 `capacitor.config.json` 中配置了 `forceCodeForRefreshToken: true`，這與帳號選擇器配合使用。`@belongnet/capacitor-google-auth` 插件會自動顯示 Google 帳號選擇器，讓用戶選擇要使用的帳號。

**帳號選擇行為：**

- ✅ 用戶每次登入時可以選擇不同的 Google 帳號
- ✅ Google 會記住用戶最近的帳號選擇
- ✅ 用戶可以在登入時切換到另一個帳號

**重要考慮事項：**

1. **不同 Google 帳號 = 不同 Firebase 用戶**

   - ✅ 每個 Google 帳號登入會創建對應的 Firebase UID
   - ✅ 不同帳號登入會被視為不同的用戶
   - ❌ Firestore 中的資料**不會自動合併**

2. **用戶資料分離**

   ```javascript
   // 用戶 A 使用 account1@gmail.com 登入
   // → Firebase UID: abc123...
   // → Firestore 路徑: /users/abc123...

   // 同一個用戶 A 使用 account2@gmail.com 登入
   // → Firebase UID: def456...（不同的 UID）
   // → Firestore 路徑: /users/def456...（不同的資料）
   ```

3. **建議處理方式：**

   - **選項 1：允許用戶切換帳號**

     - 登出後重新登入，選擇不同帳號
     - 每個帳號維護獨立的資料
     - 適合：個人應用、多身份場景

   - **選項 2：提示用戶選擇主要帳號**

     - 首次登入時提醒用戶選擇一個主要帳號
     - 後續建議使用同一帳號登入
     - 適合：需要單一身份的應用

   - **選項 3：實現帳號鏈接功能**
     - 允許用戶將多個 Google 帳號鏈接到同一 Firebase 用戶
     - 使用 `linkWithCredential` 實現
     - 適合：需要帳號合併的場景

**代碼範例：檢測帳號切換**

```javascript
// 在 convertToFirebaseUser 或應用邏輯中
const currentEmail = firebaseUser.email;
const previousEmail = localStorage.getItem('lastLoggedInEmail');

if (previousEmail && previousEmail !== currentEmail) {
  console.log(`⚠️ 檢測到帳號切換：${previousEmail} → ${currentEmail}`);
  // 可以提示用戶確認帳號切換
  // 或清除本地緩存，載入新帳號的資料
}

// 保存當前登入的 email
localStorage.setItem('lastLoggedInEmail', currentEmail);
```

**最佳實踐：**

- ✅ 明確告知用戶不同 Google 帳號會視為不同用戶
- ✅ 提供清楚的登出和帳號切換指引
- ✅ 如果應用需要單一身份，在 UI 中提示用戶選擇主要帳號
- ✅ 考慮實現帳號鏈接功能（如果需要合併多個 Google 帳號的資料）

---

## 📊 完整流程圖

```text
用戶點擊 Google 登入
    ↓
Capacitor Google Auth.signIn()
    ↓
獲取 Google 用戶資訊和 idToken
    ↓
提取 idToken
    ↓
GoogleAuthProvider.credential(idToken)
    ↓
signInWithCredential(auth, credential)
    ↓
✅ auth.currentUser 設置
    ↓
saveUserToFirestore(firebaseUser)
    ↓
✅ request.auth != null
    ↓
✅ 通過 Firestore 安全規則
    ↓
✅ 用戶資料保存成功
```

---

## 🎯 關鍵要點總結

### 核心配置要點

1. **必須使用 Web Client ID**（client_type: 3），不是 Android Client ID（client_type: 1）
2. **所有配置文件中必須統一 Client ID**（4 個位置）
3. **SHA-1 指紋必須正確配置在 Firebase Console** ⚠️ 極度重要
4. **Project-level build.gradle 必須包含 google-services classpath**
5. **`google-services.json` 必須正確下載並放置在正確位置**

### 核心實現要點

6. **必須使用 `signInWithCredential` 進行 Firebase 認證** ⚠️ 最重要
7. **Google 登入成功 ≠ Firebase 認證成功** ⚠️ 最核心概念
8. **只有通過 Firebase Auth，才能訪問 Firestore**（`request.auth` 必須設置）
9. **Firestore 安全規則必須要求 `request.auth != null`**

### 開發流程要點

10. **配置修改後必須執行 `npx cap sync android`**
11. **如果配置不生效，必須清除所有快取**
12. **實現超時和重試機制可以提高穩定性**
13. **完整的調試日誌有助於問題診斷**
14. **使用系統化排錯流程可以提高問題解決效率**
15. **環境變數的正確管理確保安全性**
16. **認證狀態的雙重檢查（Google Auth + Firebase Auth）確保可靠性**

---

## 📋 快速參考表

### 必須配置的 4 個位置

| 配置位置                | 配置項名稱                 | 必須使用      | 範例值（前綴）         |
| ----------------------- | -------------------------- | ------------- | ---------------------- |
| `AndroidManifest.xml`   | `GOOGLE_SIGN_IN_CLIENT_ID` | Web Client ID | `5144099869-6kes2g...` |
| `strings.xml`           | `server_client_id`         | Web Client ID | `5144099869-6kes2g...` |
| `capacitor.config.json` | `serverClientId`           | Web Client ID | `5144099869-6kes2g...` |
| `nativeGoogleAuth.js`   | `clientId`                 | Web Client ID | `5144099869-6kes2g...` |

**⚠️ 關鍵：所有位置必須使用相同的 Web Client ID（client_type: 3）**

### 關鍵命令速查

```bash
# 建置和同步（必須按照順序）
npm run build
npx cap sync android

# 清除快取（完整）
# Windows
rmdir /s /q node_modules\.vite
rmdir /s /q dist
cd android
call gradlew clean
rmdir /s /q app\build
rmdir /s /q .gradle
cd ..
npm run build
npx cap sync android

# 或使用腳本
build-clean-complete.bat

# 獲取 SHA-1 指紋
keytool -list -v -keystore YOUR_KEYSTORE -alias YOUR_ALIAS

# 檢查配置一致性（PowerShell）
Select-String -Pattern "GOOGLE.*CLIENT|serverClientId|server_client_id" -Path android\app\src\main\AndroidManifest.xml,capacitor.config.json,android\app\src\main\res\values\strings.xml -CaseSensitive:$false

# 驗證 google-services.json 中的 certificate_hash
# 打開 android/app/google-services.json 並搜索 "certificate_hash"
```

### 配置檢查順序

1. **前置檢查**

   - Firebase Console 中 Google 登入已啟用
   - 已下載 `google-services.json` 並放在 `android/app/` 目錄

2. **配置文件檢查**

   - 4 個位置的 Client ID 都相同且是 Web Client ID
   - SHA-1 指紋已添加到 Firebase Console
   - `google-services.json` 中的 `certificate_hash` 與 SHA-1 一致

3. **代碼檢查**

   - 已導入 `signInWithCredential` 和 `GoogleAuthProvider`
   - `convertToFirebaseUser` 方法中使用 `signInWithCredential`
   - `saveUserToFirestore` 方法中使用 `firebaseUser.uid`

4. **同步和建置**

   - 已執行 `npm run build`
   - 已執行 `npx cap sync android`
   - 如遇問題已清除所有快取

5. **測試驗證**
   - 已測試登入流程
   - 已檢查日誌輸出
   - 已驗證 Firestore 寫入成功

---

## 📚 參考資料

- Capacitor Google Auth: `@belongnet/capacitor-google-auth`
- Firebase Authentication: `firebase/auth`
- 查找 Client ID: `android/app/google-services.json` → `services.appinvite_service.other_platform_oauth_client[0].client_id` (client_type: 3)
- Capacitor 官方文檔: [Capacitor 官方網站](https://capacitorjs.com/)
- Firebase 官方文檔: [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**遵循此指南，即可一次到位完成 Google 登入功能整合！** ✅
