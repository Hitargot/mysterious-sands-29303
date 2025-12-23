import React, { useEffect } from 'react';
import "../styles/Modal.css"; // Make sure to create a CSS file for modal styling

const Modal = ({
  // Core visibility / basic content props
  show,
  children,
  onClose,
  title,

  // Notification-specific props (optional)
  onSendNotification,
  users = [],
  selectedUserIds = [],
  handleUserSelection,
  message,
  setMessage,
  searchQuery = '',
  setSearchQuery
}) => {
  // Close on Escape when shown
  useEffect(() => {
    if (!show) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose && onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, show]);

  if (!show) return null; // Don't render when hidden

  // Function to handle "Select All" checkbox change
  const handleSelectAll = () => {
    if (!handleUserSelection) return;
    if (selectedUserIds.length === users.length) {
      // Deselect all if all users are already selected
      handleUserSelection([]);
    } else {
      // Select all users if not all are selected
      handleUserSelection(users.map(user => user._id)); // Using user._id as userIds
    }
  };

  // Helper for backdrop click -> close only when clicking overlay
  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose && onClose();
  };

  return (
    <div className="modal-overlay" onClick={onOverlayClick}>
      <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {title ? <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2> : null}
          <button onClick={() => onClose && onClose()} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        <div className="modal-body">
          {/* Render any children first (allows custom content) */}
          {children}

          {/* If users-related props are provided, render notification UI */}
          {(handleUserSelection || users.length > 0) && (
            <div className="user-selection" style={{ marginTop: 12 }}>
              {/* Select All checkbox */}
              <div className="select-all" style={{ marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={users.length > 0 && selectedUserIds.length === users.length}  // Check if all users are selected
                  onChange={handleSelectAll}
                />
                <label style={{ marginLeft: 8 }}>Select All</label>
              </div>

              {/* Search and user list (only if users provided) */}
              {users && users.length > 0 && (
                <>
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchQuery} // Bind value to searchQuery
                    onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)} // Update searchQuery if setter provided
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  {users
                    .filter(user => {
                      const q = (searchQuery || '').toLowerCase();
                      return !q || user.username.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
                    })
                    .map((user) => (
                      <div key={user._id} className="user-checkbox" style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user._id)}  // Check if this user is selected based on their ID
                          onChange={() => handleUserSelection && handleUserSelection(user._id)}  // Pass the user ID for selection/deselection
                        />
                        <label style={{ marginLeft: 8 }}>{user.username} ({user.email})</label>
                      </div>
                    ))}
                </>
              )}
            </div>
          )}

          {/* Message input (if setters provided) */}
          {(typeof setMessage === 'function') && (
            <div className="message-input" style={{ marginTop: 12 }}>
              <label>Notification Message:</label>
              <textarea
                value={message || ''}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter the notification message"
                style={{ width: '100%', minHeight: 80 }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions" style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={onClose}>Close</button>
            {typeof onSendNotification === 'function' && <button onClick={onSendNotification}>Send Notification</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
