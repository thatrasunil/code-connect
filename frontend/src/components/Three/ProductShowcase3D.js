import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html, Float, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

export default function ProductShowcase3D() {
    return (
        <group>
            <PresentationControls
                global={false} // Spin globally or only when dragging the model
                cursor={true} // Whether to toggle cursor style on drag
                snap={true} // Snap-back to center (can also be a spring config)
                speed={1} // Speed factor
                zoom={1} // Zoom factor when dragging
                rotation={[0, 0, 0]} // Default rotation
                polar={[-Math.PI / 6, Math.PI / 6]} // Vertical limits
                azimuth={[-Math.PI / 6, Math.PI / 6]} // Horizontal limits
                config={{ mass: 1, tension: 170, friction: 26 }} // Spring config
            >
                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Monitor />
                </Float>
            </PresentationControls>
        </group>
    );
}

function Monitor() {
    return (
        <group>
            {/* Frame/Bezel - Slimmer, Metallic */}
            <RoundedBox args={[6.2, 3.7, 0.1]} radius={0.1} smoothness={4}>
                <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
            </RoundedBox>

            {/* Glowing Backlight */}
            <mesh position={[0, 0, -0.06]}>
                <planeGeometry args={[6.5, 4]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>

            {/* Screen Content */}
            <group position={[0, 0, 0.06]}>
                <Html transform position={[0, 0, 0]} style={{ width: '800px', height: '480px', borderRadius: '8px', overflow: 'hidden' }} className="glass-editor">
                    <div style={{
                        width: '100%', height: '100%',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column',
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
                    }}>
                        {/* Title Bar */}
                        <div style={{
                            height: '32px', background: 'rgba(30, 41, 59, 0.5)', display: 'flex', alignItems: 'center', padding: '0 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 5px rgba(239,68,68,0.5)' }}></div>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', boxShadow: '0 0 5px rgba(234,179,8,0.5)' }}></div>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.5)' }}></div>
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.5px' }}>ai_core.py — CodeConnect</span>
                        </div>

                        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                            {/* Activity Bar */}
                            <div style={{ width: '40px', background: 'rgba(15, 23, 42, 0.5)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px', gap: '20px' }}>
                                <div style={{ width: '20px', height: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
                                <div style={{ width: '20px', height: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
                                <div style={{ width: '20px', height: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
                            </div>

                            {/* Sidebar - File Explorer */}
                            <div style={{ width: '140px', background: 'rgba(15, 23, 42, 0.3)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '16px', color: '#94a3b8', fontSize: '11px' }}>
                                <div style={{ marginBottom: '12px', fontWeight: 'bold', color: '#e2e8f0', opacity: 0.7 }}>EXPLORER</div>
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', color: '#60a5fa' }}>▶ src</div>
                                <div style={{ paddingLeft: '12px', marginBottom: '6px' }}>metrics.py</div>
                                <div style={{ paddingLeft: '12px', marginBottom: '6px', color: '#fff', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>ai_core.py</div>
                                <div style={{ paddingLeft: '12px', marginBottom: '6px' }}>utils.js</div>
                                <div style={{ paddingLeft: '12px', marginBottom: '6px' }}>styles.css</div>
                            </div>

                            {/* Editor Area */}
                            <div style={{ flex: 1, padding: '20px', color: '#e2e8f0', fontSize: '12px', overflow: 'hidden', position: 'relative' }}>
                                {/* Line Numbers */}
                                <div style={{ position: 'absolute', left: '0', top: '20px', width: '40px', textAlign: 'right', color: 'rgba(255,255,255,0.15)', paddingRight: '10px', userSelect: 'none' }}>
                                    <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div>
                                </div>
                                <div style={{ paddingLeft: '40px' }}>
                                    <div style={{ marginBottom: '4px' }}><span style={{ color: '#c678dd' }}>import</span> torch</div>
                                    <div style={{ marginBottom: '4px' }}><span style={{ color: '#c678dd' }}>import</span> numpy <span style={{ color: '#c678dd' }}>as</span> np</div>
                                    <div style={{ marginBottom: '12px' }}></div>
                                    <div style={{ marginBottom: '4px' }}><span style={{ color: '#c678dd' }}>class</span> <span style={{ color: '#e5c07b' }}>NeuralEngine</span>:</div>
                                    <div style={{ marginBottom: '4px' }}>&nbsp;&nbsp;<span style={{ color: '#5c6370' }}># Initialize the core processing unit</span></div>
                                    <div style={{ marginBottom: '4px' }}>&nbsp;&nbsp;<span style={{ color: '#c678dd' }}>def</span> <span style={{ color: '#61afef' }}>__init__</span>(<span style={{ color: '#e06c75' }}>self</span>, config):</div>
                                    <div style={{ marginBottom: '4px' }}>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#e06c75' }}>self</span>.layers = config.get(<span style={{ color: '#98c379' }}>'layers'</span>, <span style={{ color: '#d19a66' }}>512</span>)</div>
                                    <div style={{ marginBottom: '4px' }}>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#e06c75' }}>self</span>.dropout = <span style={{ color: '#d19a66' }}>0.05</span></div>
                                    <div style={{ marginBottom: '12px' }}></div>
                                    <div style={{ marginBottom: '4px' }}>&nbsp;&nbsp;<span style={{ color: '#c678dd' }}>def</span> <span style={{ color: '#61afef' }}>predict</span>(<span style={{ color: '#e06c75' }}>self</span>, input_tensor):</div>
                                    <div style={{ marginBottom: '4px' }}>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#e06c75' }}>return</span> <span style={{ color: '#e06c75' }}>self</span>.model(input_tensor) * <span style={{ color: '#d19a66' }}>0.98</span></div>
                                </div>

                                {/* Cursor Animation */}
                                <div style={{ width: '2px', height: '14px', background: '#3b82f6', position: 'absolute', top: '158px', left: '260px', animation: 'blink 1s step-end infinite' }}></div>
                            </div>
                        </div>

                        {/* Terminal Panel */}
                        <div style={{ height: '100px', background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 16px', fontSize: '11px', fontFamily: 'monospace' }}>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                                <span style={{ color: '#fff', borderBottom: '1px solid #3b82f6' }}>TERMINAL</span>
                                <span style={{ color: 'rgba(255,255,255,0.3)' }}>OUTPUT</span>
                                <span style={{ color: 'rgba(255,255,255,0.3)' }}>DEBUG CONSOLE</span>
                            </div>
                            <div style={{ color: '#94a3b8' }}>
                                <div><span style={{ color: '#22c55e' }}>➜</span> <span style={{ color: '#60a5fa' }}>~</span> python train_model.py --gpu</div>
                                <div style={{ color: '#cbd5e1' }}>[INFO] Initializing Tensor Cores... <span style={{ color: '#22c55e' }}>Done (0.4s)</span></div>
                                <div style={{ color: '#cbd5e1' }}>[INFO] Loaded 14M  Label parameters.</div>
                                <div style={{ color: '#eab308' }}>[WARN] Memory optimization active.</div>
                                <div><span style={{ color: '#22c55e' }}>➜</span> <span style={{ color: '#60a5fa' }}>~</span> <span className="blink">_</span></div>
                            </div>
                        </div>
                    </div>
                    {/* CSS for blink animation */}
                    <style>{`
                        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                    `}</style>
                </Html>
            </group>
        </group>
    )
}
