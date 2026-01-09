import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor, { useMonaco } from '@monaco-editor/react';
import { FaPlay, FaVideo, FaGoogleDrive, FaCog, FaShareAlt, FaRobot, FaDownload, FaCopy, FaHistory, FaLock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';
import ChatPanel from './ChatPanel';
import InterviewPanel from './InterviewPanel';
import OutputPanel from './OutputPanel';
import SettingsModal from './SettingsModal';
import config from '../config';
import { SUPPORTED_LANGUAGES, SUPPORTED_THEMES, DEFAULT_EDITOR_SETTINGS } from '../constants';

// Memoize sub-components to prevent re-renders on every keystroke
const MemoizedInterviewPanel = React.memo(InterviewPanel);
const MemoizedChatPanel = React.memo(ChatPanel);
const MemoizedOutputPanel = React.memo(OutputPanel);

const CodeEditor = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    // Auth State
    const [isLocked, setIsLocked] = useState(false);
    const [roomPassword, setRoomPassword] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [accessError, setAccessError] = useState('');

    const queryParams = new URLSearchParams(location.search);
    const initialQuestionId = queryParams.get('questionId');

    // State
    const [code, setCode] = useState('// Write your code here...');
    const [language, setLanguage] = useState(() => localStorage.getItem(`editor_language_${roomId}`) || 'javascript');
    const [theme, setTheme] = useState(() => localStorage.getItem(`editor_theme_${roomId}`) || 'vs-dark');
    const [editorSettings, setEditorSettings] = useState(() => {
        const saved = localStorage.getItem(`editor_settings_${roomId}`);
        return saved ? JSON.parse(saved) : DEFAULT_EDITOR_SETTINGS;
    });

    const [showSettings, setShowSettings] = useState(false);
    const [snapshots, setSnapshots] = useState([]);
    const [output, setOutput] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const lastSavedCodeRef = useRef(code);
    const lastTypeTimeRef = useRef(0);
    const isTypingRef = useRef(false);

    // Panels
    const [showChat, setShowChat] = useState(true);
    const [showInterview, setShowInterview] = useState(true);
    const [aiMode, setAiMode] = useState(false);

    // Real-time Data
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [currentTypingUsers, setCurrentTypingUsers] = useState([]);
    const [userRole, setUserRole] = useState('CANDIDATE');
    const [permissions, setPermissions] = useState({ canEdit: true, canView: true, canEvaluate: false });
    const typingTimeoutRef = useRef(null);

    const editorRef = useRef(null);
    const monaco = useMonaco();

    // Helper for Authenticated Requests with Password
    const authenticatedFetch = async (url, options = {}) => {
        const headers = {
            ...options.headers,
            'Authorization': token ? `Bearer ${token}` : '',
            'X-Room-Password': roomPassword
        };
        return fetch(url, { ...options, headers });
    };

    // 1. Initial Access Check
    useEffect(() => {
        const checkAccess = async () => {
            try {
                // Check Room Detail (which now enforces password)
                const res = await fetch(`${config.BACKEND_URL}/api/rooms/${roomId}/`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'X-Room-Password': roomPassword
                    }
                });

                if (res.status === 403) {
                    setIsLocked(true);
                    return;
                }

                if (res.ok) {
                    setIsLocked(false);
                    setAccessError('');
                    const data = await res.json();
                    if (data.language) setLanguage(data.language);
                    if (data.code) setCode(data.code);
                }
            } catch (err) {
                console.error("Access Check Failed", err);
            }
        };
        checkAccess();
    }, [roomId, token, roomPassword]);

    const handleUnlock = (e) => {
        e.preventDefault();
        setRoomPassword(passwordInput); // Triggers effect to retry
    };

    // Load Local Backup
    useEffect(() => {
        const savedCode = localStorage.getItem(`code_backup_${roomId}`);
        if (savedCode && savedCode !== code) {
            setCode(savedCode);
        }
    }, [roomId]);

    // Fetch user permissions
    useEffect(() => {
        if (isLocked) return;
        const fetchPermissions = async () => {
            try {
                const userId = user?.username || 'Guest';
                const res = await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/permissions?userId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setUserRole(data.role);
                    setPermissions(data);
                }
            } catch (err) {
                console.error("Failed to fetch permissions", err);
            }
        };
        fetchPermissions();
    }, [roomId, user, isLocked, roomPassword]);

    // Polling for Messages and Typing Status
    useEffect(() => {
        if (isLocked) return;

        const fetchMessages = async () => {
            try {
                const res = await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/messages`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setMessages(data);
                    else setMessages([]);
                }
            } catch (err) { console.error("Failed to fetch messages", err); }
        };

        const fetchParticipants = async () => {
            try {
                const res = await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/participants`);
                if (res.ok) {
                    const data = await res.json();
                    setParticipants(data);
                }
            } catch (err) { console.error("Failed to fetch participants", err); }
        };

        const fetchTypingUsers = async () => {
            try {
                const res = await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/typing/active`);
                if (res.ok) {
                    const users = await res.json();
                    const myUserId = user?.username || 'Guest';
                    setCurrentTypingUsers(users.filter(u => u !== myUserId));
                }
            } catch (err) { console.error("Failed to fetch typing users", err); }
        };

        const sendHeartbeat = async () => {
            try {
                await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/heartbeat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user?.username || 'Guest',
                        username: user?.username || 'Guest'
                    })
                });
            } catch (err) { console.error("Heartbeat failed", err); }
        };

        const fetchRoomData = async () => {
            // Only fetch code if user hasn't typed in last 2 seconds
            if (Date.now() - lastTypeTimeRef.current < 2000) return;

            try {
                // Fetch Code
                const resCode = await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/code/`);
                if (resCode.ok) {
                    const data = await resCode.json();
                    // Only update if content is different and we are not currently saving
                    if (data.content !== lastSavedCodeRef.current && data.content !== code) {
                        setCode(data.content);
                        lastSavedCodeRef.current = data.content;
                    }
                }

                // Fetch Language
                const resLang = await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/metadata/`);
                if (resLang.ok) {
                    const data = await resLang.json();
                    if (data.language && data.language !== language) {
                        setLanguage(data.language);
                        localStorage.setItem(`editor_language_${roomId}`, data.language);
                    }
                }
            } catch (err) { console.error("Failed to fetch room data", err); }
        };

        // Initial calls
        fetchMessages();
        fetchParticipants();
        fetchTypingUsers();
        sendHeartbeat();
        fetchRoomData();

        const interval = setInterval(() => {
            fetchMessages();
            fetchParticipants();
            fetchTypingUsers();
            sendHeartbeat();
            fetchRoomData();
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [roomId, user, isLocked, roomPassword]);

    // Auto-Save
    useEffect(() => {
        if (isLocked) return;
        const interval = setInterval(async () => {
            if (editorRef.current) {
                const currentCode = editorRef.current.getValue();
                if (currentCode !== lastSavedCodeRef.current) {
                    setIsSaving(true);
                    localStorage.setItem(`code_backup_${roomId}`, currentCode);

                    try {
                        await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/code/`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: currentCode })
                        });
                        lastSavedCodeRef.current = currentCode;
                    } catch (err) {
                        console.error("Failed to save code", err);
                    } finally {
                        setTimeout(() => setIsSaving(false), 800);
                    }
                }
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [roomId, token, isLocked, roomPassword]);

    // Handlers
    const handleEditorChange = (value) => {
        setCode(value);
        lastTypeTimeRef.current = Date.now();
        localStorage.setItem(`code_backup_${roomId}`, value);
    };

    const handleRunCode = async () => {
        setOutput([{ type: 'info', content: `Running ${language} code...` }]);

        try {
            const res = await authenticatedFetch(`${config.BACKEND_URL}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    testCases: []
                })
            });

            const data = await res.json();
            if (res.ok) {
                const runResult = data.results && data.results.length > 0 ? data.results[0] : null;
                if (runResult) {
                    // ... (keep existing logic)
                    if (runResult.error) {
                        const errorContent = `Error: ${runResult.error}`;
                        const outputLines = [{ type: 'error', content: errorContent }];
                        if (language === 'javascript' && (runResult.error.includes('print is not defined') || runResult.error.includes('NameError'))) {
                            outputLines.push({ type: 'warning', content: '💡 Hint: It looks like you are writing Python code. Switch the language selector to "Python".' });
                        }
                        setOutput(outputLines);
                    } else {
                        setOutput([
                            { type: 'info', content: '> Code Executed:' },
                            { type: 'success', content: runResult.actual || 'No output' }
                        ]);
                    }
                } else {
                    setOutput([{ type: 'info', content: 'No output' }]);
                }
            } else {
                setOutput([{ type: 'error', content: `Execution Failed: ${data.detail || data.error || 'Unknown Error'}` }]);
            }
        } catch (err) {
            setOutput([{ type: 'error', content: `Error: ${err.message}` }]);
        }
    };

    const handleSettingsChange = (newSettings) => {
        setEditorSettings(newSettings);
        localStorage.setItem(`editor_settings_${roomId}`, JSON.stringify(newSettings));
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            alert("Code copied to clipboard!");
        } catch (err) { console.error("Failed to copy", err); }
    };

    const handleDownloadCode = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code_${roomId}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
        a.click();
    };

    const handleSaveSnapshot = () => {
        const snap = { id: Date.now(), code, timestamp: new Date().toLocaleString() };
        setSnapshots(prev => [snap, ...prev]);
        alert("Snapshot saved!");
    };

    useEffect(() => {
        if (snapshots.length > 5) setSnapshots(prev => prev.slice(0, 5));
    }, [snapshots]);

    const handleGoogleMeet = () => window.open('https://meet.google.com/new', '_blank');

    const handleSendMessage = async (text, type = 'TEXT', fileUrl = null, parentId = null) => {
        if (aiMode && type === 'TEXT') {
            setMessages(prev => [...prev, { id: Date.now(), userId: 'Me', content: text, type: 'TEXT' }]);
            handleAskAI(text);
        } else {
            try {
                const res = await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                    setMessages(prev => [...prev, newMsg]);
                }
            } catch (err) { console.error("Failed to send message", err); }
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
            if (!res.ok) throw new Error(`Server Error: ${res.status}`);
            const data = await res.json();
            setMessages(prev => prev.filter(m => m.type !== 'AI_PENDING'));
            const aiResponse = typeof data.response === 'object' ? JSON.stringify(data.response) : String(data.response || '');
            setMessages(prev => [...prev, { id: Date.now() + 2, userId: 'Gemini AI', content: aiResponse, type: 'AI_RESPONSE' }]);
        } catch (err) {
            setMessages(prev => prev.filter(m => m.type !== 'AI_PENDING'));
            setMessages(prev => [...prev, { id: Date.now() + 3, userId: 'System', content: `Error: ${err.message}`, type: 'TEXT' }]);
        }
    };

    const handleAIExplain = async () => {
        const model = editorRef.current.getModel();
        const selection = editorRef.current.getSelection();
        const selectedCode = model.getValueInRange(selection) || code;
        handleAskAI(`Explain this code:\n${selectedCode}`);
        setShowChat(true);
        setAiMode(true);
    };

    const handleTyping = async () => {
        if (!user) return;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        try {
            await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/typing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.username, isTyping: true })
            });
        } catch (err) { }

        typingTimeoutRef.current = setTimeout(async () => {
            try {
                await authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/typing`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.username, isTyping: false })
                });
            } catch (err) { }
        }, 2000);
    };

    if (isLocked) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
                    <FaLock size={50} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>Private Room</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>This room is password protected.</p>

                    <form onSubmit={handleUnlock}>
                        <input
                            type="password"
                            placeholder="Enter password..."
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid #334155',
                                color: 'white', marginBottom: '1rem', outline: 'none'
                            }}
                        />
                        <button type="submit" className="btn" style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px' }}>
                            Unlock Room
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', color: 'white' }}>
            {/* Toolbar */}
            <div style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', background: '#1e293b' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="logo" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>CodeConnect</div>
                    <div style={{ height: '24px', width: '1px', background: '#475569' }}></div>

                    {/* Language Selector */}
                    <select
                        value={language}
                        onChange={(e) => {
                            const newLang = e.target.value;
                            setLanguage(newLang);
                            localStorage.setItem(`editor_language_${roomId}`, newLang);
                            authenticatedFetch(`${config.BACKEND_URL}/api/rooms/${roomId}/language/`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ language: newLang })
                            }).catch(err => console.error(err));
                        }}
                        style={{ background: '#334155', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', outline: 'none' }}
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                    </select>

                    {/* Theme Selector */}
                    <select
                        value={theme}
                        onChange={(e) => {
                            const newTheme = e.target.value;
                            setTheme(newTheme);
                            localStorage.setItem(`editor_theme_${roomId}`, newTheme);
                        }}
                        style={{ background: '#334155', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', outline: 'none' }}
                    >
                        {SUPPORTED_THEMES.map(theme => (
                            <option key={theme.id} value={theme.id}>{theme.name}</option>
                        ))}
                    </select>

                    <div style={{ height: '24px', width: '1px', background: '#475569' }}></div>

                    <button className="btn" style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }} onClick={handleRunCode}><FaPlay color="#10b981" /> Run</button>
                    <button className="btn" style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }} onClick={handleGoogleMeet} title="Start Google Meet"><FaVideo /> Meet</button>
                    <button className="btn" style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }} onClick={() => setShowSettings(true)} title="Settings"><FaCog /></button>

                    <div style={{ fontSize: '0.8rem', color: isSaving ? '#facc15' : '#94a3b8', fontStyle: 'italic', minWidth: '60px' }}>
                        {isSaving ? 'Saving...' : 'Saved'}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn icon-btn" onClick={handleAIExplain} title="Explain with AI" style={{ color: '#8b5cf6', background: 'transparent', border: 'none' }}><FaRobot /> Explain</button>
                    <button className="btn icon-btn" onClick={() => {
                        const model = editorRef.current.getModel();
                        const selection = editorRef.current.getSelection();
                        const selectedCode = model.getValueInRange(selection) || code;
                        handleAskAI(`Find bugs and suggest fixes for this code:\n${selectedCode}`);
                        setShowChat(true);
                        setAiMode(true);
                    }} title="Debug with AI" style={{ color: '#ef4444', background: 'transparent', border: 'none' }}><FaRobot /> Debug</button>

                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="btn" onClick={handleDownloadCode} title="Download File" style={{ background: 'transparent', border: 'none', color: 'white' }}><FaDownload /></button>
                        <button className="btn" onClick={handleCopyCode} title="Copy to Clipboard" style={{ background: 'transparent', border: 'none', color: 'white' }}><FaCopy /></button>
                        <button className="btn" onClick={handleSaveSnapshot} title="Save Snapshot" style={{ background: 'transparent', border: 'none', color: 'white' }}><FaHistory /></button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', fontSize: '0.8rem' }}>
                        <span style={{ color: '#94a3b8' }}>Participants: {participants.length}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Panel */}
                <motion.div
                    initial={{ width: 350, opacity: 1 }}
                    animate={{ width: showInterview ? 350 : 0, opacity: showInterview ? 1 : 0 }}
                    style={{ borderRight: '1px solid #334155', display: showInterview ? 'block' : 'none', background: '#1e293b' }}
                >
                    <MemoizedInterviewPanel
                        socket={null}
                        roomId={roomId}
                        onPostQuestion={(text) => setCode(prev => text + prev)}
                        initialQuestionId={initialQuestionId}
                    />
                </motion.div>

                {/* Center Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {userRole === 'INTERVIEWER' && (
                        <div style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            🎯 INTERVIEWER MODE - Read-Only View
                        </div>
                    )}

                    <Editor
                        height="100%"
                        theme={theme}
                        language={language}
                        value={code}
                        onChange={handleEditorChange}
                        onMount={(editor) => { editorRef.current = editor; }}
                        options={{
                            minimap: { enabled: false },
                            fontSize: editorSettings.fontSize,
                            wordWrap: editorSettings.wordWrap,
                            lineNumbers: editorSettings.lineNumbers,
                            tabSize: editorSettings.tabSize,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            readOnly: !permissions.canEdit,
                            domReadOnly: !permissions.canEdit,
                        }}
                    />

                    <MemoizedOutputPanel
                        isOpen={output.length > 0}
                        output={output}
                        onClose={() => setOutput([])}
                        isRunning={false}
                    />

                    <SettingsModal
                        isOpen={showSettings}
                        onClose={() => setShowSettings(false)}
                        settings={editorSettings}
                        onSettingsChange={handleSettingsChange}
                    />
                </div>

                {/* Right Panel */}
                <motion.div
                    initial={{ width: 320, opacity: 1 }}
                    animate={{ width: showChat ? 320 : 0, opacity: showChat ? 1 : 0 }}
                    style={{ borderLeft: '1px solid #334155', display: showChat ? 'block' : 'none', background: '#1e293b' }}
                >
                    <div style={{ padding: '10px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>Chat & AI</span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => setAiMode(!aiMode)} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '12px', background: aiMode ? 'linear-gradient(45deg, #8b5cf6, #ec4899)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}>{aiMode ? 'AI ON 🤖' : 'AI OFF'}</button>
                            <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'white' }}><FaShareAlt /></button>
                        </div>
                    </div>
                    <div style={{ height: 'calc(100% - 50px)' }}>
                        <MemoizedChatPanel
                            socket={null}
                            roomId={roomId}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isOpen={true}
                            currentTypingUsers={currentTypingUsers}
                            onTyping={handleTyping}
                            aiMode={aiMode}
                            setAiMode={setAiMode}
                        />
                    </div>
                </motion.div>
            </div>

            <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '10px', zIndex: 100 }}>
                {!showInterview && <button onClick={() => setShowInterview(true)} className="btn primary-btn" style={{ borderRadius: '50%', padding: '10px' }}><FaShareAlt /></button>}
                {!showChat && <button onClick={() => setShowChat(true)} className="btn primary-btn" style={{ borderRadius: '50%', padding: '10px' }}><FaShareAlt style={{ transform: 'scaleX(-1)' }} /></button>}
            </div>
        </div>
    );
};

export default CodeEditor;
