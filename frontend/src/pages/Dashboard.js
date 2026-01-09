import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaLaptopCode, FaChartPie, FaHistory, FaProjectDiagram, FaTrophy } from 'react-icons/fa';

import config from '../config';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSessions: 0, roomsCreated: 0, languagesUsed: [] });
    const [myRooms, setMyRooms] = useState([]);
    const [pastInterviews, setPastInterviews] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'interviews'
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

                // Fetch Interviews
                const interviewsRes = await fetch(`${BACKEND_URL}/api/dashboard/interviews`, { headers });
                if (interviewsRes.ok) setPastInterviews(await interviewsRes.json());

                // Fetch Leaderboard
                const leaderboardRes = await fetch(`${BACKEND_URL}/api/leaderboard`);
                if (leaderboardRes.ok) setLeaderboard(await leaderboardRes.json());

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
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <h2
                                onClick={() => setActiveTab('rooms')}
                                style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: activeTab === 'rooms' ? 1 : 0.5 }}
                            >
                                <FaHistory size={20} style={{ color: 'var(--accent-primary)' }} /> My Recent Rooms
                            </h2>
                            <h2
                                onClick={() => setActiveTab('interviews')}
                                style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: activeTab === 'interviews' ? 1 : 0.5 }}
                            >
                                <FaLaptopCode size={20} style={{ color: '#10b981' }} /> Interview History
                            </h2>
                        </div>
                        <Link to="/" className="btn primary-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaPlus /> New Room
                        </Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeTab === 'rooms' ? (
                            myRooms.length === 0 ? (
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
                            )
                        ) : (
                            pastInterviews.length === 0 ? (
                                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No interviews conducted yet.
                                </div>
                            ) : (
                                pastInterviews.map(session => (
                                    <motion.div
                                        key={session.id}
                                        className="glass-card"
                                        whileHover={{ scale: 1.01, borderColor: '#10b981' }}
                                        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #10b981' }}
                                    >
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                                Candidate: {session.candidate_name}
                                            </h3>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                {new Date(session.created_at).toLocaleDateString()} • Room #{session.room_id}
                                            </div>
                                            <div style={{ marginTop: '5px' }}>
                                                <span style={{ fontSize: '0.8rem', background: '#334155', padding: '2px 8px', borderRadius: '4px' }}>
                                                    Score: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{session.score}/100</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <Link to={`/room/${session.room_id}`} className="btn" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.5rem 1.2rem' }}>
                                                View
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))
                            )
                        )}
                    </div>
                </div>

                {/* Leaderboard */}
                <div>
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaTrophy color="#fbbf24" /> Top Coders
                        </h3>
                        {leaderboard.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No data yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {leaderboard.slice(0, 5).map((user, index) => (
                                    <div key={user.username} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#64748b', minWidth: '25px' }}>#{index + 1}</span>
                                        <img src={user.avatar} alt={user.username} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #3b82f6' }} />
                                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{user.username}</span>
                                        <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>{user.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        )}
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
