import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log to an error reporting service here
    console.error('ErrorBoundary caught error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 12, background: '#fee2e2', borderRadius: 8, color: '#991b1b' }}>
          <strong>Something went wrong rendering this dialog.</strong>
          <div style={{ marginTop: 8 }}>{String(this.state.error)}</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 12px' }}>
              Dismiss
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
