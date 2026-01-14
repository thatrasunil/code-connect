import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaServer, FaTrashAlt, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    /* Admin State */
    const [adminStats, setAdminStats] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    useEffect(() => {
        if (user && user.history) {
            setHistory(user.history);
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchAdminData();
        }
    }, [user]);

    const fetchAdminData = async () => {
        setLoadingAdmin(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const statsRes = await fetch(`${BACKEND_URL}/api/admin/stats`, { headers });
            const statsData = await statsRes.json();
            setAdminStats(statsData);

            const usersRes = await fetch(`${BACKEND_URL}/api/admin/users`, { headers });
            const usersData = await usersRes.json();
            setUsersList(usersData);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        }
        setLoadingAdmin(false);
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${BACKEND_URL}/api/admin/user/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh list
            fetchAdminData();
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="landing-page" style={{ justifyContent: 'flex-start', paddingTop: '80px', height: 'auto', minHeight: '100vh', overflowY: 'auto' }}>

            {/* Navbar for Dashboard */}
            <nav className="landing-header" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100 }}>
                <div className="logo">CodeConnect</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user?.role === 'admin' && <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>ADMIN</span>}
                    <span style={{ color: '#cbd5e1' }}>Hello, <strong>{user?.username}</strong></span>
                    <img
                        src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Generico'}
                        alt="avatar"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #38bdf8' }}
                    />
                    <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Logout</button>
                </div>
            </nav>

            <div className="landing-main" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>

                {/* Admin Panel Section */}
                {user?.role === 'admin' && (
                    <motion.div
                        className="admin-panel-container"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="admin-header">
                            <h2 className="admin-title">
                                <FaShieldAlt style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                                Admin Control Center
                            </h2>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>System Overview</span>
                        </div>

                        {/* Stats Grid */}
                        <div className="admin-stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon-bg"><FaUsers /></div>
                                <div className="stat-label">Total Users</div>
                                <div className="stat-value">{adminStats?.userCount || 0}</div>
                                <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FaChartLine /> +12% this week
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-bg"><FaServer /></div>
                                <div className="stat-label">Active Rooms</div>
                                <div className="stat-value">{adminStats?.activeRoomsCount || 0}</div>
                                <div style={{ color: '#38bdf8', fontSize: '0.8rem' }}>running now</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-bg"><FaChartLine /></div>
                                <div className="stat-label">Total Rooms Created</div>
                                <div className="stat-value">{adminStats?.roomCount || 0}</div>
                                <div style={{ color: '#a855f7', fontSize: '0.8rem' }}>lifetime</div>
                            </div>
                        </div>

                        {/* User Management Table */}
                        <h3 style={{ color: '#e2e8f0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Users Database
                        </h3>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User Profile</th>
                                        <th>Email Address</th>
                                        <th>Role</th>
                                        <th>Join Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.map((u) => (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="user-cell">
                                                    <img src={u.avatar} alt="" className="user-avatar-sm" />
                                                    <strong>{u.username}</strong>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => deleteUser(u._id)}
                                                        className="action-btn"
                                                        title="Delete User"
                                                    >
                                                        <FaTrashAlt /> Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    className="title-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="main-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Your Dashboard</h1>
                    <p className="subtitle">Manage your coding sessions and join recent rooms.</p>
                </motion.div>

                <div className="cards-container">
                    {/* Quick Actions */}
                    <motion.div
                        className="card"
                        whileHover={{ y: -5 }}
                        style={{ textAlign: 'left', height: '100%' }}
                    >
                        <h3 className="purple-text">Start Coding</h3>
                        <p>Jump right into a new collaboration session.</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <Link to="/" className="btn create-btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Create Room</Link>
                        </div>
                    </motion.div>

                    {/* Profile Card */}
                    <motion.div
                        className="card"
                        whileHover={{ y: -5 }}
                        style={{ textAlign: 'left', height: '100%' }}
                    >
                        <h3 style={{ color: '#22d3ee' }}>Profile Details</h3>
                        <div style={{ marginTop: '1.5rem', color: '#cbd5e1' }}>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Username:</strong> {user?.username}</p>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {user?.email}</p>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Member Since:</strong> {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </motion.div>
                </div>

                {/* History Section */}
                <div style={{ width: '100%', maxWidth: '900px', marginTop: '2rem' }}>
                    <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>Recent Rooms</h2>

                    {history.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px' }}>
                            No history found. Join a room to see it here!
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {history.map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="feature-card"
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', textAlign: 'left' }}
                                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                                >
                                    <div>
                                        <h4 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>Room #{item.roomId}</h4>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Joined: {new Date(item.joinedAt).toLocaleString()}</span>
                                    </div>
                                    <Link to={`/room/${item.roomId}`} className="btn join-btn" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}>Rejoin</Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
