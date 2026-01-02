import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { auth } from './firebase';
import logger from './utils/logger';
import { handleDailyLogin } from './utils/activityTracker';
import { useUserData } from './hooks/useUserData';
import { useHistoryManager } from './hooks/useHistoryManager';
import { useUserDataSync } from './hooks/useUserDataSync';
import {
  JOB_CATEGORIES,
  CITY_OPTIONS,
  initialState,
} from './constants/userConstants';

const UserContext = createContext();

// Re-export constants for backward compatibility
export { JOB_CATEGORIES, CITY_OPTIONS };

export function UserProvider({ children }) {
  const isMountedRef = useRef(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if in mock mode
  const isMockMode = useMemo(() => {
    return auth.app?.options?.apiKey === 'demo-api-key' || !auth.app;
  }, []);

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

  // Use user data hooks
  const {
    loadUserData: loadUserDataFromHook,
    saveUserData,
    addToWriteQueue,
  } = useUserData(initialState, isMockMode);
  const { saveHistory } = useHistoryManager(userData, dispatch, isMockMode);
  const { setUserData } = useUserDataSync(userData, dispatch, addToWriteQueue);

  // Load user data wrapper with state management
  const loadUserData = useCallback(
    async (currentUser, forceReload = false) => {
      if (!currentUser || !isMountedRef.current) {
        setIsLoading(false);
        return false;
      }

      setIsLoading(true);

      try {
        const result = await loadUserDataFromHook(currentUser, forceReload);

        if (!result.success || !isMountedRef.current) {
          setIsLoading(false);
          return false;
        }

        const mergedData = result.data;

        // Handle daily login tracking
        if (result.userRef) {
          try {
            const loginUpdates = handleDailyLogin(mergedData);
            if (loginUpdates) {
              logger.debug(
                '📅 [ActivityTracker] Login stats updated:',
                loginUpdates
              );

              // Update Firestore immediately
              const { updateDoc } = await import('firebase/firestore');
              const { doc } = await import('firebase/firestore');
              const { db } = await import('./firebase');
              const userRef = doc(db, 'users', currentUser.uid);
              const updateData = {
                lastLoginDate: loginUpdates.lastLoginDate,
                stats_loginStreak: loginUpdates.stats_loginStreak,
                stats_totalLoginDays: loginUpdates.stats_totalLoginDays,
                updatedAt: new Date().toISOString(),
              };

              await updateDoc(userRef, updateData);

              // Update local state with new login stats
              const updatedData = {
                ...mergedData,
                ...updateData,
              };
              dispatch({ type: 'SET_USER_DATA', payload: updatedData });
              localStorage.setItem('userData', JSON.stringify(updatedData));

              logger.debug(
                '✅ [ActivityTracker] Login stats saved to Firestore'
              );
            }
          } catch (error) {
            logger.error(
              '❌ [ActivityTracker] Failed to update login stats:',
              error
            );
          }
        }

        if (isMountedRef.current) {
          dispatch({ type: 'SET_USER_DATA', payload: mergedData });
          localStorage.setItem('userData', JSON.stringify(mergedData));
          if (process.env.NODE_ENV === 'development') {
            logger.debug('用戶資料載入成功');
          }
        }

        setIsLoading(false);
        return true;
      } catch (error) {
        logger.error('載入用戶數據失敗:', error);
        setIsLoading(false);
        return false;
      }
    },
    [loadUserDataFromHook]
  );

  // Function refs to avoid auth listener re-execution
  const loadUserDataRef = useRef();
  const clearUserDataRef = useRef();

  // Clear user data
  const clearUserData = useCallback(() => {
    logger.debug('清除用戶資料');
    localStorage.removeItem('userData');
    dispatch({ type: 'RESET_USER_DATA' });
    setIsLoading(false);
  }, []);

  // Update function refs
  loadUserDataRef.current = loadUserData;
  clearUserDataRef.current = clearUserData;

  // Listen to auth state changes
  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        logger.debug('認證狀態變更 - 用戶已登入:', user.email);
        setIsAuthenticated(true);
        sessionStorage.removeItem('guestMode');
        await loadUserDataRef.current(user);
      } else {
        logger.debug('認證狀態變更 - 用戶未登入');
        setIsAuthenticated(false);
        clearUserDataRef.current();
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

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
