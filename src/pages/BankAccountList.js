import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '../components/Alert';  // Import the alert component
import '../styles/BankAccountList.css'; // Import the CSS file

const BankAccountList = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAccount, setEditingAccount] = useState(null);
  const [editForm, setEditForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
  });

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Alert state
  const [alert, setAlert] = useState({ message: '', type: '' });

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222"; 

  // Fetch bank accounts from the backend API
  const fetchBankAccounts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/bankaccounts`);
      setBankAccounts(response.data.bankAccounts);
      setFilteredAccounts(response.data.bankAccounts);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError('Failed to load bank accounts.');
      setAlert({ message: 'Failed to load bank accounts.', type: 'error' }); // Trigger error alert
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, [apiUrl]);

  // Handle search bar input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterAccounts(e.target.value);
  };

  // Filter bank accounts based on the search term
  const filterAccounts = (term) => {
    const lowercasedTerm = term.toLowerCase();
    const filtered = bankAccounts.filter(
      (account) =>
        account.bankName.toLowerCase().includes(lowercasedTerm) ||
        account.accountName.toLowerCase().includes(lowercasedTerm) ||
        account.accountNumber.includes(lowercasedTerm) ||
        account.userId?.username.toLowerCase().includes(lowercasedTerm) ||
        account._id.toLowerCase().includes(lowercasedTerm) // Added bankId for searching
    );
    setFilteredAccounts(filtered);
  };

  // Handle delete action (deletes from UI and backend)
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${apiUrl}/api/bankaccounts/${accountToDelete}`);
      console.log(response.data.message);
      const updatedAccounts = filteredAccounts.filter(account => account._id !== accountToDelete);
      setFilteredAccounts(updatedAccounts);
      setShowDeleteModal(false); // Close the modal
      setAlert({ message: 'Bank account deleted successfully.', type: 'success' }); // Success alert
    } catch (err) {
      console.error('Error deleting bank account:', err);
      setAlert({ message: 'Error deleting bank account.', type: 'error' }); // Error alert
    }
  };

  // Handle edit action (opens the edit form)
  const handleEdit = (account) => {
    setEditingAccount(account);
    setEditForm({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
    });
  };

  // Handle form input change
  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle form submission (save edited bank account)
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`${apiUrl}/api/bankaccounts/${editingAccount._id}`, editForm);
      const updatedAccounts = filteredAccounts.map(account =>
        account._id === editingAccount._id ? response.data.bankAccount : account
      );
      setFilteredAccounts(updatedAccounts);
      setEditingAccount(null); // Close edit form
      setAlert({ message: 'Bank account updated successfully.', type: 'success' }); // Success alert
    } catch (err) {
      console.error('Error updating bank account:', err);
      setAlert({ message: 'Error updating bank account.', type: 'error' }); // Error alert
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {/* Alert Component */}
      {alert.message && <Alert message={alert.message} type={alert.type} />}

      <h2>Bank Accounts</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Bank Name, Account Name, Username, or Bank ID"
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />

      {/* Edit Form */}
      {editingAccount && (
        <div>
          <h3>Edit Bank Account</h3>
          <form onSubmit={handleEditSubmit}>
            <input
              type="text"
              name="bankName"
              value={editForm.bankName}
              onChange={handleInputChange}
              placeholder="Bank Name"
              required
            />
            <input
              type="text"
              name="accountName"
              value={editForm.accountName}
              onChange={handleInputChange}
              placeholder="Account Name"
              required
            />
            <input
              type="text"
              name="accountNumber"
              value={editForm.accountNumber}
              onChange={handleInputChange}
              placeholder="Account Number"
              required
            />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditingAccount(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Bank Accounts List */}
      <div className="bank-account-list">
        {filteredAccounts.map((account) => (
          <div key={account._id} className="card">
            <div className="card-header">
              <strong>Bank Name:</strong> {account.bankName}
            </div>
            <div className="card-body">
              <div>
                <strong>Account Name:</strong> {account.accountName}
              </div>
              <div>
                <strong>Account Number:</strong> {account.accountNumber}
              </div>
              <div>
                <strong>Username:</strong> {account.userId?.username}
              </div>
              <div>
                <strong>Created At:</strong> {new Date(account.createdAt).toLocaleString()}
              </div>
              <div>
                <strong>Bank Account ID:</strong> {account._id}
              </div>
            </div>
            <div className="card-footer">
              <button onClick={() => handleEdit(account)} className="edit-btn">Edit</button>
              <button onClick={() => {
                setAccountToDelete(account._id);
                setShowDeleteModal(true);
              }} className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this bank account?</h3>
            <button onClick={handleDelete} className="confirm-btn">Yes</button>
            <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountList;
