import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTerminal, FaTimes } from 'react-icons/fa';

const OutputPanel = ({ isOpen, output, onClose, isRunning }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="output-panel"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '250px',
                        background: '#1e1e1e', // VS Code terminal dark
                        borderTop: '1px solid var(--border-color)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
                    }}
                >
                    <div className="output-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', background: '#252526', borderBottom: '1px solid #333' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#ccc' }}>
                            <FaTerminal /> Console Output
                        </span>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="output-content" style={{ flex: 1, padding: '1rem', overflowY: 'auto', fontFamily: 'monospace', fontSize: '14px', color: '#d4d4d4' }}>
                        {isRunning ? (
                            <div style={{ color: 'var(--accent-secondary)' }}>Running code...</div>
                        ) : (
                            output.map((line, i) => (
                                <div key={i} style={{
                                    color: line.type === 'error' ? '#f87171' : line.type === 'warn' ? '#fbbf24' : '#d4d4d4',
                                    marginBottom: '4px'
                                }}>
                                    {typeof line.content === 'object' ? JSON.stringify(line.content) : String(line.content || '')}
                                </div>
                            ))
                        )}
                        {!isRunning && output.length === 0 && <span style={{ opacity: 0.5 }}>No output to display. Run code to see results.</span>}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OutputPanel;
