import { useState } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import './SocialLogin.css';

function SocialLogin({ onLogin, onError }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const authProvider = new GoogleAuthProvider();
      authProvider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;

      console.log('Google 登入成功:', user.email);

      // 檢查用戶是否已存在
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // 新用戶，創建初始資料
        const initialUserData = {
          email: user.email,
          userId: user.uid,
          nickname: user.displayName || user.email.split('@')[0],
          avatarUrl: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          friends: [],
          friendRequests: [],
          blockedUsers: [],
          ladderScore: 0,
          ladderRank: 0,
          ladderHistory: [],
          isGuest: false,
          lastActive: new Date().toISOString(),
        };

        await setDoc(userRef, initialUserData);
        console.log('新用戶資料已創建');
      }

      onLogin(user.email, null); // 社交登入不需要密碼
    } catch (error) {
      console.error('Google 登入失敗:', error);

      let errorMessage = '登入失敗';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = '登入視窗被關閉，請重試';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = '彈出視窗被阻擋，請允許彈出視窗後重試';
      } else if (
        error.code === 'auth/account-exists-with-different-credential'
      ) {
        errorMessage = '此電子郵件已被其他方式註冊，請使用原註冊方式登入';
      } else {
        errorMessage = `登入失敗：${error.message}`;
      }

      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="social-login-container">
      <div className="divider">
        <span>或</span>
      </div>

      <div className="social-buttons">
        <button
          type="button"
          className="social-btn google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? '處理中...' : '使用 Google 登入'}
        </button>
      </div>
    </div>
  );
}

SocialLogin.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default SocialLogin;
