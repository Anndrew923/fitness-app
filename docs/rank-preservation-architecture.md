# 排名保存架構重構

## 🚨 問題根源

用戶反映的問題根源在於**架構設計缺陷**：

### 原有架構問題

1. **即時計算**：每次進入天梯頁面才計算排名
2. **無歷史數據**：沒有保存用戶之前的排名
3. **無法比較**：無法知道排名是否真的發生了變化

### 架構流程問題

```
用戶更新分數 → UserContext 更新 → 進入天梯頁面 → 重新計算排名
```

**問題**：沒有中間狀態保存舊排名，所有排名都是「當前排名」

## 🛠️ 新架構設計

### 核心思路

將排名保存邏輯前移到**數據更新時**，而不是**頁面載入時**

### 新架構流程

```
用戶更新分數 → 保存舊排名 → UserContext 更新 → 進入天梯頁面 → 使用保存的舊排名
```

## 🔧 實現方案

### 1. **UserContext 層面保存舊排名**

在 `setUserData` 中檢測分數變化並保存舊排名：

```javascript
// 如果分數有變化，保存舊排名用於動畫
if (newData.ladderScore !== oldLadderScore) {
  console.log(`📊 分數變化：${oldLadderScore} → ${newData.ladderScore}`);
  // 保存舊排名到 localStorage，供 Ladder 組件使用
  localStorage.setItem(
    'previousUserRank',
    JSON.stringify({
      rank: userData.ladderRank || 0,
      score: oldLadderScore,
      timestamp: Date.now(),
    })
  );
}
```

### 2. **Ladder 組件讀取舊排名**

在 Ladder 組件初始化時讀取保存的舊排名：

```javascript
// 從 localStorage 讀取舊排名
useEffect(() => {
  if (userData && userData.ladderScore > 0) {
    const savedPreviousRank = localStorage.getItem('previousUserRank');
    if (savedPreviousRank) {
      const previousRankData = JSON.parse(savedPreviousRank);

      // 檢查是否是最近的數據（5分鐘內）
      const isRecent = Date.now() - previousRankData.timestamp < 5 * 60 * 1000;

      if (isRecent && previousRankData.rank > 0) {
        setPreviousUserData({
          ...userData,
          currentRank: previousRankData.rank,
        });
      }
    }
  }
}, [userData?.ladderScore]);
```

### 3. **動畫完成後清理**

動畫完成後清除保存的舊排名：

```javascript
// 動畫完成後清除保存的舊排名
setTimeout(() => {
  localStorage.removeItem('previousUserRank');
  console.log(`🧹 動畫完成，清除保存的舊排名`);
}, 5000);
```

### 4. **更新用戶排名記錄**

在 `loadLadderData` 中更新用戶的排名記錄：

```javascript
// 更新 userData 中的 ladderRank，供 UserContext 使用
if (userData && userData.ladderRank !== newRank) {
  console.log(`💾 更新用戶排名記錄：${userData.ladderRank || 0} → ${newRank}`);
  const updatedUserData = { ...userData, ladderRank: newRank };
  localStorage.setItem('userData', JSON.stringify(updatedUserData));
}
```

## 🎯 新架構優勢

### 1. **時機正確**

- 在數據更新時保存舊排名
- 在頁面載入時使用保存的舊排名
- 避免了時序問題

### 2. **數據完整**

- 保存了完整的舊排名信息
- 包含時間戳，可以驗證數據有效性
- 支持過期清理

### 3. **架構清晰**

- 職責分離：UserContext 負責保存，Ladder 負責使用
- 數據流清晰：更新 → 保存 → 載入 → 使用
- 易於維護和擴展

## 📊 預期效果

### 修復後的日誌流程

```
📊 分數變化：75.2 → 85.6
💾 更新用戶排名記錄：3 → 1
📖 讀取保存的舊排名：3
✅ 使用保存的舊排名：3
🔍 排名變化檢測：從第 3 名到第 1 名
🎯 檢測到排名提升：從第 3 名到第 1 名
設置顯示排名為舊排名：3
🧹 動畫完成，清除保存的舊排名
```

## 🔧 技術細節

### 數據結構

```javascript
// 保存的舊排名數據結構
{
  rank: 3,           // 舊排名
  score: 75.2,       // 舊分數
  timestamp: 1640995200000  // 保存時間戳
}
```

### 過期機制

- 數據有效期：5 分鐘
- 動畫完成後：立即清除
- 無效數據：自動清理

### 錯誤處理

- JSON 解析失敗：清除無效數據
- 時間戳過期：自動清理
- 排名無效：忽略並記錄

## 🚀 部署建議

### 1. **測試階段**

- 清除瀏覽器緩存
- 測試分數更新流程
- 驗證動畫觸發邏輯

### 2. **監控指標**

- 舊排名保存成功率
- 動畫觸發準確率
- 數據清理效率

### 3. **後續優化**

- 考慮使用 IndexedDB 替代 localStorage
- 添加數據壓縮和加密
- 實現跨設備同步
