// Import and initialize the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// !! สำคัญ: นำค่า firebaseConfig ของคุณมาวางตรงนี้อีกครั้ง !!
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