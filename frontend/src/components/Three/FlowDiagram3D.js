import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Float, Text, Line, Trail } from '@react-three/drei';
import * as THREE from 'three';

function StepPlatform({ position, color, label, icon: Icon, delay = 0 }) {
    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
                {/* Platform Base */}
                <RoundedBox args={[2.5, 0.2, 2.5]} radius={0.1} smoothness={4}>
                    <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
                </RoundedBox>

                {/* Glowing Ring */}
                <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1, 1.05, 32]} />
                    <meshBasicMaterial color={color} transparent opacity={0.6} />
                </mesh>

                {/* Icon Placeholder */}
                <group position={[0, 1, 0]}>
                    <Icon color={color} />
                </group>

                {/* Label */}
                <Text
                    position={[0, -0.6, 1.4]}
                    fontSize={0.25}
                    color="#94a3b8"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            </Float>
        </group>
    );
}

function PlusIcon({ color }) {
    const ref = useRef();
    useFrame((state) => (ref.current.rotation.y += 0.01));
    return (
        <group ref={ref}>
            <RoundedBox args={[0.2, 1, 0.2]} radius={0.05}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></RoundedBox>
            <RoundedBox args={[1, 0.2, 0.2]} radius={0.05}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></RoundedBox>
        </group>
    )
}

function ShareIcon({ color }) {
    const ref = useRef();
    useFrame((state) => (ref.current.rotation.y -= 0.01));
    return (
        <group ref={ref}>
            <mesh position={[-0.3, 0, 0]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0.3, 0, 0]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.1, 1.2, 0.1]}>
                <cylinderGeometry />
                <meshStandardMaterial color="#fff" transparent opacity={0.5} />
            </mesh>
        </group>
    )
}

function CodeIcon({ color }) {
    const ref = useRef();
    useFrame((state) => (ref.current.rotation.y += 0.01));
    return (
        <group ref={ref}>
            <Text fontSize={0.8} color={color}>
                {"< />"}
            </Text>
        </group>
    )
}


export default function FlowDiagram3D() {
    // Curves for connections
    const curve1 = useMemo(() => new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.5, 0, 0),
        new THREE.Vector3(-2, 1, 0),
        new THREE.Vector3(0, 0, 0)
    ]), []);

    const curve2 = useMemo(() => new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(2, 1, 0),
        new THREE.Vector3(3.5, 0, 0)
    ]), []);

    return (
        <group scale={0.8}>
            <StepPlatform position={[-3.5, 0, 0]} color="#8b5cf6" label="1. Create Room" icon={PlusIcon} />

            {/* Connection 1 */}
            <mesh>
                <tubeGeometry args={[curve1, 64, 0.05, 8, false]} />
                <meshStandardMaterial color="#475569" transparent opacity={0.3} />
            </mesh>
            {/* Moving Particle 1 */}
            <MovingParticle curve={curve1} color="#8b5cf6" speed={1} />

            <StepPlatform position={[0, 0, 0]} color="#06b6d4" label="2. Share Link" icon={ShareIcon} />

            {/* Connection 2 */}
            <mesh>
                <tubeGeometry args={[curve2, 64, 0.05, 8, false]} />
                <meshStandardMaterial color="#475569" transparent opacity={0.3} />
            </mesh>
            {/* Moving Particle 2 */}
            <MovingParticle curve={curve2} color="#06b6d4" speed={1} delay={1.5} />

            <StepPlatform position={[3.5, 0, 0]} color="#ec4899" label="3. Code Together" icon={CodeIcon} />
        </group>
    );
}

function MovingParticle({ curve, color, speed = 1, delay = 0 }) {
    const ref = useRef();
    useFrame((state) => {
        const t = (state.clock.getElapsedTime() * speed + delay) % 3; // Loop every 3s
        // Normalize t to 0-1 range roughly, or just clamp
        const time = t / 3;
        if (time <= 1) {
            const points = curve.getPoint(time);
            ref.current.position.copy(points);
            ref.current.visible = true;
        } else {
            ref.current.visible = false; // Hide during the 'gap'
        }
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color={color} />
            <pointLight distance={2} intensity={2} color={color} />
        </mesh>
    )
}
