# Google 登入配置驗證腳本
# 用途：檢查所有配置文件中的 Client ID 是否一致

Write-Host "`n🔍 檢查 Google 登入配置一致性...`n" -ForegroundColor Cyan

# 定義正確的 Web Client ID
$correctWebClientId = "5144099869-6kes2gchrinle0io7dl8c12f83rgfso6.apps.googleusercontent.com"

# 檢查的文件列表
$filesToCheck = @(
    @{
        Path = "android\app\src\main\AndroidManifest.xml"
        Pattern = 'android:value="([^"]+)"'
        Name = "AndroidManifest.xml"
    },
    @{
        Path = "android\app\src\main\res\values\strings.xml"
        Pattern = '<string name="server_client_id">([^<]+)</string>'
        Name = "strings.xml"
    },
    @{
        Path = "capacitor.config.json"
        Pattern = '"serverClientId":\s*"([^"]+)"'
        Name = "capacitor.config.json"
    },
    @{
        Path = "src\utils\nativeGoogleAuth.js"
        Pattern = "clientId:\s*['""]([^'""]+)['""]"
        Name = "nativeGoogleAuth.js"
    }
)

Write-Host "📋 檢查配置文件中的 Client ID：`n" -ForegroundColor Yellow

$allConsistent = $true
$results = @()

foreach ($file in $filesToCheck) {
    if (Test-Path $file.Path) {
        $content = Get-Content $file.Path -Raw
        if ($content -match $file.Pattern) {
            $foundClientId = $matches[1]
            $isCorrect = $foundClientId -eq $correctWebClientId

            if ($isCorrect) {
                Write-Host "✅ $($file.Name): " -ForegroundColor Green -NoNewline
                Write-Host "$foundClientId" -ForegroundColor White
            } else {
                Write-Host "❌ $($file.Name): " -ForegroundColor Red -NoNewline
                Write-Host "$foundClientId" -ForegroundColor White
                Write-Host "   期望: $correctWebClientId" -ForegroundColor Yellow
                $allConsistent = $false
            }

            $results += @{
                File = $file.Name
                Found = $foundClientId
                IsCorrect = $isCorrect
            }
        } else {
            Write-Host "⚠️  $($file.Name): " -ForegroundColor Yellow -NoNewline
            Write-Host "未找到 Client ID" -ForegroundColor White
            $allConsistent = $false
        }
    } else {
        Write-Host "❌ $($file.Name): " -ForegroundColor Red -NoNewline
        Write-Host "文件不存在" -ForegroundColor White
        $allConsistent = $false
    }
}

Write-Host "`n📄 檢查 google-services.json...`n" -ForegroundColor Yellow

# 檢查 google-services.json
$googleServicesPath = "android\app\google-services.json"
if (Test-Path $googleServicesPath) {
    $googleServicesContent = Get-Content $googleServicesPath -Raw | ConvertFrom-Json

    # 檢查 client_type: 3 (Web Client ID)
    $webClientId = $null
    try {
        $webClientId = $googleServicesContent.client[0].services.appinvite_service.other_platform_oauth_client[0].client_id
    } catch {
        Write-Host "⚠️  無法解析 google-services.json" -ForegroundColor Yellow
    }

    if ($webClientId) {
        $isCorrect = $webClientId -eq $correctWebClientId
        if ($isCorrect) {
            Write-Host "✅ google-services.json (client_type: 3): " -ForegroundColor Green -NoNewline
            Write-Host "$webClientId" -ForegroundColor White
        } else {
            Write-Host "❌ google-services.json (client_type: 3): " -ForegroundColor Red -NoNewline
            Write-Host "$webClientId" -ForegroundColor White
            Write-Host "   期望: $correctWebClientId" -ForegroundColor Yellow
            Write-Host "   ⚠️  需要重新下載 google-services.json" -ForegroundColor Yellow
            $allConsistent = $false
        }
    } else {
        Write-Host "⚠️  未找到 client_type: 3 的 Client ID" -ForegroundColor Yellow
        $allConsistent = $false
    }

    # 檢查 SHA-1 指紋
    $certificateHash = $null
    try {
        $certificateHash = $googleServicesContent.client[0].oauth_client[0].android_info.certificate_hash
    } catch {
        Write-Host "⚠️  無法解析 certificate_hash" -ForegroundColor Yellow
    }

    if ($certificateHash) {
        $expectedHash = "3185828c3d0cfb0df7d976651b91ffcde8180e59"
        if ($certificateHash -eq $expectedHash) {
            Write-Host "✅ certificate_hash: " -ForegroundColor Green -NoNewline
            Write-Host "$certificateHash" -ForegroundColor White
        } else {
            Write-Host "⚠️  certificate_hash: " -ForegroundColor Yellow -NoNewline
            Write-Host "$certificateHash" -ForegroundColor White
            Write-Host "   期望: $expectedHash" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ google-services.json 文件不存在" -ForegroundColor Red
    $allConsistent = $false
}

Write-Host "`n📊 檢查結果：`n" -ForegroundColor Cyan

if ($allConsistent) {
    Write-Host "✅ 所有配置一致！" -ForegroundColor Green
} else {
    Write-Host "❌ 發現配置不一致！" -ForegroundColor Red
    Write-Host "`n建議修正步驟：`n" -ForegroundColor Yellow
    Write-Host "1. 前往 Firebase Console" -ForegroundColor White
    Write-Host "2. Project Settings → Your apps → Android app" -ForegroundColor White
    Write-Host "3. 確認 SHA-1 指紋已添加" -ForegroundColor White
    Write-Host "4. 重新下載 google-services.json" -ForegroundColor White
    Write-Host "5. 替換 android/app/google-services.json" -ForegroundColor White
    Write-Host "6. 執行: npm run build 和 npx cap sync android" -ForegroundColor White
    Write-Host "" -ForegroundColor White
}

Write-Host "`n✅ 檢查完成！`n" -ForegroundColor Green
