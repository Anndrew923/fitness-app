#!/bin/bash

# 辦公室環境快速設定腳本 (Linux/Mac)
echo "🏢 辦公室環境快速設定開始..."
echo

# 檢查 Node.js
echo "📋 檢查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝，請先安裝 Node.js 20.19.1 LTS"
    echo "下載地址: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js 已安裝"

# 檢查 Java
echo
echo "📋 檢查 Java..."
if ! command -v java &> /dev/null; then
    echo "❌ Java 未安裝，請先安裝 OpenJDK 17.0.16"
    echo "下載地址: https://adoptium.net/"
    exit 1
fi
echo "✅ Java 已安裝"

# 執行環境同步
echo
echo "📋 執行環境同步..."
node scripts/sync-environment.js

# 執行修復操作
echo
echo "📋 執行修復操作..."
node scripts/sync-environment.js --fix

# 同步 Cursor 配置
echo
echo "📋 同步 Cursor 配置..."
node scripts/cursor-config-sync.js

echo
echo "🎉 辦公室環境設定完成！"
echo
echo "📋 後續步驟:"
echo "1. 編輯 .env 檔案，填入 Firebase 配置"
echo "2. 執行 npm run dev 啟動開發服務器"
echo "3. 在 Cursor 中打開專案"
echo
