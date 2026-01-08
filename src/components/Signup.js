import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Alert from "../components/Alert";
import ResponsiveLogo from './ResponsiveLogo';
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // Import styles

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referral = params.get("referralCode");

    if (referral) {
      setFormData((prev) => ({
        ...prev,
        referralCode: referral,
      }));
    }
  }, [location.search]);

  const [showTooltip, setShowTooltip] = useState(false);

  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("signupForm");
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        referralCode: "", // Add referral field
      };
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [alertDuration] = useState(3000);
  const [loading, setLoading] = useState(false);
  const [userCountry, setUserCountry] = useState("ng"); // Default to Nigeria
  const [termsAccepted, setTermsAccepted] = useState(
    localStorage.getItem("termsAccepted") === "true"
  );

  // Responsive helper to adjust spacing on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("signupForm", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const accepted = localStorage.getItem("termsAccepted") === "true";
    setTermsAccepted(accepted);
  }, []);

  useEffect(() => {
    // Try to detect user's country
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => setUserCountry(data.country_code.toLowerCase()))
      .catch(() => setUserCountry("ng")); // Fallback to Nigeria if detection fails
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Ensure +234 is always the prefix
      if (!value.startsWith("+234")) {
        setFormData({ ...formData, phone: "+234" });
      } else {
        // Allow only numbers after +234
        const phoneNumber = value.replace(/\D/g, ""); // Remove non-numeric characters
        if (phoneNumber.startsWith("234")) {
          setFormData({ ...formData, phone: "+" + phoneNumber });
        }
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };



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

  const apiUrl = process.env.REACT_APP_API_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // ✅ 1. Check empty fields
    if (!formData.firstName || !formData.lastName) {
      showAlert("Please enter your first name and last name.");
      return;
    }
    if (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      showAlert("All fields are required.");
      return;
    }

    // ✅ 2. Validate username (starts with a capital letter, at least 4 chars)
    const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{3,}$/;
    if (!usernameRegex.test(formData.username)) {
      showAlert("Username must start with a letter and be at least 4 characters long.");
      return;
    }


    // ✅ 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert("Enter a valid email address.");
      return;
    }

    // ✅ 4. Validate phone number
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      showAlert("Enter a valid phone number (10-15 digits).");
      return;
    }

    // ✅ 5. Strong password checks with specific messages
    const password = formData.password;
    if (password.length < 8) {
      showAlert("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Za-z]/.test(password)) {
      showAlert("Password must contain at least one letter.");
      return;
    }
    if (!/\d/.test(password)) {
      showAlert("Password must contain at least one number.");
      return;
    }
    if (!/[@$!%*?&]/.test(password)) {
      showAlert("Password must include at least one special character (@$!%*?&).");
      return;
    }

    // ✅ 6. Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      showAlert("Passwords do not match.");
      return;
    }

    // ✅ 7. Check Terms & Conditions agreement
    if (!termsAccepted) {
      showAlert("You must accept the Terms & Conditions before signing up.");
      return;
    }

    // ✅ 8. Submit data
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/auth/signup`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        referralCode: formData.referralCode,
        agreedToTerms: true,
      });

      if (response.status !== 201) {
        showAlert(response.data.message || "Signup failed");
        return;
      }

      showAlert("Sign up successful! Check your email or spam folder to verify your account.");

      // ✅ Reset form
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        referralCode: "",
      });

      localStorage.removeItem("signupForm");

      // ✅ Redirect to login after 3 seconds
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
  const logoTextMargin = isMobile ? "12px" : "24px";
  const navMarginLeft = isMobile ? "8px" : "16px";

  const styles = {
    signup: {
      minHeight: "100vh", // 🔥 cover full page, even when scrolling
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
      margin: "40px 0", // 🔥 add spacing so it’s not glued to top on scroll
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
    logoText: {
      marginRight: logoTextMargin,
    },
   
    navLink: {
      marginLeft: "15px",
      textDecoration: "none",
      color: "#f1e4d1",
      transition: "color 0.3s ease-in-out",
    },
    nav: {
      marginLeft: navMarginLeft,
    },
    heading: {
      color: "#f1e4d1",
      fontSize: "1.5rem",
      padding: 0,
    },
    h2: {
      padding: 0,
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
              <ResponsiveLogo alt="Exdollarium" style={{ ...styles.logoImg, height: '64px', width: '64px' }} />
              <span style={{ ...styles.logoText, fontWeight: 900, color: '#f1e4d1' }}>Exdollarium</span>
            </div>
          <nav style={styles.nav}>
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
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={styles.input}
                disabled={loading}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>
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

              <PhoneInput
                country={userCountry} // Auto-detected or Nigeria as default
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                inputStyle={{
                  width: "100%",
                  border: "1px solid #d0e6fd",
                  borderRadius: "5px",
                  background: "transparent",
                  color: "#f1e4d1",
                  fontSize: "1rem",
                }}
                disableDropdown={false} // Allow country selection
                enableSearch={true} // Enable country search
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
            <label style={styles.label}>Referral Code (Optional):</label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode || ""}
              onChange={handleChange}
              placeholder="Enter referral code (if any)"
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
              {termsAccepted
                ? "I have read and agree with the "
                : "Please read and accept our "}
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

