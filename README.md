# CodeConnect 🚀

A **Real-Time Collaborative Coding Interview Platform** with integrated AI assistance, chat, video conferencing, and problem libraries. Built with React, Django, and modern web technologies.

![CodeConnect](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Python](https://img.shields.io/badge/python-3.11-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Collaborative Editing**: Multiple users can edit code simultaneously with Monaco Editor
- **Multi-language Support**: Syntax highlighting for JavaScript, Python, Java, C++, and more
- **Room Management**: Unique room IDs for easy collaboration
- **Session Persistence**: Auto-save functionality with localStorage backup (every 5 seconds)
- **Code Execution**: Run JavaScript code directly in the browser

### 🤖 AI-Powered Features
- **AI Code Explanation**: Get instant explanations of code snippets using Gemini AI
- **AI Chat Assistant**: Integrated chatbot for coding help and guidance
- **Context-Aware Responses**: AI understands your current code context

### 💬 Communication & Collaboration
- **Real-time Chat**: Text messaging with file sharing and voice notes
- **Typing Indicators**: See when collaborators are actively typing
- **Video Conferencing**: Integrated Google Meet support
- **Problem Library**: LeetCode-style interview questions with timer

### 🎨 User Experience
- **Modern UI**: Clean, glassmorphic design with smooth animations (Framer Motion)
- **Error Handling**: Global error boundaries with user-friendly toast notifications
- **Performance Optimized**: Code splitting, lazy loading, and React.memo optimizations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Eye-friendly dark mode for extended coding sessions

### 🔐 Security & Reliability
- **Protected Routes**: Authentication-based access control
- **Error Boundaries**: Graceful error handling prevents app crashes
- **Toast Notifications**: Non-intrusive user feedback system
- **CORS Protection**: Configured allowed origins

## 🏗️ Architecture

```
codeconnect/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components (Editor, Chat, AI, etc.)
│   │   ├── contexts/        # React contexts (Auth, Toast)
│   │   ├── pages/           # Main pages (Dashboard, Login, etc.)
│   │   └── App.js           # Root component with ErrorBoundary
│   └── package.json
│
├── backend_django/          # Django REST API
│   ├── core/                # Main app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API endpoints
│   │   ├── views_ai.py      # AI integration
│   │   └── urls.py          # URL routing
│   ├── codeconnect_backend/ # Project settings
│   └── manage.py
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Python** 3.11 or higher
- **Node.js** 18.x or higher
- **npm** or yarn
- **Google Gemini API Key** (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thatrasunil/codeconnect.git
   cd codeconnect
   ```

2. **Backend Setup (Django)**
   ```bash
   cd backend_django
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create .env file
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   
   # Run migrations
   python manage.py migrate
   
   # Start Django server
   python manage.py runserver 8001
   ```

3. **Frontend Setup (React)**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001

## 🔧 Configuration

### Environment Variables

**Backend (.env in backend_django/)**
```env
GEMINI_API_KEY=your_gemini_api_key_here
DEBUG=True
SECRET_KEY=your_django_secret_key
```

**Frontend (config.js)**
```javascript
const config = {
    BACKEND_URL: 'http://localhost:8001',
    SOCKET_URL: 'http://localhost:8001',
};
```

### Development Scripts

**Frontend**
- `npm start` - Start development server (port 3000)
- `npm run build` - Build production bundle
- `npm test` - Run tests

**Backend**
- `python manage.py runserver 8001` - Start Django server
- `python manage.py migrate` - Run database migrations
- `python manage.py createsuperuser` - Create admin user

## 📚 Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **React Router** 6.x - Navigation
- **Monaco Editor** 4.7.0 - Code editor (VS Code engine)
- **Framer Motion** 12.x - Smooth animations
- **React Icons** 5.x - Icon library

### Backend
- **Django** 5.x - Web framework
- **Django REST Framework** - API development
- **Django CORS Headers** - CORS handling
- **Google Generative AI** - Gemini AI integration

### Performance Optimizations
- **Code Splitting**: Route-based lazy loading with React.lazy
- **React.memo**: Optimized re-renders for Chat, Interview, and Output panels
- **Auto-save**: Debounced localStorage backup every 5 seconds
- **Lazy Loading**: Asynchronous problem library loading

## 🎮 Usage

### Creating a Room
1. Navigate to the home page
2. Click "Create Room" or "Join Room"
3. Share the room URL with collaborators

### Using AI Features
1. Click the "AI ON" toggle in the chat panel
2. Ask questions or request code explanations
3. Use the "Explain" button to analyze selected code

### Interview Mode
1. Open the Interview Panel (left sidebar)
2. Browse and select coding problems
3. Use the built-in timer to track progress
4. Post questions directly to the editor

## 🌐 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the build/ folder to your hosting service
```

### Backend (Railway/Heroku/PythonAnywhere)
```bash
cd backend_django
# Set environment variables on your hosting platform
# Configure ALLOWED_HOSTS in settings.py
# Run: python manage.py collectstatic
```

## 🆕 Recent Updates (v2.0.0)

### Phase 1.1: Critical Fixes ✅
- ✅ Global error boundaries with fallback UI
- ✅ Toast notification system (replaced alerts)
- ✅ Session persistence with auto-save
- ✅ localStorage backup for code

### Phase 1.2: Performance Optimization ✅
- ✅ Code splitting with React.lazy and Suspense
- ✅ Lazy loading for problem library
- ✅ React.memo for optimized re-renders
- ✅ Loading states and skeleton screens

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Sunil**
- GitHub: [@thatrasunil](https://github.com/thatrasunil)

## 🙏 Acknowledgments

- Monaco Editor by Microsoft
- Google Gemini AI for intelligent code assistance
- React community for excellent tools and libraries
- Framer Motion for beautiful animations

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Made with ❤️ by Sunil**
