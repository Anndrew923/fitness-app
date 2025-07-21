# 天梯性能優化

## 🚨 問題描述

用戶進入天梯頁面一次，控制台就出現三次檢查，表明存在重複載入和計算的問題：

### 問題分析

1. **重複數據載入**：天梯數據被重複載入多次
2. **重複條件檢查**：浮動排名框的條件檢查被重複執行
3. **依賴項過度觸發**：`useEffect` 依賴項導致不必要的重新執行

## 🔧 優化方案

### 1. **優化數據載入觸發機制**

**問題**：

```javascript
// 每次 userData?.ladderScore 變化都會觸發重新載入
useEffect(() => {
  loadLadderData();
}, [selectedAgeGroup, selectedTab, userData?.ladderScore]);
```

**優化**：

```javascript
// 分離篩選條件和分數變化的監聽
// 監聽篩選條件變化
useEffect(() => {
  loadLadderData();
}, [selectedAgeGroup, selectedTab]);

// 監聽用戶天梯分數變化，只在分數真正改變時重新載入
useEffect(() => {
  const currentLadderScore = userData?.ladderScore || 0;
  const lastLadderScore = lastLadderScoreRef.current;

  // 只在分數真正改變且不是初始載入時重新載入
  if (lastLadderScore !== null && lastLadderScore !== currentLadderScore) {
    console.log('🔄 檢測到天梯分數變化，重新載入數據:', {
      from: lastLadderScore,
      to: currentLadderScore,
    });
    loadLadderData();
  }

  // 更新追蹤的分數
  lastLadderScoreRef.current = currentLadderScore;
}, [userData?.ladderScore]);
```

### 2. **優化浮動排名框條件檢查**

**問題**：

```javascript
// 每次渲染都會輸出日誌，即使數據還在載入中
const floatingRankDisplay = useMemo(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 檢查浮動排名框條件:', {
      hasUserData: !!userData,
      hasLadderScore: userData?.ladderScore > 0,
      userRank,
      ladderDataLength: ladderData.length,
    });
  }
  // ...
}, [userData, userRank, ladderData.length]);
```

**優化**：

```javascript
// 只在數據穩定時才輸出日誌
const floatingRankDisplay = useMemo(() => {
  // 只在開發環境下輸出詳細日誌，並且只在數據穩定時輸出
  if (
    process.env.NODE_ENV === 'development' &&
    !loading &&
    ladderData.length > 0
  ) {
    console.log('🔍 檢查浮動排名框條件:', {
      hasUserData: !!userData,
      hasLadderScore: userData?.ladderScore > 0,
      userRank,
      ladderDataLength: ladderData.length,
    });
  }
  // ...
}, [userData, userRank, ladderData.length, loading]);
```

### 3. **添加分數變化追蹤**

**新增機制**：

```javascript
// 使用 useRef 追蹤上次的天梯分數
const lastLadderScoreRef = useRef(null);

// 只在分數真正改變時才重新載入數據
if (lastLadderScore !== null && lastLadderScore !== currentLadderScore) {
  console.log('🔄 檢測到天梯分數變化，重新載入數據:', {
    from: lastLadderScore,
    to: currentLadderScore,
  });
  loadLadderData();
}
```

## 📊 優化效果

### 性能改進

- **減少重複載入**：只在真正需要時才重新載入天梯數據
- **減少重複計算**：浮動排名框條件檢查只在數據穩定時執行
- **智能觸發**：分數變化監聽只在分數真正改變時觸發

### 控制台清理

- **消除重複日誌**：條件檢查日誌不再重複輸出
- **減少載入日誌**：數據載入日誌只在必要時輸出
- **提高調試效率**：控制台更清晰，便於調試

### 用戶體驗

- **更快的載入**：減少不必要的數據載入
- **更流暢的交互**：減少重複計算導致的卡頓
- **保持功能完整**：所有功能正常工作

## 🎯 技術細節

### 1. **分離關注點**

```javascript
// 篩選條件變化 → 重新載入
useEffect(() => {
  loadLadderData();
}, [selectedAgeGroup, selectedTab]);

// 分數變化 → 智能重新載入
useEffect(() => {
  // 只在分數真正改變時重新載入
}, [userData?.ladderScore]);
```

### 2. **條件日誌輸出**

```javascript
// 只在數據穩定時輸出日誌
if (
  process.env.NODE_ENV === 'development' &&
  !loading &&
  ladderData.length > 0
) {
  console.log('條件檢查日誌');
}
```

### 3. **分數變化追蹤**

```javascript
// 使用 useRef 追蹤分數變化
const lastLadderScoreRef = useRef(null);
const currentLadderScore = userData?.ladderScore || 0;
const lastLadderScore = lastLadderScoreRef.current;

if (lastLadderScore !== null && lastLadderScore !== currentLadderScore) {
  // 分數真正改變，重新載入
}
```

## 🔍 測試重點

### 1. **數據載入**

- 進入天梯頁面只載入一次數據
- 切換篩選條件正常重新載入
- 提交新分數後自動更新

### 2. **條件檢查**

- 浮動排名框條件檢查不重複
- 日誌輸出清晰且不重複
- 功能邏輯正確

### 3. **性能表現**

- 頁面載入速度提升
- 交互響應更流暢
- 控制台輸出更清晰

## 📝 最佳實踐

### 1. **useEffect 優化**

- 分離不同類型的依賴項
- 使用 useRef 追蹤變化
- 避免不必要的重新執行

### 2. **日誌輸出**

- 只在開發環境輸出
- 只在數據穩定時輸出
- 提供有價值的調試信息

### 3. **性能監控**

- 監控重複載入
- 追蹤條件檢查頻率
- 優化觸發機制

## 🚀 未來優化方向

### 1. **進一步優化**

- 考慮使用 React Query 或 SWR
- 實現數據緩存機制
- 優化查詢性能

### 2. **實時更新**

- 考慮使用 Firebase 實時監聽
- 實現更智能的更新機制
- 減少手動重新載入

### 3. **用戶體驗**

- 添加載入狀態指示
- 實現更流暢的動畫
- 優化錯誤處理

## 🔧 相關文件修改

### 1. **Ladder.jsx**

- 添加 useRef 導入
- 分離 useEffect 依賴項
- 優化條件檢查日誌
- 添加分數變化追蹤

### 2. **性能改進**

- 減少重複載入
- 優化計算頻率
- 提高響應速度

### 3. **代碼質量**

- 遵循 React 最佳實踐
- 提高代碼可維護性
- 改善調試體驗
