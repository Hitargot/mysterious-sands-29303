import React, { useState, useEffect } from 'react';
import Alert from './Alert';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({ fullName: '', email: '', phone: '' });
  const [newFullName, setNewFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '', show: false });

  const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";



  // Redirect if no token found
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';  // Redirect to login if no token found
      return;
    }

    // Fetch profile data from the server
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setAlert({ message: 'Error fetching profile data', type: 'error', show: true });
      }
    };

    fetchProfileData();
  }, [token, apiUrl]); // Ensure effect only runs once

  const handleEditProfile = () => {
    setIsEditing(true);
    setNewFullName(userInfo.fullName); // Pre-fill with current name
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/user/update-profile`,
        { fullName: newFullName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ message: response.data.message, type: 'success', show: true });
      setIsEditing(false);
      setUserInfo((prev) => ({ ...prev, fullName: newFullName }));
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({ message: 'Failed to update profile', type: 'error', show: true });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setAlert({ message: 'Passwords do not match', type: 'error', show: true });
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/user/update-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ message: response.data.message, type: 'success', show: true });

      // Clear password fields after success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setAlert({ message: 'Failed to update password', type: 'error', show: true });
    }
  };

  const closeAlert = () => setAlert({ ...alert, show: false });

  return (
    <div className="profile-page">
      <h2>Edit Profile</h2>

      <div className="profile-section">
        <h3>Personal Information</h3>
        <label>
          Full Name:
          {isEditing ? (
            <input
              type="text"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
            />
          ) : (
            <p>{userInfo.fullName}</p>
          )}
        </label>
        <label>
          Email:
          <p>{userInfo.email}</p>
        </label>
        <label>
          Phone Number:
          <p>{userInfo.phone}</p>
        </label>
      </div>

      {isEditing ? (
        <button className="save-profile-btn" onClick={handleSaveProfile}>Save Profile</button>
      ) : (
        <button className="edit-profile-btn" onClick={handleEditProfile}>Edit Profile</button>
      )}

      <div className="password-section">
        <h3>Change Password</h3>
        <label>
          Current Password:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label>
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <button onClick={handlePasswordChange}>Change Password</button>
      </div>

      {alert.show && (
        <Alert message={alert.message} type={alert.type} onClose={closeAlert} />
      )}
    </div>
  );
};

export default Profile;
