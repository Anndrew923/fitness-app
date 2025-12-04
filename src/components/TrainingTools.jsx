import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// ✅ 移除：App.jsx 已經有全局的 GlobalAdBanner，不需要重複使用
// import GlobalAdBanner from './GlobalAdBanner';
import BottomNavBar from './BottomNavBar';
import './TrainingTools.css';

const TrainingTools = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tools = [
    {
      id: '1rm',
      icon: '💪',
      title: t('tools.oneRM.title') || '1RM 計算器',
      description:
        t('tools.oneRM.desc') || '根據訓練重量和次數，精準計算你的最大肌力',
      category: 'weight',
      status: 'coming-soon',
    },
    {
      id: 'rest-timer',
      icon: '⏱️',
      title: t('tools.restTimer.title') || '休息計時器',
      description:
        t('tools.restTimer.desc') || '精準控制組間休息時間，提升訓練效率',
      category: 'weight',
      status: 'available',
    },
    {
      id: 'volume-calculator',
      icon: '📊',
      title: t('tools.volumeCalculator.title') || '訓練量計算器',
      description:
        t('tools.volumeCalculator.desc') ||
        '記錄訓練動作、重量、組數，自動計算總訓練量',
      category: 'weight',
      status: 'coming-soon',
    },
    {
      id: 'exercise-library',
      icon: '📚',
      title: t('tools.exerciseLibrary.title') || '動作庫',
      description:
        t('tools.exerciseLibrary.desc') ||
        '完整動作資料庫，包含 S~D 級動作分級系統',
      category: 'weight',
      status: 'coming-soon',
    },
    {
      id: 'pace-calculator',
      icon: '🏃',
      title: t('tools.paceCalculator.title') || '配速計算器',
      description:
        t('tools.paceCalculator.desc') || '根據距離和時間，計算精準配速',
      category: 'cardio',
      status: 'coming-soon',
    },
    {
      id: 'hr-zone',
      icon: '❤️',
      title: t('tools.hrZone.title') || '心率區間計算器',
      description:
        t('tools.hrZone.desc') || '計算個人化心率訓練區間，科學化訓練',
      category: 'cardio',
      status: 'coming-soon',
    },
  ];

  const categories = [
    {
      id: 'weight',
      name: t('tools.category.weight') || '重量訓練',
      icon: '🏋️',
    },
    {
      id: 'cardio',
      name: t('tools.category.cardio') || '有氧運動',
      icon: '🏃',
    },
  ];

  return (
    <div className="training-tools-page">
      {/* ✅ 移除：App.jsx 已經有全局的 GlobalAdBanner，不需要重複使用 */}
      {/* <GlobalAdBanner /> */}

      <div className="tools-container">
        <div className="tools-header">
          <h1 className="tools-title">{t('tools.title') || '訓練工具'}</h1>
          <p className="tools-subtitle">
            {t('tools.subtitle') || '實用的訓練輔助工具，讓你的訓練更有效率'}
          </p>
        </div>

        {/* 工具分類展示 */}
        {categories.map(category => {
          const categoryTools = tools.filter(
            tool => tool.category === category.id
          );

          return (
            <div key={category.id} className="tools-category">
              <div className="category-header">
                <span className="category-icon">{category.icon}</span>
                <h2 className="category-title">{category.name}</h2>
              </div>

              <div className="tools-grid">
                {categoryTools.map(tool => (
                  <div key={tool.id} className="tool-card">
                    <div className="tool-icon">{tool.icon}</div>
                    <h3 className="tool-title">{tool.title}</h3>
                    <p className="tool-description">{tool.description}</p>
                    <div className="tool-status">
                      {tool.status === 'available' ? (
                        <button
                          className="tool-action-btn"
                          onClick={() => {
                            if (tool.id === 'rest-timer') {
                              navigate('/timer');
                            }
                          }}
                        >
                          {t('tools.action.start') || '開始計時'}
                        </button>
                      ) : (
                        <span className="status-badge coming-soon">
                          {t('tools.status.comingSoon') || '即將推出'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ 移除：App.jsx 已經有全局的 GlobalAdBanner，不需要重複使用 */}
      {/* <GlobalAdBanner /> */}
      <BottomNavBar />
    </div>
  );
};

export default TrainingTools;
