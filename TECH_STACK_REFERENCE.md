# 技術棧完整參考文件

**建立日期：** 2025 年 11 月 2 日
**專案類型：** 跨平台 Web + Mobile App (React + Capacitor + Firebase)
**適用場景：** 快速開發跨平台應用程式，支援 Web、Android、iOS

---

## 一、前端核心框架

### React 生態系統

| 技術             | 版本    | 用途     | 說明              |
| ---------------- | ------- | -------- | ----------------- |
| React            | ^19.1.0 | UI 框架  | 最新版本的 React  |
| React DOM        | ^19.1.0 | DOM 渲染 | React 的 DOM 綁定 |
| React Router DOM | ^7.6.1  | 路由管理 | 單頁應用路由      |
| React i18next    | ^15.6.0 | 國際化   | 多語系支援        |

### 安裝指令

```bash
npm install react@^19.1.0 react-dom@^19.1.0
npm install react-router-dom@^7.6.1
npm install react-i18next@^15.6.0 i18next@^25.3.2
```

---

## 二、建置工具

### Vite 生態系統

| 技術                 | 版本   | 用途       | 說明               |
| -------------------- | ------ | ---------- | ------------------ |
| Vite                 | ^6.3.5 | 建置工具   | 快速開發和建置     |
| @vitejs/plugin-react | ^4.5.0 | React 插件 | Vite 的 React 支援 |

### Vite 配置範例

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['recharts'],
        },
      },
    },
  },
});
```

### 安裝指令

```bash
npm install -D vite@^6.3.5 @vitejs/plugin-react@^4.5.0
```

---

## 三、跨平台框架

### Capacitor 生態系統

| 技術               | 版本   | 用途         | 說明                   |
| ------------------ | ------ | ------------ | ---------------------- |
| @capacitor/core    | ^6.0.0 | 核心框架     | Capacitor 核心功能     |
| @capacitor/cli     | ^6.0.0 | 命令列工具   | Capacitor CLI          |
| @capacitor/app     | ^6.0.0 | 應用程式 API | App 生命週期管理       |
| @capacitor/android | ^6.0.0 | Android 平台 | Android 原生支援       |
| @capacitor/ios     | ^6.0.0 | iOS 平台     | iOS 原生支援（需添加） |

### Capacitor 配置範例

```json
{
  "appId": "com.yourcompany.appname",
  "appName": "您的應用程式名稱",
  "webDir": "dist",
  "plugins": {
    "AdMob": {
      "appId": "ca-app-pub-XXXXXXXX~XXXXXXXX"
    },
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  },
  "android": {
    "webContentsDebuggingEnabled": true,
    "allowMixedContent": true,
    "compileOptions": {
      "sourceCompatibility": "17",
      "targetCompatibility": "17"
    }
  },
  "ios": {
    "contentInset": "automatic",
    "scrollEnabled": true,
    "limitsNavigationsToAppBoundDomains": true
  }
}
```

### 安裝指令

```bash
npm install @capacitor/core@^6.0.0 @capacitor/cli@^6.0.0 @capacitor/app@^6.0.0
npm install @capacitor/android@^6.0.0
npm install @capacitor/ios@^6.0.0
```

### 初始化指令

```bash
# 初始化 Capacitor
npx cap init

# 添加平台
npx cap add android
npx cap add ios

# 同步代碼到原生平台
npm run build
npx cap sync android
npx cap sync ios

# 開啟原生開發環境
npx cap open android
npx cap open ios
```

---

## 四、後端服務

### Firebase 生態系統

| 技術     | 版本    | 用途         | 說明                |
| -------- | ------- | ------------ | ------------------- |
| firebase | ^11.8.1 | Firebase SDK | 完整的 Firebase SDK |

### Firebase 服務

| 服務               | 用途     | 說明                 |
| ------------------ | -------- | -------------------- |
| Firebase Auth      | 用戶認證 | 登入、註冊、社交登入 |
| Firestore          | 資料庫   | NoSQL 即時資料庫     |
| Firebase Storage   | 檔案儲存 | 圖片、檔案上傳       |
| Firebase Analytics | 分析     | 用戶行為分析         |

### Firebase 配置範例

```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
```

### 環境變數配置

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 安裝指令

```bash
npm install firebase@^11.8.1
```

---

## 五、認證系統

### Google 認證

| 技術                             | 版本        | 用途        | 說明                      |
| -------------------------------- | ----------- | ----------- | ------------------------- |
| @belongnet/capacitor-google-auth | ^6.0.0-rc.0 | Google 登入 | Capacitor Google 認證插件 |

### Google 認證配置

#### 1. Capacitor 配置

```json
{
  "plugins": {
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  }
}
```

#### 2. Android 配置

**AndroidManifest.xml:**

```xml
<meta-data
    android:name="com.google.android.gms.auth.GOOGLE_SIGN_IN_CLIENT_ID"
    android:value="YOUR_WEB_CLIENT_ID.apps.googleusercontent.com" />
```

**strings.xml:**

```xml
<string name="server_client_id">YOUR_WEB_CLIENT_ID.apps.googleusercontent.com</string>
```

#### 3. iOS 配置

**Info.plist:**

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>YOUR_REVERSED_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

### 使用範例

```javascript
// src/utils/nativeGoogleAuth.js
import { GoogleAuth } from '@belongnet/capacitor-google-auth';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

class NativeGoogleAuth {
  static async initialize() {
    await GoogleAuth.initialize({
      clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  }

  static async signIn() {
    const result = await GoogleAuth.signIn();
    const credential = GoogleAuthProvider.credential(result.idToken);
    const firebaseUser = await signInWithCredential(auth, credential);
    return firebaseUser;
  }
}
```

### 安裝指令

```bash
npm install @belongnet/capacitor-google-auth@^6.0.0-rc.0
```

---

## 六、廣告系統

### AdMob 整合

| 技術                       | 版本   | 用途       | 說明                 |
| -------------------------- | ------ | ---------- | -------------------- |
| @capacitor-community/admob | ^6.0.0 | AdMob 插件 | Capacitor AdMob 整合 |

### AdMob 配置

#### 1. Capacitor 配置

```json
{
  "plugins": {
    "AdMob": {
      "appId": "ca-app-pub-XXXXXXXX~XXXXXXXX"
    }
  }
}
```

#### 2. Android 配置

**AndroidManifest.xml:**

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXX~XXXXXXXX"/>
```

**build.gradle:**

```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-ads:22.6.0'
    implementation 'com.google.android.gms:play-services-ads-identifier:18.0.1'
}
```

#### 3. iOS 配置

**Info.plist:**

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXX~XXXXXXXX</string>
<key>NSUserTrackingUsageDescription</key>
<string>此應用程式需要追蹤權限以顯示個人化廣告</string>
```

### 使用範例

```javascript
// src/components/AdBanner.jsx
import { useEffect } from 'react';
import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const AdBanner = ({ position = 'bottom' }) => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      AdMob.initialize({
        requestTrackingAuthorization: true,
      });

      AdMob.prepareBanner({
        adId: 'ca-app-pub-XXXXXXXX/XXXXXXXX',
        adSize: 'BANNER',
        position: position.toUpperCase(),
      });

      AdMob.showBanner({
        adId: 'ca-app-pub-XXXXXXXX/XXXXXXXX',
        adPosition: position.toUpperCase(),
      });
    }
  }, [position]);

  return <div id="ad-banner"></div>;
};
```

### 安裝指令

```bash
npm install @capacitor-community/admob@^6.0.0
```

---

## 七、國際化

### i18next 生態系統

| 技術          | 版本    | 用途       | 說明               |
| ------------- | ------- | ---------- | ------------------ |
| i18next       | ^25.3.2 | 國際化核心 | i18n 核心庫        |
| react-i18next | ^15.6.0 | React 整合 | React 的 i18n 綁定 |

### 配置範例

```javascript
// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationZh from './locales/zh.json';
import translationEn from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: translationZh },
    en: { translation: translationEn },
  },
  lng: 'zh',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});
