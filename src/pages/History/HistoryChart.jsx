import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HistoryChart({ chartData, selectedChartData, setSelectedChartData }) {
  const { t } = useTranslation();

  if (!chartData) return null;

  const axisFontSize = 18;
  const axisFontWeight = '600';
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
          {[...Array(6)].map((_, i) => {
            const value = i * 20;
            const y = 720 - (value * 480) / 100;
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

          {[...Array(6)].map((_, i) => {
            const value = i * 20;
            const y = 720 - (value * 480) / 100;
            return (
              <text
                key={`y-label-${i}`}
                x="30"
                y={y + 6}
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
}

