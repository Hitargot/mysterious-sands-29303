import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome, FaCalculator, FaHistory, FaUser, FaWallet,
  FaExchangeAlt, FaPlusCircle, FaClipboardList, FaIdCard,
  FaBars, FaTimes, FaSignOutAlt, FaChevronRight,
} from 'react-icons/fa';
import { GiReceiveMoney } from 'react-icons/gi';
import { jwtDecode } from 'jwt-decode';
import ResponsiveLogo from './ResponsiveLogo';

// ─── design tokens ───────────────────────────────────────────────────────────
const G = {
  gold: '#F5A623',
  goldLight: '#FBBF24',
  goldFaint: 'rgba(245,166,35,0.12)',
  goldBorder: 'rgba(245,166,35,0.2)',
  navy: '#0A0F1E',
  navy2: '#0F172A',
  navy3: '#111827',
  navy4: '#1E293B',
  slate: '#94A3B8',
  slateD: '#64748B',
  red: '#F87171',
  redFaint: 'rgba(248,113,113,0.1)',
  white: '#F1F5F9',
};

const SIDEBAR_W = 260;

// ─── nav groups ──────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { label: 'Overview',      icon: <FaHome />,         component: 'overview' },
      { label: 'Wallet',        icon: <FaWallet />,        component: 'wallet' },
      { label: 'Transfer',      icon: <GiReceiveMoney />,  component: 'transfer' },
    ],
  },
  {
    label: 'Trading',
    items: [
      { label: 'Trade Calculator',      icon: <FaCalculator />,    component: 'trade-calculator' },
      { label: 'Create Pre-submission', icon: <FaPlusCircle />,    component: 'create-presubmission' },
      { label: 'My Pre-submissions',    icon: <FaClipboardList />, component: 'my-pre-submissions' },
      { label: 'Trade History',         icon: <FaExchangeAlt />,   component: 'trade-history' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Transaction History', icon: <FaHistory />,  component: 'transaction-history' },
      { label: 'Profile',             icon: <FaUser />,     component: 'profile' },
      { label: 'KYC Verification',    icon: <FaIdCard />,   component: 'kyc' },
    ],
  },
];

