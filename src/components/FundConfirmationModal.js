import React, { useState } from "react";
import axios from "axios";
import Alert from "../components/Alert"; // Assuming you have an alert component
import '../styles/FundConfirmationModal.css';

const FundConfirmationModal = ({ confirmationId, userId, onClose }) => {
    const [currency, setCurrency] = useState("usd");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    //const apiUrl = "http://localhost:22222"; // Adjust based on your backend
    const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";


    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleCurrencyChange = (e) => {
        setCurrency(e.target.value.toLowerCase());
    };

    const handleFundConfirmation = async () => {
        setLoading(true);
        setAlert(null);

        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                setAlert({ type: "error", message: "Admin authentication token missing. Please log in again." });
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.post(
                `${apiUrl}/api/admin/confirmations/${confirmationId}/fund`,
                { userId, amount, currency },
                { headers }
            );

            setAlert({ type: "success", message: `Wallet funded successfully with ₦${response.data?.amountInNaira}` });

            // Automatically close modal after success alert
            setTimeout(() => {
                setAlert(null);
                onClose(); // Close modal
            }, 2000); // 2 seconds delay

            setAmount(""); // Reset input field after success
        } catch (error) {
            console.error("Funding Error:", error.response?.data || error.message);
            setAlert({ type: "error", message: error.response?.data?.message || "Failed to fund wallet. Try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Fund Confirmation</h2>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                <div>
                    <label>Select Currency:</label>
                    <select value={currency} onChange={handleCurrencyChange}>
                        <option value="usd">USD</option>
                        <option value="eur">EUR</option>
                        <option value="gbp">GBP</option>
                    </select>
                </div>

                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                    />
                </div>

                <div className="button-group">
                    <button className="close-btn" onClick={onClose}>Close</button>
                    <button onClick={handleFundConfirmation} disabled={loading}>
                        {loading ? "Processing..." : "Fund"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FundConfirmationModal;
