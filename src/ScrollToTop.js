// src/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // 每次路徑變更時滾動到頂部
  }, [pathname]); // 依賴於路徑名稱，路徑變更時觸發

  return null; // 這個組件不渲染任何內容
}

export default ScrollToTop;