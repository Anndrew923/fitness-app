import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './Welcome.css';

function Welcome({ onLogin }) {
  const navigate = useNavigate();
  const { clearUserData } = useUser();

  const handleLoginRedirect = () => {
    clearUserData();
    navigate('/login');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">歡迎來到評測小能手</h1>
        <p className="welcome-subtitle">留下運動數據，進步多少馬上知道</p>
        <div className="button-group-mode">
          <div className="button-with-tooltip">
            <button
              onClick={handleLoginRedirect}
              className="mode-btn login-btn"
            >
              登入
            </button>
            <span className="tooltip">將數據保存到雲端，隨時隨地訪問</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;