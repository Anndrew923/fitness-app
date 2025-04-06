import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function UserInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gender } = location.state || {};

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = () => {
    if (height && weight && age) {
      navigate('/overview', { state: { gender, height, weight, age } });
    } else {
      alert('請填寫所有欄位！');
    }
  };

  return (
    <div className="user-info">
      <h1>輸入您的資訊</h1>
      <p>您選擇的性別：{gender || '未選擇'}</p>
      <input
        type="number"
        placeholder="身高 (公分)"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
      />
      <input
        type="number"
        placeholder="體重 (公斤)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <input
        type="number"
        placeholder="年齡"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}

export default UserInfo;