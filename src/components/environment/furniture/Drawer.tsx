import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '@/store/useGameStore';
import { WoodMaterial, MetalMaterial } from '../../materials/ProceduralMaterials';

interface DrawerProps {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
}

const SLIDE_DISTANCE = 0.32;

// A desk drawer that slides open on click/E, purely for atmosphere - it doesn't gate any evidence.
export default function Drawer({ id, position, rotation = [0, 0, 0], width = 0.45, height = 0.18, depth = 0.5 }: DrawerProps) {
  const isOpen = useGameStore((state) => Boolean(state.interactables[id]));
  const isTargeted = useGameStore((state) => state.targetedInteractId === id);
  const boxRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!boxRef.current) return;
    const target = isOpen ? SLIDE_DISTANCE : 0;
    boxRef.current.position.z = THREE.MathUtils.damp(boxRef.current.position.z, target, 6, delta);
  });

  return (
    <group position={position} rotation={rotation}>
      <group ref={boxRef} userData={{ interactId: id }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <WoodMaterial color="#5c3a21" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, depth / 2 + 0.005]} castShadow>
          <boxGeometry args={[width * 0.3, 0.02, 0.02]} />
          <MetalMaterial color="#c9c9c9" roughness={0.3} />
        </mesh>
      </group>

      {isTargeted && (
        <Html position={[0, 0.2, 0.3]} center>
          <div className="bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap pointer-events-none text-center">
            <p className="text-xs text-gray-400">Press E to {isOpen ? 'Close' : 'Open'} Drawer</p>
          </div>
        </Html>
      )}
    </group>
  );
}
