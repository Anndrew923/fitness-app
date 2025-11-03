# 上傳與認證金鑰完整備忘錄

**建立日期：** 2025年11月2日
**專案名稱：** 最強肉體 (Ultimate Physique)
**套件名稱：** `com.ultimatephysique.fitness2025`

---

## 📦 一、上傳金鑰配置（Google Play Console）

### Keystore 資訊

| 項目 | 值 |
|------|-----|
| **Keystore 檔案路徑** | `C:\Users\User\AndroidSigning\fitness-app.keystore` |
| **Store Password** | `FitnessApp2025!` |
| **Key Alias** | `fitnesskey` |
| **Key Password** | `FitnessApp2025!` |

### 憑證指紋（Certificate Fingerprints）

| 類型 | 值 |
|------|-----|
| **SHA-1** | `31:85:82:8C:3D:0C:FB:0D:F7:D9:76:65:1B:91:FF:CD:E8:18:0E:59` |
| **SHA-1 (小寫，無冒號)** | `3185828c3d0cfb0df7d976651b91ffcde8180e59` |
| **MD5** | `E6:D7:BF:AD:39:9F:15:58:09:FA:BA:69:D1:99:0F:73` |

### 憑證資訊

- **CN (Common Name):** Ultimate Physique
- **OU (Organizational Unit):** Development
- **O (Organization):** Ultimate Physique
- **L (Locality):** Taipei
- **ST (State):** Taipei
- **C (Country):** TW
- **有效期:** 25 年
- **金鑰演算法:** RSA 2048 位元
- **簽名演算法:** SHA256withRSA

### Google Play Console 上傳金鑰狀態

- **狀態：** 已提交更新申請
- **生效日期：** 2025年11月4日 3:22 PM (UTC)
- **新上傳金鑰 SHA-1：** `31:85:82:8C:3D:0C:FB:0D:F7:D9:76:65:1B:91:FF:CD:E8:18:0E:59`
- **PEM 檔案位置：** `C:\Users\User\Desktop\upload_certificate.pem`

### 配置檔案位置

- **build.gradle:** `android/app/build.gradle`
- **搜尋關鍵字：** `signingConfigs` 或 `storeFile` 或 `fitness-app.keystore`
- **快速定位命令：**
```powershell
Select-String -Path "android/app/build.gradle" -Pattern "signingConfigs|storeFile|fitness-app.keystore"
```

```gradle
signingConfigs {
    release {
        storeFile file('C:\\Users\\User\\AndroidSigning\\fitness-app.keystore')
        storePassword 'FitnessApp2025!'
        keyAlias 'fitnesskey'
        keyPassword 'FitnessApp2025!'
    }
}
```

---

## 🔐 二、Google 認證配置

### Web Client ID (完整版本)

**Client ID：** `5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com`

> ⚠️ **重要：** 必須在所有配置檔案中使用**完整版本**，不能使用簡短版本。

### 配置檔案位置

#### 1. AndroidManifest.xml
**檔案：** `android/app/src/main/AndroidManifest.xml`
**搜尋關鍵字：** `GOOGLE_SIGN_IN_CLIENT_ID` 或 `com.google.android.gms.auth.GOOGLE_SIGN_IN_CLIENT_ID`
**快速定位命令：**
```powershell
Select-String -Path "android/app/src/main/AndroidManifest.xml" -Pattern "GOOGLE_SIGN_IN_CLIENT_ID"
```

```xml
<meta-data
    android:name="com.google.android.gms.auth.GOOGLE_SIGN_IN_CLIENT_ID"
    android:value="5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com" />
```

#### 2. strings.xml
**檔案：** `android/app/src/main/res/values/strings.xml`
**搜尋關鍵字：** `server_client_id`
**快速定位命令：**
```powershell
Select-String -Path "android/app/src/main/res/values/strings.xml" -Pattern "server_client_id"
```

```xml
<string name="server_client_id">5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com</string>
```

#### 3. capacitor.config.json
**檔案：** `capacitor.config.json`
**搜尋關鍵字：** `serverClientId` 或在 `GoogleAuth` 區塊內
**快速定位命令：**
```powershell
Select-String -Path "capacitor.config.json" -Pattern "serverClientId|GoogleAuth"
```

