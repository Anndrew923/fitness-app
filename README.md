# Ultimate Physique 跨平台升級與功能擴充

## 專案概述

這是一個基於 React + Firebase 的健身評測應用，提供多種身體素質評測功能，支援跨平台部署和國際化。

## 新功能特色

### 🆕 訪客模式

- 無需註冊即可體驗完整評測功能
- 本地儲存評測結果
- 隨時可註冊同步資料到雲端

### 🆕 天梯排行榜

- 綜合評測分數排名
- 年齡段篩選功能
- 個人排名顯示
- 好友排行榜（開發中）

### 🆕 用戶暱稱系統

- 自定義暱稱設定
- 自動生成暱稱功能
- 暱稱唯一性驗證

### 🆕 多語系支援

- 中文（繁體）
- 英文
- 語言設定記憶功能

### 🆕 廣告系統預留

- 廣告區塊預留
- 開發環境測試廣告
- 正式環境 AdMob 整合準備

## 技術架構

### 前端技術

- **React 19** - 最新版本 React
- **Vite** - 快速建構工具
- **React Router** - 路由管理
- **Recharts** - 圖表庫
- **react-i18next** - 國際化

### 後端服務

- **Firebase Auth** - 用戶認證
- **Firestore** - 資料庫
- **Firebase Storage** - 檔案儲存

### 評測項目

1. **力量評測** - 深蹲測試
2. **爆發力測試** - 垂直跳躍
3. **心肺耐力** - 跑步測試
4. **骨骼肌肉量** - 身體組成分析
5. **體脂肪率與 FFMI** - 體脂評估

## 開發環境設置

### 必要環境變數

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 建構生產版本

```bash
npm run build
```

### Android APK 建置

**快速建置（推薦）：**

```bash
build-release-apk.bat
```

**完整清理建置：**

```bash
build-clean-complete.bat
```

**詳細建置流程請參考：** [BUILD_PROCESS_GUIDE.md](./BUILD_PROCESS_GUIDE.md)

⚠️ **重要提醒**：建置 APK 時必須執行以下步驟：

1. `npm run build` - 建置 React 代碼
2. `npx cap sync android` ⭐ **關鍵步驟！**
3. `gradlew assembleRelease` - 建置 APK

## 資料結構

### 用戶資料 (users collection)

```javascript
{
  userId: string,
  email: string,
  nickname: string,
  avatarUrl: string,
  gender: 'male' | 'female',
  height: number,
  weight: number,
  age: number,
  ageGroup: string,
  ladderScore: number,
  ladderRank: number,
  friends: string[],
  friendRequests: string[],
  blockedUsers: string[],
  isGuest: boolean,
  scores: {
    strength: number,
    explosivePower: number,
    cardio: number,
    muscleMass: number,
    bodyFat: number,
  },
  history: array,
  lastActive: string,
  updatedAt: string,
}
```

## 功能開發進度

### ✅ 已完成

- [x] 基礎評測功能
- [x] 用戶認證系統
- [x] 訪客模式
- [x] 天梯排行榜
- [x] 暱稱系統
- [x] 多語系支援
- [x] 廣告區塊預留
- [x] 響應式設計

### 🚧 開發中

- [ ] 好友系統
- [ ] 頭像上傳
- [ ] 推播通知
- [ ] 社交互動功能

### 📋 計劃中

- [ ] Capacitor 跨平台打包
- [ ] AdMob 廣告整合
- [ ] App Store / Google Play 上架
- [ ] 進階數據分析
- [ ] 個人化建議

## 部署

### Web 部署

```bash
npm run build
# 部署 dist 資料夾到您的 Web 伺服器
```

### 行動應用部署

```bash
# 安裝 Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init

# 添加平台
npx cap add android
npx cap add ios

# 同步建構
npx cap sync

# 開啟開發工具
npx cap open android
npx cap open ios
```

## 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 聯絡資訊

如有任何問題或建議，請透過以下方式聯絡：

- 專案 Issues
- Email: [your-email@example.com]

---

**注意事項：**

- 訪客模式資料僅儲存在本地，清除瀏覽器資料會遺失
- 建議定期註冊帳號以同步資料到雲端
- 評測結果僅供參考，請諮詢專業醫療人員
