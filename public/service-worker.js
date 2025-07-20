// Import Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyC452vdQ6_77OWElN6vvEbAzn_lA4DvPk0",
    authDomain: "beit67.firebaseapp.com",
    projectId: "beit67",
    storageBucket: "beit67.appspot.com",
    messagingSenderId: "909474812266",
    appId: "1:909474812266:web:c69149ad52c43085441513",
    measurementId: "G-SFPMXYCJNG"
};

firebase.initializeApp(firebaseConfig);
let messaging = null;

// --- ส่วนของ PWA Caching ---
const CACHE_NAME = 'my-schedule-app-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  'https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js'
  // ไม่ต้องแคช Firebase SDK เพราะเรา import มาแล้วในนี้
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name.startsWith('my-schedule-app-cache-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// --- ส่วนของ Firebase Messaging ---
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/android-chrome-192x192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- ส่วนของการจัดการ Notification ---
let swRegistration = null;

async function setupMessaging() {
    swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    messaging = firebase.messaging();
    messaging.useServiceWorker(swRegistration);
}

document.addEventListener('DOMContentLoaded', async () => {
    if ('serviceWorker' in navigator) {
        await setupMessaging();
    }
    // ...init อื่นๆ
});

async function requestNotificationPermission() {
    if (!messaging) {
        alert('Notification system not ready yet. Please try again.');
        return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        const currentToken = await messaging.getToken({ vapidKey: 'BDMTIb2DErhAzW9wzREcxfQb-c5vbA39q8OZqQewh-aQtshlT90koKsUVgxezcCwA91HIio1pcqqyaa6ecFOqBk' });
        // ...save token
    }
}