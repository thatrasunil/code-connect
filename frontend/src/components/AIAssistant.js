import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaMinus } from 'react-icons/fa';
import config from '../config';
import { useToast } from '../contexts/ToastContext';

const AIAssistant = () => {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', content: 'Hello! I am your CodeConnect AI assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch(`${config.BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMsg.content })
            });
            const data = await res.json();

            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                content: typeof data.response === 'string' ? data.response : JSON.stringify(data.response)
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error("AI Chat Error:", err);
            toast.error("Failed to connect to AI. Please try again.");
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: 'Sorry, I encountered an error connecting to the AI brain.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        style={{
                            width: '350px',
                            height: '500px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginBottom: '16px',
                            color: 'white'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px',
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                <FaRobot size={18} /> AI Assistant
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <FaMinus style={{ cursor: 'pointer' }} onClick={() => setIsMinimized(true)} />
                                <FaTimes style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            padding: '16px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{
                                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    background: msg.type === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    borderBottomRightRadius: msg.type === 'user' ? '2px' : '12px',
                                    borderBottomLeftRadius: msg.type === 'bot' ? '2px' : '12px',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.content}
                                </div>
                            ))}
                            {isLoading && (
                                <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '12px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                    Typing...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask me anything..."
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    style={{
                                        background: '#3b82f6',
                                        border: 'none',
                                        borderRadius: '8px',
                                        width: '40px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <FaPaperPlane size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen || isMinimized ? (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setIsOpen(true); setIsMinimized(false); }}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                    }}
                >
                    <FaRobot />
                </motion.button>
            ) : null}
        </div>
    );
};

export default AIAssistant;
