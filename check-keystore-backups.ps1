# Check backup keystore files
$keytoolPath = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
$keystoreFiles = @("android.keystore.backup", "android.keystore.bak")
$passwords = @("FitnessApp2025!", "fitness2025", "FitnessApp2025", "fitness2025!", "android", "changeit", "")
$aliases = @("upload", "fitnesskey", "android", "key0", "mykey")

Write-Host "Checking backup keystore files..." -ForegroundColor Green
Write-Host ""

foreach ($keystoreFile in $keystoreFiles) {
    Write-Host "File: $keystoreFile" -ForegroundColor Cyan
    
    if (-not (Test-Path $keystoreFile)) {
        Write-Host "File not found: $keystoreFile" -ForegroundColor Red
        Write-Host ""
        continue
    }
    
    $found = $false
    
    foreach ($password in $passwords) {
        foreach ($alias in $aliases) {
            $result = & $keytoolPath -list -v -keystore $keystoreFile -alias $alias -storepass $password 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "SUCCESS! Found valid keystore" -ForegroundColor Green
                Write-Host "Alias: $alias" -ForegroundColor Green
                Write-Host "Password: $password" -ForegroundColor Green
                
                $sha1Line = $result | Select-String -Pattern "SHA1:"
                if ($sha1Line) {
                    Write-Host "SHA-1 Fingerprint:" -ForegroundColor Yellow
                    Write-Host $sha1Line -ForegroundColor Yellow
                    
                    if ($sha1Line -match "31:85:82:8C:3D:0C:FB:0D:F7:D9:76:65:1B:91:FF:CD:E8:18:0E:59") {
                        Write-Host "MATCH! This is the correct keystore!" -ForegroundColor Green
                        Write-Host "File: $keystoreFile" -ForegroundColor Cyan
                        Write-Host "Alias: $alias" -ForegroundColor Cyan
                        Write-Host "Password: $password" -ForegroundColor Cyan
                    }
                }
                
                $found = $true
                break
            }
        }
        if ($found) { break }
    }
    
    if (-not $found) {
        Write-Host "Could not open with any known password/alias combination" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Check complete" -ForegroundColor Green
