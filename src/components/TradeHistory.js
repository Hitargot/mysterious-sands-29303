import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardCopy, FileText } from "lucide-react";
import Button from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/Card";
import Alert from "./Alert";
import ReceiptModal from "./ReceiptModal";
import "../styles/TradeHistory.css";

const TradeHistory = () => {
  const [confirmations, setConfirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";

  useEffect(() => {
    const fetchConfirmations = async () => {
      try {
        const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
        const response = await axios.get(`${apiUrl}/api/confirmations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedConfirmations = response.data.confirmations.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setConfirmations(sortedConfirmations || []);
      } catch (err) {
        setError("Failed to load trade history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchConfirmations();
  }, [apiUrl]);

  const copyToClipboard = (txid) => {
    if (!txid) return;
    navigator.clipboard.writeText(txid);
    setAlertMessage("Transaction ID copied to clipboard!");
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleViewReceipt = (confirmation) => {
    const receiptData = {
      title: "Transaction Receipt",
      fields: [
        { label: "Service", value: confirmation.serviceId?.name || "N/A" },
        { label: "Transaction ID", value: confirmation.transactionId || "N/A", copyable: true },
        { label: "Date", value: new Date(confirmation.createdAt).toLocaleString() || "N/A" },
        { label: "Status", value: confirmation.status || "N/A" },
        { label: "Note", value: confirmation.note || "No additional notes." },
        {
          label: "Receipt File",
          value: confirmation.fileUrl ?
            <a href={confirmation.fileUrl} target="_blank" rel="noopener noreferrer">
              Download Receipt
            </a> : "No receipt available"
        },
      ],
    };

    // ✅ Show "Amount in Naira" if status is "Funded"
    if (confirmation.status === "Funded") {
      receiptData.fields.push({
        label: "Amount in Naira",
        value: confirmation.amountInNaira ? `₦${confirmation.amountInNaira.toLocaleString()}` : "N/A",
      });
    }


    if (confirmation.status === "Rejected") {
      receiptData.fields.push({
        label: "Rejection Reason",
        value: confirmation.rejectionReason || "No reason provided"
      });
    }

    setSelectedReceipt(receiptData);
  };

  const handleCloseReceipt = () => {
    setSelectedReceipt(null);
  };

  const filteredConfirmations = confirmations.filter(
    (confirmation) =>
      (confirmation.serviceId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        confirmation.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter ? confirmation.status === statusFilter : true)
  );

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (error) return <div className="error-container"><p>{error}</p></div>;

  return (
    <div className="transaction-history">
      <div className="search-bar-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
          placeholder="Search by Service Name or Transaction ID"
        />
        <select value={statusFilter} onChange={handleStatusFilter} className="filter-dropdown">
          <option value="">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}

      <h2 className="section-title">Transaction History</h2>
      <div className="transaction-cards">
        {filteredConfirmations.length > 0 ? (
          filteredConfirmations.map((confirmation) => (
            <Card key={confirmation._id} className="card">
              <CardHeader className="card-header">
                <div className="service-status-container">
                  <h3 className="card-title">{confirmation.serviceId?.name || "Unknown Service"}</h3>
                  <span className={`status-badge ${confirmation.status === "Success" ? "success" : "error"}`}>{confirmation.status || "N/A"}</span>
                </div>
                <p className="date"><strong>Date:</strong> {new Date(confirmation.createdAt).toLocaleString() || "N/A"}</p>
              </CardHeader>

              <CardContent className="card-content">
                <p className="transaction-id">
                  <strong>Transaction ID:</strong> {confirmation.transactionId || "N/A"} {" "}
                  {confirmation.transactionId && <ClipboardCopy className="clipboard-icon" onClick={() => copyToClipboard(confirmation.transactionId)} />}
                </p>
              </CardContent>

              <CardFooter className="card-footer">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!confirmation.fileUrl}
                  onClick={() => handleViewReceipt(confirmation)}
                >
                  <FileText className="mr-2" />
                  {confirmation.fileUrl ? "View Receipt" : "No Receipt Available"}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="no-history">No trade history found.</p>
        )}
      </div>

      {selectedReceipt && <ReceiptModal receiptData={selectedReceipt} onClose={handleCloseReceipt} />}
    </div>
  );
};

export default TradeHistory;
