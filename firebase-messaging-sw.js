// Import and initialize the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// ดึง config จาก self.env (ต้อง inject ตอน build/deploy)
const firebaseConfig = {
    apiKey: self.env && self.env.VITE_FIREBASE_API_KEY,
    authDomain: self.env && self.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: self.env && self.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: self.env && self.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: self.env && self.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: self.env && self.env.VITE_FIREBASE_APP_ID,
    measurementId: self.env && self.env.VITE_FIREBASE_MEASUREMENT_ID
};
// หมายเหตุ: ต้อง inject self.env ตอน build หรือ deploy (เช่น Vite, Webpack, หรือ inline script)

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/android-chrome-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});