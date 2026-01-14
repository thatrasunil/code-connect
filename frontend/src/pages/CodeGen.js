import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMagic, FaCopy, FaCheck, FaRobot, FaLightbulb, FaSpinner } from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import config from '../config';

const CodeGen = () => {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setGenerating(true);
        setGeneratedCode(''); // Clear previous

        try {
            const res = await fetch(`${config.BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Generate code for: ${prompt}. Only provide the code, no markdown wrappers if possible, or just standard clean code.`,
                    context: ''
                })
            });

            if (!res.ok) throw new Error("AI Backend Unavailable");
            const data = await res.json();
            const aiResponse = typeof data.response === 'object' ? JSON.stringify(data.response) : String(data.response || '');

            // Clean up common markdown code block markers if present
            const cleanCode = aiResponse.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');
            setGeneratedCode(cleanCode);

        } catch (err) {
            console.error("AI Generation Error:", err);
            setGeneratedCode(`// Error: Could not generate code.\n// ${err.message}\n// Please ensure the backend is running.`);
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b',
                    padding: '0.8rem 1.5rem', borderRadius: '50px', marginBottom: '1rem'
                }}>
                    <FaRobot size={24} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>AI Code Generator</span>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                    Turn Ideas into <span className="gradient-text" style={{ background: 'linear-gradient(to right, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reality</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Describe what you need in plain English, and watch our AI build it for you.
                </p>
            </motion.div>

            <div className="codegen-grid">

                {/* Prompt Section */}
                <motion.div layout className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaLightbulb color="#f59e0b" /> Your Prompt
                    </h3>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="E.g. Create a React component for a contact form with validation..."
                        style={{
                            flex: 1, width: '100%', padding: '1.5rem', borderRadius: '12px',
                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', fontSize: '1.1rem', lineHeight: '1.6', resize: 'none',
                            outline: 'none', marginBottom: '1.5rem'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />

                    <button
                        onClick={handleGenerate}
                        disabled={generating || !prompt}
                        className="btn"
                        style={{
                            padding: '1.2rem', borderRadius: '12px',
                            background: generating || !prompt ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                            color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
                            border: 'none', cursor: generating || !prompt ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                            boxShadow: generating || !prompt ? 'none' : '0 4px 15px rgba(245, 158, 11, 0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {generating ? <><FaSpinner className="spin" /> Generating Code...</> : <><FaMagic /> Generate</>}
                    </button>
                </motion.div>

                {/* Output Section */}
                <motion.div layout className="glass-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: '#cbd5e1' }}>Generated Code</span>
                        <button
                            onClick={handleCopy}
                            style={{ background: 'transparent', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            {copied ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
                        </button>
                    </div>
                    <div style={{ flex: 1 }}>
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={generatedCode}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 16 }
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            <style>{`
                .codegen-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 2rem;
                    min-height: 500px;
                }
                @media (max-width: 1024px) {
                    .codegen-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .spin { animation: spin 1s linear infinite; } 
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default CodeGen;
