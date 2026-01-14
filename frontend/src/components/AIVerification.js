import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaLightbulb, FaTrophy } from 'react-icons/fa';

const AIVerification = ({ verification, loading }) => {
    if (loading) {
        return (
            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#e2e8f0'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                    AI Verification
                </h3>
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8'
                }}>
                    <div className="spinner" style={{
                        border: '3px solid rgba(255, 255, 255, 0.1)',
                        borderTop: '3px solid #8b5cf6',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>Analyzing your solution with AI...</p>
                </div>
            </div>
        );
    }

    if (!verification) {
        return null;
    }

    if (verification.error) {
        return (
            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#e2e8f0'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                    AI Verification
                </h3>
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: '#f87171'
                }}>
                    {verification.error}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#e2e8f0'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                AI Verification
            </h3>

            {/* Status */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: verification.isCorrect
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                border: `1px solid ${verification.isCorrect ? '#10b981' : '#ef4444'}`,
                marginBottom: '1rem'
            }}>
                {verification.isCorrect ? (
                    <>
                        <FaCheckCircle style={{ color: '#10b981', fontSize: '1.5rem' }} />
                        <div>
                            <div style={{ fontWeight: '600', color: '#10b981' }}>Solution Correct!</div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                Your solution passes all test cases
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <FaTimesCircle style={{ color: '#ef4444', fontSize: '1.5rem' }} />
                        <div>
                            <div style={{ fontWeight: '600', color: '#ef4444' }}>Needs Improvement</div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                Review the feedback below
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Score */}
            {verification.score !== undefined && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid #8b5cf6',
                    marginBottom: '1rem'
                }}>
                    <FaTrophy style={{ color: '#a78bfa', fontSize: '1.5rem' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                            Code Quality Score
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '1.5rem', color: '#a78bfa' }}>
                            {verification.score}/100
                        </div>
                    </div>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: `conic-gradient(#8b5cf6 ${verification.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600'
                        }}>
                            {verification.score}%
                        </div>
                    </div>
                </div>
            )}

            {/* Complexity Analysis */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
            }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: '600' }}>
                    Complexity Analysis
                </h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                            Time Complexity
                        </div>
                        <div style={{
                            fontFamily: 'monospace',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#60a5fa'
                        }}>
                            {verification.timeComplexity || 'N/A'}
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                            Space Complexity
                        </div>
                        <div style={{
                            fontFamily: 'monospace',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#34d399'
                        }}>
                            {verification.spaceComplexity || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedbacks */}
            {verification.feedbacks && verification.feedbacks.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: '600' }}>
                        Feedback
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {verification.feedbacks.map((feedback, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    borderLeft: '3px solid #8b5cf6'
                                }}
                            >
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: '#a78bfa',
                                    marginBottom: '0.25rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {feedback.type}
                                </div>
                                <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    {feedback.message}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {verification.suggestions && verification.suggestions.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{
                        margin: '0 0 0.75rem 0',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <FaLightbulb style={{ color: '#fbbf24' }} />
                        Suggestions
                    </h4>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        {verification.suggestions.map((suggestion, idx) => (
                            <li key={idx} style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Edge Cases */}
            {verification.edgeCases && verification.edgeCases.length > 0 && (
                <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: '600' }}>
                        Edge Cases to Consider
                    </h4>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        {verification.edgeCases.map((edgeCase, idx) => (
                            <li key={idx} style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#fbbf24' }}>
                                {edgeCase}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default AIVerification;
