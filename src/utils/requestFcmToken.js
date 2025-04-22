// src/utils/requestFcmToken.js
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

export const requestFcmToken = async () => {
  try {
    // Check notification permission status
    const permission = Notification.permission;

    if (permission === "denied" || permission === "blocked") {
      console.warn("⚠️ Notification permission is blocked. Please enable notifications in your browser settings.");
      return null;
    }

    // Try to get the FCM token
    const token = await getToken(messaging, {
      vapidKey: "BHcOsfSDAeuMgJgBvyd7lxs8DO8bEXPxKRPjduSAdKU2y6K_g1tQ-rERTC8_dJPR0r3hJJ5YR5P9rNafAxWCv4o",
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
    });

    if (token) {
      console.log("✅ FCM Token retrieved:", token);
      return token;
    } else {
      console.warn("⚠️ No FCM token returned.");
      return null;
    }
  } catch (err) {
    console.error("❌ Error retrieving FCM token:", err);
    return null;
  }
};
