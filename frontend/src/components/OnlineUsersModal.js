import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCircle } from 'react-icons/fa';

const OnlineUsersModal = ({ isOpen, onClose, users }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000
            }} onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        background: '#1e293b',
                        padding: '2rem',
                        borderRadius: '20px',
                        maxWidth: '500px',
                        width: '90%',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                            Online Users ({users.length})
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>
                            <FaTimes />
                        </button>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                        {users.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center' }}>No users online.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {users.map(user => (
                                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt={user.displayName} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {user.displayName?.charAt(0).toUpperCase() || 'A'}
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'white' }}>{user.displayName || 'Anonymous'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {user.email}
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#10b981' }}>
                                            <FaCircle size={8} /> Online
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OnlineUsersModal;
