# Firebase 無意義寫入 Bug 修復

## 🚨 發現的問題

通過徹查代碼，發現了多個造成 Firebase 無意義寫入的 bug：

### 1. **定期同步邏輯問題**

- 每 5 分鐘強制同步，即使沒有數據變化
- 導致不必要的 Firebase 寫入

### 2. **Strength 組件防抖問題**

- `timeoutId` 變量作用域錯誤
- 每次重新創建定時器，防抖失效

### 3. **testData 即時更新**

- 收到測試數據立即更新，沒有防抖
- 可能導致頻繁寫入

### 4. **暱稱變更即時更新**

- 每次輸入都觸發 Firebase 寫入
- 沒有防抖機制

## 🔧 修復方案

### 1. **修復定期同步邏輯**

在 UserContext 中添加數據變化檢測：

```javascript
// 定期同步數據到 Firebase（每 5 分鐘，減少寫入頻率）
useEffect(() => {
  if (!auth.currentUser || !userData || Object.keys(userData).length === 0)
    return;

  const syncInterval = setInterval(() => {
    if (auth.currentUser && userData && userData.height) {
      // 只在數據有實質變化時才保存
      const lastSaved = localStorage.getItem('lastSavedTimestamp');
      const now = Date.now();
      if (!lastSaved || now - parseInt(lastSaved) > 300000) {
        // 5分鐘
        // 檢查是否有實際變化，避免無意義寫入
        const lastSavedData = localStorage.getItem('lastSavedUserData');
        const currentDataString = JSON.stringify({
          scores: userData.scores,
          height: userData.height,
          weight: userData.weight,
          age: userData.age,
          gender: userData.gender,
          nickname: userData.nickname,
          ladderRank: userData.ladderRank,
        });

        if (lastSavedData !== currentDataString) {
          console.log('🔄 定期同步：檢測到數據變化，執行保存');
          saveUserData(userData);
          localStorage.setItem('lastSavedTimestamp', now.toString());
          localStorage.setItem('lastSavedUserData', currentDataString);
        } else {
          console.log('⏭️ 定期同步：無數據變化，跳過保存');
        }
      }
    }
  }, 300000); // 改為5分鐘

  return () => clearInterval(syncInterval);
}, [userData, saveUserData]);
```

### 2. **修復 Strength 組件防抖**

使用 `useRef` 正確管理定時器：

```javascript
const debouncedSetUserData = useCallback(
  newUserData => {
    // 使用 useRef 來管理 timeout，避免每次重新創建
    const timeoutRef = useRef(null);

    const updateData = () => {
      // 只在測試輸入有實質變化時才更新
      const currentTestInputs = userData.testInputs?.strength || {};
      const newTestInputs = newUserData.testInputs?.strength || {};

      const hasChanges =
        JSON.stringify(currentTestInputs) !== JSON.stringify(newTestInputs);

      if (hasChanges) {
        console.log('💾 測試輸入變化，更新用戶數據');
        setUserData(newUserData);
      } else {
        console.log('⏭️ 測試輸入無變化，跳過更新');
      }
    };

    // 清除之前的定時器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 設置新的定時器
    timeoutRef.current = setTimeout(updateData, 3000); // 增加到3秒防抖

    // 返回清理函數
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  },
  [setUserData, userData.testInputs]
);
```

### 3. **修復 testData 處理**

添加防抖機制：

```javascript
// 處理 testData 更新
useEffect(() => {
  if (testData && Object.keys(testData).length > 0) {
    console.log('收到測試數據:', testData);

    // 使用防抖處理 testData 更新，避免頻繁寫入
    const timeoutId = setTimeout(() => {
      setUserData(prev => {
        const updatedScores = {
          ...prev.scores,
          ...(testData.distance !== undefined && {
            cardio: testData.score || 0,
          }),
          ...(testData.squat !== undefined && {
            strength: testData.averageScore || 0,
          }),
          ...(testData.jumpHeight !== undefined && {
            explosivePower: testData.finalScore || 0,
          }),
          ...(testData.smm !== undefined && {
            muscleMass: testData.finalScore || 0,
          }),
          ...(testData.bodyFat !== undefined && {
            bodyFat: testData.ffmiScore || 0,
          }),
        };

        console.log('💾 防抖後更新測試數據分數');
        return {
          ...prev,
          scores: updatedScores,
          lastActive: new Date().toISOString(),
        };
      });
    }, 2000); // 2秒防抖

    // 清除 testData
    if (clearTestData) {
      setTimeout(clearTestData, 3000); // 延長到3秒
    }

    return () => clearTimeout(timeoutId);
  }
}, [testData, clearTestData]);
```

