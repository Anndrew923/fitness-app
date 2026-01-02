import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { checkEarlyBirdStatus } from '../utils/rpgSystem';
import { useTranslation } from 'react-i18next';

export function useLoginLogic(onLogin) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { height, weight, age } = location.state || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    console.log('檢查 auth 初始化狀態:', auth);
    if (!auth) {
      setError('Firebase 未正確初始化，請檢查配置');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log('用戶已登入:', user.email);
        navigate('/user-info');
      }
    });

    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      console.log('從 localStorage 恢復帳號:', savedEmail);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }

    return () => unsubscribe();
  }, [navigate]);

  const handleEmailInvalid = e => {
    const v = e.target.validity;
    if (v.valueMissing) {
      e.target.setCustomValidity(t('errors.emailRequired'));
    } else if (v.typeMismatch) {
      e.target.setCustomValidity(t('errors.emailInvalid'));
    } else {
      e.target.setCustomValidity(t('errors.invalidFormat'));
    }
  };

  const handlePasswordInvalid = e => {
    const v = e.target.validity;
    if (v.valueMissing) {
      e.target.setCustomValidity(t('errors.passwordRequired'));
    } else if (v.tooShort) {
      e.target.setCustomValidity(t('errors.passwordTooShort'));
    } else {
      e.target.setCustomValidity(t('errors.invalidFormat'));
    }
  };

  const performLogin = async () => {
    setLoading(true);

    console.log(
      '開始處理表單提交，isRegistering:',
      isRegistering,
      'email:',
      email
    );

    if (!auth || !db) {
      const errorMsg = 'Firebase 未正確初始化，請檢查配置';
      console.error(errorMsg, { auth, db });
      setError(errorMsg);
      setLoading(false);
      return;
    }

    if (auth.app?.options?.apiKey === 'demo-api-key') {
      const errorMsg =
        'Firebase 使用 demo 配置，無法進行真實認證。請檢查環境變數配置。';
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isRegistering) {
        console.log('嘗試註冊用戶:', email);
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        console.log('註冊成功，用戶:', user.email, 'UID:', user.uid);

        const userRef = doc(db, 'users', user.uid);
        const initialUserData = {
          email: user.email,
          userId: user.uid,
          nickname: user.email.split('@')[0],
          avatarUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          gender: '',
          height: height ? parseFloat(height) : 0,
          weight: weight ? parseFloat(weight) : 0,
          age: age ? parseInt(age, 10) : 0,
          scores: {
            strength: 0,
            explosivePower: 0,
            cardio: 0,
            muscleMass: 0,
            bodyFat: 0,
          },
          history: [],
          testInputs: {},
          friends: [],
          friendRequests: [],
          blockedUsers: [],
          ladderScore: 0,
          ladderRank: 0,
          ladderHistory: [],
          isGuest: false,
          lastActive: new Date().toISOString(),
          city: '',
          job_category: '',
          gym_name: '',
          rpg_class: '',
          subscription: (() => {
            const isEarlyBird = checkEarlyBirdStatus();
            const isEarlyAdopter = isEarlyBird;
            console.log(
              `✅ [Phase 1-5] 新用戶註冊: isEarlyAdopter=${isEarlyAdopter} (${isEarlyBird ? 'Joined before deadline' : 'Joined after deadline'})`
            );
            return {
              status: 'active',
              isEarlyAdopter: isEarlyAdopter,
            };
          })(),
          rpgStats: {
            lastGachaDate: null,
            totalExp: 0,
            level: 1,
          },
        };

        console.log('儲存初始用戶數據:', initialUserData);
        await setDoc(userRef, initialUserData);
        console.log('用戶數據已儲存，文檔 ID:', user.uid);
      } else {
        console.log('嘗試登入用戶:', email);
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(
          '登入成功，用戶:',
          userCredential.user.email,
          'UID:',
          userCredential.user.uid
        );
      }

      const user = userCredential.user;
      console.log('調用 onLogin 回調函數');
      onLogin(user.email, password);

      if (rememberMe) {
        console.log('儲存帳號到 localStorage:', email);
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
      } else {
        console.log('清除 localStorage 中的帳號');
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }

      setTimeout(() => {
        console.log('導航到 /user-info');
        navigate('/user-info');
      }, 500);
    } catch (error) {
      console.error('登入/註冊失敗:', error.code, error.message);

      let userFriendlyError = error.message;
      if (error.code === 'auth/user-not-found') {
        userFriendlyError = '找不到此電子郵件帳號，請檢查是否輸入正確或先註冊';
      } else if (error.code === 'auth/wrong-password') {
        userFriendlyError = '密碼錯誤，請重新輸入';
      } else if (error.code === 'auth/invalid-email') {
        userFriendlyError = '電子郵件格式不正確';
      } else if (error.code === 'auth/weak-password') {
        userFriendlyError = '密碼強度不足，請使用至少6個字符';
      } else if (error.code === 'auth/email-already-in-use') {
        userFriendlyError = '此電子郵件已被使用，請直接登入或使用其他郵箱註冊';
      }

      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    await performLogin();
  };

  const handleSocialLogin = () => {
    console.log('社交登入成功，導航到 /user-info');
    navigate('/user-info');
  };

  const handleSocialError = errorMessage => {
    setError(errorMessage);
  };

  const handleGuestMode = () => {
    sessionStorage.setItem('guestMode', 'true');
    navigate('/user-info');
  };

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyPolicyViewed', 'true');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isRegistering,
    setIsRegistering,
    loading,
    rememberMe,
    setRememberMe,
    showPrivacyPolicy,
    setShowPrivacyPolicy,
    handleEmailInvalid,
    handlePasswordInvalid,
    handleSubmit,
    handleSocialLogin,
    handleSocialError,
    handleGuestMode,
    handlePrivacyAccept,
    t,
    i18n,
  };
}

