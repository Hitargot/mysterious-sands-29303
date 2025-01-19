import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create the NotificationContext
const NotificationContext = createContext();

// Custom hook to access NotificationContext easily
export const useNotification = () => useContext(NotificationContext);

// Notification provider to wrap around components
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (notification) => {
    setNotifications((prev) => [...prev, notification]);
    setUnreadCount((prev) => prev + 1);
  };

  const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!token) return console.error('No token found for fetching notifications');

    try {
      const response = await axios.get('https://mysterious-sands-29303-c1f04c424030.herokuapp.com/notifications/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.notifications || [];
      setNotifications(data);
      setUnreadCount(data.filter((notif) => !notif.read).length); // Set unread count
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  }, [token]); // Only recreate the function if token changes

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000); // 10 seconds interval

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [fetchNotifications]); // Only re-run the effect if fetchNotifications changes

  // Mark a single notification as read
  const markAsRead = async (id) => {
    if (!id || !token) return;

    try {
      await axios.put(`http://localhost:22222/api/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;

    try {
      await axios.put('http://localhost:22222/api/notifications/readAll', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error.message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
