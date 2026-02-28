import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegCopy, FaCheckCircle, FaFileAlt, FaSearch, FaFilter, FaTimesCircle, FaWhatsapp, FaClock, FaChartBar, FaFileDownload } from "react-icons/fa";
import Alert from "./Alert";
import ReceiptModal from "./ReceiptModal";

/* 鈹€鈹€鈹€ Design tokens 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
  greenFaint: 'rgba(52,211,153,0.12)', redFaint: 'rgba(248,113,113,0.12)',
  amberFaint: 'rgba(251,191,36,0.1)',
};

const StatusPill = ({ status }) => {
  const s = (status || '').toLowerCase();
  const map = {
    funded: { bg: G.greenFaint, color: G.green },
    approved: { bg: G.greenFaint, color: G.green },
    success: { bg: G.greenFaint, color: G.green },
    pending: { bg: G.amberFaint, color: G.goldLight },
    rejected: { bg: G.redFaint, color: G.red },
    failed: { bg: G.redFaint, color: G.red },
  };
  const style = map[s] || { bg: 'rgba(148,163,184,0.1)', color: G.slate };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>{status}</span>
  );
};

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
  const [copiedId, setCopiedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleExportStatement = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
      const res = await axios.get(`${apiUrl}/api/export`, {
        params: { format: 'pdf' },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'account_statement.pdf';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setAlertMessage("Statement downloaded successfully.");
    } catch (err) {
      console.error("Export failed:", err);
      setAlertMessage("Failed to download statement. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchConfirmations = async () => {
      const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
      if (!token) {
        setError("You must be logged in to view trade history.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${apiUrl}/api/confirmations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sorted = response.data.confirmations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sorted.length === 0) {
          setNoData(true);
          setConfirmations([]);
        } else {
          setConfirmations(sorted);
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

  const filteredConfirmations = confirmations.filter(
    (c) =>
      (c.serviceId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter ? c.status.toLowerCase().includes(statusFilter.toLowerCase()) : true)
  );

  useEffect(() => {
    setTimers((prev) => {
      const next = { ...prev };
      confirmations.forEach((c) => {
        if (c.status === "Pending" && !next[c._id]) {
          const elapsed = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 1000);
          const remaining = 1800 - elapsed;
          next[c._id] = remaining > 0 ? remaining : 0;
        }
      });
      return next;
    });
  }, [confirmations]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = {};
        Object.keys(prev).forEach((id) => { if (prev[id] > 0) next[id] = prev[id] - 1; });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const copyToClipboard = (txid) => {
    if (!txid) return;
    navigator.clipboard.writeText(txid);
    setCopiedId(txid);
    setAlertMessage("Transaction ID copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewReceipt = (confirmation) => {
    const receiptData = {
      title: "Transaction Receipt",
      fields: [
        { label: "Service", value: confirmation.serviceId?.name || "N/A" },
        { label: "Service Tag", value: confirmation.serviceTag || "N/A" },
        { label: "Transaction ID", value: confirmation.transactionId || "N/A", copyable: true },
        { label: "Date", value: new Date(confirmation.createdAt).toLocaleString() },
        { label: "Status", value: confirmation.status || "N/A" },
        { label: "Note", value: confirmation.note || "No additional notes." },
        {
          label: "Receipt File",
          value: confirmation.fileUrls
            ? <a href={confirmation.fileUrls} target="_blank" rel="noopener noreferrer">Download Receipt</a>
            : "No receipt available",
        },
      ],
    };

    if (confirmation.status === "Funded") {
      const userAmount = confirmation.userAmountInForeignCurrency ?? null;
      const userCurrency = (confirmation.userSelectedCurrency || confirmation.userCurrency || confirmation.selectedCurrency || confirmation.adminSelectedCurrency || "").toUpperCase();
      const adminAmount = confirmation.adminForeignAmount ?? confirmation.amountInForeignCurrency ?? null;
      const adminCurrency = (confirmation.adminSelectedCurrency || confirmation.adminCurrency || confirmation.selectedCurrency || "").toUpperCase();
      const fmt = (val, curr) => {
        if (val == null) return "N/A";
        const n = typeof val === "number" ? val : parseFloat(val);
        return Number.isNaN(n) ? "N/A" : `${n.toLocaleString()} ${curr || ""}`.trim();
      };
      if (userAmount) receiptData.fields.push({ label: `Amount input in ${userCurrency || "selected currency"}`, value: fmt(userAmount, userCurrency) });
      if (adminAmount) receiptData.fields.push({ label: `Amount funded in ${adminCurrency || "selected currency"}`, value: fmt(adminAmount, adminCurrency) });
      receiptData.fields.push({ label: "Amount in Naira", value: confirmation.amountInNaira ? `\u20a6${Number(confirmation.amountInNaira).toLocaleString()}` : "N/A" });
      if (confirmation.exchangeRateUsed) {
        const rateCurrency = adminCurrency || userCurrency || confirmation.selectedCurrency?.toUpperCase() || 'unit';
        receiptData.fields.push({ label: "Exchange Rate", value: `\u20a6${Number(confirmation.exchangeRateUsed).toLocaleString()} per ${rateCurrency}` });
      }
    }

    if (confirmation.status === "Rejected") {
      receiptData.fields.push({ label: "Rejection Reason", value: confirmation.rejectionReason || "No reason provided" });
    }

    setSelectedReceipt(receiptData);
  };

  const handleCloseReceipt = () => setSelectedReceipt(null);

  const formatTimer = (secs) => `${Math.floor(secs / 60)}m ${secs % 60}s`;

  const hasActiveFilters = searchQuery || statusFilter;

  return (
    <div style={{ minHeight: '100vh', background: G.navy, padding: '28px 20px', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: G.white }}>Trade History</h2>
          <p style={{ margin: '4px 0 0', color: G.slate, fontSize: '0.85rem' }}>Your past trades and confirmations</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleExportStatement}
            disabled={exporting}
            title="Export Account Statement"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: `1px solid ${G.goldBorder}`,
              color: exporting ? G.slateD : G.gold,
              borderRadius: 8, padding: '8px 12px', cursor: exporting ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <FaFileDownload size={15} />
          </button>
          <button
            onClick={() => setShowFilters(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: showFilters ? G.goldFaint : 'transparent',
              border: `1px solid ${showFilters ? G.gold : G.goldBorder}`,
              color: showFilters ? G.gold : G.slate,
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
            }}
          >
            <FaFilter size={13} />
            Filters
            {hasActiveFilters && (
              <span style={{
                background: G.gold, color: G.navy, borderRadius: '50%',
                width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700,
              }}>!</span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{
          background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(16px)',
          border: `1px solid ${G.goldBorder}`, borderRadius: 16,
          padding: '20px 24px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            {/* Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: '0.72rem', color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Search</label>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: G.slateD, fontSize: '0.78rem' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Service name or TX ID..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: G.navy3, border: `1px solid ${G.goldBorder}`,
                    borderRadius: 8, color: G.white, padding: '9px 14px 9px 34px',
                    fontSize: '0.85rem', outline: 'none',
                  }}
                />
              </div>
            </div>
            {/* Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.72rem', color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  background: G.navy3, border: `1px solid ${G.goldBorder}`,
                  borderRadius: 8, color: G.white, padding: '9px 14px',
                  fontSize: '0.85rem', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="">All Statuses</option>
                <option value="Funded">Funded</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: G.redFaint, border: `1px solid ${G.red}`,
                  color: G.red, borderRadius: 8, padding: '9px 14px',
                  cursor: 'pointer', fontSize: '0.83rem', fontWeight: 500,
                }}
              >
                <FaTimesCircle size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alerts / Errors */}
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}
      {error && (
        <div style={{
          background: 'rgba(15,23,42,0.88)', border: `1px solid ${G.red}`,
          borderRadius: 12, padding: '14px 18px', marginBottom: 16,
          color: G.red, fontSize: '0.88rem',
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${G.goldBorder}`, borderTopColor: G.gold, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Empty */}
      {!loading && (noData || filteredConfirmations.length === 0) && (
        <div style={{
          background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(16px)',
          border: `1px solid ${G.goldBorder}`, borderRadius: 16,
          padding: '48px 24px', textAlign: 'center',
        }}>
          <FaChartBar size={36} style={{ color: G.slateD, marginBottom: 12 }} />
          <p style={{ color: G.slate, margin: 0, fontSize: '0.95rem' }}>
            {noData ? "No trade history found." : "No results match your search."}
          </p>
          <p style={{ color: G.slateD, margin: '4px 0 0', fontSize: '0.82rem' }}>Start trading or check back later!</p>
        </div>
      )}

      {/* Trade rows — same compact layout as TransactionHistory */}
      {!loading && filteredConfirmations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredConfirmations.map((confirmation) => {
            const timeLeft = timers[confirmation._id] || 0;
            const showDispute = confirmation.status === "Pending" && timeLeft === 0;

            return (
              <div
                key={confirmation._id}
                style={{
                  background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(16px)',
                  border: `1px solid ${G.goldBorder}`, borderRadius: 16,
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: G.navy4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: G.goldLight, fontSize: '1rem',
                }}>
                  <FaChartBar />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: G.white, fontWeight: 600, fontSize: '0.92rem' }}>
                      {confirmation.serviceId?.name || "Unknown Service"}
                    </span>
                    <StatusPill status={confirmation.status} />
                    {confirmation.status === "Pending" && timeLeft > 0 && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: G.amberFaint, color: G.goldLight,
                        borderRadius: 20, padding: '2px 9px',
                        fontSize: '0.7rem', fontWeight: 600,
                      }}>
                        <FaClock size={9} /> {formatTimer(timeLeft)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ color: G.slate, fontSize: '0.8rem' }}>
                      {new Date(confirmation.createdAt).toLocaleDateString()}
                    </span>
                    {confirmation.transactionId && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: G.slateD, fontSize: '0.78rem' }}>
                          {confirmation.transactionId.slice(0, 16)}…
                        </span>
                        <button
                          onClick={() => copyToClipboard(confirmation.transactionId)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.gold, padding: 0 }}
                        >
                          {copiedId === confirmation.transactionId
                            ? <FaCheckCircle size={12} style={{ color: G.green }} />
                            : <FaRegCopy size={12} />}
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right-side actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
                  <button
                    disabled={!confirmation.fileUrls}
                    onClick={() => handleViewReceipt(confirmation)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: confirmation.fileUrls ? G.goldFaint : 'transparent',
                      border: `1px solid ${confirmation.fileUrls ? G.goldBorder : 'rgba(148,163,184,0.15)'}`,
                      color: confirmation.fileUrls ? G.gold : G.slateD,
                      borderRadius: 8, padding: '6px 12px',
                      cursor: confirmation.fileUrls ? 'pointer' : 'not-allowed',
                      fontSize: '0.8rem', fontWeight: 500,
                    }}
                  >
                    <FaFileAlt size={11} />
                    {confirmation.fileUrls ? "Receipt" : "No Receipt"}
                  </button>

                  {showDispute && (
                    <button
                      onClick={() => {
                        const msg = encodeURIComponent(`Hello, I have a dispute regarding my transaction.\n\nTransaction ID: ${confirmation.transactionId}`);
                        window.open(`https://wa.me/+2348139935240?text=${msg}`, "_blank");
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: G.greenFaint, border: `1px solid rgba(52,211,153,0.3)`,
                        color: G.green, borderRadius: 8, padding: '6px 12px',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                      }}
                    >
                      <FaWhatsapp size={12} /> Dispute
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && <ReceiptModal receiptData={selectedReceipt} onClose={handleCloseReceipt} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TradeHistory;
