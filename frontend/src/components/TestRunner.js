import React, { useState } from 'react';
import { FaPlay, FaCheckCircle, FaTimesCircle, FaClock, FaMemory } from 'react-icons/fa';

const TestRunner = ({ problem, code, language, onTestComplete }) => {
    const [testResults, setTestResults] = useState(null);
    const [running, setRunning] = useState(false);
    const [expandedTest, setExpandedTest] = useState(null);

    const runTests = async () => {
        if (!code || !code.trim()) {
            alert('Please write some code first!');
            return;
        }

        setRunning(true);
        setTestResults(null);

        try {
            // Import problem service
            const ProblemService = (await import('../services/problemService')).default;

            // Get user info from localStorage
            const userId = localStorage.getItem('userId') || 'anonymous';
            const userName = localStorage.getItem('userName') || 'Anonymous';
            const roomId = window.location.pathname.split('/room/')[1]?.split('?')[0];

            // Submit solution for testing
            const result = await ProblemService.submitSolution(
                problem.id || problem.problemId,
                code,
                language,
                userId,
                userName,
                roomId
            );

            setTestResults(result.testResults);

            // Notify parent component
            if (onTestComplete) {
                onTestComplete(result);
            }
        } catch (error) {
            console.error('Test execution error:', error);
            setTestResults({
                error: error.message || 'Failed to run tests',
                allPassed: false,
                totalTests: 0,
                passedTests: 0,
                cases: []
            });
        } finally {
            setRunning(false);
        }
    };

    return (
        <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#e2e8f0'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                    Test Cases
                </h3>
                <button
                    onClick={runTests}
                    disabled={running}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.2rem',
                        background: running ? '#64748b' : 'linear-gradient(90deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: running ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: running ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    <FaPlay size={12} />
                    {running ? 'Running...' : 'Run Tests'}
                </button>
            </div>

            {running && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8'
                }}>
                    <div className="spinner" style={{
                        border: '3px solid rgba(255, 255, 255, 0.1)',
                        borderTop: '3px solid #10b981',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>Executing test cases...</p>
                </div>
            )}

            {testResults && !running && (
                <div>
                    {testResults.error ? (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            padding: '1rem',
                            color: '#f87171'
                        }}>
                            <strong>Error:</strong> {testResults.error}
                        </div>
                    ) : (
                        <>
                            {/* Summary */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                marginBottom: '1rem',
                                padding: '1rem',
                                background: testResults.allPassed
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '8px',
                                border: `1px solid ${testResults.allPassed ? '#10b981' : '#ef4444'}`
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#94a3b8',
                                        marginBottom: '0.25rem'
                                    }}>
                                        Status
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: testResults.allPassed ? '#10b981' : '#ef4444',
                                        fontWeight: '600'
                                    }}>
                                        {testResults.allPassed ? (
                                            <><FaCheckCircle /> All Passed</>
                                        ) : (
                                            <><FaTimesCircle /> {testResults.failedTests} Failed</>
                                        )}
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#94a3b8',
                                        marginBottom: '0.25rem'
                                    }}>
                                        Tests
                                    </div>
                                    <div style={{ fontWeight: '600' }}>
                                        {testResults.passedTests}/{testResults.totalTests}
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#94a3b8',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <FaClock style={{ marginRight: '0.25rem' }} />
                                        Time
                                    </div>
                                    <div style={{ fontWeight: '600' }}>
                                        {testResults.executionTime}
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#94a3b8',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <FaMemory style={{ marginRight: '0.25rem' }} />
                                        Memory
                                    </div>
                                    <div style={{ fontWeight: '600' }}>
                                        {testResults.memoryUsage}
                                    </div>
                                </div>
                            </div>

                            {/* Test Cases */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {testResults.cases && testResults.cases.map((testCase, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '8px',
                                            border: `1px solid ${testCase.passed ? '#10b981' : '#ef4444'}`,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            onClick={() => setExpandedTest(expandedTest === idx ? null : idx)}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {testCase.passed ? (
                                                    <FaCheckCircle style={{ color: '#10b981' }} />
                                                ) : (
                                                    <FaTimesCircle style={{ color: '#ef4444' }} />
                                                )}
                                                <span style={{ fontWeight: '500' }}>
                                                    Test Case {testCase.testId}
                                                    {testCase.hidden && (
                                                        <span style={{
                                                            marginLeft: '0.5rem',
                                                            fontSize: '0.75rem',
                                                            color: '#64748b',
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            Hidden
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                fontSize: '0.85rem',
                                                color: '#94a3b8'
                                            }}>
                                                <span>{testCase.executionTime}</span>
                                                <span>{expandedTest === idx ? '▼' : '▶'}</span>
                                            </div>
                                        </div>

                                        {expandedTest === idx && (
                                            <div style={{
                                                padding: '1rem',
                                                background: 'rgba(0, 0, 0, 0.2)',
                                                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                                fontSize: '0.9rem'
                                            }}>
                                                {!testCase.hidden && (
                                                    <div style={{ marginBottom: '0.75rem' }}>
                                                        <div style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>Input:</div>
                                                        <pre style={{
                                                            background: 'rgba(0, 0, 0, 0.3)',
                                                            padding: '0.5rem',
                                                            borderRadius: '4px',
                                                            overflow: 'auto',
                                                            margin: 0
                                                        }}>
                                                            {testCase.input || 'N/A'}
                                                        </pre>
                                                    </div>
                                                )}
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <div style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>Expected:</div>
                                                    <pre style={{
                                                        background: 'rgba(0, 0, 0, 0.3)',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        overflow: 'auto',
                                                        margin: 0
                                                    }}>
                                                        {testCase.expectedOutput}
                                                    </pre>
                                                </div>
                                                <div style={{ marginBottom: testCase.error ? '0.75rem' : 0 }}>
                                                    <div style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>Actual:</div>
                                                    <pre style={{
                                                        background: 'rgba(0, 0, 0, 0.3)',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        overflow: 'auto',
                                                        margin: 0,
                                                        color: testCase.passed ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {testCase.actualOutput || 'No output'}
                                                    </pre>
                                                </div>
                                                {testCase.error && (
                                                    <div>
                                                        <div style={{ color: '#ef4444', marginBottom: '0.25rem' }}>Error:</div>
                                                        <pre style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            padding: '0.5rem',
                                                            borderRadius: '4px',
                                                            overflow: 'auto',
                                                            margin: 0,
                                                            color: '#f87171'
                                                        }}>
                                                            {testCase.error}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {!testResults && !running && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#64748b'
                }}>
                    <p>Click "Run Tests" to execute your code against test cases</p>
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

export default TestRunner;
