import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Alert from "../components/Alert"; // Your alert component
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed
import '../styles/TradeTransactions.css';
import FundConfirmationModal from "../components/FundConfirmationModal.js"; // Import the modal component


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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationId, setConfirmationId] = useState(null);


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
            setShowApproveModal(false); // Close the modal after approval
        } catch (error) {
            setError("Failed to approve transaction.");
        }
    };
    const userId = localStorage.getItem('userId'); // or from AuthContext

    // const handleFunding = async (confirmationId, userId, amount) => {
    //     try {
    //         const token = localStorage.getItem('adminToken');
    //         if (!token) {
    //             alert("Admin authentication token missing. Please log in again.");
    //             return;
    //         }

    //         const headers = { Authorization: `Bearer ${token}` };

    //          ✅ Send funding request
    //         const response = await axios.post(`${apiUrl}/api/admin/confirmations/${confirmationId}/fund`, {
    //             userId,
    //             amount
    //         }, { headers });

    //         ✅ Show success alert
    //         alert(`Wallet funded successfully with ₦${amount}`);

    //          ✅ Update state to mark transaction as funded
    //         setTransactions((prev) =>
    //             prev.map((tx) =>
    //                 tx._id === confirmationId ? { ...tx, funded: true } : tx
    //             )
    //         );
    //         setFilteredTransactions((prev) =>
    //             prev.map((tx) =>
    //                 tx._id === confirmationId ? { ...tx, funded: true } : tx
    //             )
    //         );

    //     } catch (error) {
    //         console.error("Funding Error:", error.response?.data || error.message);
    //         alert(error.response?.data?.message || "Failed to fund wallet. Try again.");
    //     }
    // };




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

    const handleOpenModal = (confirmationId) => {
        setIsModalOpen(true);
        setConfirmationId(confirmationId); // Ensure you're setting a single confirmationId
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
                        <p><strong>Service:</strong> {tx.serviceId?.tag || "N/A"}</p>

                        <p>
                            <strong>Status:</strong>{" "}
                            <span className={`status-text font-semibold ${tx.status === "Approved" ? "text-green-600" : tx.status === "Rejected" ? "text-red-600" : "text-yellow-500"}`}>
                                {tx.status}
                            </span>
                        </p>
                        <p><strong>Approved/Rejected By:</strong> {tx.adminUsername || "N/A"}</p>

                        {/* Show timestamps */}
                        {
                            tx.status === "Approved" && (
                                <>
                                    <p><strong>Approved At:</strong> {new Date(tx.approvedAt).toLocaleString()}</p>

                                    {/* Display Funded At after successful funding */}
                                    {tx.status === "Funded" && tx.fundedAt && (
                                        <p><strong>Funded At:</strong> {new Date(tx.fundedAt).toLocaleString()}</p>
                                    )}

                                    {/* ✅ New Funding Button (Only for Approved Transactions) */}
                                    <button
                                        onClick={() => handleOpenModal(tx._id)}  // Use tx here, not transaction
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                                    >
                                        Fund
                                    </button>
                                </>
                            )
                        }


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
                                onClick={() => handleRejectConfirmation(false)}
                            >
                                No
                            </button>
                            <button
                                className="confirm-btn px-4 py-2 bg-red-500 text-white rounded"
                                onClick={() => handleRejectConfirmation(true)}
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
                                onClick={() => handleApproveConfirmation(false)}
                            >
                                No
                            </button>
                            <button
                                className="confirm-btn px-4 py-2 bg-green-500 text-white rounded"
                                onClick={() => handleApproveConfirmation(true)}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <FundConfirmationModal
                    confirmationId={confirmationId}
                    userId={userId}  // Make sure userId is defined here
                    onClose={() => setIsModalOpen(false)}
                />
            )}



        </div>
    );
};

export default TradeTransactions;
