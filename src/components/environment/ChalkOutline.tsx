import React from 'react';

interface ChalkOutlineProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function ChalkOutline({ position = [0, 0.01, 0], rotation = [-Math.PI / 2, 0, 0] }: ChalkOutlineProps) {
  // We use Torus and Plane segments to draw a rough chalk outline of a body on the floor
  
  return (
    <group position={position} rotation={rotation}>
      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.2, 0.02, 8, 32]} />
        <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 0.2, 0]}>
        <ringGeometry args={[0.3, 0.32, 4]} />
        <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.4, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.02, 0.6]} />
        <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
      </mesh>
      
      {/* Right Arm */}
      <mesh position={[0.4, 0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[0.02, 0.6]} />
        <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.15, -0.4, 0]} rotation={[0, 0, -Math.PI / 16]}>
        <planeGeometry args={[0.02, 0.8]} />
        <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.15, -0.4, 0]} rotation={[0, 0, Math.PI / 16]}>
        <planeGeometry args={[0.02, 0.8]} />
        <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
      </mesh>
      
      {/* Small Blood Splatter near head (using a red plane) */}
      <mesh position={[0.3, 0.9, -0.001]} rotation={[0, 0, 0.62]}>
        <circleGeometry args={[0.15, 8]} />
        <meshBasicMaterial color="#a80c0c" opacity={0.9} transparent />
      </mesh>
      <mesh position={[0.2, 1.1, -0.001]} rotation={[0, 0, 1.18]}>
        <circleGeometry args={[0.08, 6]} />
        <meshBasicMaterial color="#a80c0c" opacity={0.9} transparent />
      </mesh>
    </group>
  );
}
