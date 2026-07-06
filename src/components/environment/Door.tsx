import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '@/store/useGameStore';
import { WoodMaterial, MetalMaterial } from '../materials/ProceduralMaterials';

interface DoorProps {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  label?: string;
}

const OPEN_ANGLE = Math.PI / 2.1;

// A functional, interactable door - click/E toggles it open via the shared interactables
// store, and the panel swings on a hinge at its edge instead of snapping instantly.
export default function Door({ id, position, rotation = [0, 0, 0], width = 1.3, height = 2.3, label }: DoorProps) {
  const isOpen = useGameStore((state) => Boolean(state.interactables[id]));
  const isTargeted = useGameStore((state) => state.targetedInteractId === id);
  const panelRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!panelRef.current) return;
    const target = isOpen ? OPEN_ANGLE : 0;
    panelRef.current.rotation.y = THREE.MathUtils.damp(panelRef.current.rotation.y, target, 6, delta);
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[-width / 2 - 0.05, height / 2, 0]} castShadow>
        <boxGeometry args={[0.1, height + 0.1, 0.12]} />
        <meshStandardMaterial color="#3b2a1d" roughness={0.75} />
      </mesh>
      <mesh position={[width / 2 + 0.05, height / 2, 0]} castShadow>
        <boxGeometry args={[0.1, height + 0.1, 0.12]} />
        <meshStandardMaterial color="#3b2a1d" roughness={0.75} />
      </mesh>
      <mesh position={[0, height + 0.05, 0]} castShadow>
        <boxGeometry args={[width + 0.2, 0.1, 0.12]} />
        <meshStandardMaterial color="#3b2a1d" roughness={0.75} />
      </mesh>

      {/* Hinged panel - pivot sits at the left edge of the doorway */}
      <group ref={panelRef} position={[-width / 2, 0, 0]} userData={{ interactId: id }}>
        <mesh position={[width / 2, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width - 0.05, height - 0.05, 0.06]} />
          <WoodMaterial color="#5c3a21" roughness={0.65} />
        </mesh>
        <mesh position={[width - 0.12, height / 2, 0.04]} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <MetalMaterial color="#c9a24a" roughness={0.3} />
        </mesh>
      </group>

      {isTargeted && (
        <Html position={[0, height + 0.4, 0]} center>
          <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/20 whitespace-nowrap pointer-events-none text-center">
            {label && <p className="font-bold">{label}</p>}
            <p className="text-xs text-gray-400">Press E to {isOpen ? 'Close' : 'Open'}</p>
          </div>
        </Html>
      )}
    </group>
  );
}
