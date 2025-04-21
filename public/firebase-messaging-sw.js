// Import necessary Firebase modules
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Initialize the Firebase app with your configuration object
const firebaseConfig = initializeApp({
    apiKey: "AIzaSyD06wacvARH08ZtjpvdzqgJOGebA9hKjiQ",
    authDomain: "exdollarium-2beaf.firebaseapp.com",
    projectId: "exdollarium-2beaf",
    storageBucket: "exdollarium-2beaf.firebasestorage.app",
    messagingSenderId: "22143628015",
    appId: "1:22143628015:web:44ccc470f0abc5f6cee11a",
    measurementId: "G-VNB0VKNSM1",
});

// Retrieve Firebase Messaging instance to handle background messages
const messaging = getMessaging(firebaseConfig );

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png', // Ensure you have a valid icon
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
