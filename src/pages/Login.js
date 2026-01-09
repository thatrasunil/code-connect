import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await login(username, password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="landing-page" style={{ justifyContent: 'center' }}>
            <motion.div
                className="card"
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }} className="purple-text">Welcome Back</h2>
                {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem' }}>Username</label>
                        <input
                            type="text"
                            className="room-input"
                            style={{ marginBottom: 0 }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem' }}>Password</label>
                        <input
                            type="password"
                            className="room-input"
                            style={{ marginBottom: 0 }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn create-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none' }}>Sign Up</Link>
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
