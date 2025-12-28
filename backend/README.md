# CodeConnect Backend 🔧

Node.js + Express backend server for CodeConnect with Socket.IO for real-time collaboration and MongoDB for data persistence.

## 🎯 Features

- **Real-time Communication**: Socket.IO server for live code updates and chat
- **Room Management**: Create and manage collaboration rooms
- **Dual Mode**: Works with MongoDB or in-memory storage for development
- **Simple & Fast**: No authentication required - instant collaboration

## 📁 Project Structure

```
backend/
├── models/               # (Optional) MongoDB models if using database
├── server.js             # Main server file
├── package.json          # Dependencies
├── .env.example          # Environment variables template
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- MongoDB (optional - works in-memory mode without it)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment (optional)**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file (optional)**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codeconnect
   PORT=3001
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 🔌 API Endpoints

### Room Management

#### Create Room
```http
POST /api/create-room
Content-Type: application/json

Response:
{
  "roomId": "12345678"
}
```

#### Get Room Data
```http
GET /api/room/:roomId

Response:
{
  "roomId": "12345678",
  "code": "console.log('Hello');",
  "language": "javascript",
  "messages": [],
  "users": []
}
```

## 🔌 Socket.IO Events

### Client → Server

| Event | Parameters | Description |
|-------|-----------|-------------|
| `join-room` | `roomId, userId` | Join a collaboration room |
| `code-change` | `{ roomId, code, language }` | Update code in room |
| `typing` | `{ roomId, userId, isTyping }` | Notify typing status |
| `send-message` | `{ roomId, userId, content }` | Send chat message |
| `cursor-update` | `{ roomId, userId, line, column }` | Update cursor position |
| `cursor-leave` | `userId` | Remove cursor |
| `end-room` | `roomId, userId` | End the room session |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `room-joined` | `{ roomId, code, language, messages, participants, users }` | Successful room join |
| `code-update` | `{ code, language }` | Code changed by another user |
| `user-typing` | `{ userId, isTyping }` | User typing status |
| `new-message` | `{ id, userId, content, timestamp }` | New chat message |
| `cursor-update` | `{ userId, line, column }` | Cursor position update |
| `cursor-leave` | `userId` | User cursor removed |
| `user-joined` | `userId` | New user joined room |
| `user-left` | `userId` | User left room |
| `user-count` | `count` | Updated user count |
| `room-ended` | `{ roomId, message }` | Room has been ended |
| `error` | `message` | Error occurred |

## 🗄️ Database Schema

### Room Model (Optional - MongoDB)
```javascript
{
  roomId: String (unique, 8-digit),
  code: String,
  language: String,
  messages: [{
    userId: String,
    content: String,
    type: String (text),
    timestamp: Date
  }],
  users: [{
    userId: String,
    joinedAt: Date
  }],
  createdAt: Date
}
```

## 🛠️ Development

### Available Scripts

```bash
# Start server
npm start

# Development mode with nodemon
npm run dev

# Run ESLint
npm run lint
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string (optional) | `mongodb://localhost:27017/codeconnect` |
| `PORT` | Server port | `3001` |

## 📦 Dependencies

### Production
- **express** (4.19.2) - Web framework
- **socket.io** (4.8.1) - Real-time communication
- **mongoose** (8.18.2) - MongoDB ODM (optional)
- **cors** (2.8.5) - CORS middleware
- **dotenv** (17.2.2) - Environment variables

### Development
- **nodemon** (3.1.10) - Auto-restart on changes
- **eslint** (8.57.1) - Code linting

## 🚀 Deployment

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Heroku
```bash
# Login and create app
heroku login
heroku create codeconnect-backend

# Set environment variables (optional)
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

### Environment Configuration
Optional environment variables:
- `MONGODB_URI` (if using MongoDB)
- `PORT` (usually auto-set by hosting provider)

## 🔍 Monitoring

The server includes built-in logging:
- Request logging with timestamps
- Connection/disconnection events
- Error logging
- Room activity tracking

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Server will automatically fall back to in-memory mode if MongoDB is unavailable
- No data persistence in in-memory mode

### CORS Errors
- Add your frontend URL to `allowedOrigins` array in `server.js`

### Socket.IO Connection Issues
- Check that frontend Socket.IO client version matches server
- Verify CORS configuration includes Socket.IO endpoints

## 📝 License

ISC

## 👨‍💻 Author

**Sunil Rathore**
- GitHub: [@thatrasunil](https://github.com/thatrasunil)
