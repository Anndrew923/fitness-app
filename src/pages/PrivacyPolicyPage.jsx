import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function PrivacyPolicy() {
  const [htmlContent, setHtmlContent] = useState('載入中...');
  const containerRef = useRef(null);
  const { i18n } = useTranslation();

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

  // 注入後綁定語言切換與錨點平滑滾動
  useEffect(() => {
    if (!containerRef.current) return;

    // 提供給 HTML 內 inline onclick 使用
    window.switchLanguage = function (lang) {
      const root = containerRef.current;
      if (!root) return;
      // 內容區切換
      root
        .querySelectorAll('.content')
        .forEach(el => el.classList.remove('active'));
      if (lang === 'zh') {
        root.querySelector('#zh-content')?.classList.add('active');
      } else {
        root.querySelector('#en-content')?.classList.add('active');
      }
      // 按鈕高亮
      const buttons = Array.from(root.querySelectorAll('.language-btn'));
      buttons.forEach(btn => btn.classList.remove('active'));
      const zhBtn = buttons.find(
        btn =>
          btn.textContent.includes('中文') ||
          btn.getAttribute('onclick')?.includes("'zh'")
      );
      const enBtn = buttons.find(
        btn =>
          btn.textContent.toLowerCase().includes('english') ||
          btn.getAttribute('onclick')?.includes("'en'")
      );
      (lang === 'zh' ? zhBtn : enBtn)?.classList.add('active');
    };

    // 綁定目錄平滑滾動
    containerRef.current.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = href ? containerRef.current.querySelector(href) : null;
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // 依當前語系初始化顯示
    try {
      const initial =
        i18n.language && i18n.language.toLowerCase().startsWith('zh')
          ? 'zh'
          : 'en';
      window.switchLanguage(initial);
    } catch (e) {
      console.warn('Initialize language failed:', e);
    }

    return () => {
      try {
        delete window.switchLanguage;
      } catch {
        // ignore cleanup errors
      }
    };
  }, [htmlContent, i18n.language]);

  return (
    <div
      style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}
      ref={containerRef}
    >
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default PrivacyPolicy;
