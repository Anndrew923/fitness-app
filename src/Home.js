// src/Home.js
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

function Home() {
  const navigate = useNavigate();
  const { setUserData } = useUser();

  const handleGenderSelect = (gender) => {
    setUserData((prev) => ({ ...prev, gender }));
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

// 內聯 CSS（美化並適配手機）
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