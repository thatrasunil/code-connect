import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaSave, FaDice, FaCamera } from 'react-icons/fa';
import config from '../config';
import { useToast } from '../contexts/ToastContext';

const Profile = () => {
    const { user, login } = useAuth(); // We might need to update user context after save
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Parse initial seed from existing avatar URL or default
    const getInitialSeed = () => {
        if (user?.avatar?.includes('seed=')) {
            return user.avatar.split('seed=')[1];
        }
        return 'Felix';
    };

    const [seed, setSeed] = useState(getInitialSeed());
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });

    // Update form if user context changes
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email
            });
            setSeed(getInitialSeed());
        }
    }, [user]);

    const handleRandomizeAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setSeed(randomSeed);
    };

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let token = localStorage.getItem('token');
            if (user?.provider === 'firebase' && auth.currentUser) {
                token = await auth.currentUser.getIdToken();
            }

            if (!token) {
                addToast('Authentication error', 'error');
                setLoading(false);
                return;
            }
            const res = await fetch(`${config.BACKEND_URL}/api/auth/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    avatar: avatarUrl
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                addToast('Profile updated successfully!', 'success');
                // Ideally, we should update the global AuthContext user here.
                // Assuming AuthContext has a way to reload or set user, or we can just hope it refetches or we reload page.
                // For now, we manually update if AuthProvider exposes a setUser, but usually it doesn't.
                // We'll trust that the user data will be fresh on next nav, or we force a reload.
                window.location.reload();
            } else {
                addToast('Failed to update profile', 'error');
            }
        } catch (err) {
            console.error(err);
            addToast('An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}
            >
                {/* Background decoration */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '150px', background: 'linear-gradient(90deg, #6366f1, #3b82f6)', opacity: 0.2 }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Edit Profile</h1>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                        <div style={{ position: 'relative' }}>
                            <motion.img
                                key={seed}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                src={avatarUrl}
                                alt="Avatar"
                                style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                            />
                            <button
                                onClick={handleRandomizeAvatar}
                                className="btn"
                                style={{
                                    position: 'absolute', bottom: '0', right: '0',
                                    background: '#ec4899', color: 'white', borderRadius: '50%',
                                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '3px solid #1e293b'
                                }}
                                title="Randomize Avatar"
                            >
                                <FaDice />
                            </button>
                        </div>
                        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Customize your avatar appearance</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Username</label>
                            <div style={{ position: 'relative' }}>
                                <FaUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '12px',
                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <FaEnvelope style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '12px',
                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn primary-btn"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
