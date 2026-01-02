import { useState, useMemo, useRef } from 'react';
import { useUser } from '../UserContext';
import logger from '../utils/logger';
import { useTranslation } from 'react-i18next';

export function useHistoryLogic() {
  const { userData, setUserData } = useUser();
  const { t, i18n } = useTranslation();
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [selectedChartData, setSelectedChartData] = useState('total');
  const hasLoggedRef = useRef(false);

  const sortedHistory = useMemo(() => {
    const history = userData?.history || [];
    return [...history].sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
      const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.date);
      return dateB - dateA;
    });
  }, [userData?.history]);

  const totalPages = Math.ceil(sortedHistory.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = sortedHistory.slice(startIndex, endIndex);

  const recordCount = sortedHistory.length;
  const maxRecords = 50;
  const isNearLimit = recordCount >= maxRecords * 0.8;
  const isAtLimit = recordCount >= maxRecords;

  const chartData = useMemo(() => {
    if (sortedHistory.length === 0) return null;

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
      .reverse();

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

  const getScoreClass = score => {
    const numScore = Number(score);
    if (numScore >= 80) return 'score-excellent';
    if (numScore >= 60) return 'score-good';
    if (numScore >= 40) return 'score-fair';
    if (numScore > 0) return 'score-poor';
    return 'score-none';
  };

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
    const newHistory = sortedHistory.filter(
      (_, index) => !selectedRecords.includes(index)
    );

    setUserData({ ...userData, history: newHistory });
    setShowDeleteOptions(false);
    setSelectedRecords([]);
    setCurrentPage(1);

    logger.debug('History.js - 已刪除所選紀錄');
  };

  const goToPage = page => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
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
    t,
    hasLoggedRef,
  };
}

