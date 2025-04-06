import { useLocation, useNavigate } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function Overview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gender, height, weight, age, strengthScore } = location.state || {};

  const radarData = {
    labels: ['力量', '心肺能力', '爆發力', '骨骼肌肉量', 'FFMI'],
    datasets: [
      {
        label: '您的評測分數',
        data: [strengthScore || 0, 0, 0, 0, 0], // 力量分數更新，其他暫為0
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
      },
    },
    plugins: {
      legend: { position: 'top' },
    },
  };

  const handleNavigation = (path) => {
    navigate(path, { state: { gender, height, weight, age, strengthScore } });
  };

  return (
    <div className="overview">
      <h1>您的資訊總覽</h1>
      <p>性別：{gender || '未選擇'}</p>
      <p>身高：{height ? `${height} 公分` : '未輸入'}</p>
      <p>體重：{weight ? `${weight} 公斤` : '未輸入'}</p>
      <p>年齡：{age || '未輸入'}</p>
      <div className="radar-chart">
        <Radar data={radarData} options={radarOptions} />
      </div>
      <button onClick={() => handleNavigation('/strength')}>力量評測</button>
      <button onClick={() => handleNavigation('/cardio')}>心肺能力</button>
      <button onClick={() => handleNavigation('/power')}>爆發力</button>
      <button onClick={() => handleNavigation('/muscle')}>骨骼肌肉量</button>
      <button onClick={() => handleNavigation('/ffmi')}>FFMI</button>
    </div>
  );
}

export default Overview;