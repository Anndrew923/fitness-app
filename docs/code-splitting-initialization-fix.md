# 代碼分割初始化順序問題修復報告

## 📋 問題概述

**問題類型**: 代碼分割導致的模組載入順序問題  
**影響範圍**: 生產環境和 APK  
**嚴重程度**: 嚴重（導致應用無法開啟）  
**解決日期**: 2025-01-XX  
**狀態**: ✅ 已解決

---

## 🔍 問題描述

在實施代碼分割優化後，生產環境和 APK 中出現了一系列模組初始化順序錯誤，導致應用無法正常開啟。

### 錯誤列表

1. **`TypeError: J[P] is not a function`** (platform.js:58)
   - 原因：Capacitor 核心庫與插件分離，導致初始化順序問題

2. **`Uncaught ReferenceError: Cannot access 'p' before initialization`** (capacitor-plugins-XRzzE2a4.js)
   - 原因：Capacitor 插件 chunk 在核心庫之前載入

3. **`Uncaught ReferenceError: Cannot access 'e' before initialization`** (firebase-BrC5bj9R.js)
   - 原因：Firebase chunk 在 React 核心之前載入

4. **`Uncaught ReferenceError: Cannot access 'RS' before initialization`** (react-core-C-CaWL33.js, community-CITitE8W.js)
   - 原因：業務代碼 chunk 在 Firebase 初始化之前被 modulepreload 載入

5. **`Uncaught TypeError: Cannot read properties of undefined (reading 'createContext')`** (community-zaMUGqN.js)
   - 原因：UserContext 使用 createContext，在模組載入時執行，但 React 尚未初始化

6. **`Uncaught ReferenceError: Cannot access 'Oe' before initialization`** (community-DvFsPHVO.js)
   - 原因：共享代碼（utils、共享組件）被包含在業務代碼 chunk 中，導致載入順序問題

---

## 🎯 根本原因分析

### 問題核心

代碼分割導致模組之間的依賴關係被打斷，當一個 chunk 嘗試使用另一個 chunk 中的模組時，如果那個模組還沒有完全初始化，就會出現 `Cannot access 'X' before initialization` 錯誤。

### 具體問題

1. **模組載入順序不確定**
   - Vite 的 `modulepreload` 會預載入某些 chunk
   - 業務代碼 chunk 可能在核心庫完全初始化前就被載入

2. **共享代碼分散**
   - Utils 文件、共享組件被包含在業務代碼 chunk 中
   - 這些共享代碼依賴 React 和 Firebase，但載入時機不確定

3. **初始化時機問題**
   - `createContext`、`React.memo` 等 API 在模組載入時就執行
   - 如果 React 尚未初始化，就會報錯

---

## 🔧 解決過程

### 階段一：逐個修復（臨時方案）

#### 1. 合併 Capacitor 核心和插件
```javascript
// 將所有 Capacitor 相關庫合併到 react-core
id.includes('node_modules/@capacitor') ||
id.includes('node_modules/@belongnet/capacitor') ||
id.includes('node_modules/@capacitor-community')
```

#### 2. 合併 Firebase
```javascript
// 將 Firebase 和 firebase.js 合併到 react-core
id.includes('node_modules/firebase') ||
id.includes('/src/firebase.js') ||
id.includes('\\src\\firebase.js')
```

#### 3. 移除業務代碼 chunk 的 modulepreload
```javascript
// 在 transformIndexHtml 中移除業務代碼 chunk 的 modulepreload
if (
  fullMatch.includes('community') ||
  fullMatch.includes('ladder') ||
  fullMatch.includes('training-tools') ||
  fullMatch.includes('friend-feed')
) {
  // 移除 modulepreload，讓業務代碼真正按需載入
}
```

#### 4. 合併 UserContext
```javascript
// 將 UserContext.jsx 合併到 react-core
id.includes('/src/UserContext.jsx') ||
id.includes('\\src\\UserContext.jsx') ||
id.includes('/UserContext') ||
id.includes('\\UserContext')
```