```

### 使用範例

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => i18n.changeLanguage('en')}>English</button>
      <button onClick={() => i18n.changeLanguage('zh')}>中文</button>
    </div>
  );
}
```

---

## 八、圖表庫

### Recharts

| 技術     | 版本    | 用途   | 說明         |
| -------- | ------- | ------ | ------------ |
| recharts | ^2.15.3 | 圖表庫 | React 圖表庫 |

### 使用範例

```javascript
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
];

<LineChart width={500} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>;
```

---

## 九、圖片處理

### 服務端圖片處理

| 技術  | 版本    | 用途     | 說明                     |
| ----- | ------- | -------- | ------------------------ |
| sharp | ^0.34.3 | 圖片處理 | 服務端圖片壓縮、調整大小 |

### 前端圖片壓縮（Canvas API）

**技術：** HTML5 Canvas API（無需額外套件）

**用途：** 瀏覽器端圖片壓縮和調整大小

**使用場景：** 頭像上傳、圖片上傳前壓縮

**壓縮參數：**

- 最大原始文件：7MB
- 壓縮後尺寸：512x512 像素
- 壓縮後大小：最大 2.5MB
- 壓縮品質：98% (JPEG) / 93% (二次壓縮)

**使用範例：**

```javascript
// src/UserInfo.jsx
async function compressImage(
  file,
  maxSize = 2000 * 1024, // 2MB
  maxWidth = 512,
  maxHeight = 512
) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 計算最佳尺寸，保持長寬比
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });

      // 啟用最高品質圖像渲染
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 使用白色背景（針對透明圖片）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 繪製圖像
      ctx.drawImage(img, 0, 0, width, height);

      // 轉換為 Blob
      canvas.toBlob(
        blob => {
          if (blob.size > maxSize) {
            // 再壓縮一次，仍保持極高品質
            canvas.toBlob(blob2 => resolve(blob2), 'image/jpeg', 0.93);
          } else {
            resolve(blob);
          }
        },
        'image/jpeg',
        0.98
      );
    };

    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

**優點：**

- 無需額外套件
- 瀏覽器原生支援
- 減少上傳前的文件大小
- 改善用戶體驗（上傳速度更快）

---

## 十、性能監控

### Web Vitals

| 技術       | 版本   | 用途     | 說明                 |
| ---------- | ------ | -------- | -------------------- |
| web-vitals | ^5.0.2 | 性能指標 | Core Web Vitals 監控 |

---

## 十一、React 類型檢查

### PropTypes

| 技術       | 版本   | 用途     | 說明               |
| ---------- | ------ | -------- | ------------------ |
| prop-types | (內建) | 類型檢查 | React 組件屬性驗證 |

### 使用範例

```javascript
import PropTypes from 'prop-types';

function MyComponent({ name, age }) {
  return (
    <div>
      <h1>{name}</h1>
      <p>{age} 歲</p>
    </div>
  );
}

MyComponent.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
};

export default MyComponent;
```

**注意：** React 19 可能內建 PropTypes，但建議明確導入以確保兼容性。

---

## 十二、開發工具

### 程式碼品質

| 技術                      | 版本    | 用途       | 說明              |
| ------------------------- | ------- | ---------- | ----------------- |
| eslint                    | ^9.26.0 | 程式碼檢查 | ESLint            |
| eslint-plugin-react       | ^7.37.5 | React 規則 | React ESLint 規則 |
| eslint-plugin-react-hooks | ^5.2.0  | Hooks 規則 | React Hooks 規則  |

### 測試工具

| 技術                         | 版本    | 用途              | 說明               |
| ---------------------------- | ------- | ----------------- | ------------------ |
| vitest                       | ^2.0.5  | 單元測試          | Vite 測試框架      |
| @playwright/test             | ^1.45.0 | E2E 測試          | 端對端測試         |
| @firebase/rules-unit-testing | ^4.0.0  | Firebase 規則測試 | Firestore 規則測試 |

---

## 十三、Android 原生依賴

### Android 建置工具

| 工具                   | 版本   | 用途             | 說明                                  |
| ---------------------- | ------ | ---------------- | ------------------------------------- |
| Android Gradle Plugin  | 8.7.2  | Android 建置工具 | Android 應用程式建置核心工具          |
| Google Services Plugin | 4.4.2  | Google 服務整合  | Firebase 和 Google 服務的 Gradle 插件 |
| Gradle Wrapper         | 8.11.1 | Gradle 版本管理  | 統一管理 Gradle 版本，確保建置一致性  |

### android/build.gradle 範例（專案層級）

```gradle
// Top-level build file
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.7.2'
        classpath 'com.google.gms:google-services:4.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

### gradle-wrapper.properties 範例

```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.11.1-all.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

---

### AndroidX 支援庫

| 依賴                            | 版本   | 用途          | 說明              |
| ------------------------------- | ------ | ------------- | ----------------- |
| androidx.appcompat              | 1.7.0  | 相容性支援    | AppCompat 庫      |
| androidx.coordinatorlayout      | 1.2.0  | 佈局管理      | CoordinatorLayout |
| androidx.core                   | 1.15.0 | 核心工具      | AndroidX Core     |
| androidx.core:core-splashscreen | 1.0.1  | 啟動畫面      | Splash Screen     |
| androidx.fragment               | 1.8.4  | Fragment 支援 | Fragment 庫       |
| androidx.webkit                 | 1.12.1 | WebView 支援  | WebView 功能      |

### Google Play Services

| 依賴                         | 版本   | 用途        | 說明           |
| ---------------------------- | ------ | ----------- | -------------- |
| play-services-ads            | 22.6.0 | AdMob SDK   | AdMob 廣告 SDK |
| play-services-ads-identifier | 18.0.1 | 廣告識別    | 廣告 ID 識別   |
| play-services-auth           | 20.7.0 | Google 認證 | Google Sign-In |

### Firebase Android

| 依賴               | 版本   | 用途           | 說明               |
| ------------------ | ------ | -------------- | ------------------ |
| firebase-bom       | 34.4.0 | Firebase BoM   | Firebase 版本管理  |
| firebase-analytics | (自動) | Analytics      | Firebase Analytics |
| firebase-auth      | (自動) | Authentication | Firebase Auth      |
| firebase-firestore | (自動) | Firestore      | Firebase Firestore |

### Capacitor 插件

| 依賴                              | 版本   | 用途              | 說明                     |
| --------------------------------- | ------ | ----------------- | ------------------------ |
| capacitor-android                 | ^6.0.0 | Capacitor Android | Capacitor Android 平台   |
| capacitor-cordova-android-plugins | (自動) | Cordova 插件      | Cordova Android 插件支援 |

### Android 測試框架

| 依賴                                 | 版本   | 用途          | 說明                 |
| ------------------------------------ | ------ | ------------- | -------------------- |
| junit                                | 4.13.2 | 單元測試      | JUnit 測試框架       |
| androidx.test.ext:junit              | 1.2.1  | AndroidX 測試 | AndroidX JUnit 擴展  |
| androidx.test.espresso:espresso-core | 3.6.1  | UI 測試       | Espresso UI 測試框架 |

### android/app/build.gradle 完整範例

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'

android {
    namespace "com.yourcompany.appname"
    compileSdk rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.yourcompany.appname"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    // AndroidX 支援庫
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"

    // Capacitor
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')

    // AdMob
    implementation 'com.google.android.gms:play-services-ads:22.6.0'
    implementation 'com.google.android.gms:play-services-ads-identifier:18.0.1'

    // Firebase
    implementation platform('com.google.firebase:firebase-bom:34.4.0')
    implementation 'com.google.firebase:firebase-analytics'
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-firestore'

    // Google Auth
    implementation 'com.google.android.gms:play-services-auth:20.7.0'

    // 測試框架
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
}
```

