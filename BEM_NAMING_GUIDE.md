# 🎯 BEM 命名規範指南

## 📋 什麼是 BEM？

BEM（Block Element Modifier）是一種 CSS 命名規範，用於創建可重用和可維護的 CSS 代碼。

### 🔤 BEM 命名結構

```
.block__element--modifier
```

- **Block（區塊）**：獨立的組件，如 `.user-info`、`.friends-list`
- **Element（元素）**：屬於區塊的子元素，用 `__` 連接，如 `.user-info__logout-btn`
- **Modifier（修飾符）**：改變外觀或行為，用 `--` 連接，如 `.btn--disabled`

## 🎨 我們的命名規範

### 📦 **組件命名空間**

每個組件都有自己的命名空間：

```css
/* 用戶資訊組件 */
.user-info {
}
.user-info__logout-btn {
}
.user-info__logout-icon {
}

/* 好友列表組件 */
.friends-list {
}
.friends-list__friend-card {
}
.friends-list__friend-avatar {
}
.friends-list__friend-name {
}
.friends-list__btn-challenge {
}

/* 社區動態組件 */
.community-feed {
}
.community-feed__post {
}
.community-feed__post-content {
}

/* 排行榜組件 */
.ladder-system {
}
.ladder-system__rank-card {
}
.ladder-system__score-display {
}
```

### 🔧 **按鈕命名規範**

```css
/* 通用按鈕 */
.component-name__btn-primary {
}
.component-name__btn-secondary {
}
.component-name__btn-danger {
}

/* 狀態修飾符 */
.component-name__btn--disabled {
}
.component-name__btn--loading {
}
.component-name__btn--active {
}
```

### 📱 **響應式命名**

```css
/* 桌面版 */
.component-name__element {
}

/* 手機版 */
@media (max-width: 768px) {
  .component-name__element {
    /* 手機版樣式 */
  }
}
```

## 📝 **命名範例**

### ✅ **正確的命名**

```css
/* 好友卡片 */
.friends-list__friend-card {
}
.friends-list__friend-avatar {
}
.friends-list__friend-info {
}
.friends-list__friend-name {
}
.friends-list__friend-score {
}
.friends-list__friend-email {
}
.friends-list__friend-actions {
}

/* 按鈕 */
.friends-list__btn-challenge {
}
.friends-list__btn-remove {
}
.friends-list__btn-accept {
}
.friends-list__btn-reject {
}
.friends-list__btn-add {
}

/* 狀態 */
.friends-list__btn-add--disabled {
}
.friends-list__friend-card--loading {
}
```

### ❌ **錯誤的命名**

```css
/* 避免使用通用名稱 */
.friend-card {
} /* 可能與其他組件衝突 */
.btn-challenge {
} /* 可能與其他組件衝突 */
.avatar {
} /* 太通用，容易衝突 */

/* 避免使用駝峰命名 */
.friendCard {
} /* 不符合BEM規範 */
.btnChallenge {
} /* 不符合BEM規範 */

/* 避免使用下劃線 */
.friend_card {
} /* 應該使用雙下劃線 */
.btn_challenge {
} /* 應該使用雙下劃線 */
```

## 🛠️ **實施步驟**

### 1. **識別組件邊界**

```jsx
// 確定組件的根元素
<div className="friends-list">
  <div className="friends-list__friend-card">{/* 好友卡片內容 */}</div>
</div>
```

### 2. **命名子元素**

```jsx
<div className="friends-list__friend-card">
  <div className="friends-list__friend-avatar">
    <img src="..." alt="..." />
  </div>
  <div className="friends-list__friend-info">
    <div className="friends-list__friend-name">暱稱</div>
    <div className="friends-list__friend-score">分數</div>
  </div>
  <div className="friends-list__friend-actions">
    <button className="friends-list__btn-challenge">挑戰</button>
  </div>
</div>
```

### 3. **添加修飾符**

```jsx
<button
  className="friends-list__btn-add friends-list__btn-add--disabled"
  disabled
>
  加好友
</button>
```

## 🔍 **常見問題解決**

### **問題 1：樣式衝突**

```css
/* 舊方式：容易衝突 */
.friend-card {
}

/* 新方式：避免衝突 */
.friends-list__friend-card {
}
```

### **問題 2：響應式樣式**

```css
/* 桌面版 */
.friends-list__friend-card {
  padding: 16px;
}

/* 手機版 */
@media (max-width: 768px) {
  .friends-list__friend-card {
    padding: 12px;
  }
}
```

### **問題 3：狀態樣式**

```css
/* 正常狀態 */
.friends-list__btn-add {
}

/* 禁用狀態 */
.friends-list__btn-add--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## 📋 **檢查清單**

### ✅ **命名檢查**

- [ ] 使用組件命名空間
- [ ] 使用雙下劃線連接元素
- [ ] 使用雙連字符連接修飾符
- [ ] 避免使用通用名稱
- [ ] 避免使用駝峰命名

### ✅ **結構檢查**

- [ ] 每個組件有明確的根元素
- [ ] 子元素正確命名
- [ ] 狀態修飾符正確使用
- [ ] 響應式樣式正確命名

### ✅ **維護檢查**

- [ ] 樣式不與其他組件衝突
- [ ] 容易理解和修改
- [ ] 可以重用和擴展
- [ ] 文檔完整

## 🚀 **最佳實踐**

1. **保持一致性**：整個項目使用相同的命名規範
2. **避免過度嵌套**：最多 3 層嵌套
3. **使用語義化名稱**：名稱要能清楚表達用途
4. **保持簡潔**：避免過長的類名
5. **文檔化**：為複雜的組件建立文檔

---

**記住：BEM 不是萬能的，但它是解決 CSS 衝突的有效工具！** 🎯
