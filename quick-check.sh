#!/bin/bash

echo "🔍 開始快速檢查..."
echo "=================================="

# 1. ESLint 檢查
echo "1. ESLint 檢查..."
npx eslint src --ext .js,.jsx --max-warnings 5
if [ $? -eq 0 ]; then
    echo "✅ ESLint 檢查通過"
else
    echo "❌ ESLint 檢查失敗"
fi

echo ""

# 2. 構建測試
echo "2. 構建測試..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ 構建成功"
else
    echo "❌ 構建失敗"
fi

echo ""

# 3. 依賴檢查
echo "3. 依賴安全檢查..."
npm audit --audit-level moderate
if [ $? -eq 0 ]; then
    echo "✅ 依賴安全檢查通過"
else
    echo "⚠️  發現安全漏洞，請檢查"
fi

echo ""

echo "=================================="
echo "🎉 快速檢查完成！"
echo ""
echo "📋 建議："
echo "- 如果發現問題，請查看詳細錯誤信息"
echo "- 運行 'npm run dev' 進行手動測試"
echo "- 檢查瀏覽器控制台是否有錯誤"
