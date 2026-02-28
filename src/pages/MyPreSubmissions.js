import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Alert from '../components/Alert';
import PreSubmissionGuideline from '../components/PreSubmissionGuideline';
import { FaListAlt, FaSearch, FaRegCopy, FaCheckCircle } from 'react-icons/fa';

// ── Design tokens ──────────────────────────────────────────────────────────────
const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.25)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
  greenFaint: 'rgba(52,211,153,0.12)', redFaint: 'rgba(248,113,113,0.12)',
};

// Shared modal styles
const modalOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
};
const modalBox = {
  background: G.navy2, border: `1px solid ${G.goldBorder}`, borderRadius: 20,
  padding: '28px 24px', width: 'min(460px,92%)',
  boxShadow: '0 0 40px rgba(245,166,35,0.12)',
  position: 'relative', overflow: 'hidden',
};

const inputStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 10,
  border: `1px solid ${G.goldBorder}`, background: G.navy3,
  color: G.white, fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const btnGold = {
  background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
  color: G.navy, border: 'none', padding: '10px 18px', borderRadius: 10,
  cursor: 'pointer', fontWeight: 700, fontSize: 14,
};
const btnOutline = {
  background: 'transparent', color: G.gold,
  border: `1px solid ${G.goldBorder}`, padding: '10px 18px', borderRadius: 10,
  cursor: 'pointer', fontWeight: 600, fontSize: 14,
};

// Status badge colours
const statusColor = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'completed') return { bg: G.greenFaint, color: G.green };
  if (v === 'cancelled') return { bg: G.redFaint, color: G.red };
  return { bg: G.goldFaint, color: G.gold }; // pending / default
};

