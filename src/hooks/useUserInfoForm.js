import { useState, useCallback, useRef } from 'react';
import { generateNickname } from '../utils';
import { auth } from '../firebase';
import logger from '../utils/logger';

const GENDER_OPTIONS = ['male', 'female'];

export const useUserInfoForm = (
  userData,
  setUserData,
  saveUserData,
  t,
  isGuest,
  onShowModal
) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weightReminder, setWeightReminder] = useState({
    show: false,
    message: '',
  });
  const nicknameTimeoutRef = useRef(null);

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

      const updatedUserData = {
        ...userData,
        height: Number(userData.height) || 0,
        weight: Number(userData.weight) || 0,
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

        if (onlyLocationChanged) {
          logger.debug(
            '🌍 位置資訊變化（國家/城市/行政區），立即保存到 Firebase',
            {
              country: updatedUserData.country,
              city: updatedUserData.city,
              district: updatedUserData.district,
            }
          );
          await saveUserData(updatedUserData);
          setUserData(updatedUserData);
        } else {
          setUserData(updatedUserData);
        }

        onShowModal({
          isOpen: true,
          title: t('userInfo.modal.saveSuccessTitle'),
          message: t('userInfo.modal.saveSuccessMessage'),
          type: 'success',
        });
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
      } else if (['job_category', 'country', 'region'].includes(name)) {
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
