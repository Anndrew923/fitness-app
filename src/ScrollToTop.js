import { useRef, useMemo, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(null);

  const testPages = useMemo(() => [
    '/strength',
    '/cardio',
    '/explosive-power',
    '/muscle-mass',
    '/body-fat',
  ], []);

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
    } else {
      window.scrollTo(0, 0);
    }

    prevPathnameRef.current = pathname;
  }, [pathname, testPages]);

  return null;
}

export default ScrollToTop;