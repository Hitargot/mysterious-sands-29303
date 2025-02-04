import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Alert from "../components/Alert"; // Your alert component
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed
import '../styles/TradeTransactions.css';

const TradeTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [adminUsername, setAdminUsername] = useState(""); // Admin username extracted from JWT
    const [showRejectModal, setShowRejectModal] = useState(false); // Modal state for rejection
    const [showApproveModal, setShowApproveModal] = useState(false); // Modal state for approval
    const [selectedTransaction, setSelectedTransaction] = useState(null); // For selected transaction
    const [searchTerm, setSearchTerm] = useState(""); // For search term
    //const apiUrl = "http://localhost:22222"; 
    const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

    // Fetch transactions function
    const fetchTransactions = useCallback(async () => {
      try {
          const token = localStorage.getItem('adminToken');
          if (!token) {
              setError("Unauthorized: Admin token missing.");
              alert("Admin token missing. Please log in again.");
              return;
          }

          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(`${apiUrl}/api/admin/confirmations`, { headers });

          const sortedTransactions = response.data.confirmations.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
          );

          setTransactions(sortedTransactions);
          setFilteredTransactions(sortedTransactions);

          const decodedToken = jwtDecode(token);
          setAdminUsername(decodedToken.username);
          console.log(decodedToken.username); // Corrected logging
          console.log(adminUsername); // Just to use the variable

      } catch (err) {
          const errorMessage = err.response?.data?.message || 'Failed to fetch trade transactions.';
          setError(errorMessage);
          alert(errorMessage); // Alert the error message
      }
    }, [apiUrl, adminUsername]);

    useEffect(() => {
      fetchTransactions();
    }, [fetchTransactions]);

    // Search function to filter transactions based on the search term
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = transactions.filter((tx) =>
            tx.transactionId.toLowerCase().includes(term) ||
            tx.userId?.username.toLowerCase().includes(term) ||
            tx.serviceId?.name.toLowerCase().includes(term)
        );
        setFilteredTransactions(filtered);
    };

    // ✅ Approve Confirmation
    const handleApprove = async (id) => {
      try {
          const token = localStorage.getItem('adminToken');
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.patch(`${apiUrl}/api/admin/confirmations/${id}/approve`, {}, { headers });

          setTransactions((prevTransactions) =>
              prevTransactions.map((transaction) =>
                  transaction._id === response.data.confirmation._id
                      ? { ...transaction, status: 'Approved', approvedAt: response.data.confirmation.approvedAt }
                      : transaction
              )
          );

          // Also update the filtered list to reflect changes
          setFilteredTransactions((prevFiltered) =>
              prevFiltered.map((transaction) =>
                  transaction._id === response.data.confirmation._id
                      ? { ...transaction, status: 'Approved', approvedAt: response.data.confirmation.approvedAt }
                      : transaction
              )
          );
          setShowApproveModal(false); // Close the modal after approval
          alert("Transaction approved successfully!"); // Success alert
      } catch (error) {
          setError("Failed to approve transaction.");
          alert("Failed to approve transaction."); // Error alert
      }
    };

    const handleReject = async (id, rejectionReason) => {
      try {
          const token = localStorage.getItem('adminToken');
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.patch(`${apiUrl}/api/admin/confirmations/${id}/reject`, { rejectionReason }, { headers });

          setTransactions((prevTransactions) =>
              prevTransactions.map((transaction) =>
                  transaction._id === response.data.confirmation._id
                      ? { ...transaction, status: 'Rejected', rejectionReason: response.data.confirmation.rejectionReason }
                      : transaction
              )
          );

          // Also update the filtered list to reflect changes
          setFilteredTransactions((prevFiltered) =>
              prevFiltered.map((transaction) =>
                  transaction._id === response.data.confirmation._id
                      ? { ...transaction, status: 'Rejected', rejectionReason: response.data.confirmation.rejectionReason }
                      : transaction
              )
          );

          setShowRejectModal(false); // Close the modal after rejection
          alert("Transaction rejected successfully!"); // Success alert
      } catch (error) {
          setError("Failed to reject transaction.");
          alert("Failed to reject transaction."); // Error alert
      }
    };

    const handleRejectModal = (transaction) => {
        setSelectedTransaction(transaction);
        setShowRejectModal(true);
    };

    const handleApproveModal = (transaction) => {
        setSelectedTransaction(transaction);
        setShowApproveModal(true); // Open approve modal
    };

    const handleRejectConfirmation = (confirmation) => {
        if (confirmation) {
            const rejectionReason = rejectionReasons[selectedTransaction._id];
            
            if (!rejectionReason) {
                // Alert if no reason is provided
                alert("Please provide a rejection reason.");
                return; // Prevent rejection without a reason
            }

            handleReject(selectedTransaction._id, rejectionReason);
        }
        setShowRejectModal(false);
    };

    const handleApproveConfirmation = (confirmation) => {
        if (confirmation) {
            handleApprove(selectedTransaction._id);
        }
        setShowApproveModal(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Trade Transactions</h2>

            {/* Show Alert if there's an error */}
            {error && <Alert type="error" message={error} />}

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    className="search-bar p-2 border rounded w-full"
                    placeholder="Search transactions by ID, User, or Service"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            {/* Transaction Cards - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTransactions.map((tx) => (
                    <div
                        key={tx._id}
                        className={`transaction-card p-4 rounded-lg shadow-md border ${tx.status === "Approved" ? "border-green-500" : tx.status === "Rejected" ? "border-red-500" : "border-gray-300"}`}
                    >
                        <h3 className="text-lg font-bold">
                            Transaction ID: {tx.transactionId}
                        </h3>
                        <p><strong>User:</strong> {tx.userId?.username || "N/A"}</p>
                        <p><strong>Service:</strong> {tx.serviceId?.name || "N/A"}</p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span className={`status-text font-semibold ${tx.status === "Approved" ? "text-green-600" : tx.status === "Rejected" ? "text-red-600" : "text-yellow-500"}`}>
                                {tx.status}
                            </span>
                        </p>
                        <p><strong>Approved/Rejected By:</strong> {tx.adminUsername || "N/A"}</p>

                        {/* Show timestamps */}
                        {tx.status === "Approved" && (
                            <p><strong>Approved At:</strong> {new Date(tx.approvedAt).toLocaleString()}</p>
                        )}
                        {tx.status === "Rejected" && (
                            <>
                                <p><strong>Rejected At:</strong> {new Date(tx.rejectedAt).toLocaleString()}</p>
                                <p><strong>Reason:</strong> {tx.rejectionReason}</p>
                            </>
                        )}

                        {/* New Fields for Note and File URL */}
                        {tx.note && (
                            <p><strong>Note:</strong> {tx.note}</p>
                        )}
                        {tx.fileUrl && (
                            <div className="file-url-section mt-3">
                                <p><strong>File URL:</strong> 
                                    <a
                                        href={tx.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="file-url-button px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300"
                                    >
                                        View File
                                    </a>
                                </p>
                            </div>
                        )}

                        {/* Approve & Reject Buttons (Only if still pending) */}
                        {tx.status === "Pending" && (
                            <div className="mt-3">
                                <button
                                    className="approve-btn px-3 py-1 bg-green-500 text-white rounded-md mr-2"
                                    onClick={() => handleApproveModal(tx)} // Open approve modal
                                >
                                    Approve
                                </button>

                                <button
                                    className="reject-btn px-3 py-1 bg-red-500 text-white rounded-md"
                                    onClick={() => handleRejectModal(tx)} // Open reject modal
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal for Reject Confirmation */}
            {showRejectModal && (
                <div className="reject-modal">
                    <div className="modal-content p-6">
                        <h3 className="text-xl">Reject Transaction</h3>
                        <textarea
                            className="reject-reason p-2 border rounded w-full"
                            placeholder="Enter rejection reason"
                            value={rejectionReasons[selectedTransaction._id] || ""}
                            onChange={(e) => {
                                setRejectionReasons((prev) => ({
                                    ...prev,
                                    [selectedTransaction._id]: e.target.value,
                                }));
                            }}
                        />
                        <div className="mt-4">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md"
                                onClick={() => handleRejectConfirmation(true)}
                            >
                                Reject
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded-md ml-2"
                                onClick={() => setShowRejectModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Approve Confirmation */}
            {showApproveModal && (
                <div className="approve-modal">
                    <div className="modal-content p-6">
                        <h3 className="text-xl">Approve Transaction</h3>
                        <p>Are you sure you want to approve this transaction?</p>
                        <div className="mt-4">
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-md"
                                onClick={() => handleApproveConfirmation(true)}
                            >
                                Approve
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded-md ml-2"
                                onClick={() => setShowApproveModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeTransactions;
