import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert'; // Import your Alert component
import axios from 'axios'; // Import axios

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [alert, setAlert] = useState({ message: '', duration: 3000, show: false });
  const [isVisible, setIsVisible] = useState(false); // State for animation

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200); // Delay to trigger animation
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  const apiUrl = "http://localhost:22222";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/api/contact`, formData);

      if (response.status === 201) {
        setAlert({ message: 'Message sent successfully!', duration: 3000, show: true });
        setFormData({ name: '', email: '', message: '' }); // Clear form after submission
      } else {
        setAlert({ message: 'Failed to send message!', duration: 3000, show: true });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setAlert({ message: 'Failed to send message!', duration: 3000, show: true });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, show: false });
  };

  return (
    <section
      style={{
        ...styles.contactSection,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      <h2 style={styles.heading}>Contact Us</h2>
      {alert.show && <Alert message={alert.message} duration={alert.duration} onClose={handleCloseAlert} />}

      <div style={styles.contactDetails}>
        <p>Email: <a href="mailto:exdollarium@gmail.com" style={styles.link}>exdollarium@gmail.com</a></p>
        <p>Phone: <a href="tel:+2349123258507" style={styles.link}>+ (234) 9123258507</a></p>
        <p>Physical address: <span style={styles.address}>Minna, Niger State</span></p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label htmlFor="name" style={styles.label}>Name:</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label htmlFor="email" style={styles.label}>Email:</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label htmlFor="message" style={styles.label}>Message:</label>
        <textarea
          name="message"
          id="message"
          value={formData.message}
          onChange={handleChange}
          required
          style={styles.textarea}
        ></textarea>

        <button type="submit" style={styles.button}>Send Message</button>
      </form>
    </section>
  );
};

// Styles (with animations)
const styles = {
  contactSection: {
    backgroundColor: '#d0e6fd',
    padding: '40px',
    borderRadius: '10px',
    textAlign: 'center',
    color: '#162660',
    maxWidth: '600px',
    margin: '0 auto',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
  },
  heading: {
    fontSize: '1.8rem',
    marginBottom: '20px',
  },
  contactDetails: {
    marginBottom: '20px',
    fontSize: '1rem',
  },
  link: {
    color: '#162660',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  address: {
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #162660',
  },
  textarea: {
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #162660',
    minHeight: '100px',
  },
  button: {
    backgroundColor: '#d0e6fd',
    color: '#162660',
    padding: '10px 15px',
    fontSize: '1.1rem',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.3s ease-in-out, transform 0.2s ease-in-out',
  },
};

export default Contact;
