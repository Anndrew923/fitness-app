# 🏢 辦公室環境同步指南

## 📋 概述

本指南幫助您在辦公室電腦上建立與家用電腦完全相同的開發環境，確保 Cursor 和專案能正常運行。

## 🚀 快速設定（推薦）

### 1. 執行自動設定腳本

```bash
# 在專案根目錄執行
node scripts/office-setup.js
```

這個腳本會自動：

- ✅ 檢查必要軟體（Node.js, Java, Gradle）
- ✅ 安裝專案依賴
- ✅ 設定環境變數
- ✅ 配置 Cursor 設定
- ✅ 驗證環境

### 2. 手動設定（如果自動腳本失敗）

#### 步驟 1：安裝必要軟體

**Node.js 20.19.1 LTS**

- 下載：https://nodejs.org/
- 選擇 LTS 版本
- 安裝時勾選「Add to PATH」

**Java 17.0.16**

- 下載：https://adoptium.net/
- 選擇 OpenJDK 17.0.16
- 安裝後設定 JAVA_HOME 環境變數

#### 步驟 2：設定環境變數

```bash
# 複製環境變數範本
cp env.example .env

# 編輯 .env 檔案，填入 Firebase 配置
# 使用文字編輯器開啟 .env 檔案
```

#### 步驟 3：安裝專案依賴

```bash
# 安裝 npm 依賴
npm install

# 驗證安裝
npm run build
```

#### 步驟 4：設定 Cursor 配置

```bash
# 執行 Cursor 配置同步
node scripts/cursor-config-sync.js
```

## 🔧 環境檢查和修復

### 檢查環境狀態

```bash
# 執行環境同步檢查
node scripts/sync-environment.js
```

### 修復環境問題

```bash
# 執行修復模式
node scripts/sync-environment.js --fix
```

## 📁 檔案結構

設定完成後，專案會包含以下配置檔案：

```
fitness-app/
├── .vscode/                    # Cursor/VSCode 配置
│   ├── settings.json          # 編輯器設定
│   ├── extensions.json        # 推薦擴展
│   ├── launch.json            # 調試配置
│   └── tasks.json             # 任務配置
├── .env                       # 環境變數
├── fitness-app.code-workspace # 工作區配置
└── scripts/                   # 設定腳本
    ├── office-setup.js        # 辦公室設定
    ├── sync-environment.js    # 環境同步
    └── cursor-config-sync.js  # Cursor 配置
```

## 🎯 常見問題解決

### 問題 1：本地測試無法開啟

**症狀**：執行 `npm run dev` 後無法開啟 http://localhost:5173

**解決方案**：

```bash
# 1. 檢查端口是否被占用
netstat -ano | findstr :5173

# 2. 清理並重新安裝依賴
rm -rf node_modules package-lock.json
npm install

# 3. 重新啟動開發服務器
npm run dev
```

### 問題 2：Cursor 無法識別 JSX 語法

**症狀**：JSX 檔案顯示語法錯誤

**解決方案**：

```bash
# 重新同步 Cursor 配置
node scripts/cursor-config-sync.js

# 在 Cursor 中重新載入視窗
# Ctrl+Shift+P -> "Developer: Reload Window"
```

### 問題 3：Android 建構失敗

**症狀**：執行 `gradlew bundleRelease` 失敗

**解決方案**：

```bash
# 1. 檢查 Java 版本
java -version

# 2. 清理 Android 專案
gradlew clean

# 3. 重新建構
gradlew bundleRelease
```

### 問題 4：環境變數未載入

**症狀**：Firebase 配置無法載入

**解決方案**：

```bash
# 1. 檢查 .env 檔案是否存在
ls -la .env

# 2. 重新創建 .env 檔案
cp env.example .env

# 3. 編輯 .env 檔案填入正確的 Firebase 配置
```

## 🔄 環境同步流程

### 每日同步流程

1. **開啟 Cursor**
2. **執行環境檢查**：`node scripts/sync-environment.js`
3. **如有問題**：`node scripts/sync-environment.js --fix`
4. **開始開發**

### 週期性維護

```bash
# 每週執行一次完整檢查
npm run weekly-check

# 更新依賴（如有需要）
npm update
```

## 📊 環境狀態監控

### 檢查環境報告

設定完成後會生成以下報告檔案：

- `environment-report.json` - 環境檢查報告
- `office-setup-report.json` - 辦公室設定報告

### 監控關鍵指標

- Node.js 版本：20.19.1
- npm 版本：10.8.2
- Java 版本：17.0.16
- Gradle 版本：8.11.1
- 環境變數：全部設定
- 依賴項目：全部安裝

## 🆘 緊急修復

如果環境完全無法使用：

```bash
# 1. 完全重置環境
rm -rf node_modules package-lock.json
rm -rf .vscode
rm -rf .env

# 2. 重新執行設定
node scripts/office-setup.js

# 3. 重新同步 Cursor 配置
node scripts/cursor-config-sync.js
```

## 📞 支援

如果遇到無法解決的問題：

1. **檢查環境報告**：查看 `environment-report.json`
2. **執行診斷**：`node scripts/sync-environment.js --fix`
3. **重新設定**：`node scripts/office-setup.js`
4. **聯繫支援**：提供環境報告檔案

## ✅ 驗證清單

設定完成後，請確認以下項目：

- [ ] Node.js 20.19.1 已安裝
- [ ] Java 17.0.16 已安裝
- [ ] npm 依賴已安裝
- [ ] .env 檔案已設定
- [ ] Cursor 配置已同步
- [ ] 開發服務器可正常啟動
- [ ] Android 建構可正常執行
- [ ] 環境檢查通過

---

**注意**：本指南基於 Windows 環境編寫，Mac 和 Linux 用戶可能需要調整部分指令。
