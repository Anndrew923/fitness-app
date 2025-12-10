import { useState, useEffect, useRef } from 'react';

export const usePageScroll = () => {
  const [performanceMode, setPerformanceMode] = useState('normal'); // 'normal' | 'scrolling' | 'idle'
  const scrollTimeoutRef = useRef(null);
  const rafIdRef = useRef(null);
  const lastScrollTimeRef = useRef(0);
  const isScrollingRef = useRef(false);
  const idleCallbackIdRef = useRef(null);

  // ✅ 終極優化 1: 智能滾動檢測（使用被動監聽器 + RAF）
  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();

      // ✅ 使用 requestAnimationFrame 優化滾動處理
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (!isScrollingRef.current) {
          isScrollingRef.current = true;
          setPerformanceMode('scrolling');
        }

        lastScrollTimeRef.current = now;

        // ✅ 清除之前的定時器
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // ✅ 滾動停止後恢復（使用 requestIdleCallback 優化）
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          setPerformanceMode('idle');

          // ✅ 修復 2: 取消之前的 idle callback（如果存在）
          if (idleCallbackIdRef.current && window.cancelIdleCallback) {
            cancelIdleCallback(idleCallbackIdRef.current);
            idleCallbackIdRef.current = null;
          }

          // ✅ 使用 requestIdleCallback 在空閒時恢復
          if (window.requestIdleCallback) {
            idleCallbackIdRef.current = requestIdleCallback(
              () => {
                setPerformanceMode('normal');
                idleCallbackIdRef.current = null;
              },
              { timeout: 200 }
            );
          } else {
            setTimeout(() => {
              setPerformanceMode('normal');
            }, 200);
          }
        }, 150);
      });
    };

    // ✅ 使用被動監聽器提升滾動性能
    const options = { passive: true, capture: false };
    window.addEventListener('scroll', handleScroll, options);
    window.addEventListener('touchmove', handleScroll, options);
    window.addEventListener('wheel', handleScroll, options);

    return () => {
      window.removeEventListener('scroll', handleScroll, options);
      window.removeEventListener('touchmove', handleScroll, options);
      window.removeEventListener('wheel', handleScroll, options);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      // ✅ 修復 2: 清理 idle callback
      if (idleCallbackIdRef.current && window.cancelIdleCallback) {
        cancelIdleCallback(idleCallbackIdRef.current);
        idleCallbackIdRef.current = null;
      }
    };
  }, []);

  return { performanceMode };
};

