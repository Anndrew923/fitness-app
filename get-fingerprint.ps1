# PowerShell 腳本 - 獲取金鑰指紋
Write-Host "正在獲取金鑰指紋..." -ForegroundColor Green

# 讀取密碼
$password = Read-Host "請輸入金鑰儲存庫密碼" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

try {
    # 使用 keytool 獲取指紋
    $result = & keytool -list -v -keystore android.keystore -alias upload -storepass $plainPassword 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "成功獲取指紋信息：" -ForegroundColor Green
        $result | ForEach-Object { Write-Host $_ }

        # 提取 SHA256 指紋
        $sha256Line = $result | Where-Object { $_ -match "SHA256.*:" }
        if ($sha256Line) {
            $fingerprint = ($sha256Line -split ":")[1].Trim()
            Write-Host "`nSHA256 指紋: $fingerprint" -ForegroundColor Yellow
            Write-Host "`n請將此指紋複製到 assetlinks.json 檔案中" -ForegroundColor Cyan
        }
    } else {
        Write-Host "獲取指紋失敗，請檢查密碼是否正確" -ForegroundColor Red
        Write-Host "錯誤信息: $result" -ForegroundColor Red
    }
} catch {
    Write-Host "執行過程中發生錯誤: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n按任意鍵繼續..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
