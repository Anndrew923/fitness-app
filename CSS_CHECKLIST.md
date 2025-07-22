# CSS 樣式檢查清單

## 🔍 修改前檢查

### 1. 確認要修改的組件

- [ ] 確認組件名稱和對應的 CSS 檔案
- [ ] 檢查是否有其他組件使用相同的 class 名稱
- [ ] 確認修改範圍不會影響其他組件

### 2. 檢查全域樣式影響

- [ ] 檢查 `App.css` 是否有相關樣式
- [ ] 檢查 `styles.css` 是否有相關樣式
- [ ] 檢查 `index.css` 是否有相關樣式
- [ ] 確認全域樣式不會覆蓋組件樣式

### 3. 檢查選擇器特異性

- [ ] 確認選擇器足夠具體
- [ ] 避免使用過於寬泛的選擇器（如 `button`, `.btn`）
- [ ] 使用組件命名空間（如 `.user-info__logout-btn`）

## 🛠️ 修改時注意事項

### 1. 使用 CSS 變數

```css
/* ✅ 正確 - 使用變數 */
.logout-btn {
  background: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}

/* ❌ 錯誤 - 硬編碼值 */
.logout-btn {
  background: #ff6f61;
  padding: 16px;
  border-radius: 8px;
}
```

### 2. 使用命名空間

```css
/* ✅ 正確 - 使用命名空間 */
.user-info__logout-btn {
  background: var(--color-primary);
}

/* ❌ 錯誤 - 通用名稱 */
.logout-btn {
  background: var(--color-primary);
}
```

### 3. 避免使用 !important

```css
/* ✅ 正確 - 使用更具體的選擇器 */
.user-info .section-header .logout-btn {
  background: var(--color-primary);
}

/* ❌ 錯誤 - 使用 !important */
.logout-btn {
  background: var(--color-primary) !important;
}
```

## 📋 修改後檢查

### 1. 功能測試

- [ ] 確認修改的樣式正確顯示
- [ ] 確認 hover、active 等狀態正常
- [ ] 確認響應式設計正常
- [ ] 確認動畫效果正常

### 2. 相容性檢查

- [ ] 確認其他組件不受影響
- [ ] 確認全域樣式不受影響
- [ ] 確認不同瀏覽器相容性
- [ ] 確認手機版顯示正常

### 3. 性能檢查

- [ ] 確認沒有重複的 CSS 規則
- [ ] 確認選擇器效率
- [ ] 確認沒有未使用的 CSS

## 🚨 常見問題解決

### 問題 1：樣式不生效

**解決方案：**

1. 檢查選擇器特異性
2. 使用更具體的選擇器
3. 檢查 CSS 檔案載入順序
4. 使用瀏覽器開發者工具檢查

### 問題 2：樣式被覆蓋

**解決方案：**

1. 使用命名空間
2. 增加選擇器特異性
3. 檢查全域樣式
4. 使用 CSS 變數

### 問題 3：響應式問題

**解決方案：**

1. 使用 CSS 變數的響應式值
2. 檢查媒體查詢
3. 確認斷點設定正確

## 📝 最佳實踐

### 1. 命名規範

```css
/* 組件命名空間 */
.component-name {
}

/* 組件內元素 */
.component-name__element {
}

/* 修飾符 */
.component-name__element--modifier {
}

/* 狀態 */
.component-name__element--state {
}
```

### 2. 檔案組織

```
src/
├── styles.css          # 全域變數和基礎樣式
├── components/
│   ├── ComponentName.css
│   └── ComponentName.jsx
└── pages/
    ├── PageName.css
    └── PageName.jsx
```

### 3. 變數使用

```css
/* 在 :root 中定義 */
:root {
  --color-primary: #ff6f61;
  --spacing-md: 16px;
  --border-radius-md: 8px;
}

/* 在組件中使用 */
.component {
  color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```

## 🔧 工具建議

### 1. 瀏覽器開發者工具

- 使用 Elements 面板檢查樣式
- 使用 Computed 面板查看最終樣式
- 使用 Sources 面板調試 CSS

### 2. CSS 檢查工具

```bash
# 安裝 Stylelint
npm install -g stylelint

# 檢查CSS檔案
stylelint src/**/*.css
```

### 3. CSS 優化工具

```bash
# 安裝 PostCSS
npm install postcss autoprefixer cssnano

# 自動添加前綴和壓縮
npx postcss src/**/*.css --use autoprefixer cssnano
```

---

**使用這個清單可以大大減少 CSS 衝突問題！**
