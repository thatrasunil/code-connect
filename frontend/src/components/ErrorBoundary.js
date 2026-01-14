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
        console.error("💥 Global Error Caught by Boundary:");
        console.error("Error Object:", error);

        if (typeof error === 'object') {
            try {
                console.error("JSON Stringify:", JSON.stringify(error, null, 2));
            } catch (e) {
                console.error("Could not stringify error");
            }
        }

        this.setState({
            error: error,
            errorInfo: errorInfo
        });
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
                            <code style={{ whiteSpace: 'pre-wrap' }}>
                                {(() => {
                                    const err = this.state.error;
                                    if (!err) return '';
                                    if (typeof err === 'string') return err;
                                    if (err instanceof Error) {
                                        return `${err.toString()}\n\nStack:\n${err.stack}`;
                                    }
                                    if (typeof err === 'object') {
                                        try {
                                            return JSON.stringify(err, null, 2);
                                        } catch (e) {
                                            // Circular reference or other stringify error
                                            const keys = Object.keys(err).join(', ');
                                            const name = err.name || err.constructor.name || 'Object';
                                            const message = err.message || '';
                                            return `[Circular Object: ${name}]\nMessage: ${message}\nKeys: ${keys}\n\nFallback String: ${String(err)}`;
                                        }
                                    }
                                    return String(err);
                                })()}
                                {'\n\nComponent Stack:\n'}
                                {this.state.errorInfo ? this.state.errorInfo.componentStack : ''}
                            </code>
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
