import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MetalMaterial, FabricMaterial } from '../materials/ProceduralMaterials';
import { createLabelTexture, createWhiteboardTexture, createPosterTexture } from '@/utils/textureGenerator';

type Vec3 = [number, number, number];

// ── Desk nameplate ───────────────────────────────────────────────────────────
export function Nameplate({ position, rotation = [0, 0, 0], name, sub, accent }: {
  position: Vec3; rotation?: Vec3; name: string; sub?: string; accent?: string;
}) {
  const texture = useMemo(() => createLabelTexture(name, { sub, accent, bg: '#15171d' }), [name, sub, accent]);
  const ratio = sub ? 200 / 512 : 140 / 512;
  const width = 0.42;
  return (
    <group position={position} rotation={rotation}>
      {/* little stand */}
      <mesh position={[0, -0.02, -0.02]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[width + 0.04, width * ratio + 0.03, 0.015]} />
        <MetalMaterial color="#2a2a2e" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[width, width * ratio]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Wall-mounted room sign ─────────────────────────────────────────────────────
export function RoomSign({ position, rotation = [0, 0, 0], label, accent }: {
  position: Vec3; rotation?: Vec3; label: string; accent?: string;
}) {
  const texture = useMemo(() => createLabelTexture(label, { accent, bg: '#0f1116' }), [label, accent]);
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[2.7, 0.62, 0.08]} />
        <meshStandardMaterial color="#0b0d12" roughness={0.5} />
      </mesh>
      {/* Backlight so the text reads even in dim/blackout areas */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[2.58, 0.54]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Potted plant ───────────────────────────────────────────────────────────────
export function Plant({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.3, 16]} />
        <meshStandardMaterial color="#8a5a3c" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
        <meshStandardMaterial color="#2c1c12" roughness={1} />
      </mesh>
      {[
        [0, 0.55, 0, 0.28], [0.1, 0.5, 0.08, 0.22], [-0.1, 0.52, -0.06, 0.24], [0.06, 0.62, -0.1, 0.2],
      ].map((f, i) => (
        <mesh key={i} position={[f[0], f[1], f[2]]} castShadow>
          <sphereGeometry args={[f[3], 8, 8]} />
          <meshStandardMaterial color={i % 2 ? '#2f7d4f' : '#3a9a5f'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ── Whiteboard ─────────────────────────────────────────────────────────────────
export function Whiteboard({ position, rotation = [0, 0, 0] }: { position: Vec3; rotation?: Vec3 }) {
  const texture = useMemo(() => createWhiteboardTexture(), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[2.6, 1.5, 0.06]} />
        <MetalMaterial color="#c9ccd2" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[2.44, 1.34]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* tray */}
      <mesh position={[0, -0.78, 0.06]} castShadow>
        <boxGeometry args={[2.44, 0.05, 0.1]} />
        <MetalMaterial color="#9aa0a8" />
      </mesh>
    </group>
  );
}

// ── Framed poster ────────────────────────────────────────────────────────────
export function Poster({ position, rotation = [0, 0, 0], variant = 'ship' }: {
  position: Vec3; rotation?: Vec3; variant?: 'ship' | 'coffee' | 'alert';
}) {
  const texture = useMemo(() => createPosterTexture(variant), [variant]);
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 1.06, 0.04]} />
        <meshStandardMaterial color="#0b0d11" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.72, 0.98]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Server rack with blinking LEDs (DevOps room) ───────────────────────────────
function BlinkingLED({ position, color, phase }: { position: Vec3; color: string; phase: number }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 2 + phase;
    ref.current.emissiveIntensity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t));
  });
  return (
    <mesh position={position}>
      <boxGeometry args={[0.03, 0.03, 0.01]} />
      <meshStandardMaterial ref={ref} color={color} emissive={color} emissiveIntensity={0.8} toneMapped={false} />
    </mesh>
  );
}

export function ServerRack({ position, rotation = [0, 0, 0] }: { position: Vec3; rotation?: Vec3 }) {
  const leds = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({
      pos: [(-0.18 + (i % 5) * 0.09), 1.4 - Math.floor(i / 5) * 0.5, 0.31] as Vec3,
      color: i % 3 === 0 ? '#4ade80' : i % 3 === 1 ? '#38bdf8' : '#f59e0b',
      phase: i * 1.3,
    })),
    []
  );
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.8, 0.6]} />
        <meshStandardMaterial color="#15171c" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* rack unit slots */}
      {[0.4, 0.75, 1.1, 1.45].map((y) => (
        <mesh key={y} position={[0, y, 0.301]}>
          <boxGeometry args={[0.62, 0.28, 0.01]} />
          <meshStandardMaterial color="#0a0b0e" roughness={0.6} />
        </mesh>
      ))}
      {leds.map((l, i) => (
        <BlinkingLED key={i} position={l.pos} color={l.color} phase={l.phase} />
      ))}
    </group>
  );
}

// ── Water cooler ───────────────────────────────────────────────────────────────
export function WaterCooler({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 1.0, 0.4]} />
        <meshStandardMaterial color="#e8edf2" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.4, 16]} />
        <meshStandardMaterial color="#8fd0ff" transparent opacity={0.6} roughness={0.1} metalness={0.1} />
      </mesh>
    </group>
  );
}

// ── Acoustic partition between desk clusters ───────────────────────────────────
export function Partition({ position, rotation = [0, 0, 0], length = 2 }: { position: Vec3; rotation?: Vec3; length?: number }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 1.2, 0.06]} />
        <FabricMaterial color="#4a4f5c" />
      </mesh>
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[length, 0.04, 0.16]} />
        <MetalMaterial color="#2a2a2e" />
      </mesh>
    </group>
  );
}

// ── Roaming printer (the one Priyansh keeps failing to find) ────────────────────
export function Printer({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.4, 0.55]} />
        <meshStandardMaterial color="#3d4048" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.3, 0.5]} />
        <meshStandardMaterial color="#2a2c32" roughness={0.6} />
      </mesh>
      {/* output tray with paper */}
      <mesh position={[0, 0.92, 0.1]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.42, 0.01, 0.3]} />
        <meshStandardMaterial color="#f4f4f0" roughness={0.9} />
      </mesh>
    </group>
  );
}
