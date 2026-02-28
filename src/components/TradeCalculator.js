import React, { useState, useEffect } from 'react'; // React hooks
import axios from 'axios'; // Axios for HTTP requests
import { FaTimes, FaTelegramPlane, FaCalculator, FaChevronRight } from 'react-icons/fa'; // React icons
import Alert from './Alert'; // Alert component
import TradeDetails from './TradeDetails'; // TradeDetails component

const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.25)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
  greenFaint: 'rgba(52,211,153,0.12)', redFaint: 'rgba(248,113,113,0.12)',
};


const TradeCalculator = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [ngnEquivalent, setNGNEquivalent] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [viewTradeDetails, setViewTradeDetails] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('usd'); // default to USD

  const apiUrl = process.env.REACT_APP_API_URL;


  // Fetch services dynamically
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/services`);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, [apiUrl]);

  const handleAmountChange = (e) => {
    const amount = e.target.value;
    setSelectedAmount(amount);
    setNGNEquivalent(null);
    setReceiptVisible(false);
  };

  const handleCalculate = () => {
    if (!selectedService) {
      setAlertMessage('Please select a service!');
      setShowAlert(true);
      return;
    }

    if (!selectedAmount || isNaN(selectedAmount)) {
      setAlertMessage('Please enter a valid amount!');
      setShowAlert(true);
      return;
    }

    const service = services.find((s) => s.name === selectedService);
    if (!service) {
      setAlertMessage('Invalid service selected!');
      setShowAlert(true);
      return;
    }

    if (selectedService === 'Website Recharge' && selectedAmount < 5) {
      setAlertMessage('Minimum amount for Website Recharge is 5 USD.');
      setShowAlert(true);
      return;
    }

    const rate = service.exchangeRates[selectedCurrency]; // Dynamically get rate based on selected currency
    if (!rate) {
      setAlertMessage('Exchange rate not available!');
      setShowAlert(true);
      return;
    }

    let ngnEquivalent;

    // Logic for different amounts for Website Recharge:
    if (selectedService === 'Website Recharge') {
      if (selectedAmount === 5) {
        ngnEquivalent = rate * 1; // For 5 USD, no multiplier
      } else if (selectedAmount === 10) {
        ngnEquivalent = rate * 2; // For 10 USD, multiply by 2
      } else if (selectedAmount === 20) {
        ngnEquivalent = rate * 3; // For 20 USD, multiply by 3
      } else if (selectedAmount === 30) {
        ngnEquivalent = rate * 4; // For 30 USD, multiply by 4
      } else if (selectedAmount === 50) {
        ngnEquivalent = rate * 5; // For 50 USD, multiply by 5
      }
    } else {
      // For other services, calculate NGN equivalent directly
      ngnEquivalent = selectedAmount * rate;
    }

    // Check if ngnEquivalent is a valid number before using toFixed
    if (ngnEquivalent !== undefined && !isNaN(ngnEquivalent)) {
      setNGNEquivalent(ngnEquivalent.toFixed(2)); // Set the final NGN equivalent
    } else {
      setAlertMessage('Invalid calculation!');
      setShowAlert(true);
    }

    setReceiptVisible(true);
  };

  const handleShareReceipt = () => {
    const service = services.find((s) => s.name === selectedService);
    if (!service) return;

    const message = `
      *Trade Details:*
      Service: ${service.name}
      Amount (${selectedCurrency.toUpperCase()}): ${selectedAmount}
      Exchange Rate: ${service.exchangeRates[selectedCurrency]} NGN per ${selectedCurrency.toUpperCase()}
      NGN Equivalent: ₦${ngnEquivalent}
    `;
  const telegramURL = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
  window.open(telegramURL, '_blank');
  };

  const handleCloseReceipt = () => {
    setReceiptVisible(false);
  };

  const handleViewTradeDetails = () => {
    setReceiptVisible(false);
    setViewTradeDetails(true);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '8px 4px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(245,166,35,0.35)',
        }}>
          <FaCalculator style={{ color: G.navy, fontSize: 20 }} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: G.white, fontSize: 20, fontWeight: 700 }}>Trade Calculator</h2>
          <div style={{ color: G.slateD, fontSize: 13 }}>Estimate your NGN equivalent before trading</div>
        </div>
      </div>

      {/* ── Step 1: Pick a service ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: G.slate, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
          Select a Service
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {services.length === 0 && (
            <div style={{ color: G.slateD, fontSize: 13, padding: 8 }}>Loading services...</div>
          )}
          {services.map((service) => {
            const active = selectedService === service.name;
            return (
              <button
                key={service._id}
                onClick={() => {
                  setSelectedService(active ? '' : service.name);
                  setReceiptVisible(false);
                  setViewTradeDetails(false);
                  setNGNEquivalent(null);
                  setSelectedAmount('');
                }}
                style={{
                  padding: '14px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  border: active ? `2px solid ${G.gold}` : `1px solid ${G.goldBorder}`,
                  background: active
                    ? `linear-gradient(135deg,rgba(245,166,35,0.18),rgba(251,191,36,0.10))`
                    : 'rgba(15,23,42,0.88)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: active ? `0 0 18px rgba(245,166,35,0.25)` : 'none',
                  transition: 'all 160ms ease',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                {/* service name */}
                <span style={{
                  color: active ? G.gold : G.white,
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  lineHeight: 1.3,
                }}>
                  {service.name}
                </span>
                {/* rate preview: USD rate */}
                {service.exchangeRates?.usd && (
                  <span style={{ color: G.slateD, fontSize: 11 }}>
                    &#8358;{service.exchangeRates.usd} / USD
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedService && (
        <div style={{
          background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(16px)',
          border: `1px solid ${G.goldBorder}`, borderRadius: 16,
          padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 18,
        }}>

          {/* ── Exchange rates ── */}
          <div style={{
            background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ color: G.gold, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Current Exchange Rates
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[['USD', 'usd'], ['EUR', 'eur'], ['GBP', 'gbp']].map(([label, key]) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <div style={{ color: G.slateD, fontSize: 11, marginBottom: 2 }}>{label}</div>
                  <div style={{ color: G.white, fontWeight: 700, fontSize: 15 }}>
                    &#8358;{services.find((s) => s.name === selectedService)?.exchangeRates?.[key] || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Currency pills ── */}
          <div>
            <div style={{ color: G.slate, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Currency</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['USD', 'usd'], ['EUR', 'eur'], ['GBP', 'gbp']].map(([label, key]) => {
                const active = selectedCurrency === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setSelectedCurrency(key); setNGNEquivalent(null); }}
                    style={{
                      padding: '8px 20px', borderRadius: 20, cursor: 'pointer', fontSize: 14,
                      border: active ? `2px solid ${G.gold}` : `1px solid ${G.goldBorder}`,
                      background: active ? G.goldFaint : 'transparent',
                      color: active ? G.gold : G.slate,
                      fontWeight: active ? 700 : 400,
                      transition: 'all 140ms ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Amount ── */}
          {selectedService === 'Website Recharge' ? (
            <div>
              <div style={{ color: G.slate, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Amount</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[5, 10, 20, 30, 50].map((amt) => {
                  const active = selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      onClick={() => { setSelectedAmount(amt); setNGNEquivalent(null); setReceiptVisible(false); }}
                      style={{
                        padding: '9px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 14,
                        border: active ? `2px solid ${G.gold}` : `1px solid ${G.goldBorder}`,
                        background: active ? G.goldFaint : 'transparent',
                        color: active ? G.gold : G.slate,
                        fontWeight: active ? 700 : 400,
                        transition: 'all 140ms ease',
                      }}
                    >
                      {amt} USD
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', color: G.slate, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Amount</label>
              <input
                type="number"
                value={selectedAmount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: `1px solid ${G.goldBorder}`, background: G.navy3,
                  color: G.white, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* ── Calculate button ── */}
          <button
            onClick={handleCalculate}
            style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none',
              background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
              color: G.navy, fontWeight: 700, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <FaCalculator /> Calculate
          </button>
        </div>
      )}

      {showAlert && <Alert message={alertMessage} onClose={() => setShowAlert(false)} />}

      {/* ── Receipt modal ── */}
      {receiptVisible && ngnEquivalent !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000,
        }}>
          <div style={{
            background: G.navy2, border: `1px solid ${G.goldBorder}`, borderRadius: 20,
            padding: '28px 24px', width: 'min(420px,90%)', position: 'relative',
            boxShadow: '0 0 40px rgba(245,166,35,0.15)',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg,${G.gold},${G.goldLight})`,
              borderRadius: '20px 20px 0 0',
            }} />

            <button
              onClick={handleCloseReceipt}
              aria-label="Close"
              style={{
                position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
                color: G.slate, padding: 0, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <FaTimes size={14} />
            </button>

            <h3 style={{ margin: '0 0 18px', color: G.gold, fontSize: 17, fontWeight: 700 }}>Trade Receipt</h3>

            {[
              ['Service', selectedService],
              [`Amount (${selectedCurrency.toUpperCase()})`, String(selectedAmount)],
              ['NGN Equivalent', `\u20a6${Number(ngnEquivalent).toLocaleString()}`],
            ].map(([label, val]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}>
                <span style={{ color: G.slateD, fontSize: 13 }}>{label}</span>
                <span style={{ color: G.white, fontWeight: 600, fontSize: 14 }}>{val}</span>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={handleViewTradeDetails}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
                  color: G.navy, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                Start Trade <FaChevronRight style={{ fontSize: 12 }} />
              </button>
              <button
                onClick={handleShareReceipt}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10,
                  border: `1px solid ${G.goldBorder}`, background: 'transparent',
                  color: G.gold, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <FaTelegramPlane /> Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TradeDetails panel ── */}
      {viewTradeDetails && selectedService && (
        <div style={{ marginTop: 20 }}>
          <TradeDetails
            selectedService={selectedService}
            serviceDetails={services.find((s) => s.name === selectedService) || {}}
          />
        </div>
      )}

      {/* ── Telegram FAB ── */}
      <button
        onClick={() => window.open('https://t.me/Exdollarium', '_blank')}
        aria-label="Contact on Telegram @Exdollarium"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
          color: G.navy, fontSize: 24, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(245,166,35,0.45)', zIndex: 800,
        }}
      >
        <FaTelegramPlane />
      </button>
    </div>
  );
};

export default TradeCalculator;
