import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardCopy, FileText } from "lucide-react";
import Button from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/Card";
import Alert from "./Alert";
import ReceiptModal from "./ReceiptModal";
import "../styles/TradeHistory.css";
import AccountStatementExport from "./DownloadStatement ";


const TradeHistory = () => {
  const [timers, setTimers] = useState({});
  const [confirmations, setConfirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [noData, setNoData] = useState(false);

  // const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  const apiUrl = "http://localhost:22222";

  useEffect(() => {
    const fetchConfirmations = async () => {
      const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
      console.log("Token used for fetchConfirmations:", token);

      if (!token) {
        setError("You must be logged in to view trade history.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/api/confirmations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedConfirmations = response.data.confirmations.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        if (sortedConfirmations.length === 0) {
          setNoData(true);
          setConfirmations([]); // or leave empty, depending on the case
        } else {
          setConfirmations(sortedConfirmations);
          setNoData(false);
        }


      } catch (err) {
        console.error("Error fetching confirmations:", err);
        setError("Failed to load trade history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmations();
  }, [apiUrl]);

  // Filtered Confirmations (should be placed before using it in useEffect)
  const filteredConfirmations = confirmations.filter(
    (confirmation) =>
      (confirmation.serviceId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        confirmation.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter ? confirmation.status.toLowerCase().includes(statusFilter.toLowerCase()) : true)
  );

  // ✅ Initialize countdown timers only when confirmations change
  useEffect(() => {
    setTimers((prevTimers) => {
      const newTimers = { ...prevTimers };

      confirmations.forEach((confirmation) => {
        if (confirmation.status === "Pending" && !newTimers[confirmation._id]) {
          const createdTime = new Date(confirmation.createdAt).getTime();
          const currentTime = new Date().getTime();
          const elapsedTime = Math.floor((currentTime - createdTime) / 1000); // Elapsed time in seconds
          const remainingTime = 1800 - elapsedTime; // 30 min countdown

          newTimers[confirmation._id] = remainingTime > 0 ? remainingTime : 0; // Ensure it doesn't go negative
        }
      });

      return newTimers;
    });
  }, [confirmations]);



  // ✅ Effect to decrement timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = {};
        Object.keys(prevTimers).forEach((id) => {
          if (prevTimers[id] > 0) {
            updatedTimers[id] = prevTimers[id] - 1;
          }
        });
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []); // ✅ Removed `timers` to prevent unwanted resets

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);
  

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
        { label: "Service Tag", value: confirmation.serviceTag || "N/A" },
        { label: "Transaction ID", value: confirmation.transactionId || "N/A", copyable: true },
        { label: "Date", value: new Date(confirmation.createdAt).toLocaleString() || "N/A" },
        { label: "Status", value: confirmation.status || "N/A" },
        { label: "Note", value: confirmation.note || "No additional notes." },
        {
          label: "Receipt File",
          value: confirmation.fileUrls ?
            <a href={confirmation.fileUrls} target="_blank" rel="noopener noreferrer">
              Download Receipt
            </a> : "No receipt available"
        },
      ],
    };

    // ✅ Show "Amount in Naira" and "Amount in Selected Currency" if status is "Funded"
    if (confirmation.status === "Funded") {
      console.log("Transaction funded:");
      console.log("Amount in Foreign Currency:", confirmation.amountInForeignCurrency);
      console.log("Amount in Naira:", confirmation.amountInNaira);

      receiptData.fields.push(
        {
          label: `Amount in ${confirmation.selectedCurrency.toUpperCase()}`,
          value: confirmation.amountInForeignCurrency
            ? `${confirmation.amountInForeignCurrency.toLocaleString()} ${confirmation.selectedCurrency.toUpperCase()}`
            : "N/A",
        },
        {
          label: "Amount in Naira",
          value: confirmation.amountInNaira
            ? `₦${confirmation.amountInNaira.toLocaleString()}`
            : "N/A",
        }
      );

      // Add the exchange rate (exchangeRateUsed) if available
      if (confirmation.exchangeRateUsed) {
        console.log("Exchange Rate Used:", confirmation.exchangeRateUsed);
        receiptData.fields.push({
          label: "Exchange Rate",
          value: `₦${confirmation.exchangeRateUsed.toLocaleString()} per ${confirmation.selectedCurrency?.toUpperCase() || 'unit'}`,
        });
      }
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


  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

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
          <option value="Funded">Funded</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}

      <h2 className="section-title">Transaction History</h2>

      {/* Mount AccountStatementExport Here */}
      <AccountStatementExport transactions={filteredConfirmations} />

      <div className="transaction-cards">
        {noData ? (
          <p className="no-history">No trade history found.</p>
        ) : filteredConfirmations.length > 0 ? (
          filteredConfirmations.map((confirmation) => {
            const timeLeft = timers[confirmation._id] || 0;
            const showDispute = confirmation.status === "Pending" && timeLeft === 0;

            return (
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
                    <strong>Transaction ID:</strong> {confirmation.transactionId || "N/A"}{" "}
                    {confirmation.transactionId && (
                      <ClipboardCopy className="clipboard-icon" onClick={() => copyToClipboard(confirmation.transactionId)} />
                    )}
                  </p>
                  {confirmation.status === "Pending" && timers[confirmation._id] > 0 && (
                    <p className="countdown"><strong>Time Remaining:</strong> {Math.floor(timers[confirmation._id] / 60)} min {timers[confirmation._id] % 60} sec</p>
                  )}
                </CardContent>

                <CardFooter className="card-footer">
                  <Button className="card-button" variant="outline" size="sm" disabled={!confirmation.fileUrls} onClick={() => handleViewReceipt(confirmation)}>
                    <FileText className="mr-2" />
                    {confirmation.fileUrls ? "View Receipt" : "No Receipt Available"}
                  </Button>
                  {showDispute && (
                    <Button className="dispute-button" variant="destructive" size="sm" onClick={() => {
                      const phoneNumber = "+2348139935240";
                      const message = encodeURIComponent(`Hello, I have a dispute regarding my transaction.\n\nTransaction ID: ${confirmation.transactionId}`);
                      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
                    }}>
                      Dispute on WhatsApp
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <p className="no-history">No history results found.</p>
        )}

      </div>
      {selectedReceipt && <ReceiptModal receiptData={selectedReceipt} onClose={handleCloseReceipt} />}
    </div>
  );
};

export default TradeHistory;