const MyPreSubmissions = () => {
  const [preSubs, setPreSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [completeAmount, setCompleteAmount] = useState('');
  const [completeFiles, setCompleteFiles] = useState([]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [modalPre, setModalPre] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalDetailPre, setModalDetailPre] = useState(null);
  const displayPreId = (p) => {
    // prefer human-friendly preId when available, otherwise fall back to Mongo _id or generated value
  if (p?.preId) return p.preId;
  const id = p?._id || p?.id || null;
  if (id) return String(id);
    const userPart = (p?.username || 'unknown').replace(/\s+/g, '').toLowerCase();
    const suffix = String(new Date(p?.createdAt || Date.now()).getTime()).slice(-6);
    return `pre-${userPart}-${suffix}`;
  };

  const timersRef = useRef({});

  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const apiUrl = process.env.REACT_APP_API_URL;

  const getToken = () => localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const computeRemainingMs = useCallback((createdAt, days) => {
    const created = new Date(createdAt).getTime();
    const target = created + (days || 1) * 24 * 60 * 60 * 1000;
    return Math.max(0, target - Date.now());
  }, []);

  const startTimerFor = useCallback((p) => {
    if (!p || !p._id) return;
    if (timersRef.current[p._id]) {
      clearInterval(timersRef.current[p._id]);
    }
    timersRef.current[p._id] = setInterval(() => {
      setPreSubs((prev) => prev.map((it) => {
        if (it._id !== p._id) return it;
        const remainingMs = computeRemainingMs(it.createdAt, it.selectedDays || 1);
        return { ...it, remainingMs };
      }));
    }, 1000);
  }, [computeRemainingMs]);

  useEffect(() => {
    const timersSnapshot = timersRef.current; // copy ref for stable cleanup

    const fetchList = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const res = await axios.get(`${apiUrl}/api/pre-submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const items = res.data?.preSubmissions || res.data || [];

        // attach selectedDays (persisted per id)
        const itemsWithDays = items.map((p) => ({
          ...p,
          selectedDays: getPersistedDays(p._id) || 1,
          remainingMs: computeRemainingMs(p.createdAt, getPersistedDays(p._id) || 1),
        }));

        setPreSubs(itemsWithDays);
        // start timers
        itemsWithDays.forEach((p) => startTimerFor(p));
      } catch (err) {
        console.error('Failed to fetch pre-submissions', err?.response?.data || err.message);
        showAlert('Failed to load your pre-submissions.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchList();

    return () => {
      // clear intervals from the snapshot
      Object.values(timersSnapshot).forEach((id) => clearInterval(id));
    };
  }, [refreshKey, apiUrl, computeRemainingMs, startTimerFor]);

  const getPersistedDays = (id) => {
    try {
      const v = localStorage.getItem(`preSubmissionWaitDays_${id}`);
      return v ? Number(v) : null;
    } catch (e) {
      return null;
    }
  };

  const formatMs = (ms) => {
    if (ms <= 0) return 'Available';
    const s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  

  

  

  const submitComplete = async () => {
    if (!completeAmount || Number(completeAmount) <= 0) return showAlert('Please provide a valid amount.', 'error');
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('amount', String(Number(completeAmount)));
      completeFiles.forEach(f => formData.append('files', f));
      // optional note could be added
      const res = await axios.post(`${apiUrl}/api/pre-submissions/${completingId}/complete`, formData, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success) {
        showAlert('Pre-submission completed and confirmation created.', 'success');
        setCompletingId(null);
        setRefreshKey(k => k + 1);
      } else {
        showAlert(res.data?.message || 'Failed to complete.', 'error');
      }
    } catch (err) {
      console.error('Complete error', err?.response?.data || err.message);
      showAlert(err?.response?.data?.message || 'Error completing pre-submission', 'error');
    }
  };

  // computed view with search & filter
  const filteredPreSubs = useMemo(() => {
    const q = String(searchTerm || '').trim().toLowerCase();
    return preSubs.filter((p) => {
      if (statusFilter !== 'all' && String(p.status || '').toLowerCase() !== statusFilter) return false;
      if (!q) return true;
      return [p.username, p.serviceId?.name, p._id, p.status].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [preSubs, searchTerm, statusFilter]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? 12 : '8px 4px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(245,166,35,0.35)',
        }}>
          <FaListAlt style={{ color: G.navy, fontSize: 20 }} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: G.white, fontSize: 20, fontWeight: 700 }}>My Pre-submissions</h2>
          <div style={{ color: G.slateD, fontSize: 13 }}>Manage your pending withdrawal pre-submissions</div>
        </div>
      </div>

      {/* Search + filter row */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14,
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        <div style={{ position: 'relative', flex: 1, width: isMobile ? '100%' : 'auto' }}>
          <FaSearch style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: G.slateD, fontSize: 13, pointerEvents: 'none',
          }} />
          <input
            placeholder="Search by account, service or id"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 34, width: isMobile ? '100%' : 260 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            ...inputStyle, width: isMobile ? '100%' : 'auto', padding: '10px 14px',
            appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div style={{ color: G.slateD, fontSize: 13, whiteSpace: 'nowrap' }}>
          {loading ? 'Loading...' : `${preSubs.length} total`}
        </div>
      </div>

      <PreSubmissionGuideline />
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      {loading && (
        <div style={{ padding: 32, textAlign: 'center', color: G.slateD }}>Loading your pre-submissions...</div>
      )}

      {!loading && filteredPreSubs.length === 0 && (
        <div style={{
          padding: 32, borderRadius: 14, border: `1px dashed ${G.goldBorder}`,
          textAlign: 'center', color: G.slateD, background: G.goldFaint,
        }}>
          <div style={{ fontSize: 18, marginBottom: 8, color: G.slate }}>No pre-submissions found</div>
          <div style={{ marginBottom: 14, fontSize: 14 }}>You don't have any active pre-submissions right now.</div>
          <button onClick={() => setRefreshKey(k => k + 1)} style={btnGold}>Refresh</button>
        </div>
      )}

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
        {filteredPreSubs.map((p) => {
          const sb = statusColor(p.status);
          return (
            <div key={p._id} style={{
              background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(14px)',
              border: `1px solid ${G.goldBorder}`, borderRadius: 14,
              padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {/* Card top row: avatar + username + status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: G.gold, fontSize: 16,
                  }}>
                    {(p.username || '').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: G.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.username}</div>
                    <div style={{ fontSize: 12, color: G.slateD }}>ID: {displayPreId(p)}</div>
                  </div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: sb.bg, color: sb.color, whiteSpace: 'nowrap',
                }}>
                  {p.status || 'Pending'}
                </span>
              </div>

              {/* Card info row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13, color: G.slateD }}>
                  <div><span style={{ color: G.slate }}>Files:</span> {(p.fileUrls && p.fileUrls.length) || 0}</div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: G.slate }}>Available in:</span>{' '}
                    <span style={{ color: Number(p.remainingMs || 0) <= 0 ? G.green : G.gold, fontWeight: 600 }}>
                      {formatMs(p.remainingMs)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(p.fileUrls && p.fileUrls.length > 0) && (
                  <button
                    onClick={() => { setModalPre(p); setModalDetailPre(p); setShowDetailsModal(true); }}
                    style={{ ...btnOutline, padding: '7px 14px', fontSize: 13, flex: isMobile ? 1 : undefined }}
                  >
                    View
                  </button>
                )}
                {p.status !== 'Cancelled' && p.status !== 'Completed' && (
                  <>
                    {Number(p.remainingMs || 0) <= 0 && (
                      <button
                        onClick={() => { setModalPre(p); setShowCompleteModal(true); setCompleteAmount(''); setCompleteFiles([]); }}
                        style={{ ...btnGold, padding: '7px 14px', fontSize: 13, flex: isMobile ? 1 : undefined }}
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => { setModalPre(p); setShowCancelModal(true); }}
                      style={{ ...btnOutline, padding: '7px 14px', fontSize: 13, flex: isMobile ? 1 : undefined }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showCompleteModal && modalPre && (
        <CompleteModal
          pre={modalPre}
          amount={completeAmount}
          setAmount={setCompleteAmount}
          files={completeFiles}
          setFiles={setCompleteFiles}
          onClose={() => { setShowCompleteModal(false); setModalPre(null); setCompletingId(null); }}
          onSubmit={async () => {
            setCompletingId(modalPre._id);
            await submitComplete();
            setShowCompleteModal(false);
            setModalPre(null);
          }}
        />
      )}

      {showCancelModal && modalPre && (
        <CancelModal
          pre={modalPre}
          onClose={() => { setShowCancelModal(false); setModalPre(null); }}
          onConfirm={async (reason) => {
            try {
              const token = getToken();
              const res = await axios.post(`${apiUrl}/api/pre-submissions/${modalPre._id}/cancel`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
              if (res.data?.success) {
                showAlert('Pre-submission cancelled.', 'success');
                setRefreshKey(k => k + 1);
              } else {
                showAlert(res.data?.message || 'Failed to cancel.', 'error');
              }
            } catch (err) {
              console.error('Cancel error', err?.response?.data || err.message);
              showAlert(err?.response?.data?.message || 'Error cancelling pre-submission', 'error');
            } finally {
              setShowCancelModal(false);
              setModalPre(null);
            }
          }}
        />
      )}

      {showDetailsModal && modalDetailPre && (
        <DetailsModal
          pre={modalDetailPre}
          onClose={() => { setShowDetailsModal(false); setModalDetailPre(null); setModalPre(null); }}
          onPreIdGenerated={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
};

export default MyPreSubmissions;

const CompleteModal = ({ pre, amount, setAmount, files, setFiles, onClose, onSubmit }) => {
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const el = (
    <div style={modalOverlay}>
      <div style={modalBox}>
        {/* Gold top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${G.gold},${G.goldLight})` }} />
        <h3 style={{ marginTop: 4, marginBottom: 12, color: G.gold, fontSize: 17, fontWeight: 700 }}>Complete Pre-submission</h3>
        <div style={{ marginBottom: 12, color: G.slateD, fontSize: 13 }}>
          Completing will create a confirmation that the withdrawal was processed. Provide the amount and any proof files.
        </div>
        <div style={{ marginBottom: 12, fontSize: 14 }}>
          <div style={{ color: G.slate }}><strong style={{ color: G.white }}>Account:</strong> {pre.username}</div>
          <div style={{ color: G.slate, marginTop: 4 }}><strong style={{ color: G.white }}>Service:</strong> {pre.serviceId?.name || pre.serviceId}</div>
          {pre?.serviceTag && <div style={{ color: G.slate, marginTop: 4 }}><strong style={{ color: G.white }}>Tag:</strong> {pre.serviceTag}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', color: G.slate, fontSize: 13, marginBottom: 5 }}>Amount (required)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} placeholder="0.00" />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', color: G.slate, fontSize: 13, marginBottom: 5 }}>Upload files (optional)</label>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))}
            style={{ color: G.slate, fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', gap: 10, flexDirection: mobile ? 'column' : 'row' }}>
          <button onClick={onSubmit} style={{ ...btnGold, flex: 1 }}>Submit</button>
          <button onClick={onClose} style={{ ...btnOutline, flex: 1 }}>Close</button>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(el, document.body);
};

const CancelModal = ({ pre, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const el = (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${G.red},#f87171cc)` }} />
        <h3 style={{ marginTop: 4, marginBottom: 12, color: G.red, fontSize: 17, fontWeight: 700 }}>Cancel Pre-submission</h3>
        <div style={{ marginBottom: 8, color: G.slate, fontSize: 14 }}>
          Please provide a short reason for cancelling the pre-submission for{' '}
          <strong style={{ color: G.white }}>{pre.username}</strong>.
        </div>
        <div style={{ marginBottom: 8, fontSize: 13, color: G.slateD }}>
          Cancelling will stop any further processing and remove it from your active list.
        </div>
        <div style={{ marginBottom: 18 }}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              ...inputStyle, minHeight: 80, resize: 'vertical',
              fontFamily: 'inherit', padding: '10px 13px',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, flexDirection: mobile ? 'column' : 'row' }}>
          <button onClick={() => onConfirm(reason)} style={{ ...btnGold, flex: 1, background: G.red, boxShadow: 'none' }}>Confirm Cancel</button>
          <button onClick={onClose} style={{ ...btnOutline, flex: 1 }}>Back</button>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(el, document.body);
};

const DetailsModal = ({ pre, onClose }) => {
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const apiBase = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/$/, '') : '';
  const [copied, setCopied] = useState(false);
  const [signedUrls, setSignedUrls] = useState({});
  const [signingLoading, setSigningLoading] = useState({});

  const getTokenForApi = () => localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

  const fetchSignedUrl = async (f) => {
    try {
      if (!f) return '';
      if (/^https?:\/\//i.test(String(f))) return String(f);
      if (signedUrls[f]) return signedUrls[f];
      if (signingLoading[f]) return null;
      setSigningLoading(s => ({ ...s, [f]: true }));
      const token = getTokenForApi();
      const name = String(f).split('/').pop();
      const url = `${apiBase}/api/uploads/${encodeURIComponent(name)}/signed`;
      const res = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = res.data || {};
      const signed = data.url || data?.signedUrl || null;
      if (signed) setSignedUrls(s => ({ ...s, [f]: signed }));
      setSigningLoading(s => ({ ...s, [f]: false }));
      return signed;
    } catch (e) {
      setSigningLoading(s => ({ ...s, [f]: false }));
      try {
        let base = apiBase || '';
        if (base && /^https:\/\//i.test(base) && base.includes('localhost')) base = base.replace(/^https:\/\//i, 'http://');
        const fallback = base + (String(f).startsWith('/') ? f : '/' + f);
        setSignedUrls(s => ({ ...s, [f]: fallback }));
        return fallback;
      } catch (err) { return ''; }
    }
  };

  useEffect(() => {
    if (!pre || !pre.fileUrls || !pre.fileUrls.length) return;
    pre.fileUrls.forEach((f) => {
      if (!f) return;
      if (/^https?:\/\//i.test(String(f))) return;
      if (!signedUrls[f] && !signingLoading[f]) fetchSignedUrl(f).catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pre]);

  const copyId = async () => {
    try {
      const id = pre?._id || pre?.id || '';
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch (e) {}
  };

  const fileUrl = (fRaw) => {
    const f = String(fRaw || '').trim();
    if (!f) return '';
    if (/^https?:\/\//i.test(f)) {
      if (/^https:\/\//i.test(f) && (/localhost/i.test(f) || /127\.0\.0\.1/.test(f))) return f.replace(/^https:\/\//i, 'http://');
      return f;
    }
    if (f.startsWith(':')) {
      const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : 'localhost';
      return `http://${host}${f}`;
    }
    if (apiBase) {
      try {
        let base = String(apiBase).replace(/\/$/, '');
        if (/^https:\/\//i.test(base) && base.includes('localhost')) base = base.replace(/^https:\/\//i, 'http://');
        return base + (f.startsWith('/') ? f : '/' + f);
      } catch (e) {}
    }
    return f.startsWith('/') ? f : '/' + f;
  };

  const openAllFiles = () => {
    if (!pre?.fileUrls?.length) return;
    pre.fileUrls.forEach((f) => { try { window.open(fileUrl(f), '_blank', 'noopener'); } catch (e) {} });
  };

  const renderFile = (f, i) => {
    const u = signedUrls[f] || fileUrl(f);
    const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(String(f));
    return (
      <div key={i} style={{ width: 130, margin: 6, textAlign: 'center' }}>
        {isImage ? (
          <a href={u} target="_blank" rel="noopener noreferrer" style={{ display: 'block', position: 'relative' }}>
            <img
              src={u}
              alt={`file-${i}`}
              style={{ width: 130, height: 90, objectFit: 'cover', borderRadius: 8, border: `1px solid ${G.goldBorder}` }}
              onError={(e) => {
                try {
                  e.target.style.display = 'none';
                  const fb = e.target.parentNode?.querySelector?.('.img-fallback');
                  if (fb) fb.style.display = 'flex';
                } catch (err) {}
              }}
            />
            <div className="img-fallback" style={{
              display: 'none', width: 130, height: 90, borderRadius: 8,
              border: `1px solid ${G.goldBorder}`, background: G.navy3,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <button onClick={() => { try { window.open(u, '_blank', 'noopener'); } catch (e) {} }}
                style={{ border: 'none', background: 'transparent', color: G.gold, fontWeight: 700, cursor: 'pointer' }}>
                Open image
              </button>
            </div>
          </a>
        ) : (
          <div style={{
            width: 130, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, border: `1px solid ${G.goldBorder}`, background: G.navy3,
          }}>
            <a href={u} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: G.gold, fontWeight: 600, fontSize: 13 }}>
              &#128206; Download
            </a>
          </div>
        )}
        <div style={{ fontSize: 11, color: G.slateD, marginTop: 6, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {String(u).split('/').pop()}
        </div>
      </div>
    );
  };

  const sb = statusColor(pre?.status);

  const el = (
    <div style={modalOverlay}>
      <div style={{
        ...modalBox, maxWidth: mobile ? '92%' : 880, padding: 20,
        maxHeight: mobile ? '72vh' : '78vh', overflowY: 'auto',
      }}>
        {/* Gold top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${G.gold},${G.goldLight})` }} />

        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, marginTop: 4 }}>
          <h2 style={{ margin: 0, fontSize: 17, color: G.gold, fontWeight: 700 }}>Pre-submission Details</h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: G.slate, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            &#x2715;
          </button>
        </div>

        <div style={{ height: 1, background: G.goldBorder, marginBottom: 16 }} />

        {/* Details grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: mobile ? '1fr' : '160px 1fr',
          gap: '10px 12px', alignItems: 'start',
          background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px',
          border: `1px solid ${G.goldBorder}`,
        }}>
          <div style={{ color: G.slateD, fontSize: 13, fontWeight: 600 }}>Account:</div>
          <div style={{ color: G.white, fontWeight: 700 }}>{pre?.username || '-'}</div>

          <div style={{ color: G.slateD, fontSize: 13, fontWeight: 600 }}>ID:</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: G.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380, fontSize: 13 }}>
              {pre?.preId || pre?._id || pre?.id || '-'}
            </span>
            <button onClick={copyId} aria-label="Copy ID" title="Copy ID" style={{ border: 'none', background: 'transparent', padding: 4, cursor: 'pointer', color: copied ? G.green : G.slateD, fontSize: 16 }}>
              {copied ? <FaCheckCircle /> : <FaRegCopy />}
            </button>
            {copied && <span style={{ color: G.green, fontSize: 12 }}>Copied</span>}
          </div>

          <div style={{ color: G.slateD, fontSize: 13, fontWeight: 600 }}>Status:</div>
          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sb.bg, color: sb.color }}>
            {pre?.status || 'Pending'}
          </span>

          <div style={{ color: G.slateD, fontSize: 13, fontWeight: 600 }}>Service:</div>
          <div style={{ color: G.white }}>{pre?.serviceId?.name || pre?.serviceId || '-'}</div>

          <div style={{ color: G.slateD, fontSize: 13, fontWeight: 600 }}>Service tag:</div>
          <div style={{ color: G.white }}>{pre?.serviceTag || '-'}</div>

          <div style={{ color: G.slateD, fontSize: 13, fontWeight: 600 }}>Submitted:</div>
          <div style={{ color: G.white }}>{new Date(pre?.createdAt || Date.now()).toLocaleString()}</div>

          <div style={{ color: G.slateD, fontSize: 13, fontWeight: 600 }}>Files:</div>
          <div>
            {(!pre.fileUrls || pre.fileUrls.length === 0) ? (
              <span style={{ color: G.slateD }}>No files attached</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: -6 }}>
                {pre.fileUrls.map((f, i) => renderFile(f, i))}
              </div>
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {pre.fileUrls && pre.fileUrls.length > 1 && (
              <button onClick={openAllFiles} style={btnOutline}>Open all files</button>
            )}
            {pre.fileUrls && pre.fileUrls.length > 0 && (
              <button onClick={() => { try { window.open(fileUrl(pre.fileUrls[0]), '_blank', 'noopener'); } catch (e) {} }} style={btnOutline}>Open first file</button>
            )}
          </div>
          <button onClick={onClose} style={btnGold}>Close</button>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(el, document.body);
};
