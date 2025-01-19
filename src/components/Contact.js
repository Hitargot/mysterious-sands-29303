import React, { useState } from 'react';
import Alert from '../components/Alert'; // Import your Alert component
import '../styles/Contact.css'; // Importing custom styles
import axios from 'axios'; // Import axios

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [alert, setAlert] = useState({ message: '', duration: 3000, show: false }); // State for alert

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const apiUrl = process.env.REACT_APP_API_URL;

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
    <section id="contact" className="contact-section">
      <h2>Contact Us</h2>
      {alert.show && <Alert message={alert.message} duration={alert.duration} onClose={handleCloseAlert} />}
      <div className="contact-details">
        <p>Email: <a href="mailto:exdollarium@gmail.com">exdollarium@gmail.com</a></p>
        <p>Phone: <a href="tel:+2349123258507">+ (234) 9123258507</a></p>
        <p>Physical address: <span className="address">Minna, Niger State</span></p>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label htmlFor="message">Message:</label>
        <textarea
          name="message"
          id="message"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
        <button type="submit">Send Message</button>
      </form>
    </section>
  );
};

export default Contact;
