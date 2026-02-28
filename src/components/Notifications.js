import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { FaBell, FaEnvelope, FaCheckDouble, FaTimes } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.25)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
  greenFaint: 'rgba(52,211,153,0.12)', redFaint: 'rgba(248,113,113,0.12)',
  unreadBg: 'rgba(245,166,35,0.07)',
};

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount, fetchNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const triggerRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);

  // Esc key close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try { await fetchNotifications(); }
      finally { setIsLoading(false); }
    };
    init();
  }, [fetchNotifications]);

  const toggle = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen((v) => !v);
  };

  return (
    <>
      {/* ── Bell trigger ── */}
      <button
        ref={triggerRef}
        onClick={toggle}
        aria-label="Notifications"
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: '6px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: isOpen ? G.gold : G.slate,
          transition: 'color 180ms ease',
        }}
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: G.red, color: '#fff', borderRadius: '50%',
            width: 17, height: 17, fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${G.navy2}`, lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Portal modal ── */}
      {isOpen && ReactDOM.createPortal(
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: G.navy2, border: `1px solid ${G.goldBorder}`,
              borderRadius: 20, width: 'min(440px, 100%)',
              maxHeight: '82vh', display: 'flex', flexDirection: 'column',
              overflow: 'hidden', boxShadow: '0 0 50px rgba(245,166,35,0.15)',
              animation: 'ntf-in 220ms cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Gold top bar */}
            <div style={{
              height: 4, flexShrink: 0,
              background: `linear-gradient(90deg,${G.gold},${G.goldLight})`,
              borderRadius: '20px 20px 0 0',
            }} />

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px 12px', flexShrink: 0,
              borderBottom: `1px solid rgba(255,255,255,0.06)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(245,166,35,0.3)', flexShrink: 0,
                }}>
                  <FaBell style={{ color: G.navy, fontSize: 15 }} />
                </div>
                <div>
                  <div style={{ color: G.gold, fontWeight: 700, fontSize: 16 }}>Notifications</div>
                  {unreadCount > 0 && (
                    <div style={{ color: G.slateD, fontSize: 11, marginTop: 1 }}>
                      {unreadCount} unread
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Mark all read */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    style={{
                      background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
                      borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                      color: G.gold, fontSize: 12, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    <FaCheckDouble size={11} /> Mark all read
                  </button>
                )}
                {/* Close */}
                <button
                  onClick={close}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: 'none',
                    borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
                    color: G.slate, padding: 0, lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'thin', scrollbarColor: `${G.goldBorder} transparent` }}>
              {isLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: G.slateD, fontSize: 14 }}>
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <FaEnvelope style={{ color: G.slateD, fontSize: 32, marginBottom: 12 }} />
                  <div style={{ color: G.slateD, fontSize: 14 }}>No notifications yet</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => markAsRead(n._id)}
                    style={{
                      display: 'flex', gap: 12, padding: '14px 20px',
                      borderBottom: `1px solid rgba(255,255,255,0.05)`,
                      cursor: 'pointer',
                      background: n.read ? 'transparent' : G.unreadBg,
                      transition: 'background 200ms ease',
                    }}
                  >
                    {/* Dot / icon */}
                    <div style={{ paddingTop: 3, flexShrink: 0 }}>
                      {n.read ? (
                        <FaEnvelope style={{ color: G.slateD, fontSize: 14, opacity: 0.5 }} />
                      ) : (
                        <div style={{
                          width: 9, height: 9, borderRadius: '50%',
                          background: G.gold, marginTop: 3,
                          boxShadow: '0 0 6px rgba(245,166,35,0.6)',
                        }} />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: n.read ? G.slate : G.white,
                        fontWeight: n.read ? 500 : 700,
                        fontSize: 14, marginBottom: 3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {n.title}
                      </div>
                      <div style={{
                        color: G.slateD, fontSize: 13, lineHeight: 1.5,
                        overflow: 'hidden',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {n.message}
                      </div>
                      <div style={{ color: G.slateD, fontSize: 11, marginTop: 5, opacity: 0.7 }}>
                        {dayjs(n.createdAt).fromNow()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px', flexShrink: 0,
              borderTop: `1px solid rgba(255,255,255,0.06)`,
              textAlign: 'center',
            }}>
              <button
                onClick={close}
                style={{
                  padding: '9px 32px', borderRadius: 10,
                  border: `1px solid ${G.goldBorder}`, background: 'transparent',
                  color: G.gold, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes ntf-in {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Notifications;
