import React, { useState, useEffect } from "react";
import Alert from "./Alert";
import axios from "axios";
import { FaClipboard } from 'react-icons/fa';  // Import the clipboard icon

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isVerified: false,
    referralCode: "",
    referrer: null,
    referredCount: 0,
    totalFunded: 0,
    totalWithdrawn: 0,
    referralBonusEarned: 0,
  });


  const [showWalletSummary, setShowWalletSummary] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", show: false });
  const [clipboardMessage, setClipboardMessage] = useState(""); // Clipboard message state

  const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

  // const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const FRONTEND_URL = "https://exdollarium-preview.netlify.app";
  const FRONTEND_URL = "https://exdollarium.com";
  const apiUrl = 'http://localhost:22222';



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
      } catch (error) {
        setAlert({ message: "Error fetching profile data", type: "error", show: true });
      }
    };
    fetchProfileData();
  }, [token, apiUrl]);

  const toggleWalletSummary = () => {
    setShowWalletSummary(prev => !prev);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setNewFirstName(userInfo.firstName);
    setNewLastName(userInfo.lastName);
  };


  const handleSaveProfile = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/user/update-profile`,
        {
          firstName: newFirstName,
          lastName: newLastName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ message: response.data.message, type: "success", show: true });
      setIsEditing(false);
      setUserInfo((prev) => ({
        ...prev,
        firstName: newFirstName,
        lastName: newLastName
      }));
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

  const handleClipboardCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setClipboardMessage("Copied to clipboard!");
        setTimeout(() => setClipboardMessage(""), 2000); // Clear the message after 2 seconds
      })
      .catch(() => {
        setClipboardMessage("Failed to copy!");
      });
  };

  const formatEmail = (email) => {
    const [localPart, domain] = email.split('@'); // Split the email into local part and domain
    const formattedLocal = localPart[0] + '****'; // Show only the first letter and replace the rest with ****
    return formattedLocal + '@' + domain;
  };

  const closeAlert = () => setAlert({ ...alert, show: false });

  return (
    <div style={styles.profilePage}>
      <h2 style={styles.heading}>Edit Profile</h2>

      {/* Personal Info */}
      <div style={styles.section}>
        <h3 style={styles.subHeading}>Personal Information</h3>
        <label style={styles.label}>
          First Name:
          {isEditing ? (
            <input
              type="text"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              style={styles.input}
            />
          ) : (
            <p style={styles.text}>{userInfo.firstName}</p>
          )}
        </label>

        <label style={styles.label}>
          Last Name:
          {isEditing ? (
            <input
              type="text"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              style={styles.input}
            />
          ) : (
            <p style={styles.text}>{userInfo.lastName}</p>
          )}
        </label>

        <label style={styles.label}>
          Email:
          <p style={styles.text}>
            {formatEmail(userInfo.email)}{" "}
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


        {isEditing ? (
          <button style={styles.saveButton} onClick={handleSaveProfile}>
            Save Changes
          </button>
        ) : (
          <button style={styles.editButton} onClick={handleEditProfile}>
            Edit Profile
          </button>
        )}
      </div>


      {/* Referral Info */}
      <div style={styles.section}>
        <h3 style={styles.subHeading}>Referral Program</h3>

        <label style={styles.label}>
          Your Referral Code:
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaClipboard
              style={{ marginRight: '10px', cursor: 'pointer' }}
              onClick={() => handleClipboardCopy(userInfo.referralCode)}
            />
            <p style={styles.text}>{userInfo.referralCode}</p>
          </div>
        </label>

        <label style={styles.label}>
          Referral Link:
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaClipboard
              style={{ marginRight: '10px', cursor: 'pointer' }}
              onClick={() => handleClipboardCopy(`${FRONTEND_URL}/signup?referralCode=${userInfo.referralCode}`)}
            />
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
          Total Referral Earnings:
          <p style={{ ...styles.text, fontWeight: 'bold', color: 'green' }}>
            ₦{userInfo.referralBonusEarned ? userInfo.referralBonusEarned.toLocaleString() : 0}
          </p>
        </label>
      </div>

      {/* Clipboard Copy Confirmation */}
      {clipboardMessage && (
        <div style={styles.clipboardMessage}>
          {clipboardMessage}
        </div>
      )}

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
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    color: "#004d78",
  },
  text: {
    color: "#333",
    fontSize: "16px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "15px",
  },
  clipboardMessage: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#d1f5e0",
    color: "#388e3c",
    fontWeight: "bold",
    borderRadius: "5px",
  },
  toggleButton: {
    backgroundColor: "#f3a8e3",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  editButton: {
    backgroundColor: "#0058a3",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  saveButton: {
    backgroundColor: "#00a852",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
  },
};

export default Profile;
