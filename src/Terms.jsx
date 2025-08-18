import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function Terms() {
  const [htmlContent, setHtmlContent] = useState('載入中...');
  const containerRef = useRef(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    fetch('/terms.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('無法載入使用條款');
        }
        return response.text();
      })
      .then(html => setHtmlContent(html))
      .catch(error => {
        console.error('載入使用條款失敗:', error);
        setHtmlContent('<div>載入使用條款時發生錯誤，請稍後再試。</div>');
      });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // 提供給 HTML 內的按鈕使用
    window.switchTermsLanguage = function (lang) {
      const root = containerRef.current;
      if (!root) return;
      root.querySelectorAll('.content').forEach(el => el.classList.remove('active'));
      if (lang === 'zh') {
        root.querySelector('#zh-content')?.classList.add('active');
      } else {
        root.querySelector('#en-content')?.classList.add('active');
      }
      const buttons = Array.from(root.querySelectorAll('.language-btn'));
      buttons.forEach(btn => btn.classList.remove('active'));
      const zhBtn = buttons.find(btn => btn.getAttribute('data-lang') === 'zh');
      const enBtn = buttons.find(btn => btn.getAttribute('data-lang') === 'en');
      (lang === 'zh' ? zhBtn : enBtn)?.classList.add('active');
    };

    // 初始化語言
    const initial = i18n.language && i18n.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    try {
      window.switchTermsLanguage(initial);
    } catch {}

    return () => {
      try {
        delete window.switchTermsLanguage;
      } catch {}
    };
  }, [htmlContent, i18n.language]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }} ref={containerRef}>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default Terms;