```json
"GoogleAuth": {
  "scopes": ["profile", "email"],
  "serverClientId": "5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com",
  "forceCodeForRefreshToken": true
}
```

#### 4. nativeGoogleAuth.js
**檔案：** `src/utils/nativeGoogleAuth.js`
**搜尋關鍵字：** `GoogleAuth.initialize` 或 `clientId:`
**快速定位命令：**
```powershell
Select-String -Path "src/utils/nativeGoogleAuth.js" -Pattern "GoogleAuth.initialize|clientId:"
```

```javascript
await GoogleAuth.initialize({
  clientId: '5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});
```

---

## 🔥 三、Firebase 配置

### Firebase 專案資訊

| 項目 | 值 |
|------|-----|
| **專案編號 (Project Number)** | `5144099869` |
| **專案 ID (Project ID)** | `fitness-app-69f08` |
| **Storage Bucket** | `fitness-app-69f08.firebasestorage.app` |
| **Mobile SDK App ID** | `1:5144099869:android:49fb1163c8b18ff0ce1af4` |

### OAuth Client IDs

#### Android Client ID (client_type: 1)
**Client ID：** `5144099869-n8eqotfij5eg6gv97e9s83l22kgqgm6i.apps.googleusercontent.com`
**SHA-1 指紋：** `3185828c3d0cfb0df7d976651b91ffcde8180e59`
**套件名稱：** `com.ultimatephysique.fitness2025`

#### Web Client ID (client_type: 3)
**Client ID：** `5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com`

### API Key

**API Key：** `AIzaSyBepeUQJpu0wPI0Y_G3NadXsf8_UJmwM1M`

### google-services.json

**檔案位置：** `android/app/google-services.json`
**配置版本：** 1

**重要配置：**
- ✅ SHA-1 指紋已正確配置：`3185828c3d0cfb0df7d976651b91ffcde8180e59`
- ✅ Web Client ID 為完整版本
- ✅ Android Client ID 已正確配置

---

## 📱 四、AdMob 配置

### AdMob App ID

**App ID：** `ca-app-pub-5869708488609837~6490454632`

### 配置檔案位置

**檔案：** `android/app/src/main/AndroidManifest.xml`
**搜尋關鍵字：** `APPLICATION_ID` 或 `com.google.android.gms.ads.APPLICATION_ID` 或 `ca-app-pub-5869708488609837`
**快速定位命令：**
```powershell
Select-String -Path "android/app/src/main/AndroidManifest.xml" -Pattern "APPLICATION_ID|ca-app-pub-5869708488609837"
```

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-5869708488609837~6490454632"/>
```

**檔案：** `capacitor.config.json`
**搜尋關鍵字：** `AdMob` 或 `appId` (在 AdMob 區塊內)
**快速定位命令：**
```powershell
Select-String -Path "capacitor.config.json" -Pattern "AdMob|ca-app-pub-5869708488609837"
```

```json
"AdMob": {
  "appId": "ca-app-pub-5869708488609837~6490454632"
}
```

---

## 📋 五、應用程式版本資訊

### 當前版本

| 項目 | 值 |
|------|-----|
| **versionCode** | `14` |
| **versionName** | `"1.14"` |
| **applicationId** | `com.ultimatephysique.fitness2025` |

### 配置檔案位置

**檔案：** `android/app/build.gradle`
**搜尋關鍵字：** `versionCode` 或 `versionName`
**快速定位命令：**
```powershell
Select-String -Path "android/app/build.gradle" -Pattern "versionCode|versionName"
```

```gradle
versionCode 14
versionName "1.14"
```

### 版本號規則

- ✅ **必須遞增：** versionCode 必須大於 Google Play Console 中的現有版本
- ✅ **當前狀態：** versionCode 14 大於現有的 13 ✅
- ✅ **下次更新：** 建議使用 versionCode 15, versionName "1.15"

---

## ✅ 六、配置驗證檢查清單

### 上傳金鑰驗證

- [x] Keystore 檔案存在於正確位置
- [x] SHA-1 指紋與 Google Play Console 一致
- [x] SHA-1 指紋已添加到 Firebase Console
- [x] build.gradle 中的簽名配置正確
- [x] Google Play Console 上傳金鑰已更新申請

### Google 認證驗證

- [x] AndroidManifest.xml 中的 Client ID 為完整版本
- [x] strings.xml 中的 Client ID 為完整版本
- [x] capacitor.config.json 中的 Client ID 為完整版本
- [x] nativeGoogleAuth.js 中的 Client ID 為完整版本
- [x] 所有配置檔案中的 Client ID 一致

### Firebase 配置驗證

- [x] google-services.json 中的 SHA-1 指紋正確
- [x] google-services.json 中的 Web Client ID 為完整版本
- [x] google-services.json 中的 Android Client ID 正確
- [x] Firebase Console 中的 SHA-1 指紋已更新

### AdMob 配置驗證

- [x] AndroidManifest.xml 中的 AdMob App ID 正確
- [x] capacitor.config.json 中的 AdMob App ID 正確

---

## 🔧 七、問題排查參考

### 問題 1：上傳 AAB 時出現「簽署金鑰錯誤」

**原因：** AAB 使用的簽名與 Google Play Console 期望的不同

**解決方案：**
1. 確認 build.gradle 中的 keystore 路徑正確
2. 確認 Google Play Console 已更新上傳金鑰
3. 等待上傳金鑰生效（通常 24-48 小時）
4. 使用正確的 keystore 重新建置 AAB

**檢查命令：**
```powershell
keytool -list -v -keystore "C:\Users\User\AndroidSigning\fitness-app.keystore" -alias fitnesskey
```

### 問題 2：Google 登入失敗

**原因：** Client ID 配置不一致或不正確

**解決方案：**
1. 確認所有配置檔案使用**完整版本** Client ID
2. 確認 Firebase Console 中的 SHA-1 指紋正確
3. 確認 google-services.json 已更新
4. 確認 AndroidManifest.xml、strings.xml、capacitor.config.json、nativeGoogleAuth.js 中的 Client ID 一致

**檢查命令（快速檢查所有配置）：**
```powershell
# 檢查 AndroidManifest.xml
Select-String -Path "android/app/src/main/AndroidManifest.xml" -Pattern "GOOGLE_SIGN_IN_CLIENT_ID"

# 檢查 strings.xml
Select-String -Path "android/app/src/main/res/values/strings.xml" -Pattern "server_client_id"

# 檢查 capacitor.config.json
Select-String -Path "capacitor.config.json" -Pattern "serverClientId"

# 檢查 nativeGoogleAuth.js
Select-String -Path "src/utils/nativeGoogleAuth.js" -Pattern "clientId"

