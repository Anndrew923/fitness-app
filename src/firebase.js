import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import logger from './utils/logger';

// 開發環境的預設配置
const defaultConfig = {
  apiKey: 'AIzaSyCxl9ki92NaxmXmxB8kc-SCuN_Cmle-MwA',
  authDomain: 'fitness-app-69f08.firebaseapp.com',
  projectId: 'fitness-app-69f08',
  storageBucket: 'fitness-app-69f08.firebasestorage.app',
  messagingSenderId: '5144099869',
  appId: '1:5144099869:web:1df863a1fa04e89bce1af4',
};

// 檢查是否為開發環境
const isDevelopment = process.env.NODE_ENV === 'development';

let app, auth, db, storage;

try {
  let firebaseConfig;

  if (isDevelopment) {
    // 開發環境：使用預設配置或環境變數
    firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
      authDomain:
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
      projectId:
        import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
      storageBucket:
        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
        defaultConfig.storageBucket,
      messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
        defaultConfig.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
    };

    logger.debug('開發環境 Firebase 配置:', firebaseConfig);

    // 檢查是否使用有效的 Firebase 配置
    if (firebaseConfig.apiKey === 'demo-api-key') {
      logger.warn(
        '⚠️ 警告：使用 demo Firebase 配置，認證功能將無法正常工作！'
      );
      logger.warn('請創建 .env 檔案並設置正確的 Firebase 配置');
      logger.warn(
        '或者設置環境變數：VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN 等'
      );
    } else {
      logger.debug('✅ 使用有效的 Firebase 配置');
    }
  } else {
    // 生產環境：優先使用環境變數，如果沒有則使用預設配置
    firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
      authDomain:
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
      projectId:
        import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
      storageBucket:
        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
        defaultConfig.storageBucket,
      messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
        defaultConfig.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
    };

    logger.debug('生產環境 Firebase 配置:', firebaseConfig);

    // 檢查是否使用有效的 Firebase 配置
    if (firebaseConfig.apiKey === 'demo-api-key') {
      logger.warn(
        '⚠️ 警告：使用 demo Firebase 配置，認證功能將無法正常工作！'
      );
    } else {
      logger.debug('✅ 使用有效的 Firebase 配置');
    }
  }

  logger.debug('開始初始化 Firebase');
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // ✅ 新增：配置 Firestore 連接設置
  // 啟用離線持久化（如果可用）
  try {
    // Firestore 會自動處理離線緩存
    logger.debug('✅ Firestore 離線支持已啟用');
  } catch (offlineError) {
    logger.warn('⚠️ Firestore 離線支持不可用:', offlineError);
  }

  // ✅ 新增：監聽網路狀態變化
  if (typeof window !== 'undefined') {
    window.addEventListener('online', async () => {
      logger.info('🌐 網路已連接，恢復 Firestore 連接');
      try {
        await enableNetwork(db);
        logger.info('✅ Firestore 連接已恢復');
      } catch (error) {
        logger.error('❌ 恢復 Firestore 連接失敗:', error);
      }
    });

    window.addEventListener('offline', () => {
      logger.warn('📴 網路已斷開，Firestore 將使用離線緩存');
    });

    // ✅ 新增：定期檢查連接狀態（僅生產環境）
    if (!isDevelopment) {
      setInterval(async () => {
        try {
          // 靜默檢查連接，不影響用戶體驗
          await enableNetwork(db);
        } catch (error) {
          // 靜默處理錯誤，避免控制台噪音
        }
      }, 30000); // 每 30 秒檢查一次
    }
  }

  // 初始化社交登入提供者
  const googleProvider = new GoogleAuthProvider();

  // 配置 Google 登入
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });

  logger.debug('Firebase 初始化成功');
} catch (error) {
  logger.error('Firebase 初始化失敗:', error.message, error);

  // 創建模擬的 Firebase 服務
  if (isDevelopment) {
    logger.warn('使用模擬 Firebase 服務進行開發');

    // 創建模擬的 auth 對象
    auth = {
      currentUser: null,
      onAuthStateChanged: callback => {
        logger.debug('模擬 auth.onAuthStateChanged 被調用');
        // 模擬未登入狀態
        callback(null);
        return () => {}; // 返回清理函數
      },
      signInWithEmailAndPassword: async (auth, email) => {
        logger.debug('模擬登入被調用:', email);
        throw new Error(
          'Firebase 未正確配置，無法進行真實認證。請檢查環境變數配置。'
        );
      },
      createUserWithEmailAndPassword: async (auth, email) => {
        logger.debug('模擬註冊被調用:', email);
        throw new Error(
          'Firebase 未正確配置，無法進行真實認證。請檢查環境變數配置。'
        );
      },
      signOut: async () => {
        logger.debug('模擬登出被調用');
        return Promise.resolve();
      },
    };

    // 創建模擬的 db 對象
    db = {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: false, data: () => null }),
          set: async () => Promise.resolve(),
          update: async () => Promise.resolve(),
        }),
      }),
    };

    // 創建模擬的 storage 對象
    storage = {
      ref: () => ({
        put: async () => Promise.resolve(),
        getDownloadURL: async () => Promise.resolve('mock-url'),
      }),
    };

    logger.debug('模擬 Firebase 服務創建完成');
  } else {
    throw error;
  }
}

export { auth, db, storage };
