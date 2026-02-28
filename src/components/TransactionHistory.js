import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaReceipt, FaFilter, FaTimesCircle, FaDownload, FaRegCopy, FaCheckCircle, FaArrowUp, FaArrowDown, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";
import Spinner from "./Spinner";
import html2canvas from "html2canvas";
import Alert from "./Alert";
import ResponsiveLogo from './ResponsiveLogo';

/* 鈹€鈹€鈹€ Design tokens 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
  greenFaint: 'rgba(52,211,153,0.12)', redFaint: 'rgba(248,113,113,0.12)',
  amberFaint: 'rgba(251,191,36,0.1)',
};

const card = {
  background: 'rgba(15,23,42,0.88)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: `1px solid ${G.goldBorder}`,
  borderRadius: 16,
};

const selectStyle = {
  background: G.navy3,
  border: `1px solid ${G.goldBorder}`,
  borderRadius: 8,
  color: G.white,
  padding: '9px 14px',
  fontSize: '0.85rem',
  outline: 'none',
  cursor: 'pointer',
};

const inputStyle = {
  background: G.navy3,
  border: `1px solid ${G.goldBorder}`,
  borderRadius: 8,
  color: G.white,
  padding: '9px 14px',
  fontSize: '0.85rem',
  outline: 'none',
};

const getTypeIcon = (displayType = '') => {
  const t = displayType.toLowerCase();
  if (t.includes('sent')) return <FaArrowUp style={{ color: G.red }} />;
  if (t.includes('received')) return <FaArrowDown style={{ color: G.green }} />;
  if (t.includes('transfer')) return <FaExchangeAlt style={{ color: G.goldLight }} />;
  return <FaMoneyBillWave style={{ color: G.slate }} />;
};

const StatusPill = ({ status }) => {
  const s = (status || '').toLowerCase();
  const map = {
    completed: { bg: G.greenFaint, color: G.green },
    approved: { bg: G.greenFaint, color: G.green },
    pending: { bg: G.amberFaint, color: G.goldLight },
    rejected: { bg: G.redFaint, color: G.red },
    failed: { bg: G.redFaint, color: G.red },
  };
  const style = map[s] || { bg: 'rgba(148,163,184,0.1)', color: G.slate };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>{status}</span>
  );
};

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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const token =
          localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

        const [txnRes, userRes] = await Promise.all([
          axios.get(`${apiUrl}/api/transaction/transaction-history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const userId = userRes.data._id?.toString?.();
        setCurrentUserId(userId);

        const mapped = (txnRes.data.transactions || []).map((t) => {
          const senderIdStr =
            typeof t.senderId === "object"
              ? t.senderId._id?.toString()
              : t.senderId?.toString();

          const isSender = senderIdStr === userId;
          const counterparty = isSender ? t.recipientId : t.senderId;
          const payId =
            counterparty?.payId || counterparty?.username || "Unknown";

          return {
            ...t,
            displayType:
              t.type?.toLowerCase() === "transfer"
                ? isSender
                  ? "Sent Transfer"
                  : "Received Transfer"
                : t.type,
            displayLabel: isSender ? "To" : "From",
            counterparty: payId,
            displayAmount: (() => {
              const base =
                typeof t.amount === "number"
                  ? t.amount
                  : typeof t.ngnAmount === "number"
                    ? t.ngnAmount
                    : 0;
              // For withdrawals, add fee so the list shows the total amount deducted
              const isWithdrawal = t.type?.toLowerCase() === 'withdrawal';
              const fee = isWithdrawal
                ? Number(t.fee ?? t.fees ?? t.withdrawalFee ?? t.feeAmount ?? t.charge ?? 0)
                : 0;
              return base + fee;
            })(),
          };
        });

        setTransactions(mapped);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        const msg = error?.response?.data?.message || error?.message || 'Failed to fetch transactions. Please try again later.';
        setAlertMessage(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [apiUrl]);

  useEffect(() => {
    let filtered = transactions;
    if (statusFilter) filtered = filtered.filter(t => t.status.toLowerCase() === statusFilter.toLowerCase());
    if (amountFilter) filtered = filtered.filter(t => t.amount === Number(amountFilter));
    if (filterType) filtered = filtered.filter(t => t.type.toLowerCase() === filterType.toLowerCase());
    if (filterDate) filtered = filtered.filter(t => new Date(t.date).toLocaleDateString() === filterDate);
    setFilteredTransactions(filtered);
  }, [statusFilter, amountFilter, filterType, filterDate, transactions]);

  const fetchReceipt = async (id) => {
    setLoadingReceipt(true);
    try {
      const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
      const response = await axios.get(
        `${apiUrl}/api/transaction/transaction-history/receipt/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReceipt(response.data);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to fetch receipt. Please try again.';
      setAlertMessage(msg);
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

  const handleShareAsImage = async () => {
    const receiptElement = document.getElementById("receipt-content");
    const buttonsToHide = document.querySelectorAll(".hide-on-share");
    if (!receiptElement) { setAlertMessage("Receipt content not found."); return; }
    buttonsToHide.forEach(b => (b.style.display = "none"));
    try {
      receiptElement.style.maxHeight = "none";
      receiptElement.style.overflow = "visible";
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(receiptElement, { scale: 2, useCORS: true, windowHeight: receiptElement.scrollHeight });
      buttonsToHide.forEach(b => (b.style.display = ""));
      const image = canvas.toDataURL("image/png");
      downloadImage(image);
      setAlertMessage("Receipt downloaded successfully.");
      if (navigator.canShare) {
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], "receipt.png", { type: "image/png" });
        await navigator.share({ files: [file], title: "Transaction Receipt", text: "Here is your transaction receipt." });
        setAlertMessage("Receipt shared successfully.");
      }
    } catch (error) {
      console.error("Error capturing receipt:", error);
      setAlertMessage("An error occurred while processing the receipt.");
    }
  };

  const downloadImage = (imageData) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = "receipt.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onClose = () => setReceipt(null);

  const formatCurrency = (amt, curr) => {
    if (amt == null) return '';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: curr || receipt?.currency || 'NGN' }).format(Number(amt));
    } catch (e) { return String(amt); }
  };

  const getFee = () => {
    if (!receipt) return null;
    // fee comes directly from the receipt object (added to backend response)
    const fee = receipt.fee ?? receipt.fees ?? receipt.charge ?? receipt.withdrawalFee ?? receipt.feeAmount ?? null;
    if (fee != null && Number(fee) > 0) return Number(fee);
    return null;
  };

  const getAccountDisplay = () => {
    if (!receipt) return '';
    // bank is a populated object returned from backend as receipt.bank
    const bank = receipt.bank;
    if (bank) {
      const name = bank.accountName || '';
      const num = bank.accountNumber || '';
      const bankName = bank.bankName || '';
      const parts = [name, num].filter(Boolean).join(' - ');
      return bankName ? `${parts}${parts ? ' · ' : ''}${bankName}` : parts;
    }
    // fallbacks for flat fields
    if (receipt.account) return receipt.account;
    if (receipt.accountName || receipt.accountNumber)
      return `${receipt.accountName || ''}${receipt.accountName && receipt.accountNumber ? ' - ' : ''}${receipt.accountNumber || ''}`.trim();
    if (receipt.toAccount) return receipt.toAccount;
    if (receipt.recipientAccount) return receipt.recipientAccount;
    return '';
  };

  const hasActiveFilters = statusFilter || amountFilter || filterType || filterDate;

  const clearFilters = () => {
    setStatusFilter(''); setAmountFilter(''); setFilterType(''); setFilterDate('');
  };

  return (
    <div style={{ minHeight: '100vh', background: G.navy, padding: isMobile ? '18px 12px' : '28px 20px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 700, color: G.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Transaction History</h2>
          <p style={{ margin: '4px 0 0', color: G.slate, fontSize: '0.82rem' }}>All your past transactions</p>
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            background: showFilters ? G.goldFaint : 'transparent',
            border: `1px solid ${showFilters ? G.gold : G.goldBorder}`,
            color: showFilters ? G.gold : G.slate,
            borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
          }}
        >
          <FaFilter size={12} />
          {!isMobile && 'Filters'}
          {hasActiveFilters && (
            <span style={{
              background: G.gold, color: G.navy, borderRadius: '50%',
              width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.62rem', fontWeight: 700,
            }}>!</span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{ ...card, padding: isMobile ? '14px' : '20px 24px', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.68rem', color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</label>
              <select style={{ ...selectStyle, width: '100%' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.68rem', color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount</label>
              <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} type="number" placeholder="Amount" value={amountFilter} onChange={e => setAmountFilter(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.68rem', color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
              <select style={{ ...selectStyle, width: '100%' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">All</option>
                <option value="Withdrawal">Withdrawal</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.68rem', color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</label>
              <input style={{ ...inputStyle, colorScheme: 'dark', width: '100%', boxSizing: 'border-box' }} type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{
              marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
              background: G.redFaint, border: `1px solid ${G.red}`,
              color: G.red, borderRadius: 8, padding: '7px 13px',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
            }}>
              <FaTimesCircle size={12} /> Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spinner /></div>}

      {/* Alert */}
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}

      {/* Empty */}
      {!loading && filteredTransactions.length === 0 && (
        <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
          <FaReceipt size={36} style={{ color: G.slateD, marginBottom: 12 }} />
          <p style={{ color: G.slate, margin: 0, fontSize: '0.95rem' }}>No transactions found.</p>
          <p style={{ color: G.slateD, margin: '4px 0 0', fontSize: '0.82rem' }}>Start trading or check back later!</p>
        </div>
      )}

      {/* Transaction Cards */}
      {!loading && filteredTransactions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction._id}
              style={{ ...card, padding: isMobile ? '12px 14px' : '14px 18px' }}
            >
              {/* Top row: icon + type/status + amount */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: G.navy4, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                }}>
                  {getTypeIcon(transaction.displayType)}
                </div>

                {/* Type + Status */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span style={{ color: G.white, fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                      {transaction.displayType}
                    </span>
                    <StatusPill status={transaction.status} />
                  </div>
                  <div style={{ color: G.slateD, fontSize: '0.75rem', marginTop: 3 }}>
                    {new Date(transaction.date).toLocaleDateString()}
                    {transaction.type?.toLowerCase() === 'transfer' && (
                      <span style={{ marginLeft: 8 }}>
                        {transaction.displayLabel}: <span style={{ color: G.slate }}>{transaction.counterparty}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount — always right-aligned */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    color: transaction.displayType?.toLowerCase().includes('received') ? G.green : G.white,
                    whiteSpace: 'nowrap',
                  }}>
                    {transaction.displayType?.toLowerCase().includes('received') ? '+' : ''}
                    &#8358;{transaction.displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Receipt button — full width on mobile, inline on desktop */}
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => fetchReceipt(transaction._id)}
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
                    color: G.gold, borderRadius: 8,
                    padding: isMobile ? '8px 0' : '6px 13px',
                    cursor: 'pointer', fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontWeight: 600,
                  }}
                >
                  <FaReceipt size={12} /> View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loadingReceipt && <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spinner /></div>}

      {/* Receipt Modal */}
      {receipt && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: isMobile ? 12 : 20,
        }}>
          <div
            id="receipt-content"
            style={{
              background: G.navy2,
              border: `1px solid ${G.goldBorder}`,
              borderRadius: 20,
              width: '100%', maxWidth: 460,
              maxHeight: '92vh', overflowY: 'auto',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Receipt header */}
            <div style={{
              background: `linear-gradient(135deg, ${G.navy4}, ${G.navy3})`,
              borderBottom: `1px solid ${G.goldBorder}`,
              padding: isMobile ? '18px 20px' : '24px 28px',
              textAlign: 'center', borderRadius: '20px 20px 0 0',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <ResponsiveLogo alt="Exdollarium" style={{ height: 36, objectFit: 'contain' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: G.white }}>Exdollarium</h2>
              <p style={{ margin: '4px 0 0', color: G.slate, fontSize: '0.78rem' }}>Official Transaction Receipt</p>
            </div>

            {/* Receipt rows */}
            <div style={{ padding: isMobile ? '14px 16px' : '20px 28px' }}>
              {[
                { label: 'Date', value: new Date(receipt.date).toLocaleDateString() },
                { label: 'Time', value: new Date(receipt.date).toLocaleTimeString() },
                { label: 'Status', value: <StatusPill status={receipt.status} /> },
                { label: 'Type', value: receipt.type },
                {
                  label: 'Amount', value: (
                    <span style={{ color: G.goldLight, fontWeight: 700 }}>
                      {typeof receipt.amount === 'number'
                        ? receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : 'N/A'} {receipt.currency || 'NGN'}
                    </span>
                  )
                },
                {
                  label: 'Txn ID',
                  value: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: G.slate, maxWidth: isMobile ? 140 : 200 }}>{receipt.transactionId}</span>
                      <button
                        onClick={() => handleCopyTransactionId(receipt.transactionId)}
                        className="hide-on-share"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.gold, padding: 0, flexShrink: 0 }}
                      >
                        {isCopied && copiedText === receipt.transactionId
                          ? <FaCheckCircle size={13} style={{ color: G.green }} />
                          : <FaRegCopy size={13} />}
                      </button>
                    </span>
                  )
                },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 0', borderBottom: `1px solid rgba(245,166,35,0.08)`,
                  gap: 8,
                }}>
                  <span style={{ color: G.slateD, fontSize: '0.8rem', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                  <span style={{ color: G.white, fontSize: '0.82rem', textAlign: 'right' }}>{value}</span>
                </div>
              ))}

              {/* Withdrawal-specific rows */}
              {receipt.type === 'withdrawal' && (
                <>
                  {getAccountDisplay() && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid rgba(245,166,35,0.08)`, gap: 8 }}>
                      <span style={{ color: G.slateD, fontSize: '0.8rem', flexShrink: 0 }}>Account</span>
                      <span style={{ color: G.white, fontSize: '0.82rem', textAlign: 'right' }}>{getAccountDisplay()}</span>
                    </div>
                  )}
                  {getFee() != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid rgba(245,166,35,0.08)`, gap: 8 }}>
                      <span style={{ color: G.slateD, fontSize: '0.8rem', flexShrink: 0 }}>Fee</span>
                      <span style={{ color: G.white, fontSize: '0.82rem' }}>{formatCurrency(getFee(), receipt.currency || 'NGN')}</span>
                    </div>
                  )}
                  {/* Total deducted row */}
                  {getFee() != null && typeof receipt.amount === 'number' && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', padding: '10px 4px',
                      borderBottom: `1px solid rgba(245,166,35,0.08)`, gap: 8,
                      background: 'rgba(245,166,35,0.05)', margin: '0 -4px',
                      borderRadius: 6,
                    }}>
                      <span style={{ color: G.gold, fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>Total Deducted</span>
                      <span style={{ color: G.gold, fontSize: '0.88rem', fontWeight: 800 }}>
                        {formatCurrency(receipt.amount + Number(getFee()), receipt.currency || 'NGN')}
                      </span>
                    </div>
                  )}
                  {receipt.adminReceipts && receipt.adminReceipts.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid rgba(245,166,35,0.08)`, gap: 8 }}>
                      <span style={{ color: G.slateD, fontSize: '0.8rem', flexShrink: 0 }}>Receipt File</span>
                      <a href={`${apiUrl.replace(/\/$/, '')}${receipt.adminReceipts[0]}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: G.gold, fontSize: '0.82rem' }}>Download</a>
                    </div>
                  )}
                </>
              )}

              {/* Transfer sender/receiver */}
              {receipt.type?.toLowerCase() === 'transfer' && currentUserId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid rgba(245,166,35,0.08)`, gap: 8 }}>
                  {receipt.senderId?._id?.toString?.() === currentUserId ? (
                    <>
                      <span style={{ color: G.slateD, fontSize: '0.8rem', flexShrink: 0 }}>Receiver</span>
                      <span style={{ color: G.white, fontSize: '0.82rem' }}>
                        {receipt.recipientId?.payId || receipt.recipientId?.username || receipt.recipientId?._id?.toString?.() || 'Unknown'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: G.slateD, fontSize: '0.8rem', flexShrink: 0 }}>Sender</span>
                      <span style={{ color: G.white, fontSize: '0.82rem' }}>
                        {receipt.senderId?.payId || receipt.senderId?.username || receipt.senderId?._id?.toString?.() || 'Unknown'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              borderTop: `1px solid ${G.goldBorder}`,
              padding: isMobile ? '14px 16px 18px' : '16px 28px 22px',
              textAlign: 'center',
            }}>
              <p style={{ color: G.slateD, fontSize: '0.75rem', marginBottom: 14 }}>
                Thank you for choosing <span style={{ color: G.gold }}>Exdollarium</span>.
              </p>
              <div className="hide-on-share" style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleShareAsImage}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
                    color: G.navy, border: 'none', borderRadius: 10,
                    padding: '10px 0', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  <FaDownload size={13} /> Download
                </button>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, background: 'transparent',
                    border: `1px solid ${G.goldBorder}`,
                    color: G.slate, borderRadius: 10,
                    padding: '10px 0', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
