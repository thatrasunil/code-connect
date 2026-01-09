import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaLaptopCode, FaChartPie, FaHistory, FaProjectDiagram } from 'react-icons/fa';

import config from '../config';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSessions: 0, roomsCreated: 0, languagesUsed: [] });
    const [myRooms, setMyRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dynamic backend URL
    const BACKEND_URL = config.BACKEND_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch Stats
                const statsRes = await fetch(`${BACKEND_URL}/api/dashboard/stats`, { headers });
                if (statsRes.ok) setStats(await statsRes.json());

                // Fetch My Rooms
                const roomsRes = await fetch(`${BACKEND_URL}/api/rooms/my-rooms`, { headers });
                if (roomsRes.ok) setMyRooms(await roomsRes.json());

            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, BACKEND_URL]);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>Loading Dashboard...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '3rem' }}
            >
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome, <span className="gradient-text">{user?.username}</span></h1>
                <p style={{ color: 'var(--text-secondary)' }}>Ready to build something amazing today?</p>
            </motion.div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatsCard icon={<FaLaptopCode />} title="Total Sessions" value={stats.totalSessions} color="#8b5cf6" />
                <StatsCard icon={<FaProjectDiagram />} title="Rooms Created" value={stats.roomsCreated} color="#06b6d4" />
                <StatsCard icon={<FaChartPie />} title="Languages" value={stats.languagesUsed?.length || 0} color="#ec4899" />
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* My Rooms List */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaHistory size={20} style={{ color: 'var(--accent-primary)' }} /> My Recent Rooms
                        </h2>
                        <Link to="/" className="btn primary-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaPlus /> New Room
                        </Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {myRooms.length === 0 ? (
                            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No rooms found. Start a new session!
                            </div>
                        ) : (
                            myRooms.map(room => (
                                <motion.div
                                    key={room.id}
                                    className="glass-card"
                                    whileHover={{ scale: 1.01, borderColor: 'var(--accent-primary)' }}
                                    style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                            Room #{room.room_id}
                                            {!room.is_public && <span style={{ marginLeft: '10px', fontSize: '0.7rem', border: '1px solid #ef4444', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>PRIVATE</span>}
                                        </h3>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {new Date(room.created_at).toLocaleDateString()} • {room.language}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <Link to={`/room/${room.room_id}`} className="btn" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', padding: '0.5rem 1.2rem' }}>
                                            Open
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions / Tips */}
                <div>
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Quick Tips</h3>
                        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Invite others by sharing the URL.</li>
                            <li style={{ marginBottom: '0.5rem' }}>Use the Chat tab to communicate.</li>
                            <li>Switch languages using the dropdown.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ icon, title, value, color }) => (
    <motion.div
        className="glass-card"
        whileHover={{ y: -5 }}
        style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
    >
        <div style={{
            width: '50px', height: '50px', borderRadius: '12px',
            background: `${color}20`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{title}</div>
        </div>
    </motion.div>
);

export default Dashboard;
