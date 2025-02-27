import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [alertDuration] = useState(3000);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com" || "http://localhost:22222";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent multiple submissions

    // Validate password
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setAlertMessage(
        "Password must be at least 8 characters long and include letters, numbers, and symbols."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlertMessage("Passwords do not match.");
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await axios.post(`${apiUrl}/api/auth/signup`, {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (response.status !== 201) {
        setAlertMessage(response.data.message || "Signup failed");
        return;
      }

      setAlertMessage("Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setAlertMessage(
        err.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Styles
  const styles = {
    signup: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#d0e6fd",
      padding: "20px",
    },
    signupContainer: {
      width: "90%",
      maxWidth: "400px",
      padding: "25px",
      backgroundColor: "#162660",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      textAlign: "center",
    },
    signupHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      color: "#f1e4d1",
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
      color: "#f1e4d1",
      transition: "color 0.3s ease-in-out",
    },
    heading: {
      color: "#f1e4d1",
      fontSize: "1.5rem",
    },
    signupForm: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
    },
    formGroup: {
      marginBottom: "15px",
      textAlign: "left",
    },
    label: {
      color: "#f1e4d1",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #d0e6fd",
      borderRadius: "5px",
      background: "transparent",
      color: "#f1e4d1",
      fontSize: "1rem",
    },
    button: {
      backgroundColor: loading ? "#a3c0e5" : "#d0e6fd", // Dim button when loading
      color: "#162660",
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      fontWeight: "bold",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "background-color 0.3s ease-in-out",
      fontSize: "1rem",
    },
    footerLinks: {
      marginTop: "15px",
      color: "#f1e4d1",
    },
    footerLink: {
      color: "#d0e6fd",
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.signup}>
      <div style={styles.signupContainer}>
        {/* Header */}
        <div style={styles.signupHeader}>
          <div style={styles.logo}>
            <img
              src={require("../assets/images/Exodollarium-01.png")}
              alt="Logo"
              style={styles.logoImg}
            />
            <span>Exdollarium</span>
          </div>
          <nav>
            <Link to="/" style={styles.navLink}>
              Home
            </Link>
            <Link to="/login" style={styles.navLink}>
              Login
            </Link>
          </nav>
        </div>

        {/* Alert */}
        {alertMessage && (
          <Alert
            message={alertMessage}
            duration={alertDuration}
            onClose={() => setAlertMessage("")}
          />
        )}

        <h2 style={styles.heading}>Signup</h2>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={styles.signupForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        {/* Footer Links */}
        <div style={styles.footerLinks}>
          <p>
            Already have an account?{" "}
            <Link to="/login" style={styles.footerLink}>
              Login here.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
