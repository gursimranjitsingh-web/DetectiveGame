import React from 'react';
import { WallMaterial, CarpetMaterial } from '../materials/ProceduralMaterials';

interface OfficeRoomProps {
  width: number;
  length: number;
  height: number;
  wallThickness?: number;
}

export default function OfficeRoom({ width, length, height, wallThickness = 0.2 }: OfficeRoomProps) {
  const halfW = width / 2;
  const halfL = length / 2;
  const halfH = height / 2;

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -wallThickness / 2, 0]} receiveShadow>
        <boxGeometry args={[width, wallThickness, length]} />
        <CarpetMaterial color="#b7bfc9" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, height + wallThickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, wallThickness, length]} />
        <WallMaterial color="#e7e6e2" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, halfH, -halfL - wallThickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <WallMaterial color="#dedad2" />
      </mesh>

      {/* Front wall (entrance side) */}
      <mesh position={[0, halfH, halfL + wallThickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <WallMaterial color="#dedad2" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-halfW - wallThickness / 2, halfH, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness, height, length + wallThickness * 2]} />
        <WallMaterial color="#dedad2" />
      </mesh>

      {/* Right wall */}
      <mesh position={[halfW + wallThickness / 2, halfH, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness, height, length + wallThickness * 2]} />
        <WallMaterial color="#dedad2" />
      </mesh>
    </group>
  );
}
