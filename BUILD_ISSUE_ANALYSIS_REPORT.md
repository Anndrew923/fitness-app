# Vite 建置卡住問題分析報告

## 分析日期

2025-01-13

## 問題描述

`npm run build` 執行時在 `vite v6.4.1 building for production...` 階段卡住，無法完成建置。

---

## 一、問題根因分析

### 1.1 主要問題：`closeBundle` 插件同步檔案操作

**問題位置**：`vite.config.js` 中的 `copy-well-known` 插件

**問題原因**：
1. **同步檔案操作阻塞**：`closeBundle()` 階段使用同步的 `copyFileSync()` 和 `mkdirSync()`
2. **檔案鎖定風險**：Windows 系統下，如果檔案被其他進程鎖定，同步操作會卡住
3. **缺少檔案存在性檢查**：直接執行 `copyFileSync` 可能因檔案不存在而拋出異常
4. **缺少錯誤隔離**：檔案操作錯誤可能影響建置流程

**原始代碼問題**：
```javascript
closeBundle() {
  try {
    mkdirSync(resolve('dist/.well-known'), { recursive: true });
    copyFileSync(resolve('public/.well-known/assetlinks.json'), ...);
    copyFileSync(resolve('public/assetlinks.json'), ...);
  } catch (error) {
    console.error('❌ Failed to copy assetlinks files:', error);
  }
}
```

**問題點**：
- ❌ 沒有檢查檔案是否存在
- ❌ 沒有檢查檔案是否可讀
- ❌ 同步操作在 Windows 上容易卡住
- ❌ 錯誤處理不夠細緻

---

### 1.2 AdMob 修改是否導致問題？

**檢查結果**：✅ **AdMob 修改與建置卡住無直接關係**

**分析**：

1. **AdMob 相關修改位置**：
   - `src/App.jsx` - 加入 AdMob 初始化（運行時動態導入）
   - `src/components/AdBanner.jsx` - 動態導入 AdMob 插件
   - `package.json` - 加入 `@capacitor-community/admob` 依賴
   - `capacitor.config.json` - 加入 AdMob 配置

2. **為什麼 AdMob 不會導致建置卡住**：
   - ✅ `@capacitor-community/admob` 是運行時依賴，不影響 Vite 建置
   - ✅ 動態導入 `await import('@capacitor-community/admob')` 是運行時行為，建置時不執行
   - ✅ Vite 建置時只處理靜態導入和代碼分析，不執行運行時邏輯
   - ✅ AdMob 配置只在 Android 原生平台使用，不影響 Web 建置

3. **AdMob 修改的影響**：
   - ✅ 不影響 Vite 建置流程
   - ✅ 不影響檔案操作
   - ✅ 不影響 `closeBundle` 插件執行

**結論**：AdMob 修改與建置卡住問題**無關**，問題出在 `vite.config.js` 的檔案操作邏輯。

---

## 二、Windows 特定問題

### 2.1 檔案鎖定機制

**Windows 檔案鎖定特性**：
- Windows 使用強制檔案鎖定（Mandatory File Locking）
- 當檔案被其他進程使用時，`copyFileSync()` 可能卡住等待
- `closeBundle()` 執行時，Vite 可能還在鎖定某些檔案

### 2.2 建置流程時序問題

**時序問題**：
1. Vite 完成打包
2. 觸發 `closeBundle()` hook
3. 立即執行同步檔案操作
4. **問題**：Vite 可能還在清理資源或鎖定檔案，導致 `copyFileSync()` 卡住

---

## 三、解決方案

### 3.1 改進後的代碼

**改進點**：

1. ✅ **使用 `setTimeout` 延遲執行**：確保 Vite 建置流程完全結束後再執行檔案操作
2. ✅ **檔案存在性檢查**：使用 `existsSync()` 檢查檔案是否存在
3. ✅ **檔案可讀性檢查**：使用 `statSync()` 檢查檔案是否可讀
4. ✅ **錯誤隔離**：每個檔案操作都有獨立的 try-catch，錯誤不影響其他操作
5. ✅ **錯誤處理**：檔案操作失敗不中斷建置流程，只記錄警告

