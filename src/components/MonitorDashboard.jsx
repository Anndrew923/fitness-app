import React, { useState, useEffect } from 'react';
import './MonitorDashboard.css';

const MonitorDashboard = () => {
  const [metrics, setMetrics] = useState({
    admobEarnings: 0,
    adLoadSuccess: 0,
    adLoadFailure: 0,
    pageLoadTime: 0,
    adRenderTime: 0,
    memoryUsage: 0,
    errorCount: 0,
    alertCount: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({
    admobAppId: '',
    admobBannerId: '',
    enabled: false,
    testMode: false,
  });

  // 模擬實時數據更新
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        admobEarnings: prev.admobEarnings + Math.random() * 0.1,
        adLoadSuccess: prev.adLoadSuccess + (Math.random() > 0.2 ? 1 : 0),
        adLoadFailure: prev.adLoadFailure + (Math.random() > 0.8 ? 1 : 0),
        pageLoadTime: Math.random() * 2000 + 500,
        adRenderTime: Math.random() * 1000 + 200,
        memoryUsage: Math.random() * 50 + 20,
        errorCount: prev.errorCount + (Math.random() > 0.9 ? 1 : 0),
        alertCount: prev.alertCount + (Math.random() > 0.95 ? 1 : 0),
      }));

      // 添加日誌條目
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: Math.random() > 0.8 ? 'error' : 'info',
        message: Math.random() > 0.5 ? '廣告載入成功' : '系統運行正常',
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]); // 保持最近 50 條
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // 載入配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // 這裡應該從實際的配置 API 載入
        setConfig({
          admobAppId: import.meta.env.VITE_ADMOB_APP_ID || '未設置',
          admobBannerId: import.meta.env.VITE_ADMOB_BANNER_ID || '未設置',
          enabled: import.meta.env.VITE_ADMOB_ENABLED === 'true',
          testMode: import.meta.env.VITE_ADMOB_TEST_MODE === 'true',
        });
      } catch (error) {
        console.error('載入配置失敗:', error);
      }
    };

    loadConfig();
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    setLogs(prev => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: '監控已啟動',
      },
      ...prev,
    ]);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setLogs(prev => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: '監控已停止',
      },
      ...prev,
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      logs: logs.slice(0, 10), // 導出最近 10 條日誌
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitor-report-${
      new Date().toISOString().split('T')[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const successRate =
    metrics.adLoadSuccess + metrics.adLoadFailure > 0
      ? (
          (metrics.adLoadSuccess /
            (metrics.adLoadSuccess + metrics.adLoadFailure)) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="monitor-dashboard">
      <div className="dashboard-header">
        <h1>📊 AdMob 監控儀表板</h1>
        <div className="dashboard-controls">
          <button
            className={`control-btn ${isMonitoring ? 'stop' : 'start'}`}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            {isMonitoring ? '⏹️ 停止監控' : '▶️ 開始監控'}
          </button>
          <button className="control-btn export" onClick={exportReport}>
            📄 導出報告
          </button>
          <button className="control-btn clear" onClick={clearLogs}>
            🗑️ 清空日誌
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* 狀態卡片 */}
        <div className="status-cards">
          <div className="status-card earnings">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <div className="card-title">AdMob 收益</div>
              <div className="card-value">
                ${metrics.admobEarnings.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="status-card success-rate">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <div className="card-title">廣告載入成功率</div>
              <div className="card-value">{successRate}%</div>
            </div>
          </div>

          <div className="status-card performance">
            <div className="card-icon">⚡</div>
            <div className="card-content">
              <div className="card-title">頁面載入時間</div>
              <div className="card-value">
                {metrics.pageLoadTime.toFixed(0)}ms
              </div>
            </div>
          </div>

          <div className="status-card errors">
            <div className="card-icon">🔍</div>
            <div className="card-content">
              <div className="card-title">錯誤數量</div>
              <div className="card-value">{metrics.errorCount}</div>
            </div>
          </div>
        </div>

        {/* 配置管理 */}
        <div className="config-panel">
          <h3>⚙️ 配置管理</h3>
          <div className="config-items">
            <div className="config-item">
              <label>AdMob 應用程式 ID:</label>
              <span
                className={config.admobAppId === '未設置' ? 'error' : 'success'}
              >
                {config.admobAppId}
              </span>
            </div>
            <div className="config-item">
              <label>AdMob 廣告單元 ID:</label>
              <span
                className={
                  config.admobBannerId === '未設置' ? 'error' : 'success'
                }
              >
                {config.admobBannerId}
              </span>
            </div>
            <div className="config-item">
              <label>廣告啟用狀態:</label>
              <span className={config.enabled ? 'success' : 'warning'}>
                {config.enabled ? '已啟用' : '未啟用'}
              </span>
            </div>
            <div className="config-item">
              <label>測試模式:</label>
              <span className={config.testMode ? 'warning' : 'success'}>
                {config.testMode ? '測試模式' : '生產模式'}
              </span>
            </div>
          </div>
        </div>

        {/* 性能指標圖表 */}
        <div className="performance-panel">
          <h3>📊 性能指標</h3>
          <div className="performance-metrics">
            <div className="metric-item">
              <div className="metric-label">廣告渲染時間</div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{
                    width: `${Math.min(metrics.adRenderTime / 10, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="metric-value">
                {metrics.adRenderTime.toFixed(0)}ms
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-label">記憶體使用</div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{
                    width: `${Math.min(metrics.memoryUsage * 2, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="metric-value">
                {metrics.memoryUsage.toFixed(1)}MB
              </div>
            </div>
          </div>
        </div>

        {/* 實時日誌 */}
        <div className="logs-panel">
          <h3>📝 實時日誌</h3>
          <div className="logs-container">
            {logs.length === 0 ? (
              <div className="no-logs">暫無日誌</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`log-entry ${log.type}`}>
                  <span className="log-time">{log.timestamp}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 警報面板 */}
      {metrics.alertCount > 0 && (
        <div className="alerts-panel">
          <h3>🚨 警報 ({metrics.alertCount})</h3>
          <div className="alert-list">
            {metrics.errorCount > 0 && (
              <div className="alert-item error">
                <span className="alert-icon">❌</span>
                <span className="alert-message">
                  發現 {metrics.errorCount} 個錯誤
                </span>
              </div>
            )}
            {successRate < 80 && (
              <div className="alert-item warning">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">
                  廣告載入成功率過低: {successRate}%
                </span>
              </div>
            )}
            {metrics.pageLoadTime > 2000 && (
              <div className="alert-item warning">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">
                  頁面載入時間過長: {metrics.pageLoadTime.toFixed(0)}ms
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorDashboard;
