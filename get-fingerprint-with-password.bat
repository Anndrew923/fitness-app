@echo off
echo 正在獲取金鑰指紋...
echo.

REM 使用 echo 管道輸入密碼到 keytool
echo YOUR_KEYSTORE_PASSWORD | keytool -list -v -keystore android.keystore -alias upload -storepass YOUR_KEYSTORE_PASSWORD

echo.
echo 如果上面沒有顯示指紋，請手動執行以下命令：
echo keytool -list -v -keystore android.keystore -alias upload
echo.
pause
