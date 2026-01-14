# CodeConnect Frontend 🎨

A powerful **Real-Time Collaborative Coding Interview Platform** built with React. Features robust code editing, integrated AI assistance, video/text chat, and a seamless interview environment.

![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![Firebase](https://img.shields.io/badge/firebase-11.0.2-FFCA28.svg)
![Monaco](https://img.shields.io/badge/monaco-4.7.0-blue.svg)

## 🌟 Key Features

### 💻 Collaborative Workspace
*   **Real-time Editing**: Sync code instantly across all users using Socket.IO.
*   **Monaco Editor**: Full-featured VS Code-like experience with syntax highlighting and auto-completion.
*   **Multi-language Support**: Code in JavaScript, Python, Java, C++, and more.
*   **Session Persistence**: Auto-save locally and sync with Firestore.

### 🤖 AI-Powered Experience
*   **AI Chat Assistant**: Integrated Google Gemini chatbot for coding help and architecture advice.
*   **Code Verification**: Instant AI feedback on code correctness and optimization.
*   **Smart Suggestions**: Context-aware help based on your current editor content.

### 🤝 Communication Tools
*   **Integrated Chat**: Real-time text messaging with user avatars and typing indicators.
*   **Video Conferencing**: Built-in Google Meet integration for face-to-face interviews.
*   **Private Rooms**: Create password-protected rooms for secure interviews.

### 🏆 Gamification & Practice
*   **Problem Library**: Access a curated list of coding interview questions.
*   **Code Execution**: Run and test JavaScript code directly in the browser.
*   **Leaderboard**: Track solved problems and user rankings.

---

## 🛠 Tech Stack

**Core Framework**
*   **React 18**: Function components and Hooks.
*   **React Router 7**: Client-side routing.
*   **Framer Motion**: Smooth UI transitions and animations.

**Data & State**
*   **Firebase**: Authentication, Firestore Database (Chat/Rooms).
*   **Socket.IO Client**: Real-time bidirectional event-based communication.

**Editor & UI**
*   **Monaco Editor React**: The core code editor component.
*   **React Icons**: Comprehensive icon set.
*   **Tailwind/CSS Modules**: Custom styling system.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   Running Backend Services (Django + Node.js)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/thatrasunil/codeconnect.git
    cd codeconnect/frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the `frontend/` directory with your keys:

    ```env
    # Backend Services
    REACT_APP_BACKEND_URL=http://localhost:3001
    REACT_APP_SOCKET_URL=http://localhost:3001

    # Firebase Configuration
    REACT_APP_FIREBASE_API_KEY=your_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    REACT_APP_FIREBASE_PROJECT_ID=your_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    REACT_APP_FIREBASE_APP_ID=your_app_id
    REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Start Development Server**
    ```bash
    npm start
    ```
    The app will run at [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── AIAssistant.js       # AI Chat & Helper
│   ├── ChatPanel.js         # Real-time text chat
│   ├── Editor.js            # Main collaborative editor
│   ├── Leaderboard.js       # User rankings
│   ├── ProblemPanel.js      # Coding question library
│   ├── Landing.js           # Home page
│   └── ...
├── pages/
│   └── Dashboard.js
├── App.js                   # Main routing & layout
└── firebase.js              # Firebase init
```

## 🧪 Available Scripts

*   `npm start`: Runs the app in development mode.
*   `npm test`: Launches the test runner.
*   `npm run build`: Builds the app for production.
*   `npm run lint`: Runs ESLint to fix code style issues.

## 🤝 Contributing

1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

---

**Built with ❤️ by [Sunil](https://github.com/thatrasunil)**
