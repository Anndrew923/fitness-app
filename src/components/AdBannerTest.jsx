import { useState } from 'react';
import AdBanner from './AdBanner';
import AdMobConfigDebug from './AdMobConfigDebug';
import { shouldShowAd, getAdUnitId } from '../config/adConfig';
import './AdBannerTest.css';

const AdBannerTest = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showDebug, setShowDebug] = useState(true);

  // 測試頁面列表
  const testPages = [
    { key: 'home', name: '首頁', description: '不顯示廣告' },
    { key: 'strength', name: '力量評測', description: '有評測結果時顯示' },
    { key: 'cardio', name: '心肺評測', description: '有評測結果時顯示' },
    { key: 'history', name: '歷史記錄', description: '有歷史數據時顯示' },
    { key: 'community', name: '社群頁面', description: '內容豐富，顯示廣告' },
    { key: 'userInfo', name: '用戶資訊', description: '不顯示廣告' },
    { key: 'settings', name: '設定頁面', description: '不顯示廣告' },
  ];

  // 模擬頁面內容
  const getPageContent = pageKey => {
    const contentMap = {
      home: '歡迎使用最強肉體健身評測應用程式',
      strength:
        '力量評測結果：您的握力為 45kg，屬於中等水平。建議增加上肢力量訓練。',
      cardio:
        '心肺評測結果：您的最大攝氧量為 35ml/kg/min，屬於良好水平。建議維持有氧運動。',
      history: '歷史記錄：您已完成 15 次評測，平均分數為 75 分。',
      community:
        '社群動態：用戶分享了最新的健身心得和訓練計劃，包含詳細的訓練方法和營養建議。',
      userInfo: '用戶資訊：姓名、年齡、身高、體重等基本資料',
      settings: '設定選項：通知、隱私、語言等設定',
    };
    return contentMap[pageKey] || '頁面內容';
  };

  // 檢查是否應該顯示廣告
  const shouldShow = shouldShowAd(currentPage, 'bottom');
  const adUnitId = getAdUnitId('bottom');

  return (
    <div className="ad-banner-test">
      <div className="test-header">
        <h2>🧪 AdBanner 組件測試</h2>
        <button
          className="debug-toggle"
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? '隱藏' : '顯示'} 調試信息
        </button>
      </div>

      {showDebug && (
        <div className="debug-section">
          <AdMobConfigDebug />
        </div>
      )}

      <div className="test-controls">
        <h3>📋 頁面選擇</h3>
        <div className="page-buttons">
          {testPages.map(page => (
            <button
              key={page.key}
              className={`page-btn ${currentPage === page.key ? 'active' : ''}`}
              onClick={() => setCurrentPage(page.key)}
            >
              <span className="page-name">{page.name}</span>
              <span className="page-desc">{page.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="test-content">
        <div className="page-info">
          <h3>
            📄 當前頁面：{testPages.find(p => p.key === currentPage)?.name}
          </h3>
          <p className="page-description">
            {testPages.find(p => p.key === currentPage)?.description}
          </p>
          <div className="page-content">
            <strong>頁面內容：</strong>
            <p>{getPageContent(currentPage)}</p>
          </div>
        </div>

        <div className="ad-status">
          <h4>🎯 廣告狀態</h4>
          <div className="status-item">
            <span className="label">是否顯示廣告：</span>
            <span className={`value ${shouldShow ? 'success' : 'warning'}`}>
              {shouldShow ? '是' : '否'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">廣告單元 ID：</span>
            <span className="value">{adUnitId || '未設置'}</span>
          </div>
        </div>
      </div>

      <div className="ad-preview">
        <h3>📱 廣告預覽</h3>
        <div className="ad-container">
          <AdBanner position="bottom" showAd={shouldShow} isFixed={false} />
        </div>
      </div>

      <div className="test-notes">
        <h4>📝 測試說明</h4>
        <ul>
          <li>切換不同頁面查看廣告顯示邏輯</li>
          <li>開發環境會顯示測試廣告位置</li>
          <li>生產環境會載入真實 AdMob 廣告</li>
          <li>合規檢查會根據頁面內容決定是否顯示廣告</li>
        </ul>
      </div>
    </div>
  );
};

export default AdBannerTest;
