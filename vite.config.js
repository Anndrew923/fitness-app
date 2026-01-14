import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, copyFileSync, mkdirSync, statSync } from 'fs';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // 頛?啣?霈嚗??嗥??湔雿輻嚗?靽?隞亙?撠??閬?
  loadEnv(mode, process.cwd(), '');

  return {
    // ??靽桀儔嚗Ⅱ靽??Ｙ憓楝敺迤蝣?    base: '/',

    plugins: [
      react(),
      {
        name: 'ensure-react-core-first',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            // ??靽桀儔嚗Ⅱ靽?react-core ??vendor 銋?頛
            // ?????modulepreload 璅惜?雿蔭
            const modulepreloadRegex = /<link rel="modulepreload"[^>]*>/g;
            const matches = [];
            let match;

            // 雿輻 exec 靘????????蝵桐縑??
            while ((match = modulepreloadRegex.exec(html)) !== null) {
              matches.push({
                fullMatch: match[0],
                index: match.index,
              });
            }

            if (matches.length === 0) return html;

            // ? react-core ?隞?chunk
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

            // ???嚗eact-core ?冽??嚗敺?嗡? chunk
            const reorderedPreloads = [...reactCorePreloads, ...otherPreloads];

            // ??靽桀儔嚗?敺?????踹?蝝Ｗ??宏??
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
              // 其他 chunk 保持原樣或重新排序
              const replacement =
                reorderedPreloads.find(p =>
                  p.includes(fullMatch.match(/href="([^"]+)"/)?.[1] || '')
                ) || fullMatch;
              // 雿輻 substring ?脰?蝎曄Ⅱ?踵?
              newHtml =
                newHtml.substring(0, index) +
                replacement +
                newHtml.substring(index + fullMatch.length);
            }

            // ???啣?嚗? react-core 敺?modulepreload ?寧 script 璅惜
            // 蝣箔?摰 index.js 銋??瑁?嚗??PureComponent ?航炊
            const reactCorePreload = newHtml.match(
              /<link rel="modulepreload"[^>]*react-core[^>]*>/
            );
            if (reactCorePreload) {
              const reactCoreHref =
                reactCorePreload[0].match(/href="([^"]+)"/)?.[1];
              if (reactCoreHref) {
                // 蝘駁 modulepreload
                newHtml = newHtml.replace(reactCorePreload[0], '');
                // ??index.js 銋?? script 璅惜
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
      },
      {
        name: 'copy-well-known',
        closeBundle() {
          // 雿輻 setTimeout 蝣箔???Vite 撱箇蔭瘚?摰蝯?敺??瑁?瑼???
          // ?見?臭誑?踹?瑼????遣蝵格?蝔雿???
          setTimeout(() => {
            try {
              const distPath = resolve('dist');

              if (!existsSync(distPath)) {
                console.warn('?? dist ?桅?銝??剁?頝喲?銴ˊ');
                return;
              }

              // ?寞?1嚗?鋆賢 .well-known ?桅?
              const wellKnownSrc = resolve(
                'public/.well-known/assetlinks.json'
              );
              const wellKnownDest = resolve('dist/.well-known/assetlinks.json');

              if (existsSync(wellKnownSrc)) {
                try {
                  // 蝣箔??格??桅?摮
                  const wellKnownDir = resolve('dist/.well-known');
                  if (!existsSync(wellKnownDir)) {
                    mkdirSync(wellKnownDir, { recursive: true });
                  }

                  // 瑼Ｘ瑼??臬?航?嚗??獢?摰?憿?
                  try {
                    const stats = statSync(wellKnownSrc);
                    if (stats.isFile()) {
                      copyFileSync(wellKnownSrc, wellKnownDest);
                      console.log('??撌脰?鋆?.well-known/assetlinks.json');
                    }
                  } catch (statError) {
                    console.warn(
                      '?? ?⊥?霈??瑼?嚗歲??.well-known 銴ˊ:',
                      statError.message
                    );
                  }
                } catch (copyError) {
                  console.warn(
                    '?? 銴ˊ .well-known 瑼?憭望?嚗?銝蔣?踹遣蝵?',
                    copyError.message
                  );
                }
              } else {
                console.warn(
                  '?? public/.well-known/assetlinks.json 銝??剁?頝喲?'
                );
              }

              // ?寞?2嚗?鋆賢?寧????寞?嚗?
              const rootSrc = resolve('public/assetlinks.json');
              const rootDest = resolve('dist/assetlinks.json');

              if (existsSync(rootSrc)) {
                try {
                  // 瑼Ｘ瑼??臬?航?
                  try {
                    const stats = statSync(rootSrc);
                    if (stats.isFile()) {
                      copyFileSync(rootSrc, rootDest);
                      console.log('??撌脰?鋆?assetlinks.json ?唳?桅?');
                    }
                  } catch (statError) {
                    console.warn(
                      '?? ?⊥?霈??瑼?嚗歲??桅?銴ˊ:',
                      statError.message
                    );
                  }
                } catch (copyError) {
                  console.warn(
                    '?? 銴ˊ?寧??獢仃??雿?敶梢撱箇蔭:',
                    copyError.message
                  );
                }
              } else {
                console.warn('?? public/assetlinks.json 銝??剁?頝喲?');
              }

              console.log('??assetlinks.json 銴ˊ瘚?摰?');
            } catch (error) {
              // 隞颱??航炊?賭??府銝剜撱箇蔭瘚?
              console.error(
                '??copy-well-known ?辣?潛??航炊嚗?銝蔣?踹遣蝵殷?:',
                error.message
              );
            }
          }, 100); // 撱園 100ms 蝣箔?撱箇蔭瘚?摰蝯?
        },
      },
    ],

    server: {
      port: 5173,
      open: true,
      // ?脫迫 Windows 瑼?????
      fs: {
        strict: false,
      },

      hmr: {
        overlay: false,
      },
      // ?脫迫 Windows 瑼???
      watch: {
        usePolling: false,
        interval: 1000,
      },
      // ??啣?嚗?券?閬??迂 eval
      headers:
        mode === 'development'
          ? {
              'Content-Security-Policy': [
                // ✅ 修正：與 index.html 保持一致，確保開發環境和生產環境行為一致
                "default-src 'self' data: blob:",
                // ✅ 修正：添加完整的 Google 域名支持，包括 gstatic.com
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.googleapis.com https://*.googleusercontent.com https://*.gstatic.com",
                // ✅ 新增：script-src-elem 用於 <script> 標籤（與 index.html 一致）
                "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.googleapis.com https://*.googleusercontent.com https://*.gstatic.com",
                // ✅ 修正：添加 *.google.com 到 frame-src（支持 Google OAuth iframe）
                "frame-src 'self' https://*.firebaseapp.com https://*.google.com https://accounts.google.com",
                // ✅ 修正：添加完整的 Google 域名到 connect-src（支持所有 Google API）
                "connect-src 'self' ws://localhost:* wss://localhost:* https://*.google.com https://*.googleapis.com https://*.googleusercontent.com https://*.firebaseio.com wss://*.firebaseio.com",
                "style-src 'self' 'unsafe-inline' https://*.googleapis.com",
                "img-src 'self' data: blob: https:",
                // ✅ 修正：添加 gstatic.com 到 font-src（支持 Google 字體）
                "font-src 'self' data: https://*.gstatic.com",
                // ✅ 新增：worker-src 和 child-src（與 index.html 一致）
                "worker-src 'self' blob:",
                "child-src 'self' blob:",
              ].join('; '),
            }
          : {}, // ✅ 重要：生產環境保持為空，使用 index.html 的 CSP（APK 使用此配置）
    },

    build: {
      // ???芸?嚗蝝啁?摨衣?隞?Ⅳ?
      rollupOptions: {
        output: {
          // ???箄 chunk ??賣
          // ??靽桀儔嚗Ⅱ靽?React ?詨??芸?頛嚗??PureComponent ?航炊
          manualChunks: id => {
            // ??靽桀儔嚗eact ?詨? + ??郊靘陷嚗???韏瑁??伐?
            // 蝣箔????冽??典?憪??停?舐嚗??vendor 銝剔?摨急銝 React

            // ✅ 關鍵修正：將所有核心庫（包括 Firebase 和 Capacitor）合併到 react-core
            // 確保這些庫與 React 一起載入，避免載入順序和初始化錯誤
            // 注意：Capacitor 插件是動態導入的，不會影響初始載入大小
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router') || // ✅ 合併：路由依賴，必須與 React 一起載入
              id.includes('node_modules/react-i18next') || // ✅ 合併：i18n 依賴，必須與 React 一起載入
              id.includes('node_modules/i18next') || // ✅ 合併：i18next 核心庫
              id.includes('node_modules/prop-types') || // ✅ 合併：prop-types 被大量組件使用
              id.includes('node_modules/recharts') || // ✅ 關鍵修復：recharts 合併到 react-core，避免 APK 載入順序問題
              id.includes('/recharts/') || // ✅ 額外匹配：確保所有 recharts 路徑都被匹配
              id.includes('node_modules/@capacitor/core') || // ✅ 新增：Capacitor 核心必須與 React 一起載入
              id.includes('node_modules/@capacitor/app') || // ✅ 新增：App 生命週期管理也需要早期載入
              // ✅ 關鍵修正：將所有 Capacitor 插件也合併到 react-core
              // 避免 capacitor-plugins chunk 的載入順序問題
              id.includes('node_modules/@capacitor') || // 所有 @capacitor/* 插件
              id.includes('node_modules/@daniele-rolli/capacitor') || // Google Auth 插件
              id.includes('node_modules/@capacitor-community') || // AdMob 等社群插件
              // ✅ 關鍵修正：將 Firebase 也合併到 react-core
              // Firebase 在應用啟動時就被導入（App.jsx），必須與 React 一起載入
              // 避免 firebase chunk 的初始化順序問題
              id.includes('node_modules/firebase') ||
              // ✅ 關鍵修正：將 firebase.js 也合併到 react-core
              // firebase.js 包含 Firebase 初始化代碼，必須與 Firebase 庫一起載入
              // 避免 firebase.js 被包含在業務代碼 chunk 中，導致初始化順序問題
              id.includes('/src/firebase.js') ||
              id.includes('\\src\\firebase.js') || // Windows 路徑支持
              // ✅ 關鍵修正：將 UserContext.jsx 也合併到 react-core
              // UserContext 使用 createContext，在模組載入時就執行
              // 被所有動態導入的組件使用（Community, Ladder, FriendFeed, Settings 等）
              // 必須與 React 一起載入，避免業務代碼 chunk 載入時 React 未初始化的問題
              id.includes('/src/UserContext.jsx') ||
              id.includes('\\src\\UserContext.jsx') || // Windows 路徑支持
              // ✅ 額外修正：確保所有 UserContext 相關路徑都被匹配
              id.includes('/UserContext') ||
              id.includes('\\UserContext')
            ) {
              return 'react-core';
            }

            // ✅ 移除：不再單獨打包 Firebase 和 Capacitor 插件（已合併到 react-core）
            // 這避免了載入順序和初始化問題

            // ???寞?鈭?撠??隞?node_modules 靘陷銋?雿萄 react-core
            // ?見?臭誑蝣箔????鞈湧??React 銋?頛
            // ?????react-core ?之撠?雿隞亥圾瘙?PureComponent ?航炊

            if (id.includes('node_modules')) {
              return 'react-core'; // ???寧 react-core嚗???vendor
            }

            // ??璆剖?隞?Ⅳ???Ｗ??莎??脖?甇亙??

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

            // 業務代碼分割（只包含業務邏輯本身，不包含共享代碼）
            if (
              id.includes('/src/components/Ladder') ||
              id.includes('\\src\\components\\Ladder')
            ) {
              return 'ladder';
            }

            if (
              id.includes('/src/components/Community') ||
              id.includes('\\src\\components\\Community')
            ) {
              return 'community';
            }

            if (
              id.includes('/src/components/TrainingTools') ||
              id.includes('\\src\\components\\TrainingTools')
            ) {
              return 'training-tools';
            }

            if (
              id.includes('/src/components/FriendFeed') ||
              id.includes('\\src\\components\\FriendFeed')
            ) {
              return 'friend-feed';
            }
          },
          // ???芸? chunk ?賢?
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // ????霅血??曉潘??渡?璆萄??      chunkSizeWarningLimit: 500,
      // ??雿輻 esbuild 憯葬嚗ite 暺?嚗敹恬?
      minify: 'esbuild',
      // ????啣?蝘駁 console
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
      // ??? source map嚗??Ｙ憓?賂?
      sourcemap: mode === 'development',
      // ??靽桀儔嚗Ⅱ靽迤蝣箇?瑽遣?格??芋蝯撘?      target: 'esnext',
      modulePreload: {
        polyfill: true,
      },
      // ??靽桀儔嚗Ⅱ靽?皞迤蝣箄???      assetsInlineLimit: 4096,
    },

    // ?芸?靘陷?遣蝵殷??脫迫瑼???
    optimizeDeps: {
      force: false,
      entries: [],
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'recharts',
      ],
    },

    // 閫?捱頝臬???
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});
