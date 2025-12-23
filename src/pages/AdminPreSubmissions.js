import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/adminPreSubmissions.css';

const AdminPreSubmissions = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${apiUrl}/api/admin/pre-submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // backend returns { success: true, preSubmissions: [...] }
        const list = res.data?.preSubmissions || res.data?.data || [];
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Error fetching admin pre-submissions', e?.response?.data || e.message);
        setError(e?.response?.data?.message || 'Failed to fetch pre-submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [apiUrl, token]);

  const filtered = items.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (p.username || '').toString().toLowerCase().includes(s) ||
      (p.serviceTag || '').toString().toLowerCase().includes(s) ||
      (p.status || '').toString().toLowerCase().includes(s) ||
      (p._id || '').toString().toLowerCase().includes(s) ||
      (p.userId && p.userId.username && p.userId.username.toLowerCase().includes(s))
    );
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin — Pre-submissions</h2>
      <p>Lists all pre-submissions. Use the search box to filter.</p>

      <div style={{ margin: '12px 0' }}>
        <input
          type="text"
          placeholder="Search by username, service tag, status or id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: '100%', maxWidth: 600 }}
        />
      </div>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map((p) => (
            <div key={p._id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6, background: '#fff' }}>
              <div style={{ fontWeight: 700 }}>{p.username || '—'}</div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{p.serviceTag || p.serviceId?.name || '—'}</div>
              <div style={{ marginBottom: 6 }}>
                <strong>Status:</strong> {p.status || 'Pending'}
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>Files:</strong> {(p.fileUrls && p.fileUrls.length) || 0}
                {p.fileUrls && p.fileUrls.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {p.fileUrls.map((fUrl, idx) => {
                      const rawName = (fUrl || '').split('/').pop() || `file-${idx}`;
                      const name = rawName.split('?')[0];
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
                      return (
                        <div key={idx} style={{ border: '1px solid #f1f1f1', padding: 8, borderRadius: 6, background: '#fafafa', minWidth: 140 }}>
                          {isImage ? (
                            <img src={fUrl} alt={name} style={{ width: 140, height: 90, objectFit: 'cover', display: 'block', marginBottom: 6 }} />
                          ) : null}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <a href={fUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#0366d6', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{name}</a>
                            <button
                              onClick={async (ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                const makeAbsolute = (u) => {
                                  try {
                                    if (!u) return u;
                                    if (u.startsWith('http://') || u.startsWith('https://')) return u;
                                    // ensure apiUrl ends without trailing slash
                                    const base = (apiUrl || '').replace(/\/$/, '');
                                    if (!base) return u;
                                    return u.startsWith('/') ? `${base}${u}` : `${base}/${u}`;
                                  } catch (e) { return u; }
                                };

                                const requestUrl = makeAbsolute(fUrl);
                                try {
                                  const res = await axios.get(requestUrl, {
                                    responseType: 'blob',
                                    headers: { Authorization: `Bearer ${token}` },
                                  });

                                  // if backend returned HTML (e.g., redirect to login) fall back to opening the link
                                  const contentType = (res.headers && (res.headers['content-type'] || res.headers['Content-Type'])) || '';
                                  if (typeof contentType === 'string' && contentType.toLowerCase().includes('text/html')) {
                                    // open in new tab so the admin can see the server response
                                    window.open(requestUrl, '_blank', 'noopener');
                                    return;
                                  }

                                  const blob = res.data;
                                  const blobUrl = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = blobUrl;
                                  a.download = name || 'file';
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                  window.URL.revokeObjectURL(blobUrl);
                                } catch (e) {
                                  console.error('Download failed, falling back to opening link', e);
                                  // fallback: open the direct URL in a new tab (may prompt auth or allow browser to handle)
                                  try { window.open(requestUrl || fUrl, '_blank', 'noopener'); } catch (err) { setError('Failed to download or open file'); }
                                }
                              }}
                              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>User:</strong> {p.userId?.username || p.userId || '—'}
              </div>
              <div style={{ fontSize: 12, color: '#444' }}>
                <small>Created: {new Date(p.createdAt || Date.now()).toLocaleString()}</small>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <div style={{ color: '#666' }}>No pre-submissions found.</div>}
        </div>
      )}
    </div>
  );
};

export default AdminPreSubmissions;
