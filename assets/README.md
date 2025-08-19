# Icon 資產說明

將你的高解析度主圖放在這裡，預設檔名為 `icon-master.png`。

要求：

- 正方形，至少 1024×1024（建議 2048×2048）
- 透明背景、不要自己加圓角
- 圖形四周保留約 12–16% 留白，避免被不同遮罩裁切

產生資產：

```bash
npm run icons
```

輸出目錄：`public/`

會生成：

- `logo192.png`, `logo256.png`, `logo384.png`, `logo512.png`
- `logo192-maskable.png`, `logo512-maskable.png`
- `apple-touch-icon.png`
- `favicon-16.png`, `favicon-32.png`, `favicon.ico`（若安裝 png-to-ico）
- Android：`android/ic_launcher_foreground.png`, `android/ic_launcher_background.png`, `android/ic_launcher_monochrome.png`
- Google Play：`android/play-store-icon-512.png`, `android/feature-graphic-1024x500.png`

若來源圖不在預設位置，可指定路徑：

```bash
node scripts/generate-icons.js path/to/your/source.png
```

Android 整合（擇一）：

- Android Studio → New → Image Asset → Icon Type 選 Adaptive and Legacy，分別選取 `android/ic_launcher_foreground.png` 與 `android/ic_launcher_background.png`。
- 若使用 Bubblewrap/TWA：把前景/背景放到 `app/src/main/res/mipmap-anydpi-v26/` 對應檔案位置或透過 `bubblewrap init` 後的資產替換。
