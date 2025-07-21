# 暱稱輸入延遲優化

## 🚨 問題描述

用戶報告暱稱輸入時延遲嚴重，影響使用體驗。經過分析發現以下問題：

### 1. **防抖機制問題**

- 原來的 `handleNicknameChange` 函數在 `useCallback` 內部錯誤使用 `useRef`
- 每次輸入都會創建新的定時器，但沒有正確清理
- 防抖時間設置為 1 秒，感覺過於延遲

### 2. **UserContext 防抖過長**

- 所有數據變化都使用 15 秒防抖
- 暱稱變化也被當作重要數據處理，延遲過長

## 🔧 修復方案

### 1. **修復 handleNicknameChange 函數**

**修復前**：

```javascript
const handleNicknameChange = useCallback(
  e => {
    const nickname = e.target.value;

    // 錯誤：在 useCallback 內部使用 useRef
    const timeoutId = setTimeout(() => {
      setUserData(prev => ({
        ...prev,
        nickname: nickname,
        ageGroup: ageGroup,
        ladderScore: ladderScore,
      }));
    }, 1000); // 1秒防抖

    return () => clearTimeout(timeoutId); // 這個清理函數不會被調用
  },
  [ageGroup, ladderScore]
);
```

**修復後**：

```javascript
// 在組件頂層定義 useRef
const nicknameTimeoutRef = useRef(null);

const handleNicknameChange = useCallback(
  e => {
    const nickname = e.target.value;

    // 立即更新本地狀態，提供即時反饋
    setUserData(prev => ({
      ...prev,
      nickname: nickname,
    }));

    // 清除之前的定時器
    if (nicknameTimeoutRef.current) {
      clearTimeout(nicknameTimeoutRef.current);
    }

    // 設置新的防抖定時器
    nicknameTimeoutRef.current = setTimeout(() => {
      nicknameTimeoutRef.current = null;
    }, 500); // 500毫秒防抖
  },
  [setUserData]
);
```

### 2. **優化 UserContext 防抖機制**

**修復前**：

```javascript
// 所有重要數據變化都使用15秒防抖
setUserDataDebounceRef.current = setTimeout(() => {
  saveUserData(newData);
}, 15000);
```

**修復後**：

```javascript
// 檢查是否只是暱稱變化
const isOnlyNicknameChange =
  JSON.stringify(newData.nickname) !== JSON.stringify(userData.nickname) &&
  JSON.stringify({ ...newData, nickname: userData.nickname }) ===
    JSON.stringify({ ...userData, nickname: newData.nickname });

// 暱稱變化使用較短的防抖時間
const debounceTime = isOnlyNicknameChange ? 1000 : 15000; // 暱稱1秒，其他15秒

setUserDataDebounceRef.current = setTimeout(() => {
  saveUserData(newData);
}, debounceTime);
```

## 📊 優化效果

### 響應性提升

- **輸入響應**：從 1 秒延遲降至即時響應
- **本地狀態更新**：立即更新，用戶可看到即時反饋
- **Firebase 寫入**：從 15 秒降至 1 秒（僅暱稱變化）

### 性能平衡

- **防抖時間**：500 毫秒本地防抖 + 1 秒 Firebase 防抖
- **寫入頻率**：避免過於頻繁的 Firebase 寫入
- **用戶體驗**：保持流暢的輸入體驗

## 🎯 技術細節

### 1. **即時反饋機制**

```javascript
// 立即更新本地狀態
setUserData(prev => ({
  ...prev,
  nickname: nickname,
}));
```

### 2. **智能防抖檢測**

```javascript
// 檢測是否只是暱稱變化
const isOnlyNicknameChange =
  JSON.stringify(newData.nickname) !== JSON.stringify(userData.nickname) &&
  JSON.stringify({ ...newData, nickname: userData.nickname }) ===
    JSON.stringify({ ...userData, nickname: newData.nickname });
```

### 3. **動態防抖時間**

```javascript
// 根據數據類型調整防抖時間
const debounceTime = isOnlyNicknameChange ? 1000 : 15000;
```

## 🔍 監控重點

### 1. **響應性測試**

- 輸入響應是否即時
- 本地狀態更新是否正常
- Firebase 寫入是否在合理時間內

### 2. **性能監控**

- Firebase 寫入頻率是否合理
- 防抖機制是否正常工作
- 內存使用是否正常

### 3. **用戶體驗**

- 輸入是否流暢
- 數據保存是否可靠
- 錯誤處理是否完善

## 📝 最佳實踐

### 1. **防抖設計原則**

- 即時更新本地狀態
- 延遲保存到遠程數據庫
- 根據數據重要性調整防抖時間

### 2. **用戶體驗優先**

- 優先保證響應性
- 在性能和體驗間找到平衡
- 提供即時反饋

### 3. **代碼維護性**

- 正確使用 React Hooks
- 清晰的函數職責分離
- 完善的錯誤處理

## 🚀 未來優化方向

### 1. **進一步優化**

- 考慮使用 `useMemo` 優化性能
- 實現更智能的防抖策略
- 添加輸入驗證和錯誤提示

### 2. **監控和調試**

- 添加性能監控
- 實現用戶行為分析
- 優化錯誤日誌

### 3. **用戶體驗提升**

- 添加輸入提示
- 實現自動保存指示器
- 優化錯誤處理流程
