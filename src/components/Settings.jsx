import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { deleteUser } from 'firebase/auth';
import { useUser } from '../UserContext';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import LanguageSwitcher from './LanguageSwitcher';
import BottomNavBar from './BottomNavBar';
import { useTranslation } from 'react-i18next';
import AdminSystem from '../utils/adminSystem';

function Settings() {
  const navigate = useNavigate();
  const { clearUserData } = useUser();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { t, i18n } = useTranslation();
  const isZh = i18n.language && i18n.language.toLowerCase().startsWith('zh');
  const tr = (key, zh, en) => {
    const s = t(key);
    return s === key ? (isZh ? zh : en) : s;
  };

  const isLoggedIn = useMemo(() => !!auth.currentUser, []);

  // 檢查管理員狀態
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await AdminSystem.checkAdminStatus();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('檢查管理員狀態失敗:', error);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleOpenPrivacy = useCallback(() => {
    setShowPrivacy(true);
  }, []);

  const handleResetPrivacyConsent = useCallback(() => {
    localStorage.removeItem('privacyAcceptedV1');
    setShowPrivacy(true);
    setMessage(t('settings.msgResetConsent'));
  }, []);

  const handleCheckPWAUpdate = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          setMessage(t('settings.msgCheckedUpdate'));
          return;
        }
      }
      setMessage(t('settings.msgNoSW'));
    } catch (error) {
      console.error('檢查更新失敗:', error);
      setMessage(t('settings.msgCheckUpdateFail'));
    }
  }, []);

  const handleExportLocalData = useCallback(() => {
    try {
      const data = localStorage.getItem('userData');
      const blob = new Blob([data || '{}'], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'userData.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('導出數據失敗:', error);
      setMessage(t('settings.msgExportFail'));
    }
  }, []);

  const handleClearLocalData = useCallback(() => {
    try {
      localStorage.removeItem('userData');
      localStorage.removeItem('lastSavedUserData');
      localStorage.removeItem('ladderSubmissionState');
      setMessage(t('settings.msgClearedLocal'));
    } catch (error) {
      console.error('清除數據失敗:', error);
      setMessage(t('settings.msgClearFail'));
    }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (!isLoggedIn) {
      setMessage(t('settings.msgPleaseLogin'));
      navigate('/login');
      return;
    }

    const confirm1 = window.confirm(t('settings.deleteConfirm'));
    if (!confirm1) return;

    // 二段式密碼確認
    const password = window.prompt(t('settings.passwordPrompt'));
    if (!password || password.trim() === '') {
      setMessage('');
      return;
    }

    try {
      const email = auth.currentUser?.email;
      if (!email) throw new Error(t('settings.msgNeedRelogin'));
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('密碼驗證失敗:', error);
      setMessage(t('settings.msgPasswordVerifyFail'));
      navigate('/login');
      return;
    }

    setBusy(true);
    setMessage(t('settings.msgDeleting'));

    try {
      const uid = auth.currentUser.uid;
      // 刪除 Storage 頭像（忽略錯誤）
      try {
        const avatarRef = ref(storage, `avatars/${uid}/avatar.jpg`);
        await deleteObject(avatarRef);
      } catch (error) {
        console.warn('刪除頭像失敗:', error);
      }

      // 刪除 Firestore 用戶文檔
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (error) {
        console.warn('刪除用戶文檔失敗:', error);
      }

      // 刪除 Auth 帳號（需要近期登入）
      try {
        await deleteUser(auth.currentUser);
      } catch (error) {
        if (error?.code === 'auth/requires-recent-login') {
          setMessage(t('settings.msgNeedReloginToDelete'));
          navigate('/login');
          return;
        }
        throw error;
      }

      // 清理本地狀態
      clearUserData();
      setMessage(t('settings.msgDeleted'));
      navigate('/');
    } catch (error) {
      console.error('刪除帳號失敗:', error);
      setMessage(t('settings.msgDeleteFail'));
    } finally {
      setBusy(false);
    }
  }, [isLoggedIn, navigate, clearUserData]);

  return (
    <div style={{ padding: '16px', paddingBottom: '96px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
        {t('settings.title')}
      </h1>

      {message && (
        <div style={{ marginBottom: '12px', color: '#2d6a4f' }}>{message}</div>
      )}

      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>
          {t('settings.privacySection')}
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleOpenPrivacy}>
            {t('settings.viewPrivacy')}
          </button>
          <button onClick={handleResetPrivacyConsent}>
            {t('settings.resetConsent')}
          </button>
          <button onClick={handleExportLocalData}>
            {t('settings.exportLocal')}
          </button>
          <button onClick={handleClearLocalData}>
            {t('settings.clearLocal')}
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>
          {t('settings.languageSection')}
        </h2>
        <LanguageSwitcher />
      </section>

      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>
          {t('settings.pwaSection')}
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleCheckPWAUpdate}>
            {t('settings.checkUpdate')}
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>
          {t('settings.dataSection')}
        </h2>
        <div style={{ color: '#555', marginBottom: '8px' }}>
          {t('settings.loginStatus')}：
          {isLoggedIn ? t('common.loggedIn') : t('common.loggedOut')}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/privacy-policy')}>
            {t('settings.toPrivacyPage')}
          </button>
          <button onClick={() => navigate('/terms')}>
            {tr('navigation.terms', '使用條款', 'Terms')}
          </button>
          <button onClick={() => navigate('/features')}>
            {tr('navigation.features', '功能介紹', 'Features')}
          </button>
          <button onClick={() => navigate('/about')}>
            {tr('navigation.about', '關於', 'About')}
          </button>
          <button onClick={() => navigate('/disclaimer')}>
            {tr('navigation.disclaimer', '免責聲明', 'Disclaimer')}
          </button>
          <button onClick={() => navigate('/contact')}>
            {tr('navigation.contact', '聯絡我們', 'Contact')}
          </button>
          {isLoggedIn && (
            <button onClick={handleDeleteAccount} disabled={busy}>
              {busy ? t('common.deleting') : t('settings.deleteAccountDanger')}
            </button>
          )}
        </div>
      </section>

      {/* 管理員功能入口 */}
      {!checkingAdmin && isAdmin && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>
            管理員功能
          </h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                background: 'linear-gradient(135deg, #81d8d0 0%, #5f9ea0 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              🔧 管理員系統
            </button>
          </div>
        </section>
      )}

      <PrivacyPolicyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        onAccept={() => {
          localStorage.setItem('privacyAcceptedV1', 'true');
          setShowPrivacy(false);
          setMessage('');
        }}
      />
      <BottomNavBar />
    </div>
  );
}

export default Settings;
