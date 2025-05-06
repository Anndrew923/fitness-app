import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from './firebase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const userReducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_USER_DATA':
        console.log('UserContext.js - 更新 userData:', action.payload);
        return { ...state, ...action.payload };
      case 'RESET_USER_DATA':
        console.log('UserContext.js - 重置 userData');
        return {
          gender: '',
          height: 0,
          weight: 0,
          age: 0,
          scores: {
            strength: 0,
            explosivePower: 0,
            cardio: 0,
            muscleMass: 0,
            bodyFat: 0,
          },
          history: [],
        };
      default:
        return state;
    }
  };

  const [userData, dispatch] = useReducer(userReducer, {
    gender: '',
    height: 0,
    weight: 0,
    age: 0,
    scores: {
      strength: 0,
      explosivePower: 0,
      cardio: 0,
      muscleMass: 0,
      bodyFat: 0,
    },
    history: [],
  });

  const loadUserData = useCallback(async () => {
    console.log('UserContext.js - 載入 userData');
    const defaultData = {
      gender: '',
      height: 0,
      weight: 0,
      age: 0,
      scores: {
        strength: 0,
        explosivePower: 0,
        cardio: 0,
        muscleMass: 0,
        bodyFat: 0,
      },
      history: [],
    };

    if (!auth.currentUser) {
      console.log('UserContext.js - 用戶未登入，使用預設值');
      dispatch({ type: 'UPDATE_USER_DATA', payload: defaultData });
      return;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const firebaseData = userSnap.data();
        console.log('UserContext.js - 從 Firebase 載入:', firebaseData);
        dispatch({ type: 'UPDATE_USER_DATA', payload: { ...defaultData, ...firebaseData } });
      } else {
        console.log('UserContext.js - Firebase 中無資料，創建預設資料');
        const initialData = { ...defaultData, userId: auth.currentUser.uid };
        await setDoc(userRef, initialData);
        dispatch({ type: 'UPDATE_USER_DATA', payload: initialData });
      }
    } catch (err) {
      console.error('UserContext.js - 載入 Firebase 資料失敗:', err);
      throw err; // 重新拋出錯誤以便上層處理
    }
  }, []); // 移除 auth.currentUser 依賴項

  const saveUserData = useCallback(async (data) => {
    console.log('UserContext.js - 儲存 userData, data:', data);
    if (typeof data !== 'object' || data === null) {
      console.error('UserContext.js - saveUserData 接收到無效數據:', data);
      return;
    }
    if (!auth.currentUser) {
      console.error('UserContext.js - 用戶未登入，無法儲存數據');
      return;
    }
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const dataWithUserId = { ...data, userId: auth.currentUser.uid };
      await setDoc(userRef, dataWithUserId, { merge: true });
      console.log('UserContext.js - Firebase 儲存成功');
      await loadUserData(); // 儲存後重新載入數據
    } catch (err) {
      console.error('UserContext.js - 儲存 Firebase 資料失敗:', err);
      throw err; // 重新拋出錯誤
    }
  }, [loadUserData]);

  const saveHistory = useCallback(async (record) => {
    if (!auth.currentUser) {
      console.error('UserContext.js - 用戶未登入，無法儲存歷史紀錄');
      return;
    }
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const recordWithUserId = {
        ...record,
        userId: auth.currentUser.uid,
        timestamp: new Date().toISOString(), // 添加時間戳
      };
      await updateDoc(userRef, {
        history: arrayUnion(recordWithUserId),
      });
      console.log('UserContext.js - 歷史紀錄儲存成功');
      await loadUserData(); // 儲存後重新載入數據
    } catch (err) {
      console.error('UserContext.js - 儲存歷史紀錄失敗:', err);
      throw err; // 重新拋出錯誤
    }
  }, [loadUserData]);

  const setUserData = useCallback((update) => {
    if (typeof update === 'function') {
      const newData = update(userData);
      saveUserData(newData);
    } else {
      saveUserData(update);
    }
  }, [userData, saveUserData]);

  const clearUserData = useCallback(() => {
    console.log('UserContext.js - 清除 userData');
    dispatch({ type: 'RESET_USER_DATA' });
  }, []);

  useEffect(() => {
    // 監聽身份驗證狀態變化
    const unsubscribe = auth.onAuthStateChanged(() => {
      console.log('Auth state changed, reloading user data');
      loadUserData();
    });
    return () => unsubscribe(); // 清理訂閱
  }, [loadUserData]);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        saveUserData,
        saveHistory,
        clearUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}