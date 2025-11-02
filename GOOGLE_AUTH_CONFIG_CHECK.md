# Google 登入配置檢查報告

## 檢查日期
2025-01-XX

## 發現的問題

### 問題 1：google-services.json 中的 Web Client ID 不一致 ⚠️ **關鍵問題**

**當前狀態：**

| 配置文件 | Client ID | 狀態 |
|---------|-----------|------|
| `google-services.json` (client_type: 3) | `5144099869-6kes2g.apps.googleusercontent.com` | ⚠️ 不完整/不一致 |
| `AndroidManifest.xml` | `5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com` | ✅ 正確 |
| `strings.xml` | `5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com` | ✅ 正確 |
| `capacitor.config.json` | `5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com` | ✅ 正確 |
| `nativeGoogleAuth.js` | `5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com` | ✅ 正確 |

**問題分析：**

1. `google-services.json` 中的 Web Client ID (`client_type: 3`) 是 `5144099869-6kes2g.apps.googleusercontent.com`，看起來不完整（只有前幾個字符）。
2. 其他所有配置文件都使用完整的 Client ID：`5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com`。
3. 這可能導致 Google 登入失敗，因為 Firebase 配置與實際使用的 Client ID 不匹配。

**解決方案：**

需要重新下載最新的 `google-services.json` 文件，確保 `client_type: 3` 的 `client_id` 是完整的 `5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com`。

---

## 配置一致性檢查

### ✅ 已正確配置的項目

1. **Client ID 一致性（4 個位置）**
   - ✅ `AndroidManifest.xml`: 使用 Web Client ID
   - ✅ `strings.xml`: 使用 Web Client ID
   - ✅ `capacitor.config.json`: 使用 Web Client ID
   - ✅ `nativeGoogleAuth.js`: 使用 Web Client ID

2. **SHA-1 指紋配置**
   - ✅ SHA-1: `31:85:82:8C:3D:0C:FB:0D:F7:D9:76:65:1B:91:FF:CD:E8:18:0E:59`
   - ✅ `google-services.json` 中的 `certificate_hash`: `3185828c3d0cfb0df7d976651b91ffcde8180e59`
   - ✅ 兩者匹配

3. **build.gradle 配置**
   - ✅ Project-level: `classpath 'com.google.gms:google-services:4.4.2'`
   - ✅ App-level: `apply plugin: 'com.google.gms.google-services'`
   - ✅ App-level: `implementation 'com.google.android.gms:play-services-auth:20.7.0'`

4. **AndroidManifest.xml 權限**
   - ✅ `android.permission.INTERNET`
   - ✅ `android.permission.ACCESS_NETWORK_STATE`
   - ✅ `android.permission.GET_ACCOUNTS`
   - ✅ `android.permission.USE_CREDENTIALS`

### ⚠️ 需要修正的項目

1. **google-services.json 更新**
   - ⚠️ 需要重新下載最新的 `google-services.json`
   - ⚠️ 確保 Web Client ID (`client_type: 3`) 是完整的 `5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com`

2. **Google Auth 初始化位置（建議改進）**
   - ⚠️ 當前：在 `SocialLogin.jsx` 中初始化（可能在每次顯示登入頁面時都初始化）
   - ✅ 建議：在 `App.jsx` 中全局初始化一次（應用啟動時）

---

## 修正步驟

### 步驟 1：重新下載 google-services.json

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 選擇專案：`fitness-app-69f08`
3. 點擊左側 ⚙️ **Project Settings**（專案設定）
4. 在 **General** 標籤中找到 **Your apps** 區塊
5. 找到 Android 應用程式：`com.ultimatephysique.fitness2025`
6. 點擊 **Download google-services.json**
7. 將下載的檔案替換到：`android/app/google-services.json`

### 步驟 2：驗證 google-services.json

**檢查項目：**

