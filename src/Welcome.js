import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { auth } from './firebase';

function Welcome({ onLogin, setIsGuestMode }) { // 接受 onLogin 和 setIsGuestMode 作為 props
  const navigate = useNavigate();
  const { setUserData } = useUser();

  const handleGuestMode = () => {
    console.log('Welcome handleGuestMode 觸發');
    setIsGuestMode(true); // 設置為訪客模式
    // 重置 userData
    setUserData({
      gender: '',
      height: 0,
      weight: 0,
      age: 0,
      scores: {
        strength: 0,
        explosivePower: 0,
        cardio: 0,
        muscleMass: 0,
        bodyFat: 0,
      },
    });
    if (auth.currentUser) {
      auth.signOut();
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login'); // 跳轉到登入頁面
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">歡迎體驗健身評測</h1>
        <p className="welcome-subtitle">探索你的身體潛能，開啟健康新旅程！</p>
        <div className="button-group-mode">
          <div className="button-with-tooltip">
            <button onClick={handleGuestMode} className="mode-btn guest-btn">
              訪客模式
            </button>
            <span className="tooltip">僅儲存到本地，重新整理後可能遺失</span>
          </div>
          <div className="button-with-tooltip">
            <button onClick={handleLoginRedirect} className="mode-btn login-btn">
              登入模式
            </button>
            <span className="tooltip">將數據保存到雲端，隨時隨地訪問</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;

// 歡迎頁 CSS（添加按鈕樣式，移除加載條）
const styles = `
  .welcome-container {
    position: relative;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('https://images.unsplash.com/photo-1502224562085-639556652f33?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'); /* 跑道背景圖 */
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .welcome-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); /* 深色遮罩 */
  }

  .welcome-content {
    position: relative;
    text-align: center;
    color: white;
    z-index: 1;
  }

  .welcome-title {
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 1rem;
    animation: fadeIn 1.5s ease-in-out;
  }

  .welcome-subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    animation: fadeIn 2s ease-in-out;
  }

  .button-group-mode {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .mode-btn {
    width: 100%;
    padding: 0.75rem;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .guest-btn {
    background-color: #4bc0c0;
  }

  .guest-btn:hover {
    background-color: #3aa0a0;
  }

  .login-btn {
    background-color: #ff6f61;
  }

  .login-btn:hover {
    background-color: #e65a50;
  }

  .button-with-tooltip {
    position: relative;
    width: 100%;
  }

  .tooltip {
    visibility: hidden;
    width: 200px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.75rem;
  }

  .button-with-tooltip:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }

  /* 淡入動畫 */
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 767px) {
    .welcome-title {
      font-size: 2rem;
    }

    .welcome-subtitle {
      font-size: 1.2rem;
    }

    .button-group-mode {
      gap: 0.75rem;
    }
  }

  @media (min-width: 768px) {
    .button-group-mode {
      flex-direction: row;
      gap: 1rem;
    }

    .button-with-tooltip {
      width: 48%;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);