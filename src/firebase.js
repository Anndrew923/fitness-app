import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 檢查環境變量
console.log(
  'REACT_APP_FIREBASE_API_KEY:',
  process.env.REACT_APP_FIREBASE_API_KEY
);
console.log(
  'REACT_APP_FIREBASE_AUTH_DOMAIN:',
  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
);
console.log(
  'REACT_APP_FIREBASE_PROJECT_ID:',
  process.env.REACT_APP_FIREBASE_PROJECT_ID
);
console.log(
  'REACT_APP_FIREBASE_STORAGE_BUCKET:',
  process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
);
console.log(
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID:',
  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
);
console.log(
  'REACT_APP_FIREBASE_APP_ID:',
  process.env.REACT_APP_FIREBASE_APP_ID
);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// 檢查環境變量是否正確
console.log('Firebase Config:', firebaseConfig);
let app, auth, db;
try {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('Firebase 配置缺失，請檢查環境變量！');
    throw new Error('Firebase 配置缺失');
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase 初始化失敗:', error);
  auth = null;
  db = null;
}

export { auth, db };
