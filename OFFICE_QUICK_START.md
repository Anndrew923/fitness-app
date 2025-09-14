# 🏢 辦公室環境快速設定指南

## 🚀 一鍵設定（推薦）

### Windows 用戶

```bash
# 雙擊執行
quick-office-setup.bat

# 或在命令提示字元中執行
.\quick-office-setup.bat
```

### Mac/Linux 用戶

```bash
# 執行腳本
./quick-office-setup.sh

# 或使用 npm 命令
npm run office:complete
```

## 📋 手動設定步驟

### 1. 檢查必要軟體

確保已安裝：

- **Node.js 20.19.1 LTS** - [下載地址](https://nodejs.org/)
- **Java 17.0.16** - [下載地址](https://adoptium.net/)

### 2. 執行環境同步

```bash
# 完整同步（推薦）
npm run office:complete

# 或分步執行
npm run office:setup    # 基本設定
npm run cursor:sync     # Cursor 配置
npm run office:sync     # 環境檢查
```

### 3. 設定 Firebase 配置

```bash
# 編輯 .env 檔案
# 填入您的 Firebase 配置
```

### 4. 驗證環境

```bash
# 啟動開發服務器
npm run dev

# 檢查 Android 建構
gradlew bundleRelease
```

## 🔧 常用命令

| 命令                      | 說明              |
| ------------------------- | ----------------- |
| `npm run office:complete` | 完整環境同步      |
| `npm run office:sync`     | 環境檢查          |
| `npm run office:fix`      | 修復環境問題      |
| `npm run cursor:sync`     | 同步 Cursor 配置  |
| `npm run dev`             | 啟動開發服務器    |
| `npm run build`           | 建構專案          |
| `gradlew bundleRelease`   | 建構 Android 應用 |

## 🆘 問題排除

### 問題 1：本地測試無法開啟

```bash
# 檢查端口
netstat -ano | findstr :5173

# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install
```

### 問題 2：Cursor 無法識別 JSX

```bash
# 重新同步配置
npm run cursor:sync

# 在 Cursor 中重新載入視窗
# Ctrl+Shift+P -> "Developer: Reload Window"
```

### 問題 3：Android 建構失敗

```bash
# 檢查 Java 版本
java -version

# 清理並重新建構
gradlew clean
gradlew bundleRelease
```

## 📊 環境狀態檢查

執行以下命令檢查環境狀態：

```bash
npm run office:sync
```

會生成 `environment-report.json` 報告檔案。

## ✅ 設定完成檢查清單

- [ ] Node.js 20.19.1 已安裝
- [ ] Java 17.0.16 已安裝
- [ ] npm 依賴已安裝
- [ ] .env 檔案已設定
- [ ] Cursor 配置已同步
- [ ] 開發服務器可正常啟動
- [ ] Android 建構可正常執行

## 📞 支援

如果遇到問題：

1. 執行 `npm run office:sync` 檢查環境
2. 查看生成的報告檔案
3. 執行 `npm run office:fix` 修復問題
4. 重新執行 `npm run office:complete`

---

**注意**：本指南適用於 Windows、Mac 和 Linux 系統。
