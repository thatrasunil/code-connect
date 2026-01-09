import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const toastVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <FaCheckCircle className="toast-icon success" />;
            case 'error': return <FaExclamationCircle className="toast-icon error" />;
            default: return <FaInfoCircle className="toast-icon info" />;
        }
    };

    return (
        <motion.div
            className={`toast-notification ${type}`}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
        >
            {getIcon()}
            <span className="toast-message">{message}</span>
            <button onClick={onClose} className="toast-close">×</button>
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container-wrapper">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
