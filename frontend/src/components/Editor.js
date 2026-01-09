import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor, { useMonaco } from '@monaco-editor/react';
// import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import ChatPanel from './ChatPanel';
import InterviewPanel from './InterviewPanel';
import OutputPanel from './OutputPanel';
import config from '../config';

// Memoize sub-components to prevent re-renders on every keystroke
const MemoizedInterviewPanel = React.memo(InterviewPanel);
const MemoizedChatPanel = React.memo(ChatPanel);
const MemoizedOutputPanel = React.memo(OutputPanel);
import { FaPlay, FaVideo, FaGoogleDrive, FaCog, FaShareAlt, FaRobot } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CodeEditor = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);

    // State
    const [code, setCode] = useState('// Write your code here...');
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState('vs-dark');
    const [output, setOutput] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const lastSavedCodeRef = useRef(code);

    // Panels
    const [showChat, setShowChat] = useState(true);
    const [showInterview, setShowInterview] = useState(true); // Left panel (LeetCode style)
    const [aiMode, setAiMode] = useState(false); // AI Assistance Mode

    // Real-time Data
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [currentTypingUsers, setCurrentTypingUsers] = useState([]);
    const typingTimeoutRef = useRef(null);

    const editorRef = useRef(null);
    const monaco = useMonaco();

    // Socket Connection Removed
    useEffect(() => {
        // Load from local storage if available
        const savedCode = localStorage.getItem(`code_backup_${roomId}`);
        if (savedCode && savedCode !== code) {
            // Optional: You could ask the user if they want to restore, but for now we auto-restore
            // or we could only restore if it's different from default.
            // A better check might be to see if backend brings empty code, then restore local.
            // For now, we trust local if it exists.
            setCode(savedCode);
        }
    }, [roomId]);

    // Polling for Messages and Typing Status
    // Polling for Messages and Typing Status
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${config.BACKEND_URL}/api/rooms/${roomId}/messages`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMessages(data);
                    } else {
                        setMessages([]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };

        const fetchTypingUsers = async () => {
            try {
                const res = await fetch(`${config.BACKEND_URL}/api/rooms/${roomId}/typing/active`);
                if (res.ok) {
                    const users = await res.json();
                    const myUserId = user?.username || 'Guest';
                    setCurrentTypingUsers(users.filter(u => u !== myUserId));
                }
            } catch (err) {
                console.error("Failed to fetch typing users", err);
            }
        };

        fetchMessages();
        fetchTypingUsers();

        const interval = setInterval(() => {
            fetchMessages();
            fetchTypingUsers();
        }, 3000);

        return () => clearInterval(interval);
    }, [roomId, user]);

    // Auto-Save
    useEffect(() => {
        const interval = setInterval(async () => {
            if (editorRef.current) {
                const currentCode = editorRef.current.getValue();
                if (currentCode !== lastSavedCodeRef.current) {
                    setIsSaving(true);

                    // 1. Save to Local Storage
                    localStorage.setItem(`code_backup_${roomId}`, currentCode);

                    // 2. Save to Backend (Placeholder)

                    lastSavedCodeRef.current = currentCode;
                    setTimeout(() => setIsSaving(false), 800);
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [roomId]);

    // Handlers
    const handleEditorChange = (value) => {
        setCode(value);
        // Instant local backup
        localStorage.setItem(`code_backup_${roomId}`, value);
    };

    const handleRunCode = async () => {
        setOutput([{ type: 'info', content: 'Running code...' }]);
        setTimeout(() => {
            try {
                // eslint-disable-next-line
                const result = eval(code);
                setOutput([
                    { type: 'info', content: '> Code Executed:' },
                    { type: 'success', content: String(result) }
                ]);
            } catch (err) {
                setOutput([
                    { type: 'error', content: `Error: ${err.message}` }
                ]);
            }
        }, 1000);
    };

    const handleGoogleMeet = () => {
        window.open('https://meet.google.com/new', '_blank');
    };

    const handleGoogleDriveExport = () => {
        // Simulating export
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code_${roomId}.txt`; // or .js
        a.click();
        alert("Code downloaded! (Ready for Drive Upload)");
    };

    const handleSendMessage = async (text, type = 'TEXT', fileUrl = null, parentId = null) => {
        if (aiMode && type === 'TEXT') {
            // Send to AI
            setMessages(prev => [...prev, { id: Date.now(), userId: 'Me', content: text, type: 'TEXT' }]);
            handleAskAI(text);
        } else {
            // Updated to use REST API instead of Socket
            try {
                const res = await fetch(`${config.BACKEND_URL}/api/rooms/${roomId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        userId: user?.username || 'Guest',
                        content: text,
                        type,
                        fileUrl,
                        parentId
                    })
                });

                if (res.ok) {
                    const newMsg = await res.json();
                    // Optimistic update not strictly needed if polling is fast, but better UX
                    setMessages(prev => [...prev, newMsg]);
                }
            } catch (err) {
                console.error("Failed to send message", err);
            }
        }
    };

    const handleAskAI = async (prompt) => {
        try {
            setMessages(prev => [...prev, { id: Date.now() + 1, userId: 'AI (Thinking...)', content: 'Thinking...', type: 'AI_PENDING' }]);

            const res = await fetch(`${config.BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context: code })
            });
            const data = await res.json();

            // Remove pending and add real response
            setMessages(prev => prev.filter(m => m.type !== 'AI_PENDING'));
            const aiResponse = typeof data.response === 'object' ? JSON.stringify(data.response) : String(data.response || '');
            setMessages(prev => [...prev, { id: Date.now() + 2, userId: 'Gemini AI', content: aiResponse, type: 'AI_RESPONSE' }]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAIExplain = async () => {
        // Get selected code or full code
        const model = editorRef.current.getModel();
        const selection = editorRef.current.getSelection();
        const selectedCode = model.getValueInRange(selection) || code;

        handleAskAI(`Explain this code:\n${selectedCode}`);
        setShowChat(true); // Force open chat to see result
        setAiMode(true);
    };

    const handleTyping = async () => {
        if (!user) return;

        // Clear existing timeout to reset debouncer for "stop typing"
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Notify backend "I am typing" 
        try {
            await fetch(`${config.BACKEND_URL}/api/rooms/${roomId}/typing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.username, isTyping: true })
            });
        } catch (err) { console.error(err); }

        // Set timeout to send "stop typing"
        typingTimeoutRef.current = setTimeout(async () => {
            try {
                await fetch(`${config.BACKEND_URL}/api/rooms/${roomId}/typing`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.username, isTyping: false })
                });
            } catch (err) { console.error(err); }
        }, 2000); // Stop typing after 2 seconds of inactivity
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', color: 'white' }}>
            {/* Toolbar */}
            <div style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', background: '#1e293b' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="logo" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>CodeConnect</div>
                    <div style={{ height: '24px', width: '1px', background: '#475569' }}></div>
                    <button className="btn" style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }} onClick={handleRunCode}><FaPlay color="#10b981" /> Run</button>
                    <button className="btn" style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }} onClick={handleGoogleMeet} title="Start Google Meet"><FaVideo /> Meet</button>
                    <div style={{ fontSize: '0.8rem', color: isSaving ? '#facc15' : '#94a3b8', fontStyle: 'italic', minWidth: '60px' }}>
                        {isSaving ? 'Saving...' : 'Saved'}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn icon-btn" onClick={handleAIExplain} title="Explain with AI" style={{ color: '#8b5cf6', background: 'transparent', border: 'none' }}><FaRobot /> Explain</button>
                    <button className="btn" onClick={handleGoogleDriveExport} style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: 'none' }} title="Export to Drive"><FaGoogleDrive /> Export</button>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', fontSize: '0.8rem' }}>
                        <span style={{ color: '#94a3b8' }}>Participants: {participants.length}</span>
                    </div>
                    <div className="avatar-group" style={{ display: 'flex' }}>
                        {participants.slice(0, 3).map((p, i) => (
                            <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', background: p.color || '#64748b', border: '2px solid #1e293b', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                {p.name?.[0]?.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content (LeetCode Style Grid) */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Left Panel: Instructions / Interview Questions */}
                <motion.div
                    initial={{ width: 350, opacity: 1 }}
                    animate={{ width: showInterview ? 350 : 0, opacity: showInterview ? 1 : 0 }}
                    style={{ borderRight: '1px solid #334155', display: showInterview ? 'block' : 'none', background: '#1e293b' }}
                >
                    <MemoizedInterviewPanel
                        socket={socket}
                        roomId={roomId}
                        onPostQuestion={(text) => setCode(prev => text + prev)}
                    />
                </motion.div>

                {/* Center Panel: Code Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <Editor
                        height="100%"
                        theme={theme}
                        language={language}
                        value={code}
                        onChange={handleEditorChange}
                        onMount={(editor) => { editorRef.current = editor; }}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />

                    {/* Output Panel Overlay */}
                    <MemoizedOutputPanel
                        isOpen={output.length > 0}
                        output={output}
                        onClose={() => setOutput([])}
                        isRunning={false} // simplistic
                    />
                </div>

                {/* Right Panel: Chat / AI */}
                <motion.div
                    initial={{ width: 320, opacity: 1 }}
                    animate={{ width: showChat ? 320 : 0, opacity: showChat ? 1 : 0 }}
                    style={{ borderLeft: '1px solid #334155', display: showChat ? 'block' : 'none', background: '#1e293b' }}
                >
                    <div style={{ padding: '10px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>Chat & AI</span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                                onClick={() => setAiMode(!aiMode)}
                                style={{
                                    fontSize: '0.7rem', padding: '4px 8px', borderRadius: '12px',
                                    background: aiMode ? 'linear-gradient(45deg, #8b5cf6, #ec4899)' : 'rgba(255,255,255,0.1)',
                                    border: 'none', color: 'white', cursor: 'pointer'
                                }}
                            >
                                {aiMode ? 'AI ON 🤖' : 'AI OFF'}
                            </button>
                            <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'white' }}><FaShareAlt /></button>
                        </div>
                    </div>
                    <div style={{ height: 'calc(100% - 50px)' }}>
                        <MemoizedChatPanel
                            socket={socket}
                            roomId={roomId}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isOpen={true}
                            currentTypingUsers={currentTypingUsers}
                            onTyping={handleTyping}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Toggle Buttons (Floating or Footer) */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '10px', zIndex: 100 }}>
                {!showInterview && <button onClick={() => setShowInterview(true)} className="btn primary-btn" style={{ borderRadius: '50%', padding: '10px' }}><FaShareAlt /></button>}
                {!showChat && <button onClick={() => setShowChat(true)} className="btn primary-btn" style={{ borderRadius: '50%', padding: '10px' }}><FaShareAlt style={{ transform: 'scaleX(-1)' }} /></button>}
            </div>
        </div>
    );
};

export default CodeEditor;
