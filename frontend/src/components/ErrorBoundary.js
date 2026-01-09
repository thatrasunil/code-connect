import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
        // Here you would log to a monitoring service (e.g., Sentry)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '400px',
                    padding: '20px',
                    color: '#e2e8f0',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    <FaExclamationTriangle size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Something went wrong</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '20px', maxWidth: '400px' }}>
                        We encountered an unexpected error. You can try refreshing the page or try again later.
                    </p>
                    {this.state.error && (
                        <div style={{
                            textAlign: 'left',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '20px',
                            fontSize: '0.8rem',
                            color: '#f87171',
                            maxWidth: '100%',
                            overflow: 'auto'
                        }}>
                            <code style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.toString()}</code>
                        </div>
                    )}

                    <button
                        onClick={this.handleRetry}
                        style={{
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'background 0.2s'
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
