import { useEffect, useRef, useState, useCallback } from 'react';

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

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px',
    ...options,
  };

  // 創建觀察器
  const createObserver = useCallback(() => {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
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
  }, [defaultOptions, hasIntersected]);

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

  // 初始化觀察器
  useEffect(() => {
    observerRef.current = createObserver();

    if (observerRef.current && elementRef.current) {
      startObserving();
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, dependencies);

  // 當元素變化時重新觀察
  useEffect(() => {
    if (observerRef.current && elementRef.current) {
      restartObserving();
    }
  }, [restartObserving]);

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
