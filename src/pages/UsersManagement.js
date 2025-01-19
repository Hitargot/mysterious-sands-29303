import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Alert from "../components/Alert"; // Adjust path as needed
import "../styles/UserManagement.css";
import dayjs from 'dayjs';
import { LineLoaderOverlay } from "react-spinner-overlay"; // Importing the LineLoaderOverlay
import relativeTime from 'dayjs/plugin/relativeTime';

const UserManagement = () => {
  dayjs.extend(relativeTime);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    fullName: "",
    password: "",
  });
  const [alert, setAlert] = useState({ message: "", type: "", show: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState({});
  // const [newNotification, setNewNotification] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [userId, setUserId] = useState(null); // Store the currently selected user ID
  const [filteredUsers, setFilteredUsers] = useState([]); // New state for filtered users
  const [isLoading, setIsLoading] = useState(false); // Loading indicator state



  const triggerAlert = (message, type) => {
    setAlert({ message, type, show: true });
    setTimeout(() => setAlert({ message: "", type: "", show: false }), 3000);
  };

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true); // Start loading
    try {
      const { data } = await axios.get("http://localhost:22222/api/users/users", {
        params: {
          status: filter !== "all" ? filter : undefined,
          search: searchQuery || undefined,
        },
      });
      setUsers(data);
    } catch (error) {
      triggerAlert("Error fetching users", "error");
    } finally {
      setIsLoading(false); // End loading
    }
  }, [filter, searchQuery]); // Add filter and searchQuery as dependencies
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, filter, searchQuery]); // Include filter and searchQuery as dependencies
  

  // Function to refresh the wallet balance of a user
  const fetchWalletBalance = async (userId, index) => {
    try {
      const { data } = await axios.get(`http://localhost:22222/api/users/users/${userId}/wallet`);
      setUsers((prev) =>
        prev.map((user, i) =>
          i === index ? { ...user, walletBalance: data.balance || 0 } : user
        )
      );
    } catch (error) {
      triggerAlert("Error fetching wallet balance", "error");
    }
  };

  // Function to fetch notifications for the selected user
  const fetchNotifications = async (userId) => {
    console.log(`Fetching notifications for user ${userId}...`);
    setNotifications((prevNotifications) => ({
      ...prevNotifications,
      [userId]: [], // Clear any previous notifications for this user
    }));

    try {
      const { data } = await axios.get(`http://localhost:22222/api/users/users/${userId}/notifications`);
      console.log("Fetched notifications:", data);

      const notificationsList = data.notifications || [];
      if (notificationsList.length > 0) {
        setNotifications((prevNotifications) => ({
          ...prevNotifications,
          [userId]: notificationsList,
        }));
        setShowNotificationsModal(true); // Show modal with notifications
      } else {
        triggerAlert("No notifications found for this user", "info");
      }
    } catch (error) {
      console.log("Error fetching notifications:", error);
      triggerAlert("Error fetching notifications", "error");
    }
  };

  // Example of a user selection action
  // Fetch notifications only when the "Fetch Notifications" button is clicked
  const handleFetchNotifications = (user) => {
    setUserId(user._id); // Set the user ID when fetching notifications
    fetchNotifications(user._id); // Fetch notifications for selected user
  };

  // Handle the modal close
  const closeModal = () => {
    setShowNotificationsModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:22222/api/users/users/${selectedUser._id}`, formData);
        triggerAlert("User updated successfully", "success");
      } else {
        await axios.post("http://localhost:22222/api/users/users", formData);
        triggerAlert("User added successfully", "success");
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      triggerAlert("Error saving user", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      phone: "",
      fullName: "",
      password: "",
    });
    setSelectedUser(null);
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:22222/api/users/users/${userToDelete}`);
      triggerAlert("User deleted successfully", "success");
      fetchUsers();
    } catch (error) {
      triggerAlert("Error deleting user", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  const toggleBlockUser = async (userId, isBlocked) => {
    try {
      const response = await axios.put(`http://localhost:22222/api/users/users/${userId}/block`);
      triggerAlert(
        response.data.status === "blocked" ? "User blocked successfully" : "User unblocked successfully",
        "success"
      );
      fetchUsers();
    } catch (error) {
      triggerAlert("Error blocking/unblocking user", "error");
    }
  };

  // const addNotification = async (userId) => {
  //   try {
  //     const response = await axios.post(`http://localhost:22222/api/users/users/${userId}/notifications`, {
  //       message: newNotification,
  //       status: 'info',
  //       type: 'system',
  //     });
  //     setNotifications((prev) => ({
  //       ...prev,
  //       [userId]: [...(prev[userId] || []), response.data],
  //     }));
  //     setNewNotification("");
  //     triggerAlert("Notification added successfully", "success");
  //   } catch (error) {
  //     triggerAlert("Error adding notification", "error");
  //   }
  // };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, filter, searchQuery]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      fullName: user.fullName || "",
      password: "", // We don't prepopulate the password for security
    });
    setIsEditing(true);
  };

  // Filtering users based on search query
  useEffect(() => {
    const filtered = users.filter((user) => {
      return (
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredUsers(filtered);
  }, [searchQuery, users]); // Whenever the searchQuery or users change, filter the list

  return (
    <div>
      <h2>User Management</h2>
      {alert.show && <Alert type={alert.type} message={alert.message} />}

      {/* Filters and Search */}
      <div className="controls">
        <label>Filter: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <LineLoaderOverlay />
      ) : (
        <div className="user-cards">
          {filteredUsers.length === 0 ? (
            <p>No user found</p>
          ) : (
            filteredUsers.map((user, index) => (
              <div key={user._id} className="user-card">
                <h4>{user.username}</h4>
                <p>Email: {user.email}</p>
                <p>Phone: {user.phone}</p>
                <button onClick={() => handleFetchNotifications(user)}>Fetch Notifications</button>
                <p>Wallet Balance: ₦{user.walletBalance || 0}</p>
                <button onClick={() => fetchWalletBalance(user._id, index)}>Refresh Wallet</button>
                <div className="user-actions">
                  <button onClick={() => handleEditClick(user)}>Edit</button>
                  <button onClick={() => toggleBlockUser(user._id, user.status)}>
                    {user.status === "blocked" ? "Unblock" : "Block"}
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleteConfirmOpen(true);
                      setUserToDelete(user._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}


      {isEditing && selectedUser && (
        <div className="modal-overlay active" onClick={resetForm}>
          <div className="modal active" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <h3>Edit User</h3>
              <form onSubmit={handleSubmit}>
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="submit">{isEditing ? "Save Changes" : "Add User"}</button>
              </form>
              <button onClick={() => resetForm()}>Cancel</button>
            </div>
          </div>
        </div>
      )}


      {isDeleteConfirmOpen && userToDelete && (
        <div className="delete-confirmation-overlay active" onClick={(e) => e.stopPropagation()}>
          <div className="delete-confirmation active" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete this user?</p>
            <button onClick={confirmDelete}>Yes</button>
            <button onClick={() => setIsDeleteConfirmOpen(false)}>No</button>
          </div>
        </div>
      )}



      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="notifications-overlay active" onClick={closeModal}>
          <div className="notifications-modal active" onClick={(e) => e.stopPropagation()}>
            <h3>Notifications</h3>
            <div className="notifications-content">
              {notifications[userId] && notifications[userId].length > 0 ? (
                notifications[userId].map((notification) => (
                  <div key={notification._id} className="notification-item">
                    <p>{notification.message}</p>
                    <small>{dayjs(notification.createdAt).fromNow()}</small> {/* Display relative time */}
                  </div>
                ))
              ) : (
                <p>No notifications</p>
              )}
            </div>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}


    </div>
  );
};

export default UserManagement;
