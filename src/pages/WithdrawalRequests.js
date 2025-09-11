import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed
import '../styles/withdrawalRequests.css';
import { useNavigate } from 'react-router-dom';
import { DartsSpinnerOverlay } from 'react-spinner-overlay'; // Spinner for loading

const WithdrawalRequests = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [alerts, setAlerts] = useState([]); // Array to store multiple alerts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionIdToConfirm, setTransactionIdToConfirm] = useState(null);
  const [modalAction, setModalAction] = useState('');
  const navigate = useNavigate(); // Use navigate for routing
  const token = localStorage.getItem('adminToken');
  
  const apiUrl = process.env.REACT_APP_API_URL;

  // Function to check if the token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp < currentTime;
  };

  useEffect(() => {
    if (isTokenExpired(token)) {
      // Redirect to login if token is expired
      showAlert('Your session has expired. Please log in again.', 'error');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    // Fetch withdrawal requests if token is valid
    axios
      .get(`${apiUrl}/api/admin/withdrawal-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('Fetched withdrawals:', response.data.withdrawals);
        setWithdrawals(response.data.withdrawals);
        setFilteredWithdrawals(response.data.withdrawals);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching withdrawal requests:', error.response?.data || error.message);
        showAlert('Error fetching withdrawal requests', 'error');
        setLoading(false);
      });
  }, [token, navigate, apiUrl]);

  // Show an alert and add it to the alert array
  const showAlert = (message, type) => {
    setAlerts((prevAlerts) => [...prevAlerts, { message, type }]);
  };

  // Close an alert
  const closeAlert = (index) => {
    setAlerts((prevAlerts) => prevAlerts.filter((_, i) => i !== index));
  };

  // Handle modal actions (Approve/Reject/Complete)
  const handleAction = () => {
    const adminUsername = 'adminUsername'; // Replace this with actual admin's username from JWT
    const actionTime = new Date().toISOString(); // Capture current timestamp

    const url =
      modalAction === 'approve'
        ? `${apiUrl}/api/admin/withdrawal-request/approve/${transactionIdToConfirm}`
        : modalAction === 'reject'
          ? `${apiUrl}/api/admin/withdrawal-request/reject/${transactionIdToConfirm}`
          : `${apiUrl}/api/admin/withdrawal-request/complete/${transactionIdToConfirm}`;

    axios
      .patch(url, { adminActionBy: adminUsername }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        const successMessage =
          modalAction === 'approve'
            ? 'Withdrawal request approved'
            : modalAction === 'reject'
              ? 'Withdrawal request rejected'
              : 'Withdrawal request completed';

        showAlert(successMessage, 'success');

        // ✅ Instantly update UI without waiting for reload
        setWithdrawals((prev) =>
          prev.map((transaction) =>
            transaction.transactionId === transactionIdToConfirm
              ? {
                ...transaction,
                status:
                  modalAction === 'approve'
                    ? 'approved'
                    : modalAction === 'reject'
                      ? 'rejected'
                      : 'completed',
                adminActionBy: adminUsername, // Update admin name instantly
                actionTakenAt: actionTime, // Update action time instantly
              }
              : transaction
          )
        );

        setFilteredWithdrawals((prev) =>
          prev.map((transaction) =>
            transaction.transactionId === transactionIdToConfirm
              ? {
                ...transaction,
                status:
                  modalAction === 'approve'
                    ? 'approved'
                    : modalAction === 'reject'
                      ? 'rejected'
                      : 'completed',
                adminActionBy: adminUsername, // Update admin name instantly
                actionTakenAt: actionTime, // Update action time instantly
              }
              : transaction
          )
        );

        closeModal();
      })
      .catch((error) => {
        console.error(`Error performing ${modalAction} action:`, error.response?.data || error.message);
        showAlert(`Error performing ${modalAction} action`, 'error');
        closeModal();
      });
  };

  // Open modal for approve/reject or complete
  const openModal = (transactionId, action) => {
    setTransactionIdToConfirm(transactionId);
    setModalAction(action);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionIdToConfirm(null);
    setModalAction('');
  };

  // Search filter
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = withdrawals.filter((transaction) => {
      return (
        transaction.userId?.username?.toLowerCase().includes(query) ||
        transaction.bankId?.accountName?.toLowerCase().includes(query) ||
        transaction.transactionId?.toLowerCase().includes(query) ||
        transaction.status?.toLowerCase().includes(query) ||
        transaction.formattedDate?.toLowerCase().includes(query)
      );
    });
    setFilteredWithdrawals(filtered);
  };

  // Get dynamic button label and action
  const getButtonConfig = (transaction) => {
    switch (transaction.status) {
      case 'pending':
        return { label: 'Approve / Reject', disabled: false, action: 'approveReject' };
      case 'approved':
        return { label: 'Complete', disabled: false, action: 'complete' };
      case 'rejected':
      case 'completed':
        return { label: 'Action Taken', disabled: true, action: '' };
      default:
        return { label: 'Approve / Reject', disabled: false, action: 'approveReject' };
    }
  };

  return (
    <div className="withdrawal-requests">
      <h2>Withdrawal Requests</h2>

      <input
        type="text"
        placeholder="Search by username, bank, transaction ID, status, or date"
        value={searchQuery}
        onChange={handleSearch}
        className="search-bar"
      />

      {alerts.length > 0 &&
        alerts.map((alert, index) => (
          <Alert
            key={index}
            message={alert.message}
            type={alert.type}
            onClose={() => closeAlert(index)}
          />
        ))}

      {loading ? (
        <DartsSpinnerOverlay
          active={true}
          spinnerSize={50}
          color="#36d7b7"
          backgroundColor="rgba(0, 0, 0, 0.5)"
        />
      ) : (
        <div className="withdrawal-cards">
          {filteredWithdrawals.map((transaction) => {
            const { disabled } = getButtonConfig(transaction);
            return (
              <div key={transaction.transactionId} className="withdrawal-card">
                <h3>Transaction ID: {transaction.transactionId}</h3>
                <p>
                  <strong>Username:</strong> {transaction.userId?.username || 'Not available'}
                </p>
                <p>
                  <strong>Bank:</strong>{' '}
                  {transaction.bankId?.accountName
                    ? `${transaction.bankId.accountName} - ${transaction.bankId.bankName} - ${transaction.bankId.accountNumber}`
                    : 'Not available'}
                </p>
                <p>
                  <strong>Amount:</strong> {transaction.amount ? `₦${transaction.amount.toLocaleString()}` : 'N/A'}
                </p>

                <p>
                  <strong>Date:</strong> {transaction.formattedDate || 'Not available'}
                </p>
                <p>
                  <strong>Status:</strong> {transaction.status}
                </p>

                {transaction.adminActionBy && (
                  <>
                    {transaction.status === 'approved' && (
                      <p>
                        <strong>Approved by:</strong> {transaction.adminActionBy} <br />
                        <small>
                          Action taken on: {transaction.adminActionAt ? new Date(transaction.adminActionAt).toLocaleString() : 'N/A'}
                        </small>
                      </p>
                    )}

                    {transaction.status === 'completed' && (
                      <>
                        <p>
                          <strong>Completed by:</strong> {transaction.completedBy || 'N/A'} <br />
                          <small>
                            Action taken on: {transaction.completedAt ? new Date(transaction.completedAt).toLocaleString() : 'N/A'}
                          </small>
                        </p>
                      </>
                    )}

                    {transaction.status === 'rejected' && (
                      <p>
                        <strong>Rejected by:</strong> {transaction.adminActionBy} <br />
                        <small>
                          Action taken on: {transaction.adminActionAt ? new Date(transaction.adminActionAt).toLocaleString() : 'N/A'}
                        </small>
                      </p>
                    )}
                  </>
                )}



                <div className="actions">
                  {transaction.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openModal(transaction.transactionId, 'approve')}
                        disabled={disabled}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openModal(transaction.transactionId, 'reject')}
                        disabled={disabled}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {transaction.status === 'approved' && (
                    <button
                      onClick={() => openModal(transaction.transactionId, 'complete')}
                      disabled={disabled}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              Are you sure you want to{' '}
              {modalAction === 'approve'
                ? 'approve'
                : modalAction === 'reject'
                  ? 'reject'
                  : 'complete'}{' '}
              this transaction?
            </h3>
            <div className="modal-actions">
              <button onClick={handleAction}>
                {modalAction === 'approve'
                  ? 'Approve'
                  : modalAction === 'reject'
                    ? 'Reject'
                    : 'Complete'}
              </button>
              <button className="close-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;