// ─── component ───────────────────────────────────────────────────────────────
const Sidebar = ({ setActiveComponent, activeComponent, clearJwtToken, handleAlert }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen]             = useState(false);
  const [hoveredItem, setHoveredItem]   = useState(null);
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);
  const [logoutHov, setLogoutHov]       = useState(false);
  const [userName, setUserName]         = useState('');

  // Decode username from JWT for the bottom user strip
  useEffect(() => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const decoded = jwtDecode(token);
        setUserName(decoded?.username || decoded?.email || '');
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock body scroll on mobile when drawer is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  const isDesktop = !isMobile;

  const handleNav = (component) => {
    setActiveComponent(component);
    if (isMobile) setIsOpen(false);
  };

  const handleLogout = () => {
    if (clearJwtToken) clearJwtToken();
    localStorage.removeItem('jwtToken');
    if (handleAlert) handleAlert('Logged out successfully.', 'success');
    navigate('/login');
  };

  // ── styles ────────────────────────────────────────────────────────────────

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${SIDEBAR_W}px`,
    height: '100vh',
    background: `linear-gradient(180deg, ${G.navy} 0%, ${G.navy2} 50%, ${G.navy} 100%)`,
    borderRight: `1px solid ${G.goldBorder}`,
    boxShadow: isDesktop
      ? `4px 0 24px rgba(0,0,0,0.4)`
      : isOpen ? `8px 0 40px rgba(0,0,0,0.65)` : 'none',
    transform: isDesktop || isOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)`,
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    zIndex: 1050,
    display: 'flex',
    flexDirection: 'column',
    // No overflow on the aside itself — the nav section scrolls internally
    overflow: 'hidden',
  };

  const backdropStyle = {
    display: isOpen && isMobile ? 'block' : 'none',
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    zIndex: 1040,
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
  };

  const hamburgerStyle = {
    position: 'fixed',
    top: '14px',
    left: isOpen ? `${SIDEBAR_W - 24}px` : '14px',
    zIndex: 1100,
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
    border: 'none',
    cursor: 'pointer',
    display: isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    color: G.navy,
    fontSize: '16px',
    fontWeight: 700,
    boxShadow: `0 4px 16px rgba(245,166,35,0.4)`,
    transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.2s ease',
  };

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        style={hamburgerStyle}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* ── Backdrop ── */}
      <div style={backdropStyle} onClick={() => setIsOpen(false)} />

      {/* ── Sidebar panel ── */}
      <aside style={sidebarStyle}>

        {/* ── Logo / Brand ── */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '22px 20px 18px',
            cursor: 'pointer',
            borderBottom: `1px solid ${G.goldBorder}`,
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10, overflow: 'hidden',
            border: `1.5px solid ${G.goldBorder}`,
            boxShadow: `0 0 12px rgba(245,166,35,0.25)`,
            flexShrink: 0,
          }}>
            <ResponsiveLogo variant="small" alt="Exdollarium" style={{ width: '100%', height: '100%' }} />
          </div>
          <div>
            <div style={{
              color: G.gold,
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.08em',
              lineHeight: 1.1,
            }}>
              EXDOLLARIUM
            </div>
            <div style={{ color: G.slateD, fontSize: '0.65rem', letterSpacing: '0.06em', marginTop: 2 }}>
              DASHBOARD
            </div>
          </div>
        </div>

        {/* ── Nav groups ── */}
        <nav style={{
          flex: 1,
          minHeight: 0,        // critical: allows flex child to shrink below content size
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '10px 0 8px',
          scrollbarWidth: 'thin',
          scrollbarColor: `${G.goldBorder} transparent`,
        }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: '4px' }}>
              {/* Group label */}
              <div style={{
                padding: '10px 20px 4px',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: G.slateD,
                userSelect: 'none',
              }}>
                {group.label}
              </div>

              {/* Items */}
              {group.items.map(({ label, icon, component }) => {
                const isActive = activeComponent === component;
                const isHov    = hoveredItem === component;

                return (
                  <button
                    key={component}
                    onClick={() => handleNav(component)}
                    onMouseEnter={() => setHoveredItem(component)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px 10px 18px',
                      width: '100%',
                      border: 'none',
                      borderLeft: isActive
                        ? `3px solid ${G.gold}`
                        : `3px solid transparent`,
                      borderRadius: isActive ? '0 10px 10px 0' : '0',
                      background: isActive
                        ? `linear-gradient(90deg, rgba(245,166,35,0.18) 0%, rgba(245,166,35,0.04) 100%)`
                        : isHov
                          ? G.goldFaint
                          : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                      marginRight: isActive ? '10px' : '0',
                    }}
                  >
                    {/* Icon */}
                    <span style={{
                      fontSize: '15px',
                      minWidth: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? G.gold : isHov ? G.goldLight : G.slateD,
                      transition: 'color 0.18s, transform 0.18s',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      flexShrink: 0,
                    }}>
                      {icon}
                    </span>

                    {/* Label */}
                    <span style={{
                      fontSize: '0.845rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? G.white : isHov ? G.white : G.slate,
                      flex: 1,
                      letterSpacing: '0.01em',
                      transition: 'color 0.18s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {label}
                    </span>

                    {/* Active chevron */}
                    {isActive && (
                      <FaChevronRight style={{
                        fontSize: '9px',
                        color: G.gold,
                        opacity: 0.7,
                        flexShrink: 0,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── User strip ── */}
        {userName && (
          <div style={{
            padding: '12px 18px',
            borderTop: `1px solid ${G.goldBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 800, color: G.navy,
              flexShrink: 0,
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{
                color: G.white, fontSize: '0.8rem', fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {userName}
              </div>
              <div style={{ color: G.slateD, fontSize: '0.65rem' }}>Logged in</div>
            </div>
          </div>
        )}

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHov(true)}
          onMouseLeave={() => setLogoutHov(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '13px 18px',
            width: '100%',
            border: 'none',
            borderTop: userName ? 'none' : `1px solid ${G.goldBorder}`,
            borderLeft: logoutHov ? `3px solid ${G.red}` : '3px solid transparent',
            background: logoutHov ? G.redFaint : 'transparent',
            color: logoutHov ? G.red : G.slateD,
            fontSize: '0.845rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            marginBottom: '8px',
            flexShrink: 0,
          }}
        >
          <FaSignOutAlt style={{
            fontSize: '15px', minWidth: '20px',
            color: logoutHov ? G.red : G.slateD,
            transition: 'color 0.18s',
          }} />
          <span>Logout</span>
        </button>

      </aside>
    </>
  );
};

export default Sidebar;