### variables.gradle 範例

```gradle
ext {
    minSdkVersion = 23
    compileSdkVersion = 35
    targetSdkVersion = 35
    javaVersion = JavaVersion.VERSION_17
    androidxAppCompatVersion = '1.7.0'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.15.0'
    coreSplashScreenVersion = '1.0.1'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.2.1'
    androidxEspressoCoreVersion = '3.6.1'
}
```

---

## 十四、生產環境服務器

### Express 生態系統

| 技術    | 版本   | 用途       | 說明                   |
| ------- | ------ | ---------- | ---------------------- |
| express | (可選) | Web 服務器 | Node.js Web 服務器框架 |
| helmet  | (可選) | 安全標頭   | HTTP 安全標頭中間件    |

### server.js 範例

```javascript
// server.js - 僅用於生產部署
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const app = express();

// 檢查是否為生產環境
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://apis.google.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          'https://*.googleapis.com',
          'https://*.firebaseio.com',
          'wss://*.firebaseio.com',
        ],
        frameSrc: ["'self'", 'https://*.firebaseapp.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    })
  );
}

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### package.json 腳本

```json
{
  "scripts": {
    "serve": "NODE_ENV=production node server.js"
  }
}
```

### 安裝指令（可選）

```bash
# 如需使用生產環境服務器
npm install express helmet
```

**注意：** 這是可選的。大多數部署平台（如 Netlify、Vercel）會自動處理靜態文件服務。

---

## 十五、部署平台

### Netlify

**配置文件：** `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 環境變數配置

在 Netlify 控制台中設置：

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- 其他 Firebase 環境變數

---

## 十六、環境要求

在開始安裝和建置專案之前，請確保您的開發環境已安裝以下必要軟體。

### 必要環境

| 軟體               | 版本              | 用途                     | 下載連結                             |
| ------------------ | ----------------- | ------------------------ | ------------------------------------ |
| **Node.js**        | 20.19.1 LTS       | JavaScript 運行環境      | https://nodejs.org/                  |
| **npm**            | (隨 Node.js 安裝) | 套件管理工具             | (包含在 Node.js)                     |
| **Java**           | 17.0.16+          | Android 開發             | https://adoptium.net/                |
| **Android Studio** | (最新版)          | Android 開發工具（可選） | https://developer.android.com/studio |

### Node.js 安裝

**推薦版本：** Node.js 20.19.1 LTS

```bash
# 檢查 Node.js 版本
node --version
# 應顯示：v20.19.1 或更高版本

# 檢查 npm 版本
npm --version
```

**安裝步驟：**

1. 訪問 https://nodejs.org/
2. 下載 LTS（長期支援）版本
3. 執行安裝程式
4. 安裝時勾選「Add to PATH」選項
5. 完成後重啟終端機並驗證安裝

### Java 安裝（Android 開發需要）

**推薦版本：** OpenJDK 17.0.16+

```bash
# 檢查 Java 版本
java -version
# 應顯示：openjdk version "17.0.16" 或更高版本

# 檢查 JAVA_HOME 環境變數
echo $JAVA_HOME  # Linux/Mac
echo %JAVA_HOME%  # Windows
```

**安裝步驟：**

1. 訪問 https://adoptium.net/
2. 選擇 OpenJDK 17（LTS）
3. 下載並安裝
4. 設定 `JAVA_HOME` 環境變數：
   - **Windows：** `系統內容 > 進階 > 環境變數 > 新增系統變數`
   - **Mac/Linux：** 編輯 `~/.bashrc` 或 `~/.zshrc`：
     ```bash
     export JAVA_HOME=/path/to/java
     export PATH=$JAVA_HOME/bin:$PATH
     ```

### Android Studio（可選，但推薦）

**用途：**

- Android SDK 管理
- Android 模擬器
- 原生 Android 調試工具
- Gradle 建置工具

**安裝步驟：**

1. 訪問 https://developer.android.com/studio
2. 下載並安裝 Android Studio
3. 開啟後安裝 Android SDK（API Level 35）
4. 設定 `ANDROID_HOME` 環境變數（通常自動設定）

### 環境檢查指令

```bash
# 檢查所有環境變數
node --version
npm --version
java -version
gradle --version  # 如果已安裝 Gradle（通常由 Android Studio 提供）

# 檢查環境變數（Windows PowerShell）
echo $env:NODE_HOME
echo $env:JAVA_HOME
echo $env:ANDROID_HOME

# 檢查環境變數（Mac/Linux）
echo $NODE_HOME
echo $JAVA_HOME
echo $ANDROID_HOME
```

### 平台特定要求

#### Windows

- **Node.js：** 建議使用 Windows Installer (.msi)
- **Java：** 確保 `JAVA_HOME` 指向 JDK 安裝目錄
- **路徑分隔符：** 使用反斜線 `\` 或正斜線 `/`

#### Mac

- **Node.js：** 可使用 Homebrew：`brew install node`
- **Java：** 可使用 Homebrew：`brew install openjdk@17`
- **環境變數：** 通常設定在 `~/.zshrc` 或 `~/.bash_profile`

#### Linux

- **Node.js：** 可使用 NodeSource 倉庫安裝
- **Java：** 使用套件管理器：`sudo apt install openjdk-17-jdk` (Ubuntu/Debian)
- **環境變數：** 設定在 `~/.bashrc` 或 `~/.profile`

### 最小系統要求

| 項目         | 要求                                                   |
| ------------ | ------------------------------------------------------ |
| **作業系統** | Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)       |
| **記憶體**   | 至少 8GB RAM（推薦 16GB+）                             |
| **硬碟空間** | 至少 10GB 可用空間（用於 Node modules 和 Android SDK） |
| **處理器**   | 64 位元處理器                                          |

### 常見問題

**Q1: 為什麼需要 Java 17？**

A: Android Gradle Plugin 8.7.2 和 Capacitor 6.0.0 要求 Java 17 或更高版本。Java 8 或 11 將無法正常建置 Android 應用程式。

**Q2: 可以使用其他版本的 Node.js 嗎？**

A: 建議使用 Node.js 20.x LTS 版本。較舊版本可能缺少某些功能，較新版本可能存在兼容性問題。

**Q3: 必須安裝 Android Studio 嗎？**

A: 不是必須的。如果只需要建置 APK/AAB，可以只安裝 Android SDK。但 Android Studio 提供了更方便的管理工具。

---

## 十七、完整安裝指令

### 快速開始

```bash
# 1. 建立新專案
npm create vite@latest my-app -- --template react
cd my-app

