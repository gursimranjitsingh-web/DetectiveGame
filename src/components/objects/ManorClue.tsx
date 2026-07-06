import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { registerInteract } from '@/game/interactRegistry';
import type { ClueType } from '@/data/caseTypes';

// An evidence clue that uses the shared (Case-02 style) interaction system: a single
// HUD "[E] Inspect" prompt appears when you look at it. Collecting opens the inspect card.
export default function ManorClue({
  id, name, type, position, rotation = [0, 0, 0],
}: {
  id: string; name: string; type: ClueType; position: [number, number, number]; rotation?: [number, number, number];
}) {
  const found = useGameStore((s) => s.cluesFound.includes(id));
  const glow = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    return registerInteract({
      id,
      pos: [position[0], position[1] + 0.15, position[2]],
      label: name,
      verb: 'Inspect',
      isActive: () => !useGameStore.getState().cluesFound.includes(id),
      interact: () => {
        const s = useGameStore.getState();
        if (s.cluesFound.includes(id)) return;
        s.addClue(id);
        s.setInspecting(true, id);
      },
    });
  }, [id, name, position]);

  useFrame(({ clock }) => {
    if (glow.current) {
      const inv = useGameStore.getState().investigationMode;
      glow.current.emissiveIntensity = 0.35 + 0.25 * Math.sin(clock.getElapsedTime() * 3) + (inv ? 0.4 : 0);
    }
  });

  if (found) return null;

  // A small emissive evidence marker, shaped loosely by type.
  const geom =
    type === 'knife' ? <boxGeometry args={[0.06, 0.06, 0.5]} /> :
    type === 'mug' ? <cylinderGeometry args={[0.05, 0.045, 0.12, 16]} /> :
    type === 'phone' ? <boxGeometry args={[0.09, 0.02, 0.17]} /> :
    type === 'badge' ? <boxGeometry args={[0.14, 0.02, 0.2]} /> :
    <boxGeometry args={[0.26, 0.02, 0.32]} />; // note / document

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        {geom}
        <meshStandardMaterial ref={glow} color="#fff3d0" emissive="#ffcf6b" emissiveIntensity={0.4} roughness={0.7} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.3, 0]} distance={1.8} intensity={0.5} color="#ffe9a8" />
    </group>
  );
}
