import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUserCircle } from 'react-icons/fa';

const OnlineUsersModal = ({ users, isOpen, onClose }) => {
    // users can be objects with {id, displayName, photoURL, isOnline}

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }} onClick={onClose}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#1e293b', width: '400px', maxWidth: '90%', borderRadius: '12px',
                            border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Active Participants</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><FaTimes size={20} /></button>
                        </div>

                        <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {users && users.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {users.map((user, idx) => (
                                        <div key={user.id || idx} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px'
                                        }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: `hsl(${Math.abs((user.displayName || 'A').charCodeAt(0) * 5) % 360}, 70%, 50%)`,
                                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.2rem', fontWeight: 'bold'
                                            }}>
                                                {(user.displayName || user.username || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'white' }}>{user.displayName || user.username || 'Anonymous'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.status === 'online' ? '#10b981' : '#cbd5e1' }}></span>
                                                    {user.status === 'online' ? 'Online' : 'Offline'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No active participants found.</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OnlineUsersModal;
