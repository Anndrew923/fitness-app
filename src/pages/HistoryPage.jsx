import React, { useEffect } from 'react';
import './HistoryPage.css';
import { useTranslation } from 'react-i18next';
import logger from '../utils/logger';
import { useHistoryLogic } from '../hooks/useHistoryLogic';
import HistoryTable from './History/HistoryTable';
import HistoryChart from './History/HistoryChart';

function History() {
  const { t } = useTranslation();
  const {
    sortedHistory,
    currentRecords,
    totalPages,
    currentPage,
    recordCount,
    maxRecords,
    isNearLimit,
    isAtLimit,
    showDeleteOptions,
    selectedRecords,
    showAllColumns,
    setShowAllColumns,
    selectedChartData,
    setSelectedChartData,
    chartData,
    getScoreClass,
    toggleDeleteOptions,
    handleSelectRecord,
    handleDeleteSelected,
    goToPage,
    startIndex,
    i18n,
    hasLoggedRef,
  } = useHistoryLogic();

  useEffect(() => {
    if (hasLoggedRef.current) return;
    logger.debug('History.js - userData loaded');
    logger.debug('History.js - 記錄數量:', recordCount, '/', maxRecords);
    logger.debug('History.js - 當前頁面:', currentPage, '/', totalPages);
    hasLoggedRef.current = true;
  }, [recordCount, currentPage, totalPages]);

  return (
    <div className="history-container">
      <h1>{t('history.title')}</h1>

      <div className="history-table-section">
        {sortedHistory.length > 0 ? (
          <>
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

            <HistoryTable
              currentRecords={currentRecords}
              startIndex={startIndex}
              showAllColumns={showAllColumns}
              showDeleteOptions={showDeleteOptions}
              selectedRecords={selectedRecords}
              getScoreClass={getScoreClass}
              handleSelectRecord={handleSelectRecord}
              i18n={i18n}
            />

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
              <button
                onClick={() => setShowAllColumns(!showAllColumns)}
                className="toggle-delete-btn mobile-toggle-btn"
              >
                {showAllColumns
                  ? t('history.mobileToggle.showDate')
                  : t('history.mobileToggle.showAll')}
              </button>
            </div>

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

      {sortedHistory.length > 0 && (
        <HistoryChart
          chartData={chartData}
          selectedChartData={selectedChartData}
          setSelectedChartData={setSelectedChartData}
        />
      )}
    </div>
  );
}

export default History;
