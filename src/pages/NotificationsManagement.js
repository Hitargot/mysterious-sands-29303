import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { DotLoaderOverlay } from 'react-spinner-overlay'; // Spinner for loading
import "../styles/NotificationManagement.css";
import Alert from '../components/Alert';
import api from '../lib/api';

const NotificationManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [notificationsHistory, setNotificationsHistory] = useState([]);
  const [alert, setAlert] = useState({ message: '', type: '', show: false });
  const [loading, setLoading] = useState({ users: true, notifications: true });
  const [showCreateNotification, setShowCreateNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/users')
      .then((res) => {
        if (cancelled) return;
        // backend returns an array for /api/users
        setUsers(Array.isArray(res.data) ? res.data : []);
        setLoading((prev) => ({ ...prev, users: false }));
      })
      .catch((error) => {
        setAlert({ message: 'Error fetching users.', type: 'error', show: true });
        setLoading((prev) => ({ ...prev, users: false }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // backend notifications route is mounted at /api/notifications and exposes GET /notifications
    api
      .get('/api/notifications')
      .then((res) => {
        if (cancelled) return;
        // Support two backend shapes:
        // - Admin route returns an array (res.data === [ ...notifications ])
        // - User route returns { notifications: [...] }
        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (res.data && Array.isArray(res.data.notifications)) data = res.data.notifications;
        setNotificationsHistory(data.reverse());
        setLoading((prev) => ({ ...prev, notifications: false }));
      })
      .catch((error) => {
        // If unauthorized or other error, surface a helpful alert
        const msg = error?.response?.status === 401 ? 'Not authorized to fetch notifications.' : 'Error fetching notifications.';
        setAlert({ message: msg, type: 'error', show: true });
        setLoading((prev) => ({ ...prev, notifications: false }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((user) => user._id));
  };

  const sendNotification = () => {
    if (selectedUsers.length === 0 || message.trim() === '') {
      setAlert({ message: 'Please select users and enter a message.', type: 'error', show: true });
      return;
    }

    const notificationData = {
      users: selectedUsers,
      title,
      message,
      status: 'new',
      type: 'general',
    };

    api
      .post('/api/send-notification', notificationData)
      .then((res) => {
        const data = res.data || {};
        // prefer notification returned by server, otherwise fall back to local data
        const created = data.notification || {};
        setNotificationsHistory((prev) => [
          { title: created.title || notificationData.title || '', message: created.message || data.message || notificationData.message, users: created.userIds || data.users || notificationData.users || [], status: created.status || data.status || notificationData.status, createdAt: created.createdAt || new Date().toISOString() },
          ...prev,
        ]);
        setAlert({ message: 'Notification sent successfully.', type: 'success', show: true });
        setMessage('');
        setTitle('');
        setSelectedUsers([]);
        setShowCreateNotification(false);
      })
      .catch((error) => {
        const msg = error?.response?.status === 401 ? 'Not authorized to send notifications.' : 'Error sending notification.';
        setAlert({ message: msg, type: 'error', show: true });
      });
  };

  const filteredNotifications = notificationsHistory.filter((notification) =>
    statusFilter ? notification.status === statusFilter : true
  );

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="notification-management-page">
      {/* Full screen loader */}
      {loading.users || loading.notifications ? (
        <DotLoaderOverlay
          active={true}
          spinnerSize={100}
          color="#36d7b7" // Spinner color
          backgroundColor="rgba(0, 0, 0, 0.7)" // Background overlay color
        />
      ) : null}

      <h1>Notification Management</h1>
      {alert.show && <Alert message={alert.message} type={alert.type} />}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="status-filter">
        <label>Filter by Status: </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="info">Info</option>
          <option value="completed">Completed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="new">New</option>
        </select>
      </div>

      <div className="create-notification-btn">
        <button onClick={() => setShowCreateNotification(!showCreateNotification)}>
          {showCreateNotification ? 'Cancel' : 'Create Notification'}
        </button>
      </div>

      {showCreateNotification && (
        <div className={`notifications-overlay active`} onClick={() => setShowCreateNotification(false)}>
          <div className={`notifications-modal active`} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Create Notification</h3>
              <button onClick={() => setShowCreateNotification(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="user-selection">
              <label>Select Users:</label>
              <div>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                />
                <label>Select All</label>
              </div>

              {loading.users ? (
                <DotLoaderOverlay
                  active={true}
                  spinnerSize={50}
                  color="#36d7b7"
                  backgroundColor="rgba(0, 0, 0, 0.5)"
                />
              ) : (
                filteredUsers.map((user) => (
                  <div key={user._id} className="user-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserSelection(user._id)}
                    />
                    <label>{user.username} ({user.email})</label>
                  </div>
                ))
              )}
            </div>

            <div className="message-input" style={{ marginTop: 12 }}>
              <label>Notification Title (optional):</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a short title for the notification (optional)"
                style={{ width: '100%', padding: 8, marginBottom: 8 }}
              />
              <label>Notification Message:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter the notification message"
                style={{ width: '100%', minHeight: 120, padding: 8 }}
              />
            </div>

            <div className="send-notification" style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowCreateNotification(false)} style={{ padding: '8px 12px' }}>Cancel</button>
              <button onClick={sendNotification} style={{ padding: '8px 12px', background: '#36d7b7', border: 'none', color: '#fff', borderRadius: 4 }}>Send Notification</button>
            </div>
          </div>
        </div>
      )}

      <div className="notifications-history">
        <h2>Notification History</h2>
        {loading.notifications ? (
          <DotLoaderOverlay
            active={true}
            spinnerSize={50}
            color="#36d7b7"
            backgroundColor="rgba(0, 0, 0, 0.5)"
          />
        ) : (
          <ul>
            {filteredNotifications.map((notification, index) => (
              <div
                key={index}
                className={`notification-card ${notification.status}`}
              >
                <h3>{notification.title && notification.title.length ? notification.title : notification.message}</h3>
                <p className="meta">
                  <span className="status">Status: {notification.status}</span>
                  {' '}&middot;{' '}
                  <span className="type">Type: {notification.type}</span>
                </p>
                <p className="time" title={notification.createdAt ? dayjs(notification.createdAt).toString() : ''}>
                  {notification.createdAt ? `${dayjs(notification.createdAt).fromNow()} • ${dayjs(notification.createdAt).format('YYYY-MM-DD HH:mm')}` : 'No date'}
                </p>
                <p className="users">
                  Sent to: {Array.isArray(notification.userIds) && notification.userIds.length > 0
                    ? notification.userIds.map((user) => user.username).join(', ')
                    : 'No users found'}
                </p>
              </div>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;
