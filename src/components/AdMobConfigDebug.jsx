import { useEffect, useState } from 'react';
import { checkAdMobConfig } from '../config/adConfig';
import './AdMobConfigDebug.css';

const AdMobConfigDebug = () => {
  const [config, setConfig] = useState(null);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const { config: configData, issues: configIssues } = checkAdMobConfig();
    setConfig(configData);
    setIssues(configIssues);
  }, []);

  if (!config) {
    return <div className="admob-debug">載入配置中...</div>;
  }

  return (
    <div className="admob-debug">
      <h3>🎯 AdMob 配置狀態</h3>

      <div className="config-section">
        <h4>📋 基本配置</h4>
        <div className="config-item">
          <span className="label">應用程式 ID:</span>
          <span
            className={`value ${
              config.appId?.includes('your_') ? 'error' : 'success'
            }`}
          >
            {config.appId || '未設置'}
          </span>
        </div>
        <div className="config-item">
          <span className="label">廣告單元 ID:</span>
          <span
            className={`value ${
              config.bannerId?.includes('your_') ? 'error' : 'success'
            }`}
          >
            {config.bannerId || '未設置'}
          </span>
        </div>
        <div className="config-item">
          <span className="label">啟用狀態:</span>
          <span className={`value ${config.enabled ? 'success' : 'warning'}`}>
            {config.enabled ? '已啟用' : '未啟用'}
          </span>
        </div>
        <div className="config-item">
          <span className="label">測試模式:</span>
          <span className={`value ${config.testMode ? 'warning' : 'success'}`}>
            {config.testMode ? '測試模式' : '生產模式'}
          </span>
        </div>
        <div className="config-item">
          <span className="label">環境:</span>
          <span className="value">{config.environment}</span>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="issues-section">
          <h4>⚠️ 配置問題</h4>
          <ul>
            {issues.map((issue, index) => (
              <li key={index} className="issue-item">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {issues.length === 0 && (
        <div className="success-section">
          <h4>✅ 配置正常</h4>
          <p>AdMob 配置已正確設置，可以開始使用廣告功能。</p>
        </div>
      )}

      <div className="actions-section">
        <button
          onClick={() => window.location.reload()}
          className="refresh-btn"
        >
          🔄 重新檢查
        </button>
      </div>
    </div>
  );
};

export default AdMobConfigDebug;
