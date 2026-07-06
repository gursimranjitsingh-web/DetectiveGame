import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { registerInteract } from '@/game/interactRegistry';

export default function Elevator({ position, accent }: { position: [number, number]; accent: string }) {
  const doorMat = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    return registerInteract({
      id: 'elevator',
      pos: [position[0], 1.4, position[1]],
      label: 'Elevator',
      verb: 'Use',
      isActive: () => true,
      interact: () => {
        const s = useGameStore.getState();
        if (s.floorDefused) s.advanceFloor();
        else s.pushRadio('HQ: Elevator\'s locked down — defuse this floor\'s bomb first.', 'warn');
      },
    });
  }, [position]);

  useFrame(() => {
    const floorDefused = useGameStore.getState().floorDefused;
    if (doorMat.current) {
      doorMat.current.emissive.setHex(floorDefused ? 0x2ec35a : 0x883322);
      doorMat.current.emissiveIntensity = 0.35;
    }
  });

  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 3.2, 0.4]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.4, 0.22]}>
        <boxGeometry args={[1.7, 2.6, 0.08]} />
        <meshStandardMaterial ref={doorMat} color="#c8ccd4" roughness={0.35} metalness={0.7} emissive="#883322" emissiveIntensity={0.35} toneMapped={false} />
      </mesh>
      <mesh position={[1.0, 1.4, 0.25]}>
        <boxGeometry args={[0.12, 0.3, 0.05]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
    </group>
  );
}
