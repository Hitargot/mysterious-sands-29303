import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaDollarSign, FaMoneyCheckAlt, FaEye, FaEyeSlash, FaChartLine, FaWallet, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';

const Overview = ({ setActiveComponent }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isBalanceVisible, setBalanceVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isHovered, setIsHovered] = useState({});
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
        let currentUserId = null;

        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const decoded = JSON.parse(atob(base64Url));
            currentUserId = decoded.id || decoded._id;
          } catch (err) {
            console.error('Error decoding JWT:', err);
          }
        }

        const currentUserIdStr = currentUserId?.toString();

        const responses = await Promise.allSettled([
          axios.get(`${apiUrl}/api/wallet/data`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/transaction/transaction-history`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/confirmations`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const walletRes = responses[0].status === 'fulfilled' ? responses[0].value.data : null;
        const transactionsRes = responses[1].status === 'fulfilled' ? responses[1].value.data : null;
        const confirmationsRes = responses[2].status === 'fulfilled' ? responses[2].value.data : null;

        if (walletRes) setWalletBalance(walletRes.balance || 0);

        const transactions = (transactionsRes?.transactions || []).map((t) => {
          const senderIdStr = typeof t.senderId === 'object' ? t.senderId._id?.toString() : t.senderId?.toString();
          const isSender = senderIdStr === currentUserIdStr;
          const counterparty = isSender ? t.recipientId : t.senderId;
          const isWithdrawal = t.type?.toLowerCase() === 'withdrawal';
          const base = t.amount || t.ngnAmount || 0;
          const fee = isWithdrawal ? Number(t.fee ?? t.fees ?? t.withdrawalFee ?? t.feeAmount ?? t.charge ?? 0) : 0;
          return {
            ...t,
            type: t.type?.toLowerCase() === 'transfer' ? (isSender ? 'Sent Transfer' : 'Received Transfer') : t.type,
            counterparty: counterparty?.payId || counterparty?.username || counterparty?._id || 'Unknown',
            amount: base + fee,
            status: t.status || 'N/A',
          };
        });

        const confirmations = (confirmationsRes?.confirmations || []).map((c) => ({
          ...c,
          type: 'Trade Confirmation',
          serviceName: c.serviceId?.name || 'N/A',
          transactionId: c.transactionId || c.id || c._id,
          id: c.transactionId || c.id || c._id,
        }));

        const fundingTransactions = (walletRes?.transactions || [])
          .filter((f) => f.type === 'Funding')
          .map((f) => ({ ...f, type: 'Funding', amount: f.amount || 0, status: f.status || 'Funded' }));

        const combinedActivities = [...transactions, ...confirmations, ...fundingTransactions]
          .map((a) => ({ ...a, time: new Date(a.createdAt || a.date).getTime() }))
          .sort((a, b) => b.time - a.time);

        setRecentActivities(combinedActivities.slice(0, 5));
        setIsHovered(new Array(combinedActivities.length).fill(false));
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  const actionButtons = [
    { label: 'Start Trade', icon: <FaArrowRight />, component: 'trade-calculator', color: '#F5A623' },
    { label: 'Withdraw', icon: <FaMoneyCheckAlt />, component: 'wallet', color: '#34D399' },
    { label: 'Fund Account', icon: <FaDollarSign />, component: 'wallet', color: '#60A5FA' },
  ];

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'funded' || s === 'completed') return '#34D399';
    if (s === 'pending') return '#FBBF24';
    return '#F87171';
  };

  return (
    <div style={s.page}>
      {/* Wallet Balance Card */}
      <div style={s.balanceCard}>
        <div style={s.balanceCardInner}>
          <div>
            <p style={s.balanceLabel}>💰 Total Balance</p>
            <p style={{ ...s.balanceAmount, fontSize: isMobile ? '1.4rem' : '2.2rem' }}>
              {isBalanceVisible ? `₦${walletBalance.toLocaleString()}` : '••••••••'}
            </p>
          </div>
          <span onClick={() => setBalanceVisible(!isBalanceVisible)} style={s.eyeBtn} title="Toggle balance">
            {isBalanceVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div style={s.balanceFooter}>
          <FaWallet style={{ marginRight: 6, opacity: 0.6 }} />
          <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>Exdollarium Wallet</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ ...s.actionRow, flexDirection: 'row', flexWrap: 'wrap' }}>
        {actionButtons.map(({ label, icon, component, color }, i) => (
          <button
            key={i}
            onClick={() => setActiveComponent(component)}
            onMouseEnter={() => setHoveredBtn(i)}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...s.actionBtn,
              borderColor: color,
              background: hoveredBtn === i ? color : 'rgba(15,23,42,0.85)',
              color: hoveredBtn === i ? '#0A0F1E' : color,
              flex: '1 1 0',
              minWidth: isMobile ? '80px' : '100px',
              padding: isMobile ? '0.6rem 0.5rem' : '0.7rem 1rem',
              fontSize: isMobile ? '0.75rem' : '0.88rem',
            }}
          >
            <span style={{ fontSize: isMobile ? '0.9rem' : '1.1rem' }}>{icon}</span>
            <span style={{ fontWeight: 700 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Quick Stats Row — always horizontal, shrinks on mobile */}
      <div style={{ ...s.statsRow, flexDirection: 'row' }}>
        {[
          { label: 'Transactions', icon: <FaExchangeAlt />, component: 'transaction-history', accent: '#60A5FA' },
          { label: 'Trade History', icon: <FaChartLine />, component: 'trade-history', accent: '#34D399' },
          { label: 'Wallet', icon: <FaWallet />, component: 'wallet', accent: '#F5A623' },
        ].map(({ label, icon, component, accent }, i) => (
          <div
            key={i}
            onClick={() => setActiveComponent(component)}
            style={{
              ...s.statCard,
              borderColor: `${accent}33`,
              padding: isMobile ? '0.65rem 0.4rem' : '1rem',
              gap: isMobile ? '4px' : '8px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${accent}33`; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ color: accent, fontSize: isMobile ? '1.1rem' : '1.4rem' }}>{icon}</span>
            <span style={{ color: '#94A3B8', fontSize: isMobile ? '0.68rem' : '0.85rem', fontWeight: 600, textAlign: 'center' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div style={s.activityCard}>
        <div style={s.activityHeader}>
          <h3 style={{ ...s.activityTitle, fontSize: isMobile ? '0.82rem' : '1rem' }}>Recent Activities</h3>
          <button
            onClick={() => setActiveComponent('transaction-history')}
            style={s.seeMoreBtn}
          >
            See All →
          </button>
        </div>

        {loading ? (
          <div style={s.loadingRow}>
            <div style={s.spinner} />
            <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Loading activities…</span>
          </div>
        ) : recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            isMobile ? (
              /* ── Mobile: compact 2-line card ── */
              <div
                key={activity.transactionId || `activity-${index}`}
                style={{
                  ...s.activityRow,
                  ...(isHovered[index] ? s.activityRowHover : {}),
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '10px 12px',
                }}
                onMouseEnter={() => setIsHovered((prev) => prev.map((v, idx) => idx === index ? true : v))}
                onMouseLeave={() => setIsHovered((prev) => prev.map((v, idx) => idx === index ? false : v))}
              >
                {/* Row 1: type badge + status pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)',
                    color: '#F5A623', borderRadius: '50px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700,
                  }}>
                    {activity.type}
                  </span>
                  <span style={{
                    background: `${getStatusColor(activity.status)}18`,
                    color: getStatusColor(activity.status),
                    borderRadius: '50px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700,
                  }}>
                    {activity.status || 'N/A'}
                  </span>
                </div>
                {/* Row 2: detail + date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CBD5E1', fontSize: '0.78rem', fontWeight: 500 }}>
                    {activity.type?.toLowerCase().includes('transfer')
                      ? `${activity.counterparty} · ₦${activity.amount.toLocaleString()}`
                      : ['withdrawal', 'funding'].includes(activity.type?.toLowerCase())
                        ? `₦${activity.amount ? activity.amount.toLocaleString() : '0'}`
                        : activity.type?.toLowerCase() === 'trade confirmation'
                          ? activity.serviceName
                          : 'N/A'}
                  </span>
                  <span style={{ color: '#475569', fontSize: '0.7rem' }}>
                    {new Date(activity.createdAt || activity.date).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            ) : (
              /* ── Desktop: 4-column row ── */
              <div
                key={activity.transactionId || `activity-${index}`}
                style={{
                  ...s.activityRow,
                  ...(isHovered[index] ? s.activityRowHover : {}),
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onMouseEnter={() => setIsHovered((prev) => prev.map((v, idx) => idx === index ? true : v))}
                onMouseLeave={() => setIsHovered((prev) => prev.map((v, idx) => idx === index ? false : v))}
              >
                <div style={{ ...s.activityCell, flex: 1.4 }}>
                  <span style={{
                    background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)',
                    color: '#F5A623', borderRadius: '50px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {activity.type}
                  </span>
                </div>
                <div style={{ ...s.activityCell, flex: 2, color: '#CBD5E1' }}>
                  {activity.type?.toLowerCase().includes('transfer')
                    ? `${activity.counterparty} · ₦${activity.amount.toLocaleString()}`
                    : ['withdrawal', 'funding'].includes(activity.type?.toLowerCase())
                      ? `₦${activity.amount ? activity.amount.toLocaleString() : '0'}`
                      : activity.type?.toLowerCase() === 'trade confirmation'
                        ? activity.serviceName
                        : 'N/A'}
                </div>
                <div style={{ ...s.activityCell, flex: 1 }}>
                  <span style={{
                    background: `${getStatusColor(activity.status)}18`,
                    color: getStatusColor(activity.status),
                    borderRadius: '50px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {activity.status || 'N/A'}
                  </span>
                </div>
                <div style={{ ...s.activityCell, flex: 1.2, color: '#475569', fontSize: '0.78rem' }}>
                  {new Date(activity.createdAt || activity.date).toLocaleString('en-GB')}
                </div>
              </div>
            )
          ))
        ) : (
          <p style={{ color: '#475569', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
            No recent activities yet.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: '4px 0',
    fontFamily: "'Poppins', sans-serif",
  },
  // Balance card
  balanceCard: {
    background: 'linear-gradient(135deg,rgba(245,166,35,0.18) 0%,rgba(15,23,42,0.95) 100%)',
    border: '1px solid rgba(245,166,35,0.35)',
    borderRadius: '18px',
    padding: '1.8rem 2rem',
    marginBottom: '20px',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  },
  balanceCardInner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  balanceLabel: {
    color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem',
  },
  balanceAmount: {
    fontSize: '2.2rem', fontWeight: 800, color: '#F5A623',
    letterSpacing: '0.02em', margin: 0,
  },
  eyeBtn: {
    cursor: 'pointer', fontSize: '1.4rem', color: '#94A3B8',
    transition: 'color 0.2s', padding: '6px',
  },
  balanceFooter: {
    display: 'flex', alignItems: 'center', marginTop: '1rem',
    color: '#64748B', fontSize: '0.82rem',
  },
  // Action buttons
  actionRow: {
    display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid',
    cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem',
    transition: 'all 0.2s ease', minWidth: '100px',
  },
  // Stats row
  statsRow: {
    display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
  },
  statCard: {
    flex: 1, minWidth: '100px',
    background: 'rgba(15,23,42,0.7)', border: '1px solid',
    borderRadius: '12px', padding: '1rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    cursor: 'pointer', transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
  },
  // Activity card
  activityCard: {
    background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(245,166,35,0.12)',
    borderRadius: '18px', padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  activityHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.2rem', paddingBottom: '0.8rem',
    borderBottom: '1px solid rgba(245,166,35,0.1)',
  },
  activityTitle: {
    color: '#F1F5F9', fontSize: '1rem', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
  },
  seeMoreBtn: {
    background: 'transparent', border: '1px solid rgba(245,166,35,0.35)',
    color: '#F5A623', borderRadius: '50px', padding: '4px 14px',
    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
  },
  activityRow: {
    display: 'flex', padding: '10px 12px', marginBottom: '8px',
    background: 'rgba(30,41,59,0.6)', borderRadius: '10px',
    transition: 'all 0.2s ease', cursor: 'pointer',
    border: '1px solid transparent',
  },
  activityRowHover: {
    background: 'rgba(30,41,59,0.95)', border: '1px solid rgba(245,166,35,0.2)',
    transform: 'translateX(3px)',
  },
  activityCell: {
    flex: 1, fontSize: '0.83rem', fontWeight: 500, color: '#94A3B8',
    display: 'flex', alignItems: 'center',
  },
  loadingRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '12px', padding: '2rem 0',
  },
  spinner: {
    width: '22px', height: '22px', borderRadius: '50%',
    border: '3px solid rgba(245,166,35,0.15)',
    borderTop: '3px solid #F5A623',
    animation: 'spin 0.9s linear infinite',
  },
};

export default Overview;
