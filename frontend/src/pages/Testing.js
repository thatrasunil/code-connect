import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaVial, FaPlay, FaCheckCircle, FaTimesCircle, FaSpinner, FaCode } from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import config from '../config';

const Testing = () => {
    const [code, setCode] = useState('// Function to test\nfunction multiply(a, b) {\n  return a * b;\n}');
    const [testCases, setTestCases] = useState('// Define test cases\nconst tests = [\n  { input: [2, 3], expected: 6 },\n  { input: [0, 5], expected: 0 },\n  { input: [-2, 4], expected: -8 },\n  { input: [10, 10], expected: 100 }\n];');
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState(null);

    const handleRunTests = async () => {
        setRunning(true);
        setResults(null);

        try {
            const prompt = `Act as a JavaScript Test Runner. 
            Code to test:
            ${code}
            
            Test Cases:
            ${testCases}
            
            Evaluate the code against the test cases.
            Return a STRICT JSON array of objects with this structure for EACH test case:
            [
              { "id": 1, "name": "Test Case Name", "passed": true/false, "expected": "...", "received": "..." }
            ]
            Do not explain. Just return JSON.`;

            const res = await fetch(`${config.BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context: '' })
            });

            if (!res.ok) throw new Error("AI Backend Unavailable");
            const data = await res.json();

            let aiResponseText = typeof data.response === 'object' ? JSON.stringify(data.response) : String(data.response || '');
            aiResponseText = aiResponseText.replace(/^```json\n/, '').replace(/\n```$/, '').trim();

            const parsedResults = JSON.parse(aiResponseText);
            setResults(parsedResults);

        } catch (err) {
            console.error("Test Run Error:", err);
            setResults([
                { id: 0, name: 'System Error', passed: false, expected: 'Test Report', received: err.message }
            ]);
        } finally {
            setRunning(false);
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
                    background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                    padding: '0.8rem 1.5rem', borderRadius: '50px', marginBottom: '1rem'
                }}>
                    <FaVial size={24} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Automated Test Runner</span>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                    Ensure Code <span className="gradient-text" style={{ background: 'linear-gradient(to right, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reliability</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Define unit tests and verify your logic instantly with our integrated runner.
                </p>
            </motion.div>

            <div className="testing-grid">

                {/* Inputs Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Implementation Code */}
                    <motion.div layout className="glass-card" style={{ height: '350px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '600', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCode color="#3b82f6" /> Implementation
                        </div>
                        <div style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={code}
                                onChange={setCode}
                                options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
                            />
                        </div>
                    </motion.div>

                    {/* Test Cases */}
                    <motion.div layout className="glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '600', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaVial color="#10b981" /> Test Cases
                        </div>
                        <div style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={testCases}
                                onChange={setTestCases}
                                options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Results Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={handleRunTests}
                        disabled={running}
                        className="btn"
                        style={{
                            padding: '1rem', borderRadius: '12px',
                            background: running ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #10b981, #059669)',
                            color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
                            border: 'none', cursor: running ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                            boxShadow: running ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s', marginBottom: '1rem'
                        }}
                    >
                        {running ? <><FaSpinner className="spin" /> Running Tests...</> : <><FaPlay /> Run All Tests</>}
                    </button>

                    <motion.div className="glass-card" style={{ flex: 1, border: '1px solid rgba(255,255,255,0.05)', minHeight: '400px', background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Test Results
                            {results && (
                                <span style={{ fontSize: '0.9rem', padding: '4px 12px', borderRadius: '20px', background: results.every(r => r.passed) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: results.every(r => r.passed) ? '#10b981' : '#ef4444' }}>
                                    {results.filter(r => r.passed).length}/{results.length} Passed
                                </span>
                            )}
                        </h3>

                        {!results && !running && (
                            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '4rem' }}>
                                <FaVial size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>Ready to run tests.</p>
                            </div>
                        )}

                        {results && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {results.map(test => (
                                    <motion.div
                                        key={test.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            padding: '1rem', borderRadius: '8px',
                                            borderLeft: `4px solid ${test.passed ? '#10b981' : '#ef4444'}`,
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#e2e8f0', marginBottom: '0.2rem' }}>{test.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                Expected: <span style={{ color: '#cbd5e1' }}>{test.expected}</span> • Received: <span style={{ color: test.passed ? '#10b981' : '#ef4444' }}>{test.received}</span>
                                            </div>
                                        </div>
                                        {test.passed ? <FaCheckCircle color="#10b981" size={20} /> : <FaTimesCircle color="#ef4444" size={20} />}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <style>{`
                .testing-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 2rem;
                }
                @media (max-width: 1024px) {
                    .testing-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .spin { animation: spin 1s linear infinite; } 
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Testing;
