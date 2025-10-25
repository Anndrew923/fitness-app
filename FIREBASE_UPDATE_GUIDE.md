# Firebase 金鑰更新指南

## 更新日期：2025-10-24

## 專案：最強肉體 (Ultimate Physique)

### 新金鑰庫資訊

- **金鑰庫路徑：** `C:\Users\User\AndroidSigning\fitness-app.keystore`
- **金鑰庫密碼：** `FitnessApp2025!`
- **金鑰別名：** `fitnesskey`
- **新 SHA-1 指紋：** `31:85:82:8C:3D:0C:FB:0D:F7:D9:76:65:1B:91:FF:CD:E8:18:0E:59`

### 需要更新的 Firebase 設定

#### 1. Firebase Console 設定

**步驟：**

1. 登入 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案
3. 點擊 **專案設定** (齒輪圖示)
4. 選擇 **一般** 標籤
5. 找到 **Android 應用程式** 區段
6. 點擊你的 Android 應用程式
7. 在 **SHA 憑證指紋** 區段中：
   - 新增新的 SHA-1 指紋：`31:85:82:8C:3D:0C:FB:0D:F7:D9:76:65:1B:91:FF:CD:E8:18:0E:59`
   - 保留舊的指紋（如果有的話）

#### 2. 下載新的 google-services.json

**步驟：**

1. 在 Firebase Console 中
2. 點擊 **下載 google-services.json**
3. 將檔案儲存到：`android/app/google-services.json`
4. 替換現有檔案（如果存在）

#### 3. 驗證設定

**檢查項目：**

- [ ] SHA-1 指紋已新增到 Firebase Console
- [ ] google-services.json 已下載並放置正確位置
- [ ] 專案已重新同步
- [ ] Firebase 功能正常運作

### 重要提醒

- **新金鑰庫位置：** 不在 Dropbox 中，避免同步問題
- **SHA-1 指紋：** 必須與新金鑰庫匹配
- **google-services.json：** 必須包含新的 SHA-1 指紋
- **專案同步：** 更新後需要重新同步專案

### 故障排除

**如果 Firebase 登入仍有問題：**

1. 確認 SHA-1 指紋已正確新增
2. 確認 google-services.json 是最新版本
3. 重新同步專案
4. 清除應用程式快取
5. 重新安裝應用程式

### 聯絡資訊

如有問題，請參考：

- Firebase 官方文件
- Android Studio 建置日誌
- 專案建置狀態

