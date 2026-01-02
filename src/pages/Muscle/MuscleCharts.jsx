import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';

export default function MuscleCharts({ result }) {
  const { t } = useTranslation();

  const barData1 = [
    { name: t('tests.muscleLabels.smmShort'), value: result.smmScore || 0 },
    {
      name: t('tests.muscleLabels.smPercentShort'),
      value: result.smPercentScore || 0,
    },
  ];

  const barData2 = [
    { name: t('tests.muscleLabels.finalScore'), value: result.finalScore || 0 },
  ];

  return (
    <div className="chart-section">
      <h2 className="result-title">
        {t('tests.muscleLabels.numbersComparison')}
      </h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData1} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={{
                value: t('tests.muscleLabels.chartName'),
                position: 'insideBottom',
                offset: -5,
              }}
            />
            <YAxis
              domain={[0, 'dataMax']}
              label={{
                value: t('tests.muscleLabels.chartScore'),
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="value"
              fill="#4bc0c0"
              name={t('tests.muscleLabels.chartScore')}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-4">
        {t('tests.muscleLabels.finalScore')}
      </h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData2} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={{
                value: t('tests.muscleLabels.chartName'),
                position: 'insideBottom',
                offset: -5,
              }}
            />
            <YAxis
              domain={[0, 'dataMax']}
              label={{
                value: t('tests.muscleLabels.chartScore'),
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="#36a2eb"
              name={t('tests.muscleLabels.chartScore')}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

