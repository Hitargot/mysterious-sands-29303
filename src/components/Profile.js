import React, { useState, useEffect } from "react";
import Alert from "./Alert";
import axios from "axios";
import { FaClipboard } from 'react-icons/fa';  // Import the clipboard icon


const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    isVerified: false,
    referralCode: "",
    referrer: null,  // Holds referrer information
    referredCount: 0, // Holds the number of referred users
    totalFunded: 0,  // Holds the total amount funded
    totalWithdrawn: 0, // Holds the total amount withdrawn
    referralBonusEarned: 0,
  });

  const [showWalletSummary, setShowWalletSummary] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", show: false });

  const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";
  const FRONTEND_URL = "https://exdollarium-preview.netlify.app";
  //const FRONTEND_URL = "http://localhost:3000";

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
  
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data);
        console.log("Fetched user info:", response.data);

      } catch (error) {
        setAlert({ message: "Error fetching profile data", type: "error", show: true });
      }
    };
  
    fetchProfileData();
  }, [token, apiUrl]);
  
  // Move toggle function here
  const toggleWalletSummary = () => {
    setShowWalletSummary(prev => !prev);
  };
  

  const handleEditProfile = () => {
    setIsEditing(true);
    setNewFullName(userInfo.fullName);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/user/update-profile`,
        { fullName: newFullName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ message: response.data.message, type: "success", show: true });
      setIsEditing(false);
      setUserInfo((prev) => ({ ...prev, fullName: newFullName }));
    } catch (error) {
      setAlert({ message: "Failed to update profile", type: "error", show: true });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setAlert({ message: "Passwords do not match", type: "error", show: true });
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/user/update-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ message: response.data.message, type: "success", show: true });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setAlert({ message: "Failed to update password", type: "error", show: true });
    }
  };

  const closeAlert = () => setAlert({ ...alert, show: false });

  return (
    <div style={styles.profilePage}>
      <h2 style={styles.heading}>Edit Profile</h2>

      {/* Personal Info */}
      <div style={styles.section}>
        <h3 style={styles.subHeading}>Personal Information</h3>
        <label style={styles.label}>
          Full Name:
          {isEditing ? (
            <input
              type="text"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              style={styles.input}
            />
          ) : (
            <p style={styles.text}>{userInfo.fullName}</p>
          )}
        </label>
        <label style={styles.label}>
          Email:
          <p style={styles.text}>
            {userInfo.email}{" "}
            {userInfo.isVerified ? (
              <span style={{ color: "green", fontWeight: "bold" }}>✅ Verified</span>
            ) : (
              <span style={{ color: "red", fontWeight: "bold" }}>❌ Not Verified</span>
            )}
          </p>
        </label>
        <label style={styles.label}>
          Phone Number:
          <p style={styles.text}>{userInfo.phone}</p>
        </label>
      </div>

      {/* Referral Info */}
<div style={styles.section}>
  <h3 style={styles.subHeading}>Referral Program</h3>

  <label style={styles.label}>
        Your Referral Code:
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FaClipboard style={{ marginRight: '10px', cursor: 'pointer' }} />
          <p style={styles.text}>{userInfo.referralCode}</p>
        </div>
      </label>

      <label style={styles.label}>
        Referral Link:
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FaClipboard style={{ marginRight: '10px', cursor: 'pointer' }} />
          <p style={styles.text}>{`${FRONTEND_URL}/signup?referralCode=${userInfo.referralCode}`}</p>
        </div>
      </label>

  <label style={styles.label}>
    Referred By:
    <p style={styles.text}>{userInfo.referrer ? userInfo.referrer.username : 'No referrer'}</p>
  </label>

  <label style={styles.label}>
    Users You Have Referred:
    <p style={styles.text}>{userInfo.referredCount}</p>
  </label>

  <label style={styles.label}>
    **Total Referral Earnings:**  
    <p style={{ ...styles.text, fontWeight: 'bold', color: 'green' }}>
      ₦{userInfo.referralBonusEarned ? userInfo.referralBonusEarned.toLocaleString() : 0}
    </p>
  </label>
</div>


      {/* Toggle Wallet Summary Button */}
      <button style={styles.toggleButton} onClick={toggleWalletSummary}>
        {showWalletSummary ? "Hide Wallet Summary" : "Show Wallet Summary"}
      </button>

      {/* Wallet Summary - Visible Only When Toggled */}
      {showWalletSummary && (
        <div style={styles.section}>
          <h3 style={styles.subHeading}>Wallet Summary</h3>
          <label style={styles.label}>
            <strong>Total Deposited:</strong>
            <p style={styles.text}>₦{userInfo.totalFunded.toLocaleString()}</p>
          </label>
          <label style={styles.label}>
            <strong>Total Withdrawn:</strong>
            <p style={styles.text}>₦{userInfo.totalWithdrawn.toLocaleString()}</p>
          </label>
        </div>
      )}

      {isEditing ? (
        <button style={styles.saveButton} onClick={handleSaveProfile}>
          Save Changes
        </button>
      ) : (
        <button style={styles.editButton} onClick={handleEditProfile}>
          Edit Profile
        </button>
      )}



      {/* Change Password */}
      <div style={styles.section}>
        <h3 style={styles.subHeading}>Change Password</h3>
        <label style={styles.label}>
          Current Password:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
        </label>
        <button style={styles.saveButton} onClick={handlePasswordChange}>
          Save Changes
        </button>
      </div>

      {alert.show && <Alert message={alert.message} type={alert.type} onClose={closeAlert} />}
    </div>
  );
};

// Inline Styles
const styles = {
  profilePage: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "25px",
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#f1e4d1",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  heading: {
    color: "#162660",
    fontSize: "22px",
    marginBottom: "20px",
  },
  section: {
    backgroundColor: "#d0e6fd",
    padding: "20px",
    marginBottom: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
  },
  subHeading: {
    color: "#162660",
    fontSize: "18px",
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#162660",
    marginTop: "10px",
  },

  text: {
    padding: "10px",
    background: "#fff",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  editButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
    backgroundColor: "#162660",
    color: "white",
  },
  saveButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#162660",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
  },
  toggleButton: {
    padding: "10px 15px",
    margin: "10px 0",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  toggleButtonHover: {
    backgroundColor: "#0056b3",
  },
};

export default Profile;
