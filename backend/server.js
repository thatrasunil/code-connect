const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
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

// --- Database Connection ---
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeconnect');
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Server will start without DB - features limited to in-memory only.');
  }
}
connectDB();

// --- In-memory Stores ---
const localRooms = new Map();
const activeRooms = new Map(); // roomId -> Map<userId, connectionCount>
const socketIdToUserId = new Map(); // socket.id -> userId

// --- Schemas & Models ---
const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true },
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  messages: [{
    userId: String,
    content: String,
    type: { type: String, enum: ['text'], default: 'text' },
    timestamp: { type: Date, default: Date.now }
  }],
  users: [{ userId: String, joinedAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', roomSchema);

// --- API Routes ---
function generateRoomId() {
  const randomNum = crypto.randomBytes(4).readUInt32BE(0) % 90000000 + 10000000;
  return randomNum.toString();
}

app.post('/api/create-room', async (req, res) => {
  const roomId = generateRoomId();

  try {
    if (mongoose.connection.readyState === 1) {
      const room = new Room({ roomId });
      await room.save();
    } else {
      console.log('Creating room in memory:', roomId);
      const roomData = {
        roomId,
        code: '',
        language: 'javascript',
        messages: [],
        users: [],
        createdAt: new Date()
      };
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
    if (mongoose.connection.readyState === 1) {
      room = await Room.findOne({ roomId });
    } else {
      room = localRooms.get(roomId);
    }

    if (room) {
      res.json(room);
    } else {
      // Loose behavior for testing
      res.json({ code: '', language: 'javascript', messages: [] });
    }
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ error: 'Failed to fetch room' });
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
    if (mongoose.connection.readyState === 1) {
      room = await Room.findOne({ roomId });
      if (room) {
        if (!room.users.find(u => u.userId === userId)) {
          room.users.push({ userId });
          await room.save();
        }
      } else {
        // Fallback for non-existent room in DB
        room = await Room.findOneAndUpdate(
          { roomId },
          { $setOnInsert: { roomId, code: '', language: 'javascript', messages: [], users: [{ userId }] } },
          { new: true, upsert: true }
        );
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
        code: room.code,
        language: room.language,
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
    if (mongoose.connection.readyState === 1) {
      await Room.updateOne({ roomId }, { code, language });
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
    const newMessage = { id, userId, content, type, timestamp: new Date() };

    if (mongoose.connection.readyState === 1) {
      await Room.updateOne({ roomId }, { $push: { messages: newMessage } });
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
    if (mongoose.connection.readyState === 1) {
      await Room.updateOne({ roomId }, { code: '', language: 'javascript', messages: [], endedAt: new Date() });
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
