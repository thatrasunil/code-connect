import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        background: '#1e293b', padding: '20px', borderRadius: '12px',
                        width: '400px', maxWidth: '90%', border: '1px solid #334155', color: 'white'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Editor Settings</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}><FaTimes /></button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Font Size */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Font Size</label>
                            <input
                                type="number"
                                min="10" max="32"
                                value={settings.fontSize}
                                onChange={(e) => onSettingsChange({ ...settings, fontSize: parseInt(e.target.value) })}
                                style={{ background: '#0f172a', border: '1px solid #475569', color: 'white', padding: '5px', borderRadius: '5px', width: '60px' }}
                            />
                        </div>

                        {/* Word Wrap */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Word Wrap</label>
                            <select
                                value={settings.wordWrap}
                                onChange={(e) => onSettingsChange({ ...settings, wordWrap: e.target.value })}
                                style={{ background: '#0f172a', border: '1px solid #475569', color: 'white', padding: '5px', borderRadius: '5px' }}
                            >
                                <option value="off">Off</option>
                                <option value="on">On</option>
                                <option value="wordWrapColumn">Wrap at Column</option>
                            </select>
                        </div>

                        {/* Line Numbers */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Line Numbers</label>
                            <select
                                value={settings.lineNumbers}
                                onChange={(e) => onSettingsChange({ ...settings, lineNumbers: e.target.value })}
                                style={{ background: '#0f172a', border: '1px solid #475569', color: 'white', padding: '5px', borderRadius: '5px' }}
                            >
                                <option value="on">On</option>
                                <option value="off">Off</option>
                                <option value="relative">Relative</option>
                            </select>
                        </div>

                        {/* Tab Size */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Tab Size</label>
                            <select
                                value={settings.tabSize}
                                onChange={(e) => onSettingsChange({ ...settings, tabSize: parseInt(e.target.value) })}
                                style={{ background: '#0f172a', border: '1px solid #475569', color: 'white', padding: '5px', borderRadius: '5px' }}
                            >
                                <option value="2">2 Spaces</option>
                                <option value="4">4 Spaces</option>
                                <option value="8">8 Spaces</option>
                            </select>
                        </div>
                        {/* Minimap */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Minimap</label>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.minimap !== false}
                                    onChange={(e) => onSettingsChange({ ...settings, minimap: e.target.checked })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        {/* Bracket Pair Colorization */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Bracket Colorization</label>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.bracketPairColorization !== false}
                                    onChange={(e) => onSettingsChange({ ...settings, bracketPairColorization: e.target.checked })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        {/* Font Family */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Font Family</label>
                            <select
                                value={settings.fontFamily}
                                onChange={(e) => onSettingsChange({ ...settings, fontFamily: e.target.value })}
                                style={{ background: '#0f172a', border: '1px solid #475569', color: 'white', padding: '5px', borderRadius: '5px', maxWidth: '150px' }}
                            >
                                <option value="'Fira Code', 'JetBrains Mono', Consolas, monospace">Fira Code</option>
                                <option value="'Courier New', Courier, monospace">Courier New</option>
                                <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button onClick={onClose} className="btn primary-btn" style={{ padding: '8px 16px', borderRadius: '6px' }}>Done</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SettingsModal;
