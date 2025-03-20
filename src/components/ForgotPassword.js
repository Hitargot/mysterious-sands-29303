import React, { useState } from "react";
import axios from "axios";
import Alert from "./Alert"; // Assuming you have this alert component
import { Link } from "react-router-dom"; // Import Link for routing

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  //const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  const apiUrl = "http://localhost:22222";


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });
      setAlert({ type: "success", message: response.data.message });
      setEmail(""); // Clear the input field

      // Reset alert after 3 seconds
      setTimeout(() => {
        setAlert({ type: "", message: "" }); // Clear alert
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      setAlert({ type: "error", message: errorMsg });

      // Reset alert after 3 seconds
      setTimeout(() => {
        setAlert({ type: "", message: "" }); // Clear alert
      }, 3000);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div style={styles.forgotPassword}>
      <div style={styles.forgotContainer}>
        <header style={styles.forgotHeader}>
          <div style={styles.logo}>
            <img src={require("../assets/images/Exodollarium-01.png")} alt="Exdollarium logo" style={styles.logoImg} />
            <span>EXDOLLARIUM</span>
          </div>
          <nav>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/login" style={styles.navLink}>Login</Link>
          </nav>
        </header>

        <h2 style={styles.heading}>Forgot Password</h2>

        {/* Alert Component */}
        {alert.message && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
        )}

        <form onSubmit={handleSubmit} style={styles.forgotForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <footer style={styles.footerLinks}>
          <p>Already have an account? <Link to="/login" style={styles.footerLink}>Login</Link></p>
          <p>Don't have an account? <Link to="/signup" style={styles.footerLink}>Sign Up here</Link></p>
        </footer>
      </div>
    </div>
  );
};

export default ForgotPassword;

// INLINE STYLES
const styles = {
  forgotPassword: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d0e6fd", // Light Blue
    padding: "20px",
  },
  forgotContainer: {
    width: "90%",
    maxWidth: "400px",
    padding: "25px",
    backgroundColor: "#162660", // Dark Blue
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
  },
  forgotHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    color: "#f1e4d1", // Cream
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  logoImg: {
    height: "40px",
    marginRight: "10px",
  },
  navLink: {
    marginLeft: "15px",
    textDecoration: "none",
    color: "#f1e4d1", // Cream
    transition: "color 0.3s ease-in-out",
  },
  heading: {
    color: "#f1e4d1", // Cream
    fontSize: "1.5rem",
  },
  forgotForm: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  formGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  label: {
    color: "#f1e4d1", // Cream
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d0e6fd", // Light Blue
    borderRadius: "5px",
    background: "transparent",
    color: "#f1e4d1", // Cream
    fontSize: "1rem",
  },
  button: {
    backgroundColor: "#d0e6fd", // Light Blue
    color: "#162660", // Dark Blue
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease-in-out",
    fontSize: "1rem",
  },
  footerLinks: {
    marginTop: "15px",
    color: "#f1e4d1", // Cream
  },
  footerLink: {
    color: "#d0e6fd", // Light Blue
    textDecoration: "none",
  },
};
