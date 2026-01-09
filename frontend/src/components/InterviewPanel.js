import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaList, FaStickyNote, FaPlay, FaPause, FaRedo } from 'react-icons/fa';

const InterviewPanel = ({ socket, roomId, onPostQuestion }) => {
    const [activeTab, setActiveTab] = useState('questions'); // questions, notes
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [notes, setNotes] = useState('');
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate lazy loading of questions
        // In a real app, this would be an API call or dynamic import
        const loadQuestions = async () => {
            setIsLoading(true);
            await new Promise(r => setTimeout(r, 800)); // Simulate network delay
            const QUESTIONS = [
                { id: 1, title: 'Two Sum', difficulty: 'Easy', content: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.' },
                { id: 2, title: 'Reverse Linked List', difficulty: 'Easy', content: 'Given the head of a singly linked list, reverse the list, and return the reversed list.' },
                { id: 3, title: 'LRU Cache', difficulty: 'Medium', content: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.' },
                { id: 4, title: 'Merge Intervals', difficulty: 'Medium', content: 'Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals.' },
                { id: 5, title: 'Valid Parentheses', difficulty: 'Easy', content: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.' }
            ];
            setQuestions(QUESTIONS);
            setIsLoading(false);
        };
        loadQuestions();
    }, []);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePostQuestion = (q) => {
        const text = `// QUESTION: ${q.title} (${q.difficulty})\n// ${q.content}\n\n`;
        onPostQuestion(text);
    };

    return (
        <div className="interview-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--text-primary)' }}>
            {/* Timer Section */}
            <div className="timer-section" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    <FaClock color="var(--accent-primary)" />
                    {formatTime(timer)}
                </div>
                <div className="timer-controls" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setIsRunning(!isRunning)} className="btn icon-btn" style={{ padding: '4px 8px' }}>
                        {isRunning ? <FaPause /> : <FaPlay />}
                    </button>
                    <button onClick={() => { setIsRunning(false); setTimer(0); }} className="btn icon-btn" style={{ padding: '4px 8px' }}>
                        <FaRedo />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="panel-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setActiveTab('questions')}
                    style={{ flex: 1, padding: '0.75rem', background: activeTab === 'questions' ? 'var(--bg-tertiary)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: activeTab === 'questions' ? '2px solid var(--accent-primary)' : 'none' }}
                >
                    <FaList style={{ marginRight: '6px' }} /> Questions
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    style={{ flex: 1, padding: '0.75rem', background: activeTab === 'notes' ? 'var(--bg-tertiary)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: activeTab === 'notes' ? '2px solid var(--accent-primary)' : 'none' }}
                >
                    <FaStickyNote style={{ marginRight: '6px' }} /> Private Notes
                </button>
            </div>

            {/* Content */}
            <div className="panel-content" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {activeTab === 'questions' ? (
                    <div className="questions-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {isLoading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                Loading problem library...
                            </div>
                        ) : (
                            questions.map(q => (
                                <div key={q.id} className="question-item glass-card" style={{ padding: '1rem', borderLeft: `3px solid ${q.difficulty === 'Easy' ? '#10b981' : '#f59e0b'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold' }}>{q.title}</span>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{q.difficulty}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{q.content}</p>
                                    <button
                                        onClick={() => handlePostQuestion(q)}
                                        className="btn"
                                        style={{ width: '100%', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
                                    >
                                        Post to Editor
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="notes-section" style={{ height: '100%' }}>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Write private notes about the candidate here..."
                            style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', resize: 'none', outline: 'none', fontFamily: 'sans-serif' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewPanel;
