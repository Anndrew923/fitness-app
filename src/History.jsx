import { useEffect, useMemo, useState } from 'react';
import { useUser } from './UserContext';
import './History.css'; // 引入外部 CSS

function History() {
  const { userData, setUserData } = useUser();
  const history = useMemo(() => userData?.history || [], [userData]);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showAllColumns, setShowAllColumns] = useState(false);

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
    console.log('History.js - userData:', userData);
    console.log('History.js - history:', history);
  }, [userData, history]);

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
    const newHistory = history.filter(
      (_, index) => !selectedRecords.includes(index)
    );
    localStorage.setItem('history', JSON.stringify(newHistory));
    setUserData({ ...userData, history: newHistory });
    setShowDeleteOptions(false);
    setSelectedRecords([]);
    console.log('History.js - 已刪除所選紀錄');
  };

  return (
    <div className="history-container">
      <h1>歷史紀錄</h1>
      {history.length > 0 ? (
        <>
          {/* 分數圖例 */}
          <div className="score-legend">
            <h4>🎯 分數解讀</h4>
            <div className="legend-items">
              <span className="legend-item score-excellent">80+ 優秀</span>
              <span className="legend-item score-good">60-79 良好</span>
              <span className="legend-item score-fair">40-59 一般</span>
              <span className="legend-item score-poor">1-39 待加強</span>
              <span className="legend-item score-none">0 未測</span>
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
              {history.map((record, index) => {
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
                  <tr key={index}>
                    <td
                      className={`date-cell ${
                        showAllColumns ? 'mobile-hidden' : ''
                      }`}
                    >
                      {record.date ||
                        new Date(record.timestamp).toLocaleDateString('zh-TW')}
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
          <div className="action-buttons">
            {/* 手機版展開按鈕 */}
            <button
              onClick={() => setShowAllColumns(!showAllColumns)}
              className="toggle-delete-btn mobile-toggle-btn"
            >
              {showAllColumns ? '顯示日期 📅' : '顯示所有指標 📊'}
            </button>

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
        </>
      ) : (
        <div className="no-history">
          <h3>📋 尚無歷史紀錄</h3>
          <p>完成評測後，您的紀錄就會出現在這裡</p>
          <p>開始您的健身評測之旅吧！</p>
        </div>
      )}
    </div>
  );
}

export default History;
