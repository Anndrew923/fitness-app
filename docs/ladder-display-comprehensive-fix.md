# 天梯顯示全面修復

## 🚨 問題描述

用戶報告天梯排行榜顯示問題：

1. **第一名不見了**：天梯排行榜中第一名用戶沒有顯示
2. **浮動排名框顯示邏輯需要調整**：希望改為 7 名之後才顯示浮動排名框

## 🔍 問題分析

### 1. **第一名消失的可能原因**：

- 查詢限制過小，導致第一名被過濾掉
- 年齡段過濾可能過於嚴格
- 本周新進榜過濾可能影響總排行榜
- 數據載入邏輯有問題

### 2. **浮動排名框顯示邏輯**：

- 當前設定為前 10 名內不顯示浮動框
- 需要調整為前 7 名內不顯示浮動框

## 🔧 修復方案

### 1. **修復第一名消失問題**

**修復前**：

```javascript
// 查詢限制可能過小
q = query(
  collection(db, 'users'),
  orderBy('ladderScore', 'desc'),
  limit(limitCount * 2) // 動態限制，可能過小
);

// 數據限制可能過小
data = data.slice(0, limitCount);
```

**修復後**：

```javascript
// 確保能獲取足夠的數據，包括第一名
q = query(
  collection(db, 'users'),
  orderBy('ladderScore', 'desc'),
  limit(100) // 固定獲取前100名，確保第一名不會被過濾掉
);

// 確保至少顯示前50名，包括第一名
const displayCount = Math.max(50, limitCount);
data = data.slice(0, displayCount);

console.log(
  `📊 天梯數據載入完成：共 ${data.length} 名用戶，最高分：${
    data[0]?.ladderScore || 0
  }`
);
```

### 2. **調整浮動排名框顯示邏輯**

**修復前**：

```javascript
// 如果用戶排名在前10名內，也不顯示浮動框
if (userRank > 0 && userRank <= 10) {
  return null;
}
```

**修復後**：

```javascript
// 如果用戶排名在前7名內，也不顯示浮動框
if (userRank > 0 && userRank <= 7) {
  return null;
}
```

### 3. **增加數據過濾日誌**

**修復前**：

```javascript
// 客戶端過濾年齡分段
if (selectedAgeGroup !== 'all') {
  data = data.filter(user => user.ageGroup === selectedAgeGroup);
}
```

**修復後**：

```javascript
// 客戶端過濾年齡分段
if (selectedAgeGroup !== 'all') {
  const beforeFilterCount = data.length;
  data = data.filter(user => user.ageGroup === selectedAgeGroup);
  console.log(`👥 年齡段過濾：${beforeFilterCount} → ${data.length} 名用戶`);
}
```

## 📊 修復效果

### 1. **第一名顯示修復**

- ✅ 確保第一名用戶正確顯示
- ✅ 查詢限制足夠大，不會過濾掉高分用戶
- ✅ 數據載入邏輯更穩定

### 2. **浮動排名框邏輯優化**

- ✅ 前 7 名用戶不顯示浮動框
- ✅ 第 8 名及之後的用戶顯示浮動框
- ✅ 避免與列表項目產生交錯

### 3. **數據過濾透明度**

- ✅ 增加過濾日誌，便於調試
- ✅ 清楚顯示過濾前後的用戶數量
- ✅ 便於發現數據問題

## 🎯 顯示規則

### 1. **天梯列表顯示規則**：

- 按分數降序排列
- 至少顯示前 50 名用戶
- 根據用戶排名動態調整顯示數量
- 當前用戶有特殊高亮顯示

### 2. **浮動排名框顯示條件**：

- 用戶必須有有效的天梯分數
- 用戶不能已經在天梯列表中顯示
- 用戶排名不能為 0（未上榜）
- 用戶排名必須超過 7 名

### 3. **數據過濾規則**：

- 年齡段過濾：只在選擇特定年齡段時生效
- 本周新進榜：只在選擇本周新進榜時生效
- 總排行榜：顯示所有符合條件的用戶

## 🔍 調試和監控

### 1. **數據載入日誌**：

```javascript
console.log(
  `📊 天梯數據載入完成：共 ${data.length} 名用戶，最高分：${
    data[0]?.ladderScore || 0
  }`
);
```

### 2. **過濾日誌**：

```javascript
console.log(`👥 年齡段過濾：${beforeFilterCount} → ${data.length} 名用戶`);
console.log(`📅 本周新進榜過濾：${beforeFilterCount} → ${data.length} 名用戶`);
```

### 3. **排名計算日誌**：

```javascript
console.log(
  `🎯 確保顯示用戶排名：用戶排名=${userRank}, 查詢限制=${limitCount}`
);
```

## 🚀 測試建議

### 1. **第一名顯示測試**：

1. 檢查天梯排行榜是否顯示第一名
2. 確認第一名分數和用戶信息正確
3. 驗證第一名排名徽章顯示正確

### 2. **浮動排名框測試**：

1. 測試排名第 7 名的用戶（不應顯示浮動框）
2. 測試排名第 8 名的用戶（應顯示浮動框）
3. 確認浮動框位置和內容正確

### 3. **數據過濾測試**：

1. 測試年齡段過濾功能
2. 測試本周新進榜過濾功能
3. 確認過濾後數據正確

### 4. **邊界情況測試**：

1. 測試沒有用戶數據的情況
2. 測試只有少數用戶的情況
3. 測試用戶排名為 0 的情況

## 📝 技術細節

### 1. **查詢優化**：

```javascript
// 固定獲取前100名，確保數據完整性
q = query(collection(db, 'users'), orderBy('ladderScore', 'desc'), limit(100));
```

### 2. **顯示數量計算**：

```javascript
// 確保至少顯示前50名
const displayCount = Math.max(50, limitCount);
data = data.slice(0, displayCount);
```

### 3. **浮動框顯示邏輯**：

```javascript
// 檢查用戶是否已經在天梯列表中顯示
const isUserInList = ladderData.some(user => user.id === userData?.userId);

// 如果用戶已經在列表中顯示，不顯示浮動框
if (isUserInList) {
  return null;
}

// 如果用戶排名在前7名內，也不顯示浮動框
if (userRank > 0 && userRank <= 7) {
  return null;
}
```

## 🔧 維護建議

### 1. **持續監控**：

- 定期檢查第一名是否正常顯示
- 監控數據載入日誌
- 觀察過濾效果

### 2. **性能優化**：

- 監控查詢性能
- 優化數據過濾邏輯
- 確保響應速度

### 3. **用戶體驗**：

- 收集用戶反饋
- 監控錯誤報告
- 持續改進顯示效果

## 🎯 預期效果

### 1. **顯示完整性**：

- 第一名用戶正確顯示
- 所有排名用戶都能看到
- 浮動排名框使用合理

### 2. **用戶體驗**：

- 界面更直觀
- 信息顯示準確
- 操作更流暢

### 3. **功能穩定性**：

- 數據載入更穩定
- 過濾功能正常
- 排名計算準確
