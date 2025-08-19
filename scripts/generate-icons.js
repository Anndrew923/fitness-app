/*
  自動產生 PWA / 網站圖標腳本
  使用方式：
    1) 將高解析度主圖放到 assets/icon-master.png（或指定其他路徑）
    2) 執行：node scripts/generate-icons.js [來源檔路徑]
    3) 產物會輸出到 public/ 目錄

  注意：
  - 建議來源圖為正方形、無圓角、背景透明，尺寸 >= 1024x1024
  - 產出含 maskable 版本（居中 + 20% 留白）
  - 若已安裝 png-to-ico，會額外輸出 favicon.ico
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE = process.argv[2] || path.join('assets', 'icon-master.png');
const OUT_DIR = path.join('public');
const ANDROID_DIR = path.join(OUT_DIR, 'android');

const BACKGROUND_COLOR = '#0b0f1a';

async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function generateStandardPng(size, outPath) {
  // 為一般圖標：使用 contain 並填入深色背景以避免鋸齒
  await sharp(SOURCE)
    .resize({
      width: size,
      height: size,
      fit: 'contain',
      background: BACKGROUND_COLOR,
    })
    .png()
    .toFile(outPath);
}

async function generateMaskablePng(size, outPath) {
  // 為 maskable 圖標：留 20% 邊距，背景透明
  const inner = Math.round(size * 0.8);
  const resized = await sharp(SOURCE)
    .resize({
      width: inner,
      height: inner,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toFile(outPath);
}

async function generateFavicons(basePng32, basePng16) {
  // 產出 png favicons
  await Promise.all([
    sharp(SOURCE)
      .resize({
        width: 32,
        height: 32,
        fit: 'contain',
        background: BACKGROUND_COLOR,
      })
      .png()
      .toFile(basePng32),
    sharp(SOURCE)
      .resize({
        width: 16,
        height: 16,
        fit: 'contain',
        background: BACKGROUND_COLOR,
      })
      .png()
      .toFile(basePng16),
  ]);

  // 嘗試產生 favicon.ico（若有安裝 png-to-ico）
  let PngToIco;
  try {
    PngToIco = require('png-to-ico');
  } catch (e) {
    console.log(
      '[icons] 未安裝 png-to-ico，略過 favicon.ico 產生。可執行：npm i -D png-to-ico'
    );
    return;
  }
  const icoBuffer = await PngToIco([basePng16, basePng32]);
  await fs.promises.writeFile(path.join(OUT_DIR, 'favicon.ico'), icoBuffer);
}

async function generateAndroidAssets() {
  await ensureDir(ANDROID_DIR);

  const anydpiSize = 432; // Android Adaptive Icon 推薦尺寸
  const safeInner = Math.round(anydpiSize * 0.6667); // 66% 安全區

  // 背景層：實色，避免壓縮失真
  await sharp({
    create: {
      width: anydpiSize,
      height: anydpiSize,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .png()
    .toFile(path.join(ANDROID_DIR, 'ic_launcher_background.png'));

  // 前景層：透明底 + 安全區置中
  const fgInner = await sharp(SOURCE)
    .resize({
      width: safeInner,
      height: safeInner,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: anydpiSize,
      height: anydpiSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: fgInner, gravity: 'centre' }])
    .png()
    .toFile(path.join(ANDROID_DIR, 'ic_launcher_foreground.png'));

  // 單色層（Android 13）
  const monoInner = await sharp(SOURCE)
    .resize({
      width: safeInner,
      height: safeInner,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .greyscale()
    .tint({ r: 255, g: 255, b: 255 })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: anydpiSize,
      height: anydpiSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: monoInner, gravity: 'centre' }])
    .png()
    .toFile(path.join(ANDROID_DIR, 'ic_launcher_monochrome.png'));

  // Google Play 商店 512×512 圖標
  await sharp(SOURCE)
    .resize({
      width: 512,
      height: 512,
      fit: 'contain',
      background: BACKGROUND_COLOR,
    })
    .png()
    .toFile(path.join(ANDROID_DIR, 'play-store-icon-512.png'));

  // Feature Graphic 1024×500（置中，保留留白）
  const featureInner = await sharp(SOURCE)
    .resize({
      width: 720,
      height: 420,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: 1024,
      height: 500,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([{ input: featureInner, gravity: 'centre' }])
    .png()
    .toFile(path.join(ANDROID_DIR, 'feature-graphic-1024x500.png'));
}

async function main() {
  if (!(await fileExists(SOURCE))) {
    console.error(
      `找不到來源檔：${SOURCE}\n請將高解析度主圖放在 assets/icon-master.png 或指定路徑後重試。`
    );
    process.exit(1);
  }

  await ensureDir(OUT_DIR);

  // 主要 PWA 尺寸
  const tasks = [];
  tasks.push(generateStandardPng(512, path.join(OUT_DIR, 'logo512.png')));
  tasks.push(generateStandardPng(192, path.join(OUT_DIR, 'logo192.png')));
  tasks.push(
    generateMaskablePng(512, path.join(OUT_DIR, 'logo512-maskable.png'))
  );
  tasks.push(
    generateMaskablePng(192, path.join(OUT_DIR, 'logo192-maskable.png'))
  );

  // 額外中間尺寸（可選，部分裝置會用到）
  tasks.push(generateStandardPng(384, path.join(OUT_DIR, 'logo384.png')));
  tasks.push(generateStandardPng(256, path.join(OUT_DIR, 'logo256.png')));

  // Apple Touch Icon 建議 180x180（實色背景更穩定）
  tasks.push(
    sharp(SOURCE)
      .resize({
        width: 180,
        height: 180,
        fit: 'contain',
        background: BACKGROUND_COLOR,
      })
      .png()
      .toFile(path.join(OUT_DIR, 'apple-touch-icon.png'))
  );

  // Favicons
  const fav32 = path.join(OUT_DIR, 'favicon-32.png');
  const fav16 = path.join(OUT_DIR, 'favicon-16.png');
  await Promise.all(tasks);
  await generateFavicons(fav32, fav16);
  await generateAndroidAssets();

  console.log('[icons] 產生完成：public/ 內的圖標已更新');
}

main().catch(err => {
  console.error('[icons] 產生失敗：', err);
  process.exit(1);
});
