import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    server: {
      port: 3000,
      open: true,
      // 開發環境：只在需要時允許 eval
      headers: mode === 'development' ? {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "connect-src 'self' ws://localhost:* https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:"
        ].join('; ')
      } : {}
    },
    
    build: {
      // 優化生產環境建置
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'charts': ['recharts']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    
    // 優化依賴預建置
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'recharts'
      ]
    },
    
    // 解決路徑問題
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  };
});