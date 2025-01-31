import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardCopy, FileText } from "lucide-react";
import Button from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/Card"; // ShadCN Card
import Alert from "./Alert"; // Assuming you have an Alert component
import '../styles/TradeHistory.css';

const TradeHistory = () => {
  const [confirmations, setConfirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // For search bar
  const [alertMessage, setAlertMessage] = useState(""); // For custom alert
//   const apiUrl = "http://localhost:22222"; // Replace with your API URL
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

  useEffect(() => {
    const fetchConfirmations = async () => {
      try {
        const token =
          localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
        const response = await axios.get(`${apiUrl}/api/confirmations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setConfirmations(response.data.confirmations || []);
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
    setAlertMessage("Transaction ID copied to clipboard!"); // Show custom alert
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter confirmations based on search query
  const filteredConfirmations = confirmations.filter(
    (confirmation) =>
      confirmation.serviceId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      confirmation.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadReceipt = (fileUrl) => {
    if (!fileUrl) {
      setAlertMessage("Receipt URL is missing or invalid.");
      return;
    }
    window.open(fileUrl, "_blank");
  };

  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
          placeholder="Search by Service Name or Transaction ID"
        />
      </div>

      {/* Custom Alert */}
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}

      <h2 className="section-title">Transaction History</h2>
      <div className="transaction-cards">
        {filteredConfirmations.length > 0 ? (
          filteredConfirmations.map((confirmation) => (
            <Card key={confirmation._id} className="card">
              <CardHeader className="card-header">
                <div className="service-status-container">
                  <h3 className="card-title">
                    {confirmation.serviceId?.name || "Unknown Service"}
                  </h3>
                  <span className={`status-badge ${confirmation.status === "Success" ? "success" : "error"}`}>
                    {confirmation.status || "N/A"}
                  </span>
                </div>
                <p className="date">
                  <strong>Date:</strong> {formatDate(confirmation.createdAt) || "N/A"}
                </p>
              </CardHeader>

              <CardContent className="card-content">
                <p className="transaction-id">
                  <strong>Transaction ID:</strong>{" "}
                  <span className="flex items-center">
                    {confirmation.transactionId || "N/A"}{" "}
                    {confirmation.transactionId && (
                      <ClipboardCopy
                        className="clipboard-icon"
                        onClick={() => copyToClipboard(confirmation.transactionId)}
                      />
                    )}
                  </span>
                </p>
              </CardContent>
              <CardFooter className="card-footer">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!confirmation.fileUrl}
                  onClick={() => handleDownloadReceipt(confirmation.fileUrl)} // Handle the download receipt
                >
                  <FileText className="mr-2" />
                  {confirmation.fileUrl ? "Download Receipt" : "No Receipt Available"}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="no-history">No trade history found.</p>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
