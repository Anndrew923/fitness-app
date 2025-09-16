# PowerShell 腳本 - 使用更穩定的方法獲取金鑰資訊
Write-Host "========================================" -ForegroundColor Green
Write-Host "獲取 Android Keystore 資訊" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 方法1: 使用 cmd 調用 keytool
Write-Host "方法1: 使用 cmd 調用 keytool..." -ForegroundColor Yellow
Write-Host "請在彈出的視窗中輸入密碼..." -ForegroundColor Cyan

Start-Process cmd -ArgumentList "/c", "keytool -list -v -keystore android.keystore -alias upload & pause" -Wait

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "如果上面顯示了指紋，請複製 SHA256 指紋" -ForegroundColor Yellow
Write-Host "然後更新 public/.well-known/assetlinks.json" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
