# 環境變數配置參考文檔

## 📋 概述

本文檔記錄了「最強肉體」App 所需的所有環境變數配置信息。當需要查找或重建 `.env` 文件時，可以參考本文檔。

**⚠️ 安全提示**：
- `.env` 文件不應該提交到 Git（已在 `.gitignore` 中）
- 本文檔只記錄配置說明和獲取方式，不包含真實的敏感信息
- 真實的配置值應保存在安全的地方（如密碼管理器）

---

## 🔍 快速查找指南

當需要查找 `.env` 配置時：

1. **查看本文檔**：了解所有需要的環境變數
2. **查看代碼默認值**：參考 `src/firebase.js` 和 `src/config/adConfig.js` 中的默認值
3. **查看模板文件**：參考 `env.example` 了解格式
4. **從控制台獲取**：按照本文檔的指引從 Firebase 和 AdMob 控制台獲取

---

## 🔥 Firebase 配置

### 環境變數列表

| 變數名 | 說明 | 必填 | 默認值來源 |
|--------|------|------|-----------|
| `VITE_FIREBASE_API_KEY` | Firebase API 密鑰 | 否 | `src/firebase.js` 第 9 行 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase 認證域名 | 否 | `src/firebase.js` 第 10 行 |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 專案 ID | 否 | `src/firebase.js` 第 11 行 |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase 儲存桶 | 否 | `src/firebase.js` 第 12 行 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase 訊息發送者 ID | 否 | `src/firebase.js` 第 13 行 |
| `VITE_FIREBASE_APP_ID` | Firebase 應用程式 ID | 否 | `src/firebase.js` 第 14 行 |

### 獲取方式

1. **前往 Firebase Console**：https://console.firebase.google.com/
2. **選擇您的專案**：`fitness-app-69f08`
3. **點擊齒輪圖示** → **專案設定**
4. **在「一般」標籤中** → 找到「您的應用程式」區段
5. **複製配置值**到對應的環境變數

### 代碼中的默認值（參考）

如果忘記配置，代碼中已有默認值作為 fallback：

```javascript
// src/firebase.js 第 8-15 行
const defaultConfig = {
  apiKey: 'AIzaSyCxl9ki92NaxmXmxB8kc-SCuN_Cmle-MwA',
  authDomain: 'fitness-app-69f08.firebaseapp.com',
  projectId: 'fitness-app-69f08',
  storageBucket: 'fitness-app-69f08.firebasestorage.app',
  messagingSenderId: '5144099869',
  appId: '1:5144099869:web:1df863a1fa04e89bce1af4',
};
```

**注意**：這些默認值用於開發環境，生產環境建議使用環境變數。

---

## 📱 AdMob 配置

### 環境變數列表

| 變數名 | 說明 | 必填 | 默認值來源 |
|--------|------|------|-----------|
| `VITE_ADMOB_APP_ID` | AdMob 應用程式 ID | 否 | `src/config/adConfig.js` 第 8 行 |
| `VITE_ADMOB_BANNER_ID` | AdMob 橫幅廣告單元 ID | 否 | `src/config/adConfig.js` 第 15 行 |
| `VITE_ADMOB_ENABLED` | AdMob 功能開關 | 否 | 默認為 `true` |
| `VITE_ADMOB_TEST_MODE` | AdMob 測試模式 | 否 | 默認為 `false` |

### 獲取方式

1. **前往 Google AdMob 控制台**：https://apps.admob.com/
2. **選擇您的應用程式**
3. **獲取應用程式 ID**：
   - 在「應用程式」標籤中找到應用程式
   - 點擊應用程式名稱
   - 在應用程式詳情中找到「應用程式 ID」
   - 格式：`ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`
4. **創建廣告單元並獲取 ID**：
   - 在「廣告單元」標籤中創建新的廣告單元
   - 選擇廣告格式（橫幅、插頁式等）
   - 複製廣告單元 ID
   - 格式：`ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

### 代碼中的默認值（參考）

如果忘記配置，代碼中已有默認值作為 fallback：

```javascript
// src/config/adConfig.js 第 6-8 行
appId: import.meta.env.VITE_ADMOB_APP_ID || 'ca-app-pub-5869708488609837~6490454632',

