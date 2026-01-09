import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSignOutAlt, FaUser, FaCode } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Hide Navbar in Editor to allow full screen layout
    if (location.pathname.startsWith('/room/')) {
        return null; // Editor has its own toolbar
    }

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 4rem',
            background: '#0f172a', /* Unified background */
            color: 'white',
            // borderBottom: '1px solid #334155' /* Removing border for clean look */
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', textDecoration: 'none' }}>
                    <FaCode size={28} />
                    <span>CodeConnect</span>
                </Link>
                {user && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/dashboard" style={{ color: location.pathname === '/dashboard' ? 'white' : '#94a3b8', textDecoration: 'none', fontWeight: location.pathname === '/dashboard' ? '600' : '400' }}>Dashboard</Link>
                        <Link to="/problems" style={{ color: location.pathname === '/problems' ? 'white' : '#94a3b8', textDecoration: 'none', fontWeight: location.pathname === '/problems' ? '600' : '400' }}>Problems</Link>
                        <Link to="/leaderboard" style={{ color: location.pathname === '/leaderboard' ? 'white' : '#94a3b8', textDecoration: 'none', fontWeight: location.pathname === '/leaderboard' ? '600' : '400' }}>Leaderboard</Link>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user ? (
                    <>
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', transition: 'background 0.2s' }}>
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
                                alt="Avatar"
                                style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}
                            />
                            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{user.username}</span>
                        </Link>
                        <button
                            onClick={logout}
                            style={{
                                background: 'transparent',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', marginRight: '1.5rem', fontWeight: '500' }}>Login</Link>
                        <Link to="/signup" style={{
                            background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                            color: 'white',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '9999px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}>
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
