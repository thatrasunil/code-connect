import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaList, FaStickyNote, FaPlay, FaPause, FaRedo, FaSave } from 'react-icons/fa';
import config from '../config';

const InterviewPanel = ({ socket, roomId, onPostQuestion, initialQuestionId }) => {
    const [activeTab, setActiveTab] = useState('questions'); // questions, notes
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [notes, setNotes] = useState('');
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [testCases, setTestCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem('token'); // Token stored in localStorage
    const hasInitializedRef = useState(false); // To prevent double posting

    useEffect(() => {
        const loadQuestions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${config.BACKEND_URL}/api/questions`);
                if (res.ok) {
                    const data = await res.json();
                    setQuestions(data);
                }
            } catch (err) {
                console.error("Failed to load questions", err);
            } finally {
                setIsLoading(false);
            }
        };

        const loadSession = async () => {
            try {
                const res = await fetch(`${config.BACKEND_URL}/api/rooms/${roomId}/session`);
                if (res.ok) {
                    const data = await res.json();
                    setNotes(data.notes || '');
                    setScore(data.score || 0);
                }
            } catch (err) { console.error("Failed to load session", err); }
        };

        loadQuestions();
        loadSession();
    }, [roomId]);

    // Auto-select question from URL param
    useEffect(() => {
        if (questions.length > 0 && initialQuestionId && !selectedQuestion) {
            const q = questions.find(q => q.id.toString() === initialQuestionId.toString());
            if (q) {
                handlePostQuestion(q);
                // Clear the param from URL without reloading to avoid re-posting on refresh? 
                // Actually, let's just keep it simple. If user refreshes, it re-posts. That's fine for now.
            }
        }
    }, [questions, initialQuestionId]);

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
        const contentLines = q.content.split('\n').map(line => `// ${line}`).join('\n');
        const text = `// QUESTION: ${q.title} (${q.difficulty})\n${contentLines}\n\n`;
        onPostQuestion(text);
        setSelectedQuestion(q);
        // Load test cases for this question (mock for now)
        setTestCases([
            { input: '[2,7,11,15], 9', expected: '[0,1]' },
            { input: '[3,2,4], 6', expected: '[1,2]' }
        ]);
    };

    const handleSaveSession = async () => {
        try {
            const res = await fetch(`${config.BACKEND_URL}/api/rooms/${roomId}/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ notes, score })
            });
            if (res.ok) {
                alert("Evaluation saved!");
            }
        } catch (err) {
            console.error("Failed to save session", err);
            alert("Failed to save evaluation.");
        }
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
                {selectedQuestion && (
                    <button
                        onClick={() => setActiveTab('testcases')}
                        style={{ flex: 1, padding: '0.75rem', background: activeTab === 'testcases' ? 'var(--bg-tertiary)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: activeTab === 'testcases' ? '2px solid var(--accent-primary)' : 'none' }}
                    >
                        <FaPlay style={{ marginRight: '6px' }} /> Test Cases
                    </button>
                )}
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
                            <>
                                <button
                                    onClick={async () => {
                                        setIsLoading(true);
                                        try {
                                            const res = await fetch(`${config.BACKEND_URL}/api/ai/interview`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ difficulty: 'Medium', topic: 'Algorithms' })
                                            });
                                            if (res.ok) {
                                                const data = await res.json();
                                                // Ensure content is a string
                                                const contentStr = typeof data.response === 'object' ? JSON.stringify(data.response) : String(data.response || 'No response');

                                                const newQ = {
                                                    id: Date.now(),
                                                    title: 'AI Generated Question',
                                                    difficulty: 'Medium',
                                                    content: contentStr
                                                };
                                                setQuestions(prev => [newQ, ...prev]);
                                            } else {
                                                const errText = await res.text();
                                                console.error("AI Gen Error:", errText);
                                                alert("AI Generation Failed: Server Error");
                                            }
                                        } catch (e) { console.error(e); alert("AI Generation Failed: " + e.message); }
                                        finally { setIsLoading(false); }
                                    }}
                                    className="btn primary-btn"
                                    style={{ marginBottom: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <FaRedo /> Generate New Question with AI
                                </button>
                                {questions.map(q => (
                                    <div key={q.id} className="question-item glass-card" style={{ padding: '1rem', borderLeft: `3px solid ${q.difficulty === 'Easy' ? '#10b981' : '#f59e0b'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 'bold' }}>{typeof q.title === 'object' ? JSON.stringify(q.title) : String(q.title)}</span>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{typeof q.difficulty === 'object' ? JSON.stringify(q.difficulty) : String(q.difficulty)}</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                            {typeof q.content === 'object' ? JSON.stringify(q.content) : String(q.content)}
                                        </p>
                                        <button
                                            onClick={() => handlePostQuestion(q)}
                                            className="btn"
                                            style={{ width: '100%', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
                                        >
                                            Post to Editor
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                ) : activeTab === 'notes' ? (
                    <div className="notes-section" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px' }}>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Write private notes about the candidate here..."
                                style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', resize: 'none', outline: 'none', fontFamily: 'sans-serif' }}
                            />
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <label style={{ fontWeight: 'bold' }}>Candidate Score: {score}/100</label>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={score}
                                onChange={(e) => setScore(parseInt(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ marginTop: '15px', textAlign: 'right' }}>
                                <button onClick={handleSaveSession} className="btn primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                                    <FaSave /> Save Evaluation
                                </button>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'testcases' ? (
                    <div className="testcases-section" style={{ padding: '1rem' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Test Cases for {selectedQuestion?.title}</h4>
                        {testCases.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No test cases available</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {testCases.map((tc, index) => (
                                    <div key={index} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <strong>Input:</strong>
                                            <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                {tc.input}
                                            </div>
                                        </div>
                                        <div>
                                            <strong>Expected Output:</strong>
                                            <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981' }}>
                                                {tc.expected}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div >
    );
};

export default InterviewPanel;
