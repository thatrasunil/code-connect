import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';

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
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', textDecoration: 'none' }}>
                    CodeConnect
                </Link>
                {user && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link>
                        <Link to="/leaderboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Leaderboard</Link>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaUser />
                            <span>{user.name || user.username}</span>
                        </div>
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
