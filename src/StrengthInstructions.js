import { useLocation, useNavigate } from 'react-router-dom';

function StrengthInstructions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gender, height, weight, age } = location.state || {};

  return (
    <div className="strength-instructions">
      <h1>力量動作說明</h1>
      <p>性別：{gender || '未選擇'}</p>
      <p>身高：{height || '未輸入'} 公分</p>
      <p>體重：{weight || '未輸入'} 公斤</p>
      <p>年齡：{age || '未輸入'}</p>

      <h2>臥推</h2>
      <p>
        說明：平躺在臥推椅上，雙手握住槓鈴，緩慢下放至胸前，然後推起。（圖片待補充）
      </p>

      <h2>深蹲</h2>
      <p>
        說明：站立，槓鈴置於肩膀後方，膝蓋彎曲下蹲至大腿與地面平行，然後站起。（圖片待補充）
      </p>

      <h2>硬舉</h2>
      <p>
        說明：站立，槓鈴置於地面，彎腰握住槓鈴，保持背部平直，提起槓鈴至髖部。（圖片待補充）
      </p>

      <h2>引體向上（或滑輪下拉）</h2>
      <p>
        說明：引體向上：懸掛於單槓，雙手握住單槓，拉動身體至下巴超過單槓。滑輪下拉：坐於滑輪機前，拉下槓桿至胸前。（圖片待補充）
      </p>

      <h2>站姿肩推</h2>
      <p>
        說明：站立，槓鈴置於胸前，雙手握住，向上推至手臂伸直，然後緩慢放下。（圖片待補充）
      </p>

      <button
        onClick={() =>
          navigate('/strength', { state: { gender, height, weight, age } })
        }
      >
        返回力量評測
      </button>
    </div>
  );
}

export default StrengthInstructions;
