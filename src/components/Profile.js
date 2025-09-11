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
    // totalSentTransfers: 0,
    referralBonusEarned: 0,
    payId: "", // ✅ add payId
  });

  const [newPayId, setNewPayId] = useState(""); // ✅ input for Pay ID
  const [isEditingPayId, setIsEditingPayId] = useState(false);
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

  const apiUrl = process.env.REACT_APP_API_URL;
  //const FRONTEND_URL = "https://exdollarium-preview.netlify.app";
  const FRONTEND_URL = "https://exdollarium.com";




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

  // ✅ Save Pay ID
  const handleSavePayId = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/user/set-payid`,
        { payId: newPayId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ message: response.data.message, type: "success", show: true });
      setUserInfo((prev) => ({ ...prev, payId: response.data.payId }));
      setIsEditingPayId(false);
    } catch (error) {
      setAlert({
        message: error.response?.data?.message || "Failed to set Pay ID",
        type: "error",
        show: true,
      });
    }
  };

  const handleClipboardCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setClipboardMessage("Copied to clipboard!");
        setTimeout(() => setClipboardMessage(""), 2000);
      })
      .catch(() => {
        setClipboardMessage("Failed to copy!");
      });
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

  // const handleClipboardCopy = (text) => {
  //   navigator.clipboard.writeText(text)
  //     .then(() => {
  //       setClipboardMessage("Copied to clipboard!");
  //       setTimeout(() => setClipboardMessage(""), 2000); // Clear the message after 2 seconds
  //     })
  //     .catch(() => {
  //       setClipboardMessage("Failed to copy!");
  //     });
  // };

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

      {/* ✅ Pay ID Section */}
      <div style={styles.section}>
        <h3 style={styles.subHeading}>Your Pay ID</h3>
        {isEditingPayId ? (
          <>
            <input
              type="text"
              value={newPayId}
              onChange={(e) => setNewPayId(e.target.value)}
              style={styles.input}
              placeholder="Enter Pay ID"
            />
            <button style={styles.saveButton} onClick={handleSavePayId}>
              Save Pay ID
            </button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p style={styles.text}>
              {userInfo.payId ? userInfo.payId : "Not set yet"}
            </p>
            {userInfo.payId && (
              <FaClipboard
                style={{ cursor: "pointer" }}
                onClick={() => handleClipboardCopy(userInfo.payId)}
              />
            )}
            <button
              style={styles.editButton}
              onClick={() => {
                setIsEditingPayId(true);
                setNewPayId(userInfo.payId || "");
              }}
            >
              {userInfo.payId ? "Update" : "Set"} Pay ID
            </button>
          </div>
        )}
      </div>

      {clipboardMessage && (
        <div style={styles.clipboardMessage}>{clipboardMessage}</div>
      )}

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
            <p style={styles.text}>₦{userInfo.totalWithdrawn.toLocaleString() || "0"}</p>
          </label>
          {/* <label style={styles.label}>
            <strong>Total Transferred:</strong>
            <p style={styles.text}>₦{userInfo.totalSentTransfers}</p>
          </label> */}
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
    maxWidth: "720px",
    margin: "50px auto",
    padding: "30px",
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  },
  heading: {
    color: "#1A237E",
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "25px",
  },
  section: {
    backgroundColor: "#F0F4FF",
    padding: "25px",
    marginBottom: "20px",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
    textAlign: "left",
    transition: "all 0.3s ease",
  },
  subHeading: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#0D47A1",
  },
  label: {
    display: "block",
    marginBottom: "12px",
    color: "#0D47A1",
    fontWeight: "500",
  },
  text: {
    color: "#424242",
    fontSize: "16px",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #BDBDBD",
    marginBottom: "16px",
    fontSize: "15px",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  inputFocus: {
    borderColor: "#1A237E",
    boxShadow: "0 0 5px rgba(26, 35, 126, 0.3)",
  },
  clipboardMessage: {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#E0F7FA",
    color: "#00796B",
    fontWeight: "600",
    borderRadius: "6px",
    textAlign: "center",
  },
  toggleButton: {
    backgroundColor: "#7B1FA2",
    color: "#fff",
    padding: "14px 25px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "25px",
    fontWeight: "500",
    transition: "background-color 0.3s ease",
  },
  editButton: {
    backgroundColor: "#1976D2",
    color: "#fff",
    padding: "10px 22px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "background-color 0.3s ease",
  },
  saveButton: {
    backgroundColor: "#388E3C",
    color: "#fff",
    padding: "14px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "20px",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
  },

};

export default Profile;
