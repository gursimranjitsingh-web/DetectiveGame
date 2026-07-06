import React from 'react';
import { WoodMaterial, MetalMaterial, CarpetMaterial } from '../materials/ProceduralMaterials';
import Chair from './furniture/Chair';

interface CafeteriaProps {
  position?: [number, number, number];
}

function CafeteriaTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.05, 24]} />
        <WoodMaterial color="#7a5230" />
      </mesh>
      <mesh position={[0, 0.375, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.75, 12]} />
        <MetalMaterial color="#333" />
      </mesh>
      <Chair position={[0, 0, 0.6]} rotation={[0, Math.PI, 0]} />
      <Chair position={[0, 0, -0.6]} rotation={[0, 0, 0]} />
    </group>
  );
}

// The office cafeteria: a counter, a coffee machine, a vending machine, and a few round tables.
export default function Cafeteria({ position = [0, 0, 0] }: CafeteriaProps) {
  return (
    <group position={position}>
      {/* Counter */}
      <mesh position={[0, 0.5, -2.3]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.0, 0.6]} />
        <WoodMaterial color="#6b4726" />
      </mesh>
      <mesh position={[0, 1.02, -2.3]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.05, 0.62]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Coffee machine on the counter */}
      <group position={[-1.1, 1.05, -2.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.35, 0.45, 0.35]} />
          <MetalMaterial color="#2b2b2b" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.24, 0.1]}>
          <boxGeometry args={[0.1, 0.04, 0.1]} />
          <meshStandardMaterial color="#ff8a3d" emissive="#ff8a3d" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      </group>

      {/* Vending machine beside the counter */}
      <group position={[1.9, 0.9, -2.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.8, 0.6]} />
          <meshStandardMaterial color="#1f2a44" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.1, 0.31]}>
          <planeGeometry args={[0.7, 1.3]} />
          <meshStandardMaterial color="#dfe9ff" emissive="#8fb4ff" emissiveIntensity={0.4} roughness={0.2} toneMapped={false} />
        </mesh>
      </group>

      {/* Seating area */}
      <mesh position={[0, -0.005, 1]} receiveShadow>
        <boxGeometry args={[6, 0.01, 5]} />
        <CarpetMaterial color="#c9c2ab" />
      </mesh>
      <CafeteriaTable position={[-1.8, 0, 1.2]} />
      <CafeteriaTable position={[1.8, 0, 1.2]} />
      <CafeteriaTable position={[0, 0, 2.8]} />
    </group>
  );
}
