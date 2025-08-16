#!/bin/bash

echo "📊 開始每週完整檢查..."
echo "=================================="

# 創建檢查報告目錄
mkdir -p debug-reports
REPORT_FILE="debug-reports/weekly-check-$(date +%Y%m%d).txt"

echo "📅 檢查日期: $(date)" > $REPORT_FILE
echo "==================================" >> $REPORT_FILE

# 1. 完整 ESLint 檢查
echo "1. 完整 ESLint 檢查..."
echo "1. 完整 ESLint 檢查..." >> $REPORT_FILE
npx eslint src --ext .js,.jsx --format=compact >> $REPORT_FILE 2>&1
if [ $? -eq 0 ]; then
    echo "✅ ESLint 檢查通過"
    echo "✅ ESLint 檢查通過" >> $REPORT_FILE
else
    echo "❌ ESLint 檢查失敗"
    echo "❌ ESLint 檢查失敗" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 2. 構建測試
echo "2. 構建測試..."
echo "2. 構建測試..." >> $REPORT_FILE
npm run build >> $REPORT_FILE 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 構建成功"
    echo "✅ 構建成功" >> $REPORT_FILE
else
    echo "❌ 構建失敗"
    echo "❌ 構建失敗" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 3. 依賴檢查
echo "3. 依賴安全檢查..."
echo "3. 依賴安全檢查..." >> $REPORT_FILE
npm audit --audit-level moderate >> $REPORT_FILE 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 依賴安全檢查通過"
    echo "✅ 依賴安全檢查通過" >> $REPORT_FILE
else
    echo "⚠️  發現安全漏洞，請檢查"
    echo "⚠️  發現安全漏洞，請檢查" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 4. 過期依賴檢查
echo "4. 過期依賴檢查..."
echo "4. 過期依賴檢查..." >> $REPORT_FILE
npm outdated >> $REPORT_FILE 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 無過期依賴"
    echo "✅ 無過期依賴" >> $REPORT_FILE
else
    echo "⚠️  發現過期依賴"
    echo "⚠️  發現過期依賴" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 5. Bundle 大小檢查
echo "5. Bundle 大小檢查..."
echo "5. Bundle 大小檢查..." >> $REPORT_FILE
if [ -d "dist" ]; then
    echo "Bundle 大小:" >> $REPORT_FILE
    du -sh dist/* >> $REPORT_FILE 2>&1
    echo "✅ Bundle 大小檢查完成"
else
    echo "❌ dist 目錄不存在，請先構建項目"
    echo "❌ dist 目錄不存在，請先構建項目" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 6. 代碼統計
echo "6. 代碼統計..."
echo "6. 代碼統計..." >> $REPORT_FILE
echo "JavaScript/JSX 文件數量:" >> $REPORT_FILE
find src -name "*.js" -o -name "*.jsx" | wc -l >> $REPORT_FILE
echo "CSS 文件數量:" >> $REPORT_FILE
find src -name "*.css" | wc -l >> $REPORT_FILE
echo "總代碼行數:" >> $REPORT_FILE
find src -name "*.js" -o -name "*.jsx" -o -name "*.css" | xargs wc -l | tail -1 >> $REPORT_FILE

echo "" >> $REPORT_FILE

# 7. Git 狀態檢查
echo "7. Git 狀態檢查..."
echo "7. Git 狀態檢查..." >> $REPORT_FILE
git status --porcelain >> $REPORT_FILE 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Git 狀態檢查完成"
    echo "✅ Git 狀態檢查完成" >> $REPORT_FILE
else
    echo "❌ Git 狀態檢查失敗"
    echo "❌ Git 狀態檢查失敗" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

echo "=================================="
echo "🎉 每週檢查完成！"
echo "📄 詳細報告已保存到: $REPORT_FILE"
echo ""
echo "📋 建議："
echo "- 查看詳細報告了解具體問題"
echo "- 根據報告制定下週修復計劃"
echo "- 定期運行此檢查以追蹤進度"

echo "==================================" >> $REPORT_FILE
echo "🎉 每週檢查完成！" >> $REPORT_FILE
echo "📋 建議：" >> $REPORT_FILE
echo "- 查看詳細報告了解具體問題" >> $REPORT_FILE
echo "- 根據報告制定下週修復計劃" >> $REPORT_FILE
echo "- 定期運行此檢查以追蹤進度" >> $REPORT_FILE

