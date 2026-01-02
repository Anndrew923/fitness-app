import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function StrengthRadarChart({ radarData }) {
  const { t } = useTranslation();

  return (
    <div className="radar-chart-card">
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>

      <h3>📈 {t('tests.strengthTitle')}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid
            gridType="polygon"
            stroke="rgba(129, 216, 208, 0.25)"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <PolarAngleAxis
            dataKey="name"
            tick={{
              fontSize: 13,
              fill: '#2d3748',
              fontWeight: 700,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fontSize: 12,
              fill: '#2d3748',
              fontWeight: 600,
            }}
          />
          <Radar
            name={t('tests.score')}
            dataKey="value"
            stroke="#81D8D0"
            fill="url(#strengthTiffanyGradient)"
            fillOpacity={0.8}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <LabelList
              dataKey="rawValue"
              position="top"
              formatter={value => {
                if (value > 100) {
                  return value.toFixed(1);
                }
                return null;
              }}
            />
          </Radar>
          <Tooltip
            formatter={(value, name, props) => {
              const rawValue = props.payload.rawValue;
              if (rawValue && rawValue > 100) {
                return [`真實分數: ${rawValue.toFixed(1)}`, name];
              }
              return [value.toFixed(1), name];
            }}
          />
          <defs>
            <linearGradient
              id="strengthTiffanyGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#81D8D0" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#5F9EA0" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#81D8D0" stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

StrengthRadarChart.propTypes = {
  radarData: PropTypes.array.isRequired,
};

export default StrengthRadarChart;

