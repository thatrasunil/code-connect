import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import ProblemPanel from './ProblemPanel';
import TestRunner from './TestRunner';
import AIVerification from './AIVerification';
import ProblemService from '../services/problemService';
import { FaCode, FaCheckCircle, FaLightbulb } from 'react-icons/fa';

const ProblemSolver = () => {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const questionId = searchParams.get('questionId');

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [loading, setLoading] = useState(true);
    const [testResults, setTestResults] = useState(null);
    const [aiVerification, setAiVerification] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'ai' | 'hints'

    useEffect(() => {
        if (questionId) {
            loadProblem();
        }
    }, [questionId]);

    const loadProblem = async () => {
        try {
            setLoading(true);
            const problemData = await ProblemService.fetchProblem(questionId);
            setProblem(problemData);

            // Load boilerplate code
            if (problemData.boilerplateCode && problemData.boilerplateCode[language]) {
                setCode(problemData.boilerplateCode[language]);
            }
        } catch (error) {
            console.error('Error loading problem:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        if (problem?.boilerplateCode?.[newLanguage]) {
            setCode(problem.boilerplateCode[newLanguage]);
        }
    };

    const handleTestComplete = (result) => {
        setTestResults(result.testResults);

        // If all tests passed, show AI verification
        if (result.aiVerification) {
            setAiVerification(result.aiVerification);
            setActiveTab('ai');
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0f172a',
                color: 'white'
            }}>
                <div className="spinner" style={{
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                    borderTop: '4px solid #f59e0b',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    animation: 'spin 1s linear infinite'
                }}></div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0f172a',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Problem not found</h2>
                    <p style={{ color: '#94a3b8' }}>The requested problem could not be loaded.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '400px 1fr 400px',
            height: '100vh',
            background: '#0f172a',
            color: '#e2e8f0'
        }}>
            {/* Left Panel - Problem Description */}
            <div style={{
                borderRight: '1px solid #334155',
                overflow: 'auto',
                background: '#1e293b'
            }}>
                <ProblemPanel
                    questionId={questionId}
                    isOpen={true}
                    onClose={null}
                />
            </div>

            {/* Center Panel - Code Editor */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                background: '#1e293b'
            }}>
                {/* Editor Header */}
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#0f172a'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <FaCode style={{ color: '#f59e0b' }} />
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                            Code Editor
                        </h3>
                    </div>

                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#334155',
                            color: 'white',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>

                {/* Monaco Editor */}
                <div style={{ flex: 1 }}>
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2
                        }}
                    />
                </div>
            </div>

            {/* Right Panel - Test Results & AI */}
            <div style={{
                borderLeft: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                background: '#1e293b'
            }}>
                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #334155',
                    background: '#0f172a'
                }}>
                    <button
                        onClick={() => setActiveTab('tests')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: activeTab === 'tests' ? '#1e293b' : 'transparent',
                            color: activeTab === 'tests' ? '#f59e0b' : '#94a3b8',
                            border: 'none',
                            borderBottom: activeTab === 'tests' ? '2px solid #f59e0b' : '2px solid transparent',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                        Tests
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: activeTab === 'ai' ? '#1e293b' : 'transparent',
                            color: activeTab === 'ai' ? '#f59e0b' : '#94a3b8',
                            border: 'none',
                            borderBottom: activeTab === 'ai' ? '2px solid #f59e0b' : '2px solid transparent',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaLightbulb style={{ marginRight: '0.5rem' }} />
                        AI
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '1rem'
                }}>
                    {activeTab === 'tests' && (
                        <TestRunner
                            problem={problem}
                            code={code}
                            language={language}
                            onTestComplete={handleTestComplete}
                        />
                    )}

                    {activeTab === 'ai' && (
                        <AIVerification
                            verification={aiVerification}
                            loading={aiLoading}
                        />
                    )}
                </div>
            </div>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default ProblemSolver;