# 2. 安裝核心依賴
npm install react@^19.1.0 react-dom@^19.1.0
npm install react-router-dom@^7.6.1
npm install firebase@^11.8.1

# 3. 安裝 Capacitor
npm install @capacitor/core@^6.0.0 @capacitor/cli@^6.0.0
npm install @capacitor/app@^6.0.0
npm install @capacitor/android@^6.0.0
npm install @capacitor/ios@^6.0.0

# 4. 安裝認證插件
npm install @belongnet/capacitor-google-auth@^6.0.0-rc.0

# 5. 安裝廣告插件
npm install @capacitor-community/admob@^6.0.0

# 6. 安裝國際化
npm install i18next@^25.3.2 react-i18next@^15.6.0

# 7. 安裝其他工具
npm install recharts@^2.15.3
npm install sharp@^0.34.3
npm install web-vitals@^5.0.2

# 8. 安裝開發依賴
npm install -D vite@^6.3.5 @vitejs/plugin-react@^4.5.0
npm install -D eslint@^9.26.0 eslint-plugin-react@^7.37.5 eslint-plugin-react-hooks@^5.2.0
npm install -D vitest@^2.0.5 @playwright/test@^1.45.0

# 9. 安裝生產環境服務器（可選）
npm install express helmet

# 10. 初始化 Capacitor
npx cap init

# 11. 添加平台
npx cap add android
npx cap add ios
```

---

## 十八、package.json 範例

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@belongnet/capacitor-google-auth": "^6.0.0-rc.0",
    "@capacitor-community/admob": "^6.0.0",
    "@capacitor/android": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/ios": "^6.0.0",
    "express": "^4.18.2",
    "firebase": "^11.8.1",
    "helmet": "^7.1.0",
    "i18next": "^25.3.2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-i18next": "^15.6.0",
    "react-router-dom": "^7.6.1",
    "recharts": "^2.15.3",
    "sharp": "^0.34.3",
    "web-vitals": "^5.0.2"
  },
  "devDependencies": {
    "@firebase/rules-unit-testing": "^4.0.0",
    "@playwright/test": "^1.45.0",
    "@vitejs/plugin-react": "^4.5.0",
    "eslint": "^9.26.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "vite": "^6.3.5",
    "vitest": "^2.0.5"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 十九、最佳實踐

### 1. 專案結構

```
my-app/
├── src/
│   ├── components/        # React 組件
│   ├── pages/            # 頁面組件
│   ├── utils/             # 工具函數
│   ├── config/            # 配置文件
│   ├── locales/           # 國際化文件
│   ├── firebase.js        # Firebase 配置
│   └── i18n.js            # i18n 配置
├── public/                # 靜態資源
├── android/               # Android 原生代碼
├── ios/                   # iOS 原生代碼
├── dist/                  # 建置輸出
├── capacitor.config.json  # Capacitor 配置
├── vite.config.js         # Vite 配置
└── package.json
```

### 2. 環境變數管理

```env
# .env.development
VITE_FIREBASE_API_KEY=dev_api_key
VITE_FIREBASE_PROJECT_ID=dev_project

# .env.production
VITE_FIREBASE_API_KEY=prod_api_key
VITE_FIREBASE_PROJECT_ID=prod_project
```

### 3. 跨平台開發建議

- 使用 `Capacitor.isNativePlatform()` 統一處理 Android/iOS
- 避免在代碼中區分 Android 和 iOS
- 將原生配置分離到 `android/` 和 `ios/` 資料夾
- 保持 `src/` 代碼共享

### 4. 性能優化

- 使用 Vite 的 code splitting
- 動態導入 Capacitor 插件（僅在原生平台載入）
- 使用 React.lazy() 進行組件懶加載
- 優化圖片大小和格式

### 5. 安全性

- 環境變數使用 `VITE_` 前綴（公開變數）
- 敏感資訊不要放在前端代碼中
- 使用 Firebase Security Rules 保護資料
- 驗證用戶輸入

---

## 二十、相關連結

### 官方文檔

- React: https://react.dev/
- Vite: https://vitejs.dev/
- Capacitor: https://capacitorjs.com/
- Firebase: https://firebase.google.com/
- AdMob: https://admob.google.com/
- i18next: https://www.i18next.com/
- Recharts: https://recharts.org/

### 插件文檔

- Capacitor Google Auth: https://github.com/CodetrixStudio/CapacitorGoogleAuth
- Capacitor AdMob: https://github.com/capacitor-community/admob

---

## 二十一、常見問題

### Q1: 如何添加新平台？

```bash
npx cap add platform-name
npx cap sync platform-name
```

### Q2: 如何更新版本號？

**Android:**

```gradle
versionCode 15
versionName "1.15"
```

**iOS:**
在 Xcode 或 Info.plist 中更新

### Q3: 如何處理平台特定代碼？

使用 `Capacitor.isNativePlatform()` 統一處理：

```javascript
if (Capacitor.isNativePlatform()) {
  // Android/iOS 統一處理
} else {
  // Web 處理
}
```

---

## 二十二、好友系統

### 系統架構

好友系統使用 **Firebase Firestore** 作為後端資料庫，實現完整的好友管理功能。

### Firestore 集合結構

#### 1. friendInvitations（好友邀請）

**用途：** 管理好友邀請記錄

**數據結構：**

```javascript
{
  fromUserId: string,        // 發送者用戶 ID
  toUserId: string,          // 接收者用戶 ID
  status: string,            // 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: string,         // ISO 時間戳
  acceptedAt?: string,       // 接受時間（ISO 時間戳）
  cancelledAt?: string,      // 取消時間（ISO 時間戳）
  isReverse?: boolean        // 是否為反向邀請
}
```

**Firestore Security Rules：**

```javascript
match /friendInvitations/{inviteId} {
  // 任何登入用戶都可以讀取邀請（用於查詢好友關係）
  allow read: if request.auth != null;

  // 任何登入用戶都可以創建邀請（包括反向邀請）
  allow create: if request.auth != null &&
    request.resource.data.fromUserId == request.auth.uid;

  // 任何登入用戶都可以更新邀請狀態
  allow update: if request.auth != null;

  // 不允許刪除邀請記錄（保留歷史）
  allow delete: if false;
}
```

#### 2. friendChallenges（好友挑戰）

**用途：** 管理好友之間的健身挑戰

**數據結構：**

```javascript
{
  fromUserId: string,           // 發起者用戶 ID
  toUserId: string,             // 接收者用戶 ID
  fromUserNickname: string,     // 發起者暱稱
  toUserNickname: string,        // 接收者暱稱
  type: {                        // 挑戰類型
    id: string,                  // 'strength' | 'endurance' | 'power' | 'comprehensive'
    name: string,
    icon: string,
    description: string,
    examples: string[]
  },
  challenge: string,             // 挑戰內容
  status: string,                // 'pending' | 'accepted' | 'declined' | 'completed' | 'expired'
  timestamp: string,              // ISO 時間戳
  expiresAt: string,             // 過期時間（ISO 時間戳，7天後）
  isRead: boolean                // 是否已讀
}
```

**Firestore Security Rules：**

```javascript
match /friendChallenges/{challengeId} {
  // 任何登入用戶都可以讀取挑戰
  allow read: if request.auth != null;

  // 任何登入用戶都可以創建挑戰
  allow create: if request.auth != null &&
    request.resource.data.fromUserId == request.auth.uid;

  // 允許更新挑戰狀態（接受、拒絕、完成等）
  allow update: if request.auth != null;

  // 不允許刪除挑戰記錄
  allow delete: if false;
}
```

#### 3. users（用戶文檔）

**friends 欄位：** 用戶的好友 ID 陣列

```javascript
{
  friends: string[]  // 好友用戶 ID 列表（最多 100 個）
}
```

### 核心功能

#### 1. 搜尋好友

**功能：** 根據暱稱或電子郵件搜尋用戶

**實現方式：**

```javascript
// 策略1：暱稱搜尋（部分匹配）
const nicknameQuery = query(
  collection(db, 'users'),
  where('nickname', '>=', searchTerm),
  where('nickname', '<=', searchTerm + '\uf8ff'),
  limit(10)
);

