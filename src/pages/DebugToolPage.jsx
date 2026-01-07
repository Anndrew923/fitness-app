import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../UserContext';
import { usePayCat } from '../hooks/usePayCat';
import MarketModal from '../components/shared/modals/MarketModal';
import logger from '../utils/logger';
import './DebugToolPage.css';

/**
 * Phase 1-6: Debug Tool - Central Core Data Simulation Laboratory
 * Temporary testing page for manual state switching and MarketModal testing
 */
const DebugToolPage = () => {
  const { t } = useTranslation();
  const { userData, setUserData } = useUser();
  const payCat = usePayCat(userData);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [requiredSeals, setRequiredSeals] = useState(0);

  // Local state for testing (doesn't modify real userData until apply)
  const [testState, setTestState] = useState({
    userType: 'basic', // 'basic' | 'hybrid' | 'monster'
    isPro: userData?.subscription?.status === 'pro' || false,
    isEarlyAdopter: userData?.subscription?.isEarlyAdopter || false,
    honorSeals: userData?.honorSeals || 0,
    monthlySeals: userData?.monthlySeals || 0,
    scores: userData?.scores || {},
  });

  // Calculate required seals based on test scores
  const sealCalculation = useMemo(() => {
    const testScores = {
      ladderScore: testState.scores.ladderScore || 0,
      ...testState.scores,
    };
    return payCat.calculateRequiredSeals(testScores);
  }, [testState.scores, payCat]);

  // User type presets
  const userTypePresets = {
    basic: {
      name: '基礎型',
      scores: {
        strength: 50,
        explosivePower: 50,
        cardio: 50,
        muscleMass: 50,
        bodyFat: 50,
        ladderScore: 50,
      },
      description: '平均分數 50，適合測試基礎功能',
    },
    hybrid: {
      name: '混合型',
      scores: {
        strength: 85,
        explosivePower: 75,
        cardio: 90,
        muscleMass: 80,
        bodyFat: 85,
        ladderScore: 83,
      },
      description: '高分混合型，觸發 rank_exam 推薦（2 枚）',
    },
    monster: {
      name: '怪物型',
      scores: {
        strength: 120,
        explosivePower: 110,
        cardio: 115,
        muscleMass: 125,
        bodyFat: 130,
        ladderScore: 120,
      },
      description: '超過 100 分，觸發 limit_break 推薦（3 枚）',
    },
  };

  // Apply user type preset
  const applyUserType = type => {
    const preset = userTypePresets[type];
    if (!preset) return;

    setTestState(prev => ({
      ...prev,
      userType: type,
      scores: preset.scores,
    }));

    logger.info(`🔄 [DebugTool] Applied user type: ${preset.name}`);
  };

  // Toggle Pro status
  const togglePro = () => {
    setTestState(prev => ({
      ...prev,
      isPro: !prev.isPro,
    }));
  };

  // Toggle Early Adopter status
  const toggleEarlyAdopter = () => {
    setTestState(prev => ({
      ...prev,
      isEarlyAdopter: !prev.isEarlyAdopter,
    }));
  };

  // Update seal balance
  const updateSeals = (type, delta) => {
    setTestState(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta),
    }));
  };

  // Apply test state to real userData
  const applyTestState = () => {
    const updatedData = {
      ...userData,
      subscription: {
        ...userData?.subscription,
        status: testState.isPro ? 'pro' : 'active',
        isEarlyAdopter: testState.isEarlyAdopter,
      },
      honorSeals: testState.honorSeals,
      monthlySeals: testState.monthlySeals,
      scores: {
        ...userData?.scores,
        ...testState.scores,
      },
    };

    setUserData(updatedData);
    logger.info('✅ [DebugTool] Test state applied to userData');
  };

  // Create mock userData for MarketModal
  const mockUserData = useMemo(() => {
    return {
      ...userData,
      subscription: {
        ...userData?.subscription,
        status: testState.isPro ? 'pro' : 'active',
        isEarlyAdopter: testState.isEarlyAdopter,
      },
      honorSeals: testState.honorSeals,
      monthlySeals: testState.monthlySeals,
      scores: testState.scores,
    };
  }, [userData, testState]);

  // Handle MarketModal purchase success
  const handlePurchaseSuccess = purchaseData => {
    logger.info('✅ [DebugTool] Purchase successful:', purchaseData);
    // Update test state with purchased seals
    if (purchaseData.seals) {
      setTestState(prev => ({
        ...prev,
        honorSeals: prev.honorSeals + purchaseData.seals,
      }));
    }
  };

  // Open MarketModal with calculated required seals
  const openMarketModal = () => {
    setRequiredSeals(sealCalculation.required);
    setIsMarketModalOpen(true);
  };

  // Calculate current balance
  const currentBalance = testState.honorSeals + testState.monthlySeals;

  return (
    <div className="debug-tool-page">
      <div className="debug-tool-container">
        {/* Header */}
        <div className="debug-tool-header">
          <h1 className="debug-tool-title">
            🔬 中央核心：數據模擬實驗室
          </h1>
          <p className="debug-tool-subtitle">
            Phase 1-6 測試終端 - 手動狀態切換與價格表 UI 測試
          </p>
        </div>

        {/* Status Overview */}
        <div className="debug-section">
          <h2 className="section-title">📊 當前狀態總覽</h2>
          <div className="status-grid">
            <div className="status-card">
              <span className="status-label">用戶類型</span>
              <span className="status-value">
                {userTypePresets[testState.userType]?.name || '未設定'}
              </span>
            </div>
            <div className="status-card">
              <span className="status-label">PRO 狀態</span>
              <span
                className={`status-value ${testState.isPro ? 'active' : 'inactive'}`}
              >
                {testState.isPro ? '✅ 啟用' : '❌ 停用'}
              </span>
            </div>
            <div className="status-card">
              <span className="status-label">早鳥特權</span>
              <span
                className={`status-value ${testState.isEarlyAdopter ? 'active' : 'inactive'}`}
              >
                {testState.isEarlyAdopter ? '✅ 啟用' : '❌ 停用'}
              </span>
            </div>
            <div className="status-card">
              <span className="status-label">權限金鑰餘額</span>
              <span className="status-value highlight">
                {currentBalance} 枚
              </span>
            </div>
            <div className="status-card">
              <span className="status-label">所需金鑰</span>
              <span className="status-value highlight">
                {sealCalculation.required} 枚
              </span>
            </div>
            <div className="status-card">
              <span className="status-label">推薦訂閱</span>
              <span
                className={`status-value ${sealCalculation.recommendSubscription ? 'active' : 'inactive'}`}
              >
                {sealCalculation.recommendSubscription ? '✅ 是' : '❌ 否'}
              </span>
            </div>
          </div>
        </div>

        {/* User Type Switcher */}
        <div className="debug-section">
          <h2 className="section-title">🎯 狀態切換器</h2>
          <div className="button-group">
            <button
              className={`preset-button ${testState.userType === 'basic' ? 'active' : ''}`}
              onClick={() => applyUserType('basic')}
            >
              <span className="button-icon">👤</span>
              <div className="button-content">
                <span className="button-title">基礎型</span>
                <span className="button-desc">
                  {userTypePresets.basic.description}
                </span>
              </div>
            </button>
            <button
              className={`preset-button ${testState.userType === 'hybrid' ? 'active' : ''}`}
              onClick={() => applyUserType('hybrid')}
            >
              <span className="button-icon">⚡</span>
              <div className="button-content">
                <span className="button-title">混合型</span>
                <span className="button-desc">
                  {userTypePresets.hybrid.description}
                </span>
              </div>
            </button>
            <button
              className={`preset-button ${testState.userType === 'monster' ? 'active' : ''}`}
              onClick={() => applyUserType('monster')}
            >
              <span className="button-icon">🔥</span>
              <div className="button-content">
                <span className="button-title">怪物型</span>
                <span className="button-desc">
                  {userTypePresets.monster.description}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Identity Switcher */}
        <div className="debug-section">
          <h2 className="section-title">🆔 身份切換器</h2>
          <div className="toggle-group">
            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={testState.isPro}
                  onChange={togglePro}
                  className="toggle-checkbox"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">PRO 身份</span>
              </label>
              <span className="toggle-desc">
                {testState.isPro
                  ? '每月 5 枚權限金鑰配額'
                  : '無 PRO 配額'}
              </span>
            </div>
            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={testState.isEarlyAdopter}
                  onChange={toggleEarlyAdopter}
                  className="toggle-checkbox"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">早鳥特權</span>
              </label>
              <span className="toggle-desc">
                {testState.isEarlyAdopter
                  ? '無限權限金鑰，購買直接成功'
                  : '正常消耗邏輯'}
              </span>
            </div>
          </div>
        </div>

        {/* Seal Operator */}
        <div className="debug-section">
          <h2 className="section-title">🔑 金鑰操作器</h2>
          <div className="seal-operator">
            <div className="seal-control">
              <span className="seal-label">榮譽封印 (honorSeals)</span>
              <div className="seal-buttons">
                <button
                  className="seal-btn minus"
                  onClick={() => updateSeals('honorSeals', -1)}
                >
                  −
                </button>
                <span className="seal-value">{testState.honorSeals}</span>
                <button
                  className="seal-btn plus"
                  onClick={() => updateSeals('honorSeals', 1)}
                >
                  +
                </button>
                <button
                  className="seal-btn reset"
                  onClick={() =>
                    setTestState(prev => ({ ...prev, honorSeals: 0 }))
                  }
                >
                  重置
                </button>
              </div>
            </div>
            <div className="seal-control">
              <span className="seal-label">每月配額 (monthlySeals)</span>
              <div className="seal-buttons">
                <button
                  className="seal-btn minus"
                  onClick={() => updateSeals('monthlySeals', -1)}
                >
                  −
                </button>
                <span className="seal-value">{testState.monthlySeals}</span>
                <button
                  className="seal-btn plus"
                  onClick={() => updateSeals('monthlySeals', 1)}
                >
                  +
                </button>
                <button
                  className="seal-btn reset"
                  onClick={() =>
                    setTestState(prev => ({ ...prev, monthlySeals: 0 }))
                  }
                >
                  重置
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="debug-section">
          <h2 className="section-title">⚡ UI 觸發器</h2>
          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={openMarketModal}
            >
              <span className="btn-icon">🛒</span>
              <span>開啟權限金鑰商店</span>
              {sealCalculation.required > 0 && (
                <span className="badge">
                  需 {sealCalculation.required} 枚
                </span>
              )}
            </button>
            <button
              className="action-btn secondary"
              onClick={applyTestState}
            >
              <span className="btn-icon">💾</span>
              <span>套用測試狀態到實際數據</span>
            </button>
          </div>
        </div>

        {/* Seal Calculation Info */}
        {sealCalculation.required > 0 && (
          <div className="debug-section info">
            <h2 className="section-title">ℹ️ 金鑰計算結果</h2>
            <div className="info-content">
              <p>
                <strong>所需金鑰：</strong>
                {sealCalculation.required} 枚
              </p>
              <p>
                <strong>推薦類型：</strong>
                {sealCalculation.recommendation === 'subscribe'
                  ? '訂閱菁英執照'
                  : sealCalculation.recommendation === 'limit_break'
                  ? '限制器解除認證'
                  : sealCalculation.recommendation === 'rank_exam'
                  ? '等級考試認證'
                  : '無需認證'}
              </p>
              <p>
                <strong>原因：</strong>
                {sealCalculation.reason}
              </p>
              {sealCalculation.recommendSubscription && (
                <p className="recommendation">
                  ⭐ <strong>系統建議：訂閱菁英執照以獲得最佳效益</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MarketModal */}
      <MarketModal
        isOpen={isMarketModalOpen}
        onClose={() => setIsMarketModalOpen(false)}
        userData={mockUserData}
        onPurchaseSuccess={handlePurchaseSuccess}
        requiredSeals={requiredSeals}
      />
    </div>
  );
};

export default DebugToolPage;

