import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PasswordModal = ({ isOpen, onSubmit, onCancel, error }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(password);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
                }}
            >
                <motion.div
                    className="glass-card"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    style={{ padding: '2rem', width: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    <h2 style={{ margin: 0, textAlign: 'center' }}>🔒 Room Locked</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>This room requires a password to join.</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            autoFocus
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                        {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>{error}</p>}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <button type="button" onClick={onCancel} className="btn" style={{ flex: 1, background: 'var(--bg-tertiary)', color: 'white' }}>Cancel</button>
                            <button type="submit" className="btn primary-btn" style={{ flex: 1 }}>Join</button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PasswordModal;
