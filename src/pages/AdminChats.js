import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
// ExLogo removed (not used) to avoid unused import
import UserIcon from '../assets/images/path_to_team_member_image.jpg';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import { io as ioClient } from 'socket.io-client';

const apiUrl = process.env.REACT_APP_API_URL || '';

const resolveAttachmentUrl = (a) => {
  if (!a) return null;
  const raw = (typeof a === 'string') ? a : (a.url || a.location || a.uri || a);
  if (!raw) return null;
  // already absolute
  if (/^https?:\/\//i.test(raw)) return raw;
  // leading slash -> relative to apiUrl
  if (raw.startsWith('/')) return `${apiUrl.replace(/\/$/, '')}${raw}`;
  // plain filename or relative path
  return `${apiUrl.replace(/\/$/, '')}/${raw}`;
};

const AdminChats = () => {
  const [chats, setChats] = useState([]);
  const [presenceMap, setPresenceMap] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [signedUrlsMap, setSignedUrlsMap] = useState({});
  const selectedChatRef = useRef(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyFiles, setReplyFiles] = useState([]);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const isTokenExpired = (tkn) => {
    if (!tkn) return true;
    try {
      const decoded = jwtDecode(tkn);
      const now = Date.now() / 1000;
      return decoded.exp < now;
    } catch (e) {
      return true;
    }
  };

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      // Try the admin chat endpoint first (legacy). If it doesn't exist (404),
      // fall back to the tickets endpoint and normalize shape for this UI.
      try {
        const { data } = await axios.get(`${apiUrl}/api/admin/chat?status=pending`, { headers });
        setChats(data.chats || []);
      } catch (adminErr) {
        if (adminErr.response && adminErr.response.status === 404) {
          // fallback to tickets endpoint
          const { data } = await axios.get(`${apiUrl}/api/tickets?status=pending`, { headers });
          const tickets = data.tickets || data || [];
          const normalized = (tickets || []).map((t) => ({
            _id: t._id || t.id,
            user: t.user || t.userId || null,
            userQuery: t.message || t.subject || '',
            timestamp: t.createdAt || t.timestamp,
            status: t.status || 'open',
          }));
          setChats(normalized);
        } else {
          throw adminErr;
        }
      }
    } catch (err) {
      console.error('Failed to fetch chats', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      alert('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [headers, navigate]);

  const socketRef = useRef(null);

  useEffect(() => {
    // require a valid admin token
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      return;
    }

    fetchChats();
    // connect socket for realtime updates
    let s;
    try {
      s = ioClient(apiUrl || '', { transports: ['websocket'] });
      s.on('connect', () => {
        console.log('[socket] admin connected', s.id);
        s.emit('authenticate', { token, role: 'admin' });
        s.emit('joinRoom', 'admins');
      });
      // keep reference so other handlers (openChat) can emit read events
      socketRef.current = s;
      s.on('chat:created', (payload) => {
        console.log('[socket] chat:created', payload);
        fetchChats();
      });
      s.on('chat:updated', (payload) => {
        console.log('[socket] chat:updated', payload);
        fetchChats();
      });
      // single-message event for live updates
      s.on('chat:message:single', (payload) => {
        try {
          console.log('[socket] chat:message:single', payload);
          if (!payload) return;
          // if the selected chat matches, append the message locally
          const sc = selectedChatRef.current;
          if (sc && payload.chatId && sc._id === payload.chatId) {
            const msg = payload.message || (payload.chat && payload.chat.messages && payload.chat.messages.slice(-1)[0]);
            if (msg) {
              // ensure adminResponse field stays consistent for legacy UI
              const copy = { ...sc };
              copy.adminResponse = msg.text || copy.adminResponse;
              setSelectedChat(copy);
              selectedChatRef.current = copy;
            }
          }
          // refresh list for admins to see status updates
          fetchChats();
        } catch (e) {
          console.warn('Failed to handle chat:message:single in admin', e);
        }
      });
      // Also listen for ticket events (if backend emits ticket:* events)
      s.on('ticket:new', (payload) => {
        console.log('[socket] ticket:new', payload);
        fetchChats();
      });
      s.on('ticket:reply', (payload) => {
        console.log('[socket] ticket:reply', payload);
        try {
          // If selected chat matches ticket id, update it
          const sc2 = selectedChatRef.current;
          if (sc2 && payload && (payload._id === sc2._id || payload.ticketId === sc2._id)) {
            // Try to append last reply into selectedChat adminResponse (legacy shape)
            const copy = { ...sc2 };
            if (payload.replies && payload.replies.length) {
              const last = payload.replies[payload.replies.length - 1];
              copy.adminResponse = last.message || copy.adminResponse;
            }
            setSelectedChat(copy);
            selectedChatRef.current = copy;
          }
        } catch (e) { console.warn('ticket:reply handler error', e); }
        fetchChats();
      });
      s.on('ticket:status', (payload) => {
        console.log('[socket] ticket:status', payload);
        fetchChats();
      });
      s.on('presence:update', (p) => {
        try {
          if (!p) return;
          if (p.role === 'admin') {
            setPresenceMap(prev => ({ ...prev, admin: !!p.online }));
            return;
          }
          if (p.userId) {
            setPresenceMap(prev => ({ ...prev, [String(p.userId)]: !!p.online }));
          }
        } catch (e) { console.warn('presence:update handler failed', e); }
      });
    } catch (e) {
      console.warn('Socket connect failed', e);
    }

    // poll every 20s as fallback
    const id = setInterval(fetchChats, 20000);
    return () => {
      clearInterval(id);
      try { if (s) s.disconnect(); } catch (e) {}
    };
  }, [fetchChats, navigate, token]);

  const openChat = async (chat) => {
    try {
      // Use ticket endpoint directly for details (admin token allows access)
      const { data } = await axios.get(`${apiUrl}/api/tickets/${chat._id}`, { headers });
      const ticket = data.ticket || data;
      // normalize into shape expected by this UI
      const normalized = {
        _id: ticket._id || ticket.id,
        user: ticket.userId || ticket.user || null,
        userQuery: ticket.message || ticket.subject || '',
        botResponse: ticket.botResponse || '',
        adminResponse: (ticket.replies && ticket.replies.length) ? ticket.replies.filter(r => r.senderRole === 'admin').slice(-1)[0]?.message : '',
        adminResponseAt: (ticket.replies && ticket.replies.length) ? (ticket.replies.filter(r => r.senderRole === 'admin').slice(-1)[0]?.at || ticket.replies.filter(r => r.senderRole === 'admin').slice(-1)[0]?.createdAt) : null,
        attachments: ticket.attachments || [],
        replies: ticket.replies || [],
        timestamp: ticket.createdAt || ticket.createdAt,
        status: ticket.status || 'open',
      };
      setSelectedChat(normalized);
      selectedChatRef.current = normalized;
      setReplyText('');
      // locally mark this chat as read (so the admin list shows a read timestamp)
      try {
        const nowIso = new Date().toISOString();
        setChats(prev => (prev || []).map(ch => (ch._id === (ticket._id || ticket.id) ? { ...ch, lastReadAt: nowIso, unread: false } : ch)));
      } catch (e) { /* ignore */ }
      // Notify server that admin opened this ticket so server may mark messages as read
      try {
        const socket = socketRef.current;
        if (socket && socket.connected) {
          // Prefer to send explicit message ids for accuracy when available
          const msgIds = (ticket.replies || []).filter(r => !r.senderRole || r.senderRole !== 'admin').map(r => r._id || r.id).filter(Boolean);
          if (msgIds.length) {
            socket.emit('ticket:read', { ticketId: ticket._id || ticket.id, messageIds: msgIds });
            socket.emit('message:read', { ticketId: ticket._id || ticket.id, messageIds: msgIds });
          } else {
            // fallback: inform server to mark recent messages as read
            socket.emit('ticket:read', { ticketId: ticket._id || ticket.id, readCount: 5 });
          }
        }
      } catch (e) { console.warn('Emit ticket:read failed', e); }
    } catch (err) {
      console.error('Failed to open chat', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      alert('Failed to open chat');
    }
  };

  // Helper to get admin token for signed URL requests
  const getAdminToken = () => localStorage.getItem('adminToken');

  const fetchSignedUrl = async (rawPath) => {
    try {
      if (!rawPath) return null;
      // already absolute
      if (/^https?:\/\//i.test(String(rawPath))) return String(rawPath);
      // cached
      if (signedUrlsMap[rawPath]) return signedUrlsMap[rawPath];
      const name = String(rawPath).split('/').pop();
      const tokenLocal = getAdminToken();
      const res = await axios.get(`${apiUrl.replace(/\/$/, '')}/api/uploads/${encodeURIComponent(name)}/signed`, { headers: tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {} });
      const signed = res.data && (res.data.url || res.data.signedUrl);
      if (signed) setSignedUrlsMap(m => ({ ...m, [rawPath]: signed }));
      return signed || null;
    } catch (e) {
      console.warn('Failed to fetch signed url for', rawPath, e?.response?.data || e.message || e);
      // fallback to resolveAttachmentUrl absolute
      try { const fallback = resolveAttachmentUrl(rawPath); setSignedUrlsMap(m => ({ ...m, [rawPath]: fallback })); return fallback; } catch (er) { return null; }
    }
  };

  // Prefetch signed urls whenever selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;
    const all = [];
    if (Array.isArray(selectedChat.attachments)) all.push(...selectedChat.attachments);
    if (Array.isArray(selectedChat.replies)) {
      selectedChat.replies.forEach(r => {
        if (Array.isArray(r.attachments)) all.push(...r.attachments);
      });
    }
    all.forEach(a => {
      if (!a) return;
      if (/^https?:\/\//i.test(String(a))) return;
      if (!signedUrlsMap[a]) fetchSignedUrl(a).catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  const handleReply = async () => {
    if (!replyText.trim() && (!replyFiles || replyFiles.length === 0)) return alert('Reply text required');
    try {
      let data;
      if (replyFiles && replyFiles.length > 0) {
        const form = new FormData();
        form.append('message', replyText);
        replyFiles.forEach((f, i) => form.append('attachments', f.file, f.name || `file${i}`));
        // Use fetch for multipart upload so the browser/runtime sets the boundary correctly
        const url = `${apiUrl.replace(/\/$/, '')}/api/tickets/${encodeURIComponent(selectedChat._id)}/reply`;
        const tokenLocal = localStorage.getItem('adminToken');
        const fetchHeaders = {};
        if (tokenLocal) fetchHeaders.Authorization = `Bearer ${tokenLocal}`;
        const resp = await fetch(url, { method: 'POST', headers: fetchHeaders, body: form });
        data = await resp.json().catch(() => null);
        if (!resp.ok) throw data || new Error('Reply upload failed');
      } else {
        const res = await axios.post(`${apiUrl}/api/tickets/${selectedChat._id}/reply`, { message: replyText }, { headers });
        data = res.data;
      }
      const t = data.ticket || data;
      // Refresh selected chat details from server to get full replies (including attachments)
      try {
        const { data: detail } = await axios.get(`${apiUrl}/api/tickets/${selectedChat._id}`, { headers });
        const ticket = detail.ticket || detail;
        const normalized = {
          _id: ticket._id || ticket.id,
          user: ticket.userId || ticket.user || null,
          userQuery: ticket.message || ticket.subject || '',
          botResponse: ticket.botResponse || '',
          adminResponse: (ticket.replies && ticket.replies.length) ? ticket.replies.filter(r => r.senderRole === 'admin').slice(-1)[0]?.message : '',
          adminResponseAt: (ticket.replies && ticket.replies.length) ? (ticket.replies.filter(r => r.senderRole === 'admin').slice(-1)[0]?.at || ticket.replies.filter(r => r.senderRole === 'admin').slice(-1)[0]?.createdAt) : null,
          attachments: ticket.attachments || [],
          replies: ticket.replies || [],
          timestamp: ticket.createdAt || ticket.createdAt,
          status: ticket.status || 'open',
        };
        setSelectedChat(normalized);
        selectedChatRef.current = normalized;
      } catch (e) {
        // fallback: update adminResponse only
        const copy = { ...selectedChat };
        copy.adminResponse = (t.replies && t.replies.length) ? t.replies.filter(r => r.senderRole === 'admin').slice(-1)[0]?.message : replyText;
        setSelectedChat(copy);
        selectedChatRef.current = copy;
      }
      // cleanup previews and clear file input
      try { replyFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); }); } catch (e) {}
      setReplyFiles([]);
      try { if (fileInputRef && fileInputRef.current) fileInputRef.current.value = null; } catch (e) {}
      // refresh list
      fetchChats();
    } catch (err) {
      console.error('Failed to reply', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      alert('Failed to reply');
    }
  };

  const handleClose = async () => {
    if (!selectedChat) return;
    try {
      // Mark ticket resolved via tickets API
      const { data } = await axios.patch(`${apiUrl}/api/tickets/${selectedChat._id}/status`, { status: 'resolved' }, { headers });
      alert('Ticket marked resolved');
      const t = data.ticket || data;
      const copy = { ...selectedChat };
      copy.status = t.status || 'resolved';
      setSelectedChat(copy);
      selectedChatRef.current = copy;
      fetchChats();
    } catch (err) {
      console.error('Failed to close chat', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      alert('Failed to close chat');
    }
  };

  return (
    <div className="admin-chats-page">
      <h2>Admin Chats</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 360, border: '1px solid #ddd', padding: 12 }}>
          <h3>Pending Chats</h3>
          {loading && <div>Loading...</div>}
          {!loading && chats.length === 0 && <div>No pending chats</div>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {chats.map((c) => {
              const getUserDisplay = (u) => {
                if (!u) return 'Anonymous';
                // populated object
                if (typeof u === 'object') {
                  if (u.username) return u.username;
                  if (u.payId) return u.payId;
                  if (u.fullName && !/undefined/i.test(u.fullName)) return u.fullName;
                  if (u.firstName || u.lastName) return `${(u.firstName||'').trim()} ${(u.lastName||'').trim()}`.trim() || String(u._id || 'Anonymous');
                  return String(u._id || 'Anonymous');
                }
                // could be an ObjectId string
                return String(u);
              };

              const displayName = getUserDisplay(c.user);
              const ownerId = c.user && (c.user._id || c.user.id) ? String(c.user._id || c.user.id) : null;
              const ownerOnline = ownerId ? !!presenceMap[ownerId] : false;
              const adminOnline = !!presenceMap['admin'];

              return (
                <li key={c._id} style={{ padding: 12, cursor: 'pointer', borderBottom: '1px solid #f2f2f2', display: 'flex', gap: 12, alignItems: 'center' }} onClick={() => openChat(c)}>
                  <div style={{ width: 64, alignItems: 'center', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <img src={(c.user && c.user.avatarUrl) ? c.user.avatarUrl : UserIcon} alt="user" style={{ width: 56, height: 56, borderRadius: 28, objectFit: 'cover' }} />
                    {/* active dot */}
                    <div style={{ position: 'absolute', right: 12, bottom: 8, width: 14, height: 14, borderRadius: 8, border: '2px solid #fff', backgroundColor: adminOnline ? '#162660' : (ownerOnline ? '#22C55E' : 'transparent') }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: 15 }}>{displayName}</strong>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 12, color: '#999' }}>{(() => {
                                const last = (c.replies && c.replies.length) ? c.replies[c.replies.length - 1] : null;
                                const t = last ? (last.at || last.createdAt) : (c.timestamp || c.createdAt);
                                return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              })()}</div>
                              {c.lastReadAt ? <div style={{ fontSize: 11, color: '#4CAF50', marginTop: 2 }}>Read: {new Date(c.lastReadAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div> : null}
                            </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>{c.userQuery.slice(0, 80)}</div>
                  </div>

                  {/* unread indicator */}
                  {c.unread ? <div style={{ minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#E53935' }} /> : null}
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ flex: 1, border: '1px solid #ddd', padding: 12 }}>
          {!selectedChat && <div>Select a chat to view details</div>}
          {selectedChat && (
            <div>
              <h3>Chat Details</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img src={UserIcon} alt="user" style={{ width: 56, height: 56, borderRadius: 28, objectFit: 'cover' }} />
                <div>
                  <div><strong>User:</strong> {selectedChat.user ? (selectedChat.user.username || selectedChat.user.payId || selectedChat.user.fullName) : 'Anonymous'}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{new Date(selectedChat.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ marginTop: 8 }}><strong>User Query:</strong>
                <pre style={{ background: '#fafafa', padding: 8 }}>{selectedChat.userQuery}</pre>
                {selectedChat.attachments && selectedChat.attachments.length > 0 ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {selectedChat.attachments.map((a, i) => {
                      const resolved = signedUrlsMap[a] || resolveAttachmentUrl(a);
                      return (
                        <div key={i} style={{ maxWidth: 160 }}>
                          {(/\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i).test(String(resolved || '')) ? (
                            <img src={resolved} alt={`att-${i}`} style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 6 }} />
                          ) : (
                            <a href={resolved} target="_blank" rel="noreferrer">{String(resolved).split('/').pop() || resolved}</a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div style={{ marginTop: 8 }}><strong>Bot Response:</strong>
                <pre style={{ background: '#fafafa', padding: 8 }}>{selectedChat.botResponse}</pre>
              </div>

              <div style={{ marginTop: 8 }}><strong>Conversation:</strong>
                <div style={{ marginTop: 6 }}>
                  {/* Render replies chronologically */}
                  {(selectedChat.replies || []).map((r, idx) => (
                    <div key={idx} style={{ marginTop: 10, padding: 8, background: '#fff' }}>
                      <div style={{ fontSize: 12, color: '#666' }}>{(r.by || r.senderRole || 'user')} • {r.at ? new Date(r.at).toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : '')}</div>
                      <div style={{ marginTop: 6 }}>{r.message}</div>
                      {r.attachments && r.attachments.length > 0 ? (
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                              {r.attachments.map((a, ai) => {
                                const resolvedR = signedUrlsMap[a] || resolveAttachmentUrl(a);
                                return (
                                  <div key={ai} style={{ maxWidth: 160 }}>
                                    {(/\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i).test(String(resolvedR || a)) ? (
                                      <img src={resolvedR || a} alt={`r-${ai}`} style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 6 }} />
                                    ) : (
                                      <a href={resolvedR || a} target="_blank" rel="noreferrer">{String(resolvedR || a).split('/').pop() || resolvedR || a}</a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} style={{ width: '100%' }} />
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
                    // clear the input to allow re-selecting same file if needed
                    try { e.target.value = null; } catch (er) {}
                  }} />
                  <button onClick={handleReply}>Reply</button>
                  <button onClick={handleClose}>Close</button>
                </div>
                {replyFiles && replyFiles.length > 0 ? (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    {replyFiles.map((f, i) => (
                      <div key={i} style={{ maxWidth: 120 }}>
                        {f.preview ? <img src={f.preview} alt={f.name} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ fontSize: 12 }}>{f.name}</div>}
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
    </div>
  );
};

export default AdminChats;
