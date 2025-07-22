// Service Worker for PWA
const CACHE_NAME = 'fitness-app-v1.0.0';
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
      // 如果找到快取版本，返回快取
      if (response) {
        return response;
      }

      // 否則從網路獲取
      return fetch(event.request).then(response => {
        // 檢查是否為有效回應
        if (!response || response.status !== 200 || response.type !== 'basic') {
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
