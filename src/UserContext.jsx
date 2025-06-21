import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from './firebase';
import PropTypes from 'prop-types';

const UserContext = createContext();

const initialState = {
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

export function UserProvider({ children }) {
  const isMountedRef = useRef(true);
  
  const userReducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_USER_DATA':
        return { ...state, ...action.payload };
      case 'SET_USER_DATA':
        return action.payload;
      case 'RESET_USER_DATA':
        return initialState;
      default:
        return state;
    }
  };

  const [userData, dispatch] = useReducer(userReducer, initialState);

  // 從 Firebase 載入用戶數據
  const loadUserData = useCallback(async (currentUser) => {
    if (!currentUser || !isMountedRef.current) {
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const firebaseData = userSnap.data();
        // 確保數據結構完整
        const mergedData = {
          ...initialState,
          ...firebaseData,
          scores: {
            ...initialState.scores,
            ...(firebaseData.scores || {}),
          },
        };
        
        if (isMountedRef.current) {
          dispatch({ type: 'SET_USER_DATA', payload: mergedData });
          localStorage.setItem('userData', JSON.stringify(mergedData));
        }
      } else {
        // 如果用戶文檔不存在，創建一個新的
        const newUserData = { ...initialState, userId: currentUser.uid };
        await setDoc(userRef, newUserData);
        
        if (isMountedRef.current) {
          dispatch({ type: 'SET_USER_DATA', payload: newUserData });
          localStorage.setItem('userData', JSON.stringify(newUserData));
        }
      }
    } catch (error) {
      console.error('載入用戶數據失敗:', error);
      // 嘗試從 localStorage 載入
      const localData = localStorage.getItem('userData');
      if (localData && isMountedRef.current) {
        try {
          const parsedData = JSON.parse(localData);
          dispatch({ type: 'SET_USER_DATA', payload: parsedData });
        } catch (e) {
          console.error('解析本地數據失敗:', e);
        }
      }
    }
  }, []);

  // 保存用戶數據到 Firebase
  const saveUserData = useCallback(async (data) => {
    if (!auth.currentUser || !data) {
      console.warn('無法保存數據：用戶未登入或數據無效');
      return false;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const dataToSave = {
        ...data,
        userId: auth.currentUser.uid,
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(userRef, dataToSave, { merge: true });
      localStorage.setItem('userData', JSON.stringify(dataToSave));
      console.log('數據保存成功');
      return true;
    } catch (error) {
      console.error('保存用戶數據失敗:', error);
      // 至少保存到本地
      localStorage.setItem('userData', JSON.stringify(data));
      return false;
    }
  }, []);

  // 更新用戶數據 - 修復版本
  const setUserData = useCallback((update) => {
    let newData;
    
    if (typeof update === 'function') {
      // 函數式更新
      const currentData = userData;
      newData = update(currentData);
    } else {
      // 直接更新
      newData = { ...userData, ...update };
    }
    
    // 立即更新本地狀態
    dispatch({ type: 'UPDATE_USER_DATA', payload: newData });
    
    // 異步保存到 Firebase
    saveUserData(newData);
  }, [userData, saveUserData]);

  // 保存歷史記錄
  const saveHistory = useCallback(async (record) => {
    if (!auth.currentUser) {
      console.warn('無法保存歷史記錄：用戶未登入');
      return;
    }

    const recordWithMetadata = {
      ...record,
      userId: auth.currentUser.uid,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    };

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        history: arrayUnion(recordWithMetadata),
      });
      
      // 更新本地 state
      const newHistory = [...(userData.history || []), recordWithMetadata];
      dispatch({
        type: 'UPDATE_USER_DATA',
        payload: { history: newHistory },
      });
      
      console.log('歷史記錄保存成功');
    } catch (error) {
      console.error('保存歷史記錄失敗:', error);
      // 至少更新本地 state
      const newHistory = [...(userData.history || []), recordWithMetadata];
      dispatch({
        type: 'UPDATE_USER_DATA',
        payload: { history: newHistory },
      });
    }
  }, [userData.history]);

  // 清除用戶數據
  const clearUserData = useCallback(() => {
    localStorage.removeItem('userData');
    dispatch({ type: 'RESET_USER_DATA' });
  }, []);

  // 監聽認證狀態變化
  useEffect(() => {
    isMountedRef.current = true;
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('用戶已登入:', user.email);
        loadUserData(user);
      } else {
        console.log('用戶未登入');
        clearUserData();
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [loadUserData, clearUserData]);

  // 定期同步數據到 Firebase（每 30 秒）
  useEffect(() => {
    if (!auth.currentUser || !userData) return;

    const syncInterval = setInterval(() => {
      if (auth.currentUser && userData) {
        saveUserData(userData);
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [userData, saveUserData]);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        saveUserData,
        saveHistory,
        clearUserData,
        loadUserData: () => loadUserData(auth.currentUser),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}