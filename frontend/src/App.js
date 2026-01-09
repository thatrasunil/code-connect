import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import Loading from './components/Loading';
import './App.css';

// Lazy loading components for performance optimization
const Landing = lazy(() => import('./components/Landing'));
const Editor = lazy(() => import('./components/Editor'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));

function App() {
  // Suppress benign Monaco Editor errors
  useEffect(() => {
    const handleRejection = (event) => {
      if (event.reason && (event.reason.type === 'cancelation' || event.reason.msg === 'operation is manually canceled')) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <ErrorBoundary>
          <ToastProvider>
            <Router>
              <Navbar />
              <AIAssistant />
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/room/:roomId" element={<Editor />} />
                </Routes>
              </Suspense>
            </Router>
          </ToastProvider>
        </ErrorBoundary>
      </AuthProvider>
    </div>
  );
}

export default App;
