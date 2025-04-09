// src/Welcome.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  // 模擬加載，3秒後跳轉到 Home 頁
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home'); // 始終跳轉到 /home
    }, 3000); // 3秒後跳轉

    return () => clearTimeout(timer); // 清理計時器
  }, [navigate]);

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">歡迎體驗健身評測</h1>
        <p className="welcome-subtitle">探索你的身體潛能，開啟健康新旅程！</p>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;

// 歡迎頁 CSS
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

  .loading-bar {
    width: 200px;
    height: 8px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    overflow: hidden;
    margin: 0 auto;
  }

  .loading-progress {
    width: 0;
    height: 100%;
    background-color: #4bc0c0; /* 與按鈕顏色一致 */
    animation: loading 3s linear forwards;
  }

  /* 淡入動畫 */
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  /* 讀取條動畫 */
  @keyframes loading {
    0% { width: 0; }
    100% { width: 100%; }
  }

  @media (max-width: 767px) {
    .welcome-title {
      font-size: 2rem;
    }

    .welcome-subtitle {
      font-size: 1.2rem;
    }

    .loading-bar {
      width: 150px;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);