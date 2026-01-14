import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ message = "Initializing Quantum Uplink...", size = "large" }) => {
    // Size variants
    const containerSize = size === "small" ? 40 : size === "medium" ? 80 : 120;
    const fontSize = size === "small" ? "0.8rem" : "1.1rem";

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: size === "fullscreen" ? '100vh' : 'auto',
            width: size === "fullscreen" ? '100vw' : 'auto',
            background: size === "fullscreen" ? '#0f172a' : 'transparent',
            color: 'white',
            gap: '24px'
        }}>
            <div style={{ position: 'relative', width: containerSize, height: containerSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px solid transparent',
                        borderTopColor: '#8b5cf6', // Violet
                        borderRightColor: 'rgba(139, 92, 246, 0.2)',
                        boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                    }}
                />

                {/* Middle Ring */}
                <motion.div
                    animate={{ rotate: -180 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        width: '70%',
                        height: '70%',
                        borderRadius: '50%',
                        border: '2px solid transparent',
                        borderBottomColor: '#06b6d4', // Cyan
                        borderLeftColor: 'rgba(6, 182, 212, 0.2)',
                        boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)'
                    }}
                />

                {/* Inner Core Pulse */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        width: '30%',
                        height: '30%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #f8fafc 0%, #6366f1 100%)',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)'
                    }}
                />
            </div>

            {message && (
                <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        fontSize: fontSize,
                        color: '#94a3b8',
                        letterSpacing: '1px',
                        margin: 0
                    }}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
};

export default Loading;
