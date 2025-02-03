import React, { useState, useEffect } from 'react';
import { DotLoaderOverlay } from 'react-spinner-overlay'; // Spinner for loading
import "../styles/NotificationManagement.css";
import Alert from '../components/Alert';

const NotificationManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [notificationsHistory, setNotificationsHistory] = useState([]);
  const [alert, setAlert] = useState({ message: '', type: '', show: false });
  const [loading, setLoading] = useState({ users: true, notifications: true });
  const [showCreateNotification, setShowCreateNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222"; 

  useEffect(() => {
    fetch(`${apiUrl}/api/users`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, users: false }));
      })
      .catch((error) => {
        setAlert({ message: 'Error fetching users.', type: 'error', show: true });
        setLoading((prev) => ({ ...prev, users: false }));
      });
  }, [apiUrl]);

  useEffect(() => {
    fetch(`${apiUrl}/api/notifications`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setNotificationsHistory(Array.isArray(data) ? data.reverse() : []);
        setLoading((prev) => ({ ...prev, notifications: false }));
      })
      .catch((error) => {
        setAlert({ message: 'Error fetching notifications.', type: 'error', show: true });
        setLoading((prev) => ({ ...prev, notifications: false }));
      });
  }, [apiUrl]);

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
      message,
      status: 'new',
      type: 'general',
    };

    fetch(`${apiUrl}/api/send-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData),
    })
      .then((response) => response.json())
      .then((data) => {
        setNotificationsHistory((prev) => [
          { message: data.message, users: data.users || [], status: 'new' },
          ...prev,
        ]);
        setAlert({ message: 'Notification sent successfully.', type: 'success', show: true });
        setMessage('');
        setSelectedUsers([]);
        setShowCreateNotification(false);
      })
      .catch((error) => {
        setAlert({ message: 'Error sending notification.', type: 'error', show: true });
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
        <div className="create-notification-form">
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

          <div className="message-input">
            <label>Notification Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the notification message"
            />
          </div>

          <div className="send-notification">
            <button onClick={sendNotification}>Send Notification</button>
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
                <h3>{notification.message}</h3>
                <p className="status">Status: {notification.status}</p>
                <p className="type">Type: {notification.type}</p>
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
