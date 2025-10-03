import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * 資源預加載 Hook
 * @param {Array} resources - 需要預加載的資源列表
 * @param {Object} options - 配置選項
 */
const useResourcePreloader = (resources = [], options = {}) => {
  const [loadedResources, setLoadedResources] = useState(new Set());
  const [loadingResources, setLoadingResources] = useState(new Set());
  const [failedResources, setFailedResources] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const preloadPromisesRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  const {
    priority = 'low',
    timeout = 10000,
    retryCount = 3,
    onProgress = null,
    onComplete = null,
    onError = null,
  } = options;

  // 預加載單個資源
  const preloadResource = useCallback(
    async (resource, retries = 0) => {
      const {
        url,
        type = 'image',
        priority: resourcePriority = priority,
      } = resource;

      try {
        // 檢查是否已經載入
        if (loadedResources.has(url)) {
          return { url, success: true, cached: true };
        }

        // 檢查是否正在載入
        if (loadingResources.has(url)) {
          return preloadPromisesRef.current.get(url);
        }

        // 創建載入 Promise
        const loadPromise = new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error(`Resource load timeout: ${url}`));
          }, timeout);

          const handleSuccess = () => {
            clearTimeout(timeoutId);
            setLoadedResources(prev => new Set([...prev, url]));
            setLoadingResources(prev => {
              const newSet = new Set(prev);
              newSet.delete(url);
              return newSet;
            });
            resolve({ url, success: true, cached: false });
          };

          const handleError = error => {
            clearTimeout(timeoutId);
            setLoadingResources(prev => {
              const newSet = new Set(prev);
              newSet.delete(url);
              return newSet;
            });

            if (retries < retryCount) {
              console.warn(
                `Retrying resource load (${retries + 1}/${retryCount}): ${url}`
              );
              setTimeout(() => {
                preloadResource(resource, retries + 1)
                  .then(resolve)
                  .catch(reject);
              }, 1000 * (retries + 1));
            } else {
              setFailedResources(prev => new Set([...prev, url]));
              reject(error);
            }
          };

          // 根據資源類型進行載入
          switch (type) {
            case 'image':
              const img = new Image();
              img.onload = handleSuccess;
              img.onerror = handleError;
              img.src = url;
              break;

            case 'script':
              const script = document.createElement('script');
              script.onload = handleSuccess;
              script.onerror = handleError;
              script.src = url;
              script.async = true;
              document.head.appendChild(script);
              break;

            case 'style':
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = url;
              link.onload = handleSuccess;
              link.onerror = handleError;
              document.head.appendChild(link);
              break;

            case 'font':
              const font = new FontFace(
                resource.fontFamily || 'Custom Font',
                `url(${url})`
              );
              font.load().then(handleSuccess).catch(handleError);
              break;

            case 'fetch':
              fetch(url, {
                signal: abortControllerRef.current?.signal,
                priority: resourcePriority === 'high' ? 'high' : 'low',
              })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(
                      `HTTP ${response.status}: ${response.statusText}`
                    );
                  }
                  return response.blob();
                })
                .then(handleSuccess)
                .catch(handleError);
              break;

            default:
              reject(new Error(`Unsupported resource type: ${type}`));
          }
        });

        // 記錄載入 Promise
        preloadPromisesRef.current.set(url, loadPromise);
        setLoadingResources(prev => new Set([...prev, url]));

        return loadPromise;
      } catch (error) {
        console.error(`Failed to preload resource: ${url}`, error);
        setFailedResources(prev => new Set([...prev, url]));
        throw error;
      }
    },
    [loadedResources, loadingResources, priority, timeout, retryCount]
  );

  // 預加載所有資源
  const preloadAll = useCallback(async () => {
    if (resources.length === 0) return;

    setIsLoading(true);
    setProgress(0);

    // 創建 AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 按優先級排序資源
      const sortedResources = [...resources].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (
          (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1)
        );
      });

      const results = [];
      let completed = 0;

      // 並行載入高優先級資源，串行載入其他資源
      const highPriorityResources = sortedResources.filter(
        r => r.priority === 'high'
      );
      const otherResources = sortedResources.filter(r => r.priority !== 'high');

      // 載入高優先級資源
      if (highPriorityResources.length > 0) {
        const highPriorityPromises = highPriorityResources.map(resource =>
          preloadResource(resource).catch(error => ({
            url: resource.url,
            success: false,
            error,
          }))
        );
        const highPriorityResults = await Promise.all(highPriorityPromises);
        results.push(...highPriorityResults);
        completed += highPriorityResources.length;
        setProgress((completed / resources.length) * 100);

        if (onProgress) {
          onProgress(completed, resources.length);
        }
      }

      // 載入其他資源
      for (const resource of otherResources) {
        try {
          const result = await preloadResource(resource);
          results.push(result);
        } catch (error) {
          results.push({ url: resource.url, success: false, error });
        }

        completed++;
        setProgress((completed / resources.length) * 100);

        if (onProgress) {
          onProgress(completed, resources.length);
        }
      }

      if (onComplete) {
        onComplete(results);
      }
    } catch (error) {
      console.error('Resource preloading failed:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [resources, preloadResource, onProgress, onComplete, onError]);

  // 預加載特定資源
  const preloadSpecific = useCallback(
    async resourceUrls => {
      const specificResources = resources.filter(r =>
        resourceUrls.includes(r.url)
      );
      return Promise.all(specificResources.map(preloadResource));
    },
    [resources, preloadResource]
  );

  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    loadedResources: Array.from(loadedResources),
    loadingResources: Array.from(loadingResources),
    failedResources: Array.from(failedResources),
    isLoading,
    progress,
    preloadAll,
    preloadSpecific,
    isLoaded: url => loadedResources.has(url),
    isFailed: url => failedResources.has(url),
  };
};

export default useResourcePreloader;
