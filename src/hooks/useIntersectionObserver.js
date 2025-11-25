import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

/**
 * Intersection Observer Hook
 * @param {Object} options - Intersection Observer 選項
 * @param {Array} dependencies - 依賴數組
 */
const useIntersectionObserver = (options = {}, dependencies = []) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  // ✅ 使用 useMemo 包裝 defaultOptions，避免每次渲染都創建新對象
  const defaultOptions = useMemo(
    () => ({
      threshold: 0.1,
      rootMargin: '0px',
      ...options,
    }),
    [options]
  );

  // ✅ 新增：檢查元素是否在視窗內（初始可見性檢查）
  const checkInitialVisibility = useCallback(() => {
    if (!elementRef.current) return false;

    const rect = elementRef.current.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    // 解析 rootMargin（簡化處理，只處理數字格式如 "100px"）
    const rootMarginStr = String(defaultOptions.rootMargin || '0px');
    const rootMarginValue = parseInt(rootMarginStr) || 0;

    // 檢查元素是否在視窗內（考慮 rootMargin）
    const isVisible =
      rect.top < windowHeight + rootMarginValue &&
      rect.bottom > -rootMarginValue &&
      rect.left < windowWidth &&
      rect.right > 0;

    return isVisible;
  }, [defaultOptions.rootMargin]);

  // 創建觀察器
  const createObserver = useCallback(() => {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
      // ✅ 如果不支持 Intersection Observer，檢查初始可見性
      if (elementRef.current) {
        const isInitiallyVisible = checkInitialVisibility();
        if (isInitiallyVisible) {
          setIsIntersecting(true);
          setHasIntersected(true);
        }
      }
      return null;
    }

    return new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      });
    }, defaultOptions);
  }, [defaultOptions, hasIntersected, checkInitialVisibility]);

  // 開始觀察
  const startObserving = useCallback(() => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.observe(elementRef.current);
    }
  }, []);

  // 停止觀察
  const stopObserving = useCallback(() => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
  }, []);

  // 重新開始觀察
  const restartObserving = useCallback(() => {
    stopObserving();
    startObserving();
  }, [stopObserving, startObserving]);

  // ✅ 改進：初始化觀察器時立即檢查可見性
  useEffect(() => {
    observerRef.current = createObserver();

    if (observerRef.current && elementRef.current) {
      startObserving();
      // ✅ 立即觸發一次檢查，處理元素一開始就在視窗內的情況
      // 使用 requestAnimationFrame 確保 DOM 已渲染
      requestAnimationFrame(() => {
        if (elementRef.current && observerRef.current) {
          // 簡化檢查：如果元素在視窗內，立即設置為可見
          const rect = elementRef.current.getBoundingClientRect();
          const windowHeight =
            window.innerHeight || document.documentElement.clientHeight;

          if (rect.top < windowHeight && rect.bottom > 0) {
            setIsIntersecting(true);
            setHasIntersected(true);
          }
        }
      });
    } else if (!observerRef.current && elementRef.current) {
      // ✅ Fallback：如果不支持 Intersection Observer，檢查初始可見性
      const isInitiallyVisible = checkInitialVisibility();
      if (isInitiallyVisible) {
        setIsIntersecting(true);
        setHasIntersected(true);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // 當元素變化時重新觀察
  useEffect(() => {
    if (observerRef.current && elementRef.current) {
      restartObserving();
    }
  }, [restartObserving]);

  // ✅ 改進：當元素附加後立即檢查可見性
  useEffect(() => {
    if (elementRef.current) {
      // 延遲檢查，確保 DOM 已完全渲染
      const checkTimer = setTimeout(() => {
        if (elementRef.current) {
          const isInitiallyVisible = checkInitialVisibility();
          if (isInitiallyVisible && !hasIntersected) {
            setIsIntersecting(true);
            setHasIntersected(true);
          }
        }
      }, 100); // 100ms 後檢查，確保渲染完成

      return () => clearTimeout(checkTimer);
    }
  }, [checkInitialVisibility, hasIntersected]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
    startObserving,
    stopObserving,
    restartObserving,
  };
};

/**
 * 懶加載 Hook
 * @param {Object} options - Intersection Observer 選項
 */
export const useLazyLoad = (options = {}) => {
  const { elementRef, isIntersecting, hasIntersected } =
    useIntersectionObserver({
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

  return {
    elementRef,
    shouldLoad: isIntersecting || hasIntersected,
    isVisible: isIntersecting,
  };
};

/**
 * 動畫觸發 Hook
 * @param {Object} options - Intersection Observer 選項
 */
export const useAnimationTrigger = (options = {}) => {
  const { elementRef, isIntersecting, hasIntersected } =
    useIntersectionObserver({
      threshold: 0.2,
      rootMargin: '0px',
      ...options,
    });

  return {
    elementRef,
    shouldAnimate: isIntersecting,
    hasAnimated: hasIntersected,
  };
};

/**
 * 無限滾動 Hook
 * @param {Function} loadMore - 載入更多數據的函數
 * @param {Object} options - Intersection Observer 選項
 */
export const useInfiniteScroll = (loadMore, options = {}) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    ...options,
  });

  useEffect(() => {
    if (isIntersecting && loadMore) {
      loadMore();
    }
  }, [isIntersecting, loadMore]);

  return {
    elementRef,
  };
};

/**
 * 可見性追蹤 Hook
 * @param {Function} onVisible - 可見時的回調
 * @param {Function} onHidden - 隱藏時的回調
 * @param {Object} options - Intersection Observer 選項
 */
export const useVisibilityTracker = (onVisible, onHidden, options = {}) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    ...options,
  });

  useEffect(() => {
    if (isIntersecting && onVisible) {
      onVisible();
    } else if (!isIntersecting && onHidden) {
      onHidden();
    }
  }, [isIntersecting, onVisible, onHidden]);

  return {
    elementRef,
    isVisible: isIntersecting,
  };
};

// 同時提供命名導出和 default 導出，確保兼容性
export { useIntersectionObserver };
export default useIntersectionObserver;
