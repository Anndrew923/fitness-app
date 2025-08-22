# 🚀 快速設置指南

## 📋 新環境快速配置

### 1. 克隆專案
```bash
git clone <your-repo-url>
cd fitness-app
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 配置環境變數
```bash
# 方法 1: 使用腳本（推薦）
npm run env:setup

# 方法 2: 手動複製
cp env.example .env
```

### 4. 編輯 .env 檔案
填入您的 Firebase 配置：
```bash
VITE_FIREBASE_API_KEY=your_real_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. 檢查配置
```bash
npm run env:check
```

### 6. 啟動開發伺服器
```bash
npm run dev
```

## 🔍 故障排除

### 檢查環境配置狀態
```bash
npm run env:status
```

### 常見問題
1. **Firebase 配置警告** → 檢查 .env 檔案
2. **寫入失敗錯誤** → 確認 Firebase 配置正確
3. **認證問題** → 檢查網路連接和 Firebase 專案狀態

## 📱 功能測試清單

- [ ] 開發伺服器正常啟動
- [ ] 體重提醒功能正常
- [ ] 底部導覽列正常導航
- [ ] 登入功能正常
- [ ] 無 Firebase 配置警告

## 🎯 最佳實踐

1. **備份配置**：將 .env 檔案備份到安全位置
2. **版本控制**：不要將 .env 提交到 git
3. **團隊協作**：使用 env.example 作為配置模板
4. **定期檢查**：使用 `npm run env:check` 檢查配置狀態

## 📞 支援

如果遇到問題，請：
1. 運行 `npm run env:check` 檢查配置
2. 查看控制台錯誤訊息
3. 確認 Firebase 專案狀態
4. 檢查網路連接

---
*最後更新：2024年*
