import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';

const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const socket = io(backendURL);

function CodeEditor() {
  const { roomId } = useParams();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState(1);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messageReactions, setMessageReactions] = useState({});
  const [theme, setTheme] = useState('vs-dark');
  const [cursors, setCursors] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [roomEnded, setRoomEnded] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  const monacoRef = useRef(null);

  useEffect(() => {
    // Function to actually emit join
    const performJoin = () => {
      if (!socket.connected) return;
      const activeUser = `Guest-${socket.id?.substring(0, 4) || 'User'}`;
      socket.emit('join-room', roomId, activeUser);
    };

    // Load from localStorage immediately
    const savedCode = localStorage.getItem(`code-${roomId}`);
    if (savedCode) setCode(savedCode);
    const savedMessages = localStorage.getItem(`messages-${roomId}`);
    if (savedMessages) setMessages(JSON.parse(savedMessages));

    // Fetch initial room data
    fetch(`${backendURL}/api/room/${roomId}`)
      .then(res => res.json())
      .then(data => {
        // Public room: Try to join immediately
        if (socket.connected) performJoin();
        else socket.once('connect', () => performJoin());

        // Set initial data if available
        if (data && data.code !== undefined) {
          setCode(data.code || '');
          setLanguage(data.language || 'javascript');
          setMessages(data.messages || []);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch room data:', err);
        setIsLoading(false);
      });

    socket.on('error', (err) => {
      console.error("Socket Error:", err);
    });

    socket.on('room-joined', (data) => {
      setCode(data.code || '');
      setLanguage(data.language || 'javascript');
      setMessages(data.messages || []);
      setUsers(data.users || 1);
      setParticipants(data.participants || [socket.id]);
      setIsLoading(false);
    });

    socket.on('user-joined', (userId) => {
      setParticipants(prev => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });
      setUsers(prev => prev + 1);
    });

    socket.on('user-left', (userId) => {
      setParticipants(prev => prev.filter(id => id !== userId));
      setUsers(prev => prev - 1);
    });

    socket.on('user-count', (count) => {
      setUsers(count);
    });

    socket.on('code-update', (data) => {
      setCode(data.code);
      setLanguage(data.language);
    });

    socket.on('new-message', (message) => {
      if (message.userId !== socket.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('user-typing', (data) => {
      const { userId, isTyping } = data;
      setTypingUsers(prev => {
        if (isTyping) {
          return [...prev.filter(u => u !== userId), userId];
        } else {
          return prev.filter(u => u !== userId);
        }
      });
    });

    socket.on('cursor-update', (data) => {
      const { userId, line, column } = data;
      setCursors(prev => new Map(prev.set(userId, { line, column })));
    });

    socket.on('cursor-leave', (userId) => {
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(userId);
        return newCursors;
      });
    });

    socket.on('room-ended', (data) => {
      setRoomEnded(true);
      localStorage.removeItem(`code-${roomId}`);
      localStorage.removeItem(`messages-${roomId}`);
    });

    return () => {
      socket.off('error');
      socket.off('room-joined');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('user-count');
      socket.off('code-update');
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('cursor-update');
      socket.off('cursor-leave');
      socket.off('room-ended');
    };
  }, [roomId]);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('code-change', { roomId, code: value, language });
  };

  // Save code to localStorage
  useEffect(() => {
    localStorage.setItem(`code-${roomId}`, code);
  }, [code, roomId]);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem(`messages-${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);





  const saveCode = () => {
    // For now, just show a notification
    // In a real app, this might save to a database snippet library
    alert('Code saved locally! (Feature WIP)');
  };

  // Add more themes for VS Code editor
  const themes = ['vs-dark', 'light', 'hc-black'];

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    alert('Link copied to clipboard!');
  };

  const endRoom = () => {
    socket.emit('end-room', roomId, socket.id);
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    const userId = `Guest-${socket.id.substring(0, 4)}`;
    const message = {
      id: Date.now() + Math.random(),
      userId,
      content: messageText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]); // Add locally for instant feedback
    socket.emit('send-message', { roomId, id: message.id, content: messageText, userId });
    socket.emit('typing', { roomId, userId: socket.id || 'Guest', isTyping: false });
    setMessageText('');
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    const safeUserId = `Guest-${socket.id.substring(0, 4)}`;
    socket.emit('typing', { roomId, userId: safeUserId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { roomId, userId: safeUserId, isTyping: false });
    }, 1000);
  };

  const addEmoji = (emoji) => {
    setMessageText(prev => prev + emoji);
  };

  const addReaction = (messageId, emoji) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [emoji]: (prev[messageId]?.[emoji] || 0) + 1
      }
    }));
  };



  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update cursor decorations
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const monaco = monacoRef.current;
      const decorations = [];
      cursors.forEach((cursor, userId) => {
        if (userId !== socket.id) {
          decorations.push({
            range: new monaco.Range(cursor.line + 1, cursor.column + 1, cursor.line + 1, cursor.column + 1),
            options: {
              className: 'other-user-cursor',
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
              afterContentClassName: `cursor-label cursor-${userId.substring(0, 6)}`
            }
          });
        }
      });
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, decorations);
    }
  }, [cursors]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsLoading(false);

    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      socket.emit('cursor-update', {
        roomId,
        userId: socket.id,
        line: position.lineNumber - 1,
        column: position.column - 1
      });
    });

    // Emit cursor leave when focus is lost
    editor.onDidBlurEditorText(() => {
      socket.emit('cursor-leave', socket.id);
    });
  };

  const formatMessage = (msg) => {
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let content;
    if (msg.type === 'voice') {
      content = <audio controls src={msg.fileUrl} />;
    } else if (msg.type === 'file') {
      const isImage = msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i);
      content = isImage ? <img src={msg.fileUrl} alt={msg.content} style={{ maxWidth: '200px' }} /> : <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">{msg.content}</a>;
    } else {
      content = <span className="message-text">{msg.content}</span>;
    }
    return (
      <motion.div
        key={msg.timestamp}
        className="message"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="message-header">
          <span className="user-name">{msg.userId.substring(0, 6)}</span>
          <span className="message-time">{time}</span>
        </div>
        <div className="message-content">{content}</div>
        <div className="message-reactions">
          <button onClick={() => addReaction(msg.timestamp, '👍')}>👍</button>
          <button onClick={() => addReaction(msg.timestamp, '❤️')}>❤️</button>
          <button onClick={() => addReaction(msg.timestamp, '😂')}>😂</button>
        </div>
        {messageReactions[msg.timestamp] && (
          <div className="reactions-display">
            {Object.entries(messageReactions[msg.timestamp]).map(([emoji, count]) => (
              <span key={emoji} className="reaction">{emoji} {count}</span>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1e293b 100%)', color: '#fff' }}>
        <div className="loading-spinner"></div>
        <h2 style={{ marginTop: '1rem' }}>Loading Room: {roomId}...</h2>
        <p>Connecting to the collaborative editor...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="editor-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header
        className="editor-header"
        variants={itemVariants}
        whileHover={{ scale: 1.0 }}
      >
        <div className="header-left">
          <Link to="/" className="btn back-btn">←</Link>
          <div className="room-info">
            <h2>{roomId}</h2>
            <span className="room-badge">JS / WEB</span>
          </div>
        </div>

        <div className="status-bar">

          <div className="users-pill">
            <span>👥 {users}</span>
          </div>
          <button onClick={copyLink} className="btn icon-btn" title="Copy Link">📋</button>
          {!roomEnded && <button onClick={endRoom} className="btn end-room-btn">End Session</button>}
        </div>
      </motion.header>



      {roomEnded && (
        <div className="room-ended-overlay">
          <div className="room-ended-message">
            <h2>Session Ended</h2>
            <p>The coding session has been closed.</p>
            <Link to="/" className="btn primary-btn">Return Home</Link>
          </div>
        </div>
      )}

      <div className="main-layout">
        <motion.div className="participants-pane" variants={itemVariants}>
          <div className="pane-header">
            <h4>Collaborators</h4>
            <span className="count-badge">{participants.length}</span>
          </div>
          <ul>
            {participants.map(participant => (
              <motion.li
                key={participant}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={participant === socket.id ? 'self' : ''}
              >
                <div className="participant-avatar" style={{ background: participant.startsWith('Guest') ? '#64748b' : 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                  {participant.substring(0, 2).toUpperCase()}
                </div>
                <div className="participant-info">
                  <span className="name">{participant.length > 12 ? participant.substring(0, 10) + '...' : participant}</span>
                  <span className="status-text">{typingUsers.includes(participant) ? 'Typing...' : 'Online'}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="editor-wrapper" variants={itemVariants}>
          <div className="code-editor-section">
            <div className="editor-toolbar">
              <div className="toolbar-group">

                <button onClick={saveCode} className="toolbar-btn save-btn">💾 Save</button>
              </div>
              <div className="toolbar-group">
                <button onClick={toggleTheme} className="toolbar-btn theme-btn">🎨 Theme</button>
                <button onClick={toggleChat} className="toolbar-btn chat-btn">
                  {isChatOpen ? 'Hide Chat' : 'Show Chat'} 💬
                </button>
              </div>
            </div>
            <div className="monaco-wrapper">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                theme={theme}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                  fontLigatures: true,
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 }
                }}
              />
            </div>
          </div>


        </motion.div>

        <motion.div
          className={`chat-pane ${isChatOpen ? 'open' : 'closed'}`}
          variants={itemVariants}
        >
          <div className="chat-header">
            <h3>Team Chat</h3>
          </div>
          <div className="chat-messages">
            {messages.map(formatMessage)}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <span className="dot">●</span> Someone is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-container">
            <div className="chat-actions">
              <button onClick={() => addEmoji('😊')}>😊</button>
              <button onClick={() => addEmoji('👍')}>👍</button>
              <button onClick={() => addEmoji('🔥')}>🔥</button>
            </div>
            <div className="input-row">
              <input
                type="text"
                value={messageText}
                onChange={handleInputChange}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} className="send-btn">➤</button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CodeEditor;
