import { useState, useEffect } from 'react';

function PrivacyPolicy() {
  const [htmlContent, setHtmlContent] = useState('載入中...');

  useEffect(() => {
    // 載入隱私權政策 HTML 檔案
    fetch('/privacy-policy.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('無法載入隱私權政策');
        }
        return response.text();
      })
      .then(html => {
        setHtmlContent(html);
      })
      .catch(error => {
        console.error('載入隱私權政策失敗:', error);
        setHtmlContent('<div>載入隱私權政策時發生錯誤，請稍後再試。</div>');
      });
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default PrivacyPolicy;