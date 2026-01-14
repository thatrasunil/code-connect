import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox, Cylinder, Float } from '@react-three/drei';

export default function Laptop3D(props) {
    const group = useRef();

    // Smoother floating animation
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        group.current.rotation.y = Math.sin(t / 4) / 10;
        group.current.position.y = Math.sin(t / 1.5) / 15;
    });

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Laptop Base Body - Sleek Silver */}
            <group position={[0, -0.04, 0]}>
                <RoundedBox args={[2.4, 0.08, 1.6]} radius={0.04} smoothness={4}>
                    <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.8} envMapIntensity={1} />
                </RoundedBox>

                {/* Trackpad - Glassy look */}
                <mesh position={[0, 0.041, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.9, 0.55]} />
                    <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.5} opacity={0.5} transparent />
                </mesh>

                {/* Keyboard Well */}
                <mesh position={[0, 0.0405, -0.15]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[2.1, 0.9]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.8} />
                </mesh>
            </group>

            {/* Individual Keys */}
            <group position={[0, -0.015, -0.15]}>
                {[...Array(5)].map((_, row) => (
                    <group key={row} position={[0, 0, (row - 2) * 0.17]}>
                        {[...Array(14)].map((_, col) => (
                            <RoundedBox
                                key={col}
                                args={[0.13, 0.02, 0.13]}
                                radius={0.005}
                                position={[(col - 6.5) * 0.15, 0.06, 0]}
                            >
                                <meshStandardMaterial color="#1e293b" roughness={0.7} />
                            </RoundedBox>
                        ))}
                    </group>
                ))}
            </group>

            {/* Hinge Mechanism */}
            <group position={[0, -0.04, -0.78]}>
                <RoundedBox args={[1.8, 0.04, 0.04]} radius={0.02} smoothness={4}>
                    <meshStandardMaterial color="#334155" roughness={0.5} />
                </RoundedBox>
            </group>

            {/* Laptop Screen (Lid) */}
            <group position={[0, 0.02, -0.78]} rotation={[-0.35, 0, 0]}>
                <group position={[0, 0.75, 0]}>
                    {/* Screen Back */}
                    <RoundedBox args={[2.4, 1.5, 0.05]} radius={0.04} smoothness={4}>
                        <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.8} envMapIntensity={1} />
                    </RoundedBox>

                    {/* Screen Bezel */}
                    <mesh position={[0, 0.02, 0.026]}>
                        <planeGeometry args={[2.4, 1.5]} />
                        <meshStandardMaterial color="#000" roughness={0.1} metalness={0.9} />
                    </mesh>

                    {/* Camera Notch */}
                    <mesh position={[0, 0.75, 0.027]}>
                        <planeGeometry args={[0.2, 0.05]} />
                        <meshBasicMaterial color="#000" />
                    </mesh>

                    {/* Screen Display */}
                    <mesh position={[0, 0.05, 0.027]}>
                        <planeGeometry args={[2.3, 1.25]} />
                        <meshStandardMaterial color="#000" emissive="#080808" roughness={0.2} metalness={0.5} />
                    </mesh>

                    {/* Logo */}
                    <mesh position={[0, 0.1, -0.026]} rotation={[0, Math.PI, 0]}>
                        <circleGeometry args={[0.12, 32]} />
                        <meshStandardMaterial color="#fff" roughness={0.2} metalness={1} emissive="#fff" emissiveIntensity={0.5} />
                    </mesh>
                </group>

                {/* Floating Abstract Shapes Popping Out */}
                <group position={[0, 0.5, 0.5]} scale={0.4} rotation={[0.2, 0, 0]}>
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <RoundedBox args={[1, 1, 0.2]} position={[-1.2, 0.5, 0.2]} rotation={[0, 0.5, 0.2]} radius={0.1}>
                            <meshStandardMaterial color="#a78bfa" roughness={0.1} metalness={0.2} />
                        </RoundedBox>
                        <RoundedBox args={[0.5, 0.5, 2]} position={[1.5, -0.2, 0]} rotation={[0.5, 0, -0.2]} radius={0.1}>
                            <meshStandardMaterial color="#f472b6" roughness={0.1} />
                        </RoundedBox>
                        <Cylinder args={[0.2, 0.2, 2, 32]} position={[-0.5, -1, 0.5]} rotation={[0, 0, 1.2]}>
                            <meshStandardMaterial color="#818cf8" roughness={0.2} />
                        </Cylinder>
                    </Float>
                </group>

                {/* VS Code Interface - now floating slightly inside constraints */}
                <Html transform position={[0, 0.78, 0.03]} rotation={[0, 0, 0]} scale={0.18} occlude>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(10px)',
                        color: '#e2e8f0',
                        borderRadius: '0 0 8px 8px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '11px',
                        width: '370px',
                        height: '240px',
                        overflow: 'hidden',
                        userSelect: 'none',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {/* Title Bar */}
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                            </div>
                            <div style={{ marginLeft: 'auto', marginRight: 'auto', opacity: 0.6, fontSize: '10px', fontWeight: 500 }}>ai_core.py</div>
                        </div>

                        <div style={{ display: 'flex', height: '100%' }}>
                            <div style={{ width: '40px', background: 'rgba(15, 23, 42, 0.4)', borderRight: '1px solid rgba(255,255,255,0.05)' }}></div>
                            <div style={{ width: '30px', background: 'transparent', color: '#64748b', textAlign: 'right', paddingRight: '10px', paddingTop: '10px', fontSize: '10px', lineHeight: '1.6' }}>
                                1<br />2<br />3<br />4<br />5<br />6<br />7<br />8
                            </div>
                            <div style={{ padding: '10px', lineHeight: '1.6', flex: 1 }}>
                                <div><span style={{ color: '#c678dd' }}>class</span> <span style={{ color: '#e5c07b' }}>NeuralEngine</span>:</div>
                                <div>&nbsp;&nbsp;<span style={{ color: '#c678dd' }}>def</span> <span style={{ color: '#61afef' }}>__init__</span>(<span style={{ color: '#e06c75' }}>self</span>):</div>
                                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#e06c75' }}>self</span>.layers = <span style={{ color: '#d19a66' }}>512</span></div>
                                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#e06c75' }}>self</span>.mode = <span style={{ color: '#98c379' }}>"autonomous"</span></div>
                                <div style={{ height: '8px' }}></div>
                                <div>&nbsp;&nbsp;<span style={{ color: '#c678dd' }}>def</span> <span style={{ color: '#61afef' }}>optimize</span>(<span style={{ color: '#e06c75' }}>self</span>):</div>
                                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#c678dd' }}>return</span> <span style={{ color: '#e06c75' }}>self</span>.compute()</div>
                            </div>
                        </div>
                    </div>
                </Html>
            </group>

            {/* Random Floating Decor Elements around the laptop base */}
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <RoundedBox args={[0.8, 0.8, 0.1]} radius={0.05} position={[-2, 0.5, 0]} rotation={[0.4, 0.2, 0]}>
                    <meshStandardMaterial color="#f8fafc" roughness={0.3} />
                </RoundedBox>
                <RoundedBox args={[0.3, 0.3, 0.3]} radius={0.05} position={[2.2, 0, 1]} rotation={[0.5, 0.5, 0]}>
                    <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.5} />
                </RoundedBox>
                <Torus args={[0.5, 0.05, 16, 32]} position={[1.8, 0.8, -0.5]} rotation={[0.5, 0, 0.2]}>
                    <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.5} />
                </Torus>
                <RoundedBox args={[1.2, 0.1, 1.2]} radius={0.05} position={[0, -0.5, 0]} rotation={[0, 0.1, 0]}>
                    <meshStandardMaterial color="#334155" roughness={0.1} />
                </RoundedBox>
            </Float>
        </group>
    );
}

// Helper to avoid import issues if Torus is missing in drei, but we will assume we fixed imports or use mesh
function Torus({ args, children, ...props }) {
    return (
        <mesh {...props}>
            <torusGeometry args={args} />
            {children}
        </mesh>
    )
}

