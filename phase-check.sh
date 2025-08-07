#!/bin/bash

echo "🎯 階段性檢查工具"
echo "=================================="

# 檢查參數
if [ $# -eq 0 ]; then
    echo "使用方法: $0 [phase1|phase2|phase3|phase4|all]"
    echo ""
    echo "階段說明:"
    echo "  phase1 - 基礎穩定性檢查"
    echo "  phase2 - 數據安全性檢查"
    echo "  phase3 - 性能優化檢查"
    echo "  phase4 - 代碼質量檢查"
    echo "  all    - 所有階段檢查"
    exit 1
fi

PHASE=$1
REPORT_DIR="debug-reports"
mkdir -p $REPORT_DIR

# 第一階段：基礎穩定性檢查
check_phase1() {
    echo "🎯 第一階段：基礎穩定性檢查"
    echo "=================================="
    
    local report_file="$REPORT_DIR/phase1-check-$(date +%Y%m%d).txt"
    echo "📅 檢查日期: $(date)" > $report_file
    
    # 1. 檢查未定義變數
    echo "1. 檢查未定義變數..."
    echo "1. 檢查未定義變數..." >> $report_file
    npx eslint src --ext .js,.jsx --rule 'no-undef: error' >> $report_file 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ 無未定義變數錯誤"
    else
        echo "❌ 發現未定義變數錯誤"
    fi
    
    # 2. 檢查空值訪問
    echo "2. 檢查空值訪問..."
    echo "2. 檢查空值訪問..." >> $report_file
    grep -r "\.\w*\." src/ --include="*.js" --include="*.jsx" | grep -v "console\." >> $report_file 2>&1
    echo "✅ 空值訪問檢查完成"
    
    # 3. 檢查構建穩定性
    echo "3. 檢查構建穩定性..."
    echo "3. 檢查構建穩定性..." >> $report_file
    npm run build >> $report_file 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ 構建穩定"
    else
        echo "❌ 構建失敗"
    fi
    
    echo "📄 詳細報告: $report_file"
}

# 第二階段：數據安全性檢查
check_phase2() {
    echo "🔒 第二階段：數據安全性檢查"
    echo "=================================="
    
    local report_file="$REPORT_DIR/phase2-check-$(date +%Y%m%d).txt"
    echo "📅 檢查日期: $(date)" > $report_file
    
    # 1. 檢查輸入驗證
    echo "1. 檢查輸入驗證..."
    echo "1. 檢查輸入驗證..." >> $report_file
    grep -r "input\|textarea\|select" src/ --include="*.js" --include="*.jsx" | head -10 >> $report_file
    echo "✅ 輸入驗證檢查完成"
    
    # 2. 檢查 Firebase 安全規則
    echo "2. 檢查 Firebase 安全規則..."
    echo "2. 檢查 Firebase 安全規則..." >> $report_file
    if [ -f "firebase-security-rules.txt" ]; then
        echo "✅ Firebase 安全規則文件存在" >> $report_file
        echo "✅ Firebase 安全規則文件存在"
    else
        echo "❌ Firebase 安全規則文件缺失" >> $report_file
        echo "❌ Firebase 安全規則文件缺失"
    fi
    
    # 3. 檢查敏感數據處理
    echo "3. 檢查敏感數據處理..."
    echo "3. 檢查敏感數據處理..." >> $report_file
    grep -r "password\|token\|key\|secret" src/ --include="*.js" --include="*.jsx" | head -5 >> $report_file
    echo "✅ 敏感數據檢查完成"
    
    echo "📄 詳細報告: $report_file"
}

# 第三階段：性能優化檢查
check_phase3() {
    echo "⚡ 第三階段：性能優化檢查"
    echo "=================================="
    
    local report_file="$REPORT_DIR/phase3-check-$(date +%Y%m%d).txt"
    echo "📅 檢查日期: $(date)" > $report_file
    
    # 1. 檢查 React Hooks 使用
    echo "1. 檢查 React Hooks 使用..."
    echo "1. 檢查 React Hooks 使用..." >> $report_file
    grep -r "useEffect\|useState\|useCallback\|useMemo" src/ --include="*.js" --include="*.jsx" | wc -l >> $report_file
    echo "✅ React Hooks 檢查完成"
    
    # 2. 檢查 Bundle 大小
    echo "2. 檢查 Bundle 大小..."
    echo "2. 檢查 Bundle 大小..." >> $report_file
    if [ -d "dist" ]; then
        du -sh dist/* >> $report_file
        echo "✅ Bundle 大小檢查完成"
    else
        echo "❌ dist 目錄不存在" >> $report_file
        echo "❌ dist 目錄不存在"
    fi
    
    # 3. 檢查網絡請求優化
    echo "3. 檢查網絡請求優化..."
    echo "3. 檢查網絡請求優化..." >> $report_file
    grep -r "fetch\|axios\|firebase" src/ --include="*.js" --include="*.jsx" | wc -l >> $report_file
    echo "✅ 網絡請求檢查完成"
    
    echo "📄 詳細報告: $report_file"
}

# 第四階段：代碼質量檢查
check_phase4() {
    echo "🧹 第四階段：代碼質量檢查"
    echo "=================================="
    
    local report_file="$REPORT_DIR/phase4-check-$(date +%Y%m%d).txt"
    echo "📅 檢查日期: $(date)" > $report_file
    
    # 1. 檢查未使用的變數
    echo "1. 檢查未使用的變數..."
    echo "1. 檢查未使用的變數..." >> $report_file
    npx eslint src --ext .js,.jsx --rule 'no-unused-vars: error' >> $report_file 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ 無未使用變數"
    else
        echo "❌ 發現未使用變數"
    fi
    
    # 2. 檢查代碼風格
    echo "2. 檢查代碼風格..."
    echo "2. 檢查代碼風格..." >> $report_file
    npx eslint src --ext .js,.jsx --fix >> $report_file 2>&1
    echo "✅ 代碼風格檢查完成"
    
    # 3. 檢查文檔完整性
    echo "3. 檢查文檔完整性..."
    echo "3. 檢查文檔完整性..." >> $report_file
    if [ -f "README.md" ]; then
        echo "✅ README.md 存在" >> $report_file
    else
        echo "❌ README.md 缺失" >> $report_file
    fi
    
    if [ -f "DEBUG_GUIDE.md" ]; then
        echo "✅ DEBUG_GUIDE.md 存在" >> $report_file
    else
        echo "❌ DEBUG_GUIDE.md 缺失" >> $report_file
    fi
    
    echo "✅ 文檔完整性檢查完成"
    
    echo "📄 詳細報告: $report_file"
}

# 執行檢查
case $PHASE in
    "phase1")
        check_phase1
        ;;
    "phase2")
        check_phase2
        ;;
    "phase3")
        check_phase3
        ;;
    "phase4")
        check_phase4
        ;;
    "all")
        check_phase1
        echo ""
        check_phase2
        echo ""
        check_phase3
        echo ""
        check_phase4
        ;;
    *)
        echo "❌ 無效的階段參數: $PHASE"
        exit 1
        ;;
esac

echo ""
echo "🎉 階段檢查完成！"
echo "📋 建議："
echo "- 查看詳細報告了解具體問題"
echo "- 根據報告制定修復計劃"
echo "- 定期運行檢查以追蹤進度"
