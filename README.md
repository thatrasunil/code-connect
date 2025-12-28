# CodeConnect 🚀

A real-time collaborative code editor with integrated chat, voice messaging, and file sharing capabilities. Built with React, Node.js, Socket.IO, and MongoDB.

![CodeConnect](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Collaborative Editing**: Multiple users can edit code simultaneously with live updates
- **Multi-language Support**: Syntax highlighting for JavaScript, Python, Java, C++, and more
- **Room Management**: Generate unique 8-digit room IDs for easy sharing
- **Instant Collaboration**: No signup required - just create or join a room

### 💬 Communication
- **Integrated Chat**: Real-time text messaging within each room
- **Live Cursors**: See where other users are typing in real-time
- **Typing Indicators**: Know when others are actively coding

### 🎨 User Experience
- **Modern UI**: Clean, intuitive interface built with React
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Eye-friendly dark mode for extended coding sessions
- **Monaco Editor**: Powered by the same editor as VS Code

## 🏗️ Architecture

```
codeconnect/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── pages/         # Main application pages
│   │   └── App.js         # Root component
│   └── package.json
│
├── backend/           # Node.js + Express server
│   ├── models/            # MongoDB schemas
│   ├── server.js          # Main server file
│   └── package.json
│
└── README.md

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thatrasunil/codeconnect.git
   cd codeconnect
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codeconnect
PORT=3001
```

### Frontend Configuration
The frontend is configured to connect to `http://localhost:3001` by default. Update the API endpoint in your code if deploying to production.

## 📚 Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **React Router** 7.9.2 - Navigation
- **Monaco Editor** 4.7.0 - Code editor component
- **Socket.IO Client** 4.8.1 - Real-time communication
- **Framer Motion** 12.23.22 - Animations

### Backend
- **Node.js** 18.x - Runtime environment
- **Express** 4.19.2 - Web framework
- **Socket.IO** 4.8.1 - WebSocket server
- **MongoDB** with Mongoose 8.18.2 - Database

## 🎮 Usage

### Creating a Room
1. Click "Create Room" on the home page
2. Share the generated room ID with collaborators

### Joining a Room
1. Enter the room ID
2. Start collaborating!

## 🔐 Security Features

- **CORS Protection**: Configured allowed origins
- **Input Validation**: Server-side validation for all inputs

## 🌐 Deployment

### Frontend (Vercel)
The frontend is configured for Vercel deployment with `vercel.json`:
```bash
cd frontend
vercel --prod
```

### Backend (Railway/Heroku)
The backend can be deployed to Railway, Heroku, or any Node.js hosting:
```bash
cd backend
# Follow your hosting provider's deployment guide
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Sunil Rathore**
- GitHub: [@thatrasunil](https://github.com/thatrasunil)

## 🙏 Acknowledgments

- Monaco Editor by Microsoft
- Socket.IO for real-time communication
- React community for excellent tools and libraries

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainer.

---

**Made with ❤️ by Sunil **
