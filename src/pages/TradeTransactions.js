import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Alert from "../components/Alert";
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed
import '../styles/TradeTransactions.css';

const TradeTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState(""); // 'success' or 'error'
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

    // Fetch transactions function
    const fetchTransactions = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                setError("Unauthorized: Admin token missing.");
                setAlertMessage("Unauthorized: Admin token missing.");
                setAlertType("error");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${apiUrl}/api/admin/confirmations`, { headers });

            const sortedTransactions = response.data.confirmations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setTransactions(sortedTransactions);
            setFilteredTransactions(sortedTransactions);

            const decodedToken = jwtDecode(token);
            console.log(decodedToken.username);  // Logging decoded username
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch trade transactions.';
            setError(errorMessage);
            setAlertMessage(errorMessage);
            setAlertType("error");
        }
    }, [apiUrl]);

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

    // Approve Confirmation
    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.patch(`${apiUrl}/api/admin/confirmations/${id}/approve`, {}, { headers });

            setTransactions(prevTransactions => prevTransactions.map((transaction) =>
                transaction._id === response.data.confirmation._id
                    ? { ...transaction, status: 'Approved', approvedAt: response.data.confirmation.approvedAt }
                    : transaction
            ));

            setFilteredTransactions(prevFiltered => prevFiltered.map((transaction) =>
                transaction._id === response.data.confirmation._id
                    ? { ...transaction, status: 'Approved', approvedAt: response.data.confirmation.approvedAt }
                    : transaction
            ));

            setAlertMessage("Transaction approved successfully!");
            setAlertType("success");
            setShowApproveModal(false);
        } catch (error) {
            setAlertMessage("Failed to approve transaction.");
            setAlertType("error");
        }
    };

    // Reject Confirmation
    const handleReject = async (id, rejectionReason) => {
        if (!rejectionReason || rejectionReason.trim() === "") {
            setAlertMessage("Please provide a reason for rejection!");
            setAlertType("error");
            return;
        }
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.patch(`${apiUrl}/api/admin/confirmations/${id}/reject`, { rejectionReason }, { headers });

            setTransactions(prevTransactions => prevTransactions.map((transaction) =>
                transaction._id === response.data.confirmation._id
                    ? { ...transaction, status: 'Rejected', rejectionReason: response.data.confirmation.rejectionReason }
                    : transaction
            ));

            setFilteredTransactions(prevFiltered => prevFiltered.map((transaction) =>
                transaction._id === response.data.confirmation._id
                    ? { ...transaction, status: 'Rejected', rejectionReason: response.data.confirmation.rejectionReason }
                    : transaction
            ));

            setAlertMessage("Transaction rejected successfully!");
            setAlertType("success");
            setShowRejectModal(false);
        } catch (error) {
            setAlertMessage("Failed to reject transaction.");
            setAlertType("error");
        }
    };

    // Handle Modal visibility
    const handleModal = (transaction, action) => {
        setSelectedTransaction(transaction);
        if (action === "approve") {
            setShowApproveModal(true);
        } else if (action === "reject") {
            setShowRejectModal(true);
        }
    };

    // Handle alert display
    const handleAlert = () => {
        if (alertMessage) {
            return <Alert type={alertType} message={alertMessage} />;
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Trade Transactions</h2>

            {/* Show Alert if there's an error */}
            {handleAlert()}

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
                        <h3 className="text-lg font-bold">Transaction ID: {tx.transactionId}</h3>
                        <p><strong>User:</strong> {tx.userId?.username || "N/A"}</p>
                        <p><strong>Service:</strong> {tx.serviceId?.name || "N/A"}</p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span className={`status-text font-semibold ${tx.status === "Approved" ? "text-green-600" : tx.status === "Rejected" ? "text-red-600" : "text-yellow-500"}`}>
                                {tx.status}
                            </span>
                        </p>

                        {/* Approve & Reject Buttons (Only if still pending) */}
                        {tx.status === "Pending" && (
                            <div className="mt-3">
                                <button
                                    className="approve-btn px-3 py-1 bg-green-500 text-white rounded-md mr-2"
                                    onClick={() => handleModal(tx, "approve")}
                                >
                                    Approve
                                </button>

                                <button
                                    className="reject-btn px-3 py-1 bg-red-500 text-white rounded-md"
                                    onClick={() => handleModal(tx, "reject")}
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Reject Confirmation Modal */}
            {showRejectModal && (
                <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Are you sure you want to reject this transaction?</h3>
                        <div className="mb-4">
                            <textarea
                                placeholder="Enter rejection reason"
                                className="rejection-textarea p-2 border rounded w-full"
                                value={rejectionReasons[selectedTransaction._id] || ""}
                                onChange={(e) =>
                                    setRejectionReasons({ ...rejectionReasons, [selectedTransaction._id]: e.target.value })
                                }
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                className="cancel-btn px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setShowRejectModal(false)}
                            >
                                No
                            </button>
                            <button
                                className="confirm-btn px-4 py-2 bg-red-500 text-white rounded"
                                onClick={() => handleReject(selectedTransaction._id, rejectionReasons[selectedTransaction._id])}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Confirmation Modal */}
            {showApproveModal && (
                <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Are you sure you want to approve this transaction?</h3>
                        <div className="flex justify-between">
                            <button
                                className="cancel-btn px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setShowApproveModal(false)}
                            >
                                No
                            </button>
                            <button
                                className="confirm-btn px-4 py-2 bg-green-500 text-white rounded"
                                onClick={() => handleApprove(selectedTransaction._id)}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeTransactions;
