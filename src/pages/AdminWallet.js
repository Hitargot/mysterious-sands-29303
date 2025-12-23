import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Alert from '../components/Alert';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import '../styles/AdminWallet.css';

const AdminWallet = () => {
  const [adminBalance, setAdminBalance] = useState(0);
  const [fundAmount, setFundAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showBalance, setShowBalance] = useState(true); // State to control the visibility of the balance
  const [totalUserBalances, setTotalUserBalances] = useState(0);
  const [totalFundedByCurrency, setTotalFundedByCurrency] = useState({});
  const [totalFundedNaira, setTotalFundedNaira] = useState(0);
  const [totalUserWithdrawals, setTotalUserWithdrawals] = useState(0);
  const [totalForeignFunded, setTotalForeignFunded] = useState(0);
  const [totalForeignWithdrawals, setTotalForeignWithdrawals] = useState(0);
  const [lastResponse, setLastResponse] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [diagCount, setDiagCount] = useState(0);
  const [diagSumAmount, setDiagSumAmount] = useState(0);
  const [diagSumForeignCurrency, setDiagSumForeignCurrency] = useState(0);
  const [diagFirstKeys, setDiagFirstKeys] = useState([]);
  const [filterType, setFilterType] = useState('all'); // Filter transactions by type
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [fundNote, setFundNote] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const apiUrl = process.env.REACT_APP_API_URL;
  
  const fetchWalletData = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setAlert({ type: "error", message: "Admin not authenticated" });
        return;
      }
  
      const { data } = await axios.get(`${apiUrl}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
  
  setAdminBalance(data.balance);
  setTransactions(data.transactions);
  setLastResponse(data);
  // debug logs to inspect server response shape
  try { console.debug('API /api/wallet response:', data); console.debug('transactions[0]:', data.transactions && data.transactions[0]); } catch (e) { /* ignore */ }
  setTotalUserBalances(data.totalUserBalances || 0);

  // Prefer server-provided summary totals when available (more accurate)
  if (typeof data.totalAdminFunding !== 'undefined') {
    setTotalFundedNaira(Number(data.totalAdminFunding || 0));
  }
  if (typeof data.totalAdminWithdrawals !== 'undefined') {
    setTotalUserWithdrawals(Number(data.totalAdminWithdrawals || 0));
  }
  // If backend exposes a total for foreign currency added, show it under a 'FOREIGN' bucket
  if (typeof data.totalForeignCurrencyAdded !== 'undefined') {
    setTotalFundedByCurrency({ FOREIGN: Number(data.totalForeignCurrencyAdded || 0) });
    setTotalForeignFunded(Number(data.totalForeignCurrencyAdded || 0));
  }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || error.message,
      });
    }
  }, [apiUrl]); // only changes if apiUrl changes

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);
  

  // Update displayed transactions whenever transactions or showAllTransactions or filterType change
  useEffect(() => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter transactions based on filterType
    const filtered = sortedTransactions.filter(tx => {
      if (filterType === 'all') return true;
      return tx.type.toLowerCase() === filterType;
    });

    setDisplayedTransactions(showAllTransactions ? filtered : filtered.slice(0, 10));
  }, [transactions, showAllTransactions, filterType]);

  // Compute aggregates: total funded per foreign currency (USD/GBP/EUR) and total funded in NGN, and total user withdrawals
  useEffect(() => {
    try {
      const byCurrency = {};
  let nairaTotal = 0;
  let withdrawalsTotal = 0;
  let foreignTotal = 0;
  let foreignWithdrawalsTotal = 0;

      const parseNum = (v) => {
        if (v == null) return 0;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          // remove commas and whitespace
          const cleaned = v.replace(/[,\s]/g, '');
          const n = parseFloat(cleaned);
          return isNaN(n) ? 0 : n;
        }
        return 0;
      };

  transactions.forEach((tx) => {
        const typeRaw = tx.type || tx.txType || tx.kind || '';
        const type = String(typeRaw).toLowerCase();

        // foreign amount candidates
        const foreignAmountCandidates = [
          tx.userAmountInForeignCurrency,
          tx.amountInForeignCurrency,
          tx.userAmount,
          tx.originalAmount,
          tx.adminProvidedAmount,
          tx.adminAmount,
          tx.adminForeignAmount,
          tx.foreignAmount,
        ];
        let foreignAmount = 0;
        for (const c of foreignAmountCandidates) {
          const pv = parseNum(c);
          if (pv) { foreignAmount = pv; break; }
        }

        // currency candidates
        const currency = String(tx.userSelectedCurrency || tx.selectedCurrency || tx.currency || tx.adminSelectedCurrency || tx.adminCurrency || tx.foreignCurrency || '').toUpperCase();

        // NGN amount candidates (server may use different fields)
        const ngnAmount = parseNum(tx.amount ?? tx.ngnAmount ?? tx.nairaAmount ?? tx.amountInNgn ?? tx.amount_naira ?? null);

        const isWithdrawal = (
          type.includes('withdraw') ||
          type.includes('debit') ||
          (typeof tx.isWithdrawal !== 'undefined' && !!tx.isWithdrawal) ||
          (ngnAmount < 0)
        );

        const isFunding = (
          type.includes('fund') ||
          type.includes('credit') ||
          type.includes('topup') ||
          (typeof tx.isFunding !== 'undefined' && !!tx.isFunding) ||
          (ngnAmount > 0 && !isWithdrawal)
        );

        // accumulate foreign totals when present and transaction looks like funding
        if (foreignAmount) {
          foreignTotal += Math.abs(foreignAmount);
          if (currency && isFunding) {
            byCurrency[currency] = (byCurrency[currency] || 0) + foreignAmount;
          }
          // if this foreign transaction is a withdrawal, add to foreign withdrawals total
          if (isWithdrawal) foreignWithdrawalsTotal += Math.abs(foreignAmount);
        }

        // accumulate NGN funded (use absolute values)
        if (isFunding && !isNaN(ngnAmount) && ngnAmount) {
          nairaTotal += Math.abs(ngnAmount);
        }

        // accumulate withdrawals (NGN)
        if (isWithdrawal) {
          if (!isNaN(ngnAmount) && ngnAmount) withdrawalsTotal += Math.abs(ngnAmount);
        }
      });

  setTotalFundedByCurrency(byCurrency);
  setTotalFundedNaira(nairaTotal);
  setTotalUserWithdrawals(withdrawalsTotal);
  setTotalForeignFunded(foreignTotal);
  setTotalForeignWithdrawals(foreignWithdrawalsTotal);
      // log computed aggregates for debugging
      try { console.debug('Computed wallet aggregates', { byCurrency, nairaTotal, withdrawalsTotal }); } catch (e) { }
    } catch (e) {
      console.error('Failed to compute wallet aggregates', e);
    }
  }, [transactions]);

  // diagnostic summary for quick visibility when totals appear zero
  useEffect(() => {
    try {
      const parseNum = (v) => {
        if (v == null) return 0;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const cleaned = v.replace(/[,\s]/g, '');
          const n = parseFloat(cleaned);
          return isNaN(n) ? 0 : n;
        }
        return 0;
      };
      const count = Array.isArray(transactions) ? transactions.length : 0;
      let sumAmt = 0;
      let sumForeign = 0;
      if (count > 0) {
        transactions.forEach((t) => {
          sumAmt += Math.abs(parseNum(t.amount ?? t.ngnAmount ?? t.nairaAmount ?? 0));
          sumForeign += Math.abs(parseNum(t.foreignCurrency ?? t.foreignAmount ?? t.fxAmount ?? 0));
        });
        setDiagFirstKeys(Object.keys(transactions[0] || {}));
      } else setDiagFirstKeys([]);
      setDiagCount(count);
      setDiagSumAmount(sumAmt);
      setDiagSumForeignCurrency(sumForeign);
      try { console.debug('Diagnostic sums', { count, sumAmt, sumForeign, keys: Object.keys(transactions[0] || {}) }); } catch (e) {}
    } catch (e) { /* ignore */ }
  }, [transactions]);

  // Fund Admin Wallet
  const handleFundWallet = async () => {
    if (!fundAmount || fundAmount <= 0) {
      setAlert({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }
  
    try {
      const token = localStorage.getItem("adminToken"); // Get token from storage
      const { data } = await axios.post(
        `${apiUrl}/api/wallet/fund`,
        { amount: parseFloat(fundAmount), note: fundNote },  
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Include Authorization header
          withCredentials: true,
        }
      );
      setAlert({ type: 'success', message: data.message });
      setFundAmount('');
      setFundNote('');
      fetchWalletData();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error funding wallet' });
    }
  };
  
  // Withdraw from Admin Wallet
  const handleWithdrawFunds = async (withdrawAmount) => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setAlert({ type: 'error', message: 'Please enter a valid amount to withdraw.' });
      return;
    }
  
    try {
      const token = localStorage.getItem("adminToken");
      const { data } = await axios.post(
        `${apiUrl}/api/admin/wallet/withdraw`,
        { amount: parseFloat(withdrawAmount), note: withdrawNote || "No note provided" }, // ✅ Default note
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
  
      setAlert({ type: 'success', message: data.message });
      setWithdrawAmount('');
      setWithdrawNote('');
      fetchWalletData();
    } catch (error) {
      console.error("❌ Withdraw Error:", error.response?.data);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error withdrawing funds' });
    }
  };
  
  


  // Filter transactions based on search term
  const filteredTransactions = displayedTransactions.filter((tx) =>
    tx._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.amount.toString().includes(searchTerm)
  );

  // Handle "See More" button click to show all transactions
  const handleSeeMore = () => {
    setShowAllTransactions(true);
  };

  // Function to format balance value safely
  const formatBalance = (balance) => {
    return balance && !isNaN(balance) ? balance.toLocaleString() : 'N/A';
  };

  return (
    <div className="admin-wallet-container">
      <h1 className="admin-wallet-header">Admin Wallet</h1>

      {alert && <Alert message={alert.message} type={alert.type} />}

      {/* Balance visibility toggle with eye icon */}
      <button className="toggle-balance-button" onClick={() => setShowBalance(!showBalance)}>
        {showBalance ? <FaEyeSlash /> : <FaEye />}
        {showBalance ? 'Hide Balance' : 'Show Balance'}
      </button>

      {/* Balance display */}
      {showBalance && (
        <div className="admin-card">
          <h2 className="section-header">Admin Wallet Balance</h2>
          <p className="balance">₦{formatBalance(adminBalance)}</p>
        </div>
      )}
      {/* Aggregate of all users' wallet balances (for admin visibility) */}
      <div className="admin-card">
        <h2 className="section-header">Total Users' Balances</h2>
        <p className="balance">₦{formatBalance(totalUserBalances)}</p>
      </div>
      {/* Aggregated totals: funded by currency, funded in NGN, and user withdrawals */}
      <div className="admin-card">
        <h2 className="section-header">Wallet Totals</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Show only common currencies and defaults */}
          {['USD', 'GBP', 'EUR'].map((c) => (
            <div key={c} style={{ minWidth: 140, padding: 8, borderRadius: 6, border: '1px solid #eee', background: '#fff', color: '#111' }}>
              <div style={{ fontSize: 12, color: '#666' }}>Total Funded ({c})</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{c === 'USD' && '$'}{c === 'GBP' && '£'}{c === 'EUR' && '€'}{Number(totalFundedByCurrency[c] || 0).toLocaleString()}</div>
            </div>
          ))}

          <div style={{ minWidth: 180, padding: 8, borderRadius: 6, border: '1px solid #eee', background: '#fff', color: '#111' }}>
            <div style={{ fontSize: 12, color: '#666' }}>Total Funded (NGN)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>₦{Number(totalFundedNaira || 0).toLocaleString()}</div>
          </div>

          <div style={{ minWidth: 220, padding: 8, borderRadius: 6, border: '1px solid #eee', background: '#fff', color: '#111' }}>
            <div style={{ fontSize: 12, color: '#666' }}>Total Users' Withdrawals (NGN)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>₦{Number(totalUserWithdrawals || 0).toLocaleString()}</div>
          </div>

          <div style={{ minWidth: 220, padding: 8, borderRadius: 6, border: '1px solid #eee', background: '#fff', color: '#111' }}>
            <div style={{ fontSize: 12, color: '#666' }}>Total Foreign Funded (all currencies)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{Number(totalForeignFunded || 0).toLocaleString()}</div>
          </div>

          <div style={{ minWidth: 220, padding: 8, borderRadius: 6, border: '1px solid #eee', background: '#fff', color: '#111' }}>
            <div style={{ fontSize: 12, color: '#666' }}>Total Foreign Withdrawals (all currencies)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{Number(totalForeignWithdrawals || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
      {/* Debug: show raw server response when requested */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowDebug(!showDebug)} className="toggle-balance-button" style={{ marginBottom: 8 }}>
          {showDebug ? 'Hide' : 'Show'} Server Response
        </button>
        {showDebug && lastResponse && (
          <>
            <div style={{ marginBottom: 8, color: '#fff' }}>
              <strong>Diagnostics:</strong> transactions: {diagCount}, sum NGN amounts: ₦{Number(diagSumAmount || 0).toLocaleString()}, sum foreign amounts: {Number(diagSumForeignCurrency || 0).toLocaleString()}
              <div style={{ fontSize: 12, color: '#ddd' }}>First transaction keys: {diagFirstKeys.join(', ')}</div>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: 12, borderRadius: 8, maxHeight: 320, overflow: 'auto' }}>
              {JSON.stringify(lastResponse, null, 2)}
            </pre>
          </>
        )}
      </div>
      <div className="admin-card">
        <h2 className="section-header">Fund Admin Wallet</h2>
        <div className="input-group">
          <input
            type="number"
            placeholder="Enter amount (₦)"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Enter note (optional)"
            value={fundNote}
            onChange={(e) => setFundNote(e.target.value)}
            className="input-field"
          />
          <button className="fund-button" onClick={handleFundWallet}>
            Fund Wallet
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="section-header">Withdraw Funds</h2>
        <div className="input-group">
          <input
            type="number"
            placeholder="Enter withdrawal amount (₦)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Enter note (optional)"
            value={withdrawNote}
            onChange={(e) => setWithdrawNote(e.target.value)}
            className="input-field"
          />
          <button className="withdraw-button" onClick={() => handleWithdrawFunds(withdrawAmount)}>
            Withdraw
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="section-header">Search Transactions</h2>
        <input
          type="text"
          placeholder="Search by ID, Type, or Amount"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {/* Filter Transactions by Type */}
      <div className="filter-type">
        <label>Filter by Type:</label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
          <option value="all">All</option>
          <option value="funding">Funding</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
      </div>

      <div className="admin-card">
        <h2 className="section-header">Transaction History</h2>
        {isMobile ? (
        <div className="transaction-cards">
          {filteredTransactions.map((tx) => (
            <div key={tx._id} className="transaction-card">
              <p><strong>ID:</strong> {tx._id}</p>
              <p><strong>Type:</strong> {tx.type}</p>
              <p style={{ color: tx.type === 'Funding' ? 'green' : 'orangered' }}>
                <strong>Amount:</strong> {tx.type === 'Funding' ? `+₦${tx.amount.toLocaleString()}` : `-₦${tx.amount.toLocaleString()}`}
              </p>
              <p><strong>Note:</strong> {tx.note || 'N/A'}</p>
              <p><strong>Date:</strong> {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx._id}</td>
                <td>{tx.type}</td>
                <td style={{ color: tx.type === 'Funding' ? 'green' : 'orangered' }}>
                  {tx.type === 'Funding' ? `+₦${tx.amount.toLocaleString()}` : `-₦${tx.amount.toLocaleString()}`}
                </td>
                <td>{tx.note || 'N/A'}</td>
                <td>{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

         {/* Show "See More" button if not all transactions are shown */}
         {!showAllTransactions && transactions.length > 10 && (
          <button className="see-more-button" onClick={handleSeeMore}>
            See More
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminWallet;
