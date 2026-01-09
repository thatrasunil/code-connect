
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaArrowRight, FaArrowLeft, FaTrophy } from 'react-icons/fa';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext'; // To get userId
import { useToast } from '../contexts/ToastContext';

const QuizPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
    const [results, setResults] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                if (!id) {
                    console.error("Quiz ID is missing");
                    setLoading(false);
                    return;
                }
                const docRef = doc(db, 'quizzes', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    console.log("Quiz Data:", data);

                    if (!data.questions || !Array.isArray(data.questions)) {
                        console.error("Invalid quiz data: questions missing or not an array", data);
                        addToast('Quiz data is corrupted', 'error');
                        setLoading(false);
                        return;
                    }

                    setQuiz({ id: docSnap.id, ...data });
                } else {
                    addToast('Quiz not found', 'error');
                }
            } catch (err) {
                console.error("Fetch Quiz Error:", err);
                if (typeof err === 'object') {
                    try {
                        console.error("Error Object JSON:", JSON.stringify(err));
                    } catch (e) { console.error("Could not stringify error"); }
                }
                addToast('Error loading quiz from Firebase', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, addToast]);

    const handleOptionSelect = (optionIndex) => {
        if (results) return; // Read-only after submission
        const question = quiz.questions[currentQuestionIndex];
        setAnswers(prev => ({
            ...prev,
            [question.id]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Calculate score client-side
            let score = 0;
            const resultDetails = quiz.questions.map(q => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correct_answer;
                if (isCorrect) score++;
                return {
                    question_id: q.id,
                    is_correct: isCorrect,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation,
                    user_answer: userAnswer
                };
            });

            const total = quiz.questions.length;

            // Save result to Firestore
            if (user) {
                await addDoc(collection(db, 'quiz_results'), {
                    userId: user.id || user.uid || 'anonymous',
                    username: user.username || 'Anonymous',
                    quizId: id,
                    quizTitle: quiz.title,
                    score,
                    total,
                    answers, // Raw answers
                    completedAt: new Date()
                });
            }

            setResults({
                score,
                total,
                results: resultDetails
            });

            addToast(`Quiz completed! Score: ${score}/${total}`, 'success');

        } catch (err) {
            console.error(err);
            addToast('Error submitting quiz', 'error');
            // Assuming we still show results even if save failed?
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>Loading...</div>;
    if (!quiz) return <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>Quiz not found</div>;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return <div>Error loading question</div>;

    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    // Results View
    if (results) {
        return (
            <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: 'calc(100vh - 80px)', color: 'white' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', marginBottom: '2rem' }}
                >
                    <div style={{ fontSize: '4rem', color: '#fbbf24', marginBottom: '1rem' }}><FaTrophy /></div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Quiz Complete!</h1>
                    <p style={{ fontSize: '1.5rem', color: '#94a3b8' }}>You scored {results.score} out of {results.total}</p>
                    <button onClick={() => navigate('/quizzes')} className="btn" style={{ marginTop: '2rem', padding: '1rem 2rem', background: '#3b82f6', color: 'white', borderRadius: '12px', border: 'none' }}>
                        Back to Quizzes
                    </button>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {results.results.map((r, i) => {
                        const q = quiz.questions.find(q => q.id === r.question_id);
                        return (
                            <div key={i} style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', border: r.is_correct ? '1px solid #10b981' : '1px solid #ef4444' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ color: r.is_correct ? '#10b981' : '#ef4444', marginTop: '4px' }}>
                                        {r.is_correct ? <FaCheckCircle size={20} /> : <FaTimesCircle size={20} />}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{q.text}</h4>
                                        <p style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>Your answer: <span style={{ color: r.is_correct ? '#10b981' : '#ef4444' }}>{q.options[r.user_answer] || 'Skipped'}</span></p>
                                        {!r.is_correct && <p style={{ color: '#10b981' }}>Correct answer: {q.options[r.correct_answer]}</p>}
                                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>{r.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Player View
    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', minHeight: 'calc(100vh - 80px)', color: 'white' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{quiz.title}</h2>
                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: '#10b981', transition: 'width 0.3s ease' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                    <span>{quiz.category}</span>
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card"
                    style={{ padding: '3rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}
                >
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem', lineHeight: 1.4 }}>{currentQuestion.text}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = answers[currentQuestion.id] === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    style={{
                                        padding: '1.2rem',
                                        textAlign: 'left',
                                        background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                        border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: isSelected ? 'white' : '#cbd5e1',
                                        fontSize: '1.1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}
                                >
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        border: isSelected ? '6px solid #10b981' : '2px solid #64748b',
                                        flexShrink: 0
                                    }}></div>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="btn"
                    style={{
                        padding: '1rem 2rem', background: 'rgba(255,255,255,0.05)', color: currentQuestionIndex === 0 ? '#64748b' : 'white',
                        borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        opacity: currentQuestionIndex === 0 ? 0.5 : 1
                    }}
                >
                    <FaArrowLeft /> Previous
                </button>

                {isLastQuestion ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn"
                        style={{
                            padding: '1rem 3rem', background: '#10b981', color: 'white',
                            borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="btn"
                        style={{
                            padding: '1rem 2rem', background: '#3b82f6', color: 'white',
                            borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        Next <FaArrowRight />
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizPlayer;
