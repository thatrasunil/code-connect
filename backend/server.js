const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin'); // Firebase Admin
const { getFirestore } = require('firebase-admin/firestore');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3007",
  process.env.FRONTEND_URL || "https://codeconnect.vercel.app",
  "https://codeconnect-zeta-pied.vercel.app",
  "https://codeconnect-frontend.vercel.app",
  "https://codeshare-production-b2f2.up.railway.app"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
  exposedHeaders: ["Access-Control-Allow-Origin"],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'CodeConnect Backend API is running' });
});

const PORT = process.env.PORT || 3001;

// --- Database Connection (Firebase Firestore) ---
let db;
let isFirestoreConnected = false;

try {
  // Check for service account - normally provided via GOOGLE_APPLICATION_CREDENTIALS
  // or passed directly. For now, we'll try default app or warn.
  if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized with SERVICE_ACCOUNT env var");
    } else {
      // Attempt default initialization (works on GCP/Render if env vars set)
      admin.initializeApp();
      console.log("Firebase Admin initialized with default credentials");
    }
  }
  db = getFirestore();
  isFirestoreConnected = true;
  console.log('Firestore connected successfully');
} catch (err) {
  console.warn('Firebase connection warning:', err.message);
  console.log('Server will start with IN-MEMORY storage only.');
  console.log('To enable persistence, set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS');
}

// --- In-memory Stores (Fallback) ---
const localRooms = new Map();
const activeRooms = new Map(); // roomId -> Map<userId, connectionCount>
const socketIdToUserId = new Map(); // socket.id -> userId

// --- API Routes ---
function generateRoomId() {
  const randomNum = crypto.randomBytes(4).readUInt32BE(0) % 90000000 + 10000000;
  return randomNum.toString();
}

