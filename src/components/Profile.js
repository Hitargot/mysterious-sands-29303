import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import Alert from "./Alert";
import axios from "axios";
import { FaRegCopy, FaCheckCircle, FaUserEdit, FaSave, FaEye, FaEyeSlash, FaIdBadge, FaUsers, FaWallet, FaKey, FaChevronDown, FaChevronUp } from 'react-icons/fa';

/* 鈹€鈹€鈹€ Design tokens 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
  greenFaint: 'rgba(52,211,153,0.12)', redFaint: 'rgba(248,113,113,0.12)',
};

const card = {
  background: 'rgba(15,23,42,0.88)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: `1px solid ${G.goldBorder}`,
  borderRadius: 16,
  padding: '24px 28px',
  marginBottom: 16,
};

const label = {
  display: 'block', fontSize: '0.72rem', color: G.slateD,
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
};

const inputStyle = (err = false) => ({
  width: '100%', boxSizing: 'border-box',
  background: G.navy3, border: `1px solid ${err ? G.red : G.goldBorder}`,
  borderRadius: 10, color: G.white, padding: '11px 14px',
  fontSize: '0.9rem', outline: 'none', marginBottom: 4,
});

const primaryBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
  color: G.navy, border: 'none', borderRadius: 10,
  padding: '11px 22px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
};

const outlineBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  background: 'transparent', border: `1px solid ${G.goldBorder}`,
  color: G.slate, borderRadius: 10, padding: '10px 20px',
  fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
};

const SectionHeader = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: G.gold, fontSize: '0.95rem', flexShrink: 0,
    }}>{icon}</div>
    <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: G.white }}>{title}</h3>
  </div>
);

const CopyField = ({ label: lbl, value, style: extraStyle }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ marginBottom: 14, ...extraStyle }}>
      <div style={label}>{lbl}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: G.navy3, border: `1px solid ${G.goldBorder}`, borderRadius: 10, padding: '9px 14px' }}>
        <span style={{ color: G.slate, fontSize: '0.85rem', flex: 1, wordBreak: 'break-all' }}>{value || '-'}</span>
        <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.gold, padding: 0, flexShrink: 0 }}>
          {copied ? <FaCheckCircle size={14} style={{ color: G.green }} /> : <FaRegCopy size={14} />}
        </button>
      </div>
      {copied && <span style={{ fontSize: '0.72rem', color: G.green }}>Copied!</span>}
    </div>
  );
};

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    isVerified: false, referralCode: "", referrer: null,
    referredCount: 0, totalFunded: 0, totalWithdrawn: 0,
    referralBonusEarned: 0, payId: "",
  });

  const [newPayId, setNewPayId] = useState("");
  const [isEditingPayId, setIsEditingPayId] = useState(false);
  const [showWalletSummary, setShowWalletSummary] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [alert, setAlert] = useState({ message: "", type: "", show: false });
  const [kycStatus, setKycStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'

  const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
  const apiUrl = process.env.REACT_APP_API_URL;
  const FRONTEND_URL = "https://exdollarium.com";
  const navigate = useNavigate();

  const PROFILE_CACHE_KEY = 'profile_cache_v1';
  const PROFILE_CACHE_TTL = 5 * 60 * 1000;

  const getCachedProfile = useCallback(() => {
    try {
      const raw = localStorage.getItem(PROFILE_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.ts || !parsed?.data) return null;
      if ((Date.now() - parsed.ts) > PROFILE_CACHE_TTL) return null;
      return parsed.data;
    } catch { return null; }
  }, [PROFILE_CACHE_TTL, PROFILE_CACHE_KEY]);

  const setCachedProfile = useCallback((data) => {
    try { localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { }
  }, [PROFILE_CACHE_KEY]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const cached = getCachedProfile();
    if (cached) { setUserInfo(cached); }
    let cancelled = false;
    const fetch_ = async () => {
      try {
        const [profileRes, kycRes] = await Promise.all([
          axios.get(`${apiUrl}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/kyc/status`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        ]);
        if (!cancelled) {
          setUserInfo(profileRes.data);
          setCachedProfile(profileRes.data);
          if (kycRes) setKycStatus(kycRes.data?.kyc?.status || null);
        }
      } catch { if (!cancelled) setAlert({ message: "Error fetching profile data", type: "error", show: true }); }
    };
    fetch_();
    return () => { cancelled = true; };
  }, [token, apiUrl, navigate, getCachedProfile, setCachedProfile]);

  const handleEditProfile = () => { setIsEditing(true); setNewFirstName(userInfo.firstName); setNewLastName(userInfo.lastName); };

  const handleSavePayId = async () => {
    try {
      const res = await axios.post(`${apiUrl}/api/user/set-payid`, { payId: newPayId }, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ message: res.data.message, type: "success", show: true });
      setUserInfo(prev => { const merged = { ...prev, payId: res.data.payId }; setCachedProfile(merged); return merged; });
      setIsEditingPayId(false);
    } catch (err) {
      setAlert({ message: err.response?.data?.message || "Failed to set Pay ID", type: "error", show: true });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axios.post(`${apiUrl}/api/user/update-profile`, { firstName: newFirstName, lastName: newLastName }, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ message: res.data.message, type: "success", show: true });
      setIsEditing(false);
      const merged = { ...userInfo, firstName: newFirstName, lastName: newLastName };
      setUserInfo(merged);
      setCachedProfile(merged);
    } catch { setAlert({ message: "Failed to update profile", type: "error", show: true }); }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) { setAlert({ message: "Passwords do not match", type: "error", show: true }); return; }
    try {
      const res = await axios.post(`${apiUrl}/api/user/update-password`, { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ message: res.data.message, type: "success", show: true });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch { setAlert({ message: "Failed to update password", type: "error", show: true }); }
  };

  const formatEmail = (email = '') => {
    const [local, domain] = email.split('@');
    if (!local) return email;
    return `${local[0]}****@${domain}`;
  };

  const avatarLetter = (userInfo.firstName || userInfo.email || 'U')[0]?.toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: G.navy, padding: '28px 20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Profile Header Card */}
        <div style={{
          ...card,
          background: `linear-gradient(135deg, ${G.navy4} 0%, ${G.navy2} 100%)`,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          marginBottom: 20,
        }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.6rem', color: G.navy, flexShrink: 0,
          }}>{avatarLetter}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: G.white }}>
                {userInfo.firstName} {userInfo.lastName}
              </h2>
              <span style={{
                background: userInfo.isVerified ? G.greenFaint : G.redFaint,
                color: userInfo.isVerified ? G.green : G.red,
                fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {userInfo.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: G.slate, fontSize: '0.84rem' }}>{formatEmail(userInfo.email)}</p>
            {userInfo.payId && (
              <p style={{ margin: '3px 0 0', color: G.slateD, fontSize: '0.8rem' }}>
                Pay ID: <span style={{ color: G.gold }}>{userInfo.payId}</span>
              </p>
            )}
          </div>
        </div>

        {/* Personal Info */}
        <div style={card}>
          <SectionHeader icon={<FaUserEdit />} title="Personal Information" />

          {/* KYC lock notice */}
          {kycStatus === 'approved' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 18,
            }}>
              <FaCheckCircle style={{ color: G.green, flexShrink: 0 }} />
              <p style={{ margin: 0, color: G.green, fontSize: '0.83rem', fontWeight: 600 }}>
                Your identity has been verified. Profile name cannot be edited after KYC approval.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={label}>First Name</div>
              {isEditing && kycStatus !== 'approved'
                ? <input style={inputStyle()} value={newFirstName} onChange={e => setNewFirstName(e.target.value)} />
                : <div style={{ color: G.white, fontSize: '0.92rem', padding: '8px 0' }}>{userInfo.firstName || '-'}</div>}
            </div>
            <div>
              <div style={label}>Last Name</div>
              {isEditing && kycStatus !== 'approved'
                ? <input style={inputStyle()} value={newLastName} onChange={e => setNewLastName(e.target.value)} />
                : <div style={{ color: G.white, fontSize: '0.92rem', padding: '8px 0' }}>{userInfo.lastName || '-'}</div>}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={label}>Email</div>
            <div style={{ color: G.slate, fontSize: '0.9rem' }}>{formatEmail(userInfo.email)}</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={label}>Phone</div>
            <div style={{ color: G.slate, fontSize: '0.9rem' }}>{userInfo.phone || '-'}</div>
          </div>
          {kycStatus !== 'approved' && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {isEditing ? (
                <>
                  <button style={primaryBtn} onClick={handleSaveProfile}><FaSave size={13} /> Save Changes</button>
                  <button style={outlineBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              ) : (
                <button style={outlineBtn} onClick={handleEditProfile}><FaUserEdit size={13} /> Edit Profile</button>
              )}
            </div>
          )}
        </div>

        {/* Pay ID */}
        <div style={card}>
          <SectionHeader icon={<FaIdBadge />} title="Your Pay ID" />
          {isEditingPayId && kycStatus !== 'approved' ? (
            <>
              <div style={label}>Pay ID</div>
              <input style={inputStyle()} value={newPayId} onChange={e => setNewPayId(e.target.value)} placeholder="Enter Pay ID" />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button style={primaryBtn} onClick={handleSavePayId}><FaSave size={13} /> Save Pay ID</button>
                <button style={outlineBtn} onClick={() => setIsEditingPayId(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {userInfo.payId
                ? <CopyField label="Current Pay ID" value={userInfo.payId} style={{ flex: 1, marginBottom: 0 }} />
                : <p style={{ color: G.slateD, margin: 0, fontSize: '0.88rem' }}>No Pay ID set yet.</p>}
              {kycStatus !== 'approved' && (
                <button style={{ ...outlineBtn, flexShrink: 0 }} onClick={() => { setIsEditingPayId(true); setNewPayId(userInfo.payId || ''); }}>
                  {userInfo.payId ? 'Update' : 'Set'} Pay ID
                </button>
              )}
            </div>
          )}
        </div>

        {/* Referral */}
        <div style={card}>
          <SectionHeader icon={<FaUsers />} title="Referral Program" />
          <CopyField label="Your Referral Code" value={userInfo.referralCode} />
          <CopyField label="Referral Link" value={`${FRONTEND_URL}/signup?referralCode=${userInfo.referralCode}`} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Referred By', value: userInfo.referrer?.username || 'None' },
              { label: 'Users Referred', value: userInfo.referredCount },
              { label: 'Referral Earnings', value: `\u20a6${(userInfo.referralBonusEarned || 0).toLocaleString()}`, color: G.green },
            ].map(item => (
              <div key={item.label} style={{
                background: G.navy4, borderRadius: 10, padding: '14px 16px',
                border: `1px solid rgba(245,166,35,0.1)`,
              }}>
                <div style={{ ...label, marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: item.color || G.white, fontWeight: 700, fontSize: '1rem' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet Summary (collapsible) */}
        <div style={card}>
          <button
            onClick={() => setShowWalletSummary(p => !p)}
            style={{
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: G.gold,
              }}><FaWallet /></div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: G.white }}>Wallet Summary</h3>
            </div>
            {showWalletSummary ? <FaChevronUp style={{ color: G.slateD }} /> : <FaChevronDown style={{ color: G.slateD }} />}
          </button>
          {showWalletSummary && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              {[
                { label: 'Total Funded', value: `\u20a6${(userInfo.totalFunded || 0).toLocaleString()}`, color: G.green },
                { label: 'Total Withdrawn', value: `\u20a6${(userInfo.totalWithdrawn || 0).toLocaleString()}`, color: G.red },
              ].map(item => (
                <div key={item.label} style={{
                  background: G.navy4, borderRadius: 12, padding: '16px 18px',
                  border: `1px solid rgba(245,166,35,0.1)`,
                }}>
                  <div style={{ ...label, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: item.color, fontWeight: 700, fontSize: '1.1rem' }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div style={card}>
          <SectionHeader icon={<FaKey />} title="Change Password" />
          {[
            { lbl: 'Current Password', val: currentPassword, set: setCurrentPassword, key: 'current' },
            { lbl: 'New Password', val: newPassword, set: setNewPassword, key: 'new' },
            { lbl: 'Confirm New Password', val: confirmPassword, set: setConfirmPassword, key: 'confirm' },
          ].map(({ lbl, val, set, key }) => (
            <div key={key} style={{ marginBottom: 16, position: 'relative' }}>
              <div style={label}>{lbl}</div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd[key] ? 'text' : 'password'}
                  value={val}
                  onChange={e => set(e.target.value)}
                  style={{ ...inputStyle(), paddingRight: 42, marginBottom: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => ({ ...p, [key]: !p[key] }))}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: G.slateD, padding: 0,
                  }}
                >{showPwd[key] ? <FaEyeSlash size={14} /> : <FaEye size={14} />}</button>
              </div>
            </div>
          ))}
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p style={{ color: G.red, fontSize: '0.8rem', margin: '0 0 12px' }}>Passwords do not match</p>
          )}
          <button style={primaryBtn} onClick={handlePasswordChange}><FaKey size={13} /> Update Password</button>
        </div>

        {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(a => ({ ...a, show: false }))} />}
      </div>
    </div>
  );
};

export default Profile;
