import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    server: {
      port: 5173,
      open: true,
      // 防止 Windows 檔案鎖定問題
      fs: {
        strict: false
      },
      // 優化 HMR 配置，防止檔案鎖定
      hmr: {
        overlay: false
      },
      // 防止 Windows 檔案鎖定
      watch: {
        usePolling: false,
        interval: 1000
      },
      // 開發環境：只在需要時允許 eval
      headers:
        mode === 'development'
          ? {
              'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://connect.facebook.net",
                "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.facebook.com",
                "connect-src 'self' ws://localhost:* https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.googleusercontent.com",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
              ].join('; '),
            }
          : {},
    },

    build: {
      // 優化生產環境建置
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            charts: ['recharts'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
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
