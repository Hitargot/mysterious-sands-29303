import React, { useState } from "react";
import Alert from "../components/Alert";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [alert, setAlert] = useState({ message: "", duration: 3000, show: false });
  const [sending, setSending] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await axios.post(`${apiUrl}/api/contact`, formData);
      if (response.status === 201) {
        setAlert({ message: "Message sent successfully! We'll get back to you shortly.", duration: 4000, show: true });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setAlert({ message: "Failed to send message. Please try again.", duration: 3000, show: true });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setAlert({ message: "Failed to send message. Please try again.", duration: 3000, show: true });
    } finally {
      setSending(false);
    }
  };

  const handleCloseAlert = () => setAlert({ ...alert, show: false });

  return (
    <section id="contact" style={s.section}>
      {alert.show && <Alert message={alert.message} duration={alert.duration} onClose={handleCloseAlert} />}

      {/* Header */}
      <div style={s.header}>
        <span style={s.tag}>CONTACT</span>
        <h2 style={s.heading}>Get in <span style={{ color: 'var(--gold)' }}>Touch</span></h2>
        <p style={s.lead}>Have a question or ready to trade? Reach out — we typically respond within minutes.</p>
      </div>

      <div style={s.grid}>
        {/* Info panel */}
        <div style={s.infoPanel}>
          <h3 style={s.infoTitle}>Contact Information</h3>
          <p style={s.infoSub}>We're here to help you with all your currency exchange needs.</p>

          <div style={s.infoList}>
            <div style={s.infoItem}>
              <span style={s.infoIcon}>✉️</span>
              <div>
                <div style={s.infoLabel}>Email</div>
                <a href="mailto:support@exdollarium.com" style={s.infoLink}>support@exdollarium.com</a>
              </div>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoIcon}>📞</span>
              <div>
                <div style={s.infoLabel}>Phone</div>
                <a href="tel:+2348139935240" style={s.infoLink}>+234 813 993 5240</a>
              </div>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoIcon}>📍</span>
              <div>
                <div style={s.infoLabel}>Location</div>
                <span style={s.infoVal}>Minna, Niger State, Nigeria</span>
              </div>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoIcon}>🕐</span>
              <div>
                <div style={s.infoLabel}>Business Hours</div>
                <span style={s.infoVal}>Mon – Sat, 8:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={s.formCard}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label htmlFor="name" style={s.label}>Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label htmlFor="email" style={s.label}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label htmlFor="message" style={s.label}>Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                required
                style={s.textarea}
              />
            </div>

            <button type="submit" disabled={sending} style={{ ...s.btn, opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Sending…' : 'Send Message →'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

const s = {
  section: {
    padding: '88px 5%',
    background: 'var(--navy)',
  },
  header: {
    textAlign: 'center',
    maxWidth: 600,
    margin: '0 auto 60px',
  },
  tag: {
    display: 'inline-block',
    background: 'rgba(245,166,35,0.12)',
    border: '1px solid rgba(245,166,35,0.3)',
    color: 'var(--gold)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '5px 14px',
    borderRadius: 100,
    marginBottom: 16,
  },
  heading: {
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
    fontWeight: 800,
    letterSpacing: -0.8,
    color: '#fff',
    marginBottom: 12,
    lineHeight: 1.2,
  },
  lead: {
    fontSize: '1rem',
    color: 'var(--muted-light)',
    lineHeight: 1.7,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 32,
    maxWidth: 1000,
    margin: '0 auto',
    alignItems: 'start',
  },
  infoPanel: {
    background: 'var(--navy-card)',
    border: '1px solid var(--navy-border)',
    borderRadius: 20,
    padding: '36px 32px',
  },
  infoTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 8px',
  },
  infoSub: {
    fontSize: '0.875rem',
    color: 'var(--muted-light)',
    lineHeight: 1.6,
    margin: '0 0 32px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 3,
  },
  infoLink: {
    color: 'var(--gold)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  infoVal: {
    color: 'var(--text)',
    fontSize: '0.9rem',
  },
  formCard: {
    background: 'var(--navy-card)',
    border: '1px solid var(--navy-border)',
    borderRadius: 20,
    padding: '36px 32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--muted-light)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  input: {
    background: 'var(--navy-2)',
    border: '1px solid var(--navy-border)',
    borderRadius: 10,
    color: 'var(--text)',
    padding: '12px 14px',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    background: 'var(--navy-2)',
    border: '1px solid var(--navy-border)',
    borderRadius: 10,
    color: 'var(--text)',
    padding: '12px 14px',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    minHeight: 130,
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    background: 'var(--gold)',
    color: '#000',
    fontWeight: 800,
    fontSize: '1rem',
    padding: '14px',
    borderRadius: 100,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 180ms',
    letterSpacing: '0.3px',
  },
};

export default Contact;