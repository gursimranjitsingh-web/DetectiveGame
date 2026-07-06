import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { registerInteract } from '@/game/interactRegistry';
import type { Interactable } from '@/data/floors';

const SEARCH_TIME_COST = 4;

export default function MissionInteractable({ item }: { item: Interactable }) {
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  const drawer = useRef<THREE.Group>(null);

  const searched = useGameStore((s) => s.searchedIds.includes(item.id));
  const bombRevealed = useGameStore((s) => s.bombRevealed);

  useEffect(() => {
    const isBomb = item.kind === 'bomb';
    return registerInteract({
      id: item.id,
      pos: [item.pos[0], 1.0, item.pos[1]],
      label: item.label,
      verb: isBomb ? 'Inspect' : 'Search',
      isActive: () => {
        const s = useGameStore.getState();
        return isBomb ? !s.bombRevealed : !s.searchedIds.includes(item.id);
      },
      interact: () => {
        const s = useGameStore.getState();
        if (isBomb) {
          if (!s.bombRevealed) {
            s.revealBomb();
            s.pushRadio('HQ: Bomb located. Get on that defuser — clock\'s running.', 'warn');
          }
          return;
        }
        if (s.searchedIds.includes(item.id)) return;
        s.markSearched(item.id);
        s.penalizeTime(SEARCH_TIME_COST);
        if (item.note) {
          s.setReadingClue({ label: item.label, text: item.note });
          s.addNote(item.note);
        }
      },
    });
  }, [item]);

  useFrame(({ clock }) => {
    const inv = useGameStore.getState().investigationMode;
    if (glow.current) glow.current.emissiveIntensity = inv && !searched ? 0.5 : 0;
    if (drawer.current) {
      drawer.current.position.z = THREE.MathUtils.damp(drawer.current.position.z, searched ? 0.28 : 0, 6, Math.min(clock.getElapsedTime(), 0.05));
    }
  });

  if (item.kind === 'bomb' && bombRevealed) return null;

  return (
    <group position={[item.pos[0], 0, item.pos[1]]}>
      {item.kind === 'computer' ? (
        <group>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.7, 0.8, 0.5]} />
            <meshStandardMaterial ref={glow} color="#3a4048" emissive="#ffcf6b" emissiveIntensity={0} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.95, -0.05]} castShadow>
            <boxGeometry args={[0.5, 0.34, 0.04]} />
            <meshStandardMaterial color="#0f1116" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.95, -0.028]}>
            <planeGeometry args={[0.44, 0.28]} />
            <meshStandardMaterial color="#12324f" emissive="#1f6fb0" emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        </group>
      ) : item.kind === 'bomb' ? (
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.8, 0.6]} />
          <meshStandardMaterial ref={glow} color="#7a6242" emissive="#ffcf6b" emissiveIntensity={0} roughness={0.85} />
        </mesh>
      ) : (
        <group>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 1.5, 0.5]} />
            <meshStandardMaterial ref={glow} color="#8a8f98" emissive="#ffcf6b" emissiveIntensity={0} roughness={0.5} metalness={0.4} />
          </mesh>
          <group ref={drawer} position={[0, 1.05, 0]}>
            <mesh position={[0, 0, 0.26]} castShadow>
              <boxGeometry args={[0.78, 0.38, 0.04]} />
              <meshStandardMaterial color="#6b7078" metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.29]}>
              <boxGeometry args={[0.3, 0.03, 0.03]} />
              <meshStandardMaterial color="#40454d" metalness={0.5} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
