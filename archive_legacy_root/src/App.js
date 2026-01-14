import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Editor from './components/Editor';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/room/:roomId" element={<Editor />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