app.post('/api/create-room', async (req, res) => {
  const roomId = generateRoomId();

  const roomData = {
    roomId,
    code: '',
    language: 'javascript',
    messages: [],
    users: [],
    createdAt: new Date().toISOString() // Firestore prefers standard formats or Timestamps
  };

  try {
    if (isFirestoreConnected) {
      await db.collection('rooms').doc(roomId).set(roomData);
    } else {
      console.log('Creating room in memory:', roomId);
      localRooms.set(roomId, roomData);
    }
    res.json({ roomId });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/api/room/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    let room;
    if (isFirestoreConnected) {
      const doc = await db.collection('rooms').doc(roomId).get();
      if (doc.exists) {
        room = doc.data();
      }
    } else {
      room = localRooms.get(roomId);
    }

    if (room) {
      res.json(room);
    } else {
      // Return defaults if not found
      res.json({ code: '', language: 'javascript', messages: [] });
    }
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// --- AI Configuration ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/api/ai/chat', async (req, res) => {
  const { prompt, context } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

app.post('/api/ai/explain', async (req, res) => {
  const { code, language } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Explain the following ${language} code in simple terms:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

// --- Code Execution (Piston API Proxy) ---
app.post('/api/execute', async (req, res) => {
  const { code, language } = req.body;

  // Map frontend languages to Piston languages
  const languageMap = {
    'javascript': 'javascript',
    'python': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'go': 'go',
    'rust': 'rust',
    'typescript': 'typescript'
  };

  const pistonLang = languageMap[language] || language;

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: pistonLang,
        version: '*', // Use latest available
        files: [
          {
            content: code
          }
        ]
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Transform Piston output to match our frontend expectation
      // Frontend expects: { results: [ { actual: "output string", error: "error string" } ] }
      const result = {
        actual: data.run.stdout,
        error: data.run.stderr
      };
      res.json({ results: [result] });
    } else {
      console.error('Piston API Error:', data);
      res.status(response.status).json({ error: data.message || 'Execution failed' });
    }
  } catch (error) {
    console.error('Execution Server Error:', error);
    res.status(500).json({ error: 'Failed to connect to execution service' });
  }
});

// --- Socket.IO Events ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId, userId) => {
    socket.join(roomId);
    socketIdToUserId.set(socket.id, userId);

    if (!activeRooms.has(roomId)) activeRooms.set(roomId, new Map());
    const roomUsers = activeRooms.get(roomId);

    if (!roomUsers.has(userId)) roomUsers.set(userId, 1);
    else roomUsers.set(userId, roomUsers.get(userId) + 1);

    // Update DB/Local user list
    let room;
    if (isFirestoreConnected) {
      const roomRef = db.collection('rooms').doc(roomId);
      const doc = await roomRef.get();
      if (doc.exists) {
        room = doc.data();
        // Add user if not present (simple check)
        const userExists = room.users && room.users.some(u => u.userId === userId);
        if (!userExists) {
          await roomRef.update({
            users: admin.firestore.FieldValue.arrayUnion({ userId, joinedAt: new Date().toISOString() })
          });
        }
      } else {
        // Upsert handled slightly differently in Firestore, usually create first but fallback here
        const newRoom = {
          roomId,
          code: '',
          language: 'javascript',
          messages: [],
          users: [{ userId, joinedAt: new Date().toISOString() }]
        };
        await roomRef.set(newRoom);
        room = newRoom;
      }
    } else {
      if (!localRooms.has(roomId)) localRooms.set(roomId, { roomId, code: '', language: 'javascript', messages: [], users: [] });
      room = localRooms.get(roomId);
      if (room && (!room.users || !room.users.find(u => u.userId === userId))) {
        if (!room.users) room.users = [];
        room.users.push({ userId });
      }
    }

    const activeCount = roomUsers.size;
    const activeParticipants = Array.from(roomUsers.keys());

    if (room) {
      socket.emit('room-joined', {
        roomId,
        code: room.code || '',
        language: room.language || 'javascript',
        messages: room.messages || [],
        participants: activeParticipants,
        users: activeCount
      });
    }

    if (roomUsers.get(userId) === 1) socket.to(roomId).emit('user-joined', userId);
    io.to(roomId).emit('user-count', activeCount);
  });

  socket.on('code-change', async (data) => {
    const { roomId, code, language } = data;
    if (isFirestoreConnected) {
      // Debounce or just fire and forget usually, but here we await
      await db.collection('rooms').doc(roomId).update({ code, language }).catch(e => console.error('Code update failed', e));
    } else {
      const room = localRooms.get(roomId);
      if (room) { room.code = code; room.language = language; }
    }
    socket.to(roomId).emit('code-update', { code, language });
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', data);
  });

  socket.on('send-message', async (data) => {
    const { roomId, id, content, userId, type = 'text' } = data;
    const newMessage = { id, userId, content, type, timestamp: new Date().toISOString() };

    if (isFirestoreConnected) {
      await db.collection('rooms').doc(roomId).update({
        messages: admin.firestore.FieldValue.arrayUnion(newMessage)
      }).catch(e => console.error('Message update failed', e));
    } else {
      const room = localRooms.get(roomId);
      if (room) {
        if (!room.messages) room.messages = [];
        room.messages.push(newMessage);
      }
    }
    io.to(roomId).emit('new-message', newMessage);
  });

  socket.on('cursor-update', (data) => socket.to(data.roomId).emit('cursor-update', data));

  socket.on('cursor-leave', (userId) => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) socket.to(roomId).emit('cursor-leave', userId);
    }
  });

  socket.on('end-room', async (roomId, userId) => {
    if (isFirestoreConnected) {
      await db.collection('rooms').doc(roomId).update({
        code: '',
        language: 'javascript',
        messages: [],
        endedAt: new Date().toISOString()
      }).catch(e => console.error('End room failed', e));
    } else {
      const room = localRooms.get(roomId);
      if (room) { room.code = ''; room.messages = []; room.endedAt = new Date(); }
    }
    io.to(roomId).emit('room-ended', { roomId, message: 'Room ended' });
    activeRooms.delete(roomId);
  });

  socket.on('disconnect', () => {
    const userId = socketIdToUserId.get(socket.id);
    if (!userId) return;

    for (const roomId of socket.rooms) {
      if (activeRooms.has(roomId) && roomId !== socket.id) {
        const roomUsers = activeRooms.get(roomId);
        if (roomUsers.has(userId)) {
          roomUsers.set(userId, roomUsers.get(userId) - 1);
          if (roomUsers.get(userId) === 0) {
            roomUsers.delete(userId);
            socket.to(roomId).emit('user-left', userId);
          }
          const newCount = roomUsers.size;
          io.to(roomId).emit('user-count', newCount);
          if (newCount === 0) activeRooms.delete(roomId);
        }
      }
    }
    socketIdToUserId.delete(socket.id);
  });
});

// 404 Handler - Must be last
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

if (process.env.VERCEL) {
  module.exports = app;
} else {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
