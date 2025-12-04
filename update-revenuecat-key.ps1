# 更新 RevenueCat API Key 到 .env 文件
$envFile = ".env"
$apiKey = "test_DrorGricBrcONQFUJeGoxcPkigq"
$keyName = "VITE_REVENUECAT_API_KEY"

if (Test-Path $envFile) {
    $content = Get-Content $envFile
    $found = $false
    $newContent = @()
    
    foreach ($line in $content) {
        if ($line -match "^$keyName=") {
            $newContent += "$keyName=$apiKey"
            $found = $true
            Write-Host "Updated existing $keyName"
        } else {
            $newContent += $line
        }
    }
    
    if (-not $found) {
        $newContent += ""
        $newContent += "# RevenueCat Public API Key"
        $newContent += "$keyName=$apiKey"
        Write-Host "Added new $keyName"
    }
    
    $newContent | Set-Content $envFile
} else {
    @(
        "# RevenueCat Public API Key",
        "$keyName=$apiKey"
    ) | Set-Content $envFile
    Write-Host "Created .env file with $keyName"
}

# 驗證
Write-Host "`nVerification:"
Get-Content $envFile | Select-String $keyName
