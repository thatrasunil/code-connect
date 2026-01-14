import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';

export function AIModel(props) {
    const mesh = useRef();
    const inner = useRef();
    useFrame((state, delta) => {
        mesh.current.rotation.x = mesh.current.rotation.y += delta * 0.2;
        inner.current.rotation.x = inner.current.rotation.y -= delta * 0.5;
    });
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group {...props}>
                {/* Outer Wireframe */}
                <mesh ref={mesh}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#a78bfa" wireframe emissive="#a78bfa" emissiveIntensity={0.2} />
                </mesh>
                {/* Inner Core */}
                <mesh ref={inner} scale={0.5}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} toneMapped={false} />
                </mesh>
            </group>
        </Float>
    );
}

export function CollabModel(props) {
    const mesh = useRef();
    useFrame((state, delta) => (mesh.current.rotation.y += delta * 0.5));
    return (
        <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.6}>
            <group ref={mesh} {...props}>
                {/* Central Hub */}
                <mesh>
                    <sphereGeometry args={[0.35, 32, 32]} />
                    <meshStandardMaterial color="#44ee88" emissive="#44ee88" emissiveIntensity={0.5} />
                </mesh>

                {/* Nodes */}
                <mesh position={[0.8, 0, 0]}>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshStandardMaterial color="#34d399" />
                </mesh>
                <mesh position={[-0.8, 0, 0]}>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshStandardMaterial color="#34d399" />
                </mesh>
                <mesh position={[0, -0.8, 0]}>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshStandardMaterial color="#34d399" />
                </mesh>

                {/* Connections */}
                <mesh rotation={[0, 0, Math.PI / 2]} position={[0.4, 0, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.8]} />
                    <meshStandardMaterial color="#fff" opacity={0.3} transparent />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.4, 0, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.8]} />
                    <meshStandardMaterial color="#fff" opacity={0.3} transparent />
                </mesh>
                <mesh position={[0, -0.4, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.8]} />
                    <meshStandardMaterial color="#fff" opacity={0.3} transparent />
                </mesh>
            </group>
        </Float>
    );
}

export function SecureModel(props) {
    const mesh = useRef();
    useFrame((state, delta) => (mesh.current.rotation.y -= delta * 0.3));
    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
            <group ref={mesh} {...props}>
                {/* Shackle */}
                <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
                    <torusGeometry args={[0.35, 0.1, 16, 32, Math.PI]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Body */}
                <RoundedBox args={[0.8, 0.7, 0.3]} radius={0.1} smoothness={4} position={[0, -0.15, 0]}>
                    <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.3} />
                </RoundedBox>
                {/* Keyhole */}
                <mesh position={[0, -0.15, 0.16]}>
                    <circleGeometry args={[0.1, 32]} />
                    <meshStandardMaterial color="#78350f" />
                </mesh>
            </group>
        </Float>
    )
}

export function CloudModel(props) {
    const mesh = useRef();
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.position.y = Math.sin(t) * 0.1;
    });
    return (
        <Float speed={1} rotationIntensity={0.1} floatIntensity={1}>
            <group ref={mesh} {...props}>
                <mesh position={[-0.4, 0, 0]}>
                    <sphereGeometry args={[0.45, 32, 32]} />
                    <meshStandardMaterial color="#60a5fa" roughness={0.3} />
                </mesh>
                <mesh position={[0.4, 0, 0]}>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="#60a5fa" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.3, 0]}>
                    <sphereGeometry args={[0.55, 32, 32]} />
                    <meshStandardMaterial color="#93c5fd" roughness={0.1} />
                </mesh>
            </group>
        </Float>
    )
}

export function LanguageModel(props) {
    const mesh = useRef();
    useFrame((state, delta) => (mesh.current.rotation.x = mesh.current.rotation.y += delta * 0.4));
    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <group ref={mesh} {...props}>
                <RoundedBox args={[0.45, 0.45, 0.45]} radius={0.1} smoothness={4} position={[-0.3, 0.3, 0]}>
                    <meshStandardMaterial color="#fcd34d" metalness={0.4} roughness={0.2} />
                </RoundedBox>
                <RoundedBox args={[0.45, 0.45, 0.45]} radius={0.1} smoothness={4} position={[0.3, -0.3, 0]}>
                    <meshStandardMaterial color="#06b6d4" metalness={0.4} roughness={0.2} />
                </RoundedBox>
                <RoundedBox args={[0.45, 0.45, 0.45]} radius={0.1} smoothness={4} position={[0.3, 0.3, -0.3]}>
                    <meshStandardMaterial color="#ec4899" metalness={0.4} roughness={0.2} />
                </RoundedBox>
            </group>
        </Float>
    );
}

export function VideoModel(props) {
    const mesh = useRef();
    useFrame((state, delta) => (mesh.current.rotation.y -= delta * 0.4));
    return (
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
            <group ref={mesh} {...props}>
                <RoundedBox args={[0.9, 0.6, 0.2]} radius={0.1} smoothness={4}>
                    <meshStandardMaterial color="#22c55e" />
                </RoundedBox>
                <mesh position={[0.6, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <coneGeometry args={[0.3, 0.5, 32]} />
                    <meshStandardMaterial color="#16a34a" />
                </mesh>
                <mesh position={[0, 0, 0.11]}>
                    <circleGeometry args={[0.15, 32]} />
                    <meshStandardMaterial color="#dcfce7" />
                </mesh>
            </group>
        </Float>
    );
}
