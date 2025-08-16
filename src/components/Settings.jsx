import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { deleteUser } from 'firebase/auth';
import { useUser } from '../UserContext';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import LanguageSwitcher from './LanguageSwitcher';
import BottomNavBar from './BottomNavBar';

function Settings() {
  const navigate = useNavigate();
  const { userData, clearUserData } = useUser();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const isLoggedIn = useMemo(() => !!auth.currentUser, []);

  const handleOpenPrivacy = useCallback(() => {
    setShowPrivacy(true);
  }, []);

  const handleResetPrivacyConsent = useCallback(() => {
    localStorage.removeItem('privacyAcceptedV1');
    setShowPrivacy(true);
    setMessage('已重置同意狀態');
  }, []);

  const handleCheckPWAUpdate = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          setMessage('已檢查更新');
          return;
        }
      }
      setMessage('此環境未註冊 Service Worker');
    } catch (e) {
      setMessage('檢查更新失敗');
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
    } catch (_) {
      setMessage('匯出失敗');
    }
  }, []);

  const handleClearLocalData = useCallback(() => {
    try {
      localStorage.removeItem('userData');
      localStorage.removeItem('lastSavedUserData');
      localStorage.removeItem('ladderSubmissionState');
      setMessage('已清除本機資料');
    } catch (_) {
      setMessage('清除失敗');
    }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (!isLoggedIn) {
      setMessage('請先登入');
      navigate('/login');
      return;
    }

    const confirm1 = window.confirm(
      '此操作將永久刪除帳號與雲端資料，是否繼續？'
    );
    if (!confirm1) return;

    // 二段式密碼確認
    const password = window.prompt(
      '為了您的資料安全，請輸入密碼以確認刪除（此操作不可恢復）：'
    );
    if (!password || password.trim() === '') {
      setMessage('已取消刪除');
      return;
    }

    try {
      const email = auth.currentUser?.email;
      if (!email) throw new Error('需要重新登入');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setMessage('密碼驗證失敗，請重新登入後再試');
      navigate('/login');
      return;
    }

    setBusy(true);
    setMessage('正在刪除帳號…');

    try {
      const uid = auth.currentUser.uid;
      // 刪除 Storage 頭像（忽略錯誤）
      try {
        const avatarRef = ref(storage, `avatars/${uid}/avatar.jpg`);
        await deleteObject(avatarRef);
      } catch (_) {}

      // 刪除 Firestore 用戶文檔
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (_) {}

      // 刪除 Auth 帳號（需要近期登入）
      try {
        await deleteUser(auth.currentUser);
      } catch (err) {
        if (err?.code === 'auth/requires-recent-login') {
          setMessage('需要重新登入後才能刪除帳號');
          navigate('/login');
          return;
        }
        throw err;
      }

      // 清理本地狀態
      clearUserData();
      setMessage('帳號已刪除');
      navigate('/');
    } catch (e) {
      setMessage('刪除失敗，請稍後再試');
    } finally {
      setBusy(false);
    }
  }, [isLoggedIn, navigate, clearUserData]);

  return (
    <div style={{ padding: '16px', paddingBottom: '96px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
        設定
      </h1>

      {message && (
        <div style={{ marginBottom: '12px', color: '#2d6a4f' }}>{message}</div>
      )}

      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>隱私與同意</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleOpenPrivacy}>查看隱私權政策</button>
          <button onClick={handleResetPrivacyConsent}>
            重置同意並再次顯示
          </button>
          <button onClick={handleExportLocalData}>匯出本機資料</button>
          <button onClick={handleClearLocalData}>清除本機資料</button>
        </div>
      </section>

      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>語言</h2>
        <LanguageSwitcher />
      </section>

      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>PWA</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleCheckPWAUpdate}>檢查更新</button>
        </div>
      </section>

      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>資料/同意管理</h2>
        <div style={{ color: '#555', marginBottom: '8px' }}>
          登入狀態：{isLoggedIn ? '已登入' : '未登入'}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/privacy-policy')}>
            前往隱私權政策頁
          </button>
          {isLoggedIn && (
            <button onClick={handleDeleteAccount} disabled={busy}>
              {busy ? '刪除中…' : '刪除帳號（不可恢復）'}
            </button>
          )}
        </div>
      </section>

      <PrivacyPolicyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        onAccept={() => {
          localStorage.setItem('privacyAcceptedV1', 'true');
          setShowPrivacy(false);
          setMessage('已同意隱私權政策');
        }}
      />
      <BottomNavBar />
    </div>
  );
}

export default Settings;
