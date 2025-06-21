import { useEffect, useMemo, useState } from 'react';
import { useUser } from './UserContext';
import './History.css'; // 引入外部 CSS

function History() {
  const { userData, setUserData } = useUser();
  const history = useMemo(() => userData?.history || [], [userData]);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);

  useEffect(() => {
    console.log('History.js - userData:', userData);
    console.log('History.js - history:', history);
  }, [userData, history]);

  const toggleDeleteOptions = () => {
    setShowDeleteOptions(!showDeleteOptions);
    setSelectedRecords([]);
  };

  const handleSelectRecord = (index) => {
    if (selectedRecords.includes(index)) {
      setSelectedRecords(selectedRecords.filter((i) => i !== index));
    } else {
      setSelectedRecords([...selectedRecords, index]);
    }
  };

  const handleDeleteSelected = () => {
    const newHistory = history.filter((_, index) => !selectedRecords.includes(index));
    localStorage.setItem('history', JSON.stringify(newHistory));
    setUserData({ ...userData, history: newHistory });
    setShowDeleteOptions(false);
    setSelectedRecords([]);
    console.log('History.js - 已刪除所選紀錄');
  };

  return (
    <div className="history-container">
      <h1 className="text-2xl font-bold text-center mb-6">歷史紀錄</h1>
      <div className="sync-button-container">
        <button disabled className="sync-button">同步資料（功能製作中）</button>
      </div>
      {history.length > 0 ? (
        <>
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
                {showDeleteOptions && <th>選擇</th>}
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr key={index}>
                  <td>{record.date || record.timestamp}</td>
                  <td>{record.scores?.strength || 0}</td>
                  <td>{record.scores?.explosivePower || 0}</td>
                  <td>{record.scores?.cardio || 0}</td>
                  <td>{record.scores?.muscleMass || 0}</td>
                  <td>{record.scores?.bodyFat || 0}</td>
                  <td>{record.averageScore || 0}</td>
                  {showDeleteOptions && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(index)}
                        onChange={() => handleSelectRecord(index)}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="action-buttons">
            <button
              onClick={toggleDeleteOptions}
              className={`toggle-delete-btn ${showDeleteOptions ? 'cancel' : 'cleanup'}`}
            >
              {showDeleteOptions ? '取消' : '清理資料'}
            </button>
            {showDeleteOptions && (
              <button onClick={handleDeleteSelected} className="delete-selected-btn">
                刪除所選
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="text-center">尚無歷史紀錄</p>
      )}
    </div>
  );
}

export default History;