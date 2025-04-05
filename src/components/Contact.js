import React, { useState, useEffect } from "react";
import Alert from "../components/Alert"; // Import your Alert component
import axios from "axios"; // Import axios

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [alert, setAlert] = useState({
    message: "",
    duration: 3000,
    show: false,
  });

  const [isVisible, setIsVisible] = useState(false); // Animation state

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200); // Delay to trigger animation
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/api/contact`, formData);

      if (response.status === 201) {
        setAlert({
          message: "Message sent successfully!",
          duration: 3000,
          show: true,
        });
        setFormData({ name: "", email: "", message: "" }); // Clear form
      } else {
        setAlert({
          message: "Failed to send message!",
          duration: 3000,
          show: true,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setAlert({
        message: "Failed to send message!",
        duration: 3000,
        show: true,
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, show: false });
  };

  return (
<section
  id="contact"
  style={{
    ...styles.contactSection,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(20px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  }}
>
  <h2 style={styles.heading}>Contact Us</h2>

  {/* Alert Notification */}
  {alert.show && (
    <Alert
      message={alert.message}
      duration={alert.duration}
      onClose={handleCloseAlert}
    />
  )}

  {/* Contact Details */}
  <div style={styles.contactDetails}>
    <p>
      Email:{" "}
      <a href="mailto:exdollarium@gmail.com" style={styles.link}>
      support@exdollarium.com
      </a>
    </p>
    <p>
      Phone:{" "}
      <a href="tel:+2349123258507" style={styles.link}>
        + (234) 9123258507
      </a>
    </p>
    <p>
      Physical address:{" "}
      <span style={styles.address}>Minna, Niger State</span>
    </p>
  </div>

  {/* Contact Form */}
  <form onSubmit={handleSubmit} style={styles.form}>
    <label htmlFor="name" style={styles.label}>
      Name:
    </label>
    <input
      type="text"
      name="name"
      id="name"
      value={formData.name}
      onChange={handleChange}
      required
      style={styles.input}
    />

    <label htmlFor="email" style={styles.label}>
      Email:
    </label>
    <input
      type="email"
      name="email"
      id="email"
      value={formData.email}
      onChange={handleChange}
      required
      style={styles.input}
    />

    <label htmlFor="message" style={styles.label}>
      Message:
    </label>
    <textarea
      name="message"
      id="message"
      value={formData.message}
      onChange={handleChange}
      required
      style={styles.textarea}
    ></textarea>

    <button
      type="submit"
      style={styles.button}
      onMouseEnter={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
      onMouseLeave={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
    >
      Send Message
    </button>
  </form>
</section>

  );
};

// Styles
const styles = {
  contactSection: {
    backgroundColor: "#d0e6fd", // Light blue background
    padding: "40px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#162660", // Navy blue text
    maxWidth: "600px",
    margin: "50px auto", // Adds margin on top and bottom
    transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)", // Soft shadow effect
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: "20px",
  },
  contactDetails: {
    marginBottom: "20px",
    fontSize: "1rem",
  },
  link: {
    color: "#162660",
    textDecoration: "none",
    fontWeight: "bolder",
  },
  address: {
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "1rem",
  },
  input: {
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #162660",
    transition: "border 0.3s ease-in-out",
    outline: "none",
  },
  textarea: {
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #162660",
    minHeight: "120px",
    transition: "border 0.3s ease-in-out",
    outline: "none",
  },
  button: {
    backgroundColor: '#162660',
    color: '#f1e4d1',
    padding: '12px 20px',
    borderRadius: '8px',
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "background-color 0.3s, transform 0.2s ease-in-out",
  },
  buttonHover: {
    backgroundColor: "#162660",
  },
};

export default Contact;
