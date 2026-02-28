import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Alert from '../components/Alert';
import PreSubmissionGuideline from '../components/PreSubmissionGuideline';
import { Link } from 'react-router-dom';
import { FaUpload, FaCloudUploadAlt } from 'react-icons/fa';

const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.25)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
};

const CreatePreSubmission = () => {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [username, setUsername] = useState('');
  const [waitDays, setWaitDays] = useState(1);
  const [files, setFiles] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // helper: determine if a service is a withdrawal-type service
  const isWithdrawalService = (s) => {
    if (!s) return false;
    // primary check: service name should contain withdraw or withdrawal
    const name = (s.name || s.displayName || '').toString().toLowerCase();
    if (name.includes('withdraw') || name.includes('withdrawal')) return true;
    // fallback: check some common fields (tags/type)
    const type = (s.type || s.serviceType || s.category || '').toString().toLowerCase();
    if (type.includes('withdraw')) return true;
    if (Array.isArray(s.tags) && s.tags.some((t) => String(t).toLowerCase().includes('withdraw'))) return true;
    return false;
  };

  const isBannedOrInvalid = (s) => {
    if (!s) return false;
    if (s.banned === true) return true;
    if (s.status && String(s.status).toLowerCase() === 'banned') return true;
    if (s.invalid === true) return true;
    return false;
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/services`);
        setServices(res.data || []);
      } catch (err) {
        console.error('Failed to fetch services', err?.response?.data || err.message);
        showAlert('Failed to load services. Please try again later.', 'error');
      }
    };
    fetchServices();
  }, [apiUrl]);

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.id || decoded._id || null;
    } catch (e) {
      console.error('Failed to decode token', e);
      return null;
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serviceId || !username) {
      showAlert('Please select a service and provide the account username.', 'error');
      return;
    }

    if (!files || files.length === 0) {
      showAlert('Please attach at least one file.', 'error');
      return;
    }

    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    const userId = getUserIdFromToken();
    if (!token || !userId) {
      showAlert('You must be logged in to submit a pre-submission. Please login and try again.', 'error');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('serviceId', serviceId);
      formData.append('username', username);
      formData.append('waitDays', String(waitDays));
      // backend will derive serviceTag from Service record
      files.forEach((f) => formData.append('files', f));

      const res = await axios.post(`${apiUrl}/api/pre-submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.success) {
        showAlert(`Pre-submission created. It will be available after ${waitDays} day${waitDays>1 ? 's' : ''}.`, 'success');
        // persist selected days for this pre-submission id if returned
        try {
          const created = res.data.preSubmission || res.data;
          if (created && (created._id || created.id)) {
            const id = created._id || created.id;
            localStorage.setItem(`preSubmissionWaitDays_${id}`, String(waitDays));
          }
        } catch (e) {}
        // reset form
        setServiceId('');
        setUsername('');
        setFiles([]);
      } else {
        showAlert(res.data?.message || 'Failed to create pre-submission.', 'error');
      }
    } catch (err) {
      console.error('Create pre-submission error', err?.response?.data || err.message);
      showAlert(err?.response?.data?.message || 'An error occurred while creating pre-submission.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '8px 4px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(245,166,35,0.35)',
        }}>
          <FaUpload style={{ color: G.navy, fontSize: 20 }} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: G.white, fontSize: 20, fontWeight: 700 }}>Create Pre-submission</h2>
          <div style={{ color: G.slateD, fontSize: 13 }}>Submit your withdrawal pre-approval request</div>
        </div>
      </div>

      <PreSubmissionGuideline />
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      {/* Card form */}
      <div style={{
        background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(16px)',
        border: `1px solid ${G.goldBorder}`, borderRadius: 16, padding: '24px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* gold top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg,${G.gold},${G.goldLight})`,
        }} />

        <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={handleSubmit}>

          {/* Service */}
          <div>
            <label style={{ display: 'block', color: G.slate, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Service</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1px solid ${G.goldBorder}`, background: G.navy3,
                color: G.white, fontSize: 14, outline: 'none', cursor: 'pointer',
                appearance: 'none', WebkitAppearance: 'none', boxSizing: 'border-box',
              }}
            >
              <option value="">Select withdrawal service</option>
              {services.filter(isWithdrawalService).map((s) => {
                const id = s._id || s.id;
                if (isBannedOrInvalid(s)) return null;
                const label = s.name || s.displayName || id;
                return (
                  <option key={id} value={id}>{label}</option>
                );
              })}
            </select>
            <div style={{ marginTop: 5, fontSize: 12, color: G.slateD }}>
              Only services that include "withdraw" in their name are shown.
            </div>
          </div>

          {/* Wait days */}
          <div>
            <label style={{ display: 'block', color: G.slate, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Wait days (1–5)
            </label>
            {isMobile ? (
              <select
                value={String(waitDays)}
                onChange={(e) => setWaitDays(Number(e.target.value))}
                aria-label="Wait days"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: `1px solid ${G.goldBorder}`, background: G.navy3,
                  color: G.white, fontSize: 14, outline: 'none', cursor: 'pointer',
                  appearance: 'none', WebkitAppearance: 'none',
                }}
              >
                {[1,2,3,4,5].map((d) => (
                  <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {[1,2,3,4,5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setWaitDays(d)}
                    aria-pressed={waitDays === d}
                    style={{
                      padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                      border: waitDays === d ? `2px solid ${G.gold}` : `1px solid ${G.goldBorder}`,
                      background: waitDays === d ? G.goldFaint : 'transparent',
                      color: waitDays === d ? G.gold : G.slate,
                      fontWeight: waitDays === d ? 700 : 400,
                      transition: 'all 160ms ease',
                    }}
                  >
                    {d} day{d > 1 ? 's' : ''}
                  </button>
                ))}
                <div style={{ marginLeft: 6, fontSize: 13, color: G.slateD }}>
                  Selected: <strong style={{ color: G.gold }}>{waitDays} day{waitDays > 1 ? 's' : ''}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Account Username */}
          <div>
            <label style={{ display: 'block', color: G.slate, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Account Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Account username / tag (e.g., Fiverr username)"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1px solid ${G.goldBorder}`, background: G.navy3,
                color: G.white, fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ marginTop: 5, fontSize: 12, color: G.slateD }}>
              Like the Fiverr or other platform username N/A the account you will withdraw to.
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label style={{ display: 'block', color: G.slate, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Attachments</label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '20px', borderRadius: 10, cursor: 'pointer',
              border: `2px dashed ${G.goldBorder}`, background: G.goldFaint,
            }}>
              <FaCloudUploadAlt style={{ fontSize: 28, color: G.gold }} />
              <span style={{ color: G.slate, fontSize: 13 }}>
                {files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload files'}
              </span>
              <input type="file" name="files" multiple onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Submit */}
          <div style={{ marginTop: 4 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: loading
                  ? 'rgba(245,166,35,0.35)'
                  : `linear-gradient(135deg,${G.gold},${G.goldLight})`,
                color: G.navy, fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(245,166,35,0.35)',
              }}
            >
              {loading ? 'Submitting...' : 'Create Pre-submission'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <Link
              to="/my-pre-submissions"
              style={{ color: G.gold, textDecoration: 'underline', fontSize: 13 }}
            >
              View my pre-submissions
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreatePreSubmission;
