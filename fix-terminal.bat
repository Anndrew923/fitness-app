@echo off
echo ========================================
echo 🔧 修復終端機自動化問題
echo ========================================

echo 📋 設置環境變數...
set GRADLE_OPTS=-Dorg.gradle.daemon=false -Dorg.gradle.console=plain
set NODE_OPTIONS=--max-old-space-size=4096
set CI=true

echo 📋 設置 npm 配置...
npm config set progress false
npm config set audit false
npm config set fund false

echo ✅ 終端機自動化配置完成！
