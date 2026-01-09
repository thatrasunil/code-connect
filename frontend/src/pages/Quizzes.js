import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLayerGroup, FaSearch, FaPlay, FaBrain, FaDatabase } from 'react-icons/fa';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';

const Quizzes = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'quizzes'));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setQuizzes(data);
            } catch (err) {
                console.error("Failed to load quizzes", err);
                addToast('Failed to load quizzes from Firebase', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [addToast]);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            const seedData = [
                {
                    id: 'python-basics',
                    title: "Python Basics",
                    description: "Test your knowledge of Python fundamentals.",
                    category: "Python",
                    questions: [
                        { id: 'q1', text: "What is output of print(2 ** 3)?", options: ["6", "8", "9", "Error"], correct_answer: 1, explanation: "2^3 = 8" },
                        { id: 'q2', text: "Invalid variable name?", options: ["_var", "my_var", "2var", "var2"], correct_answer: 2, explanation: "Cannot start with number" }
                    ]
                },
                {
                    id: 'react-essentials',
                    title: "ReactJS Essentials",
                    description: "Core concepts of React.",
                    category: "React",
                    questions: [
                        { id: 'q1', text: "Purpose of useEffect?", options: ["State", "Side effects", "Routing", "Styling"], correct_answer: 1, explanation: "Side effects like fetching." },
                        { id: 'q2', text: "Hook for DOM ref?", options: ["useState", "useEffect", "useRef", "useContext"], correct_answer: 2, explanation: "useRef creates refs." }
                    ]
                },
                {
                    id: 'js-mastery',
                    title: "JavaScript Mastery",
                    description: "Advanced JS concepts.",
                    category: "JavaScript",
                    questions: [
                        { id: 'q1', text: "NaN stands for?", options: ["Not a Null", "Not a Number", "Null&Num", "None"], correct_answer: 1, explanation: "Not-a-Number" }
                    ]
                }
            ];

            for (const quiz of seedData) {
                await setDoc(doc(db, 'quizzes', quiz.id), quiz);
            }

            // Refresh
            const querySnapshot = await getDocs(collection(db, 'quizzes'));
            setQuizzes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            addToast('Quizzes seeded successfully!', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to seed data. Check permissions.', 'error');
        } finally {
            setSeeding(false);
        }
    };

    const categories = ['All', ...new Set(quizzes.map(q => q.category))];

    const filteredQuizzes = quizzes.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = activeCategory === 'All' || q.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>Loading Quizzes...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    marginBottom: '3rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
                    padding: '3rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'center'
                }}
            >
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', borderRadius: '20px', marginBottom: '1.5rem', boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.5)' }}>
                        <FaBrain size={40} color="white" />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>Quiz Arena</h1>
                    <p style={{ color: '#cbd5e1', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Test your knowledge across various domains and earn points.
                        <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '10px', opacity: 0.7 }}>(Powered by Firebase Firestore)</span>
                    </p>
                </div>
            </motion.div>

            {/* Empty State / Seeder */}
            {quizzes.length === 0 && (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>No quizzes found in Firestore.</p>
                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="btn"
                        style={{ background: '#f59e0b', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaDatabase /> {seeding ? 'Seeding...' : 'Seed Default Quizzes'}
                    </button>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '300px', maxWidth: '500px' }}>
                        <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white',
                                outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: `1px solid ${activeCategory === cat ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                                background: activeCategory === cat ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                color: activeCategory === cat ? '#10b981' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {filteredQuizzes.map((quiz, index) => (
                    <motion.div
                        key={quiz.id}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    {quiz.category}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {quiz.questions?.length || '?'} Questions
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.8rem', color: '#f1f5f9', lineHeight: 1.3 }}>{quiz.title}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {quiz.description}
                            </p>
                        </div>

                        <div style={{ padding: '1.2rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0,0,0,0.2)' }}>
                            <button
                                onClick={() => navigate(`/quizzes/${quiz.id}`)}
                                className="btn"
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(90deg, #10b981, #059669)',
                                    color: 'white',
                                    padding: '0.8rem',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <FaPlay size={14} /> Start Quiz
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Quizzes;
