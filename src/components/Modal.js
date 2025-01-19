import React from 'react';
import "../styles/Modal.css"; // Make sure to create a CSS file for modal styling

const Modal = ({
  show,
  onClose,
  onSendNotification,
  users = [],  // Default to an empty array if users is undefined
  selectedUserIds = [],  // Default to an empty array if selectedUserIds is undefined
  handleUserSelection,
  message,
  setMessage,
  searchQuery,   // Destructure searchQuery from props
  setSearchQuery // Destructure setSearchQuery from props
}) => {
  if (!show) return null; // Return null if the modal isn't shown

  // Function to handle "Select All" checkbox change
  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      // Deselect all if all users are already selected
      handleUserSelection([]);
    } else {
      // Select all users if not all are selected
      handleUserSelection(users.map(user => user._id)); // Using user._id as userIds
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create Notification</h2>
        <div className="modal-body">
          <div className="user-selection">
            {/* Select All checkbox */}
            <div className="select-all">
              <input
                type="checkbox"
                checked={selectedUserIds.length === users.length && users.length > 0}  // Check if all users are selected
                onChange={handleSelectAll}
              />
              <label>Select All</label>
            </div>

            {/* Search and user list */}
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery} // Bind value to searchQuery
              onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery
            />
            {users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
              <div key={user._id} className="user-checkbox">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user._id)}  // Check if this user is selected based on their ID
                  onChange={() => handleUserSelection(user._id)}  // Pass the user ID for selection/deselection
                />
                <label>{user.username} ({user.email})</label>
              </div>
            ))}
          </div>

          <div className="message-input">
            <label>Notification Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the notification message"
            />
          </div>

          <div className="modal-actions">
            <button onClick={onClose}>Close</button>
            <button onClick={onSendNotification}>Send Notification</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
