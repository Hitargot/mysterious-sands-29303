import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardCopy, FileText, X } from "lucide-react";
import Button from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/Card";
import Alert from "./Alert";
import Modal from "../components/ui/Modal";
import "../styles/TradeHistory.css";

const TradeHistory = () => {
  const [confirmations, setConfirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

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

  const handleViewReceipt = (confirmation) => {
    setSelectedReceipt(confirmation);
  };

  const handleCloseReceipt = () => {
    setSelectedReceipt(null);
  };

  const filteredConfirmations = confirmations.filter(
    (confirmation) =>
      confirmation.serviceId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      confirmation.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    const options = {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric", hour12: true,
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

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
                <p className="date"><strong>Date:</strong> {formatDate(confirmation.createdAt) || "N/A"}</p>
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

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal onClose={handleCloseReceipt}>
          <div className="receipt-modal">
            <div className="modal-header">
              <h3>Transaction Receipt</h3>
              <X className="close-icon" onClick={handleCloseReceipt} />
            </div>
            <div className="modal-content">
              <p><strong>Service:</strong> {selectedReceipt.serviceId?.name || "N/A"}</p>
              <p><strong>Transaction ID:</strong> {selectedReceipt.transactionId || "N/A"}</p>
              <p><strong>Date:</strong> {formatDate(selectedReceipt.createdAt) || "N/A"}</p>
              {selectedReceipt.fileUrl && (
                <Button variant="default" onClick={() => window.open(selectedReceipt.fileUrl, "_blank")}>Download Receipt</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TradeHistory;
