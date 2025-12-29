import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../UserContext';
import { useStaleDataCheck } from '../hooks/useStaleDataCheck';
import BottomNavBar from '../components/BottomNavBar';
import AdBanner from '../components/AdBanner';
import '../components/UserInfo/userinfo.css'; // 重用樣式

function SkillTreePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userData } = useUser();
  const [tooltip, setTooltip] = useState({
    show: false,
    message: '',
    x: 0,
    y: 0,
  });

  // 檢查各評測項目的數據是否過期
  const muscleStale = useStaleDataCheck(userData, 'muscle');
  const strengthStale = useStaleDataCheck(userData, 'strength');

  const handleNavigation = useCallback(
    async path => {
      if (
        !userData.height ||
        !userData.weight ||
        !userData.age ||
        !userData.gender
      ) {
        alert(t('userInfo.modals.basicInfoRequired.message'));
        return;
      }

      // 傳遞當前路徑作為狀態，以便返回時知道從哪裡來
      navigate(path, { state: { from: '/skill-tree' } });
    },
    [userData, navigate, t]
  );

  const handleStaleIndicatorClick = (e, message) => {
    e.stopPropagation();
    if (message) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        show: true,
        message,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      // 3秒後自動關閉
      setTimeout(
        () => setTooltip({ show: false, message: '', x: 0, y: 0 }),
        3000
      );
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        height: '100dvh',
        background: 'linear-gradient(135deg, #81d8d0 0%, #5f9ea0 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))', // Navbar (60px) + Ad (60px) = 120px
        boxSizing: 'border-box',
        overflowY: 'auto',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        zIndex: 1,
        padding: '10px 15px',
        paddingTop: '10px',
      }}
    >
      {/* 標題區域 */}
      <div
        style={{
          textAlign: 'center',
          padding: '20px 15px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 8px 0',
            textShadow:
              '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
          }}
        >
          <span
            style={{
              textShadow:
                '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
            }}
          >
            🔮
          </span>{' '}
          {t('skillTree.title')}
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
          }}
        >
          {t('skillTree.description')}
        </p>
      </div>

      {/* 評測頁面導航 */}
      <div
        className="test-buttons-section"
        style={{ position: 'relative', zIndex: 2 }}
      >
        <h3 className="section-title">{t('skillTree.startTests')}</h3>
        <div className="test-buttons-grid">
          <button
            onClick={() => handleNavigation('/strength')}
            className="test-btn strength-btn"
            style={{ position: 'relative' }}
          >
            {strengthStale.isStale && (
              <span
                className="stale-indicator"
                onClick={e =>
                  handleStaleIndicatorClick(e, strengthStale.message)
                }
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  border: '2px solid white',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                title={strengthStale.message}
              />
            )}
            <span className="test-icon">💪</span>
            <span className="test-label">{t('tests.strength')}</span>
          </button>
          <button
            onClick={() => handleNavigation('/explosive-power')}
            className="test-btn explosive-btn"
          >
            <span className="test-icon">⚡</span>
            <span className="test-label">{t('tests.explosivePower')}</span>
          </button>
          <button
            onClick={() => handleNavigation('/cardio')}
            className="test-btn cardio-btn"
          >
            <span className="test-icon">❤️</span>
            <span className="test-label">{t('tests.cardio')}</span>
          </button>
          <button
            onClick={() => handleNavigation('/muscle-mass')}
            className="test-btn muscle-btn"
            style={{ position: 'relative' }}
          >
            {muscleStale.isStale && (
              <span
                className="stale-indicator"
                onClick={e => handleStaleIndicatorClick(e, muscleStale.message)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  border: '2px solid white',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                title={muscleStale.message}
              />
            )}
            <span className="test-icon">🥩</span>
            <span className="test-label">{t('tests.muscleMass')}</span>
          </button>
          <button
            onClick={() => handleNavigation('/body-fat')}
            className="test-btn bodyfat-btn"
          >
            <span className="test-icon">📊</span>
            <span className="test-label">{t('tests.bodyFat')}</span>
          </button>
          <button
            onClick={() => handleNavigation('/arm-size')}
            className="test-btn arm-size-btn"
          >
            <span className="test-icon">🦾</span>
            <span className="test-label">{t('tests.armSize')}</span>
          </button>
        </div>

        {/* Tooltip 顯示過期提示 */}
        {tooltip.show && (
          <div
            style={{
              position: 'fixed',
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              maxWidth: '280px',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              marginBottom: '8px',
            }}
          >
            {tooltip.message}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(0, 0, 0, 0.9)',
              }}
            />
          </div>
        )}
      </div>

      {/* ⚠️ 安全墊片：確保最後一個按鈕滑到底時，離廣告有距離 */}
      {/* 計算：Navbar Height (60px) + Ad Height (60px) + Safety Buffer (30px) = 150px */}
      <div style={{ height: '160px', width: '100%' }} />

      {/* 廣告組件 (層級 Z-Index 需低於 Navbar 但高於背景) */}
      <div
        style={{
          position: 'fixed',
          bottom: '60px', // BottomNavBar 高度約 60px
          width: '100%',
          zIndex: 90, // 低於 BottomNavBar (通常 z-index 100+)
          left: 0,
          right: 0,
        }}
      >
        <AdBanner position="bottom" isFixed={true} showAd={true} />
      </div>

      <BottomNavBar />
    </div>
  );
}

export default SkillTreePage;
