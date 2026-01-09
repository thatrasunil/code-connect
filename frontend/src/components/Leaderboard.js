import React, { useState, useEffect } from 'react';
import config from '../config';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaStar } from 'react-icons/fa';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`${config.BACKEND_URL}/api/leaderboard`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <FaTrophy size={20} color="#fbbf24" />; // Gold
        if (index === 1) return <FaMedal size={20} color="#94a3b8" />;  // Silver
        if (index === 2) return <FaMedal size={20} color="#b45309" />;  // Bronze
        return <span style={{ fontWeight: 'bold', color: '#64748b' }}>#{index + 1}</span>;
    };

    return (
        <div className="landing-container">
            <div style={{ paddingTop: '100px', maxWidth: '800px', margin: '0 auto', padding: '100px 20px 20px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', background: 'linear-gradient(to right, #fbbf24, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <FaTrophy color="#fbbf24" /> Community Leaderboard
                    </h1>

                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '15px', textAlign: 'center', width: '80px' }}>Rank</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Coder</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Rooms</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Messages</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading champions...</td>
                                    </tr>
                                ) : users.map((user, index) => (
                                    <motion.tr
                                        key={user.username}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>{getRankIcon(index)}</div>
                                        </td>
                                        <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={user.avatar} alt={user.username} style={{ width: '35px', height: '35px', borderRadius: '50%', border: '2px solid #3b82f6' }} />
                                            <span style={{ fontWeight: '500' }}>{user.username}</span>
                                            {index < 3 && <FaStar size={12} color="#fbbf24" />}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center', color: '#94a3b8' }}>{user.rooms}</td>
                                        <td style={{ padding: '15px', textAlign: 'center', color: '#94a3b8' }}>{user.messages}</td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#3b82f6' }}>{user.points}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Leaderboard;
