import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBug, FaMagic, FaPlay, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import config from '../config';

const Debugging = () => {
    const [code, setCode] = useState('// Paste your buggy code here...\nfunction calculateTotal(items) {\n    let total = 0;\n    for(let i=0; i<=items.length; i++) {\n        total += items[i].price;\n    }\n    return total;\n}');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setResult(null);

        try {
            const prompt = `Analyze the following code for bugs, errors, and performance issues. 
            Return the response in strictly valid JSON format with the following structure:
            {
                "issues": [
                    { "type": "error" | "warning", "line": <number>, "message": "<description>" }
                ],
                "explanation": "<summary of what is wrong>",
                "fixedCode": "<the corrected code>"
            }
            Do not include any markdown formatting (like \`\`\`json). Just the raw JSON string.
            
            Code to analyze:
            ${code}`;

            const res = await fetch(`${config.BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context: '' })
            });

            if (!res.ok) throw new Error("AI Backend Unavailable");
            const data = await res.json();

            let aiResponseText = typeof data.response === 'object' ? JSON.stringify(data.response) : String(data.response || '');

            // Clean up potentially messy JSON response
            aiResponseText = aiResponseText.replace(/^```json\n/, '').replace(/\n```$/, '').trim();

            const parsedResult = JSON.parse(aiResponseText);
            setResult(parsedResult);

        } catch (err) {
            console.error("Analysis Error:", err);
            // Fallback error result
            setResult({
                issues: [{ type: 'error', line: 0, message: `Analysis failed: ${err.message}` }],
                explanation: "Could not connect to AI service. Please ensure the backend is running.",
                fixedCode: code
            });
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', minHeight: 'calc(100vh - 80px)', color: 'white' }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '3rem' }}
            >
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                    padding: '0.8rem 1.5rem', borderRadius: '50px', marginBottom: '1rem'
                }}>
                    <FaBug size={24} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Intelligent Debugger</span>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                    Find and Fix Bugs <span className="gradient-text" style={{ background: 'linear-gradient(to right, #ef4444, #f87171)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Instantly</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Paste your code below. Our AI scans for logic errors, runtime exceptions, and performance bottlenecks.
                </p>
            </motion.div>

            <div className={`debugging-grid ${result ? 'has-result' : ''}`}>

                {/* Input Section */}
                <motion.div layout className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '450px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: '#cbd5e1' }}>Input Code</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></span>
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                padding: { top: 16 }
                            }}
                        />
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="btn"
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '8px',
                                background: analyzing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
                                border: 'none', cursor: analyzing ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {analyzing ? (
                                <><FaSpinner className="spin" /> Analyzing Logic...</>
                            ) : (
                                <><FaMagic /> Analyze Code</>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Analysis Result Section */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card"
                        style={{ display: 'flex', flexDirection: 'column', height: '450px', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))' }}
                    >
                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCheckCircle color="#10b981" /> Analysis Complete
                            </span>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            {/* Issues List */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#f8fafc' }}>Detected Issues</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {result.issues.map((issue, idx) => (
                                        <div key={idx} style={{
                                            padding: '1rem', borderRadius: '8px',
                                            background: issue.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            borderLeft: `4px solid ${issue.type === 'error' ? '#ef4444' : '#f59e0b'}`
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', fontWeight: 'bold', color: issue.type === 'error' ? '#fca5a5' : '#fcd34d' }}>
                                                <FaExclamationTriangle size={14} />
                                                <span>{issue.type.toUpperCase()} at Line {issue.line}</span>
                                            </div>
                                            <div style={{ fontSize: '0.95rem', color: '#e2e8f0' }}>{issue.message}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Explanation */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#f8fafc' }}>AI Explanation</h3>
                                <p style={{ lineHeight: '1.6', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                    {result.explanation}
                                </p>
                            </div>

                            {/* Fixed Code Preview */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#f8fafc' }}>Suggested Fix</h3>
                                <div style={{ height: '200px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <Editor
                                        height="100%"
                                        defaultLanguage="javascript"
                                        theme="vs-dark"
                                        value={result.fixedCode}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            lineNumbers: 'off'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
            <style>{`
                .debugging-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    transition: all 0.5s ease;
                }
                .debugging-grid.has-result {
                    grid-template-columns: 1fr 1fr;
                }
                @media (max-width: 1024px) {
                    .debugging-grid.has-result {
                        grid-template-columns: 1fr;
                    }
                }
                .spin { animation: spin 1s linear infinite; } 
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Debugging;
