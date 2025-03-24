import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("signupForm");
    return savedFormData ? JSON.parse(savedFormData) : {
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };
  });
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "phone") {
      // Allow only numbers
      if (!/^\d*$/.test(value)) return;
    }
  
    setFormData({ ...formData, [name]: value });
  };
  

  const [alertMessage, setAlertMessage] = useState("");
  const [alertDuration] = useState(3000);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [termsAccepted, setTermsAccepted] = useState(
    localStorage.getItem("termsAccepted") === "true"
  );
  useEffect(() => {
    localStorage.setItem("signupForm", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const accepted = localStorage.getItem("termsAccepted") === "true";
    setTermsAccepted(accepted);
  }, []);

  const handleCheckboxChange = () => {
    setTermsAccepted((prev) => {
      const newValue = !prev;
      localStorage.setItem("termsAccepted", newValue);
      return newValue;
    });
  };

  const showAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(""), alertDuration);
  };

  //const apiUrl = "http://localhost:22222";
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!termsAccepted) {
      showAlert("You must agree to the Terms & Conditions to continue.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      showAlert("Password must be at least 8 characters long and include letters, numbers, and symbols.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/auth/signup`, {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        agreedToTerms: true,
      });

      if (response.status !== 201) {
        showAlert(response.data.message || "Sig nup failed");
        return;
      }

      showAlert("Sign up successful! Check your email or spam folder to verify your account.");

      // Clear form and remove stored data
      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      localStorage.removeItem("signupForm");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      showAlert(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
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
      marginTop: "20px",
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

        <h2 style={styles.heading}>Sign Up</h2>

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
  <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                    padding: "10px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    flex: 1,
                    background: "transparent",

                }}
                disabled={loading}
            />
            <span
                style={{
                    marginLeft: "8px",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#888",
                }}
                onClick={() => setShowTooltip(!showTooltip)}
            >
                ℹ️
            </span>

            {showTooltip && (
                <div
                    style={{
                        position: "absolute",
                        top: "120%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#000",
                        color: "#fff",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        zIndex: 1000,
                    }}
                >
                    WhatsApp number is advisable
                </div>
            )}
        </div>
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
          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={handleCheckboxChange}
              id="terms"
              disabled={!termsAccepted} // Disable until accepted
              style={{ marginRight: "10px" }}
            />

            <label htmlFor="terms" style={{ color: "#f1e4d1" }}>
              I agree to the{" "}
              <Link to="/terms" style={{ color: "#d0e6fd", textDecoration: "underline" }}>
                Terms and Conditions
              </Link>
            </label>
          </div>


          <button type="submit" style={styles.button} disabled={!termsAccepted || loading}>
            {loading ? "Signing up..." : "Sign up"}
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
