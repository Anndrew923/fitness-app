import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 定義必要的環境變量
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

// 檢查環境變量是否完整
const missingVars = requiredEnvVars.filter((envVar) => !import.meta.env[envVar]);
if (missingVars.length > 0) {
  console.error('缺少環境變量:', missingVars);
  throw new Error(`缺少環境變量：${missingVars.join(', ')}`);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app, auth, db;

try {
  console.log('開始初始化 Firebase，配置:', firebaseConfig);
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase 初始化成功', { app, auth, db });
} catch (error) {
  console.error('Firebase 初始化失敗:', error.message, error);
  auth = null;
  db = null;
}

export { auth, db };