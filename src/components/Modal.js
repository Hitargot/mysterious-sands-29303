import React, { useEffect } from 'react';

const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9',
};

const Modal = ({
  // Core visibility / basic content props
  show,
  children,
  onClose,
  title,

  // Notification-specific props (optional)
  onSendNotification,
  users = [],
  selectedUserIds = [],
  handleUserSelection,
  message,
  setMessage,
  searchQuery = '',
  setSearchQuery
}) => {
  useEffect(() => {
    if (!show) return;
    function onKey(e) { if (e.key === 'Escape') onClose && onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, show]);

  if (!show) return null;

  const handleSelectAll = () => {
    if (!handleUserSelection) return;
    if (selectedUserIds.length === users.length) {
      handleUserSelection([]);
    } else {
      handleUserSelection(users.map(user => user._id));
    }
  };

  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose && onClose();
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(10,15,30,0.7)',
    border: `1px solid ${G.goldBorder}`,
    borderRadius: 8, padding: '9px 12px',
    color: G.white, fontSize: '0.88rem', outline: 'none',
    marginBottom: 8,
  };

  return (
    <div
      onClick={onOverlayClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        style={{
          background: G.navy2,
          border: `1px solid ${G.goldBorder}`,
          borderRadius: 20,
          width: '100%', maxWidth: 480,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${G.navy4}, ${G.navy3})`,
          borderBottom: `1px solid ${G.goldBorder}`,
          borderRadius: '20px 20px 0 0',
          padding: '18px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {title
            ? <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: G.white }}>{title}</h2>
            : <span />}
          <button
            onClick={() => onClose && onClose()}
            style={{
              background: 'rgba(255,255,255,0.06)', border: `1px solid ${G.goldBorder}`,
              borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: G.slate, fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            &#x2715;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {children}

          {/* Notification user-selection UI */}
          {(handleUserSelection || users.length > 0) && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <input
                  type="checkbox"
                  checked={users.length > 0 && selectedUserIds.length === users.length}
                  onChange={handleSelectAll}
                  style={{ accentColor: G.gold, width: 16, height: 16 }}
                />
                <label style={{ color: G.slate, fontSize: '0.85rem' }}>Select All</label>
              </div>

              {users && users.length > 0 && (
                <>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={e => setSearchQuery && setSearchQuery(e.target.value)}
                    style={inputStyle}
                  />
                  <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {users
                      .filter(user => {
                        const q = (searchQuery || '').toLowerCase();
                        return !q || user.username.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
                      })
                      .map(user => (
                        <label key={user._id} style={{
                          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                          padding: '7px 10px', borderRadius: 8,
                          background: selectedUserIds.includes(user._id) ? G.goldFaint : 'transparent',
                          border: `1px solid ${selectedUserIds.includes(user._id) ? G.goldBorder : 'transparent'}`,
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user._id)}
                            onChange={() => handleUserSelection && handleUserSelection(user._id)}
                            style={{ accentColor: G.gold, width: 14, height: 14 }}
                          />
                          <span style={{ color: G.white, fontSize: '0.85rem' }}>{user.username}</span>
                          <span style={{ color: G.slateD, fontSize: '0.78rem', marginLeft: 'auto' }}>{user.email}</span>
                        </label>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Message textarea */}
          {typeof setMessage === 'function' && (
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 700, color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Notification Message
              </label>
              <textarea
                value={message || ''}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter the notification message"
                style={{ ...inputStyle, minHeight: 90, resize: 'vertical', marginBottom: 0 }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 20px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                background: 'transparent', border: `1px solid ${G.goldBorder}`, color: G.slate,
              }}
            >
              Close
            </button>
            {typeof onSendNotification === 'function' && (
              <button
                onClick={onSendNotification}
                style={{
                  padding: '9px 20px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
                  border: 'none', color: G.navy,
                }}
              >
                Send Notification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
