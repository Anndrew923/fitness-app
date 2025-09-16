# Google Play Console 問題修復指南

## 🔍 發現的問題

經過詳細檢查，發現以下問題導致 Google Play Console 內部測試無法正常使用：

### 1. Firebase 環境變數不完整

- `.env` 檔案缺少 `VITE_FIREBASE_APP_ID`
- 這會導致生產環境的 Firebase 初始化失敗

### 2. Android 配置問題

- `compileSdkVersion` 和 `targetSdkVersion` 版本不匹配（已修復）
- AndroidManifest.xml 中的 meta-data 錯誤（已修復）

### 3. TWA 配置問題

- 缺少 Digital Asset Links 驗證檔案
- 某些配置可能不正確

## 🛠️ 修復步驟

### 步驟 1: 完善 Firebase 配置

在 `.env` 檔案中添加缺少的環境變數：

```bash
# 在 .env 檔案末尾添加
VITE_FIREBASE_APP_ID=1:51448990869:web:your_actual_app_id_here
```

**重要**: 請將 `your_actual_app_id_here` 替換為您 Firebase 專案中的實際 App ID。

### 步驟 2: 獲取正確的 Firebase App ID

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案 `fitness-app-69f08`
3. 點擊齒輪圖示 → 專案設定
4. 在「一般」標籤中找到「您的應用程式」區段
5. 複製 Web 應用程式的 App ID

### 步驟 3: 更新 Digital Asset Links

1. 獲取您的應用程式簽名指紋：

   ```bash
   keytool -list -v -keystore android.keystore -alias android
   ```

2. 更新 `public/.well-known/assetlinks.json` 中的 SHA256 指紋

### 步驟 4: 重新構建和部署

```bash
# 清理並重新構建
rmdir /s /q dist
npm run build

# 重新生成 Android APK
cd app
./gradlew assembleRelease
```

## 🔧 已修復的問題

✅ Android SDK 版本配置已統一為 35
✅ AndroidManifest.xml 中的 meta-data 錯誤已修復
✅ 創建了 Digital Asset Links 檔案模板
✅ 構建過程已優化

## 📋 檢查清單

在重新上傳到 Google Play Console 之前，請確認：

- [ ] `.env` 檔案包含完整的 Firebase 配置
- [ ] `public/.well-known/assetlinks.json` 包含正確的 SHA256 指紋
- [ ] 應用程式可以正常構建
- [ ] 在本地測試中 Firebase 功能正常運作
- [ ] TWA 可以正確載入您的網站

## 🚨 常見問題

### 問題 1: Firebase 初始化失敗

**解決方案**: 檢查 `.env` 檔案中的 `VITE_FIREBASE_APP_ID` 是否正確

### 問題 2: TWA 無法載入網站

**解決方案**: 確認 `public/.well-known/assetlinks.json` 中的指紋正確

### 問題 3: 應用程式崩潰

**解決方案**: 檢查 Android 日誌，通常與 Firebase 配置或網路權限有關

## 📞 需要協助

如果問題仍然存在，請提供：

1. Google Play Console 的錯誤日誌
2. 應用程式的崩潰報告
3. Firebase 控制台中的錯誤訊息

這樣我可以提供更精確的解決方案。
