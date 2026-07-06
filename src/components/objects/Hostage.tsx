import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { registerInteract } from '@/game/interactRegistry';

// A captive, named office worker. Freed with E (via the central interaction system).
export default function Hostage({
  id, position, name, role, intel,
}: {
  id: string; position: [number, number]; name: string; role: string; intel: string;
}) {
  const { camera } = useThree();
  const bodyRef = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Mesh>(null);
  const saved = useGameStore((s) => s.savedHostages.includes(id));

  useEffect(() => {
    return registerInteract({
      id,
      pos: [position[0], 1.4, position[1]],
      label: `${name} · ${role}`,
      verb: 'Free',
      isActive: () => !useGameStore.getState().savedHostages.includes(id),
      interact: () => useGameStore.getState().rescueHostage(id, intel),
    });
  }, [id, name, role, intel, position]);

  useFrame(({ clock }) => {
    if (bodyRef.current) {
      bodyRef.current.position.y = THREE.MathUtils.damp(bodyRef.current.position.y, saved ? 0 : -0.35, 4, Math.min(clock.getElapsedTime(), 0.05));
    }
    if (marker.current) {
      marker.current.visible = !saved;
      marker.current.position.y = 2.4 + Math.sin(clock.getElapsedTime() * 3) * 0.08;
      marker.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={[position[0], 0, position[1]]}>
      <group ref={bodyRef}>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.46, 0.66, 0.28]} />
          <meshStandardMaterial color={saved ? '#4a6fa5' : '#5a6472'} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.26, 0.28, 0.26]} />
          <meshStandardMaterial color="#d8b48c" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.45, 0.05]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.4]} />
          <meshStandardMaterial color="#2b3038" roughness={0.85} />
        </mesh>
      </group>

      {/* Floating help marker (billboarded) */}
      <mesh ref={marker} position={[0, 2.4, 0]}>
        <planeGeometry args={[0.32, 0.32]} />
        <meshBasicMaterial color="#38e0ff" transparent opacity={0.85} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}