// src/config/adConfig.js 第 14-15 行
bottomBanner: import.meta.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-5869708488609837/1189068634',
```

**注意**：這些默認值用於開發環境，生產環境建議使用環境變數。

---

## ⚙️ 開發模式設定（可選）

### 環境變數列表

| 變數名 | 說明 | 必填 | 默認值 |
|--------|------|------|--------|
| `VITE_DEV_MODE` | 開發模式開關 | 否 | `false` |
| `VITE_DEBUG_MODE` | 調試模式開關 | 否 | `false` |

這些變數通常用於開發和調試，生產環境不需要設置。

---

## 📝 配置示例

### 完整的 .env 文件示例

```env
# Firebase 配置
VITE_FIREBASE_API_KEY=AIzaSyCxl9ki92NaxmXmxB8kc-SCuN_Cmle-MwA
VITE_FIREBASE_AUTH_DOMAIN=fitness-app-69f08.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fitness-app-69f08
VITE_FIREBASE_STORAGE_BUCKET=fitness-app-69f08.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=5144099869
VITE_FIREBASE_APP_ID=1:5144099869:web:1df863a1fa04e89bce1af4

# AdMob 配置
VITE_ADMOB_APP_ID=ca-app-pub-5869708488609837~6490454632
VITE_ADMOB_BANNER_ID=ca-app-pub-5869708488609837/1189068634
VITE_ADMOB_ENABLED=true
VITE_ADMOB_TEST_MODE=false

# 開發模式設定（可選）
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
```

---

## 🔧 如何重建 .env 文件

### 方法 1：使用模板文件（推薦）

```bash
# 1. 複製模板文件
cp env.example .env

# 2. 編輯 .env 文件，填入實際配置值
# 可以使用任何文本編輯器打開 .env 文件
```

### 方法 2：從代碼中提取默認值

如果忘記配置，可以：

1. **查看 `src/firebase.js`**：找到 `defaultConfig` 對象（第 8-15 行）
2. **查看 `src/config/adConfig.js`**：找到默認值（第 8、15 行）
3. **創建 `.env` 文件**：將這些值填入對應的環境變數

### 方法 3：從控制台重新獲取

按照本文檔的「獲取方式」章節，從 Firebase 和 AdMob 控制台重新獲取配置值。

---

## 📍 相關文件位置

| 文件 | 位置 | 說明 |
|------|------|------|
| `.env` | 根目錄 | 實際環境變數文件（不提交到 Git） |
| `env.example` | 根目錄 | 環境變數模板文件 |
| `ENV_CONFIG_REFERENCE.md` | 根目錄 | 本文檔（配置參考） |
| `src/firebase.js` | `src/` | Firebase 配置和默認值 |
| `src/config/adConfig.js` | `src/config/` | AdMob 配置和默認值 |
| `.gitignore` | 根目錄 | Git 忽略配置（包含 `.env`） |

---

## ✅ 檢查清單

配置完成後，請確認：

- [ ] `.env` 文件已創建
- [ ] 所有 Firebase 配置已填入
- [ ] 所有 AdMob 配置已填入
- [ ] `.env` 文件不在 Git 追蹤中（執行 `git ls-files | findstr "\.env$"` 應該沒有輸出）
- [ ] `.env` 在 `.gitignore` 中（已確認）

---

## 🆘 常見問題

### Q: 忘記了配置值怎麼辦？

**A**: 可以：
1. 查看本文檔的「代碼中的默認值」章節
2. 從 Firebase 和 AdMob 控制台重新獲取
3. 查看 `src/firebase.js` 和 `src/config/adConfig.js` 中的默認值

### Q: .env 文件會被提交到 Git 嗎？

**A**: 不會。`.env` 已在 `.gitignore` 中，不會被提交到 Git。

### Q: 如何確認 .env 不在 Git 中？

**A**: 執行以下命令：
```bash
git ls-files | findstr "\.env$"
```
如果沒有輸出，說明 `.env` 不在 Git 追蹤中。

### Q: 生產環境如何配置？

**A**: 生產環境應該：
1. 在構建系統中設置環境變數（如 Netlify、Vercel 等）
2. 不要使用 `.env` 文件
3. 參考 `netlify-env-template.txt` 了解 Netlify 配置方式

---

## 📚 相關文檔

- `GOOGLE_AUTH_SETUP_GUIDE.md` - Google 登入設置指南
- `QUICK_SETUP.md` - 快速設置指南
- `env.example` - 環境變數模板
- `netlify-env-template.txt` - Netlify 環境變數模板

---

**最後更新**：2025-01-XX  
**維護者**：開發團隊

