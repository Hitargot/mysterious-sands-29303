// Import Firebase scripts (Compat version)
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Initialize Firebase using the compat API
firebase.initializeApp({
  apiKey: "AIzaSyD06wacvARH08ZtjpvdzqgJOGebA9hKjiQ",
  authDomain: "exdollarium-2beaf.firebaseapp.com",
  projectId: "exdollarium-2beaf",
  storageBucket: "exdollarium-2beaf.appspot.com", // corrected URL
  messagingSenderId: "22143628015",
  appId: "1:22143628015:web:44ccc470f0abc5f6cee11a",
  measurementId: "G-VNB0VKNSM1"
});

// Get messaging instance from the firebase global object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // Make sure this path is correct and accessible
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
