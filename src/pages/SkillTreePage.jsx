import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../UserContext';
import BottomNavBar from '../components/BottomNavBar';
import '../components/UserInfo/userinfo.css'; // 重用樣式

function SkillTreePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userData } = useUser();

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

  return (
    <div className="user-info-container">
      {/* 標題區域 */}
      <div
        style={{
          textAlign: 'center',
          padding: '20px 15px',
          marginBottom: '20px',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2d3748',
            margin: '0 0 8px 0',
          }}
        >
          🔮 {t('skillTree.title') || '天賦技能樹'}
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(45, 55, 72, 0.7)',
            margin: 0,
          }}
        >
          {t('skillTree.description') ||
            '完成各項評測，解鎖你的戰鬥潛能'}
        </p>
      </div>

      {/* 評測頁面導航 */}
      <div className="test-buttons-section">
        <h3 className="section-title">
          {t('userInfo.startTests') || '開始評測'}
        </h3>
        <div className="test-buttons-grid">
          <button
            onClick={() => handleNavigation('/strength')}
            className="test-btn strength-btn"
          >
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
          >
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
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}

export default SkillTreePage;

