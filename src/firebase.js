// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // 移除 connectAuthEmulator

const firebaseConfig = {
  apiKey: "AIzaSyCxl9ki92NaxmXmxB8kc-SCuN_Cmle-MwA",
  authDomain: "fitness-app-69f08.firebaseapp.com",
  projectId: "fitness-app-69f08",
  storageBucket: "fitness-app-69f08.firebasestorage.app",
  messagingSenderId: "51448990869",
  appId: "1:51448990869:web:1fd63a1fa84e89bce1af4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };