import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'preSubmissionGuidelineCollapsed';

const PreSubmissionGuideline = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setCollapsed(saved === 'true');
    } else {
      // default: collapsed on mobile, expanded on desktop
      setCollapsed(isMobile);
    }
  }, [isMobile]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch (e) {}
  };

  return (
    <div style={containerBase}>
      <div style={headerRow}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Pre-submission guidelines</div>
        <button onClick={toggle} aria-expanded={!collapsed} style={toggleBtn}>
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      {!collapsed && (
        <div style={content}>
          <p style={{ margin: '6px 0' }}>
            Use pre-submission to schedule withdrawal processing. The system's default processing window is 24 hours, but if
            you want the withdrawal to happen on a later day you can pre-submit and choose how many days remain until your
            withdraw day.
          </p>
          <p style={{ margin: '6px 0' }}><strong>Tips</strong></p>
          <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
            <li>Pick the number of days left until your intended withdraw day (1–5).</li>
            <li>Attach proof files (screenshots, receipts) so we can verify the request.</li>
            <li><strong>Complete</strong>: mark the pre-submission as processed and create a confirmation (use when withdrawal is done).</li>
            <li><strong>Cancel</strong>: stop processing and remove this pre-submission if you no longer need it.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const containerBase = {
  background: '#fff',
  border: '1px solid #e6e6e6',
  padding: 8,
  borderRadius: 8,
  marginBottom: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 8px'
};

const toggleBtn = {
  background: '#162660',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(22,38,96,0.12)'
};

const content = {
  fontSize: 13,
  color: '#333',
  lineHeight: 1.4,
  padding: '4px 8px'
};

export default PreSubmissionGuideline;
