@echo off
echo ========================================
echo 獲取 Android Keystore 資訊
echo ========================================
echo.

REM 使用 cmd 而不是 PowerShell 來避免輸入卡住問題
echo 請輸入金鑰儲存庫密碼：
keytool -list -v -keystore android.keystore -alias upload

echo.
echo ========================================
echo 如果上面顯示了指紋，請複製 SHA256 指紋
echo 然後更新 public/.well-known/assetlinks.json
echo ========================================
pause
