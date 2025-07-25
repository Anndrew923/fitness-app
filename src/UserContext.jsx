import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from './firebase';
import PropTypes from 'prop-types';
import { calculateLadderScore, getAgeGroup } from './utils';
import firebaseWriteMonitor from './utils/firebaseMonitor';

const UserContext = createContext();

const initialState = {
  gender: '',
  height: 0,
  weight: 0,
  age: 0,
  // 新增欄位
  nickname: '',
  avatarUrl: '',
  ageGroup: '', // 年齡段分類
  friends: [], // 好友列表
  friendRequests: [], // 好友邀請
  blockedUsers: [], // 封鎖用戶
  ladderScore: 0, // 天梯總分
  ladderRank: 0, // 天梯排名
  ladderHistory: [], // 天梯歷史
  isGuest: false, // 訪客模式標記
  // 天梯隱私設置
  isAnonymousInLadder: false, // 是否匿名參與天梯（預設不匿名）
  lastActive: new Date().toISOString(),
  // 原有欄位
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  const loadUserData = useCallback(async (currentUser, forceReload = false) => {
    if (!currentUser || !isMountedRef.current) {
      setIsLoading(false);
      return false;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        '開始載入用戶資料:',
        currentUser.uid,
        forceReload ? '(強制重新載入)' : ''
      );
    }
    setIsLoading(true);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const firebaseData = userSnap.data();
        if (process.env.NODE_ENV === 'development') {
          console.log('從 Firebase 載入的資料:', firebaseData);
        }

        // 確保數據結構完整
        const mergedData = {
          ...initialState,
          ...firebaseData,
          scores: {
            ...initialState.scores,
            ...(firebaseData.scores || {}),
          },
          // 確保數值類型正確
          height: Number(firebaseData.height) || 0,
          weight: Number(firebaseData.weight) || 0,
          age: Number(firebaseData.age) || 0,
          // 確保年齡段被正確計算
          ageGroup: firebaseData.age
            ? getAgeGroup(Number(firebaseData.age))
            : firebaseData.ageGroup || '',
          // 保持原有的天梯分數，不自動重新計算
          ladderScore: firebaseData.ladderScore || 0,
          // 確保天梯排名被正確讀取
          ladderRank: Number(firebaseData.ladderRank) || 0,
          // 確保天梯提交時間被正確讀取
          lastLadderSubmission: firebaseData.lastLadderSubmission || null,
          // 確保最後活動時間被正確讀取
          lastActive: firebaseData.lastActive || null,
        };

        if (isMountedRef.current) {
          dispatch({ type: 'SET_USER_DATA', payload: mergedData });
          localStorage.setItem('userData', JSON.stringify(mergedData));
          if (process.env.NODE_ENV === 'development') {
            console.log('用戶資料載入成功');
          }
        }
        setIsLoading(false);
        return true;
      } else {
        console.log('用戶文檔不存在，創建新的');
        // 如果用戶文檔不存在，創建一個新的
        const newUserData = { ...initialState, userId: currentUser.uid };
        await setDoc(userRef, newUserData);

        if (isMountedRef.current) {
          dispatch({ type: 'SET_USER_DATA', payload: newUserData });
          localStorage.setItem('userData', JSON.stringify(newUserData));
        }
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('載入用戶數據失敗:', error);

      // 嘗試從 localStorage 載入
      try {
        const localData = localStorage.getItem('userData');
        if (localData && isMountedRef.current) {
          const parsedData = JSON.parse(localData);
          if (process.env.NODE_ENV === 'development') {
            console.log('從本地載入用戶資料:', parsedData);
          }
          dispatch({ type: 'SET_USER_DATA', payload: parsedData });
          setIsLoading(false);
          return true;
        }
      } catch (e) {
        console.error('解析本地數據失敗:', e);
      }

      setIsLoading(false);
      return false;
    }
  }, []);

  // 保存用戶數據到 Firebase
  const saveUserData = useCallback(async data => {
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
        // 確保數值類型正確
        height: Number(data.height) || 0,
        weight: Number(data.weight) || 0,
        age: Number(data.age) || 0,
        // 確保年齡段被計算和保存
        ageGroup: data.age
          ? getAgeGroup(Number(data.age))
          : data.ageGroup || '',
        // 保持原有的天梯分數，不自動重新計算
        ladderScore: data.ladderScore || 0,
        // 確保天梯排名被保存
        ladderRank: Number(data.ladderRank) || 0,
        // 確保天梯提交時間被保存
        lastLadderSubmission: data.lastLadderSubmission || null,
        // 確保最後活動時間被保存
        lastActive: data.lastActive || null,
      };

      await setDoc(userRef, dataToSave, { merge: true });
      localStorage.setItem('userData', JSON.stringify(dataToSave));

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite(
        'setDoc',
        'users',
        auth.currentUser.uid,
        dataToSave
      );

      return true;
    } catch (error) {
      console.error('保存用戶數據失敗:', error);
      // 至少保存到本地
      localStorage.setItem('userData', JSON.stringify(data));
      return false;
    }
  }, []);

  // 新增：防抖引用
  const setUserDataDebounceRef = useRef(null);
  const saveHistoryDebounceRef = useRef(null);
  const lastWriteTimeRef = useRef(0);
  const writeCountRef = useRef(0);
  const lastWriteCountResetTimeRef = useRef(Date.now());

  // 更新用戶數據
  const setUserData = useCallback(
    update => {
      let newData;

      if (typeof update === 'function') {
        // 函數式更新
        const currentData = userData;
        newData = update(currentData);
      } else {
        // 直接更新
        newData = { ...userData, ...update };
      }

      // 計算年齡段（天梯分數不再自動計算）
      if (newData.age) {
        newData.ageGroup = getAgeGroup(newData.age);
      }

      // 立即更新本地狀態
      dispatch({ type: 'UPDATE_USER_DATA', payload: newData });

      // 優化：只在重要數據變化時才保存到 Firebase
      if (auth.currentUser) {
        const importantFields = [
          'scores',
          'height',
          'weight',
          'age',
          'gender',
          'nickname',
          'avatarUrl',
          'ladderRank',
          'history',
        ];
        const hasImportantChanges = importantFields.some(
          field =>
            JSON.stringify(newData[field]) !== JSON.stringify(userData[field])
        );

        if (hasImportantChanges) {
          // 檢查是否只是暱稱變化
          const isOnlyNicknameChange =
            JSON.stringify(newData.nickname) !==
              JSON.stringify(userData.nickname) &&
            JSON.stringify({ ...newData, nickname: userData.nickname }) ===
              JSON.stringify({ ...userData, nickname: newData.nickname });

          // 智能寫入頻率控制
          const now = Date.now();
          const timeSinceLastWrite = now - lastWriteTimeRef.current;
          const timeSinceLastReset = now - lastWriteCountResetTimeRef.current;

          // 每小時重置寫入計數
          if (timeSinceLastReset > 3600000) {
            writeCountRef.current = 0;
            lastWriteCountResetTimeRef.current = now;
          }

          // 簡化防抖邏輯：使用固定的防抖時間
          const debounceTime = isOnlyNicknameChange ? 3000 : 15000; // 暱稱3秒，其他15秒

          // 檢查寫入頻率限制（至少間隔30秒）
          if (timeSinceLastWrite < 30000) {
            // 如果距離上次寫入不到30秒，延長防抖時間
            if (setUserDataDebounceRef.current) {
              clearTimeout(setUserDataDebounceRef.current);
            }

            setUserDataDebounceRef.current = setTimeout(() => {
              console.log(`🔄 防抖後保存用戶數據（30秒頻率限制）`);
              lastWriteTimeRef.current = Date.now();
              writeCountRef.current++;
              saveUserData(newData);
              setUserDataDebounceRef.current = null;
            }, 30000 - timeSinceLastWrite);
          } else {
            // 清除之前的防抖定時器
            if (setUserDataDebounceRef.current) {
              clearTimeout(setUserDataDebounceRef.current);
            }

            // 使用簡化的防抖時間
            setUserDataDebounceRef.current = setTimeout(() => {
              console.log(
                `🔄 防抖後保存用戶數據（${debounceTime / 1000}秒防抖，第${
                  writeCountRef.current + 1
                }次寫入）`
              );
              lastWriteTimeRef.current = Date.now();
              writeCountRef.current++;
              saveUserData(newData);
              setUserDataDebounceRef.current = null;
            }, debounceTime);
          }
        }
      }
    },
    [userData, saveUserData]
  );

  // 保存歷史記錄 - 優化版本，包含記錄數量限制和自動清理
  const saveHistory = useCallback(
    async record => {
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

      // 獲取當前歷史記錄
      const currentHistory = userData.history || [];
      const maxRecords = 50;

      // 檢查記錄數量限制
      if (currentHistory.length >= maxRecords) {
        console.warn(`歷史記錄已達上限 (${maxRecords})，執行自動清理`);

        // 自動清理：保留最新的 40 條記錄，刪除最舊的 10 條
        const sortedHistory = [...currentHistory].sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.date);
          return dateB - dateA; // 降序排列，最新的在前
        });

        const cleanedHistory = sortedHistory.slice(0, maxRecords - 10);
        console.log(
          `自動清理完成：刪除 ${
            currentHistory.length - cleanedHistory.length
          } 條舊記錄`
        );

        // 更新本地 state
        dispatch({
          type: 'UPDATE_USER_DATA',
          payload: { history: cleanedHistory },
        });

        // 顯示用戶友好的提示
        if (typeof window !== 'undefined' && window.alert) {
          alert(`歷史記錄已達上限，已自動清理最舊的記錄以騰出空間。`);
        }
      }

      // 立即更新本地 state（添加新記錄）
      const newHistory = [...(userData.history || []), recordWithMetadata];
      dispatch({
        type: 'UPDATE_USER_DATA',
        payload: { history: newHistory },
      });

      // 使用防抖機制保存到 Firebase
      if (saveHistoryDebounceRef.current) {
        clearTimeout(saveHistoryDebounceRef.current);
      }

      saveHistoryDebounceRef.current = setTimeout(async () => {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);

          // 使用 setDoc 而不是 updateDoc，減少寫入次數
          const currentData = userData;
          const updatedData = {
            ...currentData,
            history: newHistory,
            updatedAt: new Date().toISOString(),
          };

          await setDoc(userRef, updatedData, { merge: true });

          // 記錄寫入操作
          firebaseWriteMonitor.logWrite(
            'setDoc',
            'users',
            auth.currentUser.uid,
            { history: 'batch_update' }
          );

          console.log(`歷史記錄保存成功 (${newHistory.length}/${maxRecords})`);
        } catch (error) {
          console.error('保存歷史記錄失敗:', error);
        } finally {
          saveHistoryDebounceRef.current = null;
        }
      }, 10000); // 增加到10秒防抖，進一步減少寫入頻率
    },
    [userData, saveUserData]
  );

  // 清除用戶數據
  const clearUserData = useCallback(() => {
    console.log('清除用戶資料');
    localStorage.removeItem('userData');
    dispatch({ type: 'RESET_USER_DATA' });
    setIsLoading(false);
  }, []);

  // 監聽認證狀態變化
  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        console.log('認證狀態變更 - 用戶已登入:', user.email);
        setIsAuthenticated(true);
        // 清除訪客模式標記
        sessionStorage.removeItem('guestMode');
        await loadUserData(user);
      } else {
        console.log('認證狀態變更 - 用戶未登入');
        setIsAuthenticated(false);
        clearUserData();
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [loadUserData, clearUserData]);

  // 定期同步數據到 Firebase（每 30 分鐘，進一步減少寫入頻率）
  useEffect(() => {
    if (!auth.currentUser || !userData || Object.keys(userData).length === 0)
      return;

    const syncInterval = setInterval(() => {
      if (auth.currentUser && userData && userData.height) {
        // 檢查距離上次寫入的時間
        const now = Date.now();
        const timeSinceLastWrite = now - lastWriteTimeRef.current;

        // 如果距離上次寫入不到10分鐘，跳過同步
        if (timeSinceLastWrite < 600000) {
          console.log('⏭️ 定期同步：距離上次寫入時間太短，跳過同步');
          return;
        }

        // 檢查是否有實際變化，避免無意義寫入
        const lastSavedData = localStorage.getItem('lastSavedUserData');
        const currentDataString = JSON.stringify({
          scores: userData.scores,
          height: userData.height,
          weight: userData.weight,
          age: userData.age,
          gender: userData.gender,
          nickname: userData.nickname,
          avatarUrl: userData.avatarUrl,
          ladderRank: userData.ladderRank,
        });

        if (lastSavedData !== currentDataString) {
          console.log('🔄 定期同步：檢測到數據變化，執行保存');
          saveUserData(userData);
          localStorage.setItem('lastSavedUserData', currentDataString);
        } else {
          console.log('⏭️ 定期同步：無數據變化，跳過保存');
        }
      }
    }, 1800000); // 改為30分鐘

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
        loadUserData: (forceReload = false) =>
          loadUserData(auth.currentUser, forceReload),
        isLoading,
        isAuthenticated,
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
