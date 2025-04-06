import { useLocation } from 'react-router-dom';

function FFMI() {
  const location = useLocation();
  const { gender, height, weight, age } = location.state || {};

  return (
    <div className="ffmi">
      <h1>FFMI評測</h1>
      <p>性別：{gender || '未選擇'}</p>
      <p>身高：{height || '未輸入'} 公分</p>
      <p>體重：{weight || '未輸入'} 公斤</p>
      <p>年齡：{age || '未輸入'}</p>
      <p>請輸入您的體脂肪率數據（未來實作）</p>
    </div>
  );
}

export default FFMI;