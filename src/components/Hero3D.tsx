import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere args={[1.5, 64, 64]} ref={meshRef}>
      <MeshDistortMaterial
        color="#0284c7"
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

export const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-50 dark:opacity-30">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-2, -2, -5]} intensity={0.5} color="#0ea5e9" />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
};
