import React, { useState } from "react";
import axios from "axios";

const AccountStatementExport = () => {
    const [format, setFormat] = useState("pdf");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    //const apiUrl = "http://localhost:22222";
    const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";


    const handleDownload = async () => {
        if (!showOptions) {
            setShowOptions(true);
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
            const response = await axios.get(`${apiUrl}/api/export`, {
                params: { format, startDate, endDate },
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
            });

            const fileType = format === "pdf" ? "application/pdf" : "text/csv";
            const fileExtension = format === "pdf" ? "pdf" : "csv";

            const blob = new Blob([response.data], { type: fileType });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `account_statement.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Error downloading file. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div
            style={{
                padding: "20px",
                maxWidth: "400px",
                margin: "auto",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
                position: "relative",
            }}
        >
            <h2>Export Account Statement</h2>

            {/* Close button (Only shows when options are visible) */}
            {showOptions && (
                <button
                    onClick={() => setShowOptions(false)}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                    }}
                >
                    ❌
                </button>
            )}

            {/* Download Button (always visible) */}
            <button
                onClick={handleDownload}
                disabled={loading}
                style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    marginBottom: showOptions ? "10px" : "0",
                }}
            >
                {loading ? "Downloading..." : showOptions ? "Confirm Download" : "Download Statement"}
            </button>

            {/* Options (Initially hidden) */}
            {showOptions && (
                <div>
                    <label>Format</label>
                    <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }}
                    >
                        <option value="pdf">PDF</option>
                        <option value="csv">CSV</option>
                    </select>

                    <label>Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }}
                    />

                    <label>End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }}
                    />
                </div>
            )}
        </div>
    );
};

export default AccountStatementExport;
