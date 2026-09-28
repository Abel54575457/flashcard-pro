// FlashCard Pro - Progressive Web App Service Worker (PWA)
const CACHE_NAME = 'flashcard-pro-v1.0.2';

// 核心靜態離線快取資源清單
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

// 安裝事件：預先快取核心資源
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache partial fallback:', err);
      });
    })
  );
});

// 啟動事件：清除舊版快取並立即接管控制權
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 擷取事件：網絡優先，快取備援 (確保最新代碼隨時生效，離線時能使用本地快取)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. 略過非 GET 請求、Firebase 雲端資料庫、Google Apps Script 與 LINE 外部 API
  if (
    req.method !== 'GET' ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('api.line.me') ||
    url.hostname.includes('line.me')
  ) {
    return;
  }

  // 2. 靜態資源策略：Stale-While-Revalidate (優先即時回應快取，並於背景抓取最新版本)
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(req).then((cached) => {
          const fetchPromise = fetch(req)
            .then((networkRes) => {
              if (networkRes && networkRes.status === 200) {
                cache.put(req, networkRes.clone());
              }
              return networkRes;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. HTML 導航頁面：網絡優先 (確保隨時獲得最新單字與功能)，離線時回退至 index.html 快取
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match('/index.html').then((fallback) => {
            return fallback || caches.match('/');
          });
        })
    );
    return;
  }

  // 其他常規請求：常規網絡請求
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          return res;
        })
      );
    })
  );
});
