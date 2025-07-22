# CSS 架構規範指南

## 🎯 目標

解決 CSS 互相覆蓋問題，建立可維護的 CSS 架構

## 📁 當前問題分析

### 問題 1：CSS 檔案分散且重複

- 全域樣式：`App.css`, `styles.css`, `index.css`
- 頁面樣式：`UserInfo.css`, `History.css`, `Strength.css` 等
- 組件樣式：`Friends.css`, `Community.css`, `Ladder.css` 等
- 總計：20+ CSS 檔案，容易衝突

### 問題 2：選擇器特異性問題

- 全域樣式影響組件樣式
- 組件間樣式互相影響
- 需要使用 `!important` 強制覆蓋

### 問題 3：命名衝突

- 通用 class 名稱（如 `.btn`, `.card`）在多個檔案中定義
- 沒有命名空間隔離

## 🏗️ 解決方案：CSS 架構重構

### 方案 1：CSS Modules（推薦）

```javascript
// 使用方式
import styles from './UserInfo.module.css';

// JSX中使用
<button className={styles.logoutBtn}>登出</button>;
```

### 方案 2：CSS-in-JS（Styled Components）

```javascript
import styled from 'styled-components';

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #ff6f61 0%, #ff8a80 100%);
  border-radius: 50%;
  width: 32px;
  height: 32px;
`;
```

### 方案 3：BEM 命名規範（立即實施）

```css
/* 使用BEM命名避免衝突 */
.user-info__logout-btn {
  background: linear-gradient(135deg, #ff6f61 0%, #ff8a80 100%);
}

.user-info__logout-btn--hover {
  transform: scale(1.1);
}
```

## 🚀 立即實施方案

### 步驟 1：建立 CSS 命名空間

```css
/* 全域樣式 - 只定義基礎樣式 */
:root {
  --primary-color: #ff6f61;
  --secondary-color: #ff8a80;
  --border-radius: 8px;
}

/* 組件樣式 - 使用命名空間 */
.user-info {
  /* UserInfo組件樣式 */
}

.friends-list {
  /* Friends組件樣式 */
}

.community-feed {
  /* Community組件樣式 */
}
```

### 步驟 2：建立 CSS 變數系統

```css
/* 在 :root 中定義所有變數 */
:root {
  /* 顏色系統 */
  --color-primary: #ff6f61;
  --color-secondary: #ff8a80;
  --color-success: #2ed573;
  --color-warning: #ffa502;
  --color-error: #ff4757;

  /* 尺寸系統 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 字體系統 */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
}
```

### 步驟 3：建立組件樣式模板

```css
/* 組件樣式模板 */
.component-name {
  /* 組件容器 */
}

.component-name__element {
  /* 組件內元素 */
}

.component-name__element--modifier {
  /* 修飾符 */
}

.component-name__element--state {
  /* 狀態 */
}
```

## 📋 實施計劃

### 階段 1：立即修復（1-2 天）

1. 建立 CSS 變數系統
2. 為每個組件添加命名空間
3. 修復當前衝突問題

### 階段 2：重構（1 週）

1. 將 CSS 檔案轉換為 CSS Modules
2. 移除全域樣式衝突
3. 建立組件樣式庫

### 階段 3：優化（持續）

1. 建立樣式指南
2. 自動化 CSS 檢查
3. 建立樣式測試

## 🛠️ 工具建議

### 1. CSS Modules

```bash
npm install css-loader style-loader
```

### 2. PostCSS

```bash
npm install postcss autoprefixer cssnano
```

### 3. Stylelint

```bash
npm install stylelint stylelint-config-standard
```

## 📝 命名規範

### BEM 命名法

```css
.block {
}
.block__element {
}
.block__element--modifier {
}
.block--modifier {
}
```

### 範例

```css
.user-info {
}
.user-info__logout-btn {
}
.user-info__logout-btn--hover {
}
.user-info__logout-btn--disabled {
}
```

## 🔧 立即行動項目

1. **建立 CSS 變數系統**
2. **為每個組件添加命名空間**
3. **建立組件樣式模板**
4. **修復當前衝突問題**
5. **建立樣式檢查清單**

## 📊 效果評估

### 實施前

- 20+ CSS 檔案
- 頻繁的樣式衝突
- 大量使用 `!important`
- 難以維護

### 實施後

- 模組化 CSS
- 無樣式衝突
- 可重用組件
- 易於維護

---

**下一步：你想要我立即開始實施哪個方案？**