1. 打開 `android/app/google-services.json`
2. 找到 `other_platform_oauth_client` 區塊（`client_type: 3`）
3. 確認 `client_id` 是：`5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com`

**預期的 google-services.json 結構：**

```json
{
  "services": {
    "appinvite_service": {
      "other_platform_oauth_client": [
        {
          "client_id": "5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com",
          "client_type": 3
        }
      ]
    }
  }
}
```

### 步驟 3：驗證 SHA-1 指紋

**確認 Firebase Console 中的 SHA-1 指紋：**

1. 在 Firebase Console → Project Settings → Your apps → Android app
2. 檢查 **SHA certificate fingerprints** 區塊
3. 確認包含：`31:85:82:8C:3D:0C:FB:0D:F7:D9:76:65:1B:91:FF:CD:E8:18:0E:59`
4. 如果沒有，請添加：
   - 點擊 **Add fingerprint**
   - 輸入：`31:85:82:8C:3D:0C:FB:0D:F7:D9:76:65:1B:91:FF:CD:E8:18:0E:59`
   - 點擊 **Save**
5. 重新下載 `google-services.json`

### 步驟 4：同步配置

```bash
# 重新建置
npm run build

# 同步到 Android
npx cap sync android
```

### 步驟 5：清除快取（如果問題仍然存在）

```bash
# Windows PowerShell
cd android
.\gradlew clean
cd ..
rmdir /s /q node_modules\.vite
rmdir /s /q dist
npm run build
npx cap sync android
```

### 步驟 6：重新建置 APK

```bash
cd android
.\gradlew clean
.\gradlew assembleDebug
```

---

## 驗證檢查清單

### 修正前檢查

- [ ] `google-services.json` 中的 Web Client ID (`client_type: 3`) 是否為 `5144099869-6kes2g.apps.googleusercontent.com`（不完整）

### 修正後檢查

- [ ] `google-services.json` 中的 Web Client ID (`client_type: 3`) 是否為 `5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com`（完整）
- [ ] 所有配置文件中的 Client ID 是否一致
- [ ] SHA-1 指紋是否已添加到 Firebase Console
- [ ] `google-services.json` 中的 `certificate_hash` 是否與 SHA-1 匹配
- [ ] 已執行 `npm run build`
- [ ] 已執行 `npx cap sync android`
- [ ] 已重新建置 APK
- [ ] Google 登入功能是否正常工作

---

## 建議的改進

### 1. 將 Google Auth 初始化移到 App.jsx

**當前實現：** 在 `SocialLogin.jsx` 中初始化

**建議改進：** 在 `App.jsx` 中全局初始化一次

**優點：**
- 應用啟動時初始化一次
- 不會在每次顯示登入頁面時都初始化
- 更符合最佳實踐

---

## 問題診斷

### 如果 Google 登入仍然失敗

1. **檢查控制台日誌：**
   - 查看是否有 "✅ Google Auth 初始化成功" 訊息
   - 查看是否有 "❌ Google 登入失敗" 訊息
   - 查看錯誤詳情

2. **檢查配置一致性：**
   ```bash
   # PowerShell - 檢查所有配置文件中的 Client ID
   Select-String -Pattern "5144099869" -Path android\app\src\main\AndroidManifest.xml,capacitor.config.json,android\app\src\main\res\values\strings.xml,src\utils\nativeGoogleAuth.js
   ```

3. **檢查 SHA-1 指紋：**
   ```bash
   # 使用 Gradle 獲取當前 SHA-1
   cd android
   .\gradlew signingReport
   # 查找 "SHA1:" 後面的值
   ```

4. **清除所有快取並重新建置：**
   - 參見「步驟 5：清除快取」

---

## 聯絡資訊

如有問題，請參考：
- `GOOGLE_AUTH_SETUP_GUIDE.md` - 完整設定指南
- Firebase Console - 檢查專案設定
- Android Studio 建置日誌 - 查看錯誤詳情
