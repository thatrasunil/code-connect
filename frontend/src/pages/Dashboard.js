import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaLaptopCode, FaChartPie, FaHistory, FaProjectDiagram, FaTrophy, FaCode, FaBrain, FaArrowRight } from 'react-icons/fa';
import RoomChoiceModal from '../components/RoomChoiceModal';
import OnlineUsersModal from '../components/OnlineUsersModal';

import config from '../config';

import { incrementUserStats, logTransaction, subscribeToOnlineUsers } from '../services/firestoreService';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSessions: 0, roomsCreated: 0, languagesUsed: [] });
    const [myRooms, setMyRooms] = useState([]);
    const [pastInterviews, setPastInterviews] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'interviews'
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isOnlineUsersModalOpen, setIsOnlineUsersModalOpen] = useState(false);

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

    // Subscribe to online users
    useEffect(() => {
        const unsubscribe = subscribeToOnlineUsers((users) => {
            setOnlineUsers(users);
        });
        return () => unsubscribe();
    }, []);



    const handleCreateRoom = async (options = {}) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${BACKEND_URL}/api/create-room`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(options)
            });
            const data = await res.json();
            if (data.roomId) {
                // Increment Firestore stats
                if (user?.id) {
                    incrementUserStats(user.id, 'room');
                    logTransaction(user.id, 'ROOM_CREATED', { roomId: data.roomId });
                }
                navigate(`/room/${data.roomId}`);
            }
        } catch (err) {
            console.error('Failed to create room:', err);
            alert('Failed to create room. Please ensure the backend server is running.');
        }
    };

    const handleJoinRoom = (roomId) => {
        navigate(`/room/${roomId}`);
    };

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>Loading Dashboard...</div>;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    marginBottom: '3rem',
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))',
                    padding: '3rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
                        {getGreeting()}, <span className="gradient-text">{user?.username}</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px' }}>
                        Ready to level up your coding skills? Start a session or tackle a new challenge from our library.
                    </p>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setIsModalOpen(true)} className="btn primary-btn" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '12px' }}>
                            <FaPlus /> Custom Session
                        </button>
                        <Link to="/problems" className="btn" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaCode /> Browse Problems
                        </Link>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
            </motion.div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatsCard icon={<FaLaptopCode />} title="Total Sessions" value={stats.totalSessions} color="#8b5cf6" delay={0.1} />
                <StatsCard icon={<FaProjectDiagram />} title="Active Projects" value={stats.roomsCreated} color="#06b6d4" delay={0.2} />


                <StatsCard icon={<FaChartPie />} title="Languages" value={stats.languagesUsed?.length || 0} color="#ec4899" delay={0.3} />
                <div onClick={() => setIsOnlineUsersModalOpen(true)} style={{ cursor: 'pointer' }}>
                    <StatsCard icon={<FaBrain />} title="Online Users" value={onlineUsers.length} color="#10b981" delay={0.4} />
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Left Column: Tools & History */}
                <div>
                    {/* Quick Tools Section */}
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#cbd5e1' }}>Quick Actions</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                        <Link to="/problems" className="glass-card" style={{ padding: '2rem', textDecoration: 'none', color: 'white', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f59e0b' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '16px', color: '#f59e0b' }}><FaCode size={24} /></div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>Problems Library</div>
                                    <div style={{ color: '#94a3b8' }}>Practice algorithms & data structures</div>
                                </div>
                            </div>
                        </Link>
                        <button onClick={handleCreateRoom} className="glass-card" style={{ padding: '2rem', textDecoration: 'none', color: 'white', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', cursor: 'pointer', textAlign: 'left', background: 'none' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#8b5cf6' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '16px', color: '#8b5cf6' }}><FaLaptopCode size={24} /></div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>Mock Interview</div>
                                    <div style={{ color: '#94a3b8' }}>Start a collaborative interview session</div>
                                </div>
                            </div>
                        </button>
                        <Link to="/quizzes" className="glass-card" style={{ padding: '2rem', textDecoration: 'none', color: 'white', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', gridColumn: 'span 2' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '16px', color: '#10b981' }}><FaBrain size={24} /></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>Quiz Arena (Beta)</div>
                                    <div style={{ color: '#94a3b8' }}>Test your knowledge in Python, React, and more.</div>
                                </div>
                                <FaArrowRight color="#64748b" />
                            </div>
                        </Link>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                            <h2
                                onClick={() => setActiveTab('rooms')}
                                style={{
                                    fontSize: '1.2rem', cursor: 'pointer',
                                    color: activeTab === 'rooms' ? '#3b82f6' : '#64748b',
                                    borderBottom: activeTab === 'rooms' ? '2px solid #3b82f6' : 'none',
                                    paddingBottom: '0.5rem', marginBottom: '-0.5rem'
                                }}
                            >
                                Recent Rooms
                            </h2>
                            <h2
                                onClick={() => setActiveTab('interviews')}
                                style={{
                                    fontSize: '1.2rem', cursor: 'pointer',
                                    color: activeTab === 'interviews' ? '#10b981' : '#64748b',
                                    borderBottom: activeTab === 'interviews' ? '2px solid #10b981' : 'none',
                                    paddingBottom: '0.5rem', marginBottom: '-0.5rem'
                                }}
                            >
                                Interview History
                            </h2>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeTab === 'rooms' ? (
                            myRooms.length === 0 ? (
                                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: '#64748b', borderStyle: 'dashed' }}>
                                    <FaHistory size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>No recent activity. Start your first session!</p>
                                </div>
                            ) : (
                                myRooms.map(room => (
                                    <motion.div
                                        key={room.id}
                                        className="glass-card"
                                        whileHover={{ x: 5, borderColor: '#3b82f6' }}
                                        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '50px', height: '50px', borderRadius: '12px',
                                                background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                                            }}>
                                                {room.language === 'python' ? '🐍' : '📜'}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                                    Room #{room.room_id}
                                                    {!room.is_public && <span style={{ marginLeft: '10px', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>PRIVATE</span>}
                                                </h3>
                                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                    Created {new Date(room.created_at).toLocaleDateString()} • {room.language}
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/room/${room.room_id}`} className="btn" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            Rejoin
                                        </Link>
                                    </motion.div>
                                ))
                            )
                        ) : (
                            pastInterviews.length === 0 ? (
                                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                                    <p>No interviews recorded.</p>
                                </div>
                            ) : (
                                pastInterviews.map(session => (
                                    <motion.div
                                        key={session.id}
                                        className="glass-card"
                                        whileHover={{ x: 5, borderColor: '#10b981' }}
                                        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #10b981' }}
                                    >
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                                Candidate: {session.candidate_name}
                                            </h3>
                                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                                {new Date(session.created_at).toLocaleDateString()} • Room #{session.room_id}
                                            </div>
                                            <div style={{ marginTop: '8px' }}>
                                                <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                    Score: {session.score}/100
                                                </span>
                                            </div>
                                        </div>
                                        <Link to={`/room/${session.room_id}`} className="btn" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.5rem 1.2rem' }}>
                                            View Report
                                        </Link>
                                    </motion.div>
                                ))
                            )
                        )}
                    </div>
                </div>

                {/* Right Column: Leaderboard */}
                <div>
                    <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <FaTrophy color="#fbbf24" /> Leaderboard
                        </h3>
                        {leaderboard.length === 0 ? (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No data yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {leaderboard.slice(0, 5).map((user, index) => (
                                    <div key={user.username} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#1e293b',
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                            <img src={user.avatar} alt={user.username} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.username}</span>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>{user.points}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link to="/leaderboard" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>View Full Leaderboard</Link>
                    </div>
                </div>
            </div>

            <RoomChoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateRoom}
                onJoin={handleJoinRoom}

            />

            <OnlineUsersModal
                isOpen={isOnlineUsersModalOpen}
                onClose={() => setIsOnlineUsersModalOpen(false)}
                users={onlineUsers}
            />
        </div>
    );
};

const StatsCard = ({ icon, title, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay || 0 }}
        className="glass-card"
        whileHover={{ y: -5, boxShadow: `0 10px 30px -10px ${color}40` }}
        style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}
    >
        <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: `${color}15`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1, color: 'white' }}>{value}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.5rem', fontWeight: '500' }}>{title}</div>
        </div>
    </motion.div>
);

export default Dashboard;
