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
const Problems = lazy(() => import('./pages/Problems'));
const Profile = lazy(() => import('./pages/Profile'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const QuizPlayer = lazy(() => import('./pages/QuizPlayer'));

function App() {


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
                  <Route path="/problems" element={
                    <ProtectedRoute>
                      <Problems />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/quizzes" element={
                    <ProtectedRoute>
                      <Quizzes />
                    </ProtectedRoute>
                  } />
                  <Route path="/quizzes/:id" element={
                    <ProtectedRoute>
                      <QuizPlayer />
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
