import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HistoryTable({
  currentRecords,
  startIndex,
  showAllColumns,
  showDeleteOptions,
  selectedRecords,
  getScoreClass,
  handleSelectRecord,
  i18n,
}) {
  const { t } = useTranslation();

  return (
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
  );
}

