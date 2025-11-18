import { useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(null);

  useLayoutEffect(() => {
    const isFromLogin = prevPathnameRef.current === '/login' || prevPathnameRef.current === '/';

    if (pathname === '/user-info') {
      if (isFromLogin) {
        window.scrollTo(0, 0);
      } else {
        requestAnimationFrame(() => {
          const radarSection = document.getElementById('radar-section');
          if (radarSection) {
            radarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    } else if (pathname === '/ladder') {
      // ✅ 天梯頁面不執行滾動，由 Ladder 組件自己處理滾動邏輯
      // 不做任何操作
    } else {
      window.scrollTo(0, 0);
    }

    prevPathnameRef.current = pathname;
  }, [pathname]);

  return null;
}

export default ScrollToTop;