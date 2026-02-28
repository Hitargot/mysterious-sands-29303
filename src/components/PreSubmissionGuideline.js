import React, { useState, useEffect } from 'react';
import { FaInfoCircle, FaChevronDown, FaChevronUp, FaCheckCircle } from 'react-icons/fa';

const G = {
  navy2: '#0F172A', navy4: '#1E293B',
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)',
  green: '#34D399', greenFaint: 'rgba(52,211,153,0.10)',
  white: '#F1F5F9', slate: '#94A3B8', slateD: '#64748B',
};

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
      setCollapsed(isMobile);
    }
  }, [isMobile]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch (e) {}
  };

  const tips = [
    { text: 'Pick the number of days left until your intended withdraw day (1–5).' },
    { text: 'Attach proof files (screenshots, receipts) so we can verify the request.' },
    { text: <><strong style={{ color: G.white }}>Complete</strong>: mark as processed and create a confirmation (use when withdrawal is done).</> },
    { text: <><strong style={{ color: G.white }}>Cancel</strong>: stop processing and remove this pre-submission if you no longer need it.</> },
  ];

  return (
    <div style={{
      background: G.navy2, borderRadius: 12, marginBottom: 16,
      border: `1px solid ${G.goldBorder}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={toggle}
        aria-expanded={!collapsed}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 16px', background: 'transparent', border: 'none',
          cursor: 'pointer', gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: G.gold, flexShrink: 0,
          }}>
            <FaInfoCircle />
          </div>
          <span style={{ color: G.goldLight, fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }}>
            Pre-Submission Guidelines
          </span>
        </div>
        <span style={{ color: G.slateD, fontSize: 13 }}>
          {collapsed ? <FaChevronDown /> : <FaChevronUp />}
        </span>
      </button>

      {/* Body */}
      {!collapsed && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid rgba(245,166,35,0.12)` }}>
          <p style={{ margin: '14px 0 12px', color: G.slate, fontSize: '0.83rem', lineHeight: 1.65 }}>
            Use pre-submission to schedule withdrawal processing. The default window is <strong style={{ color: G.white }}>24 hours</strong>, but
            if you want processing on a later day you can pre-submit and choose how many days remain until your withdraw day.
          </p>

          <div style={{ color: G.goldLight, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Tips
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tips.map((tip, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 9,
                background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.05)', padding: '9px 12px',
              }}>
                <FaCheckCircle style={{ color: G.gold, fontSize: 12, marginTop: 2, flexShrink: 0 }} />
                <span style={{ color: G.slate, fontSize: '0.82rem', lineHeight: 1.55 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreSubmissionGuideline;
