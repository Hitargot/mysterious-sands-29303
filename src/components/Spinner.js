import React from 'react';

// Small presentational spinner. Accepts `size` (px) and optional className.
export default function Spinner({ size = 14, className = '' }) {
  const style = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    borderRadius: '50%',
    boxSizing: 'border-box',
    border: '2px solid rgba(0,0,0,0.08)',
    borderTopColor: '#162660',
  };

  return <div className={`spinner ${className}`} style={style} aria-hidden="true" />;
}
