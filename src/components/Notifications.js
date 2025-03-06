import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaEnvelope } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount, fetchNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Your color scheme
  const COLORS = {
    primary: '#f1e4d1', // Soft beige (background)
    secondary: '#162660', // Deep blue (text, borders, hover effects)
    accent: '#d0e6fd', // Light blue (unread notifications, highlights)
  };

  const toggleNotifications = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchNotifications();
      } catch (error) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Notification Icon */}
      <div
        onClick={toggleNotifications}
        style={{
          position: 'relative',
          fontSize: '1.5rem',
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out',
          color: COLORS.accent, // Deep blue for the icon
        }}
        onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: COLORS.accent, // Light blue background for unread count
              color: COLORS.secondary,
              fontSize: '0.8rem',
              fontWeight: 'bold',
              padding: '3px 6px',
              borderRadius: '50%',
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '40px',
            background: COLORS.primary, // Soft beige background
            border: `1px solid ${COLORS.secondary}`, // Deep blue border
            borderRadius: '5px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            transition: 'all 0.3s ease-in-out',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '8px 12px',
              borderBottom: `1px solid ${COLORS.secondary}`,
            }}
          >
            <button
              onClick={markAllAsRead}
              style={{
                background: 'transparent',
                color: COLORS.secondary,
                border: 'none',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.target.style.color = COLORS.accent)}
              onMouseLeave={(e) => (e.target.style.color = COLORS.secondary)}
            >
              Mark All as Read
            </button>
          </div>

          {/* Notification List */}
          <ul style={{ maxHeight: '250px', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '15px', fontSize: '0.9rem', fontWeight: 'bold', color: COLORS.secondary }}>
                Loading...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '15px', fontSize: '0.9rem', color: COLORS.secondary }}>{error}</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <li
                  key={notification._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    borderBottom: `1px solid ${COLORS.secondary}`,
                    cursor: 'pointer',
                    background: notification.read ? COLORS.primary : COLORS.accent, // Light blue for unread
                    transition: 'background 0.2s',
                    gap: '10px',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = COLORS.accent + 'AA')}
                  onMouseLeave={(e) => (e.target.style.background = notification.read ? COLORS.primary : COLORS.accent)}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span style={{ color: COLORS.secondary }}>{notification.message}</span>
                  {!notification.read && <FaEnvelope style={{ color: COLORS.secondary }} />}
                  <small style={{ fontSize: '0.75rem', color: COLORS.secondary }}>
                    {dayjs(notification.createdAt).fromNow()}
                  </small>
                </li>
              ))
            ) : (
              <li style={{ textAlign: 'center', padding: '15px', fontSize: '0.9rem', color: COLORS.secondary }}>No notifications</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;
