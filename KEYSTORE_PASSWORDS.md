# Keystore 密碼記錄

## 生成日期：2025-10-24

## 專案：最強肉體 (Ultimate Physique)

### 簽名配置

- **Store File:** `C:\Users\User\AndroidSigning\fitness-app.keystore`
- **Store Password:** `FitnessApp2025!`
- **Key Alias:** `fitnesskey`
- **Key Password:** `FitnessApp2025!`

### 憑證資訊

- **CN:** Ultimate Physique
- **OU:** Development
- **O:** Ultimate Physique
- **L:** Taipei
- **ST:** Taipei
- **C:** TW
- **有效期:** 25 年
- **金鑰演算法:** RSA 2048 位元
- **簽名演算法:** SHA256withRSA

### 使用說明

- 這些密碼用於 Release 版本簽名
- 請妥善保存，遺失後無法恢復
- 用於 Google Play Console 上傳
- 每次 Release 建置都需要這些密碼

### 備註

- 舊的 keystore 已備份為 `android.keystore.old`
- 新的 keystore 存放在專用資料夾 `C:\Users\User\AndroidSigning\`
- 避免 Dropbox 同步問題
- 所有配置已更新到 `android/app/build.gradle`

### 重要提醒

- **新金鑰庫位置：** `C:\Users\User\AndroidSigning\fitness-app.keystore`
- **新密碼：** `FitnessApp2025!`
- **存放位置：** 本地專用資料夾，不在 Dropbox 中
- **安全性：** 避免雲端同步造成的檔案損壞
