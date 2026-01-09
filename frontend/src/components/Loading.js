import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ message = "Loading..." }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            background: '#0f172a',
            color: 'white'
        }}>
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "20%"],
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeat: Infinity
                }}
                style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    marginBottom: '20px'
                }}
            />
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', color: '#94a3b8' }}
            >
                {message}
            </motion.p>
        </div>
    );
};

export default Loading;
