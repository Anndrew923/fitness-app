import React from 'react';

const TestPage = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>測試頁面</h1>
      <p>如果您看到這個頁面，說明 React 應用正在正常運行。</p>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => alert('按鈕正常工作！')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          測試按鈕
        </button>
      </div>
    </div>
  );
};

export default TestPage;
