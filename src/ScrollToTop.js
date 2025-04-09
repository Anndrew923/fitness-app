// src/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 添加 100ms 延遲，確保頁面渲染完成後滾動
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timer); // 清理計時器
  }, [pathname]);

  return null;
}

export default ScrollToTop;