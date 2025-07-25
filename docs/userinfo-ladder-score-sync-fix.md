# UserInfo 頁面天梯分數同步修復

## 🚨 問題描述

用戶報告天梯提交後出現以下問題：

1. **點擊提交到天梯**：跳出 modal 後，點擊確定提交
2. **天梯頁面已更新**：天梯頁面顯示的分數已經正確更新
3. **UserInfo 頁面未更新**：返回 UserInfo 頁面時，天梯數據還顯示舊的分數

### 問題分析

經過分析發現問題根源：

1. **數據同步問題**：天梯提交成功後，雖然立即保存到 Firebase，但 UserInfo 頁面的 `userData.ladderScore` 沒有立即更新
2. **UserContext 緩存**：UserContext 中的用戶數據可能還保留舊的天梯分數
3. **缺少強制重新載入**：天梯提交後沒有強制重新載入用戶數據

## 🔧 修復方案

### 1. **天梯提交後強制重新載入用戶數據**

**修復前**：

```javascript
// 立即保存到 Firebase，不等待防抖
try {
  const userRef = doc(db, 'users', auth.currentUser.uid);
  await setDoc(
    userRef,
    {
      ladderScore: ladderScore,
      lastLadderSubmission: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log('天梯分數已立即保存到 Firebase:', ladderScore);
} catch (error) {
  console.error('保存天梯分數到 Firebase 失敗:', error);
  throw error;
}
```

**修復後**：

```javascript
// 立即保存到 Firebase，不等待防抖
try {
  const userRef = doc(db, 'users', auth.currentUser.uid);
  await setDoc(
    userRef,
    {
      ladderScore: ladderScore,
      lastLadderSubmission: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log('天梯分數已立即保存到 Firebase:', ladderScore);
} catch (error) {
  console.error('保存天梯分數到 Firebase 失敗:', error);
  throw error;
}

// 強制重新載入用戶數據，確保 UserInfo 頁面顯示最新數據
try {
  await loadUserData(auth.currentUser, true);
  console.log('用戶數據已重新載入，天梯分數已更新');
} catch (error) {
  console.error('重新載入用戶數據失敗:', error);
}
```

### 2. **修復 loadUserData 調用參數**

**修復前**：

```javascript
// 如果資料為空，嘗試重新載入
if (!userData.height && !userData.weight && !userData.age) {
  console.log('UserInfo - 資料為空，嘗試重新載入');
  await loadUserData();
}
```

**修復後**：

```javascript
// 如果資料為空，嘗試重新載入
if (!userData.height && !userData.weight && !userData.age) {
  console.log('UserInfo - 資料為空，嘗試重新載入');
  await loadUserData(currentUser, true);
}
```

### 3. **更新依賴數組**

**修復前**：

```javascript
}, [userData.scores, setUserData, loading, navigate]);
```

**修復後**：

```javascript
}, [userData.scores, setUserData, loading, navigate, loadUserData]);
```

### 4. **修復變量名衝突**

**修復前**：

```javascript
querySnapshot.forEach(doc => {
  const userData = doc.data(); // 變量名衝突！
  if (userData.ladderScore > 0) {
    users.push({
      id: doc.id,
      ...userData,
    });
  }
});

// 找到用戶的排名
const userIndex = users.findIndex(user => user.id === userData.userId); // 這裡的 userData 是錯誤的
```

**修復後**：

```javascript
querySnapshot.forEach(doc => {
  const docData = doc.data(); // 使用不同的變量名
  if (docData.ladderScore > 0) {
    users.push({
      id: doc.id,
      ...docData,
    });
  }
});

// 找到用戶的排名
const userIndex = users.findIndex(user => user.id === userData.userId); // 現在正確引用外層的 userData
```

```

## 📊 修復效果

### 功能改進

- **即時數據同步**：天梯提交後，UserInfo 頁面立即顯示最新的天梯分數
- **強制重新載入**：確保 UserContext 中的數據與 Firebase 保持同步
- **用戶體驗提升**：用戶不再需要手動刷新頁面來看到更新的分數
- **排名計算修復**：修復了變量名衝突導致的排名計算錯誤

### 技術細節

- **參數正確性**：修復了 `loadUserData` 函數調用時缺少必要參數的問題
- **強制重新載入**：使用 `forceReload = true` 參數確保從 Firebase 重新獲取最新數據
- **錯誤處理**：添加了適當的錯誤處理，確保即使重新載入失敗也不會影響提交流程
- **變量名修復**：修復了 `fetchUserRank` 函數中的變量名衝突問題，確保排名計算正確

## 🎯 測試驗證

### 測試步驟

1. **完成全部評測**：確保完成 5 項評測項目
2. **提交到天梯**：點擊"提交到天梯"按鈕
3. **確認提交**：在確認對話框中點擊"確定提交"
4. **檢查 UserInfo 頁面**：確認天梯分數已正確更新
5. **檢查天梯頁面**：導航到天梯頁面確認分數正確

### 預期結果

- UserInfo 頁面的天梯分數應該立即更新為最新提交的分數
- 天梯頁面應該顯示正確的排名和分數
- 兩個頁面的數據應該保持同步

## 🔍 相關文件

- `src/UserInfo.jsx` - 主要修復文件
- `src/UserContext.jsx` - 用戶數據管理
- `src/components/Ladder.jsx` - 天梯頁面組件
- `docs/ladder-submission-fix.md` - 天梯提交機制修復文檔
```
