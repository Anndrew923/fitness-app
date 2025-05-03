import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    };

    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const firebaseData = userSnap.data();
          console.log('UserContext.js - 從 Firebase 載入:', firebaseData);
          dispatch({ type: 'UPDATE_USER_DATA', payload: { ...defaultData, ...firebaseData } });
        } else {
          console.log('UserContext.js - Firebase 中無資料，使用預設值');
          dispatch({ type: 'UPDATE_USER_DATA', payload: defaultData });
        }
      } catch (err) {
        console.error('UserContext.js - 載入 Firebase 資料失敗:', err);
      }
    }
  }, []);

  const saveUserData = useCallback(async (data) => {
    console.log('UserContext.js - 儲存 userData, data:', data);
    if (typeof data !== 'object' || data === null) {
      console.error('UserContext.js - saveUserData 接收到無效數據:', data);
      return;
    }
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, data, { merge: true });
        console.log('UserContext.js - Firebase 儲存成功');
      } catch (err) {
        console.error('UserContext.js - 儲存 Firebase 資料失敗:', err);
      }
    }
    dispatch({ type: 'UPDATE_USER_DATA', payload: data });
  }, []);

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
    loadUserData();
  }, [loadUserData]);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        saveUserData,
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