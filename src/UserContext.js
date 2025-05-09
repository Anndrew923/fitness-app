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
        return { ...state, ...action.payload };
      case 'RESET_USER_DATA':
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
          testInputs: {},
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
    testInputs: {},
  });

  const loadUserData = useCallback(async (currentUser) => {
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
      testInputs: {},
    };

    // 先從 localStorage 載入，作為初始值
    const localData = JSON.parse(localStorage.getItem('userData')) || defaultData;
    dispatch({ type: 'UPDATE_USER_DATA', payload: localData });

    if (!currentUser) {
      dispatch({ type: 'UPDATE_USER_DATA', payload: defaultData });
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const firebaseData = userSnap.data();
        const mergedData = { ...defaultData, ...firebaseData };
        dispatch({ type: 'UPDATE_USER_DATA', payload: mergedData });
        // 更新 localStorage
        localStorage.setItem('userData', JSON.stringify(mergedData));
      } else {
        const initialData = { ...defaultData, userId: currentUser.uid };
        await setDoc(userRef, initialData);
        dispatch({ type: 'UPDATE_USER_DATA', payload: initialData });
        localStorage.setItem('userData', JSON.stringify(initialData));
      }
    } catch (err) {
      // 如果 Firebase 載入失敗，使用 localStorage 數據
      dispatch({ type: 'UPDATE_USER_DATA', payload: localData });
    }
  }, []);

  const saveUserData = useCallback(async (data) => {
    if (typeof data !== 'object' || data === null) {
      return;
    }
    if (!auth.currentUser) {
      return;
    }
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const dataWithUserId = { ...data, userId: auth.currentUser.uid };
      await setDoc(userRef, dataWithUserId, { merge: true });
      // 更新 localStorage
      localStorage.setItem('userData', JSON.stringify(dataWithUserId));
      await loadUserData(auth.currentUser);
    } catch (err) {
      // 如果 Firebase 儲存失敗，僅更新本地
      localStorage.setItem('userData', JSON.stringify(data));
      dispatch({ type: 'UPDATE_USER_DATA', payload: data });
    }
  }, [loadUserData]);

  const saveHistory = useCallback(async (record) => {
    if (!auth.currentUser) {
      return;
    }
    // 將 recordWithUserId 定義在 try-catch 外部
    const recordWithUserId = {
      ...record,
      userId: auth.currentUser.uid,
      timestamp: new Date().toISOString(),
    };
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        history: arrayUnion(recordWithUserId),
      });
      await loadUserData(auth.currentUser);
    } catch (err) {
      // 使用外部定義的 recordWithUserId
      const newHistory = [...userData.history, recordWithUserId];
      const updatedData = { ...userData, history: newHistory };
      localStorage.setItem('userData', JSON.stringify(updatedData));
      dispatch({ type: 'UPDATE_USER_DATA', payload: updatedData });
    }
  }, [userData, loadUserData]);

  const setUserData = useCallback((update) => {
    if (typeof update === 'function') {
      const newData = update(userData);
      saveUserData(newData);
    } else {
      saveUserData(update);
    }
  }, [userData, saveUserData]);

  const clearUserData = useCallback(() => {
    localStorage.removeItem('userData');
    dispatch({ type: 'RESET_USER_DATA' });
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        loadUserData(user);
      } else {
        clearUserData();
      }
    });
    return () => unsubscribe();
  }, [loadUserData, clearUserData]);

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