import React, { useState } from 'react';

const AdminWallet = () => {
  const [totalBalance, setTotalBalance] = useState(1000000); // Example system balance
  const [userId, setUserId] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [operations, setOperations] = useState([
    { id: 1, type: 'Funding', user: 'User123', amount: 5000, date: '2025-01-01' },
    { id: 2, type: 'Withdrawal', user: 'User456', amount: 3000, date: '2025-01-05' },
  ]);

  const handleFundWallet = () => {
    if (!userId || !fundAmount) {
      alert('Please provide both user ID and funding amount.');
      return;
    }

    // Simulate funding the user's wallet
    const newOperation = {
      id: operations.length + 1,
      type: 'Funding',
      user: userId,
      amount: parseFloat(fundAmount),
      date: new Date().toISOString().split('T')[0],
    };

    setOperations([...operations, newOperation]);
    setTotalBalance((prev) => prev - parseFloat(fundAmount));
    setUserId('');
    setFundAmount('');
    alert(`Funded ${fundAmount} to user ${userId}'s wallet.`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Wallet/Finance</h1>
      
      <div style={styles.card}>
        <h2 style={styles.sectionHeader}>System's Total Balance</h2>
        <p style={styles.balance}>₦{totalBalance.toLocaleString()}</p>
      </div>
      
      <div style={styles.card}>
        <h2 style={styles.sectionHeader}>Fund User Wallet</h2>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Amount (₦)"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            style={styles.input}
          />
        </div>
        <button style={styles.button} onClick={handleFundWallet}>
          Fund Wallet
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionHeader}>Manual Operations</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => (
              <tr key={op.id}>
                <td style={styles.td}>{op.id}</td>
                <td style={styles.td}>{op.type}</td>
                <td style={styles.td}>{op.user}</td>
                <td style={styles.td}>₦{op.amount.toLocaleString()}</td>
                <td style={styles.td}>{op.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  sectionHeader: {
    fontSize: '1.5rem',
    color: '#007BFF',
    marginBottom: '10px',
  },
  balance: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#28a745',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  input: {
    flex: '1',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px',
    borderBottom: '1px solid #ccc',
    color: '#333',
    fontWeight: 'bold',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    color: '#555',
  },
};

export default AdminWallet;