// 策略2：電子郵件搜尋（部分匹配）
const emailQuery = query(
  collection(db, 'users'),
  where('email', '>=', searchTerm),
  where('email', '<=', searchTerm + '\uf8ff'),
  limit(10)
);
```

#### 2. 發送好友邀請

**實現方式：**

```javascript
const invitationData = {
  fromUserId: auth.currentUser.uid,
  toUserId: toUserId,
  status: 'pending',
  createdAt: new Date().toISOString(),
};

await addDoc(collection(db, 'friendInvitations'), invitationData);
```

**限制：**

- 好友數量上限：100 個
- 檢查重複邀請
- 檢查是否已是好友

#### 3. 接受/拒絕好友邀請

**接受邀請流程：**

```javascript
// 1. 更新邀請狀態
await updateDoc(doc(db, 'friendInvitations', requestId), {
  status: 'accepted',
  acceptedAt: new Date().toISOString(),
});

// 2. 更新用戶好友列表
await updateDoc(doc(db, 'users', auth.currentUser.uid), {
  friends: arrayUnion(fromUserId),
});

// 3. 創建反向邀請記錄
await addDoc(collection(db, 'friendInvitations'), {
  fromUserId: auth.currentUser.uid,
  toUserId: fromUserId,
  status: 'accepted',
  createdAt: new Date().toISOString(),
  acceptedAt: new Date().toISOString(),
  isReverse: true,
});
```

#### 4. 載入好友列表

**實現方式：**

```javascript
// 查詢與自己相關的已接受邀請
const qFromMe = query(
  collection(db, 'friendInvitations'),
  where('fromUserId', '==', auth.currentUser.uid),
  where('status', '==', 'accepted')
);

const qToMe = query(
  collection(db, 'friendInvitations'),
  where('toUserId', '==', auth.currentUser.uid),
  where('status', '==', 'accepted')
);
```

#### 5. 移除好友

**實現方式：**

```javascript
// 1. 從用戶好友列表中移除
await updateDoc(doc(db, 'users', auth.currentUser.uid), {
  friends: arrayRemove(friendId),
});

// 2. 更新相關邀請狀態為已取消
const relatedInvitations = await getDocs(
  query(
    collection(db, 'friendInvitations'),
    where('fromUserId', 'in', [auth.currentUser.uid, friendId]),
    where('toUserId', 'in', [auth.currentUser.uid, friendId]),
    where('status', '==', 'accepted')
  )
);

