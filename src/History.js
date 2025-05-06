import React, { useEffect } from 'react';
import { useUser } from './UserContext';
import './styles.css';

function History() {
  const { userData } = useUser();
  const history = userData?.history || [];

  // 添加日誌以追蹤 userData 和 history
  useEffect(() => {
    console.log('History.js - userData:', userData);
    console.log('History.js - history:', history);
  }, [userData, history]);

  return (
    <div className="history-container">
      <h1 className="text-2xl font-bold text-center mb-6">歷史紀錄</h1>
      {history.length > 0 ? (
        <table className="history-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>力量</th>
              <th>爆發力</th>
              <th>心肺耐力</th>
              <th>骨骼肌肉量</th>
              <th>FFMI</th>
              <th>平均分數</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={index}>
                <td>{record.date}</td>
                <td>{record.scores?.strength || 0}</td>
                <td>{record.scores?.explosivePower || 0}</td>
                <td>{record.scores?.cardio || 0}</td>
                <td>{record.scores?.muscleMass || 0}</td>
                <td>{record.scores?.bodyFat || 0}</td>
                <td>{record.averageScore || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center">尚無歷史紀錄</p>
      )}
    </div>
  );
}

export default History;