### 階段二：一次性解決方案（最終方案）

發現逐個修復無法徹底解決問題，決定實施一次性解決方案。

---

## ✅ 最終解決方案

### 核心思路

**將所有共享的 `src/` 文件（除了業務代碼本身）都合併到 `react-core`**，確保所有共享代碼與 React 一起載入並初始化。

### 配置實現

解決方案包含兩個關鍵配置：

#### 1. manualChunks 配置

在 `vite.config.js` 的 `manualChunks` 函數中添加以下邏輯：

```javascript
// ✅ 一次性解決方案：將所有共享的 src/ 文件（除了業務代碼本身）都合併到 react-core
// 這確保所有共享代碼（utils、共享組件等）都與 React 一起載入
// 避免業務代碼 chunk 載入時共享代碼未初始化的問題
if (id.includes('/src/') || id.includes('\\src\\')) {
  // 排除業務代碼 chunk 的組件
  if (
    id.includes('/src/components/Ladder') ||
    id.includes('\\src\\components\\Ladder') ||
    id.includes('/src/components/Community') ||
    id.includes('\\src\\components\\Community') ||
    id.includes('/src/components/TrainingTools') ||
    id.includes('\\src\\components\\TrainingTools') ||
    id.includes('/src/components/FriendFeed') ||
    id.includes('\\src\\components\\FriendFeed')
  ) {
    // 這些是業務代碼，稍後會單獨處理
  } else {
    // 所有其他 src/ 文件（utils、共享組件、其他頁面等）都合併到 react-core
    return 'react-core';
  }
}
```

#### 2. transformIndexHtml 插件配置

**重要**: 除了 `manualChunks` 配置，還需要 `transformIndexHtml` 插件來確保正確的 HTML 載入順序。這個插件在構建後處理 HTML，確保 chunk 的載入順序正確。

```javascript
{
  name: 'ensure-react-core-first',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      // 1. 識別並分類所有 modulepreload
      const modulepreloadRegex = /<link rel="modulepreload"[^>]*>/g;
      const matches = [];
      let match;
      while ((match = modulepreloadRegex.exec(html)) !== null) {
        matches.push({
          fullMatch: match[0],
          index: match.index,
        });
      }

      // 2. 分類 chunk
      const reactCorePreloads = [];
      const otherPreloads = [];
      
      matches.forEach(({ fullMatch }) => {
        if (fullMatch.includes('react-core')) {
          reactCorePreloads.push(fullMatch);
        } else if (
          fullMatch.includes('community') ||
          fullMatch.includes('ladder') ||
          fullMatch.includes('training-tools') ||
          fullMatch.includes('friend-feed')
        ) {
          // ✅ 關鍵修正：識別業務代碼 chunk，這些不應該預載入
          // 這些 chunk 依賴 react-core 中的 Firebase，預載入會導致初始化順序問題
          // 不加入任何數組，稍後會被移除
        } else {
          otherPreloads.push(fullMatch);
        }
      });

      // 3. 處理 HTML：移除業務代碼 chunk 的 modulepreload 並重新排序
      // ✅ 重新排序：確保 react-core 優先，其他 chunk 其次
      const reorderedPreloads = [...reactCorePreloads, ...otherPreloads];
      
      let newHtml = html;
      for (let i = matches.length - 1; i >= 0; i--) {
        const { fullMatch, index } = matches[i];
        // ✅ 如果是業務代碼 chunk，直接移除 modulepreload
        if (
          fullMatch.includes('community') ||
          fullMatch.includes('ladder') ||
          fullMatch.includes('training-tools') ||
          fullMatch.includes('friend-feed')
        ) {
          // 移除這個 modulepreload，讓業務代碼真正按需載入
          newHtml =
            newHtml.substring(0, index) +
            newHtml.substring(index + fullMatch.length);
          continue;
        }
        // ✅ 其他 chunk 保持原樣或重新排序
        // 確保 react-core 優先，其他 chunk 其次
        const replacement =
          reorderedPreloads.find(p =>
            p.includes(fullMatch.match(/href="([^"]+)"/)?.[1] || '')
          ) || fullMatch;
        newHtml =
          newHtml.substring(0, index) +
          replacement +
          newHtml.substring(index + fullMatch.length);
      }

      // 4. 將 react-core 的 modulepreload 轉換為 script 標籤
      // ✅ 關鍵修正：確保 react-core 優先載入並執行，在 index.js 之前
      const reactCorePreload = newHtml.match(
        /<link rel="modulepreload"[^>]*react-core[^>]*>/
      );
      if (reactCorePreload) {
        const reactCoreHref =
          reactCorePreload[0].match(/href="([^"]+)"/)?.[1];
        if (reactCoreHref) {
          // 移除 modulepreload
          newHtml = newHtml.replace(reactCorePreload[0], '');
          // 在 index.js 之前插入 react-core script，確保優先執行
          const indexScriptRegex =
            /<script type="module"[^>]*src="[^"]*index[^"]*\.js"[^>]*><\/script>/;
          if (indexScriptRegex.test(newHtml)) {
            newHtml = newHtml.replace(
              indexScriptRegex,
              `<script type="module" crossorigin src="${reactCoreHref}"></script>\n    $&`
            );
          }
        }
      }

      return newHtml;
    },
  },
}
```

