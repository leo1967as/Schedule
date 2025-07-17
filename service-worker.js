const CACHE_NAME = 'my-schedule-app-cache-v3'; // **เปลี่ยนชื่อ Cache อีกครั้งเพื่อบังคับอัปเดต**

// **นำ URL ของ Google Fonts ออกไป**
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  'https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js'
];

// Event: install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        // **เพิ่มการดักจับ Error เพื่อดูว่า URL ไหนคือตัวปัญหา**
        console.error('Failed to cache URLs during install:', error);
      })
  );
});

// Event: activate (ลบ cache เก่า)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('my-schedule-app-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Event: fetch
self.addEventListener('fetch', event => {
  // ไม่แคช Google Fonts API requests
  if (event.request.url.indexOf('https://fonts.googleapis.com') === 0 || 
      event.request.url.indexOf('https://fonts.gstatic.com') === 0) {
    return; // ปล่อยให้เบราว์เซอร์จัดการเอง
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});