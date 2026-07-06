import React, { useMemo } from 'react';
import { MetalMaterial } from '../../materials/ProceduralMaterials';
import { createScreenTexture } from '@/utils/textureGenerator';
import type { MonitorState } from '@/data/officeLayout';

interface MonitorProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** What the screen is showing. 'off' renders a dark, unlit panel. */
  state?: MonitorState;
  /** Legacy flag: forces the red RATE LIMIT screen. */
  errorGlow?: boolean;
}

// An office monitor with a procedurally-drawn screen, so a coder's desk, the dead
// RATE-LIMIT screen, and the DevOps dashboard all read differently at a glance.
export default function Monitor({ position = [0, 0, 0], rotation = [0, 0, 0], state, errorGlow = false }: MonitorProps) {
  const resolved: MonitorState = errorGlow ? 'error' : state ?? 'code';
  const isOff = resolved === 'off';
  const screen = useMemo(() => (isOff ? null : createScreenTexture(resolved as 'code' | 'error' | 'dashboard')), [resolved, isOff]);

  const glow = resolved === 'error' ? '#c0392b' : resolved === 'dashboard' ? '#2f5fa0' : '#26405f';

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.03, 16]} />
        <MetalMaterial color="#222" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <MetalMaterial color="#222" roughness={0.4} />
      </mesh>
      {/* Bezel */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.46, 0.3, 0.02]} />
        <meshStandardMaterial color="#0f0f12" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.32, 0.012]}>
        <planeGeometry args={[0.4, 0.24]} />
        {isOff ? (
          <meshStandardMaterial color="#0a0d12" roughness={0.35} metalness={0.4} />
        ) : (
          <meshStandardMaterial map={screen ?? undefined} emissive={glow} emissiveIntensity={0.55} toneMapped={false} />
        )}
      </mesh>
    </group>
  );
}