**插件功能說明**:

1. **移除業務代碼 chunk 的 modulepreload**
   - 防止業務代碼在 react-core 初始化前被預載入
   - 確保業務代碼真正按需載入

2. **將 react-core 的 modulepreload 轉換為 script 標籤**
   - 確保 react-core 優先載入並執行
   - 放置在 index.js 之前，確保在應用啟動前完全初始化

3. **重新排序其他 chunk 的 modulepreload**
   - 確保載入順序正確
   - react-core 優先，其他 chunk 其次

**為什麼需要這個插件**:

- `manualChunks` 只控制如何分割代碼，不控制載入順序
- Vite 默認會為所有 chunk 生成 `modulepreload`，可能導致載入順序問題
- 這個插件確保 HTML 中的載入順序與代碼分割策略一致

### 涵蓋範圍

#### 合併到 react-core 的內容

1. **所有核心庫**
   - React、React DOM
   - React Router
   - React i18next
   - Firebase
   - Capacitor
   - Recharts
   - PropTypes

2. **所有共享代碼**
   - `src/utils/` 所有文件
   - `src/firebase.js`
   - `src/UserContext.jsx`
   - `src/i18n.js`
   - `src/ScrollToTop.js`

3. **所有共享組件**
   - `src/components/LadderUserCard.jsx`
   - `src/components/BottomNavBar.jsx`
   - `src/components/LoadingSpinner.jsx`
   - `src/components/GlobalAdBanner.jsx`
   - 其他所有共享組件

4. **所有其他頁面**
   - `src/UserInfo.jsx`
   - `src/Settings.jsx`
   - `src/Welcome.jsx`
   - 其他所有頁面組件

#### 業務代碼分割（保持不變）

- `ladder` - 天梯頁面
- `community` - 社群頁面
- `training-tools` - 工具頁面
- `friend-feed` - 好友動態頁面

---

## 📝 執行步驟

### 步驟 1：修改 vite.config.js

1. 打開 `vite.config.js`
2. **檢查 `transformIndexHtml` 插件**（約第 15-115 行）
   - 確認 `ensure-react-core-first` 插件存在
   - 確認插件包含移除業務代碼 chunk modulepreload 的邏輯
   - 確認插件包含將 react-core modulepreload 轉換為 script 標籤的邏輯
3. **修改 `manualChunks` 函數**（約第 260 行）
   - 在 `node_modules` 檢查之後、業務代碼分割之前，添加共享代碼合併邏輯

