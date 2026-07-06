import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { registerInteract } from '@/game/interactRegistry';

// A collectible clue that reveals one part of the defuse solution. Read with E.
export default function MissionClue({
  id, position, label, text,
}: {
  id: string; position: [number, number]; label: string; text: string;
}) {
  const paper = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  const found = useGameStore((s) => s.cluesFound.includes(id));

  useEffect(() => {
    return registerInteract({
      id,
      pos: [position[0], 0.95, position[1]],
      label,
      verb: 'Read',
      isActive: () => !useGameStore.getState().cluesFound.includes(id),
      interact: () => {
        const s = useGameStore.getState();
        if (s.cluesFound.includes(id)) return;
        s.addClue(id);
        s.setReadingClue({ label, text });
      },
    });
  }, [id, label, text, position]);

  useFrame(({ clock }) => {
    if (paper.current) paper.current.position.y = 0.9 + Math.sin(clock.getElapsedTime() * 2) * 0.04;
    if (glow.current) {
      const inv = useGameStore.getState().investigationMode;
      glow.current.emissiveIntensity = inv ? 0.6 : 0.35;
    }
  });

  if (found) return null;

  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color="#2a2f38" roughness={0.6} />
      </mesh>
      <mesh ref={paper} position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.3, 0.4]} />
        <meshStandardMaterial ref={glow} color="#fdfbf0" emissive="#e0b23a" emissiveIntensity={0.35} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.1, 0]} distance={2} intensity={0.5} color="#ffe9a8" />
    </group>
  );
}
