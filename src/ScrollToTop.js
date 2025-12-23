import { useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(null);

  useLayoutEffect(() => {
    console.log('ScrollToTop triggered:', pathname);
    const isFromLogin = prevPathnameRef.current === '/login' || prevPathnameRef.current === '/';

    if (pathname === '/user-info') {
      if (isFromLogin) {
        window.scrollTo(0, 0);
        // Reset container scroll
        const scrollContainer = document.querySelector('.main-content');
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
        }
      } else {
        requestAnimationFrame(() => {
          const radarSection = document.getElementById('radar-section');
          if (radarSection) {
            radarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    } else if (pathname === '/ladder' || pathname.includes('/ladder')) {
      // 🛑 關鍵修改：如果是天梯頁面，什麼都不做，保留原本的滾動位置或交給頁面自己處理
      // 天梯頁面由 Ladder 組件自己控制滾動邏輯（自動定位用戶位置）
      return;
    } else {
      console.log('ScrollToTop: Reseting scroll for', pathname);
      
      // 1. Reset Window (fallback)
      window.scrollTo(0, 0);

      // 2. Reset Container (primary for fixed layouts)
      const scrollContainer = document.querySelector('.main-content');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }

    prevPathnameRef.current = pathname;
  }, [pathname]);

  return null;
}

export default ScrollToTop;