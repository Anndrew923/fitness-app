# 🚀 快速除錯檢查清單

## 📋 日常除錯流程

### 1. 啟動前檢查

- [ ] 運行 `node debug-scripts.js full`
- [ ] 檢查控制台是否有錯誤
- [ ] 確認所有依賴已安裝
- [ ] 驗證 Firebase 配置

### 2. 開發中監控

- [ ] 啟動 `debugMaster.start()`
- [ ] 監控控制台輸出
- [ ] 檢查網絡請求
- [ ] 觀察性能指標

### 3. 問題發生時

- [ ] 立即停止相關操作
- [ ] 記錄錯誤信息
- [ ] 運行 `debugMaster.getFullReport()`
- [ ] 根據建議修復問題

## 🔧 常用指令速查

### 代碼檢查

```bash
# 快速檢查
npx eslint src --ext .js,.jsx --max-warnings 0

# 自動修復
npx eslint src --ext .js,.jsx --fix

# 檢查特定文件
npx eslint src/components/App.jsx
```

### 依賴管理

```bash
# 安全檢查
npm audit

# 更新依賴
npm update

# 修復漏洞
npm audit fix
```

### 構建測試

```bash
# 開發構建
npm run build

# 預覽結果
npm run preview

# 生產測試
NODE_ENV=production npm run build
```

## 🚨 緊急修復流程

### 1. 立即停止

```bash
# 停止開發服務器
Ctrl + C

# 停止監控
debugMaster.stop()
```

### 2. 問題診斷

```bash
# 運行全面檢查
node debug-scripts.js full

# 檢查錯誤日誌
debugMaster.getFullReport()
```

### 3. 快速修復

```bash
# 修復 ESLint 問題
npx eslint src --fix

# 清理緩存
rm -rf node_modules package-lock.json
npm install

# 重新構建
npm run build
```

### 4. 驗證修復

```bash
# 重新檢查
node debug-scripts.js full

# 啟動監控
debugMaster.start()
```

## 📊 性能檢查清單

### 加載性能

- [ ] 首次內容繪製 < 1.5 秒
- [ ] 最大內容繪製 < 2.5 秒
- [ ] 總加載時間 < 3 秒
- [ ] Bundle 大小 < 500KB

### 運行時性能

- [ ] 內存使用 < 100MB
- [ ] CPU 使用 < 50%
- [ ] 幀率 > 60fps
- [ ] 響應時間 < 100ms

### Firebase 性能

- [ ] 讀取操作 < 1 秒
- [ ] 寫入操作 < 2 秒
- [ ] 連接穩定性 > 99%
- [ ] 錯誤率 < 1%

## 🐛 常見錯誤修復

### JavaScript 錯誤

```javascript
// 空值檢查
const value = object?.property || defaultValue;

// 類型檢查
if (typeof value === 'string') {
  // 處理字符串
}

// 錯誤處理
try {
  // 可能出錯的代碼
} catch (error) {
  console.error('Error:', error);
  debugMaster.logError('Runtime Error', { error: error.message });
}
```

### React 錯誤

```javascript
// 使用錯誤邊界
<ErrorBoundary>
  <Component />
</ErrorBoundary>;

// 正確使用 Hooks
useEffect(() => {
  // 副作用
}, [dependency]);

// 記憶化
const memoizedValue = useMemo(() => computeValue(a, b), [a, b]);
```

### Firebase 錯誤

```javascript
// 連接檢查
if (firebase.apps.length === 0) {
  firebase.initializeApp(config);
}

// 錯誤處理
firebase
  .auth()
  .signInWithEmailAndPassword(email, password)
  .then(userCredential => {
    // 成功
  })
  .catch(error => {
    console.error('Firebase error:', error);
    debugMaster.logError('Firebase Error', { error: error.message });
  });
```

## 📈 監控指標

### 關鍵指標

- **錯誤率**: 目標 < 1%
- **加載時間**: 目標 < 3 秒
- **用戶滿意度**: 目標 > 95%
- **功能可用性**: 目標 > 99%

### 警告閾值

- 錯誤率 > 0.5%
- 加載時間 > 2 秒
- 內存使用 > 80MB
- CPU 使用 > 40%

## 🔄 定期維護

### 每日檢查

- [ ] 運行快速檢查
- [ ] 查看錯誤日誌
- [ ] 檢查性能指標
- [ ] 清理臨時文件

### 每週檢查

- [ ] 更新依賴
- [ ] 運行完整測試
- [ ] 分析性能報告
- [ ] 檢查安全漏洞

### 每月檢查

- [ ] 代碼審查
- [ ] 架構優化
- [ ] 文檔更新
- [ ] 備份數據

## 📞 緊急聯繫

### 問題嚴重程度

- 🟢 **輕微**: 自行修復
- 🟡 **中等**: 尋求建議
- 🔴 **嚴重**: 立即聯繫團隊

### 聯繫方式

- **技術支持**: [聯繫方式]
- **開發團隊**: [聯繫方式]
- **緊急熱線**: [聯繫方式]

---

## 🎯 使用建議

1. **定期檢查**: 每天運行一次快速檢查
2. **預防為主**: 在問題發生前修復
3. **記錄問題**: 詳細記錄所有錯誤和修復過程
4. **持續改進**: 根據數據優化流程
5. **團隊協作**: 與團隊分享經驗和最佳實踐

記住：**預防勝於治療，監控勝於修復**！
