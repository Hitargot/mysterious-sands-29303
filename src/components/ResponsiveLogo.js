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

  // Prevent caller-provided height/width from overriding responsive sizing
  const { height: _height, width: _width, ...restStyle } = style || {};

  return (
    <img
      src={require('../assets/images/IMG_940.PNG')}
      alt={alt}
      className={className}
      style={{ height, width: 'auto', maxWidth: '100%', ...restStyle }}
    />
  );
}
