import React from 'react';

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
};
const imgStyle = { maxWidth: '90%', maxHeight: '90%', borderRadius: 8, boxShadow: '0 6px 30px rgba(0,0,0,0.5)' };
const closeBtn = { position: 'fixed', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', border: 'none', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' };

export default function Lightbox({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <button aria-label="Close" style={closeBtn} onClick={() => onClose && onClose()}>Close</button>
      <img src={src} alt={alt || 'preview'} style={imgStyle} />
    </div>
  );
}
