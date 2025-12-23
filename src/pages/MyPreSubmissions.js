import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Alert from '../components/Alert';
import PreSubmissionGuideline from '../components/PreSubmissionGuideline';

// layout & theme tokens
const THEME = {
  primary: '#162660',
  muted: '#666',
  cardBg: '#fff',
  border: '#e6e6e6',
  radius: 10,
};

const containerStyle = { maxWidth: 1000, margin: '20px auto', padding: 16 };
const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 };
const headerLeft = { display: 'flex', alignItems: 'center', gap: 12 };
const searchInput = { padding: 10, borderRadius: 8, border: `1px solid ${THEME.border}`, minWidth: 200 };
const filterSelect = { padding: 8, borderRadius: 8, border: `1px solid ${THEME.border}` };

const cardGrid = (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 });
const cardStyle = { background: THEME.cardBg, padding: 14, borderRadius: THEME.radius, border: `1px solid ${THEME.border}`, boxShadow: '0 6px 18px rgba(16,24,40,0.04)' };
const cardHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 };
const actionBtn = { background: THEME.primary, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' };
const actionOutline = { background: '#fff', color: THEME.primary, border: `1px solid ${THEME.primary}`, padding: '8px 12px', borderRadius: 8, cursor: 'pointer' };

const styles = { input: { padding: 8, borderRadius: 6, border: '1px solid #ccc' } };

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
    <div style={{ ...containerStyle, padding: isMobile ? 12 : containerStyle.padding, maxWidth: isMobile ? '96%' : containerStyle.maxWidth }}>
      <div style={headerStyle}>
        <div style={headerLeft}>
          <div>
            <h2 style={{ margin: 0 }}>My Pre-submissions</h2>
            <div style={{ color: THEME.muted, fontSize: 13 }}>Manage your pending withdrawal pre-submissions</div>
          </div>
        </div>

        {/* header right removed - search & filter moved below title for better layout */}
      </div>

      {/* Search and filter row placed under the title */}
      <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 } : { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input placeholder="Search by account, service or id" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...searchInput, width: isMobile ? '100%' : searchInput.minWidth }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...filterSelect, width: isMobile ? '100%' : 'auto' }}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div style={{ minWidth: 160 }}>
          <span style={{ color: THEME.muted, fontSize: 13 }}>{loading ? 'Loading…' : `${preSubs.length} total`}</span>
        </div>
      </div>

      <PreSubmissionGuideline />
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      {loading && (
        <div style={{ padding: 24, textAlign: 'center', color: THEME.muted }}>Loading your pre-submissions…</div>
      )}

      {!loading && filteredPreSubs.length === 0 && (
        <div style={{ padding: 28, borderRadius: 12, border: `1px dashed ${THEME.border}`, textAlign: 'center', color: THEME.muted }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>No pre-submissions found</div>
          <div style={{ marginBottom: 12 }}>You don't have any active pre-submissions right now.</div>
          <div>
            <button onClick={() => setRefreshKey(k => k + 1)} style={actionBtn}>Refresh</button>
          </div>
        </div>
      )}

      <div style={cardGrid(isMobile)}>
                {filteredPreSubs.map((p) => (
          <div key={p._id} style={cardStyle}>
            <div style={cardHeader}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f3f6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: THEME.primary }}>{(p.username || '').charAt(0).toUpperCase()}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.username}</div>
                  <div style={{ fontSize: 12, color: THEME.muted }}>ID: {displayPreId(p)}</div>
                </div>
              </div>

              {/* status removed from card header per UI request */}
            </div>

            <div style={{ marginBottom: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 12, alignItems: isMobile ? 'stretch' : 'center' }}>
              <div style={{ color: THEME.muted, fontSize: 13, width: isMobile ? '100%' : 'auto' }}>
                {/* Service removed from card list view per request */}
                <div style={{ marginBottom: 8 }} />
                  <div><strong>Files:</strong> {(p.fileUrls && p.fileUrls.length) || 0}</div>
                <div style={{ marginTop: 6 }}><strong>Available in:</strong> {formatMs(p.remainingMs)}</div>
              </div>

              <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch', width: '100%' } : { display: 'flex', gap: 8, alignItems: 'center' }}>
                  {(p.fileUrls && p.fileUrls.length > 0) && (
                    <button
                      onClick={() => { setModalPre(p); setModalDetailPre(p); setShowDetailsModal(true); }}
                      style={isMobile ? { ...actionOutline, width: '100%' } : actionOutline}
                      title={p.fileUrls.length > 1 ? 'View files' : 'View file'}
                    >
                      View
                    </button>
                  )}

                {p.status !== 'Cancelled' && p.status !== 'Completed' && (
                  <>
                    {/* Only show Complete when awaiting period has elapsed */}
                    {Number(p.remainingMs || 0) <= 0 && (
                      <button onClick={() => { setModalPre(p); setShowCompleteModal(true); setCompleteAmount(''); setCompleteFiles([]); }} style={isMobile ? { ...actionBtn, width: '100%' } : actionBtn}>Complete</button>
                    )}
                    <button onClick={() => { setModalPre(p); setShowCancelModal(true); }} style={isMobile ? { ...actionOutline, width: '100%' } : actionOutline}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals are rendered below via portal */}

      {showCompleteModal && modalPre && (
        <CompleteModal
          pre={modalPre}
          amount={completeAmount}
          setAmount={setCompleteAmount}
          files={completeFiles}
          setFiles={setCompleteFiles}
          onClose={() => { setShowCompleteModal(false); setModalPre(null); setCompletingId(null); }}
          onSubmit={async () => {
            // set completingId for API
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
            // call cancel API
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
        <h3 style={{ marginTop: 0 }}>Complete Pre-submission</h3>
        <div style={{ marginBottom: 8, color: '#333' }}>
          <small>
            Completing will create a confirmation that the withdrawal was processed and mark this pre-submission as completed. Provide the amount and any proof files.
          </small>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div><strong>Account:</strong> {pre.username}</div>
          <div><strong>Service:</strong> {pre.serviceId?.name || pre.serviceId}</div>
          <div><strong>Service tag:</strong> {pre?.serviceTag || '-'}</div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Amount (required):</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} style={styles.input} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Upload files (optional):</label>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        </div>
        <div style={mobile ? { display: 'flex', flexDirection: 'column', gap: 8 } : { display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onSubmit} style={mobile ? { ...actionBtn, width: '100%' } : actionBtn}>Submit</button>
          <button onClick={onClose} style={mobile ? { ...actionOutline, width: '100%' } : actionOutline}>Close</button>
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
        <h3 style={{ marginTop: 0 }}>Cancel Pre-submission</h3>
        <div style={{ marginBottom: 8 }}>
          <div>Please provide a short reason for cancelling the pre-submission for <strong>{pre.username}</strong>.</div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
            <small>
              Cancelling will stop any further processing for this pre-submission and remove it from your active list.
            </small>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%', minHeight: 80, padding: 8 }} />
        </div>
        <div style={mobile ? { display: 'flex', flexDirection: 'column', gap: 8 } : { display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => onConfirm(reason)} style={mobile ? { ...actionBtn, width: '100%' } : actionBtn}>Confirm</button>
          <button onClick={onClose} style={mobile ? { ...actionOutline, width: '100%' } : actionOutline}>Close</button>
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
  const [signedUrls, setSignedUrls] = useState({}); // map raw file -> signed url
  const [signingLoading, setSigningLoading] = useState({});

  const getTokenForApi = () => localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

  // Request signed URLs for relative upload paths so <img> tags can load without Authorization header.
  const fetchSignedUrl = async (f) => {
    try {
      if (!f) return '';
      // if already absolute, no need for signed url
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
      // fallback: return absolute constructed URL
      try {
        let base = apiBase || '';
        if (base && /^https:\/\//i.test(base) && base.includes('localhost')) base = base.replace(/^https:\/\//i, 'http://');
        const fallback = base + (String(f).startsWith('/') ? f : '/' + f);
        setSignedUrls(s => ({ ...s, [f]: fallback }));
        return fallback;
      } catch (err) {
        return '';
      }
    }
  };

  useEffect(() => {
    // prefetch signed urls when modal opens
    if (!pre || !pre.fileUrls || !pre.fileUrls.length) return;
    pre.fileUrls.forEach((f) => {
      if (!f) return;
      if (/^https?:\/\//i.test(String(f))) return; // absolute already
      if (!signedUrls[f] && !signingLoading[f]) fetchSignedUrl(f).catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pre]);

  const copyId = async () => {
    try {
      const id = pre?._id || pre?.id || '';
      if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch (e) { /* ignore */ }
  };

  const fileUrl = (fRaw) => {
    const f = String(fRaw || '').trim();
    if (!f) return '';
    // already a full url
    if (/^https?:\/\//i.test(f)) {
      // If it's https and pointing to localhost in dev, downgrade to http to avoid SSL protocol errors
      if (/^https:\/\//i.test(f) && (/localhost/i.test(f) || /127\.0\.0\.1/.test(f))) {
        return f.replace(/^https:\/\//i, 'http://');
      }
      return f;
    }

    // handle paths that begin with a colon (e.g. ':22222/uploads/...')
    if (f.startsWith(':')) {
      const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
      // assume http for local dev ports
      return `http://${host}${f}`;
    }

    // if we have an apiBase, join it properly and fall back http for localhost dev
    if (apiBase) {
      try {
        let base = String(apiBase).replace(/\/$/, '');
        if (/^https:\/\//i.test(base) && base.includes('localhost')) {
          base = base.replace(/^https:\/\//i, 'http://');
        }
        return base + (f.startsWith('/') ? f : '/' + f);
      } catch (e) {
        // fall through to return a sane path
      }
    }

    // final fallback: ensure a leading slash
    return f.startsWith('/') ? f : '/' + f;
  };

  const openAllFiles = () => {
    if (!pre?.fileUrls || !pre.fileUrls.length) return;
    pre.fileUrls.forEach((f) => {
      const u = fileUrl(f);
      try { window.open(u, '_blank', 'noopener'); } catch (e) { /* ignore */ }
    });
  };

  const renderFile = (f, i) => {
    const u = signedUrls[f] || fileUrl(f);
    const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(String(f));
    return (
      <div key={i} style={{ width: 140, margin: 8, textAlign: 'center', transition: 'transform 160ms ease' }}>
        {isImage ? (
          <a href={u} target="_blank" rel="noopener noreferrer" style={{ display: 'block', position: 'relative' }}>
            <img
              src={u}
              alt={`file-${i}`}
              style={{ width: 140, height: 96, objectFit: 'cover', borderRadius: 8, border: `1px solid ${THEME.border}`, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}
              onError={(e) => {
                try {
                  // hide the broken image and reveal the fallback link (keeps layout stable)
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  const fb = parent && parent.querySelector && parent.querySelector('.img-fallback');
                  if (fb) fb.style.display = 'flex';
                } catch (err) { /* ignore */ }
              }}
            />
            <div className="img-fallback" style={{ display: 'none', width: 140, height: 96, borderRadius: 8, border: `1px solid ${THEME.border}`, background: '#f7f7f9', alignItems: 'center', justifyContent: 'center' }}>
              <button onClick={() => { try { window.open(u, '_blank', 'noopener'); } catch (e) {} }} style={{ border: 'none', background: 'transparent', color: THEME.primary, fontWeight: 700, cursor: 'pointer' }}>Open image</button>
            </div>
          </a>
        ) : (
          <div style={{ width: 140, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${THEME.border}`, background: '#fbfbfd', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }}>
            <a href={u} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: THEME.primary, fontWeight: 600 }}>📎 Download</a>
          </div>
        )}
        <div style={{ fontSize: 12, color: THEME.muted, marginTop: 8, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(u).split('/').pop()}</div>
      </div>
    );
  };

  const el = (
    <div style={modalOverlay}>
      <div style={{ ...modalBox, maxWidth: mobile ? '92%' : 880, padding: 18, maxHeight: mobile ? '70vh' : '75vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>Pre-submission Details</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#666' }}>✕</button>
          </div>
        </div>

        <div style={{ height: 1, background: THEME.border, marginBottom: 12, borderRadius: 2 }} />

        {/* Single column: show account/meta fields then files in a horizontal row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 6px 18px rgba(16,24,40,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '160px 1fr', gap: 8, alignItems: 'center' }}>
              <div style={{ color: THEME.muted, fontWeight: 700 }}>Account username:</div>
              <div style={{ fontWeight: 700 }}>{pre?.username || '-'}</div>

              <div style={{ color: THEME.muted, fontWeight: 700 }}>ID:</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 420 }}>{pre?.preId || pre?._id || pre?.id || '-'}</div>
                {/* small clipboard icon button for copy */}
                <button onClick={copyId} aria-label="Copy ID" title="Copy ID" style={{ border: 'none', background: 'transparent', padding: 6, cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1H4C2.89543 1 2 1.89543 2 3V17H4V3H16V1Z" fill="#162660" />
                    <path d="M20 5H8C6.89543 5 6 5.89543 6 7V21C6 22.1046 6.89543 23 8 23H20C21.1046 23 22 22.1046 22 21V7C22 5.89543 21.1046 5 20 5ZM20 21H8V7H20V21Z" fill="#162660" />
                  </svg>
                </button>
                {copied ? <div style={{ color: '#0b0', fontSize: 12 }}>Copied</div> : null}
              </div>

              <div style={{ color: THEME.muted, fontWeight: 700 }}>File:</div>
              <div>
                {(!pre.fileUrls || pre.fileUrls.length === 0) ? (
                  <div style={{ color: THEME.muted }}>No files attached</div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
                    {pre.fileUrls.map((f, i) => (
                      <div key={i} style={{ flex: '0 0 auto', display: 'inline-block' }}>
                        {renderFile(f, i)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ color: THEME.muted, fontWeight: 700 }}>Service:</div>
              <div>{pre?.serviceId?.name || pre?.serviceId || '-'}</div>

              <div style={{ color: THEME.muted, fontWeight: 700 }}>Service tag:</div>
              <div>{pre?.serviceTag || '-'}</div>

              <div style={{ color: THEME.muted, fontWeight: 700 }}>Status:</div>
              <div style={{ fontWeight: 700 }}>{pre?.status || '-'}</div>

              <div style={{ color: THEME.muted, fontWeight: 700 }}>Submitted:</div>
              <div>{new Date(pre?.createdAt || Date.now()).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {pre.fileUrls && pre.fileUrls.length > 1 ? <button onClick={openAllFiles} style={actionOutline}>Open all files</button> : null}
            {pre.fileUrls && pre.fileUrls.length ? (
              <button onClick={() => { try { window.open(fileUrl(pre.fileUrls[0]), '_blank', 'noopener'); } catch (e) {} }} style={actionOutline}>Open first file</button>
            ) : null}
          </div>

          <div>
            <button onClick={onClose} style={actionBtn}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(el, document.body);
};

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const modalBox = { background: '#fff', padding: 20, borderRadius: 8, width: 'min(720px, 92%)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' };
