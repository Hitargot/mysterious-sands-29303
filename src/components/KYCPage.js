/**
 * KYCPage.js - dark navy/gold redesign
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Alert from './Alert';
import Spinner from './Spinner';
import { FaCheckCircle, FaIdCard, FaHashtag, FaFileImage, FaCamera, FaClipboardList, FaUpload, FaChevronLeft, FaChevronRight, FaPaperPlane, FaClock, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

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
  borderRadius: 18,
  padding: '28px 32px',
};

const primaryBtn = (disabled = false) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  background: disabled ? G.navy4 : `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
  color: disabled ? G.slateD : G.navy,
  border: disabled ? `1px solid rgba(148,163,184,0.15)` : 'none',
  borderRadius: 12, padding: '12px 28px',
  fontWeight: 700, fontSize: '0.92rem', cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'opacity 0.2s',
});

const outlineBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  background: 'transparent', border: `1px solid ${G.goldBorder}`,
  color: G.slate, borderRadius: 12, padding: '12px 22px',
  fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer',
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: G.navy3, border: `1px solid ${G.goldBorder}`,
  borderRadius: 10, color: G.white, padding: '12px 16px',
  fontSize: '0.92rem', outline: 'none',
};

/* 鈹€鈹€鈹€ Constants 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
const ID_TYPES = [
  { value: 'nin',             label: 'NIN',                    hint: '11-digit National Identification Number' },
  { value: 'bvn',             label: 'BVN',                    hint: '11-digit Bank Verification Number' },
  { value: 'passport',        label: 'International Passport',  hint: 'Passport number (e.g. A12345678)' },
  { value: 'drivers_license', label: "Driver's License",        hint: "Driver's license number" },
];

const TOTAL_STEPS = 4;

const STEP_META = [
  { label: 'ID Type',     icon: <FaIdCard /> },
  { label: 'ID Number',   icon: <FaHashtag /> },
  { label: 'Document',    icon: <FaFileImage /> },
  { label: 'Selfie',      icon: <FaCamera /> },
];

function getToken() {
  return localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || '';
}

/* 鈹€鈹€鈹€ Status Card 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
const ID_TYPE_LABELS = { nin: 'NIN (National ID)', bvn: 'BVN', passport: 'International Passport', drivers_license: "Driver's License" };

const StatusCard = ({ status, kyc, alert: alertState, closeAlert }) => {
  const isApproved = status === 'approved';
  const isPending  = status === 'pending';

  const color      = isApproved ? G.green     : G.goldLight;
  const faint      = isApproved ? G.greenFaint : G.amberFaint;
  const borderCol  = isApproved ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)';

  const idTypeLabel   = kyc?.idType ? (ID_TYPE_LABELS[kyc.idType] || kyc.idType) : null;
  const submittedDate = kyc?.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const approvedDate  = kyc?.reviewedAt  ? new Date(kyc.reviewedAt).toLocaleDateString(undefined,  { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return (
    <div style={{ minHeight: '100vh', background: G.navy, padding: '28px 20px', boxSizing: 'border-box', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        {alertState?.show && <Alert message={alertState.message} type={alertState.type} onClose={closeAlert} />}

        <div style={{ ...card, borderColor: borderCol, textAlign: 'center' }}>

          {/* Icon */}
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: faint, border: `2px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', fontSize: '2rem', color,
          }}>
            {isApproved ? <FaShieldAlt /> : <FaClock />}
          </div>

          {/* Badge */}
          <span style={{
            display: 'inline-block', background: faint, color,
            border: `1px solid ${color}44`, borderRadius: 20,
            padding: '3px 14px', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14,
          }}>
            {isApproved ? '✓  KYC Approved' : '⏳  Under Review'}
          </span>

          {/* Headline */}
          <h2 style={{ margin: '0 0 10px', fontSize: '1.3rem', fontWeight: 700, color: G.white }}>
            {isApproved ? 'Identity Verified' : 'KYC Submitted Successfully'}
          </h2>
          <p style={{ color: G.slate, fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 24px' }}>
            {isApproved
              ? 'Your identity has been verified. You now have full access to all platform features, including large withdrawals.'
              : 'Your documents are being reviewed by our team. You will be notified once the review is complete — no action required.'}
          </p>

          {/* Info tiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {idTypeLabel && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: '11px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <FaIdCard style={{ color: G.slateD, fontSize: 15 }} />
                  <span style={{ color: G.slateD, fontSize: '0.79rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ID Type</span>
                </div>
                <span style={{ color: G.white, fontSize: '0.87rem', fontWeight: 600 }}>{idTypeLabel}</span>
              </div>
            )}

            {kyc?.idNumber && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: '11px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <FaHashtag style={{ color: G.slateD, fontSize: 14 }} />
                  <span style={{ color: G.slateD, fontSize: '0.79rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ID Number</span>
                </div>
                <span style={{ color: G.white, fontSize: '0.87rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                  {'•'.repeat(Math.max(0, kyc.idNumber.length - 4))}{kyc.idNumber.slice(-4)}
                </span>
              </div>
            )}

            {submittedDate && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: '11px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <FaClock style={{ color: G.slateD, fontSize: 14 }} />
                  <span style={{ color: G.slateD, fontSize: '0.79rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Submitted</span>
                </div>
                <span style={{ color: G.white, fontSize: '0.87rem' }}>{submittedDate}</span>
              </div>
            )}

            {isApproved && approvedDate && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: G.greenFaint, borderRadius: 10, border: 'rgba(52,211,153,0.2)', padding: '11px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <FaCheckCircle style={{ color: G.green, fontSize: 14 }} />
                  <span style={{ color: G.slateD, fontSize: '0.79rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Approved On</span>
                </div>
                <span style={{ color: G.green, fontSize: '0.87rem', fontWeight: 700 }}>{approvedDate}</span>
              </div>
            )}
          </div>

          {/* Pending — what happens next */}
          {isPending && (
            <div style={{ marginTop: 20, background: G.goldFaint, borderRadius: 10, border: `1px solid ${G.goldBorder}`, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
              <FaExclamationTriangle style={{ color: G.goldLight, fontSize: 14, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ color: G.goldLight, fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>What happens next?</div>
                <ul style={{ margin: 0, paddingLeft: 14, color: G.slate, fontSize: '0.8rem', lineHeight: 1.7 }}>
                  <li>Review usually completes within <span style={{ color: G.white }}>24–48 hours</span></li>
                  <li>You'll be <span style={{ color: G.white }}>notified automatically</span> once a decision is made</li>
                  <li>No further action needed — <span style={{ color: G.white }}>sit tight!</span></li>
                </ul>
              </div>
            </div>
          )}

          {/* Approved — benefits */}
          {isApproved && (
            <div style={{ marginTop: 20, background: G.greenFaint, borderRadius: 10, border: '1px solid rgba(52,211,153,0.2)', padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
              <FaShieldAlt style={{ color: G.green, fontSize: 16, marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ color: G.green, fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>What's unlocked for you</div>
                <ul style={{ margin: 0, paddingLeft: 14, color: G.slate, fontSize: '0.8rem', lineHeight: 1.7 }}>
                  <li>Withdrawals over <span style={{ color: G.white }}>₦100,000</span> are now available</li>
                  <li>Full access to all <span style={{ color: G.white }}>trading features</span></li>
                  <li>Higher <span style={{ color: G.white }}>transaction limits</span> on your account</li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* 鈹€鈹€鈹€ Main Component 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
const KYCPage = () => {
  const apiUrl = process.env.REACT_APP_API_URL || '';

  const [kycStatus, setKycStatus]         = useState(null);
  const [kyc, setKyc]                     = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [step, setStep]                   = useState(1);
  const [idType, setIdType]               = useState('');
  const [idNumber, setIdNumber]           = useState('');
  const [docFile, setDocFile]             = useState(null);
  const [selfieFile, setSelfieFile]       = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [alert, setAlert]                 = useState({ message: '', type: '', show: false });

  const docInputRef    = useRef(null);
  const selfieInputRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/kyc/status`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = res.data?.kyc || { status: 'none' };
      setKyc(data);
      setKycStatus(data.status || 'none');
    } catch {
      setKycStatus('none');
      setKyc({ status: 'none' });
    } finally {
      setStatusLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const showAlert  = (message, type = 'error') => setAlert({ message, type, show: true });
  const closeAlert = () => setAlert(a => ({ ...a, show: false }));

  const handleFilePick = (e, setter) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showAlert('File too large. Max 10 MB.'); return; }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) { showAlert('Unsupported file type. Use JPG, PNG, WEBP or PDF.'); return; }
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setter({ file, preview, name: file.name });
  };

  const canNext = () => {
    if (step === 1) return !!idType;
    if (step === 2) return idNumber.trim().length >= 5;
    if (step === 3) return !!docFile;
    if (step === 4) return !!selfieFile;
    return true;
  };

  const nextStep = () => { if (canNext()) setStep(s => s + 1); };
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!idType || !idNumber || !docFile || !selfieFile) { showAlert('Please complete all steps.'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('idType',   idType);
      formData.append('idNumber', idNumber.trim());
      formData.append('document', docFile.file);
      formData.append('selfie',   selfieFile.file);
      const res = await axios.post(`${apiUrl}/api/kyc/submit`, formData, {
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      const { autoVerified, kyc: returnedKyc } = res.data || {};
      if (autoVerified) {
        setKycStatus('approved');
        setKyc({ ...(returnedKyc || {}), status: 'approved' });
        showAlert('Your identity was verified automatically. KYC approved!', 'success');
      } else {
        setKycStatus('pending');
        setKyc({ ...(returnedKyc || {}), status: 'pending', submittedAt: new Date().toISOString() });
        showAlert("KYC submitted! We'll review your documents within 24\u201348 hours.", 'success');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* 鈹€鈹€ Loading 鈹€鈹€ */
  if (statusLoading) {
    return (
      <div style={{ minHeight: '100vh', background: G.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    );
  }

  /* 鈹€鈹€ Approved / Pending 鈹€鈹€ */
  if (kycStatus === 'approved' || kycStatus === 'pending') {
    return <StatusCard status={kycStatus} kyc={kyc} alert={alert} closeAlert={closeAlert} />;
  }

  /* 鈹€鈹€ Form (none / rejected) 鈹€鈹€ */
  const isRejected = kycStatus === 'rejected';
  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div style={{ minHeight: '100vh', background: G.navy, padding: '28px 20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {alert.show && <Alert message={alert.message} type={alert.type} onClose={closeAlert} />}

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: G.white }}>Identity Verification (KYC)</h2>
          <p style={{ margin: '6px 0 0', color: G.slate, fontSize: '0.85rem', lineHeight: 1.5 }}>
            Verify your identity to unlock large withdrawals (&#8358;100,000+) and build platform trust.
          </p>
        </div>

        {/* Rejected banner */}
        {isRejected && (
          <div style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: G.redFaint, border: `1px solid ${G.red}44`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>&#10060;</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: G.red, fontSize: '0.9rem' }}>Previous submission rejected</p>
              {kyc?.rejectionReason && <p style={{ margin: '4px 0 0', color: G.red, fontSize: '0.82rem' }}>{kyc.rejectionReason}</p>}
              <p style={{ margin: '4px 0 0', color: '#FCA5A5', fontSize: '0.82rem' }}>Please correct the issues and resubmit.</p>
            </div>
          </div>
        )}

        {/* Step Indicators */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
            {/* connector line */}
            <div style={{
              position: 'absolute', top: 18, left: '10%', right: '10%', height: 2,
              background: G.navy4, zIndex: 0,
            }} />
            <div style={{
              position: 'absolute', top: 18, left: '10%', height: 2, zIndex: 1,
              background: `linear-gradient(90deg, ${G.gold}, ${G.goldLight})`,
              width: `${Math.min(progress, 80)}%`, transition: 'width 0.4s ease',
            }} />
            {STEP_META.map((s, i) => {
              const done   = step > i + 1;
              const active = step === i + 1;
              return (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: done ? G.green : active ? G.gold : G.navy4,
                    border: `2px solid ${done ? G.green : active ? G.gold : 'rgba(148,163,184,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: done || active ? G.navy : G.slateD,
                    fontSize: done ? '0.85rem' : '0.8rem',
                    transition: 'all 0.3s',
                    fontWeight: 700,
                  }}>
                    {done ? <FaCheckCircle size={14} /> : i + 1}
                  </div>
                  <span style={{
                    marginTop: 6, fontSize: '0.7rem', textAlign: 'center',
                    color: active ? G.gold : done ? G.green : G.slateD,
                    fontWeight: active ? 700 : 400,
                  }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Panel */}
        <div style={card}>

          {/* Step 1 — Select ID Type */}
          {step === 1 && (
            <div>
              <h3 style={{ margin: '0 0 6px', color: G.white, fontSize: '1.05rem', fontWeight: 700 }}>
                Step 1 — Select your ID type
              </h3>
              <p style={{ margin: '0 0 20px', color: G.slate, fontSize: '0.85rem' }}>
                Choose the government-issued ID you will use for verification.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ID_TYPES.map(({ value, label, hint }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setIdType(value)}
                    style={{
                      background: idType === value ? G.goldFaint : G.navy4,
                      border: `2px solid ${idType === value ? G.gold : 'rgba(148,163,184,0.1)'}`,
                      borderRadius: 12, padding: '14px 16px',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: idType === value ? G.gold : G.white, fontSize: '0.9rem', marginBottom: 4 }}>{label}</div>
                    <div style={{ color: G.slateD, fontSize: '0.76rem', lineHeight: 1.4 }}>{hint}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — ID Number */}
          {step === 2 && (
            <div>
              <h3 style={{ margin: '0 0 6px', color: G.white, fontSize: '1.05rem', fontWeight: 700 }}>
                Step 2 — Enter your ID number
              </h3>
              <p style={{ margin: '0 0 20px', color: G.slate, fontSize: '0.85rem' }}>
                {ID_TYPES.find(t => t.value === idType)?.hint || 'Enter your ID number exactly as it appears.'}
              </p>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: '0.72rem', color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  {ID_TYPES.find(t => t.value === idType)?.label} Number
                </div>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Enter ID number"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  maxLength={30}
                  autoFocus
                />
              </div>
              {idNumber.trim().length > 0 && idNumber.trim().length < 5 && (
                <p style={{ margin: '6px 0 0', color: G.red, fontSize: '0.78rem' }}>ID number seems too short. Please double-check.</p>
              )}
            </div>
          )}

          {/* Step 3 — Upload Document */}
          {step === 3 && (
            <div>
              <h3 style={{ margin: '0 0 6px', color: G.white, fontSize: '1.05rem', fontWeight: 700 }}>
                Step 3 — Upload your ID document
              </h3>
              <p style={{ margin: '0 0 20px', color: G.slate, fontSize: '0.85rem' }}>
                Take a clear photo of your {ID_TYPES.find(t => t.value === idType)?.label || 'ID'}. All text must be readable. (JPG, PNG, WEBP, PDF — max 10 MB)
              </p>
              <input
                ref={docInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                style={{ display: 'none' }}
                onChange={e => handleFilePick(e, setDocFile)}
              />
              <div
                onClick={() => docInputRef.current?.click()}
                style={{
                  border: `2px dashed ${docFile ? G.gold : G.goldBorder}`,
                  borderRadius: 14, padding: '32px 20px', textAlign: 'center',
                  cursor: 'pointer', background: docFile ? G.goldFaint : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {docFile ? (
                  <div>
                    {docFile.preview
                      ? <img src={docFile.preview} alt="ID preview" style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
                      : <div style={{ color: G.slate, fontSize: '0.9rem', marginBottom: 8 }}>&#128196; {docFile.name}</div>}
                    <p style={{ margin: '10px 0 0', color: G.gold, fontSize: '0.8rem' }}>Click to replace</p>
                  </div>
                ) : (
                  <div>
                    <FaUpload size={28} style={{ color: G.slateD, marginBottom: 10 }} />
                    <p style={{ margin: 0, color: G.slate, fontSize: '0.9rem' }}>Click to upload your ID document</p>
                    <p style={{ margin: '4px 0 0', color: G.slateD, fontSize: '0.78rem' }}>JPG, PNG, WEBP or PDF</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4 — Selfie */}
          {step === 4 && (
            <div>
              <h3 style={{ margin: '0 0 6px', color: G.white, fontSize: '1.05rem', fontWeight: 700 }}>
                Step 4 — Take a selfie
              </h3>
              <p style={{ margin: '0 0 20px', color: G.slate, fontSize: '0.85rem' }}>
                Upload a clear, recent photo of your face. Make sure your face is fully visible and well-lit. (JPG, PNG, WEBP — max 10 MB)
              </p>
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={e => handleFilePick(e, setSelfieFile)}
              />
              <div
                onClick={() => selfieInputRef.current?.click()}
                style={{
                  border: `2px dashed ${selfieFile ? G.gold : G.goldBorder}`,
                  borderRadius: 14, padding: '32px 20px', textAlign: 'center',
                  cursor: 'pointer', background: selfieFile ? G.goldFaint : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {selfieFile ? (
                  <div>
                    {selfieFile.preview
                      ? <img src={selfieFile.preview} alt="Selfie preview" style={{ maxHeight: 180, maxWidth: '100%', borderRadius: '50%', objectFit: 'cover', width: 160, height: 160 }} />
                      : <div style={{ color: G.slate, fontSize: '0.9rem', marginBottom: 8 }}>&#129315; {selfieFile.name}</div>}
                    <p style={{ margin: '10px 0 0', color: G.gold, fontSize: '0.8rem' }}>Click to replace</p>
                  </div>
                ) : (
                  <div>
                    <FaCamera size={28} style={{ color: G.slateD, marginBottom: 10 }} />
                    <p style={{ margin: 0, color: G.slate, fontSize: '0.9rem' }}>Click to upload your selfie</p>
                    <p style={{ margin: '4px 0 0', color: G.slateD, fontSize: '0.78rem' }}>JPG, PNG or WEBP</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5 — Review */}
          {step === 5 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <FaClipboardList style={{ color: G.gold }} />
                <h3 style={{ margin: 0, color: G.white, fontSize: '1.05rem', fontWeight: 700 }}>Review & Submit</h3>
              </div>
              <p style={{ margin: '0 0 20px', color: G.slate, fontSize: '0.85rem' }}>Please review your details before submitting.</p>

              <div style={{ background: G.navy4, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                {[
                  { label: 'ID Type', value: ID_TYPES.find(t => t.value === idType)?.label || idType },
                  { label: 'ID Number', value: idNumber },
                  {
                    label: 'ID Document', value: docFile?.preview
                      ? <img src={docFile.preview} alt="doc" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                      : docFile?.name || 'N/A'
                  },
                  {
                    label: 'Selfie', value: selfieFile?.preview
                      ? <img src={selfieFile.preview} alt="selfie" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%' }} />
                      : selfieFile?.name || 'N/A'
                  },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', gap: 12,
                    borderBottom: i < arr.length - 1 ? `1px solid rgba(245,166,35,0.08)` : 'none',
                  }}>
                    <span style={{ color: G.slateD, fontSize: '0.82rem', flexShrink: 0 }}>{label}</span>
                    <span style={{ color: G.white, fontSize: '0.88rem', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                background: G.amberFaint, border: `1px solid ${G.goldBorder}`,
                borderRadius: 10, padding: '12px 14px', marginBottom: 22,
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>&#8505;&#65039;</span>
                <span style={{ color: G.slate, fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Your documents are transmitted securely and used only for identity verification.
                  Processing takes 24\u201348 hours. You will be notified by email.
                </span>
              </div>

              <button style={primaryBtn(submitting)} onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><Spinner size={14} /> Submitting...</> : <><FaPaperPlane size={13} /> Submit KYC</>}
              </button>
            </div>
          )}

          {/* Navigation */}
          {step <= TOTAL_STEPS && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
              {step > 1
                ? <button style={outlineBtn} onClick={prevStep} disabled={submitting}><FaChevronLeft size={12} /> Back</button>
                : <div />}
              <button style={primaryBtn(!canNext() || submitting)} onClick={nextStep} disabled={!canNext() || submitting}>
                {step === TOTAL_STEPS ? 'Review' : 'Next'} <FaChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCPage;
