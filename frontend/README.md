# CodeConnect Frontend 🎨

React-based frontend for CodeConnect - a real-time collaborative code editor with integrated chat.

## 🎯 Features

- **Monaco Editor Integration**: VS Code-like editing experience
- **Real-time Collaboration**: Live code updates with Socket.IO
- **Modern UI/UX**: Clean, responsive design with Framer Motion animations
- **Instant Access**: No signup required - just create or join a room
- **Chat System**: Integrated messaging with typing indicators

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Landing.js           # Landing page
│   │   └── Editor.js            # Collaboration room
│   ├── App.js                   # Main app component
│   ├── App.css                  # Global styles
│   └── index.js                 # Entry point
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 11.x or higher
- Backend server running

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure backend URL (optional)**
   Update the API endpoint in your code to point to your backend server:
   ```javascript
   // Default: http://localhost:3001
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

### `npm start`
Runs the app in development mode on port 3000.
- Hot reload enabled
- Opens browser automatically
- Shows lint errors in console

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
- Optimized and minified
- Includes hashes in filenames
- Ready for deployment

### `npm run lint`
Runs ESLint on all source files and auto-fixes issues.

### `npm run eject`
**Note: This is a one-way operation!**

Ejects from Create React App to gain full control over configuration.

## 🎨 Key Dependencies

### Core
- **react** (18.2.0) - UI library
- **react-dom** (18.2.0) - React DOM renderer
- **react-router-dom** (7.9.2) - Routing
- **react-scripts** (5.0.1) - Build tooling

### Features
- **@monaco-editor/react** (4.7.0) - Code editor component
- **socket.io-client** (4.8.1) - Real-time communication
- **framer-motion** (12.23.22) - Animation library

### Testing
- **@testing-library/react** (16.3.0) - React testing utilities
- **@testing-library/jest-dom** (6.8.0) - Custom matchers
- **@testing-library/user-event** (13.5.0) - User interaction simulation

### Development
- **react-icons** (5.5.0) - Icon library

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory (optional):

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SOCKET_URL=http://localhost:3001
PORT=3000
```

### Vercel Deployment
The project includes `vercel.json` for easy deployment:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## 🎮 Usage

### Creating a Room
1. Click "Create Room" on home page
2. Share room ID with collaborators

### Joining a Room
1. Enter room ID
2. Start coding together!

### Code Editor Features
- Syntax highlighting for multiple languages
- Auto-completion
- Real-time cursor tracking
- Live code synchronization

## 🎨 Styling

The app uses custom CSS with:
- CSS variables for theming
- Responsive design
- Dark mode support
- Smooth animations with Framer Motion

## 🧪 Testing

Run tests with:
```bash
npm test
```

Test files follow the pattern:
- `*.test.js` - Component tests
- `*.spec.js` - Integration tests

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Build for Production
```bash
npm run build
```

The `build` folder contains optimized production files ready for deployment to any static hosting service.

### Deployment Checklist
- [ ] Update API URLs to production backend
- [ ] Configure CORS on backend for frontend domain
- [ ] Set environment variables
- [ ] Verify Socket.IO connection

## 🔍 Browser Support

### Production
- \>0.2% market share
- Not dead browsers
- Not Opera Mini

### Development
- Latest Chrome
- Latest Firefox
- Latest Safari

## 📚 Learn More

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Framer Motion](https://www.framer.com/motion/)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Build Fails to Minify
See [troubleshooting guide](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

### Socket Connection Issues
- Verify backend is running
- Check CORS configuration
- Ensure Socket.IO versions match

## 📝 License

ISC

## 👨‍💻 Author

**Sunil Rathore**
- GitHub: [@thatrasunil](https://github.com/thatrasunil)

---

**Built with Create React App**
