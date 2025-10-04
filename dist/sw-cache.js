// Service Worker for caching strategy
const CACHE_NAME = 'fitness-app-v1';
const STATIC_CACHE = 'fitness-static-v1';
const DYNAMIC_CACHE = 'fitness-dynamic-v1';

// 需要快取的靜態資源
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

// 需要快取的 API 端點
const API_CACHE_PATTERNS = [
  /\/api\/user\/.*/,
  /\/api\/ladder\/.*/,
  /\/api\/community\/.*/,
];

// 安裝事件
self.addEventListener('install', event => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// 攔截請求
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 只處理 GET 請求
  if (request.method !== 'GET') {
    return;
  }

  // 靜態資源策略：快取優先
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API 請求策略：網路優先，快取備用
  if (isApiRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 其他請求：網路優先
  event.respondWith(networkFirst(request));
});

// 判斷是否為靜態資源
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/static/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  );
}

// 判斷是否為 API 請求
function isApiRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// 快取優先策略
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// 網路優先策略
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache...');
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // 如果是頁面請求，返回離線頁面
    if (request.destination === 'document') {
      return (
        caches.match('/offline.html') ||
        new Response('Offline', { status: 503 })
      );
    }

    return new Response('Offline', { status: 503 });
  }
}

// 背景同步
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 推送通知
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || [],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// 通知點擊
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});

// 背景同步處理
async function doBackgroundSync() {
  try {
    // 同步離線數據
    console.log('Performing background sync...');

    // 這裡可以添加同步邏輯
    // 例如：上傳離線時保存的數據
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
