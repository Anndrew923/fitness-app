import { useEffect, useMemo, useState, useRef } from 'react';
import { useUser } from '../UserContext';
import './HistoryPage.css';
import { useTranslation } from 'react-i18next';
import logger from '../utils/logger';

function History() {
  const { userData, setUserData } = useUser();
  const { t, i18n } = useTranslation();
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
        const locale =
          i18n.language && i18n.language.startsWith('zh') ? 'zh-TW' : 'en-US';
        return date.toLocaleDateString(locale, {
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
          ).toFixed(2)
        );
      })
      .reverse();

    const strengthScores = recentHistory
      .map(record => (record.scores?.strength || 0).toFixed(2))
      .reverse();

    const explosiveScores = recentHistory
      .map(record => (record.scores?.explosivePower || 0).toFixed(2))
      .reverse();

    const cardioScores = recentHistory
      .map(record => (record.scores?.cardio || 0).toFixed(2))
      .reverse();

    const muscleMassScores = recentHistory
      .map(record => (record.scores?.muscleMass || 0).toFixed(2))
      .reverse();

    const bodyFatScores = recentHistory
      .map(record => (record.scores?.bodyFat || 0).toFixed(2))
      .reverse();

    return {
      labels,
      datasets: [
        {
          label: t('history.chart.options.total'),
          data: totalScores,
          color: '#28a745',
          key: 'total',
        },
        {
          label: t('history.chart.options.strength'),
          data: strengthScores,
          color: '#007bff',
          key: 'strength',
        },
        {
          label: t('history.chart.options.explosive'),
          data: explosiveScores,
          color: '#ffc107',
          key: 'explosive',
        },
        {
          label: t('history.chart.options.cardio'),
          data: cardioScores,
          color: '#dc3545',
          key: 'cardio',
        },
        {
          label: t('history.chart.options.muscle'),
          data: muscleMassScores,
          color: '#6f42c1',
          key: 'muscle',
        },
        {
          label: t('history.chart.options.ffmi'),
          data: bodyFatScores,
          color: '#fd7e14',
          key: 'ffmi',
        },
      ],
    };
  }, [sortedHistory, t, i18n.language]);

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
      // ✅ 優化：使用 logger 替代 console.log，符合日誌優化規範
      logger.debug('History.js - userData:', userData);
      logger.debug('History.js - sortedHistory:', sortedHistory);
      logger.debug('History.js - 記錄數量:', recordCount, '/', maxRecords);
      logger.debug('History.js - 當前頁面:', currentPage, '/', totalPages);
      hasLoggedRef.current = true; // 標記已經載入過
    }
  }, [userData, sortedHistory, recordCount, currentPage, totalPages]); // 只在 userData 變化時執行，避免重複載入

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

    logger.debug('History.js - 已刪除所選紀錄');
  };

  // 分頁導航
  const goToPage = page => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // 渲染折線圖
  const renderChart = () => {
    if (!chartData) return null;

    // 檢測是否為手機版
    // const isMobile = window.innerWidth <= 768;

    // 固定X軸和Y軸字體大小為18px
    const axisFontSize = 18;
    const axisFontWeight = '600';

    // 圖例字體大小保持響應式
    // const legendFontSize = isMobile ? 12 : 14;
    // const legendFontWeight = isMobile ? '500' : '600';

    // 獲取當前選中的數據集
    const selectedDataset = chartData.datasets.find(
      dataset => dataset.key === selectedChartData
    );

    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>{t('history.chart.title')}</h3>
          <div className="chart-note">{t('history.chart.note')}</div>
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
      <h1>{t('history.title')}</h1>

      {/* 上半部：數據表格 */}
      <div className="history-table-section">
        {sortedHistory.length > 0 ? (
          <>
            {/* 分數圖例 */}
            <div className="score-legend">
              <h4>{t('history.legendTitle')}</h4>
              <div className="legend-items">
                <span className="legend-item score-excellent">
                  {t('history.legendExcellent')}
                </span>
                <span className="legend-item score-good">
                  {t('history.legendGood')}
                </span>
                <span className="legend-item score-fair">
                  {t('history.legendFair')}
                </span>
                <span className="legend-item score-poor">
                  {t('history.legendPoor')}
                </span>
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
                    <span className="desktop-text">
                      {t('history.table.date')}
                    </span>
                  </th>
                  <th className="score-col">
                    <span className="icon">💪</span>
                    <span className="desktop-text">
                      {t('history.table.strength')}
                    </span>
                  </th>
                  <th className="score-col">
                    <span className="icon">⚡</span>
                    <span className="desktop-text">
                      {t('history.table.explosive')}
                    </span>
                  </th>
                  <th
                    className={`score-col ${
                      !showAllColumns ? 'mobile-hidden' : ''
                    }`}
                  >
                    <span className="icon">❤️</span>
                    <span className="desktop-text">
                      {t('history.table.cardio')}
                    </span>
                  </th>
                  <th
                    className={`score-col ${
                      !showAllColumns ? 'mobile-hidden' : ''
                    }`}
                  >
                    <span className="icon">🥩</span>
                    <span className="desktop-text">
                      {t('history.table.muscle')}
                    </span>
                  </th>
                  <th
                    className={`score-col ${
                      !showAllColumns ? 'mobile-hidden' : ''
                    }`}
                  >
                    <span className="icon">📊</span>
                    <span className="desktop-text">
                      {t('history.table.ffmi')}
                    </span>
                  </th>
                  <th className="average-col">
                    <span className="icon">🏆</span>
                    <span className="desktop-text">
                      {t('history.table.total')}
                    </span>
                  </th>
                  {showDeleteOptions && (
                    <th className="select-col">{t('history.table.select')}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((record, index) => {
                  const globalIndex = startIndex + index;
                  const scores = record.scores || {};
                  const avgScore =
                    record.averageScore ||
                    (
                      Object.values(scores)
                        .filter(s => s > 0)
                        .reduce((sum, s) => sum + s, 0) /
                      Object.values(scores).filter(s => s > 0).length
                    ).toFixed(2) ||
                    0;

                  return (
                    <tr key={record.id || globalIndex}>
                      <td
                        className={`date-cell ${
                          showAllColumns ? 'mobile-hidden' : ''
                        }`}
                      >
                        {record.date ||
                          new Date(record.timestamp).toLocaleDateString(
                            i18n.language && i18n.language.startsWith('zh')
                              ? 'zh-TW'
                              : 'en-US'
                          )}
                      </td>
                      <td
                        className={`score-cell ${getScoreClass(
                          scores.strength || 0
                        )}`}
                      >
                        {(scores.strength || 0).toFixed(2)}
                      </td>
                      <td
                        className={`score-cell ${getScoreClass(
                          scores.explosivePower || 0
                        )}`}
                      >
                        {(scores.explosivePower || 0).toFixed(2)}
                      </td>
                      <td
                        className={`score-cell ${
                          !showAllColumns ? 'mobile-hidden' : ''
                        } ${getScoreClass(scores.cardio || 0)}`}
                      >
                        {(scores.cardio || 0).toFixed(2)}
                      </td>
                      <td
                        className={`score-cell ${
                          !showAllColumns ? 'mobile-hidden' : ''
                        } ${getScoreClass(scores.muscleMass || 0)}`}
                      >
                        {(scores.muscleMass || 0).toFixed(2)}
                      </td>
                      <td
                        className={`score-cell ${
                          !showAllColumns ? 'mobile-hidden' : ''
                        } ${getScoreClass(scores.bodyFat || 0)}`}
                      >
                        {(scores.bodyFat || 0).toFixed(2)}
                      </td>
                      <td className={`average-cell ${getScoreClass(avgScore)}`}>
                        <strong>{Number(avgScore).toFixed(2)}</strong>
                      </td>
                      {showDeleteOptions && (
                        <td className="select-cell">
                          <input
                            type="checkbox"
                            className="history-checkbox"
                            checked={selectedRecords.includes(globalIndex)}
                            onChange={() => handleSelectRecord(globalIndex)}
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
                  {t('history.pagination.prev')}
                </button>
                <span className="page-info">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  {t('history.pagination.next')}
                </button>
              </div>
            )}

            <div className="action-buttons">
              {/* 手機版展開按鈕 */}
              <button
                onClick={() => setShowAllColumns(!showAllColumns)}
                className="toggle-delete-btn mobile-toggle-btn"
              >
                {showAllColumns
                  ? t('history.mobileToggle.showDate')
                  : t('history.mobileToggle.showAll')}
              </button>
            </div>

            {/* 記錄數量統計和限制提醒 - 移動到這裡 */}
            {sortedHistory.length > 0 && (
              <div className="history-stats">
                <div className="stats-and-actions">
                  <div className="record-count">
                    <span className="count-label">
                      {t('history.count.label')}
                    </span>
                    <span
                      className={`count-value ${
                        isNearLimit ? 'near-limit' : ''
                      } ${isAtLimit ? 'at-limit' : ''}`}
                    >
                      {recordCount} / {maxRecords}
                    </span>
                  </div>

                  {/* 清理資料按鈕移到這裡，與記錄數量左右排列 */}
                  <div className="action-buttons">
                    <button
                      onClick={toggleDeleteOptions}
                      className={`toggle-delete-btn ${
                        showDeleteOptions
                          ? 'cancel-delete-btn'
                          : 'edit-mode-btn'
                      }`}
                    >
                      {showDeleteOptions
                        ? t('history.actions.cancel')
                        : t('history.actions.clear')}
                    </button>
                    {showDeleteOptions && (
                      <button
                        onClick={handleDeleteSelected}
                        className="toggle-delete-btn delete-selected-btn"
                      >
                        {t('history.actions.deleteSelected')}
                      </button>
                    )}
                  </div>
                </div>

                {isNearLimit && !isAtLimit && (
                  <div className="limit-warning">
                    {t('history.count.nearLimit')}
                  </div>
                )}

                {isAtLimit && (
                  <div className="limit-error">
                    {t('history.count.atLimit')}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="no-history">
            <h3>{t('history.empty.title')}</h3>
            <p>{t('history.empty.p1')}</p>
            <p>{t('history.empty.p2')}</p>
          </div>
        )}
      </div>

      {/* 下半部：折線圖 */}
      {sortedHistory.length > 0 && renderChart()}
    </div>
  );
}

export default History;