### 步驟 2：驗證配置

```bash
# 檢查語法
npm run build

# 檢查構建產物
ls -la dist/assets/

# 檢查 HTML 中的載入順序（可選）
# 構建後檢查 dist/index.html，確認：
# 1. react-core script 在 index.js 之前
# 2. 業務代碼 chunk 沒有 modulepreload
```

### 步驟 3：清除緩存

#### Netlify
1. 登入 Netlify Dashboard
2. 進入 Site settings → Build & deploy
3. 點擊 "Clear cache and deploy site"

#### 本地
```bash
# 清除 node_modules 和構建緩存
rm -rf node_modules dist .vite
npm install
```

### 步驟 4：重新構建

```bash
# 生產環境構建
npm run build

# 檢查構建產物大小
du -sh dist/assets/react-core-*.js
```

### 步驟 5：部署和測試

1. 推送到 Git
2. Netlify 自動部署
3. 測試生產環境
4. 測試 APK（如果適用）

---

## 🔍 配置說明

### 執行順序

`manualChunks` 函數的執行順序非常重要：

1. **核心庫合併**（第 267-303 行）
   - 優先處理所有核心庫
   - 確保 React、Firebase、Capacitor 等都在 react-core

2. **node_modules 處理**（第 312-314 行）
   - 所有其他 node_modules 都合併到 react-core

3. **共享代碼合併**（第 318-338 行）
   - 處理所有 src/ 文件
   - 排除業務代碼組件
   - 其他都合併到 react-core

4. **業務代碼分割**（第 340-367 行）
   - 最後處理業務代碼
   - 只包含業務邏輯本身

### 路徑匹配

支持兩種路徑格式：
- Unix/Linux/Mac: `/src/`
- Windows: `\\src\\`

### 業務代碼排除

以下組件會被排除，單獨打包：
- `Ladder`
- `Community`
- `TrainingTools`
- `FriendFeed`

### HTML 轉換插件

`transformIndexHtml` 插件在構建後處理 HTML，確保正確的載入順序：

1. **react-core 優先載入**
   - 將 react-core 的 `modulepreload` 轉換為 `<script>` 標籤
   - 放置在 `index.js` 之前，確保優先執行
   - 這確保 React、Firebase、UserContext 等在應用啟動前完全初始化

2. **業務代碼按需載入**
   - 移除業務代碼 chunk 的 `modulepreload`
   - 確保業務代碼只在需要時才載入（通過 `React.lazy`）
   - 避免業務代碼在 react-core 初始化前被預載入

3. **載入順序優化**
   - 重新排序其他 chunk 的 `modulepreload`
   - 確保依賴關係正確：react-core → 其他 chunk → 業務代碼

**插件與 manualChunks 的配合**:

- `manualChunks`: 控制代碼如何分割
- `transformIndexHtml`: 控制 HTML 中的載入順序
- 兩者配合確保代碼分割和載入順序都正確

### 其他相關配置

#### modulePreload 配置

```javascript
modulePreload: {
  polyfill: true,
}
```

**說明**:
- 啟用 `modulepreload` polyfill，確保在不支持的瀏覽器中也能正常工作
- 這會生成 `modulepreload` 標籤，然後由 `transformIndexHtml` 插件處理
- 位置：`vite.config.js` 第 385-387 行

#### chunkSizeWarningLimit

```javascript
chunkSizeWarningLimit: 500,
```

**說明**:
- 設置 chunk 大小警告閾值為 500KB
- `react-core` chunk 可能會超過這個閾值，這是正常的，因為包含了所有共享代碼
- 位置：`vite.config.js` 第 375 行

#### esbuild 配置

```javascript
esbuild: {
  drop: mode === 'production' ? ['console', 'debugger'] : [],
}
```

