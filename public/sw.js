// Service Worker for PWA
const CACHE_NAME = 'fitness-app-v1.0.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/favicon.ico',
];

// 安裝事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// 攔截請求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 開發模式：優先從網路獲取最新版本
      if (
        event.request.url.includes('localhost') ||
        event.request.url.includes('127.0.0.1')
      ) {
        return fetch(event.request)
          .then(fetchResponse => {
            // 更新緩存
            if (fetchResponse && fetchResponse.status === 200) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return fetchResponse;
          })
          .catch(() => {
            // 如果網路請求失敗，返回緩存版本
            return response;
          });
      }

      // 生產模式：優先使用緩存
      if (response) {
        return response;
      }

      // 否則從網路獲取
      return fetch(event.request)
        .catch(error => {
          console.warn('Service Worker 網路請求失敗:', error.message);

          // 對於頭像請求，提供更好的錯誤處理
          if (event.request.url.includes('googleusercontent.com')) {
            console.log('Google 頭像請求失敗，將使用預設頭像');
          }

          // 返回緩存版本（如果有的話）
          return response;
        })
        .then(response => {
          // 檢查是否為有效回應
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // 複製回應
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
    })
  );
});

// 更新事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
