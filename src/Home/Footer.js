import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get the current year

  return (
    <footer style={styles.footer}>
      <div style={styles.footerLinks}>
        <a href="https://chat.whatsapp.com/LcT3Fe47rPtCjjL2ZISHcP" target="_blank" rel="noopener noreferrer" style={styles.link}>
          <span style={styles.icon}><i className="fab fa-whatsapp"></i></span>
          <span>WhatsApp</span>
        </a>
        <a href="https://www.instagram.com/exdollarium/" target="_blank" rel="noopener noreferrer" style={styles.link}>
          <span style={styles.icon}><i className="fab fa-instagram"></i></span>
          <span>Instagram</span>
        </a>
        <a href="https://twitter.com/exdollarium/" target="_blank" rel="noopener noreferrer" style={styles.link}>
          <span style={styles.icon}><i className="fab fa-twitter"></i></span>
          <span>Twitter</span>
        </a>
        <a href="https://www.facebook.com/profile.php?id=61561183927502" target="_blank" rel="noopener noreferrer" style={styles.link}>
          <span style={styles.icon}><i className="fab fa-facebook"></i></span>
          <span>Facebook</span>
        </a>
      </div>
      <p style={styles.footerText}>&copy; {currentYear} Exdollarium. All rights reserved.</p>
    </footer>
  );
};

// Inline styles
const styles = {
  footer: {
    backgroundColor: '#162660',
    color: '#f1e4d1',
    textAlign: 'center',
    padding: '20px',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '10px',
    flexWrap: 'wrap', // Makes it mobile-responsive
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: '#d0e6fd',
    fontSize: '1.1rem',
    transition: 'color 0.3s ease-in-out',
  },
  icon: {
    fontSize: '1.5rem',
    transition: 'color 0.3s ease-in-out',
  },
  footerText: {
    fontSize: '0.9rem',
    marginTop: '10px',
  },
};

// Apply hover effect using inline styles in JSX
const applyHoverEffect = (element, color) => {
  element.addEventListener('mouseenter', () => (element.style.color = color));
  element.addEventListener('mouseleave', () => (element.style.color = '#d0e6fd'));
};

setTimeout(() => {
  document.querySelectorAll('a').forEach(link => applyHoverEffect(link, '#f1e4d1'));
}, 100); // Ensure the DOM is loaded before applying hover effects

export default Footer;