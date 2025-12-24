import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBell, FaEnvelope, FaCheckDouble } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const THEME = {
  bg: '#f1e4d1',        // Soft beige
  text: '#162660',      // Deep blue
  unread: '#d0e6fd',    // Light blue highlight
  accent: '#ff7a00',    // Orange action color
  border: 'rgba(22, 38, 96, 0.15)',
};

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount, fetchNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close handlers
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) closeDropdown();
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeDropdown();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, closeDropdown]);

  // Initial Fetch
  useEffect(() => {
    const initFetch = async () => {
      setIsLoading(true);
      try { await fetchNotifications(); } 
      finally { setIsLoading(false); }
    };
    initFetch();
  }, [fetchNotifications]);

  const toggleDropdown = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', fontFamily: 'Inter, sans-serif', marginLeft: '12px' }}>
      
      {/* --- TRIGGER BELL --- */}
      <button
        onClick={toggleDropdown}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          color: THEME.text,
          transition: 'transform 0.2s',
        }}
      >
        <FaBell size={24} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: THEME.accent,
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: `2px solid ${THEME.bg}`
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* --- DROPDOWN PANEL --- */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '90%',
          right: 0,
          width: '320px',
          maxHeight: '500px',
          backgroundColor: THEME.bg,
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          border: `1px solid ${THEME.border}`,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${THEME.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: THEME.text }}>Notifications</h3>
            <button 
              onClick={markAllAsRead}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: THEME.text, 
                fontSize: '0.8rem', 
                cursor: 'pointer',
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FaCheckDouble /> Mark all read
            </button>
          </div>

          {/* List Area */}
          <div style={{ overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: THEME.text }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: THEME.text, opacity: 0.5 }}>
                <FaEnvelope size={32} style={{ marginBottom: '8px', display: 'block', margin: '0 auto' }} />
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: `1px solid ${THEME.border}`,
                    cursor: 'pointer',
                    backgroundColor: n.read ? '#fff' : THEME.unread,
                    display: 'flex',
                    gap: '12px',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ marginTop: '4px' }}>
                    {!n.read ? (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: THEME.accent }} />
                    ) : (
                      <FaEnvelope opacity={0.3} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.9rem', color: THEME.text, marginBottom: '2px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: THEME.text, opacity: 0.8, lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '6px', color: THEME.text, opacity: 0.5 }}>
                      {dayjs(n.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          <div style={{ padding: '12px', textAlign: 'center', borderTop: `1px solid ${THEME.border}` }}>
             <button 
                onClick={closeDropdown}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: THEME.text,
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
             >
               Close
             </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Notifications;