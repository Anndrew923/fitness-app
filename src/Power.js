import { useLocation } from 'react-router-dom';

function Power() {
  const location = useLocation();
  const { gender, height, weight, age } = location.state || {};

  return (
    <div className="power">
      <h1>爆發力評測</h1>
      <p>性別：{gender || '未選擇'}</p>
      <p>身高：{height || '未輸入'} 公分</p>
      <p>體重：{weight || '未輸入'} 公斤</p>
      <p>年齡：{age || '未輸入'}</p>
      <p>請輸入您的爆發力測試數據（未來實作）</p>
    </div>
  );
}

export default Power;