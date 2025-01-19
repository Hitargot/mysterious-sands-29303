import React from 'react';

const AdminHome = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>Welcome to the Admin Dashboard</div>
      <div style={styles.content}>
        <p style={styles.text}>Here you can manage users, transactions, services, and more.</p>
        <button style={styles.button} onClick={() => alert('Navigating to User Management')}>
          Manage Users
        </button>
        <button style={styles.button} onClick={() => alert('Navigating to Trade Transactions')}>
          View Transactions
        </button>
        <button style={styles.button} onClick={() => alert('Navigating to Service Management')}>
          Manage Services
        </button>
      </div>
    </div>
  );
};

// Simple styles for the AdminHome component
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  },
  content: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
  },
  text: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    margin: '5px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  },
};

export default AdminHome;
