// src/Muscle.js
import { useNavigate } from 'react-router-dom';

function Muscle() {
  const navigate = useNavigate();
  return (
    <div className="muscle">
      <h1>骨骼肌肉量</h1>
      <p>尚未實作</p>
      <button onClick={() => navigate('/user-info')}>返回總覽</button>
    </div>
  );
}

export default Muscle;