import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaEnvelope, FaTimes } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

console.log('[Notifications] module loaded');

const Notifications = () => {
  console.log('[Notifications] component render start');
  const { notifications, markAsRead, markAllAsRead, unreadCount, fetchNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  // lastFetch removed — unused state caused ESLint no-unused-vars warning

  // Your color scheme
  const COLORS = {
    primary: '#f1e4d1', // Soft beige (background)
    secondary: '#162660', // Deep blue (text, borders, hover effects)
    accent: '#d0e6fd', // Light blue (unread notifications, highlights)
  };

  const toggleNotifications = () => {
    console.log('[Notifications] bell clicked, current isOpen=', isOpen);
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      console.log('[Notifications] opening dropdown -> fetching notifications');
      fetchNotifications()
        .then(() => { console.log('[Notifications] fetchNotifications resolved on open'); })
        .catch((err) => console.log('[Notifications] fetchNotifications failed on open', err));
    }
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleMarkAll = () => {
    console.log('[Notifications] markAll clicked');
    markAllAsRead();
    setIsOpen(false);
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
  console.log('[Notifications] fetchData: calling fetchNotifications');
  await fetchNotifications();
  console.log('[Notifications] fetchData: fetchNotifications resolved');
      } catch (error) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchNotifications]);

  useEffect(() => {
    console.log('[Notifications] notifications updated, count=', notifications && notifications.length, 'unreadCount=', unreadCount);
  }, [notifications, unreadCount]);

  const handleNotificationClick = (notification) => {
    console.log('[Notifications] notification clicked', notification && (notification._id || notification.id));
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
          role="menu"
          aria-label="Notifications"
          style={{
            position: 'absolute',
            right: 0,
            top: '40px',
            width: '350px',
            maxWidth: '90vw',
            background: COLORS.primary, // Soft beige background
            border: `1px solid ${COLORS.secondary}`, // Deep blue border
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            zIndex: 1200,
            transition: 'opacity 0.2s ease-in-out, transform 0.18s ease-in-out',
            transform: 'translateY(0)',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          }}
          onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: `1px solid ${COLORS.secondary}` }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ color: COLORS.secondary, fontSize: '0.95rem' }}>Notifications</strong>
              <small style={{ color: COLORS.secondary, opacity: 0.8, fontSize: '0.78rem' }}>{unreadCount} unread</small>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={markAllAsRead}
                style={{ background: 'transparent', color: COLORS.secondary, border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                onMouseEnter={(e) => (e.target.style.color = COLORS.accent)}
                onMouseLeave={(e) => (e.target.style.color = COLORS.secondary)}
              >
                Mark all
              </button>
              <button aria-label="Close notifications" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: COLORS.secondary, cursor: 'pointer' }}>
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <ul style={{ maxHeight: '420px', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '18px', fontSize: '0.95rem', fontWeight: '600', color: COLORS.secondary }}>
                Loading...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '18px', fontSize: '0.95rem', color: COLORS.secondary }}>{error}</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <li
                  key={notification._id}
                  role="menuitem"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderBottom: `1px solid ${COLORS.secondary}`,
                    cursor: 'pointer',
                    background: notification.read ? COLORS.primary : COLORS.accent,
                    transition: 'background 0.15s ease',
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNotificationClick(notification); }}
                >
                  <div style={{ minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: notification.read ? '#fff' : '#fff' }}>
                    {!notification.read ? <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff7a00', display: 'inline-block' }} /> : <FaEnvelope style={{ color: COLORS.secondary }} />}
                  </div>

                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: notification.read ? 500 : 700, color: COLORS.secondary }}>{notification.title || 'Notification'}</div>
                    <div style={{ color: COLORS.secondary, opacity: 0.9, fontSize: '0.9rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>{notification.message}</div>
                  </div>

                  <div style={{ marginLeft: '8px', textAlign: 'right' }}>
                    <small style={{ fontSize: '0.75rem', color: COLORS.secondary }} title={notification.createdAt ? dayjs(notification.createdAt).toString() : ''}>
                      {notification.createdAt ? `${dayjs(notification.createdAt).fromNow()} • ${dayjs(notification.createdAt).format('YYYY-MM-DD HH:mm')}` : 'No date'}
                    </small>
                  </div>
                </li>
              ))
            ) : (
              <li style={{ textAlign: 'center', padding: '18px', fontSize: '0.95rem', color: COLORS.secondary }}>No notifications</li>
            )}
          </ul>

          {/* Footer */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${COLORS.secondary}`, display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button onClick={handleMarkAll} style={{ background: '#ff7a00', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>Mark all</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
