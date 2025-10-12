# AdMob 監控系統指南

## 📊 系統概覽

本監控系統提供完整的 AdMob 廣告整合監控解決方案，包括：

- **實時監控**: 廣告載入成功率、收益追蹤、性能指標
- **健康檢查**: 配置驗證、錯誤檢測、系統狀態評估
- **部署檢查**: 文件大小檢查、依賴分析、環境變數驗證
- **視覺化儀表板**: 實時狀態顯示、性能圖表、日誌查看

## 🚀 快速開始

### 1. 健康檢查

```bash
# 運行完整健康檢查
npm run health:check

# 檢查特定組件
npm run test:auto
npm run test:performance
npm run test:error
```

### 2. 實時監控

```bash
# 啟動監控 (30秒間隔)
npm run monitor:start

# 快速監控 (10秒間隔)
npm run monitor:start:fast

# 停止監控: Ctrl+C
```

### 3. 部署檢查

```bash
# 部署前檢查
npm run deploy:check

# 強制部署 (忽略問題)
npm run deploy:force
```

### 4. 監控儀表板

訪問 `http://localhost:5173/monitor` 查看視覺化監控界面。

## 📋 功能詳解

### 健康檢查系統 (`scripts/health-check.js`)

**功能**:

- AdMob 配置狀態檢查
- 環境變數完整性驗證
- 構建狀態檢查
- 廣告載入功能驗證
- 性能指標監控
- 錯誤日誌分析

**輸出**:

- 健康分數 (0-100)
- 詳細檢查報告
- 問題和警告列表
- 優化建議

**使用場景**:

- 部署前驗證
- 定期系統檢查
- 問題診斷

### 實時監控系統 (`scripts/monitor.js`)

**功能**:

- AdMob 收益追蹤
- 廣告載入成功率監控
- 用戶體驗指標測量
- 性能指標收集
- 錯誤監控
- 自動警報

**監控指標**:

- 收益數據
- 廣告載入成功率
- 頁面載入時間
- 廣告渲染時間
- 記憶體使用
- 錯誤數量

**警報閾值**:

- 廣告載入成功率 < 80%
- 錯誤數量 > 5
- 響應時間 > 3000ms
- 記憶體使用 > 100MB

### 部署檢查系統 (`scripts/deploy-to-netlify.js`)

**功能**:

- 文件大小檢查
- 未使用依賴檢測
- 環境變數完整性驗證
- AdMob 配置驗證
- 部署前健康檢查

**檢查項目**:

- 構建產物完整性
- 文件大小優化
- 依賴使用情況
- 環境變數配置
- AdMob 配置正確性
- 自動化測試通過

### 監控儀表板 (`src/components/MonitorDashboard.jsx`)

**功能**:

- 實時狀態顯示
- 性能指標圖表
- 配置管理界面
- 實時日誌查看
- 警報通知
- 報告導出

**界面組件**:

- 狀態卡片 (收益、成功率、性能、錯誤)
- 配置管理面板
- 性能指標圖表
- 實時日誌面板
- 警報通知區域

## 🔧 配置說明

### 環境變數

```bash
# AdMob 配置
VITE_ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
VITE_ADMOB_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
VITE_ADMOB_ENABLED=true
VITE_ADMOB_TEST_MODE=false
```

### 監控配置

監控系統支持以下配置選項：

```javascript
// 警報閾值
const alertThresholds = {
  earnings: 0, // 收益閾值
  adLoadRate: 0.8, // 廣告載入成功率閾值
  errorCount: 5, // 錯誤數量閾值
  responseTime: 3000, // 響應時間閾值 (ms)
};
```

## 📊 報告格式

### 健康檢查報告

```json
{
  "timestamp": "2025-01-19T10:30:00.000Z",
  "summary": {
    "totalChecks": 6,
    "passedChecks": 5,
    "successRate": "83.3%",
    "healthScore": 85,
    "issues": 1,
    "warnings": 2,
    "totalTime": "1500ms"
  },
  "checks": {
    "config": true,
    "environment": true,
    "build": true,
    "admob": false,
    "performance": true,
    "errors": true
  },
  "metrics": { ... },
  "issues": [ ... ],
  "warnings": [ ... ],
  "recommendations": [ ... ]
}
```

### 監控報告

```json
{
  "timestamp": "2025-01-19T10:30:00.000Z",
  "runtime": "15.5 分鐘",
  "summary": {
    "admobEarnings": 12.45,
    "adLoadSuccessRate": "87.5%",
    "totalErrors": 2,
    "totalAlerts": 1,
    "avgPageLoadTime": "1250ms",
    "avgAdRenderTime": "450ms",
    "memoryUsage": "45.2 MB"
  },
  "metrics": { ... },
  "alerts": [ ... ],
  "recommendations": [ ... ]
}
```

## 🚨 故障排除

### 常見問題

1. **健康檢查失敗**

   - 檢查環境變數配置
   - 確認構建產物存在
   - 驗證 AdMob 配置

2. **監控數據異常**

   - 檢查網絡連接
   - 驗證 AdMob 帳戶狀態
   - 確認廣告單元 ID 正確

3. **部署檢查失敗**
   - 修復所有問題
   - 優化文件大小
   - 檢查依賴使用情況

### 調試模式

```bash
# 啟用詳細日誌
DEBUG=true npm run health:check

# 檢查特定組件
npm run test:auto -- --verbose

# 監控特定指標
npm run monitor:start -- --metrics=performance,errors
```

## 📈 最佳實踐

### 監控策略

1. **定期健康檢查**

   - 每日運行健康檢查
   - 部署前必須通過檢查
   - 問題及時修復

2. **實時監控**

   - 生產環境持續監控
   - 設置適當的警報閾值
   - 定期檢查監控報告

3. **性能優化**
   - 監控文件大小
   - 優化載入時間
   - 減少錯誤數量

### 維護建議

1. **定期更新**

   - 更新監控腳本
   - 優化警報閾值
   - 改進監控指標

2. **報告分析**

   - 定期分析監控報告
   - 識別性能瓶頸
   - 制定優化計劃

3. **文檔維護**
   - 更新配置文檔
   - 記錄問題解決方案
   - 分享最佳實踐

## 🔗 相關資源

- [AdMob 控制台](https://admob.google.com/)
- [Netlify 控制台](https://app.netlify.com/)
- [監控系統文檔](./MONITORING_SYSTEM_GUIDE.md)
- [部署指南](./DEPLOY_INSTRUCTIONS.md)
- [測試報告](./ADMOB_TEST_REPORT.md)

## 📞 支持

如有問題或建議，請：

1. 檢查本文檔的故障排除部分
2. 查看相關的錯誤日誌
3. 運行健康檢查診斷問題
4. 聯繫開發團隊獲取支持

---

**最後更新**: 2025 年 1 月 19 日
**版本**: v1.0
**狀態**: ✅ 生產就緒
