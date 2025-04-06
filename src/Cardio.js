// src/Cardio.js
import { useNavigate } from 'react-router-dom';

function Cardio() {
  const navigate = useNavigate();
  return (
    <div className="cardio">
      <h1>心肺耐力測試</h1>
      <p>尚未實作</p>
      <button onClick={() => navigate('/user-info')}>返回總覽</button>
    </div>
  );
}

export default Cardio;