import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io as ioClient } from 'socket.io-client';
import Lightbox from '../components/Lightbox';
import API_BASE from '../config/api';

const apiUrl = process.env.REACT_APP_API_URL || '';

const resolveAttachmentUrl = (a) => {
  if (!a) return null;
  let raw = (typeof a === 'string') ? a : (a.url || a.location || a.uri || a);
  if (!raw) return null;
  raw = String(raw).trim();

  // leading colon port like ':22222/uploads/...' -> join with current host
  if (raw.startsWith(':')) {
    try {
      const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
      const proto = (typeof window !== 'undefined' && window.location && window.location.protocol) ? window.location.protocol : 'http:';
      return `${proto}//${host}${raw}`;
    } catch (e) {
      // Use configured API base as a fallback, otherwise default to localhost
      const fallbackBase = API_BASE || (process.env.REACT_APP_API_URL || 'http://localhost');
      return `${fallbackBase.replace(/\/$/, '')}${raw}`;
    }
  }

  // absolute URL -> possibly downgrade https localhost to http for local dev
  if (/^https?:\/\//i.test(raw)) {
    if (/localhost|127\.0\.0\.1/.test(raw) && /^https:\/\//i.test(raw)) {
      return raw.replace(/^https:\/\//i, 'http://');
    }
    return raw;
  }

  // relative path -> join with configured apiUrl when available
  const base = (apiUrl || '').replace(/\/$/, '');
  if (raw.startsWith('/')) {
    return base ? (base + raw) : raw;
  }
  return base ? (base + '/' + raw.replace(/^\//, '')) : raw;
};

const formatDate = (d) => {
  try {
    if (!d) return '—';
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleString();
  } catch (e) { return String(d || '—'); }
};

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const selectedTicketRef = useRef(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState('open');
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const openLightbox = (src) => { if (!src) return; setLightboxSrc(src); };
  const closeLightbox = () => setLightboxSrc(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      // Prefer the admin-facing tickets endpoint; fallback to tickets if needed.
      try {
        const { data } = await axios.get(`${apiUrl}/api/admin/chat?status=${statusFilter}`, { headers });
        const chats = data.chats || [];
        // normalize into ticket-like shape for the UI
        const normalized = (chats || []).map(c => ({
          _id: c._id,
          ticketId: c.ticketId || c._id,
          subject: (c.userQuery && c.userQuery.slice(0, 60)) || '',
          message: c.userQuery || '',
          createdAt: c.timestamp || new Date(),
          status: c.status || 'open',
        }));
        setTickets(normalized);
      } catch (adminErr) {
        // fallback to /api/tickets (may require admin token and return different shape)
        const { data } = await axios.get(`${apiUrl}/api/tickets?status=${statusFilter}`, { headers });
        setTickets(data.tickets || data || []);
      }
    } catch (err) {
      console.error('Failed to fetch tickets', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, headers, navigate]);

  const socketRef = useRef(null);

  const openTicket = useCallback(async (t) => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/tickets/${t._id || t}`, { headers });
      const ticket = data.ticket || data;
      setSelectedTicket(ticket);
      selectedTicketRef.current = ticket;
      setReplyText('');
      // locally mark this ticket as read in the list and set lastReadAt
      try {
        const nowIso = new Date().toISOString();
        setTickets(prev => (prev || []).map(tt => (tt._id === (ticket._id || ticket) ? { ...tt, lastReadAt: nowIso, unread: false } : tt)));
      } catch (e) { /* ignore */ }
      // notify server that admin read this ticket (prefer explicit message ids)
      try {
        const s = socketRef.current;
        if (s && s.connected) {
          const msgIds = (ticket.replies || []).filter(r => !r.senderRole || r.senderRole !== 'admin').map(r => r._id || r.id).filter(Boolean);
          if (msgIds.length) {
            s.emit('ticket:read', { ticketId: ticket._id || ticket.id || ticket });
            s.emit('message:read', { ticketId: ticket._id || ticket.id || ticket, messageIds: msgIds });
          } else {
            s.emit('ticket:read', { ticketId: ticket._id || ticket.id || ticket, readCount: 5 });
          }
        }
      } catch (e) { console.warn('Emit ticket:read failed', e); }
    } catch (err) {
      console.error('Failed to open ticket', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  }, [headers, navigate]);


  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchTickets();

    let s;
    try {
      s = ioClient(apiUrl || '', { transports: ['websocket'] });
      s.on('connect', () => {
        s.emit('authenticate', { token, role: 'admin' });
        s.emit('joinRoom', 'admins');
      });
      socketRef.current = s;
      s.on('ticket:new', (p) => { fetchTickets(); });
      s.on('ticket:reply', (p) => {
        try {
          const sc = selectedTicketRef.current;
          if (sc && (p._id === sc._id || p.ticketId === sc._id)) {
            // refresh selected ticket
            openTicket(sc);
          }
        } catch (e) { }
        fetchTickets();
      });
      s.on('ticket:status', (p) => { fetchTickets(); });
    } catch (e) {
      console.warn('Socket failed', e);
    }

    const id = setInterval(fetchTickets, 20000);
    return () => { clearInterval(id); try { if (s) s.disconnect(); } catch (e) {} };
  }, [fetchTickets, token, navigate, openTicket]);

  const handleReply = async () => {
    if (!selectedTicket) return alert('No ticket selected');
    if (!replyText.trim() && (!replyFiles || replyFiles.length === 0)) return alert('Reply is required');
    try {
      let data;
      if (replyFiles && replyFiles.length > 0) {
        const form = new FormData();
        form.append('message', replyText);
        replyFiles.forEach((f, i) => {
          form.append('attachments', f.file, f.name || `file${i}`);
        });
        // Use fetch for multipart upload (let browser set Content-Type boundary)
        const url = `${apiUrl.replace(/\/$/, '')}/api/tickets/${encodeURIComponent(selectedTicket._id)}/reply`;
        const tokenLocal = localStorage.getItem('adminToken');
        const fetchHeaders = {};
        if (tokenLocal) fetchHeaders.Authorization = `Bearer ${tokenLocal}`;
        const resp = await fetch(url, { method: 'POST', headers: fetchHeaders, body: form });
        data = await resp.json().catch(() => null);
        if (!resp.ok) throw data || new Error('Reply upload failed');
      } else {
        const res = await axios.post(`${apiUrl}/api/tickets/${selectedTicket._id}/reply`, { message: replyText }, { headers });
        data = res.data;
      }
      const t = data.ticket || data;
  setSelectedTicket(t);
  selectedTicketRef.current = t;
  setReplyText('');
  // cleanup any created object urls and clear file input
  try { replyFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); }); } catch (e) {}
  setReplyFiles([]);
  try { if (fileInputRef && fileInputRef.current) fileInputRef.current.value = null; } catch (e) {}
    fetchTickets();
    // close lightbox if open (user likely viewed attachments and then sent a reply)
    try { closeLightbox(); } catch (e) {}
    } catch (err) {
      console.error('Reply failed', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      alert('Reply failed');
    }
  };

  const changeStatus = async (status) => {
    if (!selectedTicket) return;
    try {
      const { data } = await axios.patch(`${apiUrl}/api/tickets/${selectedTicket._id}/status`, { status }, { headers });
      const t = data.ticket || data;
      setSelectedTicket(t);
      selectedTicketRef.current = t;
      fetchTickets();
      alert('Status updated');
    } catch (err) {
      console.error('Status update failed', err);
      alert('Status update failed');
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ marginBottom: 12 }}>Admin Tickets</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 420, border: '1px solid #e6e6e6', padding: 12, borderRadius: 8, background: '#fff' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input placeholder="Search tickets" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="all">All</option>
            </select>
            <button style={{ marginLeft: 4, padding: '8px 12px', borderRadius: 6 }} onClick={fetchTickets}>Refresh</button>
          </div>
          {loading && <div>Loading...</div>}
          {!loading && tickets.length === 0 && <div style={{ color: '#666' }}>No tickets</div>}
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            {(tickets || []).filter(t => {
              if (!search) return true;
              const s = String(search).toLowerCase();
              return String(t.subject || '').toLowerCase().includes(s) || String(t.message || '').toLowerCase().includes(s) || String(t.ticketId || t._id || '').toLowerCase().includes(s);
            }).map((t) => (
              <div key={t._id} onClick={() => openTicket(t)} style={{ padding: 12, borderRadius: 8, marginBottom: 10, cursor: 'pointer', boxShadow: selectedTicket && (selectedTicket._id === t._id) ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', border: selectedTicket && (selectedTicket._id === t._id) ? '1px solid #dfe6ff' : '1px solid #f2f2f2', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700 }}>{t.subject || (t.message && t.message.slice(0, 60)) || `#${String(t.ticketId || t._id).slice(-6)}`}</div>
                      <div style={{ textAlign: 'right' }}>
                        {(() => {
                          // prefer last reply time when available
                          const lastReply = (t.replies && t.replies.length) ? t.replies[t.replies.length - 1] : null;
                          const lastAt = lastReply ? (lastReply.at || lastReply.createdAt) : (t.createdAt || null);
                          return <div style={{ fontSize: 12, color: '#666' }}>{formatDate(lastAt)}</div>;
                        })()}
                        {t.lastReadAt ? <div style={{ fontSize: 11, color: '#4CAF50', marginTop: 2 }}>Read: {new Date(t.lastReadAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div> : null}
                      </div>
                </div>
                <div style={{ marginTop: 6, color: '#444' }}>{t.message && String(t.message).slice(0, 120)}</div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: t.status === 'resolved' ? '#2e7d32' : '#ff9800' }}>{t.status}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>ID: {t.ticketId || t._id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, border: '1px solid #e6e6e6', padding: 12, borderRadius: 8, background: '#fff' }}>
          {!selectedTicket && <div style={{ color: '#666' }}>Select a ticket to view details</div>}
          {selectedTicket && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Ticket #{selectedTicket.ticketId || selectedTicket._id}</h3>
                  <div style={{ color: '#666' }}>{(selectedTicket.user && (selectedTicket.user.email || selectedTicket.user.username)) ? `${String(selectedTicket.user.email || selectedTicket.user.username)} • ${formatDate(selectedTicket.createdAt)}` : formatDate(selectedTicket.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedTicket && String(selectedTicket.status).toLowerCase() === 'resolved' ? (
                    <button onClick={() => { if (window.confirm('Re-open this ticket?')) changeStatus('open'); }} style={{ padding: '8px 12px', borderRadius: 6, background: '#1976d2', color: '#fff' }}>Reopen</button>
                  ) : (
                    <>
                      <button onClick={() => { if (window.confirm('Mark ticket as pending?')) changeStatus('pending'); }} style={{ padding: '8px 12px', borderRadius: 6 }}>Mark Pending</button>
                      <button onClick={() => { if (window.confirm('Resolve this ticket?')) changeStatus('resolved'); }} style={{ padding: '8px 12px', borderRadius: 6, background: '#2e7d32', color: '#fff' }}>Resolve</button>
                    </>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 12 }}><strong>Subject:</strong> {selectedTicket.subject}</div>
              <div style={{ marginTop: 8 }}><strong>Messages / Replies:</strong></div>
              <div style={{ maxHeight: '60vh', overflow: 'auto', background: '#fafafa', padding: 12, borderRadius: 6 }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>{formatDate(selectedTicket.createdAt)}</div>
                  <div style={{ padding: 12, background: '#fff', marginTop: 6, borderRadius: 6 }}>{selectedTicket.message}
                    {selectedTicket.attachments && selectedTicket.attachments.length > 0 ? (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        {selectedTicket.attachments.map((a, i) => {
                          const url = resolveAttachmentUrl(a);
                          return (
                            <div key={i} style={{ maxWidth: 220 }}>
                                {(/\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i).test(String(url || '')) ? (
                                <img onClick={() => openLightbox(url)} src={url} alt={`uatt-${i}`} style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }} />
                              ) : (
                                <a href={url} target="_blank" rel="noreferrer" style={{ color: '#1565c0' }}>{String(url).split('/').pop() || url}</a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
                {(selectedTicket.replies || []).map((r, i) => (
                  <div key={i} style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#666' }}>{r.senderRole} • {formatDate(r.createdAt)}</div>
                    <div style={{ padding: 12, background: r.senderRole === 'admin' ? '#eef3ff' : '#fff', marginTop: 6, borderRadius: 6 }}>{r.message}
                      {r.attachments && r.attachments.length > 0 ? (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          {r.attachments.map((a, ai) => {
                            const url = resolveAttachmentUrl(a);
                            return (
                              <div key={ai} style={{ maxWidth: 220 }}>
                                {(/\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i).test(String(url || a)) ? (
                                  <img onClick={() => openLightbox(url || a)} src={url || a} alt={`ratt-${ai}`} style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }} />
                                ) : (
                                  <a href={url || a} target="_blank" rel="noreferrer" style={{ color: '#1565c0' }}>{String(url || a).split('/').pop() || url || a}</a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12 }}>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} style={{ width: '100%', padding: 8, borderRadius: 6 }} />
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input ref={fileInputRef} type="file" multiple onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
                    const allowedMime = /^(image|video)\//i;
                    const accepted = [];
                    const rejected = [];
                    for (const f of files) {
                      const size = f.size || 0;
                      const type = f.type || '';
                      const name = f.name || '';
                      const ext = (name && name.split('.').length > 1) ? name.split('.').pop().toLowerCase() : '';
                      const isPdf = ext === 'pdf' || type === 'application/pdf';
                      if (size > MAX_FILE_SIZE) {
                        rejected.push(`${name} (too large)`);
                        continue;
                      }
                      if (!(allowedMime.test(type) || isPdf)) {
                        rejected.push(`${name} (unsupported type)`);
                        continue;
                      }
                      accepted.push(f);
                    }
                    if (rejected.length) {
                      alert(`Some files were skipped:\n${rejected.join('\n')}.\nAllowed: images, videos, PDF. Max per-file: 50MB.`);
                    }
                    const mapped = accepted.map(f => ({ file: f, name: f.name, preview: f.type && f.type.startsWith('image') ? URL.createObjectURL(f) : null }));
                    if (mapped.length) setReplyFiles(prev => [...prev, ...mapped]);
                    try { e.target.value = null; } catch (er) {}
                  }} />
                  <button onClick={handleReply} style={{ padding: '8px 12px', borderRadius: 6 }}>Reply</button>
                  {selectedTicket && String(selectedTicket.status).toLowerCase() === 'resolved' ? (
                    <button onClick={() => { if (window.confirm('Re-open this ticket?')) changeStatus('open'); }} style={{ padding: '8px 12px', borderRadius: 6, background: '#1976d2', color: '#fff' }}>Reopen</button>
                  ) : (
                    <>
                      <button onClick={() => { if (window.confirm('Mark ticket pending?')) changeStatus('pending'); }} style={{ padding: '8px 12px', borderRadius: 6 }}>Mark Pending</button>
                      <button onClick={() => { if (window.confirm('Resolve this ticket?')) changeStatus('resolved'); }} style={{ padding: '8px 12px', borderRadius: 6, background: '#2e7d32', color: '#fff' }}>Resolve</button>
                    </>
                  )}
                </div>
                {replyFiles && replyFiles.length > 0 ? (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {replyFiles.map((f, i) => (
                      <div key={i} style={{ maxWidth: 160 }}>
                        {f.preview ? <img onClick={() => openLightbox(f.preview)} src={f.preview} alt={f.name} style={{ width: 160, height: 110, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }} /> : <div style={{ fontSize: 12 }}>{f.name}</div>}
                        <div><button onClick={() => {
                          try { if (f.preview) URL.revokeObjectURL(f.preview); } catch (e) {}
                          setReplyFiles(prev => prev.filter((_, idx) => idx !== i));
                        }}>Remove</button></div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
      <Lightbox src={lightboxSrc} onClose={closeLightbox} />
    </div>
  );
};

export default AdminTickets;
