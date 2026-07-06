import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { registerInteract } from '@/game/interactRegistry';

export default function Bomb({ position }: { position: [number, number] }) {
  const led = useRef<THREE.MeshStandardMaterial>(null);
  const glow = useRef<THREE.PointLight>(null);
  const bombRevealed = useGameStore((s) => s.bombRevealed);

  useEffect(() => {
    return registerInteract({
      id: 'bomb-device',
      pos: [position[0], 0.9, position[1]],
      label: 'Bomb',
      verb: 'Defuse',
      isActive: () => {
        const s = useGameStore.getState();
        return s.bombRevealed && !s.floorDefused;
      },
      interact: () => {
        const s = useGameStore.getState();
        if (s.bombRevealed && !s.floorDefused) s.setDefusing(true);
      },
    });
  }, [position]);

  useFrame(({ clock }) => {
    const floorDefused = useGameStore.getState().floorDefused;
    const t = clock.getElapsedTime();
    if (led.current) {
      if (floorDefused) {
        led.current.color.setHex(0x33ff88);
        led.current.emissive.setHex(0x33ff88);
        led.current.emissiveIntensity = 0.8;
      } else {
        const blink = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 6));
        led.current.color.setHex(0xff3b3b);
        led.current.emissive.setHex(0xff2222);
        led.current.emissiveIntensity = blink;
      }
    }
    if (glow.current) glow.current.intensity = floorDefused ? 0.6 : 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(t * 6));
  });

  if (!bombRevealed) return null;

  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.5, 0.5]} />
        <meshStandardMaterial color="#20242c" roughness={0.6} metalness={0.4} />
      </mesh>
      {[-0.18, 0, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.5, 0.26]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
          <meshStandardMaterial color="#8a5a2b" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.66, 0.26]}>
        <planeGeometry args={[0.34, 0.14]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[0.24, 0.66, 0.26]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial ref={led} color="#ff3b3b" emissive="#ff2222" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <pointLight ref={glow} position={[0, 0.7, 0.4]} distance={3} color="#ff5a5a" intensity={0.5} />
    </group>
  );
}
