import React, { useState, useEffect, useCallback } from "react";
import { removeAdminToken } from '../utils/adminAuth';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
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
  const [selectedUserDetails, setSelectedUserDetails] = useState(null); // full details fetched on demand
  const [userActivity, setUserActivity] = useState(null); // last login, transactions, presubmission, transfer
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
  const [fetchErrors, setFetchErrors] = useState({}); // per-user fetch errors

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const triggerAlert = (message, type) => {
    setAlert({ message, type, show: true });
    setTimeout(() => setAlert({ message: "", type: "", show: false }), 3000);
  };

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true); // Start loading
    try {
      // use shared api client so baseURL and auth are consistent
      const { data } = await api.get(`/api/users/users`, {
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
  const fetchWalletBalance = async (userId) => {
    try {
      const { data } = await api.get(`/api/users/users/${userId}/wallet`);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, walletBalance: data.balance || 0 } : user
        )
      );
      // if selectedUserDetails is open, update it too
      if (selectedUserDetails && selectedUserDetails._id === userId) {
        setSelectedUserDetails((prev) => ({ ...prev, walletBalance: data.balance || 0 }));
      }
    } catch (error) {
      triggerAlert("Error fetching wallet balance", "error");
    }
  };

  // Function to fetch notifications for the selected user
  const fetchNotifications = async (userId) => {
    console.log(`Fetching notifications for user ${userId}...`);
    setNotifications((prevNotifications) => ({
      ...prevNotifications,
      [userId]: [apiUrl], // Clear any previous notifications for this user
    }));

    try {
  const { data } = await api.get(`/api/users/users/${userId}/notifications`);
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

  // Fetch full user details on demand
  const fetchUserDetails = async (userId) => {
    setIsLoading(true);
    try {
      // Include admin token if available to avoid 401/403 from protected endpoints
  // admin token not needed for this client get (shared client handles auth if configured)
  // const token = localStorage.getItem('adminToken');
  // const headers = token ? { Authorization: `Bearer ${token}` } : {};
  // log the api base and target URL so we can see where requests go in the browser/network panel
  // (the shared client already logs requests; this extra log is intentional for easier debugging)
  // eslint-disable-next-line no-console
  console.debug('[UsersManagement] fetchUserDetails: apiUrl=', apiUrl, 'target=', `${apiUrl}/api/users/users/${userId}`);
  const { data } = await api.get(`/api/users/users/${userId}`);
      setSelectedUserDetails(data);
      // populate form and open editing modal
      setSelectedUser(data);
      setFormData({
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        fullName: data.fullName || '',
        password: '',
      });
      // clear any previous fetch error for this user
      setFetchErrors((prev) => ({ ...prev, [userId]: undefined }));
      setIsEditing(true);
      // fetch additional activity details (last login, last transactions etc.)
      fetchUserActivity(userId).catch((err) => console.warn('fetchUserActivity failed', err));
    } catch (error) {
      // Improve diagnostics: extract status and response body when available
      const status = error?.response?.status;
      const respData = error?.response?.data;
      const serverMsg = respData?.message || respData?.error || error.message || 'Unknown error';
      console.error('Error fetching user details', { userId, status, respData, error });
      setFetchErrors((prev) => ({ ...prev, [userId]: serverMsg }));
      // If endpoint returned 404, try alternate common endpoints automatically before giving up
      if (status === 404) {
        try {
          // try /api/users/:id
          const alt1 = await api.get(`/api/users/${userId}`);
          setSelectedUserDetails(alt1.data);
          setSelectedUser(alt1.data);
          setFormData({
            username: alt1.data.username || '',
            email: alt1.data.email || '',
            phone: alt1.data.phone || '',
            fullName: alt1.data.fullName || '',
            password: '',
          });
          setFetchErrors((prev) => ({ ...prev, [userId]: undefined }));
          setIsEditing(true);
          setIsLoading(false);
          return;
        } catch (altErr) {
          console.warn('Alternate endpoint /api/users/:id also failed', altErr);
        }

        try {
          // try query param style /api/users/users?id=
          const alt2 = await api.get(`/api/users/users`, { params: { id: userId } });
          const record = Array.isArray(alt2.data) ? alt2.data[0] : alt2.data;
          if (record) {
            setSelectedUserDetails(record);
            setSelectedUser(record);
            setFormData({
              username: record.username || '',
              email: record.email || '',
              phone: record.phone || '',
              fullName: record.fullName || '',
              password: '',
            });
            setFetchErrors((prev) => ({ ...prev, [userId]: undefined }));
            setIsEditing(true);
            setIsLoading(false);
            return;
          }
        } catch (altErr2) {
          console.warn('Alternate endpoint /api/users/users?id= also failed', altErr2);
        }
      }

      triggerAlert(`Error fetching user details: ${serverMsg}`, 'error');

      // If unauthorized or forbidden, clear token and redirect to admin login
      if (status === 401 || status === 403) {
        removeAdminToken();
        // small delay so alert shows before redirect
        setTimeout(() => {
          navigate('/admin/login');
        }, 800);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch last login, last transactions (trade, withdrawal), presubmission and transfer info.
  const fetchUserActivity = async (userId) => {
    // shared client (api) will include auth if configured; don't create unused headers here
    const activity = {
      lastLogin: null,
      lastTrade: null,
      lastWithdrawal: null,
      lastPresubmission: null,
      lastTransfer: null,
    };

    try {
      // Try consolidated activity endpoint first
      try {
        const { data } = await api.get(`/api/users/users/${userId}/activity`);
        // Accept either direct fields or nested structure
        activity.lastLogin = data.lastLogin || data.last_login || data.lastLoginAt || data.last_login_at || activity.lastLogin;
        activity.lastTrade = data.lastTrade || data.last_trade || data.lastTransaction || activity.lastTrade;
        activity.lastWithdrawal = data.lastWithdrawal || data.last_withdrawal || activity.lastWithdrawal;
        activity.lastPresubmission = data.lastPresubmission || data.last_presubmission || activity.lastPresubmission;
        activity.lastTransfer = data.lastTransfer || data.last_transfer || activity.lastTransfer;
      } catch (e) {
        // ignore and try individual endpoints
      }

      // last login endpoint
      if (!activity.lastLogin) {
        try {
    const res = await api.get(`/api/users/users/${userId}/last-login`);
          const d = res.data;
          activity.lastLogin = d.lastLogin || d.last_login || d.loggedAt || d.logged_at || d;
        } catch (e) {
          // try alternative path
          try {
            const res2 = await api.get(`/api/users/${userId}/last-login`);
            activity.lastLogin = res2.data.lastLogin || res2.data;
          } catch (err) {
            // give up
          }
        }
      }

      // last trade transaction
      if (!activity.lastTrade) {
        try {
          const res = await api.get(`/api/transactions/last`, { params: { userId, type: 'trade' } });
          activity.lastTrade = Array.isArray(res.data) ? res.data[0] : res.data;
        } catch (e) {
          try {
            const res2 = await api.get(`/api/users/users/${userId}/transactions/last`, { params: { type: 'trade' } });
            activity.lastTrade = Array.isArray(res2.data) ? res2.data[0] : res2.data;
          } catch (err) {}
        }
      }

      // last withdrawal
      if (!activity.lastWithdrawal) {
        try {
          const res = await api.get(`/api/transactions/last`, { params: { userId, type: 'withdrawal' } });
          activity.lastWithdrawal = Array.isArray(res.data) ? res.data[0] : res.data;
        } catch (e) {
          try {
            const res2 = await api.get(`/api/users/users/${userId}/transactions/last`, { params: { type: 'withdrawal' } });
            activity.lastWithdrawal = Array.isArray(res2.data) ? res2.data[0] : res2.data;
          } catch (err) {}
        }
      }

      // last presubmission (if system stores presubmissions)
      if (!activity.lastPresubmission) {
        try {
          const res = await api.get(`/api/presubmissions/last`, { params: { userId } });
          activity.lastPresubmission = Array.isArray(res.data) ? res.data[0] : res.data;
        } catch (e) {
          try {
            const res2 = await api.get(`/api/users/users/${userId}/presubmissions/last`);
            activity.lastPresubmission = Array.isArray(res2.data) ? res2.data[0] : res2.data;
          } catch (err) {}
        }
      }

      // last transfer
      if (!activity.lastTransfer) {
        try {
          const res = await api.get(`/api/transfers/last`, { params: { userId } });
          activity.lastTransfer = Array.isArray(res.data) ? res.data[0] : res.data;
        } catch (e) {
          try {
            const res2 = await api.get(`/api/users/users/${userId}/transfers/last`);
            activity.lastTransfer = Array.isArray(res2.data) ? res2.data[0] : res2.data;
          } catch (err) {}
        }
      }

      setUserActivity(activity);
    } catch (err) {
      console.error('Failed to fetch user activity', { userId, err });
    }
  };

  // Handle the modal close
  const closeModal = () => {
    setShowNotificationsModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/api/users/users/${selectedUser._id}`, formData);
        triggerAlert("User updated successfully", "success");
      } else {
        await api.post(`/api/users/users`, formData);
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
  const response = await api.delete(`/api/users/users/${userToDelete}`);
        triggerAlert(response.data.message, "success");
        fetchUsers();
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Error deleting user";
        triggerAlert(errorMessage, "error");
    } finally {
        setIsDeleteConfirmOpen(false);
    }
};


  const toggleBlockUser = async (userId, isBlocked) => {
    try {
      const response = await api.put(`/api/users/users/${userId}/block`);
      triggerAlert(
        response.data.status === "blocked" ? "User blocked successfully" : "User unblocked successfully",
        "success"
      );
      fetchUsers();
    } catch (error) {
      triggerAlert("Error blocking/unblocking user", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, filter, searchQuery, apiUrl]);

  // edit flow removed from this minimal list view; open Details to edit a user

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
      filteredUsers.map((user) => (
        <div key={user._id} className="user-card">
          <div className="user-header">
            <h4>{user.username}</h4>
            {user.isVerified && <span className="verified-circle"></span>}
          </div>
          {/* Minimal list view: only username and details button */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <button onClick={() => fetchUserDetails(user._id)}>Details</button>
            {fetchErrors[user._id] && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <small style={{ color: '#b91c1c' }}>Error: {fetchErrors[user._id]}</small>
                <button onClick={() => fetchUserDetails(user._id)}>Retry</button>
              </div>
            )}
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
              <h3>User Details</h3>

              {/* Details fetched on demand */}
              <div className="user-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <p><strong>Username:</strong> {selectedUserDetails?.username || selectedUser.username}</p>
                  <p><strong>Email:</strong> {selectedUserDetails?.email || selectedUser.email}</p>
                  <p><strong>Phone:</strong> {selectedUserDetails?.phone || selectedUser.phone}</p>
                  <p><strong>Full name:</strong> {selectedUserDetails?.fullName || selectedUser.fullName || '-'}</p>
                </div>
                <div>
                  <p><strong>Status:</strong> {selectedUserDetails?.status || selectedUser.status || 'active'}</p>
                  <p><strong>Wallet balance:</strong> ₦{selectedUserDetails?.walletBalance ?? selectedUser.walletBalance ?? 0}</p>
                  <p><strong>Created:</strong> {selectedUserDetails?.createdAt ? dayjs(selectedUserDetails.createdAt).format('YYYY-MM-DD HH:mm') : (selectedUser.createdAt ? dayjs(selectedUser.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A')}</p>
                  <p><strong>Last login:</strong> {userActivity?.lastLogin ? (typeof userActivity.lastLogin === 'string' ? dayjs(userActivity.lastLogin).format('YYYY-MM-DD HH:mm') : (userActivity.lastLogin.createdAt ? dayjs(userActivity.lastLogin.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A')) : (selectedUserDetails?.lastLogin ? dayjs(selectedUserDetails.lastLogin).format('YYYY-MM-DD HH:mm') : (selectedUser.lastLogin ? dayjs(selectedUser.lastLogin).format('YYYY-MM-DD HH:mm') : 'N/A'))}</p>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <button onClick={() => handleFetchNotifications(selectedUser)}>Fetch Notifications</button>
                <button onClick={() => fetchWalletBalance(selectedUser._id)}>Refresh Wallet</button>
                <button onClick={() => { setIsDeleteConfirmOpen(true); setUserToDelete(selectedUser._id); }}>Delete</button>
                <button onClick={() => toggleBlockUser(selectedUser._id, selectedUser.status)}>
                  {selectedUser.status === 'blocked' ? 'Unblock' : 'Block'}
                </button>
              </div>

              {/* Activity Summary */}
              <div style={{ marginTop: 16 }}>
                <h4>Recent activity</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <p><strong>Last trade:</strong></p>
                    {userActivity?.lastTrade ? (
                      <div>
                        <div>ID: {userActivity.lastTrade.transactionId || userActivity.lastTrade.id || userActivity.lastTrade._id || '-'}</div>
                        <div>Amount: {userActivity.lastTrade.amount ?? userActivity.lastTrade.value ?? '-'}</div>
                        <div>Date: {userActivity.lastTrade.createdAt ? dayjs(userActivity.lastTrade.createdAt).format('YYYY-MM-DD HH:mm') : (userActivity.lastTrade.date ? dayjs(userActivity.lastTrade.date).format('YYYY-MM-DD HH:mm') : 'N/A')}</div>
                      </div>
                    ) : (<div>No recent trade</div>)}
                  </div>

                  <div>
                    <p><strong>Last withdrawal:</strong></p>
                    {userActivity?.lastWithdrawal ? (
                      <div>
                        <div>ID: {userActivity.lastWithdrawal.transactionId || userActivity.lastWithdrawal.id || userActivity.lastWithdrawal._id || '-'}</div>
                        <div>Amount: {userActivity.lastWithdrawal.amount ?? userActivity.lastWithdrawal.value ?? '-'}</div>
                        <div>Date: {userActivity.lastWithdrawal.createdAt ? dayjs(userActivity.lastWithdrawal.createdAt).format('YYYY-MM-DD HH:mm') : (userActivity.lastWithdrawal.date ? dayjs(userActivity.lastWithdrawal.date).format('YYYY-MM-DD HH:mm') : 'N/A')}</div>
                      </div>
                    ) : (<div>No recent withdrawal</div>)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <div>
                    <p><strong>Last presubmission:</strong></p>
                    {userActivity?.lastPresubmission ? (
                      <div>
                        <div>ID: {userActivity.lastPresubmission.preId || userActivity.lastPresubmission.id || userActivity.lastPresubmission._id || '-'}</div>
                        <div>Date: {userActivity.lastPresubmission.createdAt ? dayjs(userActivity.lastPresubmission.createdAt).format('YYYY-MM-DD HH:mm') : (userActivity.lastPresubmission.date ? dayjs(userActivity.lastPresubmission.date).format('YYYY-MM-DD HH:mm') : 'N/A')}</div>
                      </div>
                    ) : (<div>No presubmission</div>)}
                  </div>

                  <div>
                    <p><strong>Last transfer:</strong></p>
                    {userActivity?.lastTransfer ? (
                      <div>
                        <div>ID: {userActivity.lastTransfer.transactionId || userActivity.lastTransfer.id || userActivity.lastTransfer._id || '-'}</div>
                        <div>Amount: {userActivity.lastTransfer.amount ?? userActivity.lastTransfer.value ?? '-'}</div>
                        <div>Date: {userActivity.lastTransfer.createdAt ? dayjs(userActivity.lastTransfer.createdAt).format('YYYY-MM-DD HH:mm') : (userActivity.lastTransfer.date ? dayjs(userActivity.lastTransfer.date).format('YYYY-MM-DD HH:mm') : 'N/A')}</div>
                      </div>
                    ) : (<div>No transfer</div>)}
                  </div>
                </div>
              </div>

              <hr />

              <h4>Edit User</h4>
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
              <button onClick={() => resetForm()}>Close</button>
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


