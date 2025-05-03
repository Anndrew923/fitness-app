import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 引入 useLocation
import { useUser } from './UserContext';
import { auth } from './firebase';

function Home() {
  const navigate = useNavigate();
  const location = useLocation(); // 獲取當前路由
  const { userData, setUserData, isGuestMode } = useUser();

  // 檢查 userData.gender 是否已設置
  useEffect(() => {
    console.log(
      'Home.js - 當前模式:',
      isGuestMode ? '訪客模式' : '登入模式',
      'auth.currentUser:',
      auth.currentUser
    );
    console.log('Home.js - 當前路由:', location.pathname);
    console.log('Home.js - userData.gender:', userData.gender);

    // 僅在當前路由為 /home 時執行導航
    if (
      location.pathname === '/home' &&
      (userData.gender === 'male' || userData.gender === 'female')
    ) {
      console.log('性別已設置，導航到 /user-info');
      navigate('/user-info', { replace: true }); // 使用 replace 避免導航堆疊
    }
  }, [userData.gender, navigate, isGuestMode, location]);

  const handleGenderSelect = gender => {
    console.log('Home.js - 選擇性別:', gender);
    setUserData(prev => ({ ...prev, gender }));
    navigate('/user-info');
  };

  return (
    <div className="home-container">
      <h1 className="home-title">選擇您的性別</h1>
      <div className="button-section">
        <button
          onClick={() => handleGenderSelect('male')}
          className="gender-btn male-btn"
        >
          男性
        </button>
        <button
          onClick={() => handleGenderSelect('female')}
          className="gender-btn female-btn"
        >
          女性
        </button>
      </div>
    </div>
  );
}

export default Home;

// CSS 保持不變
const styles = `
  .home-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f9fafb;
    min-height: 100vh;
    width: 100vw;
    box-sizing: border-box;
  }

  .home-title {
    font-size: 6vw;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 2rem;
    text-align: center;
  }

  .button-section {
    width: 90%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .gender-btn {
    width: 100%;
    max-width: 300px;
    padding: 1rem;
    font-size: 4.5vw;
    font-weight: 500;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .gender-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .male-btn {
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
  }

  .male-btn:hover {
    background: linear-gradient(90deg, #2563eb, #3b82f6);
  }

  .female-btn {
    background: linear-gradient(90deg, #ec4899, #f472b6);
  }

  .female-btn:hover {
    background: linear-gradient(90deg, #db2777, #ec4899);
  }

  @media (min-width: 768px) {
    .home-title {
      font-size: 2.5rem;
    }
    .button-section {
      gap: 2rem;
      padding: 2.5rem;
    }
    .gender-btn {
      font-size: 1.25rem;
      padding: 1.25rem;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
