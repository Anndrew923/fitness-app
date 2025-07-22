import { useEffect, useMemo, useState, useRef } from 'react';
import { useUser } from './UserContext';
import './History.css'; // 引入外部 CSS

function History() {
  const { userData, setUserData } = useUser();
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [selectedChartData, setSelectedChartData] = useState('total'); // 預設顯示總分
  const hasLoggedRef = useRef(false); // 追蹤是否已經載入過

  // 歷史記錄排序：最新的記錄在最上方
  const sortedHistory = useMemo(() => {
    const history = userData?.history || [];
    return [...history].sort((a, b) => {
      // 優先使用 timestamp，如果沒有則使用 date
      const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
      const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.date);
      return dateB - dateA; // 降序排列，最新的在前
    });
  }, [userData?.history]);

  // 分頁計算
  const totalPages = Math.ceil(sortedHistory.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = sortedHistory.slice(startIndex, endIndex);

  // 記錄數量統計
  const recordCount = sortedHistory.length;
  const maxRecords = 50;
  const isNearLimit = recordCount >= maxRecords * 0.8; // 80% 時開始提醒
  const isAtLimit = recordCount >= maxRecords;

  // 準備折線圖數據
  const chartData = useMemo(() => {
    if (sortedHistory.length === 0) return null;

    // 只取最新6次數據
    const recentHistory = sortedHistory.slice(0, 6);

    const labels = recentHistory
      .map(record => {
        const date = record.timestamp
          ? new Date(record.timestamp)
          : new Date(record.date);
        return date.toLocaleDateString('zh-TW', {
          month: 'numeric',
          day: 'numeric',
        });
      })
      .reverse(); // 反轉，讓時間軸從左到右

    const totalScores = recentHistory
      .map(record => {
        const scores = record.scores || {};
        return (
          record.averageScore ||
          (
            Object.values(scores)
              .filter(s => s > 0)
              .reduce((sum, s) => sum + s, 0) /
            Object.values(scores).filter(s => s > 0).length
          ).toFixed(1)
        );
      })
      .reverse();

    const strengthScores = recentHistory
      .map(record => (record.scores?.strength || 0).toFixed(1))
      .reverse();

    const explosiveScores = recentHistory
      .map(record => (record.scores?.explosivePower || 0).toFixed(1))
      .reverse();

    const cardioScores = recentHistory
      .map(record => (record.scores?.cardio || 0).toFixed(1))
      .reverse();

    const muscleMassScores = recentHistory
      .map(record => (record.scores?.muscleMass || 0).toFixed(1))
      .reverse();

    const bodyFatScores = recentHistory
      .map(record => (record.scores?.bodyFat || 0).toFixed(1))
      .reverse();

    return {
      labels,
      datasets: [
        { label: '總分', data: totalScores, color: '#28a745', key: 'total' },
        {
          label: '力量',
          data: strengthScores,
          color: '#007bff',
          key: 'strength',
        },
        {
          label: '爆發力',
          data: explosiveScores,
          color: '#ffc107',
          key: 'explosive',
        },
        { label: '心肺', data: cardioScores, color: '#dc3545', key: 'cardio' },
        {
          label: '肌肉量',
          data: muscleMassScores,
          color: '#6f42c1',
          key: 'muscle',
        },
        { label: 'FFMI', data: bodyFatScores, color: '#fd7e14', key: 'ffmi' },
      ],
    };
  }, [sortedHistory]);

  // 根據分數返回樣式類別
  const getScoreClass = score => {
    const numScore = Number(score);
    if (numScore >= 80) return 'score-excellent';
    if (numScore >= 60) return 'score-good';
    if (numScore >= 40) return 'score-fair';
    if (numScore > 0) return 'score-poor';
    return 'score-none';
  };

  useEffect(() => {
    if (userData && !hasLoggedRef.current) {
      console.log('History.js - userData:', userData);
      console.log('History.js - sortedHistory:', sortedHistory);
      console.log('History.js - 記錄數量:', recordCount, '/', maxRecords);
      console.log('History.js - 當前頁面:', currentPage, '/', totalPages);
      hasLoggedRef.current = true; // 標記已經載入過
    }
  }, [userData]); // 只在 userData 變化時執行，避免重複載入

  const toggleDeleteOptions = () => {
    setShowDeleteOptions(!showDeleteOptions);
    setSelectedRecords([]);
  };

  const handleSelectRecord = index => {
    if (selectedRecords.includes(index)) {
      setSelectedRecords(selectedRecords.filter(i => i !== index));
    } else {
      setSelectedRecords([...selectedRecords, index]);
    }
  };

  const handleDeleteSelected = () => {
    // 根據排序後的索引刪除原始記錄
    const newHistory = sortedHistory.filter(
      (_, index) => !selectedRecords.includes(index)
    );

    // 更新用戶數據
    setUserData({ ...userData, history: newHistory });
    setShowDeleteOptions(false);
    setSelectedRecords([]);

    // 重置頁面到第一頁
    setCurrentPage(1);

    console.log('History.js - 已刪除所選紀錄');
  };

  // 分頁導航
  const goToPage = page => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // 渲染折線圖
  const renderChart = () => {
    if (!chartData) return null;

    // 檢測是否為手機版
    const isMobile = window.innerWidth <= 768;

    // 固定X軸和Y軸字體大小為18px
    const axisFontSize = 18;
    const axisFontWeight = '600';

    // 圖例字體大小保持響應式
    const legendFontSize = isMobile ? 12 : 14;
    const legendFontWeight = isMobile ? '500' : '600';

    // 獲取當前選中的數據集
    const selectedDataset = chartData.datasets.find(
      dataset => dataset.key === selectedChartData
    );

    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>📈 數據趨勢圖</h3>
          <div className="chart-note">顯示最近六次數據</div>
          <div className="chart-selector">
            <select
              value={selectedChartData}
              onChange={e => setSelectedChartData(e.target.value)}
              className="chart-select"
            >
              {chartData.datasets.map(dataset => (
                <option key={dataset.key} value={dataset.key}>
                  {dataset.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="chart-wrapper">
          <svg className="chart" viewBox={`0 0 800 800`}>
            {/* 網格線 */}
            {[...Array(6)].map((_, i) => {
              const value = i * 20;
              const y = 720 - (value * 480) / 100; // 使用與數據點相同的計算方式
              return (
                <line
                  key={`grid-y-${i}`}
                  x1="50"
                  y1={y}
                  x2="750"
                  y2={y}
                  stroke="#dee2e6"
                  strokeWidth="1"
                />
              );
            })}

            {/* 數據線 - 只顯示選中的數據集 */}
            {selectedDataset && (
              <g key={selectedDataset.label}>
                <polyline
                  points={selectedDataset.data
                    .map((value, index) => {
                      const x =
                        50 + (index * 700) / (chartData.labels.length - 1);
                      const y = 720 - (value * 480) / 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke={selectedDataset.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 數據點 */}
                {selectedDataset.data.map((value, index) => {
                  const x = 50 + (index * 700) / (chartData.labels.length - 1);
                  const y = 720 - (value * 480) / 100;
                  return (
                    <circle
                      key={`point-${index}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill={selectedDataset.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            )}

            {/* X軸標籤 */}
            {chartData.labels.map((label, index) => {
              const x = 50 + (index * 700) / (chartData.labels.length - 1);
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y="780"
                  textAnchor="middle"
                  fontSize={axisFontSize}
                  fontWeight={axisFontWeight}
                  fill="#495057"
                >
                  {label}
                </text>
              );
            })}

            {/* Y軸標籤 */}
            {[...Array(6)].map((_, i) => {
              const value = i * 20;
              const y = 720 - (value * 480) / 100; // 使用與數據點相同的計算方式
              return (
                <text
                  key={`y-label-${i}`}
                  x="30"
                  y={y + 6} // 加上6px的偏移，讓文字垂直居中對齊
                  textAnchor="end"
                  fontSize={axisFontSize}
                  fontWeight={axisFontWeight}
                  fill="#495057"
                >
                  {value}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="history-container">
      <h1>歷史紀錄</h1>

      {/* 上半部：數據表格 */}
      <div className="history-table-section">
        {sortedHistory.length > 0 ? (
          <>
            {/* 分數圖例 */}
            <div className="score-legend">
              <h4>🎯 分數解讀</h4>
              <div className="legend-items">
                <span className="legend-item score-excellent">80+ 優秀</span>
                <span className="legend-item score-good">60-79 良好</span>
                <span className="legend-item score-fair">40-59 一般</span>
                <span className="legend-item score-poor">1-39 待加強</span>
              </div>
            </div>

            <table className="history-table">
              <thead>
                <tr>
                  <th
                    className={`date-col ${
                      showAllColumns ? 'mobile-hidden' : ''
                    }`}
                  >
                    <span className="icon">📅</span>
                    <span className="desktop-text">日期</span>
                  </th>
                  <th className="score-col">
                    <span className="icon">💪</span>
                    <span className="desktop-text">力量</span>
                  </th>
                  <th className="score-col">
                    <span className="icon">⚡</span>
                    <span className="desktop-text">爆發力</span>
                  </th>
                  <th
                    className={`score-col ${
                      !showAllColumns ? 'mobile-hidden' : ''
                    }`}
                  >
                    <span className="icon">❤️</span>
                    <span className="desktop-text">心肺</span>
                  </th>
                  <th
                    className={`score-col ${
                      !showAllColumns ? 'mobile-hidden' : ''
                    }`}
                  >
                    <span className="icon">🥩</span>
                    <span className="desktop-text">肌肉量</span>
                  </th>
                  <th
                    className={`score-col ${
                      !showAllColumns ? 'mobile-hidden' : ''
                    }`}
                  >
                    <span className="icon">📊</span>
                    <span className="desktop-text">FFMI</span>
                  </th>
                  <th className="average-col">
                    <span className="icon">🏆</span>
                    <span className="desktop-text">總分</span>
                  </th>
                  {showDeleteOptions && <th className="select-col">選擇</th>}
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((record, index) => {
                  const scores = record.scores || {};
                  const avgScore =
                    record.averageScore ||
                    (
                      Object.values(scores)
                        .filter(s => s > 0)
                        .reduce((sum, s) => sum + s, 0) /
                      Object.values(scores).filter(s => s > 0).length
                    ).toFixed(1) ||
                    0;

                  return (
                    <tr key={record.id || index}>
                      <td
                        className={`date-cell ${
                          showAllColumns ? 'mobile-hidden' : ''
                        }`}
                      >
                        {record.date ||
                          new Date(record.timestamp).toLocaleDateString(
                            'zh-TW'
                          )}
                      </td>
                      <td
                        className={`score-cell ${getScoreClass(
                          scores.strength || 0
                        )}`}
                      >
                        {(scores.strength || 0).toFixed(1)}
                      </td>
                      <td
                        className={`score-cell ${getScoreClass(
                          scores.explosivePower || 0
                        )}`}
                      >
                        {(scores.explosivePower || 0).toFixed(1)}
                      </td>
                      <td
                        className={`score-cell ${
                          !showAllColumns ? 'mobile-hidden' : ''
                        } ${getScoreClass(scores.cardio || 0)}`}
                      >
                        {(scores.cardio || 0).toFixed(1)}
                      </td>
                      <td
                        className={`score-cell ${
                          !showAllColumns ? 'mobile-hidden' : ''
                        } ${getScoreClass(scores.muscleMass || 0)}`}
                      >
                        {(scores.muscleMass || 0).toFixed(1)}
                      </td>
                      <td
                        className={`score-cell ${
                          !showAllColumns ? 'mobile-hidden' : ''
                        } ${getScoreClass(scores.bodyFat || 0)}`}
                      >
                        {(scores.bodyFat || 0).toFixed(1)}
                      </td>
                      <td className={`average-cell ${getScoreClass(avgScore)}`}>
                        <strong>{Number(avgScore).toFixed(1)}</strong>
                      </td>
                      {showDeleteOptions && (
                        <td className="select-cell">
                          <input
                            type="checkbox"
                            className="history-checkbox"
                            checked={selectedRecords.includes(index)}
                            onChange={() => handleSelectRecord(index)}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 分頁控制 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← 上一頁
                </button>
                <span className="page-info">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  下一頁 →
                </button>
              </div>
            )}

            <div className="action-buttons">
              {/* 手機版展開按鈕 */}
              <button
                onClick={() => setShowAllColumns(!showAllColumns)}
                className="toggle-delete-btn mobile-toggle-btn"
              >
                {showAllColumns ? '顯示日期 📅' : '顯示所有指標 📊'}
              </button>
            </div>
          </>
        ) : (
          <div className="no-history">
            <h3>📋 尚無歷史紀錄</h3>
            <p>完成評測後，您的紀錄就會出現在這裡</p>
            <p>開始您的健身評測之旅吧！</p>
          </div>
        )}
      </div>

      {/* 下半部：折線圖 */}
      {sortedHistory.length > 0 && renderChart()}

      {/* 記錄數量統計和限制提醒 - 放在折線圖底下 */}
      {sortedHistory.length > 0 && (
        <div className="history-stats">
          <div className="stats-and-actions">
            <div className="record-count">
              <span className="count-label">📊 記錄數量：</span>
              <span
                className={`count-value ${isNearLimit ? 'near-limit' : ''} ${
                  isAtLimit ? 'at-limit' : ''
                }`}
              >
                {recordCount} / {maxRecords}
              </span>
            </div>

            {/* 清理資料按鈕移到這裡，與記錄數量左右排列 */}
            <div className="action-buttons">
              <button
                onClick={toggleDeleteOptions}
                className={`toggle-delete-btn ${
                  showDeleteOptions ? 'cancel-delete-btn' : 'edit-mode-btn'
                }`}
              >
                {showDeleteOptions ? '取消' : '清理資料'}
              </button>
              {showDeleteOptions && (
                <button
                  onClick={handleDeleteSelected}
                  className="toggle-delete-btn delete-selected-btn"
                >
                  刪除所選
                </button>
              )}
            </div>
          </div>

          {isNearLimit && !isAtLimit && (
            <div className="limit-warning">
              ⚠️ 記錄數量接近上限，建議清理舊記錄
            </div>
          )}

          {isAtLimit && (
            <div className="limit-error">
              🚫 記錄數量已達上限，無法新增記錄，請先清理舊記錄
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default History;
