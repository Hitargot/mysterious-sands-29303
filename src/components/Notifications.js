import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaEnvelope } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import dayjs from 'dayjs'; // Import dayjs for date formatting
import relativeTime from 'dayjs/plugin/relativeTime'; // Import relativeTime plugin
import '../styles/Notifications.css';

dayjs.extend(relativeTime); // Extend dayjs with the relativeTime plugin

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount, fetchNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);  // Add loading state
  const dropdownRef = useRef(null);

  const toggleNotifications = () => {
    setIsOpen((prev) => !prev);
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);  // Start loading before fetching
      try {
        await fetchNotifications();  // Assume fetchNotifications is a function in context to fetch data
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);  // Stop loading after fetching
      }
    };

    fetchData();
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    console.log('Notification ID:', notification._id);  // Log the ID
    markAsRead(notification._id);  // Pass the ID to markAsRead
  };

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <div className="notification-icon" onClick={toggleNotifications}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </div>
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <button onClick={markAllAsRead} className="mark-all-btn">Mark All as Read</button>
          </div>
          <ul className="notification-list">
            {loading ? (
              <div className="loading-spinner">Loading...</div>  // Display loading indicator
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <li
                  key={notification._id || Math.random()}  // Fallback key if _id is missing
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}  // Call the handle function directly
                >
                  <span className="notification-text">{notification.message}</span>
                  {!notification.read && <FaEnvelope className="envelope-icon" />}
                  <span className="notification-time">
                    <small>{dayjs(notification.createdAt).fromNow()}</small> {/* Display relative time */}
                  </span>
                </li>
              ))
            ) : (
              <li className="no-notifications">No notifications</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;
