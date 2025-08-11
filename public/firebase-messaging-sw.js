// Firebase Cloud Messaging Service Worker
// This enables push notifications for your PWA

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Your Firebase config - your actual configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWSoXRBnIe8SaFhUWj2CJycqlbxWwaj44",
  authDomain: "nahati-laundry-app.firebaseapp.com",
  projectId: "nahati-laundry-app",
  storageBucket: "nahati-laundry-app.firebasestorage.app",
  messagingSenderId: "248217898042",
  appId: "1:248217898042:web:c6c746ea3251d8c1d3f903"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
