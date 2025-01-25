import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/TransactionHistory.css";
import { FaReceipt } from "react-icons/fa";
import Spinner from "./Spinner";
import html2canvas from "html2canvas";
import Alert from "./Alert";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const apiUrl = "http://localhost:22222"; // Replace with your API URL

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const token =
          localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
        const response = await axios.get(
          `${apiUrl}/api/transaction/transaction-history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setAlertMessage(
          "Failed to fetch transactions. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [apiUrl]);

  useEffect(() => {
    let filtered = transactions;

    // Apply filters
    if (statusFilter) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (amountFilter) {
      filtered = filtered.filter(
        (transaction) => transaction.amount === Number(amountFilter)
      );
    }

    if (filterType) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.type.toLowerCase() === filterType.toLowerCase()
      );
    }

    if (filterDate) {
      filtered = filtered.filter(
        (transaction) =>
          new Date(transaction.date).toLocaleDateString() === filterDate
      );
    }

    setFilteredTransactions(filtered);
  }, [statusFilter, amountFilter, filterType, filterDate, transactions]);

  const fetchReceipt = async (id) => {
    setLoadingReceipt(true);
    try {
      const token =
        localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
      const response = await axios.get(
        `${apiUrl}/api/transaction/transaction-history/receipt/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReceipt(response.data);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      setAlertMessage("Failed to fetch receipt. Please try again.");
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleCopyTransactionId = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShareReceipt = async () => {
    try {
      const receiptElement = document.querySelector(".receipt-modal");
      const canvas = await html2canvas(receiptElement);
      const imgData = canvas.toDataURL("image/png");
  
      // Convert the image data to a Blob (required for sharing files)
      const response = await fetch(imgData);
      const blob = await response.blob();
      const file = new File([blob], "receipt.png", { type: "image/png" });
  
      // Check if sharing is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Transaction Receipt",
          text: "Here is your transaction receipt.",
        });
        console.log("Receipt shared successfully!");
      } else {
        console.warn("Sharing is not supported on this device.");
        alert("Sharing is not supported on this device.");
      }
    } catch (error) {
      console.error("Error sharing receipt as image:", error);
      alert("Error sharing receipt. Please try again.");
    }
  };
  

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>

      {/* Filter Section */}
      <div className="filter-section">
        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="">Filter by Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
        <input
          type="number"
          placeholder="Filter by Amount"
          onChange={(e) => setAmountFilter(e.target.value)}
          value={amountFilter}
        />
      </div>

      {/* Additional Filter Section */}
      <div className="filters">
        <select
          onChange={(e) => setFilterType(e.target.value)}
          value={filterType}
        >
          <option value="">All Types</option>
          <option value="Withdrawal">Withdrawal</option>
          <option value="Deposit">Deposit</option>
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filteredTransactions.length === 0 ? (
        <div className="no-transactions">
          <p>No transactions found. Start trading or check back later!</p>
        </div>
      ) : (
        <div className="transaction-cards">
          {filteredTransactions.map((transaction) => (
            <div className="transaction-card" key={transaction._id}>
              <div className="card-header">
                <span className="transaction-type">{transaction.type}</span>
                <span
                  className={`status-badge ${
                    transaction.status === "Completed" ? "success" : "error"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="card-body">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Amount:</strong>{" "}
                  {transaction.type.toLowerCase() === "withdrawal"
                    ? transaction.amount
                    : transaction.ngnAmount}{" "}
                  NGN
                </p>
              </div>
              <div className="card-actions">
                <button onClick={() => fetchReceipt(transaction._id)}>
                  <FaReceipt /> View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Section */}
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage("")} />
      )}

      {loadingReceipt && <Spinner />}

      {receipt && (
        <div className="receipt-modal">
          <div className="receipt-header">
            <img
              src={require("../assets/images/Exodollarium-01.png")}
              alt="Exdollarium Logo"
              className="company-logo"
            />
            <h2>Exdollarium</h2>
            <p>Official Transaction Receipt</p>
          </div>

          <div className="receipt-content">
            <div className="receipt-row">
              <p className="label">Date:</p>
              <p className="value">
                {new Date(receipt.date).toLocaleDateString()}
              </p>
            </div>
            <div className="receipt-row">
              <p className="label">Time:</p>
              <p className="value">
                {new Date(receipt.date).toLocaleTimeString()}
              </p>
            </div>
            <div className="receipt-row">
              <p className="label">Transaction ID:</p>
              <div className="value">
                <span>{receipt.transactionId}</span>
                <span
                  className="clipboard-icon"
                  onClick={() => handleCopyTransactionId(receipt.transactionId)}
                >
                  📋
                </span>
                {isCopied && copiedText === receipt.transactionId && (
                  <span className="copied-text">Copied!</span>
                )}
              </div>
            </div>
            <div className="receipt-row">
              <p className="label">Amount:</p>
              <p className="value">
                {receipt.amount} {receipt.currency || "NGN"}
              </p>
            </div>
            <div className="receipt-row">
              <p className="label">Status:</p>
              <p className="value">{receipt.status}</p>
            </div>
            <div className="receipt-row">
              <p className="label">Type:</p>
              <p className="value">{receipt.type}</p>
            </div>
            {receipt.type === "withdrawal" && (
              <div className="receipt-row">
                <p className="label">Bank ID:</p>
                <p className="value">{receipt.bankId || "Not Available"}</p>
              </div>
            )}
            {receipt.currency && receipt.ngnAmount && (
              <div className="receipt-row">
                <p className="label">Converted NGN Amount:</p>
                <p className="value">{receipt.ngnAmount}</p>
              </div>
            )}
          </div>

          <div className="receipt-footer">
            <p>Thank you for choosing Exdollarium!</p>
            <div className="receipt">
            <button className="share-receipt" onClick={handleShareReceipt}>
              Share Receipt
            </button>
            <button
              className="close-receipt"
              onClick={() => setReceipt(null)}
            >
              Close
            </button>
          </div>
            </div>
            
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
