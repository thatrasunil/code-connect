import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Text, Float, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

export default function Stats3D() {
    return (
        <group rotation={[0.5, -0.5, 0]}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                <HexNodeGroup />
            </Float>
        </group>
    );
}

function HexNodeGroup() {
    // Hexagonal positions
    const positions = useMemo(() => {
        const pos = [];
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                if (Math.abs(x) + Math.abs(y) <= 3) {
                    // Hex spacing
                    const xPos = x * 1.0;
                    const zPos = y * 0.9 + (x % 2) * 0.45;
                    pos.push([xPos, 0, zPos]);
                }
            }
        }
        return pos;
    }, []);

    return (
        <group>
            {/* Central "Data" Light */}
            <pointLight position={[0, 5, 0]} intensity={2} color="#8b5cf6" distance={10} />

            {positions.map((pos, i) => (
                <HexColumn key={i} position={pos} index={i} total={positions.length} />
            ))}

            {/* Floating Labels */}
            <StatLabel text="10k+ Devs" position={[-2, 3, -1]} color="#3b82f6" delay={0} />
            <StatLabel text="1M+ Lines" position={[1.5, 4, 1.5]} color="#ec4899" delay={1} />
            <StatLabel text="99.9% Uptime" position={[0, 4.5, -2]} color="#22c55e" delay={2} />
        </group>
    );
}

function HexColumn({ position, index, total }) {
    const ref = useRef();
    const height = useMemo(() => Math.random() * 2 + 1, []);
    const color = useMemo(() => {
        const colors = ['#1e293b', '#334155', '#475569', '#3b82f6', '#8b5cf6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Wave animation
        const offset = position[0] + position[2];
        ref.current.scale.y = 1 + Math.sin(t * 2 + offset) * 0.2;
        ref.current.position.y = (height * ref.current.scale.y) / 2;
    });

    return (
        <group position={[position[0], 0, position[2]]}>
            <mesh ref={ref}>
                <cylinderGeometry args={[0.4, 0.4, height, 6]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.8}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </group>
    )
}

function StatLabel({ text, position, color, delay }) {
    return (
        <Float speed={3} rotationIntensity={0.1} floatIntensity={0.5}>
            <group position={position}>
                <mesh>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshBasicMaterial color={color} />
                </mesh>
                <Text
                    position={[0, 0.4, 0]}
                    fontSize={0.4}
                    color={color}
                    anchorX="center"
                    anchorY="bottom"
                >
                    {text}
                </Text>
                {/* Connecting Line */}
                <mesh position={[0, -2, 0]} scale={[0.02, 4, 0.02]}>
                    <boxGeometry />
                    <meshBasicMaterial color={color} transparent opacity={0.2} />
                </mesh>
            </group>
        </Float>
    )
}
