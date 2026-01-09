import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaSearch, FaCode, FaCheckCircle, FaStar } from 'react-icons/fa';
import config from '../config';

const Problems = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [activeDifficulty, setActiveDifficulty] = useState('All');
    const [activeTopic, setActiveTopic] = useState('All');

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`${config.BACKEND_URL}/api/questions`);
                if (res.ok) {
                    const data = await res.json();
                    setQuestions(data);
                }
            } catch (err) {
                console.error("Failed to load questions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const handleSolve = async (question) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${config.BACKEND_URL}/api/create-room`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (data.roomId) {
                navigate(`/room/${data.roomId}?questionId=${question.id}`);
            }
        } catch (err) {
            console.error('Failed to create session:', err);
            alert('Could not start session.');
        }
    };

    // Extract unique topics
    const topics = ['All', ...new Set(questions.map(q => q.topic || 'General'))].filter(Boolean);

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(filter.toLowerCase());
        const matchesDiff = activeDifficulty === 'All' || q.difficulty === activeDifficulty;
        const matchesTopic = activeTopic === 'All' || (q.topic || 'General') === activeTopic;
        return matchesSearch && matchesDiff && matchesTopic;
    });

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>Loading Library...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    marginBottom: '3rem',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(220, 38, 38, 0.1))',
                    padding: '3rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', borderRadius: '20px', marginBottom: '1.5rem', boxShadow: '0 10px 30px -10px rgba(245, 158, 11, 0.5)' }}>
                        <FaCode size={40} color="white" />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>Problems Library</h1>
                    <p style={{ color: '#cbd5e1', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Sharpen your skills with our curated collection of coding challenges.
                    </p>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-50%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-50%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
            </motion.div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                {/* Search & Difficulty */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '300px', maxWidth: '500px' }}>
                        <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search problems by title..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white',
                                outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem', borderRadius: '12px' }}>
                        {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                            <button
                                key={diff}
                                onClick={() => setActiveDifficulty(diff)}
                                style={{
                                    padding: '0.5rem 1.2rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeDifficulty === diff ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    color: activeDifficulty === diff ? 'white' : '#94a3b8',
                                    fontWeight: activeDifficulty === diff ? '600' : '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Topics */}
                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                    {topics.map(topic => (
                        <button
                            key={topic}
                            onClick={() => setActiveTopic(topic)}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: `1px solid ${activeTopic === topic ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
                                background: activeTopic === topic ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                color: activeTopic === topic ? '#f59e0b' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {topic}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {filteredQuestions.map((q, index) => (
                    <motion.div
                        key={q.id || index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)' }}
                        className="glass-card"
                        style={{
                            display: 'flex', flexDirection: 'column', height: '100%',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)'
                        }}
                    >
                        <div style={{ padding: '1.5rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <Badge difficulty={q.difficulty} />
                                <span style={{ fontSize: '0.8rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                                    {q.topic || 'Algorithm'}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.8rem', color: '#f1f5f9', lineHeight: 1.3 }}>{q.title}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {q.content}
                            </p>
                        </div>

                        <div style={{ padding: '1.2rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0,0,0,0.2)' }}>
                            <button
                                onClick={() => handleSolve(q)}
                                className="btn"
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                                    color: 'white',
                                    padding: '0.8rem',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                }}
                            >
                                <FaPlay size={14} /> Solve Challenge
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredQuestions.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '6rem', color: '#64748b' }}>
                    <FaSearch size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h3>No problems found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

const Badge = ({ difficulty }) => {
    const colors = {
        Easy: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
        Medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
        Hard: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' }
    };
    const style = colors[difficulty] || colors.Easy;
    return (
        <span style={{
            fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
            background: style.bg, color: style.text, textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
            {difficulty}
        </span>
    );
};

export default Problems;
