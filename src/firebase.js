// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCxl9ki92NaxmXmxB8kc-SCuN_Cmle-MwA", // 替換為正確的 apiKey
  authDomain: "fitness-app-69f08.firebaseapp.com",
  projectId: "fitness-app-69f08",
  storageBucket: "fitness-app-69f08.firebasestorage.app",
  messagingSenderId: "51448990869",
  appId: "1:51448990869:web:1fd63a1fa84e89bce1af4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 如果使用 Firebase Emulator，取消註釋以下代碼並確保模擬器已啟動
// if (process.env.NODE_ENV === 'development') {
//   connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
//   console.log('已連接到 Firebase Authentication 模擬器');
// }

export { db, auth };