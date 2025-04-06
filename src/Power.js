// src/Power.js
import { useNavigate } from 'react-router-dom';

function Power() {
  const navigate = useNavigate();
  return (
    <div className="power">
      <h1>爆發力測試</h1>
      <p>尚未實作</p>
      <button onClick={() => navigate('/user-info')}>返回總覽</button>
    </div>
  );
}

export default Power;