import { useState, useCallback, useRef, useEffect } from 'react';
import { generateNickname } from '../utils';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import logger from '../utils/logger';

const GENDER_OPTIONS = ['male', 'female'];

export const useUserInfoForm = (
  userData,
  setUserData,
  saveUserData,
  t,
  isGuest,
  onShowModal,
  navigate
) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weightReminder, setWeightReminder] = useState({
    show: false,
    message: '',
  });
  const nicknameTimeoutRef = useRef(null);
  const previousWeightRef = useRef(null); // 記錄保存前的體重（來自 API/首次載入）
  const isInitializedRef = useRef(false); // 標記是否已初始化

  // ✅ 鎖定初始值：只在組件掛載或 API 資料首次載入時設定一次
  // 禁止隨動：當用戶在 input 欄位輸入數字時，不要更新 previousWeightRef
  useEffect(() => {
    const currentWeight = Number(userData.weight) || 0;
    
    // 只在首次初始化時設定（previousWeightRef 為 null 且 currentWeight > 0）
    // 一旦初始化後，就不再隨 userData.weight 變化而更新
    if (!isInitializedRef.current && currentWeight > 0) {
      previousWeightRef.current = currentWeight;
      isInitializedRef.current = true;
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('previousWeightRef 初始化:', currentWeight);
      }
    }
  }, [userData.weight]);

  const validateData = useCallback(() => {
    const { height, weight, age, gender } = userData;
    if (!height || !weight || !age || !gender) {
      setError(t('errors.required'));
      return false;
    }
    if (height <= 0 || weight <= 0 || age <= 0) {
      setError(t('userInfo.modal.invalidPositive'));
      return false;
    }
    if (!GENDER_OPTIONS.includes(gender)) {
      setError(t('userInfo.modal.invalidGender'));
      return false;
    }
    return true;
  }, [userData, t]);

  const saveData = useCallback(
    async e => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      if (!validateData()) {
        setLoading(false);
        return;
      }

      const DEFAULT_SCORES = {
        strength: 0,
        explosivePower: 0,
        cardio: 0,
        muscleMass: 0,
        bodyFat: 0,
      };

      // ✅ 比較時機：在 handleSave 中，拿 formData.weight (新) 與 previousWeightRef.current (舊) 進行比較
      // previousWeightRef 記錄的是上次保存成功後的體重（或首次載入的體重）
      const oldWeight = previousWeightRef.current !== null 
        ? Number(previousWeightRef.current) || 0
        : Number(userData.weight) || 0;
      const newWeight = Number(userData.weight) || 0;
      
      // ✅ 調試日誌：檢查體重比較
      if (process.env.NODE_ENV === 'development') {
        logger.debug('體重比較:', { 
          oldWeight, 
          newWeight, 
          previousWeightRef: previousWeightRef.current,
          changed: Math.abs(oldWeight - newWeight) > 0.01 
        });
      }

      const updatedUserData = {
        ...userData,
        height: Number(userData.height) || 0,
        weight: newWeight,
        age: Number(userData.age) || 0,
        gender: userData.gender,
        job_category: userData.job_category || '',
        country: userData.country || '',
        region: userData.region || '',
        // ✅ Phase 2: Add city and district fields for Taiwan location-based rankings
        city: userData.city || '',
        district: userData.district || '',
        scores: userData.scores || DEFAULT_SCORES,
        ladderScore: userData.ladderScore || 0,
        lastActive: new Date().toISOString(),
      };

      try {
        // ✅ 檢查是否只改變了 location fields (country, region, city, district)
        const countryChanged =
          (userData.country || '') !== (updatedUserData.country || '');
        const regionChanged =
          (userData.region || '') !== (updatedUserData.region || '');
        const cityChanged =
          (userData.city || '') !== (updatedUserData.city || '');
        const districtChanged =
          (userData.district || '') !== (updatedUserData.district || '');
        const onlyLocationChanged =
          (countryChanged || regionChanged || cityChanged || districtChanged) &&
          userData.height === updatedUserData.height &&
          userData.weight === updatedUserData.weight &&
          userData.age === updatedUserData.age &&
          userData.gender === updatedUserData.gender &&
          JSON.stringify(userData.scores || {}) ===
            JSON.stringify(updatedUserData.scores || {});

        // ✅ FIX: Always save to Firebase when the user clicks Save
        await saveUserData(updatedUserData);
        setUserData(updatedUserData);

        // (Optional) Keep the logger if you want, but ensure saveUserData is called.
        if (onlyLocationChanged) {
          logger.debug(
            '🌍 位置資訊變化（國家/城市/行政區），立即保存到 Firebase',
            {
              country: updatedUserData.country,
              city: updatedUserData.city,
              district: updatedUserData.district,
            }
          );
        }

        // ✅ 檢測體重變更並顯示引導提示
        // 確保型別一致，使用嚴格比較
        const weightChanged = 
          oldWeight > 0 && 
          newWeight > 0 && 
          Math.abs(oldWeight - newWeight) > 0.01; // 允許小數點誤差
        
        // ✅ 更新時機：只有在 saveUserData 成功之後，才把 previousWeightRef.current 更新為新體重
        // 這樣下次保存時，previousWeightRef 就是這次保存的體重值
        previousWeightRef.current = newWeight;
        
        if (process.env.NODE_ENV === 'development') {
          logger.debug('保存成功，更新 previousWeightRef:', newWeight);
        }
        
        // ✅ 確保在保存成功後才顯示提示
        if (weightChanged) {
          // ✅ 寫入體重變更通知到 Firestore
          try {
            const currentUser = auth.currentUser;
            if (currentUser && currentUser.uid) {
              const oldWeightStr = oldWeight.toFixed(1);
              const newWeightStr = newWeight.toFixed(1);
              // 使用字符串模板構建消息，確保兼容性
              const messageTemplate = t('notifications.weightUpdateMessage');
              const message = messageTemplate
                .replace('{{oldWeight}}', oldWeightStr)
                .replace('{{newWeight}}', newWeightStr);
              
              await addDoc(collection(db, 'notifications'), {
                userId: currentUser.uid,
                title: t('notifications.weightUpdateTitle'),
                message: message,
                type: 'system',
                read: false,
                createdAt: serverTimestamp(),
                targetPath: '/skill-tree', // 點擊通知可跳轉到工具頁
              });
            }
          } catch (notificationError) {
            // 通知寫入失敗不影響主流程，僅記錄錯誤
            console.error('寫入體重變更通知失敗:', notificationError);
          }

          // 顯示體重變更引導 Modal
          // 使用 setTimeout 確保 Modal 在狀態更新後顯示
          setTimeout(() => {
            onShowModal({
              isOpen: true,
              title: '體重已更新！',
              message: `體重已從 ${oldWeight.toFixed(1)}kg 更新為 ${newWeight.toFixed(1)}kg。建議您前往重新評測，以確保天梯排名精準。`,
              type: 'info',
              actionText: '前往工具頁',
              onAction: () => {
                // 導航到工具頁面（skill-tree）
                if (navigate) {
                  navigate('/skill-tree');
                } else {
                  window.location.href = '/skill-tree';
                }
              },
            });
          }, 100);
        } else {
          // 正常保存成功提示
          setTimeout(() => {
            onShowModal({
              isOpen: true,
              title: t('userInfo.modal.saveSuccessTitle'),
              message: t('userInfo.modal.saveSuccessMessage'),
              type: 'success',
            });
          }, 100);
        }
      } catch (err) {
        if (isGuest) {
          onShowModal({
            isOpen: true,
            title: '訪客模式',
            message: '訪客模式下無法保存到雲端，但您現在可以開始進行評測了！',
            type: 'info',
          });
        } else {
          onShowModal({
            isOpen: true,
            title: '儲存失敗',
            message: `儲存失敗：${err.message}`,
            type: 'error',
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [userData, validateData, isGuest, setUserData, saveUserData, t, onShowModal]
  );

  const handleNicknameChange = useCallback(
    e => {
      const nickname = e.target.value;

      // 檢查字數限制
      const isChinese = /[\u4e00-\u9fff]/.test(nickname);
      let isValid = true;
      let errorMessage = '';

      if (isChinese) {
        if (nickname.length > 8) {
          isValid = false;
          errorMessage = '暱稱不能超過8個中文字';
        }
      } else {
        if (nickname.length > 16) {
          isValid = false;
          errorMessage = '暱稱不能超過16個英文字元';
        }
      }

      if (!isValid) {
        onShowModal({
          isOpen: true,
          title: '字數限制',
          message: errorMessage,
          type: 'warning',
        });
        return;
      }

      // 立即更新本地狀態
      setUserData(prev => ({
        ...prev,
        nickname: nickname,
      }));

      // 清除之前的定時器
      if (nicknameTimeoutRef.current) {
        clearTimeout(nicknameTimeoutRef.current);
      }

      // 設置新的防抖定時器
      nicknameTimeoutRef.current = setTimeout(() => {
        nicknameTimeoutRef.current = null;
      }, 1000);
    },
    [setUserData, onShowModal]
  );

  const handleGenerateNickname = useCallback(() => {
    const email = auth.currentUser?.email;
    const generatedNickname = generateNickname(email);
    setUserData(prev => ({
      ...prev,
      nickname: generatedNickname,
      ladderScore: prev.ladderScore || 0,
    }));
  }, [setUserData]);

  const handleInputChange = useCallback(
    e => {
      const { name, value } = e.target;
      let processedValue = value;

      // 處理不同類型的欄位
      if (name === 'gender') {
        processedValue = value;
      } else if (
        ['job_category', 'country', 'region', 'city', 'district'].includes(name)
      ) {
        // ✅ 修復：確保 city 和 district 字段被正確處理為字符串
        processedValue = value;
      } else if (['weeklyTrainingHours', 'trainingYears'].includes(name)) {
        processedValue = value === '' ? '' : Number(value);
      } else {
        processedValue = value === '' ? 0 : Number(value);
      }

      // 檢查體重變化
      if (name === 'weight') {
        const oldWeight = userData.weight || 0;
        const newWeight = processedValue;

        if (oldWeight > 0 && newWeight > 0 && oldWeight !== newWeight) {
          setWeightReminder({
            show: true,
            message: t('userInfo.weightChangeReminder'),
          });

          setTimeout(() => {
            setWeightReminder(prev => ({ ...prev, show: false }));
          }, 3000);
        }
      }

      setUserData(prev => ({
        ...prev,
        [name]: processedValue,
        ladderScore: prev.ladderScore || 0,
      }));
    },
    [setUserData, userData.weight, t]
  );

  return {
    loading,
    error,
    weightReminder,
    handleInputChange,
    handleNicknameChange,
    handleGenerateNickname,
    saveData,
  };
};
