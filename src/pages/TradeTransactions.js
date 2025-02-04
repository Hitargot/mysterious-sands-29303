import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Alert from "../components/Alert"; // Your alert component
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed

const TradeTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [adminUsername, setAdminUsername] = useState(""); // Admin username extracted from JWT
    const [alertMessage, setAlertMessage] = useState(""); // For showing alerts
    const [showRejectModal, setShowRejectModal] = useState(false); // Modal state for rejection
    const [showApproveModal, setShowApproveModal] = useState(false); // Modal state for approval
    const [selectedTransaction, setSelectedTransaction] = useState(null); // For selected transaction
    const [searchTerm, setSearchTerm] = useState(""); // For search term

    const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

    // Fetch transactions function
    const fetchTransactions = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                setError("Unauthorized: Admin token missing.");
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

            setAlertMessage("Transaction approved successfully!"); // Show success alert
            setShowApproveModal(false); // Close the modal after approval
        } catch (error) {
            setError("Failed to approve transaction.");
        }
    };

    const handleReject = async (id, rejectionReason) => {
        if (!rejectionReason || rejectionReason.trim() === "") {
            setAlertMessage("Please provide a reason for rejection!"); // Show alert for missing reason
            return;
        }

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

            setAlertMessage("Transaction rejected successfully!"); // Show success alert
            setShowRejectModal(false); // Close the modal after rejection
        } catch (error) {
            setError("Failed to reject transaction.");
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

            {/* Show custom alert message */}
            {alertMessage && <Alert type="success" message={alertMessage} />}

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

                        {/* Approve & Reject Buttons (Only if still pending) */}
                        {tx.status === "Pending" && (
                            <div className="mt-3">
                                <button
                                    onClick={() => handleApproveModal(tx)}
                                    className="approve-btn p-2 bg-green-500 text-white rounded-md hover:bg-green-700 mr-3"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleRejectModal(tx)}
                                    className="reject-btn p-2 bg-red-500 text-white rounded-md hover:bg-red-700"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="reject-modal">
                    <div className="modal-content p-4">
                        <h3>Reason for Rejecting</h3>
                        <textarea
                            value={rejectionReasons[selectedTransaction._id] || ""}
                            onChange={(e) => setRejectionReasons({
                                ...rejectionReasons,
                                [selectedTransaction._id]: e.target.value
                            })}
                            className="p-2 border rounded w-full mb-4"
                        />
                        <button
                            onClick={() => handleRejectConfirmation(true)}
                            className="p-2 bg-red-600 text-white rounded"
                        >
                            Confirm Reject
                        </button>
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="p-2 bg-gray-500 text-white rounded ml-3"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="approve-modal">
                    <div className="modal-content p-4">
                        <h3>Are you sure you want to approve this transaction?</h3>
                        <button
                            onClick={() => handleApproveConfirmation(true)}
                            className="p-2 bg-green-600 text-white rounded"
                        >
                            Confirm Approve
                        </button>
                        <button
                            onClick={() => setShowApproveModal(false)}
                            className="p-2 bg-gray-500 text-white rounded ml-3"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeTransactions;