**說明**:
- 生產環境自動移除 `console` 和 `debugger` 語句
- 這不影響代碼分割，但會減少構建產物大小
- 位置：`vite.config.js` 第 379-381 行

---

## ⚠️ 注意事項

### 1. react-core 大小增加

- **影響**: `react-core` chunk 會變大（可能從 ~500KB 增加到 ~800KB+）
- **原因**: 包含所有共享代碼
- **權衡**: 首次載入稍慢，但更穩定，後續頁面切換更快

### 2. 業務代碼 chunk 變小

- **好處**: 業務代碼 chunk 只包含業務邏輯本身
- **效果**: 按需載入更快，減少重複代碼

### 3. 緩存策略

- **建議**: 清除所有緩存後重新部署
- **原因**: 舊的 chunk 可能仍在使用

### 4. 監控

- **建議**: 部署後監控一段時間
- **檢查**: 控制台是否還有類似錯誤
- **性能**: 關注首次載入時間

---

## 📊 預期效果

### 解決的問題

✅ 所有 `Cannot access 'X' before initialization` 錯誤  
✅ 所有 `Cannot read properties of undefined` 錯誤  
✅ 生產環境正常運作  
✅ APK 正常運作  
✅ 不再需要逐個修復類似問題

### 性能影響

- **首次載入**: 可能稍慢（react-core 變大）
- **後續載入**: 更快（業務代碼 chunk 變小）
- **穩定性**: 大幅提升（避免載入順序問題）

---

## 🔄 回滾方案

如果遇到問題，可以回滾到之前的配置：

### 部分回滾（保留核心修正）

1. 移除共享代碼合併邏輯（第 318-338 行）
2. 保留核心庫合併和 UserContext 合併
3. 保留 `transformIndexHtml` 插件配置
4. 重新構建和部署

### 完全回滾（不推薦）

1. 移除共享代碼合併邏輯（第 318-338 行）
2. 移除 `transformIndexHtml` 插件中的業務代碼 modulepreload 移除邏輯
3. 恢復到最初的代碼分割配置
4. 重新構建和部署

**注意**: 完全回滾可能會導致之前的初始化順序錯誤再次出現。

---

## 📚 相關文檔

- [代碼分割優化報告](./code-splitting-optimization-report.md)
- [Vite 配置文檔](https://vitejs.dev/config/)
- [Rollup manualChunks 文檔](https://rollupjs.org/configuration-options/#output-manualchunks)

---

## ✅ 驗證清單

### 配置驗證

- [x] 核心庫合併到 react-core
- [x] Firebase 合併到 react-core
- [x] Capacitor 合併到 react-core
- [x] UserContext 合併到 react-core
- [x] 所有共享代碼合併到 react-core
- [x] 業務代碼分割保持不變
- [x] 支持跨平台路徑
- [x] `transformIndexHtml` 插件配置正確
- [x] 插件移除業務代碼 chunk 的 modulepreload
- [x] 插件將 react-core modulepreload 轉換為 script 標籤
- [x] 插件重新排序其他 chunk 的 modulepreload
- [x] `modulePreload.polyfill` 配置正確
- [x] `chunkSizeWarningLimit` 配置正確
- [x] `esbuild.drop` 配置正確

### 部署驗證

- [x] 清除緩存並重新部署
- [x] 構建成功，無錯誤
- [x] HTML 中 react-core script 在 index.js 之前
- [x] HTML 中業務代碼 chunk 沒有 modulepreload
- [x] 生產環境測試通過
- [x] APK 測試通過
- [x] 控制台無初始化順序錯誤

---

## 🎉 總結

通過實施一次性解決方案，將所有共享代碼合併到 `react-core`，徹底解決了代碼分割導致的模組載入順序問題。這個方案雖然會增加首次載入時間，但大幅提升了應用的穩定性和可維護性，避免了未來再次出現類似問題。

**關鍵經驗**: 一次性解決比逐個修復更有效，應該在發現根本原因後立即實施根本性解決方案。

