import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#991b1b',
          color: 'white',
          padding: '40px',
          zIndex: 100000,
          fontFamily: 'monospace',
          overflow: 'auto',
          textAlign: 'left'
        }}>
          <h1 style={{fontSize: '24px', marginBottom: '20px'}}>⚠️ React Engine Crash</h1>
          <div style={{background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px'}}>
            <p><strong>Error:</strong> {this.state.error?.toString()}</p>
            <pre style={{marginTop: '20px', whiteSpace: 'pre-wrap', fontSize: '12px'}}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{marginTop: '20px', padding: '10px 20px', background: 'white', color: '#991b1b', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'}}
          >
            Force System Restart
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
