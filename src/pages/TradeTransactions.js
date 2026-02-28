import React, { useEffect, useState, useCallback } from 'react';
import axios from "axios";
import Alert from "../components/Alert"; // Your alert component
import '../styles/TradeTransactions.css';
import FundConfirmationModal from "../components/FundConfirmationModal.js"; // Import the modal component
import { getAdminToken, getAdminPayload } from '../utils/adminAuth';


const TradeTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [rejectionReasons, setRejectionReasons] = useState({});
    // Decode admin username once from stored payload — kept for future use
    // eslint-disable-next-line no-unused-vars
    const [adminUsername] = useState(() => {
        const payload = getAdminPayload();
        if (payload?.username) return payload.username;
        // fallback: decode raw token once
        try {
            const token = getAdminToken();
            if (token) {
                const parts = token.split('.');
                const decoded = JSON.parse(atob(parts[1]));
                return decoded.username || '';
            }
        } catch (_) {}
        return '';
    });
    const [showRejectModal, setShowRejectModal] = useState(false); // Modal state for rejection
    const [showApproveModal, setShowApproveModal] = useState(false); // Modal state for approval
    const [selectedTransaction, setSelectedTransaction] = useState(null); // For selected transaction
    const [searchTerm, setSearchTerm] = useState(""); // For search term

    const apiUrl = process.env.REACT_APP_API_URL;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationId, setConfirmationId] = useState(null);

    // Responsive: track viewport width to switch between mobile card view and desktop table view
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const isDesktop = windowWidth >= 1024;

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);


    // Fetch transactions function
    const fetchTransactions = useCallback(async () => {
        try {
            const token = getAdminToken();
            if (!token) {
                setError("Unauthorized: Admin token missing.");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${apiUrl}/api/admin/confirmations`, { headers });

            const sortedTransactions = (response.data.confirmations || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setTransactions(sortedTransactions);
            setFilteredTransactions(sortedTransactions);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch trade transactions.';
            setError(errorMessage);
        }
    }, [apiUrl]); // ← removed adminUsername: was causing re-fetch loop



    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Search function to filter transactions based on the search term
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = transactions.filter((tx) =>
            (tx.transactionId || '').toString().toLowerCase().includes(term) ||
            (tx.userId?.username || '').toString().toLowerCase().includes(term) ||
            (tx.serviceId?.name || tx.serviceName || '').toString().toLowerCase().includes(term) ||
            (tx.serviceTag || tx.serviceId?.tag || '').toString().toLowerCase().includes(term)
        );
        setFilteredTransactions(filtered);
    };

    // �?Approve Confirmation
    const handleApprove = async (id) => {
        try {
            const token = getAdminToken();
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
    //         const token = getAdminToken();
    //         if (!token) {
    //             alert("Admin authentication token missing. Please log in again.");
    //             return;
    //         }

    //         const headers = { Authorization: `Bearer ${token}` };

    //          �?Send funding request
    //         const response = await axios.post(`${apiUrl}/api/admin/confirmations/${confirmationId}/fund`, {
    //             userId,
    //             amount
    //         }, { headers });

    //         �?Show success alert
    //         alert(`Wallet funded successfully with �?{amount}`);

    //          �?Update state to mark transaction as funded
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
            const token = getAdminToken();
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

            {/* Responsive view: Table on desktop, cards on mobile */}
            {isDesktop ? (
                /* Desktop table layout */
                <div className="transactions-table-wrap">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>User</th>
                                <th>Tag</th>
                                <th>Service</th>
                                <th>Amounts</th>
                                <th>Status</th>
                                <th>Files</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((tx) => (
                                <tr key={tx._id} className={`tx-row ${tx.status ? tx.status.toLowerCase() : ''}`}>
                                    <td className="mono">{tx.transactionId}</td>
                                    <td>{tx.userId?.username || 'N/A'}</td>
                                    <td>{tx.serviceTag || tx.serviceId?.tag || '-'}</td>
                                    <td>{tx.serviceId?.name || 'N/A'}</td>
                                    <td>
                                        {/* compact multi-line amounts */}
                                        <div className="amounts-cell">
                                            {tx.userAmountInForeignCurrency ?? tx.amountInForeignCurrency ?? tx.originalAmount ? (
                                                <div className="amt user">User: {Number(tx.userAmountInForeignCurrency ?? tx.amountInForeignCurrency ?? tx.originalAmount).toLocaleString()}</div>
                                            ) : null}
                                            {tx.adminProvidedAmount ?? tx.adminAmount ?? tx.adminForeignAmount ? (
                                                <div className="amt admin">Admin: {Number(tx.adminProvidedAmount ?? tx.adminAmount ?? tx.adminForeignAmount).toLocaleString()}</div>
                                            ) : null}
                                            {tx.amountInNaira ? (
                                                <div className="amt funded">NGN: ₦{Number(tx.amountInNaira).toLocaleString()}</div>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${tx.status ? tx.status.toLowerCase() : ''}`}>{tx.status}</span>
                                    </td>
                                    <td>
                                        <div className="files-cell">
                                            {Array.isArray(tx.fileUrls) && tx.fileUrls.length > 0 ? (
                                                tx.fileUrls.map((f, i) => {
                                                    const href = f.startsWith('/') ? `${apiUrl}${f}` : f;
                                                    return (
                                                        <div key={i}><a href={href} target="_blank" rel="noopener noreferrer">file {i+1}</a></div>
                                                    );
                                                })
                                            ) : (
                                                <div className="muted">No files</div>
                                            )}
                                            {/* timestamps */}
                                            <div className="timestamps mt-2">
                                                <div className="created">Created: {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}</div>
                                                {(() => {
                                                    const actionTime = tx.approvedAt || tx.fundedAt || tx.rejectedAt || tx.updatedAt;
                                                    const actionLabel = tx.approvedAt ? 'Approved' : tx.fundedAt ? 'Funded' : tx.rejectedAt ? 'Rejected' : (tx.updatedAt ? 'Updated' : null);
                                                    return actionLabel ? <div className="action">{actionLabel} at: {actionTime ? new Date(actionTime).toLocaleString() : 'N/A'}</div> : null;
                                                })()}
                                            </div>
                                            <div className="actions-inline mt-2">
                                                {tx.status === 'Pending' && (
                                                    <>
                                                        <button className="btn approve" onClick={() => handleApproveModal(tx)}>Approve</button>
                                                        <button className="btn reject" onClick={() => handleRejectModal(tx)}>Reject</button>
                                                    </>
                                                )}
                                                {tx.status === 'Approved' && (
                                                    <button className="btn fund" onClick={() => handleOpenModal(tx._id)}>Fund</button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTransactions.map((tx) => (
                        <div
                            key={tx._id}
                            className={`transaction-card p-4 rounded-lg shadow-md border ${tx.status === "Approved" ? "border-green-500" : tx.status === "Rejected" ? "border-red-500" : "border-gray-300"}`}
                        >
                            <div className="card-row">
                                <div className="card-left">
                                    <h3 className="text-lg font-bold">{tx.transactionId}</h3>
                                    <p className="muted">{tx.userId?.username || "N/A"} - {tx.serviceId?.name || "N/A"}</p>
                                    <p className="muted">Tag: {tx.serviceTag || tx.serviceId?.tag || '-'}</p>
                                    {Array.isArray(tx.fileUrls) && tx.fileUrls.length > 0 && (
                                        <>
                                            <div className="mt-2">
                                                {tx.fileUrls.map((f, i) => {
                                                    const href = f.startsWith('/') ? `${apiUrl}${f}` : f;
                                                    return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="file-link mr-2">file {i+1}</a>;
                                                })}
                                            </div>
                                            <div className="timestamps mt-2">
                                                <div className="created">Created: {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}</div>
                                                {(() => {
                                                    const actionTime = tx.approvedAt || tx.fundedAt || tx.rejectedAt || tx.updatedAt;
                                                    const actionLabel = tx.approvedAt ? 'Approved' : tx.fundedAt ? 'Funded' : tx.rejectedAt ? 'Rejected' : (tx.updatedAt ? 'Updated' : null);
                                                    return actionLabel ? <div className="action">{actionLabel} at: {actionTime ? new Date(actionTime).toLocaleString() : 'N/A'}</div> : null;
                                                })()}
                                            </div>
                                            <div className="card-actions mt-2">
                                                {tx.status === 'Pending' && (
                                                    <>
                                                        <button className="approve-btn px-3 py-1 bg-green-500 text-white rounded-md mr-2" onClick={() => handleApproveModal(tx)}>Approve</button>
                                                        <button className="reject-btn px-3 py-1 bg-red-500 text-white rounded-md" onClick={() => handleRejectModal(tx)}>Reject</button>
                                                    </>
                                                )}
                                                {tx.status === 'Approved' && (
                                                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={() => handleOpenModal(tx._id)}>Fund</button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="card-right">
                                    <span className={`status-badge ${tx.status ? tx.status.toLowerCase() : ''}`}>{tx.status}</span>
                                </div>
                            </div>
                            <div className="card-amounts mt-2">
                                {(() => {
                                    const fmtNumber = (v) => (v == null ? null : Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                                    const userAmount = tx.userAmountInForeignCurrency ?? tx.amountInForeignCurrency ?? tx.originalAmount ?? null;
                                    const userCurrency = tx.userSelectedCurrency || tx.selectedCurrency || tx.currency || null;
                                    const adminForeignCandidates = [tx.adminProvidedAmount, tx.adminAmount, tx.adminForeignAmount, tx.amountAdmin];
                                    let adminForeign = adminForeignCandidates.find(v => typeof v === 'number');
                                    let adminForeignDerived = false;
                                    if (adminForeign == null && tx.amountInNaira != null && tx.exchangeRateUsed) {
                                        adminForeign = Number(tx.amountInNaira) / Number(tx.exchangeRateUsed);
                                        adminForeignDerived = true;
                                    }
                                    const adminCurrency = tx.adminSelectedCurrency || tx.adminCurrency || tx.selectedCurrency || tx.currency || null;
                                    const fundedNgn = tx.amountInNaira != null ? Number(tx.amountInNaira) : null;
                                    return (
                                        <>
                                            {userAmount != null && userCurrency && (
                                                <div className="amt user"><strong>User:</strong> {fmtNumber(userAmount)} {userCurrency}</div>
                                            )}
                                            {adminForeign != null && adminCurrency && (
                                                <div className="amt admin"><strong>Admin:</strong> {fmtNumber(adminForeign)} {adminCurrency}{adminForeignDerived ? <span className="derived"> (derived)</span> : null}</div>
                                            )}
                                            {(tx.status === 'Funded' || tx.fundedAt) && fundedNgn != null && (
                                                <div className="amt funded"><strong>Total Funded (NGN):</strong> ₦{Number(fundedNgn).toLocaleString()}</div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