# 一次性檢查所有配置檔案（確保所有 Client ID 一致）
$clientId = "5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com"
Write-Host "檢查所有配置檔案中的 Client ID..." -ForegroundColor Cyan
Select-String -Path "android/app/src/main/AndroidManifest.xml","android/app/src/main/res/values/strings.xml","capacitor.config.json","src/utils/nativeGoogleAuth.js" -Pattern $clientId
```

### 問題 3：版本號被拒絕

**原因：** versionCode 小於或等於 Google Play Console 中的現有版本

**解決方案：**
1. 檢查 Google Play Console 中的最高 versionCode
2. 更新 build.gradle 中的 versionCode（必須大於現有版本）
3. 同步更新 versionName

**檢查命令：**
```powershell
Select-String -Path "android/app/build.gradle" -Pattern "versionCode|versionName"
```

---

## 📝 八、重要檔案位置清單

| 檔案 | 路徑 |
|------|------|
| **build.gradle** | `android/app/build.gradle` |
| **google-services.json** | `android/app/google-services.json` |
| **AndroidManifest.xml** | `android/app/src/main/AndroidManifest.xml` |
| **strings.xml** | `android/app/src/main/res/values/strings.xml` |
| **capacitor.config.json** | `capacitor.config.json` |
| **nativeGoogleAuth.js** | `src/utils/nativeGoogleAuth.js` |
| **Keystore** | `C:\Users\User\AndroidSigning\fitness-app.keystore` |
| **PEM 憑證** | `C:\Users\User\Desktop\upload_certificate.pem` |

---

## 🔄 九、更新流程

### 更新上傳金鑰後的建置流程

1. **確認上傳金鑰已生效**
   - 檢查 Google Play Console 通知
   - 確認生效日期已過

2. **更新版本號**
   - 編輯 `android/app/build.gradle`
   - 更新 `versionCode`（必須遞增）
   - 更新 `versionName`

3. **建置 AAB**
   ```powershell
   npm run build
   npx cap sync android
   cd android
   .\gradlew clean
   .\gradlew bundleRelease
   ```

4. **驗證 AAB 簽名**
   ```powershell
   jarsigner -verify -verbose -certs "android/app/build/outputs/bundle/release/app-release.aab"
   ```

5. **上傳到 Google Play Console**
   - 進入「封閉測試」或「正式版」
   - 上傳新的 AAB 檔案
   - 確認版本號和簽名正確

---

## ⚠️ 十、重要提醒

1. **所有 Client ID 必須一致**
   - 必須使用**完整版本** Client ID
   - 所有配置檔案中的 Client ID 必須完全相同

2. **SHA-1 指紋必須正確**
   - Firebase Console 中必須添加 SHA-1 指紋
   - google-services.json 中的 certificate_hash 必須與 SHA-1 一致

3. **版本號必須遞增**
   - versionCode 必須大於 Google Play Console 中的現有版本
   - 不能重複使用已上傳的 versionCode

4. **Keystore 安全**
   - 妥善保管 keystore 檔案和密碼
   - 建議備份 keystore 檔案到安全位置
   - 遺失 keystore 將無法更新應用程式

5. **上傳金鑰更新**
   - 更新上傳金鑰需要等待 Google 審核（通常 24-48 小時）
   - 更新期間無法上傳新的 AAB
   - 必須使用新金鑰簽署的 AAB 才能上傳

---

## 📞 十一、相關連結

- **Firebase Console:** https://console.firebase.google.com/
- **Google Play Console:** https://play.google.com/console/
- **Google Cloud Console:** https://console.cloud.google.com/
- **AdMob Console:** https://apps.admob.com/

---

## 📌 十二、定位方式說明

### 為什麼不使用行號？

> ⚠️ **重要：** 本備忘錄使用**搜尋關鍵字**而非行號來定位配置，因為：
> - 行號會因代碼變更而改變（新增/刪除代碼會影響行號）
> - 搜尋關鍵字（如 XML 屬性名、JSON key）是穩定的唯一標識符
> - 即使檔案結構改變，搜尋關鍵字依然有效

### 如何使用本備忘錄？

1. **使用搜尋關鍵字**：在 IDE 中使用 `Ctrl+F` 搜尋文件中標註的關鍵字
2. **使用快速定位命令**：在 PowerShell 中執行備忘錄提供的搜尋命令
3. **檢查配置值**：確認找到的配置值是否與備忘錄中的值一致

### 定位方式對照表

| 配置項目 | 搜尋關鍵字 | 適用檔案 |
|---------|-----------|---------|
| **Keystore 配置** | `signingConfigs` 或 `storeFile` | `build.gradle` |
| **Google Sign-In Client ID** | `GOOGLE_SIGN_IN_CLIENT_ID` | `AndroidManifest.xml` |
| **Google Sign-In Client ID** | `server_client_id` | `strings.xml` |
| **Google Sign-In Client ID** | `serverClientId` 或 `GoogleAuth` | `capacitor.config.json` |
| **Google Sign-In Client ID** | `GoogleAuth.initialize` 或 `clientId:` | `nativeGoogleAuth.js` |
| **AdMob App ID** | `APPLICATION_ID` 或 `ca-app-pub-5869708488609837` | `AndroidManifest.xml` |
| **AdMob App ID** | `AdMob` 或 `appId` | `capacitor.config.json` |
| **版本號** | `versionCode` 或 `versionName` | `build.gradle` |

---

**最後更新日期：** 2025年11月2日
**維護者：** 開發團隊
**文件狀態：** ✅ 已驗證所有配置正確
**定位方式：** ✅ 已更新為搜尋關鍵字定位（不受代碼變更影響）
