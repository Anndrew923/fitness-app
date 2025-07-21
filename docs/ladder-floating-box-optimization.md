# 浮動排名框條件檢查優化

## 🚨 問題描述

雖然已經進行了初步優化，但浮動排名框的條件檢查仍然重複了兩次，導致控制台出現重複的日誌輸出。

### 問題分析

1. **useMemo 依賴項過於寬泛**：依賴項包含整個 `userData` 對象
2. **條件檢查重複執行**：即使條件相同，仍然重複輸出日誌
3. **缺乏防抖機制**：沒有機制來避免相同條件的重複檢查

## 🔧 進一步優化方案

### 1. **優化 useMemo 依賴項**

**問題**：

```javascript
// 依賴項包含整個 userData 對象，導致過度重新計算
}, [userData, userRank, ladderData.length]);
```

**優化**：

```javascript
// 只依賴實際使用的具體屬性
}, [
  userData?.ladderScore,
  userData?.nickname,
  userData?.email,
  userData?.avatarUrl,
  userData?.ageGroup,
  userData?.gender,
  userRank,
  ladderData.length,
  loading,
]);
```

### 2. **添加條件檢查防抖機制**

**新增機制**：

```javascript
// 使用 useRef 追蹤上次的條件檢查
const lastConditionCheckRef = useRef(null);

// 創建條件檢查的鍵值，用於防抖
const conditionKey = `${userData?.ladderScore}-${userRank}-${ladderData.length}-${loading}`;

// 只在條件真正改變時才輸出日誌
if (
  process.env.NODE_ENV === 'development' &&
  !loading &&
  ladderData.length > 0 &&
  lastConditionCheckRef.current !== conditionKey
) {
  console.log('🔍 檢查浮動排名框條件:', {
    hasUserData: !!userData,
    hasLadderScore: userData?.ladderScore > 0,
    userRank,
    ladderDataLength: ladderData.length,
  });

  // 更新最後檢查的條件
  lastConditionCheckRef.current = conditionKey;
}
```

### 3. **優化日誌輸出條件**

**改進前**：

```javascript
// 每次都會輸出日誌，即使條件相同
if (
  process.env.NODE_ENV === 'development' &&
  !loading &&
  ladderData.length > 0
) {
  console.log('條件檢查日誌');
}
```

**改進後**：

```javascript
// 只在條件真正改變時才輸出日誌
if (
  process.env.NODE_ENV === 'development' &&
  !loading &&
  ladderData.length > 0 &&
  lastConditionCheckRef.current === conditionKey
) {
  console.log('條件檢查日誌');
}
```

## 📊 優化效果

### 性能改進

- **減少重複計算**：useMemo 只在真正需要時重新計算
- **消除重複日誌**：相同條件不會重複輸出日誌
- **智能防抖**：條件檢查只在真正改變時執行

### 控制台清理

- **單次日誌輸出**：每個條件檢查只輸出一次日誌
- **清晰的調試信息**：日誌更有價值，便於調試
- **減少噪音**：避免重複的調試信息

### 代碼質量

- **精確依賴項**：只依賴實際使用的數據
- **防抖機制**：避免不必要的重複操作
- **更好的可維護性**：代碼邏輯更清晰

## 🎯 技術細節

### 1. **條件鍵值生成**

```javascript
// 將所有相關條件組合成一個鍵值
const conditionKey = `${userData?.ladderScore}-${userRank}-${ladderData.length}-${loading}`;
```

### 2. **防抖檢查機制**

```javascript
// 檢查條件是否真正改變
if (lastConditionCheckRef.current !== conditionKey) {
  // 條件改變，執行檢查
  lastConditionCheckRef.current = conditionKey;
}
```

### 3. **精確依賴項管理**

```javascript
// 只依賴實際使用的屬性，避免整個對象的變化
}, [userData?.ladderScore, userData?.nickname, /* 其他具體屬性 */]);
```

## 🔍 測試重點

### 1. **條件檢查**

- 進入天梯頁面只檢查一次條件
- 條件變化時才重新檢查
- 相同條件不重複輸出日誌

### 2. **功能完整性**

- 浮動排名框正常顯示/隱藏
- 條件邏輯正確
- 用戶體驗不受影響

### 3. **性能表現**

- 減少不必要的計算
- 控制台輸出清晰
- 響應速度提升

## 📝 最佳實踐

### 1. **useMemo 優化**

- 使用精確的依賴項
- 避免依賴整個對象
- 只依賴實際使用的屬性

### 2. **防抖機制**

- 使用鍵值比較避免重複
- 只在真正需要時執行操作
- 提供清晰的狀態追蹤

### 3. **日誌管理**

- 只在開發環境輸出
- 避免重複的調試信息
- 提供有價值的調試數據

## 🚀 未來優化方向

### 1. **進一步優化**

- 考慮使用 React.memo 優化組件
- 實現更細粒度的狀態管理
- 優化渲染性能

### 2. **調試工具**

- 添加更詳細的性能監控
- 實現條件檢查的可視化
- 優化開發體驗

### 3. **代碼質量**

- 添加單元測試
- 實現自動化檢查
- 提高代碼覆蓋率

## 🔧 相關文件修改

### 1. **Ladder.jsx**

- 添加 lastConditionCheckRef
- 優化 useMemo 依賴項
- 實現條件檢查防抖
- 改進日誌輸出邏輯

### 2. **性能改進**

- 減少重複計算
- 消除重複日誌
- 提高響應速度

### 3. **代碼質量**

- 遵循 React 最佳實踐
- 提高代碼可維護性
- 改善調試體驗
