import { useNavigate } from "react-router-dom";
import React from "react";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const handleAcceptTerms = () => {
    localStorage.setItem("termsAccepted", "true");
    navigate("/signup", { state: { agreed: true } });
  };

  const handleDeclineTerms = () => {
    navigate("/");
  };

  const styles = {
    container: {
      maxWidth: "600px",
      margin: "50px auto",
      padding: "20px",
      backgroundColor: "#162660",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      color: "#f1e4d1",
      textAlign: "center",
    },
    heading: {
      fontSize: "1.8rem",
      marginBottom: "15px",
    },
    content: {
      textAlign: "left",
      lineHeight: "1.5",
      fontSize: "1rem",
      marginBottom: "20px",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
    },
    button: {
      flex: 1,
      backgroundColor: "#d0e6fd",
      color: "#162660",
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "background-color 0.3s ease-in-out",
    },
    declineButton: {
      backgroundColor: "#e74c3c",
      color: "#fff",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Terms & Conditions</h2>
      <div style={styles.content}>
        <p>Welcome to Exdollarium! By using our services, you agree to the following terms:</p>
        <ul>
          <li>You must be at least 18 years old to use our platform.</li>
          <li>All transactions are final and non-reversible.</li>
          <li>We do not tolerate fraudulent activities and reserve the right to take necessary action.</li>
          <li>Your personal data is protected and will not be shared without your consent.</li>
          <li>We reserve the right to update these terms at any time.</li>
        </ul>
        <p>If you agree to these terms, click "Accepted" to proceed. Otherwise, click "Decline" to return to the homepage.</p>
      </div>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleAcceptTerms}>
          Accepted
        </button>
        <button style={{ ...styles.button, ...styles.declineButton }} onClick={handleDeclineTerms}>
          Decline
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditions;
