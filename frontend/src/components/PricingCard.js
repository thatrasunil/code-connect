import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

const PricingCard = ({ title, price, features, recommmended = false, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -10 }}
            className={`glass-card pricing-card ${recommmended ? 'recommended' : ''}`}
            style={{
                padding: '2rem',
                borderRadius: '16px',
                border: recommmended ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: recommmended ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}
        >
            {recommmended && (
                <span style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                }}>
                    MOST POPULAR
                </span>
            )}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {price} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                        <FaCheck color="var(--accent-secondary)" /> {feature}
                    </li>
                ))}
            </ul>
            <button className={`btn ${recommmended ? 'primary-btn' : ''}`} style={{ marginTop: '2rem', width: '100%', padding: '0.8rem', border: recommmended ? 'none' : '1px solid var(--border-color)', background: recommmended ? 'var(--accent-primary)' : 'transparent', color: recommmended ? 'white' : 'var(--text-primary)' }}>
                Choose Plan
            </button>
        </motion.div>
    );
};

export default PricingCard;
