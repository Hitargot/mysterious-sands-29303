import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Alert from "./Alert";
import { v4 as uuidv4 } from "uuid";
import {
  FaCloudUploadAlt, FaCheckCircle, FaTimes, FaFileAlt,
} from "react-icons/fa";

const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.25)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
  greenFaint: 'rgba(52,211,153,0.12)', redFaint: 'rgba(248,113,113,0.12)',
};

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: `1px solid ${G.goldBorder}`, background: G.navy3,
  color: G.white, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block', color: G.slate, fontSize: 12,
  fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6,
};


const ConfirmationForm = ({ selectedService }) => {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(selectedService || "");
  const [files, setFiles] = useState([]);  // use array to hold multiple files
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [showModal, setShowModal] = useState(false);


  // const [apiUrl] = useState("http://localhost:22222");
  // const [apiUrl] = useState("https://exdollarium-6f0f5aab6a7d.herokuapp.com");

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (selectedServiceId) {
      setTransactionId(generateTransactionId());
    }
  }, [selectedServiceId]);

  const generateTransactionId = () => {
  const timestamp = new Date().getTime();
  const randomPart = uuidv4().split("-")[0];
  return `TRX-${timestamp}-${randomPart}`; // No emoji
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/services`);
        setServices(response.data);
      } catch (error) {
        showAlert("Failed to fetch services.", "error");
      }
    };
    fetchServices();
  }, [apiUrl]);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (token) {
      try {
        return jwtDecode(token).id;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    return null;
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // convert FileList to an array
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedServiceId || !files || !note || !transactionId || !amount || !currency) {
      showAlert("Please fill out all fields (amount and currency are required).", "error");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    const userId = getUserIdFromToken();

    if (!userId) {
      showAlert("User not authenticated.", "error");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    // Remove emoji from transactionId before storing
    const cleanTransactionId = transactionId.replace(/\p{Emoji}/gu, '').replace(/\s+$/g, '');
    formData.append("serviceId", selectedServiceId);
  formData.append("amount", String(amount));
  formData.append("currency", String(currency));
    formData.append("note", note);
    formData.append("userId", userId);
    formData.append("transactionId", cleanTransactionId);

    files.forEach(file => {
      formData.append("files", file); // Append each file individually
    });



    try {
      const response = await axios.post(`${apiUrl}/api/confirmations`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        showAlert("Confirmation submitted successfully!", "success");
        setSelectedServiceId("");
        setFiles([]);
        setNote("");
        setTransactionId("");
        setAmount("");
        setCurrency("USD");
        setShowModal(false);
      } else {
        showAlert("Error submitting confirmation.", "error");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'An error occurred while submitting the confirmation.';
      showAlert(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* ── Open button ── */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
          color: G.navy, fontWeight: 700, fontSize: 15,
          boxShadow: '0 4px 16px rgba(245,166,35,0.32)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          transition: 'opacity 160ms ease',
        }}
      >
        <FaFileAlt /> Open Confirmation Form
      </button>

      {/* ── Modal via portal ── */}
      {showModal && ReactDOM.createPortal(
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: G.navy2, borderRadius: 20,
            border: `1px solid ${G.goldBorder}`,
            width: 'min(480px, 100%)', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 0 50px rgba(245,166,35,0.15)',
            position: 'relative',
          }}>
            {/* Gold top bar */}
            <div style={{
              height: 4, borderRadius: '20px 20px 0 0',
              background: `linear-gradient(90deg,${G.gold},${G.goldLight})`,
            }} />

            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px 12px',
              borderBottom: `1px solid rgba(255,255,255,0.06)`,
            }}>
              <div>
                <div style={{ color: G.gold, fontWeight: 700, fontSize: 17 }}>Submit Confirmation</div>
                <div style={{ color: G.slateD, fontSize: 12, marginTop: 2 }}>Upload your trade receipt for review</div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                style={{
                  border: 'none', background: 'rgba(255,255,255,0.06)',
                  borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
                  color: G.slate, padding: 0, lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FaTimes size={15} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Service */}
              <div>
                <label style={labelStyle}>Service</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  style={{
                    ...inputStyle,
                    appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Amount + Currency row */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
                <div style={{ width: 120 }}>
                  <label style={labelStyle}>Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{
                      ...inputStyle,
                      appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
                    }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              {/* File upload */}
              <div>
                <label style={labelStyle}>Upload Document(s)</label>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 8, padding: '18px',
                  borderRadius: 10, cursor: 'pointer',
                  border: `2px dashed ${G.goldBorder}`,
                  background: files.length > 0 ? G.greenFaint : G.goldFaint,
                  transition: 'background 200ms ease',
                }}>
                  {files.length > 0 ? (
                    <>
                      <FaCheckCircle style={{ fontSize: 24, color: G.green }} />
                      <span style={{ color: G.green, fontWeight: 600, fontSize: 13 }}>
                        {files.length} file{files.length > 1 ? 's' : ''} selected
                      </span>
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt style={{ fontSize: 28, color: G.gold }} />
                      <span style={{ color: G.slate, fontSize: 13 }}>Click to upload files</span>
                    </>
                  )}
                  <input
                    type="file"
                    name="files"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Note */}
              <div>
                <label style={labelStyle}>Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'vertical', height: 84,
                  }}
                />
              </div>

              {/* Transaction ID (read-only display) */}
              {transactionId && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                  border: `1px solid rgba(255,255,255,0.06)`, padding: '9px 13px',
                }}>
                  <div style={{ color: G.slateD, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 3 }}>
                    Transaction ID
                  </div>
                  <div style={{ color: G.slate, fontSize: 12, wordBreak: 'break-all' }}>{transactionId}</div>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                    background: loading
                      ? 'rgba(245,166,35,0.35)'
                      : `linear-gradient(135deg,${G.gold},${G.goldLight})`,
                    color: G.navy, fontWeight: 700, fontSize: 14,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(245,166,35,0.3)',
                    transition: 'all 160ms ease',
                  }}
                >
                  {loading ? 'Submitting…' : 'Submit Confirmation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    border: `1px solid ${G.goldBorder}`, background: 'transparent',
                    color: G.gold, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    transition: 'all 160ms ease',
                  }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ConfirmationForm;

