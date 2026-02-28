import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

const G = {
  navy: '#0A0F1E', navy2: '#0F172A', navy4: '#1E293B',
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)',
  red: '#F87171', redFaint: 'rgba(248,113,113,0.10)',
  white: '#F1F5F9', slate: '#94A3B8', slateD: '#64748B',
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: G.navy2, borderRadius: 14, padding: '28px 20px',
          border: `1px solid rgba(248,113,113,0.22)`,
        }}>
          <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>

            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: G.redFaint, border: '1.5px solid rgba(248,113,113,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '1.4rem', color: G.red,
            }}>
              <FaExclamationTriangle />
            </div>

            <h3 style={{ margin: '0 0 8px', color: G.white, fontSize: '1.05rem', fontWeight: 700 }}>
              Something went wrong
            </h3>
            <p style={{ margin: '0 0 16px', color: G.slate, fontSize: '0.83rem', lineHeight: 1.55 }}>
              An unexpected error occurred while rendering this section.
            </p>

            {/* Error detail */}
            <div style={{
              background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              fontFamily: 'monospace', fontSize: '0.77rem', color: G.red,
              textAlign: 'left', wordBreak: 'break-word', lineHeight: 1.5,
            }}>
              {String(this.state.error)}
            </div>

            {/* Retry button */}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: G.goldFaint, color: G.goldLight,
                border: `1px solid ${G.goldBorder}`, borderRadius: 100,
                padding: '9px 22px', fontSize: '0.84rem', fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.03em',
              }}
            >
              <FaRedo style={{ fontSize: 12 }} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

