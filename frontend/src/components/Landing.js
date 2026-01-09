import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowRight, FaCode, FaGlobe, FaComments, FaShare, FaLock, FaMicrophone } from 'react-icons/fa';
import config from '../config';

function Landing() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${config.BACKEND_URL}/api/create-room`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.roomId) {
        navigate(`/room/${data.roomId}`);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create room. Please ensure the backend server is running.');
    }
  };

  const joinRoom = () => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  const steps = [
    { num: '1', title: 'Create Room', desc: 'Start a session instantly with one click.' },
    { num: '2', title: 'Share Link', desc: 'Invite friends or colleagues via URL.' },
    { num: '3', title: 'Code Together', desc: 'Real-time sync with < 50ms latency.' }
  ];

  return (
    <div className="landing-page">
      {/* Dynamic Background Accents */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'var(--accent-primary)', opacity: 0.08, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '20%', right: '-5%', width: '400px', height: '400px', background: 'var(--accent-secondary)', opacity: 0.08, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />

      <main className="landing-main">

        {/* Hero Section */}
        <div className="hero-section">

          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: '#22d3ee', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '1.5rem', textTransform: 'uppercase',
              background: 'rgba(34, 211, 238, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(34, 211, 238, 0.2)'
            }}>
              <span style={{ width: '8px', height: '8px', background: '#22d3ee', borderRadius: '50%', boxShadow: '0 0 10px #22d3ee' }}></span>
              Real-time collaboration
            </div>

            <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', lineHeight: '1.1', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.03em', fontFamily: '"Inter", sans-serif' }}>
              <span style={{ background: 'linear-gradient(to right, #a78bfa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Code together</span>
              <br />
              <span style={{ color: '#3b82f6', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in perfect sync.</span>
            </h1>

            <p className="subtitle" style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '3rem', lineHeight: '1.7' }}>
              Spin up an interview-ready coding room, share a link, and watch every keystroke live. No setup required.
            </p>

            <div className="action-buttons">
              <motion.button
                onClick={createRoom}
                className="btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  fontSize: '1.1rem',
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <FaPlus size={14} /> Start Coding Now
              </motion.button>

              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid #475569', backdropFilter: 'blur(10px)' }}>
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.75rem 1rem', outline: 'none', width: '150px', fontSize: '1rem' }}
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                />
                <button
                  onClick={joinRoom}
                  style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = '#2563eb'}
                  onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                >
                  Join
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Code Visualizer */}
          <motion.div
            className="hero-image-container"
            initial={{ opacity: 0, x: 30, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div style={{
              background: '#0f172a',
              borderRadius: '16px',
              border: '2px solid rgba(99, 102, 241, 0.5)',
              boxShadow: '0 0 40px rgba(99, 102, 241, 0.3), 0 0 80px rgba(6, 182, 212, 0.2), 0 50px 100px -20px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden',
              transform: 'rotateY(-5deg) rotateX(2deg)',
              transition: 'all 0.3s ease',
              animation: 'glow-pulse 3s ease-in-out infinite'
            }}
              onMouseMove={(e) => {
                e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 0 60px rgba(99, 102, 241, 0.5), 0 0 100px rgba(6, 182, 212, 0.3), 0 50px 100px -20px rgba(0, 0, 0, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotateY(-5deg) rotateX(2deg)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(99, 102, 241, 0.3), 0 0 80px rgba(6, 182, 212, 0.2), 0 50px 100px -20px rgba(0, 0, 0, 0.7)';
              }}
            >
              {/* Window Bar */}
              <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
                </div>
                <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>main.js</div>
              </div>

              {/* Code Content */}
              <div style={{ padding: '2rem', fontFamily: '"Fira Code", monospace', fontSize: '14px', lineHeight: '1.6', color: '#e2e8f0', background: 'rgba(11, 17, 32, 0.95)' }}>
                <div style={{ color: '#64748b' }}>// Two Sum Problem</div>
                <div><span style={{ color: '#c678dd' }}>function</span> <span style={{ color: '#61afef' }}>twoSum</span>(nums, target) {'{'}</div>
                <div style={{ paddingLeft: '1.5rem' }}><span style={{ color: '#c678dd' }}>const</span> map = <span style={{ color: '#c678dd' }}>new</span> <span style={{ color: '#e5c07b' }}>Map</span>();</div>
                <div style={{ paddingLeft: '1.5rem' }}><span style={{ color: '#c678dd' }}>for</span> (<span style={{ color: '#c678dd' }}>let</span> i = <span style={{ color: '#d19a66' }}>0</span>; i &lt; nums.length; i++) {'{'}</div>
                <div style={{ paddingLeft: '3rem' }}><span style={{ color: '#c678dd' }}>const</span> diff = target - nums[i];</div>
                <div style={{ paddingLeft: '3rem' }}><span style={{ color: '#c678dd' }}>if</span> (map.<span style={{ color: '#61afef' }}>has</span>(diff)) <span style={{ color: '#c678dd' }}>return</span> [map.<span style={{ color: '#61afef' }}>get</span>(diff), i];</div>
                <div style={{ paddingLeft: '3rem' }}>map.<span style={{ color: '#61afef' }}>set</span>(nums[i], i);</div>
                <div style={{ paddingLeft: '1.5rem' }}>{'}'}</div>
                <div style={{ paddingLeft: '1.5rem' }}><span style={{ color: '#c678dd' }}>return</span> [];</div>
                <div>{'}'}</div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: 'absolute', bottom: '-20px', right: '0px', background: 'rgba(30, 41, 59, 0.8)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 10px #4ade80' }}></div>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Live Connection</span>
            </motion.div>
          </motion.div>

        </div>

        {/* How It Works */}
        <div className="how-it-works" style={{ width: '100%', maxWidth: '1200px', marginBottom: '8rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Get started in seconds. No account needed.</p>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="step-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                style={{
                  padding: '2.5rem',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{
                  position: 'absolute', top: '0', right: '0',
                  fontSize: '8rem', fontWeight: '900', color: 'rgba(255,255,255,0.02)',
                  lineHeight: '0.8', pointerEvents: 'none'
                }}>{step.num}</div>

                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: `linear-gradient(135deg, ${i === 0 ? '#8b5cf6' : i === 1 ? '#06b6d4' : '#ec4899'}, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                  fontSize: '1.5rem', color: 'white', opacity: 0.9
                }}>
                  {i === 0 ? <FaPlus /> : i === 1 ? <FaShare /> : <FaCode />}
                </div>

                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>




        {/* Features Section */}
        <div className="features-section" style={{ width: '100%', maxWidth: '1200px', marginBottom: '8rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Everything you need</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Powerful tools for interviews, education, and pair programming.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { title: "AI Assistant", icon: <FaMicrophone />, color: "#8b5cf6", desc: "Get real-time code explanations, debugging help, and suggestions from Gemini AI." },
              { title: "Mock Interviews", icon: <FaComments />, color: "#ec4899", desc: "Dedicated roles for interviewers and candidates with private notes and question banks." },
              { title: "Live Quizzes", icon: <FaArrowRight />, color: "#eab308", desc: "Test your knowledge with interactive coding quizzes and compete on global leaderboards." },
              { title: "Private Rooms", icon: <FaLock />, color: "#ef4444", desc: "Secure your sessions with password protection for sensitive code reviews or interviews." },
              { title: "Multi-Language", icon: <FaGlobe />, color: "#06b6d4", desc: "Support for JavaScript, Python, Java, C++, and more with intelligent syntax highlighting." },
              { title: "Video Chat", icon: <FaMicrophone />, color: "#22c55e", desc: "Built-in video and voice chat integration via Google Meet for seamless communication." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, background: 'rgba(30, 41, 59, 0.6)' }}
                viewport={{ once: true }}
                style={{
                  padding: '2rem',
                  borderRadius: '20px',
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `rgba(${parseInt(feature.color.slice(1, 3), 16)}, ${parseInt(feature.color.slice(3, 5), 16)}, ${parseInt(feature.color.slice(5, 7), 16)}, 0.2)`,
                  color: feature.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ width: '100%', maxWidth: '800px', marginBottom: '6rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem', fontWeight: '800' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { q: "Is CodeConnect free?", a: "Yes, our Hobby plan is completely free for personal use and quick coding sessions." },
              { q: "Do I need to create an account?", a: "No! You can create and join rooms instantly as a guest. Accounts are only needed for saving history." },
              { q: "Is my code secure?", a: "Rooms are ephemeral and memory-only. Once the room ends, code is wiped from our servers." }
            ].map((faq, i) => (
              <details key={i} style={{
                background: 'rgba(30, 41, 59, 0.4)', padding: '1.5rem', borderRadius: '12px',
                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s'
              }}>
                <summary style={{ fontWeight: '600', fontSize: '1.1rem', outline: 'none', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <FaArrowRight size={14} style={{ opacity: 0.5, transform: 'rotate(90deg)' }} />
                </summary>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

      </main>

      <footer className="landing-footer" style={{ borderTop: '1px solid #334155', padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#0b1120', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>CodeConnect</span>
        </div>
        <p style={{ marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>Built for developers, by developers. Simplifying real-time collaboration one line at a time.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontWeight: '500' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Twitter</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>GitHub</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Status</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy</a>
        </div>
        <div style={{ marginTop: '3rem', fontSize: '0.8rem', opacity: 0.5 }}>
          © 2026 CodeConnect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Landing;
