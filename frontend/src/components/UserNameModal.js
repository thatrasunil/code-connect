import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UserNameModal = ({ isOpen, onSubmit, initialName = '' }) => {
    const [name, setName] = useState(initialName);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed.length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }
        if (trimmed.length > 20) {
            setError('Name must be less than 20 characters');
            return;
        }
        onSubmit(trimmed);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card"
                        style={{
                            padding: '2.5rem', width: '90%', maxWidth: '400px',
                            border: '1px solid var(--accent-primary)',
                            background: 'var(--bg-secondary)',
                            boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)'
                        }}
                    >
                        <h2 style={{ marginBottom: '1rem', textAlign: 'center', background: 'linear-gradient(to right, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Welcome!
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Please enter your name to join the session.
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Name (e.g. Alice)"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    autoFocus
                                    style={{
                                        width: '100%', padding: '0.8rem', borderRadius: '8px',
                                        background: 'var(--bg-tertiary)', border: error ? '1px solid #ef4444' : '1px solid var(--border-color)',
                                        color: 'white', fontSize: '1rem', outline: 'none'
                                    }}
                                />
                                {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{error}</span>}
                            </div>

                            <button
                                type="submit"
                                className="btn primary-btn"
                                style={{
                                    width: '100%', padding: '0.8rem', fontSize: '1rem',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                                }}
                            >
                                Join Room 🚀
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserNameModal;
