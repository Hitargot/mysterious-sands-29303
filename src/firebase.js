import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyD06wacvARH08ZtjpvdzqgJOGebA9hKjiQ",
    authDomain: "exdollarium-2beaf.firebaseapp.com",
    projectId: "exdollarium-2beaf",
    storageBucket: "exdollarium-2beaf.firebasestorage.app",
    messagingSenderId: "22143628015",
    appId: "1:22143628015:web:44ccc470f0abc5f6cee11a",
    measurementId: "G-VNB0VKNSM1"
};  

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestPermissionAndGetToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BHcOsfSDAeuMgJgBvyd7lxs8DO8bEXPxKRPjduSAdKU2y6K_g1tQ-rERTC8_dJPR0r3hJJ5YR5P9rNafAxWCv4o", // from Firebase Cloud Messaging > Web configuration
      });
      return token;
    } else {
      console.log("Notification permission denied");
    }
  } catch (error) {
    console.error("Token error", error);
  }
};

export { messaging };

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
