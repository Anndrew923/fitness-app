# ============================================
# 圖標完整更新腳本
# ============================================

Write-Host "開始更新圖標..." -ForegroundColor Green
Write-Host ""

# 步驟 1：複製圖標文件
$sourcePath = "C:\Users\i\Downloads\ic_launcher\res"
$targetPath = "android\app\src\main\res"

if (-not (Test-Path $sourcePath)) {
    Write-Host "錯誤：找不到圖標源路徑 $sourcePath" -ForegroundColor Red
    exit
}

Write-Host "步驟 1：複製圖標文件..." -ForegroundColor Cyan

$densities = @("mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi")

foreach ($density in $densities) {
    $sourceDir = Join-Path $sourcePath "mipmap-$density"
    $targetDir = Join-Path $targetPath "mipmap-$density"
    
    if (Test-Path $sourceDir) {
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item "$sourceDir\*" "$targetDir\" -Force
        Write-Host "  mipmap-$density 圖標已複製" -ForegroundColor Green
    }
}

$anydpiSource = Join-Path $sourcePath "mipmap-anydpi-v26"
$anydpiTarget = Join-Path $targetPath "mipmap-anydpi-v26"

if (Test-Path $anydpiSource) {
    if (-not (Test-Path $anydpiTarget)) {
        New-Item -ItemType Directory -Path $anydpiTarget -Force | Out-Null
    }
    Copy-Item "$anydpiSource\*" "$anydpiTarget\" -Force
    Write-Host "  mipmap-anydpi-v26 已複製" -ForegroundColor Green
}

Write-Host ""

# 步驟 2：更新圓形圖標配置
Write-Host "步驟 2：更新圓形圖標配置..." -ForegroundColor Cyan

$roundIconXml = "android\app\src\main\res\mipmap-anydpi-v26\ic_launcher_round.xml"

if (Test-Path $roundIconXml) {
    $newContent = "<?xml version=`"1.0`" encoding=`"utf-8`"?>`n<adaptive-icon xmlns:android=`"http://schemas.android.com/apk/res/android`">`n  <background android:drawable=`"@mipmap/ic_launcher_adaptive_back`"/>`n  <foreground android:drawable=`"@mipmap/ic_launcher_adaptive_fore`"/>`n</adaptive-icon>"
    Set-Content -Path $roundIconXml -Value $newContent -Encoding UTF8
    Write-Host "  ic_launcher_round.xml 已更新" -ForegroundColor Green
}

Write-Host ""

# 步驟 3：創建傳統圓形圖標文件
Write-Host "步驟 3：創建傳統圓形圖標文件..." -ForegroundColor Cyan

foreach ($density in $densities) {
    $source = "android\app\src\main\res\mipmap-$density\ic_launcher.png"
    $target = "android\app\src\main\res\mipmap-$density\ic_launcher_round.png"
    
    if (Test-Path $source) {
        Copy-Item $source $target -Force
        Write-Host "  mipmap-$density\ic_launcher_round.png 已創建" -ForegroundColor Green
    }
}

Write-Host ""

# 步驟 4：刪除舊的前景圖標
Write-Host "步驟 4：清理舊的前景圖標..." -ForegroundColor Cyan

$oldFiles = Get-ChildItem "android\app\src\main\res\mipmap-*" -Filter "ic_launcher_foreground.png" -ErrorAction SilentlyContinue
if ($oldFiles) {
    Remove-Item $oldFiles -Force
    Write-Host "  舊的前景圖標已刪除" -ForegroundColor Green
} else {
    Write-Host "  沒有找到舊的前景圖標" -ForegroundColor Gray
}

Write-Host ""
Write-Host "圖標更新完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Yellow
Write-Host "  1. 清理構建緩存：cd android && .\gradlew.bat clean" -ForegroundColor Cyan
Write-Host "  2. 重新構建 AAB：.\gradlew.bat bundleRelease" -ForegroundColor Cyan
Write-Host "  3. 返回根目錄：cd .." -ForegroundColor Cyan
Write-Host ""