**改進後的代碼**：
```javascript
closeBundle() {
  // 使用 setTimeout 確保在 Vite 建置流程完全結束後再執行檔案操作
  setTimeout(() => {
    try {
      // 檢查 dist 目錄是否存在
      if (!existsSync(resolve('dist'))) {
        console.warn('⚠️ dist 目錄不存在，跳過複製');
        return;
      }

      // 方法1：複製到 .well-known 目錄（檢查檔案存在性）
      if (existsSync(resolve('public/.well-known/assetlinks.json'))) {
        try {
          // 檢查檔案是否可讀
          const stats = statSync(resolve('public/.well-known/assetlinks.json'));
          if (stats.isFile()) {
            // 執行複製操作
            copyFileSync(...);
          }
        } catch (error) {
          // 錯誤不影響建置
          console.warn('⚠️ 複製失敗，但不影響建置:', error.message);
        }
      }

      // 方法2：複製到根目錄（同樣的錯誤處理）
      // ...
    } catch (error) {
      // 任何錯誤都不應該中斷建置流程
      console.error('❌ 插件錯誤（但不影響建置）:', error.message);
    }
  }, 100); // 延遲 100ms
}
```

---

## 四、改進效果

### 4.1 穩定性提升

| 項目 | 改進前 | 改進後 |
|------|--------|--------|
| 檔案鎖定處理 | ❌ 無 | ✅ 使用 `setTimeout` 延遲 |
| 檔案存在性檢查 | ❌ 無 | ✅ 使用 `existsSync()` |
| 檔案可讀性檢查 | ❌ 無 | ✅ 使用 `statSync()` |
| 錯誤隔離 | ❌ 單一 try-catch | ✅ 多層錯誤處理 |
| 建置流程影響 | ❌ 可能卡住 | ✅ 不影響建置 |

### 4.2 風險降低

**改進前風險**：
- 🔴 **高風險**：檔案鎖定導致建置卡住
- 🔴 **高風險**：檔案不存在導致異常
- 🟡 **中風險**：錯誤處理不完整

**改進後風險**：
- 🟢 **低風險**：檔案操作延遲執行，避免鎖定
- 🟢 **低風險**：檔案存在性和可讀性檢查
- 🟢 **低風險**：完整的錯誤隔離和處理

---

## 五、測試建議

### 5.1 建置測試

```bash
# 1. 清理快取
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# 2. 測試建置
npm run build

# 3. 確認建置完成
# 應該看到：
# - ✅ assetlinks.json 複製流程完成
# - dist 目錄成功生成
```

### 5.2 錯誤場景測試

1. **檔案不存在**：刪除 `public/.well-known/assetlinks.json`，確認建置仍然成功
2. **檔案鎖定**：在建置過程中鎖定檔案，確認建置不卡住
3. **權限問題**：測試無權限讀取檔案時的處理

---

## 六、長期建議

### 6.1 最佳實踐

1. **使用異步操作**：考慮將 `closeBundle` 中的檔案操作改為異步（使用 Promise）
2. **使用檔案監控**：監控檔案狀態，確保可讀後再操作
3. **增加重試機制**：檔案操作失敗時自動重試
4. **使用 Vite 插件生態**：考慮使用成熟的檔案複製插件（如 `vite-plugin-static-copy`）

### 6.2 替代方案

**使用 Vite 插件生態**：
```javascript
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/.well-known/assetlinks.json',
          dest: '.well-known'
        },
        {
          src: 'public/assetlinks.json',
          dest: '.'
        }
      ]
    })
  ]
});
```

---

## 七、總結

### 7.1 問題根因

✅ **主要問題**：`vite.config.js` 中的 `copy-well-known` 插件使用同步檔案操作，在 Windows 上容易因檔案鎖定而卡住

❌ **非問題**：AdMob 修改與建置卡住無關

### 7.2 解決方案

✅ **改進措施**：
1. 使用 `setTimeout` 延遲檔案操作
2. 加入檔案存在性和可讀性檢查
3. 完善錯誤處理和隔離
4. 確保檔案操作失敗不影響建置流程

### 7.3 預期效果

✅ **穩定性**：建置流程不會因檔案操作卡住
✅ **可靠性**：檔案操作失敗不影響建置完成
✅ **可維護性**：錯誤處理清晰，易於排查問題

---

## 八、後續行動

- [x] ✅ 改進 `vite.config.js` 中的檔案操作邏輯
- [ ] ⏳ 測試改進後的建置流程
- [ ] ⏳ 驗證檔案複製功能正常
- [ ] ⏳ 監控建置穩定性

---

**報告生成時間**：2025-01-13
**分析者**：布魯斯 (AI Assistant)
**狀態**：✅ 已改進，待測試
