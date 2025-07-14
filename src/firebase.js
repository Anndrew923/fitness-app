import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 開發環境的預設配置
const defaultConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'demo-app-id',
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

    console.log('開發環境 Firebase 配置:', firebaseConfig);
  } else {
    // 生產環境：嚴格檢查環境變數
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
    ];

    const missingVars = requiredEnvVars.filter(
      envVar => !import.meta.env[envVar]
    );
    if (missingVars.length > 0) {
      console.error('缺少環境變量:', missingVars);
      throw new Error(`缺少環境變量：${missingVars.join(', ')}`);
    }

    firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  console.log('開始初始化 Firebase');
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase 初始化成功');
} catch (error) {
  console.error('Firebase 初始化失敗:', error.message, error);

  // 創建模擬的 Firebase 服務
  if (isDevelopment) {
    console.warn('使用模擬 Firebase 服務進行開發');
    auth = {
      currentUser: null,
      onAuthStateChanged: callback => {
        callback(null);
        return () => {};
      },
      signInWithEmailAndPassword: async () => {
        throw new Error('Firebase 未配置，無法進行認證');
      },
      signOut: async () => {
        console.log('模擬登出');
      },
    };
    db = {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: () => false, data: () => null }),
          set: async () => {},
          update: async () => {},
        }),
      }),
    };
    storage = {
      ref: () => ({
        put: async () => ({ ref: { getDownloadURL: async () => '' } }),
      }),
    };
  } else {
    auth = null;
    db = null;
    storage = null;
  }
}

export { auth, db, storage };