// 批量更新邀請狀態
await Promise.all(
  relatedInvitations.docs.map(doc =>
    updateDoc(doc.ref, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    })
  )
);
```

### 使用範例

```javascript
// src/components/Friends.jsx
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// 發送好友邀請
const sendFriendInvitation = async toUserId => {
  const invitationData = {
    fromUserId: auth.currentUser.uid,
    toUserId: toUserId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await addDoc(collection(db, 'friendInvitations'), invitationData);
};

// 接受好友邀請
const acceptFriendRequest = async (requestId, fromUserId) => {
  await updateDoc(doc(db, 'friendInvitations', requestId), {
    status: 'accepted',
    acceptedAt: new Date().toISOString(),
  });

  await updateDoc(doc(db, 'users', auth.currentUser.uid), {
    friends: arrayUnion(fromUserId),
  });
};
```

### 最佳實踐

1. **好友數量限制：** 每個用戶最多 100 個好友
2. **邀請去重：** 檢查是否已存在待處理邀請
3. **雙向關係：** 使用反向邀請記錄維護雙向好友關係
4. **歷史記錄：** 不刪除邀請記錄，僅更新狀態（保留歷史）
5. **實時更新：** 接受/拒絕邀請後立即更新本地狀態和 Firestore

---

## 二十三、頭像上傳系統

### 系統架構

頭像上傳系統使用 **Firebase Storage** 儲存圖片，並使用 **HTML5 Canvas API** 進行前端壓縮。

### Firebase Storage 結構

**儲存路徑：** `avatars/{userId}/avatar.jpg`

**範例：** `avatars/abc123def456/avatar.jpg`

### Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 頭像存取規則
    match /avatars/{userId}/{allPaths=**} {
      // 允許任何已登入用戶讀取頭像（必要 for 顯示其他用戶頭像）
      allow read: if request.auth != null;

      // 允許本人上傳和管理自己的頭像
      allow write: if request.auth != null && request.auth.uid == userId;

      // 允許讀取頭像的元數據
      allow get: if request.auth != null;
    }
  }
}
```

### 上傳流程

#### 1. 文件驗證

```javascript
const file = e.target.files[0];

// 驗證文件類型
if (!file.type.startsWith('image/')) {
  throw new Error('請選擇圖片檔案');
}

// 驗證文件大小（原始文件最大 7MB）
if (file.size > 7 * 1024 * 1024) {
  throw new Error('圖片大小請勿超過 7MB');
}
```

#### 2. 圖片壓縮

```javascript
// 壓縮圖片：512x512 像素，最大 2.5MB
const compressed = await compressImage(file, 2000 * 1024, 512, 512);

// 驗證壓縮後大小
if (compressed.size > 2500 * 1024) {
  throw new Error('壓縮後圖片仍超過 2.5MB，請選擇更小的圖片');
}
```

#### 3. 上傳到 Firebase Storage

```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const userId = auth.currentUser?.uid;
const avatarRef = ref(storage, `avatars/${userId}/avatar.jpg`);

const metadata = {
  contentType: 'image/jpeg',
  customMetadata: {
    'uploaded-by': userId,
    'upload-time': new Date().toISOString(),
  },
};

// 上傳壓縮後的圖片
await uploadBytes(avatarRef, compressed, metadata);

// 獲取下載 URL
const url = await getDownloadURL(avatarRef);
```

#### 4. 更新 Firestore

```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const userRef = doc(db, 'users', userId);
await updateDoc(userRef, {
  avatarUrl: url,
  updatedAt: new Date().toISOString(),
});
```

### 完整使用範例

```javascript
// src/UserInfo.jsx
const handleAvatarChange = async e => {
  const file = e.target.files[0];

  if (!file || !file.type.startsWith('image/')) {
    setAvatarError('請選擇圖片檔案');
    return;
  }

  if (file.size > 7 * 1024 * 1024) {
    setAvatarError('圖片大小請勿超過 7MB');
    return;
  }

  setAvatarUploading(true);

  try {
    // 1. 壓縮圖片
    const compressed = await compressImage(file, 2000 * 1024, 512, 512);

    if (compressed.size > 2500 * 1024) {
      setAvatarError('壓縮後圖片仍超過 2.5MB');
      return;
    }

    // 2. 上傳到 Storage
    const userId = auth.currentUser?.uid;
    const avatarRef = ref(storage, `avatars/${userId}/avatar.jpg`);

    await uploadBytes(avatarRef, compressed, {
      contentType: 'image/jpeg',
      customMetadata: {
        'uploaded-by': userId,
        'upload-time': new Date().toISOString(),
      },
    });

    // 3. 獲取下載 URL
    const url = await getDownloadURL(avatarRef);

    // 4. 更新 Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      avatarUrl: url,
      updatedAt: new Date().toISOString(),
    });

    // 5. 更新本地狀態
    setUserData(prev => ({
      ...prev,
      avatarUrl: url,
    }));

    console.log('✅ 頭像上傳成功');
  } catch (err) {
    console.error('頭像上傳失敗:', err);
    setAvatarError('頭像上傳失敗: ' + err.message);
  } finally {
    setAvatarUploading(false);
  }
};
```

### 頭像工具函數

#### 1. avatarUtils.js

**用途：** 統一處理頭像載入和錯誤處理

```javascript
// src/utils/avatarUtils.js

/**
 * 獲取用戶頭像 URL，提供備用選項
 */
export function getAvatarUrl(avatarUrl, isGuest = false, isAnonymous = false) {
  if (isGuest) return '/guest-avatar.svg';
  if (isAnonymous) return '/default-avatar.svg';
  return avatarUrl && avatarUrl.trim() !== ''
    ? avatarUrl
    : '/default-avatar.svg';
}

/**
 * 處理頭像載入錯誤的統一函數
 */
export function handleAvatarError(e) {
  console.log('🔍 頭像載入失敗，切換到預設頭像');
  e.target.src = '/default-avatar.svg';
  e.target.onerror = null; // 防止無限循環
}

/**
 * 檢查頭像 URL 是否有效
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
```

#### 2. avatarDiagnostics.js

**用途：** 頭像問題診斷工具

```javascript
// src/utils/avatarDiagnostics.js

/**
 * 診斷頭像載入問題
 */
export async function diagnoseAvatarIssue(avatarUrl, userId) {
  // 檢查 URL 有效性
  // 檢查 Firebase Storage 規則
  // 檢查用戶認證狀態
  // 返回診斷結果
}
```

### 預設頭像

**檔案位置：** `public/default-avatar.svg`

**使用場景：**

- 用戶未上傳頭像
- 頭像載入失敗
- 匿名用戶

**錯誤處理：**

```javascript
<img
  src={avatarUrl || '/default-avatar.svg'}
  onError={e => {
    e.target.src = '/default-avatar.svg';
    e.target.onerror = null;
  }}
  alt="頭像"
/>
```

### 最佳實踐

1. **前端壓縮：** 上傳前壓縮圖片，減少上傳時間和儲存成本
2. **文件驗證：** 驗證文件類型和大小，提供清晰的錯誤訊息
3. **錯誤處理：** 頭像載入失敗時自動切換到預設頭像
4. **即時更新：** 上傳成功後立即更新本地狀態和 Firestore
5. **元數據記錄：** 在 Storage metadata 中記錄上傳者和上傳時間
6. **安全規則：** 只允許用戶上傳和管理自己的頭像

---

## 二十四、Web Workers 和 Service Worker

### Web Workers

**技術：** HTML5 Web Workers API（瀏覽器原生支援）

**用途：** 處理計算密集型任務，避免阻塞主線程

**使用場景：** 天梯分數計算、雷達圖數據處理、用戶統計分析、圖片優化

**自定義 Hook：** `useWebWorker`

```javascript
// src/hooks/useWebWorker.js
import { useRef, useCallback, useEffect } from 'react';

const useWebWorker = (workerPath, options = {}) => {
  const workerRef = useRef(null);
  const callbacksRef = useRef(new Map());
  const taskIdRef = useRef(0);

  // 初始化 Worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker(workerPath);

      workerRef.current.onmessage = e => {
        const { id, success, result, error } = e.data;
        const callback = callbacksRef.current.get(id);

        if (callback) {
          if (success) {
            callback.resolve(result);
          } else {
            callback.reject(new Error(error));
          }
          callbacksRef.current.delete(id);
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [workerPath]);

  // 執行任務
  const executeTask = useCallback((type, data) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Web Worker not available'));
        return;
      }

      const id = ++taskIdRef.current;
      callbacksRef.current.set(id, { resolve, reject });

      workerRef.current.postMessage({ id, type, data });
    });
  }, []);

  // 計算天梯分數
  const calculateLadderScore = useCallback(
    data => executeTask('CALCULATE_LADDER_SCORE', data),
    [executeTask]
  );

  // 計算雷達圖數據
  const calculateRadarData = useCallback(
    data => executeTask('CALCULATE_RADAR_DATA', data),
    [executeTask]
  );

  return {
    calculateLadderScore,
    calculateRadarData,
    processUserStats: data => executeTask('PROCESS_USER_STATS', data),
    optimizeImage: data => executeTask('OPTIMIZE_IMAGE_DATA', data),
    isSupported: !!workerRef.current,
  };
};
```

**Worker 文件：** `public/workers/calculationWorker.js`

```javascript
// public/workers/calculationWorker.js
self.onmessage = function (e) {
  const { type, data, id } = e.data;

  try {
    let result;

    switch (type) {
      case 'CALCULATE_LADDER_SCORE':
        result = calculateLadderScore(data);
        break;
      case 'CALCULATE_RADAR_DATA':
        result = calculateRadarData(data);
        break;
      case 'PROCESS_USER_STATS':
        result = processUserStats(data);
        break;
      case 'OPTIMIZE_IMAGE_DATA':
        result = optimizeImageData(data);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    self.postMessage({ id, success: true, result });
  } catch (error) {
    self.postMessage({ id, success: false, error: error.message });
  }
};
```

**使用範例：**

```javascript
import useWebWorker from './hooks/useWebWorker';

function MyComponent() {
  const worker = useWebWorker('/workers/calculationWorker.js');

  const handleCalculate = async () => {
    try {
      const score = await worker.calculateLadderScore({
        strength: 80,
        cardio: 75,
        power: 85,
      });
      console.log('天梯分數:', score);
    } catch (error) {
      console.error('計算失敗:', error);
    }
  };

  return <button onClick={handleCalculate}>計算分數</button>;
}
```

### Service Worker

**技術：** Service Worker API（瀏覽器原生支援）

**用途：** 提供離線快取、背景同步、推送通知

**使用場景：** TWA（Trusted Web Activity）支援、離線備援、快取策略

**註冊方式：**

```javascript
// src/index.jsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker 註冊成功');
    })
    .catch(error => {
      console.error('Service Worker 註冊失敗:', error);
    });
}
```

**注意：** 本專案中 Service Worker 已停用以解決快取問題，但技術棧支持此功能。

### 優點

- **非阻塞執行：** Web Workers 在背景線程運行，不阻塞主線程
- **性能提升：** 計算密集型任務不會影響 UI 響應性
- **離線支援：** Service Worker 提供離線快取能力
- **TWA 支援：** Service Worker 是 TWA 的必要組件

---

## 二十五、React 進階特性

### 代碼分割（Code Splitting）

#### React.lazy

**用途：** 動態導入組件，實現按需載入

**使用方式：**

```javascript
// src/App.jsx
import React, { Suspense } from 'react';

const WelcomeSplash = React.lazy(() => import('./WelcomeSplash'));
const LandingPage = React.lazy(() => import('./LandingPage'));
const UserInfo = React.lazy(() => import('./UserInfo'));
const Strength = React.lazy(() => import('./Strength'));
const Cardio = React.lazy(() => import('./Cardio'));
const Power = React.lazy(() => import('./Power'));
const Muscle = React.lazy(() => import('./Muscle'));
const FFMI = React.lazy(() => import('./FFMI'));
const Login = React.lazy(() => import('./Login'));
const History = React.lazy(() => import('./History'));
const Ladder = React.lazy(() => import('./components/Ladder'));
const Settings = React.lazy(() => import('./components/Settings'));
const Community = React.lazy(() => import('./components/Community'));
const FriendFeed = React.lazy(() => import('./components/FriendFeed'));
```

**優點：**

- 減少初始載入時間
- 按需載入，減少不必要的代碼下載
- 改善應用程式啟動性能

### Suspense

**用途：** 處理異步組件載入，顯示載入狀態

**使用方式：**

```javascript
import { Suspense } from 'react';

<Suspense fallback={<div>載入中...</div>}>
  <Routes>
    <Route path="/user-info" element={<UserInfo />} />
    <Route path="/strength" element={<Strength />} />
    {/* 其他路由 */}
  </Routes>
</Suspense>;
```

### ErrorBoundary（錯誤邊界）

**用途：** 捕獲 React 組件樹中的 JavaScript 錯誤

**實現方式：**

```javascript
// src/App.jsx
class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary 捕獲錯誤:', error, errorInfo);

    // 記錄錯誤到性能監控
    if (performanceMonitor) {
      performanceMonitor.logError(error, 'ErrorBoundary');
    }

    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>🚨 發生錯誤</h2>
          <p>應用程式發生錯誤，請重新整理頁面</p>
          <button onClick={() => window.location.reload()}>重新整理</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用方式
<ErrorBoundary>
  <Suspense fallback={<div>載入中...</div>}>
    <AppContent />
  </Suspense>
</ErrorBoundary>;
```

**功能：**

- 捕獲組件渲染期間的錯誤
- 顯示友好的錯誤訊息
- 記錄錯誤到監控系統
- 防止整個應用程式崩潰

### 最佳實踐

1. **代碼分割：** 使用 React.lazy 進行路由級代碼分割
2. **載入狀態：** 使用 Suspense 提供載入反饋
3. **錯誤處理：** 使用 ErrorBoundary 捕獲錯誤
4. **性能優化：** 只在需要時載入組件

---

## 二十六、自定義 React Hooks

### 1. useWebWorker

**用途：** 封裝 Web Worker 使用邏輯

**位置：** `src/hooks/useWebWorker.js`

**功能：**

- 自動初始化和管理 Worker 生命週期
- 提供 Promise 風格的 API
- 自動清理和錯誤處理
- 支援多種計算任務（天梯分數、雷達圖、統計、圖片優化）

### 2. useResourcePreloader

**用途：** 預加載資源（圖片、腳本、樣式表）

**位置：** `src/hooks/useResourcePreloader.js`

**功能：**

```javascript
const useResourcePreloader = (resources = [], options = {}) => {
  const {
    priority = 'low', // 'low' | 'high'
    timeout = 10000, // 超時時間（毫秒）
    retryCount = 3, // 重試次數
    onProgress = null, // 進度回調
    onComplete = null, // 完成回調
    onError = null, // 錯誤回調
  } = options;

  // 返回狀態和方法
  return {
    loadedResources, // 已載入的資源
    loadingResources, // 正在載入的資源
    failedResources, // 載入失敗的資源
    isLoading, // 是否正在載入
    progress, // 載入進度（0-100）
    preloadResource, // 預加載單個資源
    preloadAll, // 預加載所有資源
    preloadSpecific, // 預加載特定資源
  };
};
```

**使用範例：**

```javascript
const resources = [
  { url: '/images/hero.jpg', type: 'image' },
  { url: '/scripts/utils.js', type: 'script' },
];

const preloader = useResourcePreloader(resources, {
  priority: 'high',
  onProgress: progress => console.log(`載入進度: ${progress}%`),
  onComplete: () => console.log('所有資源載入完成'),
});
```

### 3. useIntersectionObserver

**用途：** 檢測元素是否進入視窗

**位置：** `src/hooks/useIntersectionObserver.js`

**功能：**

```javascript
const useIntersectionObserver = (options = {}, dependencies = []) => {
  const defaultOptions = {
    threshold: 0.1, // 觸發閾值
    rootMargin: '0px', // 根邊距
  };

  return {
    elementRef, // 元素引用
    isIntersecting, // 是否進入視窗
    hasIntersected, // 是否曾經進入過視窗
    startObserving, // 開始觀察
    stopObserving, // 停止觀察
    restartObserving, // 重新開始觀察
  };
};
```

**使用範例：**

```javascript
const { elementRef, isIntersecting } = useIntersectionObserver({
  threshold: 0.5,
});

return (
  <div ref={elementRef}>
    {isIntersecting ? '元素已進入視窗' : '元素未進入視窗'}
  </div>
);
```

### 4. useDataCache

**用途：** 實現數據快取，減少重複請求

**位置：** `src/hooks/useDataCache.js`

**功能：**

```javascript
const useDataCache = (cacheKey, fetchFunction, options = {}) => {
  const {
    cacheTime = 5 * 60 * 1000, // 快取時間（預設 5 分鐘）
    enabled = true, // 是否啟用快取
    onSuccess, // 成功回調
    onError, // 錯誤回調
    dependencies = [], // 依賴數組
  } = options;

  return {
    data, // 快取的數據
    loading, // 是否正在載入
    error, // 錯誤訊息
    isCacheValid, // 快取是否有效
    getCachedData, // 獲取快取數據
    setCachedData, // 設置快取數據
    clearCache, // 清除快取
    clearAllCache, // 清除所有快取
    fetchData, // 獲取數據
    refetch, // 重新獲取
  };
};
```

**使用範例：**

```javascript
const { data, loading, error } = useDataCache(
  'user-profile',
  () => fetchUserProfile(userId),
  {
    cacheTime: 10 * 60 * 1000, // 10 分鐘
    dependencies: [userId],
  }
);
```

### 5. ScrollToTop Hook

**用途：** 路由切換時自動滾動到頂部

**位置：** `src/ScrollToTop.js`

**功能：**

```javascript
import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(null);

  useLayoutEffect(() => {
    // 根據路由決定滾動行為
    if (pathname === '/user-info') {
      // 特殊處理：滾動到雷達圖區塊
      const radarSection = document.getElementById('radar-section');
      if (radarSection) {
        radarSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // 預設：滾動到頂部
      window.scrollTo(0, 0);
    }

    prevPathnameRef.current = pathname;
  }, [pathname]);

  return null;
}
```

**使用方式：**

```javascript
<Router>
  <ScrollToTop />
  <Routes>{/* 路由配置 */}</Routes>
</Router>
```

### 最佳實踐

1. **封裝通用邏輯：** 將重複的邏輯封裝成自定義 Hooks
2. **命名規範：** 使用 `use` 前綴命名自定義 Hooks
3. **性能優化：** 使用 `useCallback` 和 `useMemo` 優化性能
4. **錯誤處理：** 在 Hooks 中處理錯誤，提供友好的錯誤訊息
5. **文檔說明：** 為每個 Hook 添加清晰的 JSDoc 註釋

---

## 二十七、開發工具和監控系統

### 1. 性能監控（Performance Monitor）

**位置：** `src/utils/performanceMonitor.js`

**功能：**

```javascript
class PerformanceMonitor {
  // 監控指標
  metrics = {
    pageLoadTimes: {},        // 頁面載入時間
    componentRenderTimes: {},  // 組件渲染時間
    apiCallTimes: {},          // API 調用時間
    memoryUsage: [],           // 記憶體使用情況
    errors: [],                // 錯誤記錄
  };

  // 方法
  start()                      // 啟動監控
  stop()                       // 停止監控
  startPageLoad(pageName)      // 開始監控頁面載入
  measurePageLoad(pageName)    // 測量頁面載入時間
  measureComponentRender(name, time)  // 測量組件渲染時間
  measureApiCall(apiName, time)       // 測量 API 調用時間
  measureMemoryUsage()                // 測量記憶體使用
  logError(error, context)            // 記錄錯誤
  getStats()                          // 獲取統計數據
  generateOptimizationSuggestions()   // 生成優化建議
}
```

**使用範例：**

```javascript
import performanceMonitor from './utils/performanceMonitor';

// 啟動監控
performanceMonitor.start();

// 監控頁面載入
performanceMonitor.startPageLoad('/user-info');
performanceMonitor.measurePageLoad('/user-info');

// 記錄錯誤
performanceMonitor.logError(error, 'Component');

// 獲取統計
const stats = performanceMonitor.getStats();
console.log('性能統計:', stats);
```

### 2. Firebase 寫入監控（Firebase Monitor）

**位置：** `src/utils/firebaseMonitor.js`

**功能：**

```javascript
class FirebaseWriteMonitor {
  // 監控寫入操作
  writeCounts = {
    setDoc: 0,
    updateDoc: 0,
    addDoc: 0,
    writeBatch: 0,
    arrayUnion: 0,
    arrayRemove: 0,
  };
  writeHistory = [];

  // 方法
  start()                               // 啟動監控
  stop()                                // 停止監控
  logWrite(operation, collection, docId, data)  // 記錄寫入操作
  getStats()                            // 獲取統計數據
  detectAnomalies()                     // 檢測異常寫入模式
  reset()                               // 重置統計
}
```

**使用範例：**

```javascript
import firebaseWriteMonitor from './utils/firebaseMonitor';

// 啟動監控
firebaseWriteMonitor.start();

// 記錄寫入操作
firebaseWriteMonitor.logWrite('updateDoc', 'users', userId, {
  friends: 'arrayUnion',
});

// 獲取統計
const stats = firebaseWriteMonitor.getStats();
console.log('Firebase 寫入統計:', stats);
```

### 3. AdMob 合規檢查（AdMob Compliance）

**位置：** `src/utils/adMobCompliance.js`

**功能：**

```javascript
export const AdMobCompliance = {
  // 檢查內容政策
  checkContentPolicy(pageName, pageContent),

  // 檢查廣告放置
  checkAdPlacement(pageName, adPosition),

  // 檢查是否為低內容頁面
  isLowContentPage(pageName),

  // 檢查是否為導航頁面
  isNavigationPage(pageName),

  // 生成合規報告
  generateComplianceReport(pageName, pageContent, adConfig),
};
```

**使用範例：**

```javascript
import { preAdDisplayCheck } from './utils/adMobCompliance';

const canShowAd = preAdDisplayCheck(currentPage, pageContent);
if (!canShowAd) {
  console.warn('不符合 AdMob 政策，不顯示廣告');
}
```

### 4. 評論限制器（Comment Limiter）

**位置：** `src/utils/commentLimiter.js`

**功能：**

```javascript
export const COMMENT_LIMITS = {
  SINGLE_POST_MAX: 500, // 單一貼文留言上限
  MESSAGE_BOARD_MAX: 1000, // 留言板總留言上限
  WARNING_THRESHOLD: 0.9, // 警告閾值（90%）
  AUTO_CLEANUP_KEEP: 50, // 自動清理時保留數量
};

// 函數
checkCommentLimit(comments, type); // 檢查留言數量限制
autoCleanupComments(comments, type); // 自動清理舊留言
getCommentStats(comments, type); // 獲取留言統計
```

**使用範例：**

```javascript
import {
  checkCommentLimit,
  processCommentAddition,
} from './utils/commentLimiter';

const limitCheck = checkCommentLimit(comments, 'post');
if (limitCheck.isAtLimit) {
  console.warn('已達到留言上限');
}

const result = processCommentAddition(newComment, comments, 'post');
if (result.shouldCleanup) {
  // 執行清理
}
```

### 5. Bundle 分析器（Bundle Analyzer）

**位置：** `src/utils/bundleAnalyzer.js`

**功能：**

```javascript
class BundleAnalyzer {
  analysis = {
    totalSize: 0,              // 總大小
    chunks: [],                // Chunk 列表
    unusedModules: [],         // 未使用的模組
    duplicateModules: [],      // 重複的模組
    recommendations: [],       // 優化建議
  };

  // 方法
  analyzeBundle()              // 分析 Bundle
  analyzeLoadedScripts()       // 分析已載入的腳本
  analyzeUnusedModules()       // 分析未使用的模組
  analyzeDuplicateModules()    // 分析重複模組
  generateRecommendations()    // 生成優化建議
  logReport()                 // 輸出報告
}
```

### 6. 除錯主控工具（Debug Master）

**位置：** `src/utils/debugMaster.js`

**功能：**

```javascript
class DebugMaster {
  // 整合所有監控工具
  performanceMonitor,          // 性能監控
  firebaseMonitor,             // Firebase 監控

  // 方法
  start()                      // 啟動所有監控
  stop()                       // 停止所有監控
  getReport()                  // 獲取完整報告
  getRecommendations()         // 獲取優化建議
}
```

### 7. Vite 自定義插件

**位置：** `vite.config.js`

**插件：** `copy-well-known`

**功能：** 在建置完成後自動複製 `.well-known/assetlinks.json` 到 `dist` 目錄

```javascript
{
  name: 'copy-well-known',
  closeBundle() {
    // 複製 .well-known/assetlinks.json
    // 用於 Android App Links 驗證
  },
}
```

### 使用範例

```javascript
// 整合使用
import performanceMonitor from './utils/performanceMonitor';
import firebaseWriteMonitor from './utils/firebaseMonitor';
import { DebugMaster } from './utils/debugMaster';

// 方式 1：單獨使用
performanceMonitor.start();
firebaseWriteMonitor.start();

// 方式 2：使用 Debug Master（整合所有工具）
const debugMaster = new DebugMaster();
debugMaster.start();

// 獲取完整報告
const report = debugMaster.getReport();
const recommendations = debugMaster.getRecommendations();
```

### 最佳實踐

1. **性能監控：** 在生產環境啟用性能監控，追蹤關鍵指標
2. **錯誤追蹤：** 記錄所有錯誤，便於診斷問題
3. **Firebase 監控：** 監控 Firebase 寫入頻率，避免異常寫入
4. **AdMob 合規：** 確保廣告顯示符合 AdMob 政策
5. **自動清理：** 使用評論限制器自動清理舊數據
6. **Bundle 優化：** 定期分析 Bundle 大小，優化代碼分割

---

**最後更新日期：** 2025 年 11 月 2 日
**適用版本：** 所有依賴的最新穩定版本
**維護狀態：** 定期更新
