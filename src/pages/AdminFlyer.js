import React, { useEffect, useState } from 'react';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL;

const AdminFlyer = () => {
  const resolveMediaUrl = (raw) => {
    if (!raw) return raw;
    try {
      const s = String(raw).trim();
      if (!s) return s;
      // absolute already
      if (/^https?:\/\//i.test(s)) return s;
      // leading colon port like ':22222/uploads/...' -> join with current host
      if (s.startsWith(':')) {
        const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
        const proto = (typeof window !== 'undefined' && window.location && window.location.protocol) ? window.location.protocol : 'http:';
        return `${proto}//${host}${s}`;
      }
      // uploads path returned by server usually starts with '/uploads/'
      if (s.startsWith('/uploads/')) {
        const base = (apiUrl || '').replace(/\/$/, '');
        // prefer configured API URL; if missing, use current origin
        if (base) return `${base}${s}`;
        const proto = (typeof window !== 'undefined' && window.location && window.location.protocol) ? window.location.protocol : 'http:';
        const host = (typeof window !== 'undefined' && window.location && window.location.host) ? window.location.host : 'localhost';
        return `${proto}//${host}${s}`;
      }
      return s;
    } catch (e) { return raw; }
  };
  // `existingFlyer` holds the saved/canonical flyer shown to admins.
  // The editable `flyer` form is kept separate so admins can create a new campaign
  // without immediately editing the saved one. Use "Edit existing" to load
  // the saved flyer into the form for modifications.
  const [existingFlyers, setExistingFlyers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [flyer, setFlyer] = useState({ title: '', body: '', mediaUrl: '', mediaUrls: [], type: 'text', enabled: false, startAt: '', endAt: '' });
  const [mediaSource, setMediaSource] = useState('url'); // 'url' or 'upload'
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editExisting, setEditExisting] = useState(false);

  // Persist draft so leaving and returning to the dashboard preserves work-in-progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem('adminFlyerDraft');
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.flyer) {
          setFlyer(d.flyer);
          setEditExisting(!!d.editExisting);
          setEditingId(d.editingId || null);
        }
      }
    } catch (e) {
      // ignore JSON errors
    }
  }, [editExisting]);

  // Save draft on changes so returning to this page restores the state
  useEffect(() => {
    try {
      localStorage.setItem('adminFlyerDraft', JSON.stringify({ flyer, editExisting, editingId }));
    } catch (e) {}
  }, [flyer, editExisting, editingId]);

  // When admin toggles editExisting, populate or clear the editable form
  useEffect(() => {
    if (editExisting) {
      // if editingId set, load that flyer; otherwise load the most recent
      let f = null;
      if (editingId) f = existingFlyers.find(x => x._id === editingId);
      if (!f && existingFlyers && existingFlyers.length) f = existingFlyers[0];
      if (f) {
        setFlyer({ title: f.title || '', body: f.body || '', mediaUrl: f.mediaUrl || '', mediaUrls: f.mediaUrls || (f.mediaUrl ? [f.mediaUrl] : []), type: f.type || 'text', enabled: !!f.enabled, startAt: f.startAt ? new Date(f.startAt).toISOString().slice(0,16) : '', endAt: f.endAt ? new Date(f.endAt).toISOString().slice(0,16) : '' });
        setEditingId(f._id);
      }
    } else {
      // reset form for new draft
      setFlyer({ title: '', body: '', mediaUrl: '', mediaUrls: [], type: 'text', enabled: false, startAt: '', endAt: '' });
      setFiles([]);
      setPreviews([]);
      setEditingId(null);
    }
  }, [editExisting, existingFlyers, editingId]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${apiUrl}/api/admin/flyers`, { headers });
        if (res.data && res.data.flyers) {
            const list = res.data.flyers;
            setExistingFlyers(list || []);
            // If admin chose to edit existing but no editingId provided, load the most recent
            if (editExisting && list && list.length) {
              const f = list[0];
              setEditingId(f._id);
              setFlyer({ title: f.title || '', body: f.body || '', mediaUrl: f.mediaUrl || '', mediaUrls: f.mediaUrls || (f.mediaUrl ? [f.mediaUrl] : []), type: f.type || 'text', enabled: !!f.enabled, startAt: f.startAt ? new Date(f.startAt).toISOString().slice(0,16) : '', endAt: f.endAt ? new Date(f.endAt).toISOString().slice(0,16) : '' });
            }
          }
      } catch (e) {
        setAlert({ type: 'error', message: 'Failed to load flyer' });
      } finally { setLoading(false); }
    })();
  }, [editExisting]);

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // If uploading a file, send multipart/form-data
      let res = null;
      if (mediaSource === 'upload' && files && files.length) {
        const form = new FormData();
        // append multiple files under 'files'
        for (let i = 0; i < files.length; i++) {
          form.append('files', files[i]);
        }
        // include any explicit mediaUrls added via URL mode
        if (flyer.mediaUrls && flyer.mediaUrls.length) form.append('mediaUrls', JSON.stringify(flyer.mediaUrls));
        form.append('title', flyer.title || '');
        form.append('body', flyer.body || '');
        form.append('type', flyer.type || 'text');
        form.append('enabled', flyer.enabled ? '1' : '0');
        if (flyer.startAt) form.append('startAt', flyer.startAt);
        if (flyer.endAt) form.append('endAt', flyer.endAt);
        // include editExisting flag so backend knows whether to update or create
        form.append('editExisting', editExisting ? '1' : '0');
        if (editingId) form.append('id', editingId);
        // let axios set Content-Type for FormData
        res = await axios.put(`${apiUrl}/api/admin/flyer`, form, { headers });
      } else {
        const payload = { ...flyer };
        payload.editExisting = editExisting;
        if (editingId) payload.id = editingId;
        // convert ISO local datetime back to Date strings
        if (!payload.startAt) delete payload.startAt;
        if (!payload.endAt) delete payload.endAt;
  // Use singular endpoint to match backend route
  res = await axios.put(`${apiUrl}/api/admin/flyer`, payload, { headers });
      }
      if (res.data && res.data.flyer) {
        // if server returned a mediaUrl (uploaded), update flyer
        const f = res.data.flyer;
        setFlyer({
          title: f.title || '',
          body: f.body || '',
          mediaUrl: f.mediaUrl || flyer.mediaUrl || '',
          mediaUrls: f.mediaUrls || (f.mediaUrl ? [f.mediaUrl] : []) || [],
          type: f.type || flyer.type || 'text',
          enabled: !!f.enabled,
          startAt: f.startAt ? new Date(f.startAt).toISOString().slice(0,16) : (flyer.startAt || ''),
          endAt: f.endAt ? new Date(f.endAt).toISOString().slice(0,16) : (flyer.endAt || ''),
        });
        setAlert({ type: 'success', message: 'Flyer saved' });
        // refresh list
        (async () => {
          const token = localStorage.getItem('adminToken');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res2 = await axios.get(`${apiUrl}/api/admin/flyers`, { headers });
          if (res2.data && res2.data.flyers) setExistingFlyers(res2.data.flyers);
        })();
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Failed to save flyer' });
    } finally { setSaving(false); }
  };

  const handleEditMedia = (u) => {
    // Find the flyer that contains this media and load it into the form
    const f = existingFlyers.find(x => (x.mediaUrls || []).includes(u) || x.mediaUrl === u);
    if (!f) return;
    setEditExisting(true);
    setEditingId(f._id);
    setFlyer({
      title: f.title || '',
      body: f.body || '',
      mediaUrl: u || f.mediaUrl || '',
      mediaUrls: u ? [u] : (f.mediaUrls || (f.mediaUrl ? [f.mediaUrl] : [])),
      type: f.type || 'text',
      enabled: !!f.enabled,
      startAt: f.startAt ? new Date(f.startAt).toISOString().slice(0,16) : '',
      endAt: f.endAt ? new Date(f.endAt).toISOString().slice(0,16) : ''
    });
    setFiles([]);
    setPreviews([]);
  };

  const handleRemoveMedia = async (idx) => {
    // Confirm removal
    const ok = window.confirm('Remove this media from the flyer?');
    if (!ok) return;
    const newMedia = (flyer.mediaUrls || []).filter((_, i) => i !== idx);
    setFlyer({ ...flyer, mediaUrls: newMedia });
    // If editing an existing saved flyer, persist removal immediately
    if (editExisting && editingId) {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const payload = { editExisting: true, id: editingId, mediaUrls: newMedia, replaceMedia: true };
        await axios.put(`${apiUrl}/api/admin/flyer`, payload, { headers });
        // refresh list
        const res2 = await axios.get(`${apiUrl}/api/admin/flyers`, { headers });
        if (res2.data && res2.data.flyers) setExistingFlyers(res2.data.flyers);
        setAlert({ type: 'success', message: 'Media removed' });
      } catch (e) {
        setAlert({ type: 'error', message: 'Failed to remove media' });
      }
    }
  };

  // Remove a single media item from a saved flyer (by flyer id and media index)
  const handleRemoveMediaFromSaved = async (flyerId, mediaIdx) => {
    const ok = window.confirm('Remove this media from the saved flyer?');
    if (!ok) return;
    try {
      const f = existingFlyers.find(x => x._id === flyerId);
      if (!f) return;
      const existing = f.mediaUrls || (f.mediaUrl ? [f.mediaUrl] : []);
      const newMedia = existing.filter((_, i) => i !== mediaIdx);
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const payload = { editExisting: true, id: flyerId, mediaUrls: newMedia, replaceMedia: true };
  await axios.put(`${apiUrl}/api/admin/flyer`, payload, { headers });
      // refresh list
      const res2 = await axios.get(`${apiUrl}/api/admin/flyers`, { headers });
      if (res2.data && res2.data.flyers) setExistingFlyers(res2.data.flyers);
      setAlert({ type: 'success', message: 'Media removed' });
    } catch (e) {
      setAlert({ type: 'error', message: 'Failed to remove media' });
    }
  };

  const handleEditFlyer = (f) => {
    setEditExisting(true);
    setEditingId(f._id);
    setFlyer({ title: f.title || '', body: f.body || '', mediaUrl: f.mediaUrl || '', mediaUrls: f.mediaUrls || (f.mediaUrl ? [f.mediaUrl] : []), type: f.type || 'text', enabled: !!f.enabled, startAt: f.startAt ? new Date(f.startAt).toISOString().slice(0,16) : '', endAt: f.endAt ? new Date(f.endAt).toISOString().slice(0,16) : '' });
    setFiles([]);
    setPreviews([]);
  };

  const toggleEnable = async (flyerId, value) => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = { editExisting: true, id: flyerId, enabled: value };
      await axios.put(`${apiUrl}/api/admin/flyer`, payload, { headers });
      // refresh list
      const res2 = await axios.get(`${apiUrl}/api/admin/flyers`, { headers });
      if (res2.data && res2.data.flyers) setExistingFlyers(res2.data.flyers);
    } catch (e) {
      setAlert({ type: 'error', message: 'Failed to update flyer' });
    }
  };

  return (
    <div style={{ padding: 20 }}>
          <h2>Manage Dashboard Flyer / Campaigns</h2>
          <div style={{ marginBottom: 12 }}>
            <label style={{ marginRight: 12 }}>
              <input type="checkbox" checked={editExisting} onChange={(e) => setEditExisting(e.target.checked)} /> Edit existing saved flyer
            </label>
            <small style={{ color: '#666' }}>When unchecked the form creates/edits a separate draft; the saved flyer is shown below.</small>
          </div>
          {/* Existing saved flyers preview list (read-only). Show each saved flyer with its own Enable and Edit controls. */}
          {existingFlyers && existingFlyers.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <h3>Saved Flyers</h3>
              {existingFlyers.map((ef, idx) => (
                <div key={ef._id || idx} style={{ marginBottom: 12, padding: 12, border: '1px solid #eee', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: '0 0 280px' }}>
                    <div style={{ marginBottom: 6 }}><strong>{ef.title}</strong></div>
                    <div style={{ marginBottom: 6 }}>{ef.body}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" checked={!!ef.enabled} onChange={(e) => toggleEnable(ef._id, e.target.checked)} /> Enabled
                      </label>
                      <button onClick={() => handleEditFlyer(ef)}>Edit</button>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div><strong>Media</strong></div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(ef.mediaUrls || (ef.mediaUrl ? [ef.mediaUrl] : [])).map((u, i) => (
                        <div key={i} style={{ width: 220, position: 'relative', borderRadius: 6, overflow: 'hidden', background: '#f8f8f8' }}>
                          <a href={resolveMediaUrl(u)} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                            {u.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img src={resolveMediaUrl(u)} alt={`media-${i}`} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                            ) : (
                              <video src={resolveMediaUrl(u)} controls style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                            )}
                          </a>
                          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                            <button onClick={() => handleEditMedia(u)} style={{ padding: '6px 8px', fontSize: 12 }}>Edit</button>
                            <button onClick={() => handleRemoveMediaFromSaved(ef._id, i)} style={{ padding: '6px 8px', fontSize: 12 }}>Remove</button>
                          </div>
                          <div style={{ padding: 8, wordBreak: 'break-all', fontSize: 12, background: '#fff' }}>{u}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      {alert && <div style={{ marginBottom: 12, color: alert.type === 'error' ? 'red' : 'green' }}>{alert.message}</div>}
      {loading ? <div>Loading...</div> : (
        <div style={{ maxWidth: 800 }}>
          <div style={{ marginBottom: 12 }}>
            <label>Enabled: </label>
            <input type="checkbox" checked={flyer.enabled} onChange={(e) => setFlyer({ ...flyer, enabled: e.target.checked })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Type: </label>
            <select value={flyer.type} onChange={(e) => setFlyer({ ...flyer, type: e.target.value })}>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="html">HTML</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Title</label>
            <input value={flyer.title} onChange={(e) => setFlyer({ ...flyer, title: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Body</label>
            <textarea value={flyer.body} onChange={(e) => setFlyer({ ...flyer, body: e.target.value })} style={{ width: '100%', minHeight: 80 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Media source</label>
            <div style={{ marginTop: 6 }}>
              <label style={{ marginRight: 12 }}>
                <input type="radio" name="mediaSource" value="url" checked={mediaSource === 'url'} onChange={() => setMediaSource('url')} /> Use URL
              </label>
              <label>
                <input type="radio" name="mediaSource" value="upload" checked={mediaSource === 'upload'} onChange={() => setMediaSource('upload')} /> Upload file
              </label>
            </div>
            {mediaSource === 'url' ? (
              <div style={{ marginTop: 8 }}>
                <label>Media URL (image or video)</label>
                <input value={flyer.mediaUrl} onChange={(e) => setFlyer({ ...flyer, mediaUrl: e.target.value })} style={{ width: '100%' }} />
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <label>Upload file (image/video)</label>
                    <input type="file" accept="image/*,video/*" multiple onChange={(e) => {
                      const fl = e.target.files ? Array.from(e.target.files) : [];
                      setFiles(fl);
                      // build previews
                      const p = fl.map(f => {
                        try { return URL.createObjectURL(f); } catch (_) { return ''; }
                      });
                      setPreviews(p);
                    }} />
                    {previews && previews.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        {previews.map((pv, i) => (
                          <div key={i}>
                            {files[i] && files[i].type.startsWith('image') ? (
                              <img src={pv} alt={`preview-${i}`} style={{ maxWidth: 160, maxHeight: 120 }} />
                            ) : (
                              <video src={pv} controls style={{ maxWidth: 200, maxHeight: 160 }} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
              </div>
            )}
          </div>
              <div style={{ marginBottom: 12 }}>
                <label>Existing media for this campaign</label>
                <div style={{ marginTop: 8 }}>
                  {(flyer.mediaUrls || []).map((u, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                      {u.match(/\.(jpg|jpeg|png|gif)$/i) ? <img src={resolveMediaUrl(u)} alt="m" style={{ width: 120, height: 80, objectFit: 'cover', marginRight: 8 }} /> : <video src={resolveMediaUrl(u)} style={{ width: 160, height: 90, marginRight: 8 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ wordBreak: 'break-all' }}>{u}</div>
                        <div>
                          <button onClick={() => handleEditMedia(u)} style={{ marginRight: 8 }}>Edit</button>
                          <button onClick={() => handleRemoveMedia(idx)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          <div style={{ marginBottom: 12 }}>
            <label>Start (optional)</label>
            <input type="datetime-local" value={flyer.startAt} onChange={(e) => setFlyer({ ...flyer, startAt: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>End (optional)</label>
            <input type="datetime-local" value={flyer.endAt} onChange={(e) => setFlyer({ ...flyer, endAt: e.target.value })} />
          </div>
          <div>
            <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Flyer'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlyer;
