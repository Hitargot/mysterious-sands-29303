import React, { useState, useEffect } from 'react';

export default function ResponsiveLogo({ alt = 'Exdollarium', style = {}, className, variant = 'large' }) {
  const isClient = typeof window !== 'undefined';
  const [isMobile, setIsMobile] = useState(isClient ? window.innerWidth <= 768 : false);

  useEffect(() => {
    if (!isClient) return;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isClient]);

  // Variants: 'large' (header) and 'small' (sidebar)
  const sizes = {
    large: { desktop: '140px', mobile: '80px' },
    small: { desktop: '48px', mobile: '36px' },
  };

  const chosen = sizes[variant] || sizes.large;
  const height = isMobile ? chosen.mobile : chosen.desktop;

  // Allow caller to override the responsive height/width by passing them in the `style` prop.
  // If caller does not provide them, fall back to the responsive `height` computed above.
  const { height: callerHeight, width: callerWidth, ...restStyle } = style || {};
  const finalHeight = callerHeight || height;
  const finalWidth = callerWidth || height; // default to square area unless caller specifies width

  return (
    <img
      src={require('../assets/images/IMG_940.PNG')}
      alt={alt}
      className={className}
      // Reserve a square area (width == height) to avoid layout shift while image loads
      style={{ height: finalHeight, width: finalWidth, maxWidth: '100%', objectFit: 'contain', ...restStyle }}
    />
  );
}