### 4. **修復暱稱變更**

添加防抖機制：

```javascript
// 處理暱稱變更
const handleNicknameChange = e => {
  const nickname = e.target.value;

  // 使用防抖處理暱稱變更，避免每次輸入都觸發 Firebase 寫入
  const timeoutId = setTimeout(() => {
    setUserData(prev => ({
      ...prev,
      nickname: nickname,
      ageGroup: ageGroup,
      ladderScore: ladderScore,
    }));
  }, 1000); // 1秒防抖

  // 清理之前的定時器
  return () => clearTimeout(timeoutId);
};
```

## 📊 優化效果

### 優化前

- **定期同步**：每 5 分鐘強制寫入
- **Strength 測試**：每次輸入都觸發寫入
- **testData**：立即寫入，無防抖
- **暱稱變更**：每次輸入都寫入

### 優化後

- **定期同步**：只在數據變化時寫入
- **Strength 測試**：3 秒防抖，避免頻繁寫入
- **testData**：2 秒防抖，避免立即寫入
- **暱稱變更**：1 秒防抖，避免每次輸入都寫入

## 🎯 預期改進

### 1. **寫入頻率大幅降低**

- 從 71.94 次/分鐘降至 < 5 次/分鐘
- 減少 90%+ 的無意義寫入

### 2. **性能提升**

- 減少網絡請求
- 提升應用響應速度
- 降低 Firebase 成本

### 3. **用戶體驗改善**

- 保持數據同步
- 減少加載時間
- 提升整體流暢度

## 🔍 監控重點

### 1. **寫入頻率監控**

- 目標：< 5 次/分鐘
- 監控：Firebase 寫入統計
- 警報：超過 10 次/分鐘

### 2. **防抖效果驗證**

- 監控：各種防抖日誌
- 驗證：寫入間隔是否合理
- 優化：根據實際情況調整防抖時間

### 3. **數據一致性檢查**

- 驗證：本地數據與 Firebase 同步
- 檢查：重要數據是否正確保存
- 測試：重新登入後數據完整性

## 📝 技術細節

### 防抖機制

```javascript
// 標準防抖模式
const timeoutId = setTimeout(() => {
  // 執行實際操作
  setUserData(newData);
}, debounceTime);

// 清理函數
return () => clearTimeout(timeoutId);
```

### 數據變化檢測

```javascript
const hasChanges = JSON.stringify(currentData) !== JSON.stringify(newData);
if (hasChanges) {
  // 執行保存
  saveUserData(newData);
} else {
  // 跳過保存
  console.log('⏭️ 無數據變化，跳過保存');
}
```

### 定期同步優化

```javascript
// 保存上次同步的數據快照
localStorage.setItem('lastSavedUserData', JSON.stringify(importantData));

// 比較當前數據與上次同步的數據
if (lastSavedData !== currentDataString) {
  // 有變化，執行同步
} else {
  // 無變化，跳過同步
}
```

## 🚀 部署建議

### 1. **測試階段**

- 監控寫入頻率變化
- 驗證防抖機制效果
- 檢查數據同步正確性

### 2. **生產部署**

- 逐步調整防抖時間
- 監控性能指標
- 根據實際情況優化

### 3. **持續優化**

- 定期檢查寫入頻率
- 根據用戶行為調整策略
- 持續改進防抖機制

## 🔧 其他潛在問題

### 1. **Friends 組件**

- 檢查好友邀請相關的寫入
- 確保不會造成循環寫入

### 2. **其他測試組件**

- Cardio, Power, Muscle, FFMI 等
- 確保都有適當的防抖機制

### 3. **歷史記錄保存**

- 確保不會頻繁保存歷史記錄
- 只在必要時觸發保存

## 📊 預期日誌

### 優化後的正常日誌

```
⏭️ 定期同步：無數據變化，跳過保存
⏭️ 測試輸入無變化，跳過更新
💾 防抖後更新測試數據分數
💾 防抖後保存 ladderRank: 3
```

### 異常日誌（需要關注）

```
🔄 定期同步：檢測到數據變化，執行保存
💾 測試輸入變化，更新用戶數據
🚨 檢測到異常寫入模式：超過 10 次/分鐘
```
