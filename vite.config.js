import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, copyFileSync, mkdirSync, statSync } from 'fs';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // ✅ 修復：確保生產環境路徑正確
    base: '/',
    
    plugins: [
      react(),
      {
        name: 'copy-well-known',
        closeBundle() {
          // 使用 setTimeout 確保在 Vite 建置流程完全結束後再執行檔案操作
          // 這樣可以避免檔案鎖定或建置流程卡住的問題
          setTimeout(() => {
            try {
              const distPath = resolve('dist');

              // 確保 dist 目錄存在
              if (!existsSync(distPath)) {
                console.warn('⚠️ dist 目錄不存在，跳過複製');
                return;
              }

              // 方法1：複製到 .well-known 目錄
              const wellKnownSrc = resolve(
                'public/.well-known/assetlinks.json'
              );
              const wellKnownDest = resolve('dist/.well-known/assetlinks.json');

              if (existsSync(wellKnownSrc)) {
                try {
                  // 確保目標目錄存在
                  const wellKnownDir = resolve('dist/.well-known');
                  if (!existsSync(wellKnownDir)) {
                    mkdirSync(wellKnownDir, { recursive: true });
                  }

                  // 檢查檔案是否可讀（避免檔案鎖定問題）
                  try {
                    const stats = statSync(wellKnownSrc);
                    if (stats.isFile()) {
                      copyFileSync(wellKnownSrc, wellKnownDest);
                      console.log('✅ 已複製 .well-known/assetlinks.json');
                    }
                  } catch (statError) {
                    console.warn(
                      '⚠️ 無法讀取源檔案，跳過 .well-known 複製:',
                      statError.message
                    );
                  }
                } catch (copyError) {
                  // 檔案操作失敗不影響建置流程
                  console.warn(
                    '⚠️ 複製 .well-known 檔案失敗，但不影響建置:',
                    copyError.message
                  );
                }
              } else {
                console.warn(
                  '⚠️ public/.well-known/assetlinks.json 不存在，跳過'
                );
              }

              // 方法2：複製到根目錄（備用方案）
              const rootSrc = resolve('public/assetlinks.json');
              const rootDest = resolve('dist/assetlinks.json');

              if (existsSync(rootSrc)) {
                try {
                  // 檢查檔案是否可讀
                  try {
                    const stats = statSync(rootSrc);
                    if (stats.isFile()) {
                      copyFileSync(rootSrc, rootDest);
                      console.log('✅ 已複製 assetlinks.json 到根目錄');
                    }
                  } catch (statError) {
                    console.warn(
                      '⚠️ 無法讀取源檔案，跳過根目錄複製:',
                      statError.message
                    );
                  }
                } catch (copyError) {
                  // 檔案操作失敗不影響建置流程
                  console.warn(
                    '⚠️ 複製根目錄檔案失敗，但不影響建置:',
                    copyError.message
                  );
                }
              } else {
                console.warn('⚠️ public/assetlinks.json 不存在，跳過');
              }

              console.log('✅ assetlinks.json 複製流程完成');
            } catch (error) {
              // 任何錯誤都不應該中斷建置流程
              console.error(
                '❌ copy-well-known 插件發生錯誤（但不影響建置）:',
                error.message
              );
            }
          }, 100); // 延遲 100ms 確保建置流程完全結束
        },
      },
    ],

    server: {
      port: 5173,
      open: true,
      // 防止 Windows 檔案鎖定問題
      fs: {
        strict: false,
      },
      // 優化 HMR 配置，防止檔案鎖定
      hmr: {
        overlay: false,
      },
      // 防止 Windows 檔案鎖定
      watch: {
        usePolling: false,
        interval: 1000,
      },
      // 開發環境：只在需要時允許 eval
      headers:
        mode === 'development'
          ? {
              'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com",
                "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
                "connect-src 'self' ws://localhost:* https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.googleusercontent.com",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
              ].join('; '),
            }
          : {},
    },

    build: {
      // ✅ 優化：更細粒度的代碼分割
      rollupOptions: {
        output: {
          // ✅ 智能 chunk 分割函數
          manualChunks: (id) => {
            // ✅ 修復：React 核心必須優先載入，確保不會被分割到其他 chunk
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/')
            ) {
              return 'react-core';
            }

            // React Router（路由相關，初始載入）
            if (id.includes('node_modules/react-router')) {
              return 'react-router';
            }

            // Firebase（按需載入，只有需要認證的頁面才載入）
            if (id.includes('node_modules/firebase')) {
              return 'firebase';
            }

            // Charts（只有特定頁面需要）
            if (id.includes('node_modules/recharts')) {
              return 'charts';
            }

            // i18n（國際化，可以延遲載入）
            if (
              id.includes('node_modules/i18next') ||
              id.includes('node_modules/react-i18next')
            ) {
              return 'i18n';
            }

            // Capacitor（原生功能，按需載入）
            if (id.includes('node_modules/@capacitor')) {
              return 'capacitor';
            }

            // PropTypes（開發工具，可以單獨打包）
            if (id.includes('node_modules/prop-types')) {
              return 'prop-types';
            }

            // 其他 node_modules 依賴
            if (id.includes('node_modules')) {
              return 'vendor';
            }

            // ✅ 業務代碼按頁面分割（進一步優化）
            // 天梯頁面（可能較大）
            if (id.includes('/src/components/Ladder')) {
              return 'ladder';
            }

            // 社群頁面（可能較大）
            if (id.includes('/src/components/Community')) {
              return 'community';
            }

            // 工具頁面
            if (id.includes('/src/components/TrainingTools')) {
              return 'training-tools';
            }

            // 好友動態頁面
            if (id.includes('/src/components/FriendFeed')) {
              return 'friend-feed';
            }
          },
          // ✅ 優化 chunk 命名
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // ✅ 降低警告閾值，更積極優化
      chunkSizeWarningLimit: 500,
      // ✅ 使用 esbuild 壓縮（Vite 默認，更快）
      minify: 'esbuild',
      // ✅ 生產環境移除 console
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
      // ✅ 啟用 source map（生產環境可選）
      sourcemap: mode === 'development',
      // ✅ 修復：確保正確的構建目標和模組格式
      target: 'esnext',
      modulePreload: {
        polyfill: true,
      },
      // ✅ 修復：確保資源正確處理
      assetsInlineLimit: 4096,
    },

    // 優化依賴預建置，防止檔案鎖定
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

    // 解決路徑問題
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});
