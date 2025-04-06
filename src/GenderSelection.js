import { useNavigate } from 'react-router-dom';

function GenderSelection() {
  const navigate = useNavigate();

  const handleGenderSelect = (gender) => {
    navigate('/userinfo', { state: { gender } });
  };

  return (
    <div className="gender-selection">
      <h1>歡迎使用健身評測</h1>
      <p>請選擇您的性別</p>
      <button onClick={() => handleGenderSelect('male')}>男</button>
      <button onClick={() => handleGenderSelect('female')}>女</button>
    </div>
  );
}

export default GenderSelection;