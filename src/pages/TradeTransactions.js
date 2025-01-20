import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Alert from "../components/Alert"; // Replace with the correct path to your alert component
import "../styles/TradeTransactions.css";

const TradeTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "", show: false });
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [transactionToApproveOrReject, setTransactionToApproveOrReject] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;


  // Trigger alert notifications
  const triggerAlert = (message, type) => {
    setAlert({ message, type, show: true });
    setTimeout(() => {
      setAlert({ message: "", type: "", show: false });
    }, 3000);
  };

  // Fetch all trade transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/trades/transactions`);
      setTransactions(data);
    } catch (error) {
      triggerAlert("Error fetching transactions", "error");
    }
  }, [apiUrl]); // Empty dependency array to only create the function once

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, apiUrl]);

  // View transaction details
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };

  // Handle approve transaction
  const handleApprove = (transaction) => {
    setTransactionToApproveOrReject(transaction);
    setIsApproveConfirmOpen(true);
  };

  // Handle reject transaction
  const handleReject = (transaction) => {
    setTransactionToApproveOrReject(transaction);
    setIsRejectConfirmOpen(true);
  };

  // Approve transaction
  const confirmApprove = async () => {
    try {
      await axios.put(`${apiUrl}/api/trades/transactions/approve/${transactionToApproveOrReject._id}`);
      triggerAlert("Transaction approved successfully", "success");
      fetchTransactions();
      setIsApproveConfirmOpen(false);
    } catch (error) {
      triggerAlert("Error approving transaction", "error");
    }
  };

  // Reject transaction
  const confirmReject = async () => {
    try {
      await axios.put(`${apiUrl}/api/trades/transactions/reject/${transactionToApproveOrReject._id}`);
      triggerAlert("Transaction rejected successfully", "success");
      fetchTransactions();
      setIsRejectConfirmOpen(false);
    } catch (error) {
      triggerAlert("Error rejecting transaction", "error");
    }
  };

  // Cancel approve/reject modal
  const cancelApproveReject = () => {
    setIsApproveConfirmOpen(false);
    setIsRejectConfirmOpen(false);
  };

  // No transactions found
  const noTransactions = transactions.length === 0;

  return (
    <div>
      <h2>Trade Transactions</h2>
      {alert.show && <Alert type={alert.type} message={alert.message} />}

      {/* Transaction List */}
      {noTransactions ? (
        <p>No transactions found</p>
      ) : (
        <div className="transaction-list">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-card">
              <div className="card-header">
                <h4>{transaction.user.username}</h4>
                <p>Status: {transaction.status}</p>
                <p>Amount: {transaction.amount} NGN</p>
              </div>
              <div className="card-body">
                <button onClick={() => handleViewDetails(transaction)}>View Details</button>
                {transaction.status === "manual" && (
                  <div className="action-buttons">
                    <button onClick={() => handleApprove(transaction)}>Approve</button>
                    <button onClick={() => handleReject(transaction)}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Transaction Details</h3>
            <p>Username: {selectedTransaction.user.username}</p>
            <p>Email: {selectedTransaction.user.email}</p>
            <p>Amount: {selectedTransaction.amount}</p>
            <p>Status: {selectedTransaction.status}</p>
            <p>Created At: {new Date(selectedTransaction.createdAt).toLocaleString()}</p>
            <button onClick={() => setSelectedTransaction(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Approve */}
      {isApproveConfirmOpen && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <p>Are you sure you want to approve this transaction?</p>
            <button className="confirm" onClick={confirmApprove}>
              Yes
            </button>
            <button className="cancel" onClick={cancelApproveReject}>
              No
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reject */}
      {isRejectConfirmOpen && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <p>Are you sure you want to reject this transaction?</p>
            <button className="confirm" onClick={confirmReject}>
              Yes
            </button>
            <button className="cancel" onClick={cancelApproveReject}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeTransactions;
