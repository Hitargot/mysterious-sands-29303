import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Alert from '../components/Alert';
import PreSubmissionGuideline from '../components/PreSubmissionGuideline';
import { Link } from 'react-router-dom';

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
    <div style={styles.container}>
      <h2>Create Pre-submission</h2>
      <PreSubmissionGuideline />
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Service</label>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} style={styles.input}>
            <option value="">Select withdrawal service</option>
            {services.filter(isWithdrawalService).map((s) => {
              const id = s._id || s.id;
              // skip banned/invalid services from the list entirely
              if (isBannedOrInvalid(s)) return null;
              const label = s.name || s.displayName || id;
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </select>
          <div style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
            Only services that include "withdraw" in their name are shown.
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Wait days (1-5)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {isMobile ? (
                <select
                  value={String(waitDays)}
                  onChange={(e) => setWaitDays(Number(e.target.value))}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
                  aria-label="Wait days"
                >
                  {[1,2,3,4,5].map((d) => (
                    <option key={d} value={d}>{d} day{d>1 ? 's' : ''}</option>
                  ))}
                </select>
              ) : (
                <>
                  {[1,2,3,4,5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setWaitDays(d)}
                      aria-pressed={waitDays === d}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        border: waitDays===d ? '2px solid #162660' : '1px solid #ccc',
                        background: waitDays===d ? '#162660' : '#fff',
                        color: waitDays===d ? '#fff' : '#333',
                        cursor: 'pointer'
                      }}
                    >
                      {d} day{d>1?'s':''}
                    </button>
                  ))}
                  <div style={{ marginLeft: 12, fontSize: 13, color: '#333' }}>
                    Selected: <strong>{waitDays} day{waitDays>1 ? 's' : ''}</strong>
                  </div>
                </>
              )}
            </div>

          {/* guidance consolidated into PreSubmissionGuideline component */}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Account Username</label>
          <input
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Account username / tag (e.g., Fiverr username)"
          />
          <div style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
            <small>Like the Fiverr or other platform username — the account you will withdraw to.</small>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Attachments</label>
          <input type="file" name="files" multiple onChange={handleFileChange} style={styles.fileInput} />
          <div style={{ color: '#666', fontSize: 13, marginTop: 6 }}>{files.length} file(s) selected</div>
        </div>

        <div style={styles.actions}>
          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? 'Submitting...' : 'Create Pre-submission'}
          </button>
        </div>

        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <Link to="/my-pre-submissions" style={{ color: '#162660', textDecoration: 'underline' }}>View my pre-submissions</Link>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: 720, margin: '20px auto', padding: 20, background: '#fff', borderRadius: 8 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontWeight: '600', marginBottom: 6 },
  input: { padding: 10, borderRadius: 6, border: '1px solid #ccc' },
  fileInput: { padding: 6 },
  actions: { marginTop: 10 },
  submit: { background: '#162660', color: '#fff', padding: '10px 14px', border: 'none', borderRadius: 6, cursor: 'pointer' },
};

export default CreatePreSubmission;
