# Android APK 完整建置流程指南

## 📋 目錄

1. [標準建置流程](#標準建置流程)
2. [完整清理建置流程](#完整清理建置流程)
3. [快速建置流程](#快速建置流程)
4. [常見問題](#常見問題)
5. [重要提醒](#重要提醒)

---

## 標準建置流程

### ⚠️ 關鍵步驟說明

**必須按照以下順序執行，缺一不可：**

1. **建置 React 代碼** (`npm run build`)

   - 將 React 代碼編譯打包到 `dist` 目錄
   - 這是所有後續步驟的基礎

2. **同步到 Android** (`npx cap sync android`) ⭐ **最關鍵步驟**

   - 將 `dist` 目錄的內容複製到 `android/app/src/main/assets/public`
   - 同步 Capacitor 配置和插件
   - **如果跳過此步驟，APK 將包含舊代碼！**

3. **清理 Android 建置** (`gradlew clean`)

   - 清除之前的建置產物
   - 確保使用最新同步的代碼

4. **建置 APK** (`gradlew assembleRelease`)
   - 生成最終的 Release APK

### 📝 手動執行步驟

```powershell
# 1. 設置 JAVA_HOME（如果未設置）
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# 2. 建置 React 代碼
npm run build

# 3. 同步到 Android（關鍵步驟！）
npx cap sync android

# 4. 清理並建置 APK
cd android
.\gradlew.bat clean
.\gradlew.bat assembleRelease
cd ..

# 5. 檢查 APK
Get-Item "android\app\build\outputs\apk\release\app-release.apk"
```

### 🚀 使用自動化腳本

**快速建置（不清理緩存）：**

```bash
build-release-apk.bat
```

**完整清理建置（清理所有緩存）：**

```bash
build-clean-complete.bat
```

---

## 完整清理建置流程

### 適用場景

- 遇到奇怪的建置錯誤
- 代碼修改後 APK 未更新
- 需要完全乾淨的建置環境
- 長時間未建置後首次建置

### 執行步驟

1. **停止運行中的進程**

   - 關閉 Node.js、Java、Gradle 進程

2. **清除 Vite 快取**

   - 刪除 `node_modules/.vite`

3. **清除 dist 目錄**

   - 刪除 `dist` 目錄

4. **清除 Android build 目錄**

   - 刪除 `android/app/build`

5. **清除 Android assets**

   - 刪除 `android/app/src/main/assets`

6. **清除 Gradle 快取**

   - 刪除 `android/.gradle`
   - 執行 `gradlew clean`

7. **建置 Web 版本**

   - 執行 `npm run build`

8. **同步到 Android**

   - 執行 `npx cap sync android`

9. **建置 APK 和 AAB**
   - 執行 `gradlew assembleRelease`
   - 執行 `gradlew bundleRelease`

### 🚀 使用自動化腳本

```bash
build-clean-complete.bat
```

---

## 快速建置流程

### 適用場景

- 代碼剛修改完成
- 確定緩存沒有問題
- 需要快速生成 APK 測試

### 執行步驟

1. **設置 JAVA_HOME**
2. **建置 React 代碼** (`npm run build`)
3. **同步到 Android** (`npx cap sync android`)
4. **建置 APK** (`gradlew assembleRelease`)

### 🚀 使用自動化腳本

```bash
build-release-apk.bat
```

---

## 常見問題

### ❌ 問題 1：APK 不包含最新修改

**症狀：**

- 本地測試正常
- APK 中還是舊代碼

**原因：**

- 跳過了 `npx cap sync android` 步驟
- 或 `dist` 目錄未更新

**解決方案：**

1. 確認執行了 `npm run build`
2. 確認執行了 `npx cap sync android`
3. 檢查 `android/app/src/main/assets/public` 的時間戳記是否最新

### ❌ 問題 2：JAVA_HOME 未設置

**症狀：**

```
ERROR: JAVA_HOME is not set
```

**解決方案：**

```powershell
# 臨時設置（當前終端）
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# 永久設置（已配置在 android/gradle.properties）
org.gradle.java.home=C:\\Program Files\\Android\\Android Studio\\jbr
```

### ❌ 問題 3：dist 目錄被鎖定

**症狀：**

```
EBUSY: resource busy or locked, rmdir 'dist\assets'
```

**原因：**

- Dropbox 或其他程序正在同步檔案
- 檔案被其他進程佔用

**解決方案：**

1. 等待 Dropbox 同步完成
2. 關閉可能佔用檔案的程序
3. 使用完整清理建置流程

### ❌ 問題 4：Capacitor 同步失敗

**症狀：**

```
❌ 同步失敗
```

**解決方案：**

1. 確認 `dist` 目錄存在且包含 `index.html`
2. 確認 `capacitor.config.json` 配置正確
3. 檢查 Android 專案結構是否完整
4. 嘗試完整清理建置流程

---

## 重要提醒

### ⚠️ 必須執行的步驟

1. **`npm run build`** - 建置 React 代碼
2. **`npx cap sync android`** ⭐ **最關鍵！**
3. **`gradlew assembleRelease`** - 建置 APK

### ✅ 檢查清單

建置前確認：

- [ ] 代碼已保存
- [ ] 環境變數已設置（`.env` 檔案）
- [ ] JAVA_HOME 已設置（或使用 `gradle.properties`）

建置後確認：

- [ ] `dist` 目錄已生成
- [ ] `android/app/src/main/assets/public` 已更新
- [ ] APK 檔案時間戳記是最新的
- [ ] APK 檔案大小合理（約 6-8 MB）

### 📊 建置時間參考

- **React 建置**：約 10-15 秒
- **Capacitor 同步**：約 2-3 秒
- **Gradle 清理**：約 10-15 秒
- **APK 建置**：約 20-30 秒
- **總計**：約 45-60 秒（快速建置）

### 🔍 驗證建置成功

```powershell
# 檢查 APK 是否存在
Test-Path "android\app\build\outputs\apk\release\app-release.apk"

# 檢查 APK 資訊
$apk = Get-Item "android\app\build\outputs\apk\release\app-release.apk"
Write-Host "檔案大小: $([math]::Round($apk.Length / 1MB, 2)) MB"
Write-Host "生成時間: $($apk.LastWriteTime)"
```

### 📁 檔案位置

- **APK**：`android/app/build/outputs/apk/release/app-release.apk`
- **AAB**：`android/app/build/outputs/bundle/release/app-release.aab`
- **React 建置產物**：`dist/`
- **Android Assets**：`android/app/src/main/assets/public/`

---

## 版本歷史

- **2025-11-15**：建立完整建置流程文檔
- **2025-11-15**：添加 JAVA_HOME 配置說明
- **2025-11-15**：強調 `npx cap sync android` 的重要性

---

## 相關文檔

- [TECH_STACK_REFERENCE.md](./TECH_STACK_REFERENCE.md) - 技術棧參考
- [GOOGLE_AUTH_SETUP_GUIDE.md](./GOOGLE_AUTH_SETUP_GUIDE.md) - Google 登入設置
- [BUILD_ISSUE_ANALYSIS_REPORT.md](./BUILD_ISSUE_ANALYSIS_REPORT.md) - 建置問題分析

---

**最後更新**：2025-11-15  
**維護者**：開發團隊
