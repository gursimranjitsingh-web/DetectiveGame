import React from 'react';
import { WallMaterial } from '../materials/ProceduralMaterials';
import Door from './Door';

interface CabinProps {
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  doorId: string;
  label?: string;
  doorWidth?: number;
  wallThickness?: number;
  wallColor?: string;
  children?: React.ReactNode;
}

// A small walled room open on the +z side except for a door gap. Used for the office's
// cabins (manager, CTO, DevOps room, meeting room). Note: the player's movement bound is a
// simple outer-rectangle clamp (see PlayerController), so these walls are visual only - there
// is no per-wall collision yet, same limitation as the bedroom case's decorative door.
export default function Cabin({
  position,
  width,
  depth,
  height,
  doorId,
  label,
  doorWidth = 1.3,
  wallThickness = 0.15,
  wallColor = '#c7bda8',
  children,
}: CabinProps) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const sideSegmentWidth = Math.max(0.1, halfW - doorWidth / 2);

  return (
    <group position={position}>
      {/* Back wall */}
      <mesh position={[0, height / 2, -halfD]} castShadow receiveShadow>
        <boxGeometry args={[width, height, wallThickness]} />
        <WallMaterial color={wallColor} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-halfW, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <WallMaterial color={wallColor} />
      </mesh>

      {/* Right wall */}
      <mesh position={[halfW, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <WallMaterial color={wallColor} />
      </mesh>

      {/* Front wall, split around the door gap */}
      <mesh position={[-(halfW - sideSegmentWidth / 2), height / 2, halfD]} castShadow receiveShadow>
        <boxGeometry args={[sideSegmentWidth, height, wallThickness]} />
        <WallMaterial color={wallColor} />
      </mesh>
      <mesh position={[halfW - sideSegmentWidth / 2, height / 2, halfD]} castShadow receiveShadow>
        <boxGeometry args={[sideSegmentWidth, height, wallThickness]} />
        <WallMaterial color={wallColor} />
      </mesh>

      <Door id={doorId} position={[0, 0, halfD]} width={doorWidth} height={2.3} label={label} />

      {children}
    </group>
  );
}
