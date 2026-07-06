import React from 'react';
import { WoodMaterial, CarpetMaterial } from '../../materials/ProceduralMaterials';

interface ChairProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function Chair({ position = [0, 0, 0], rotation = [0, 0, 0] }: ChairProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        {/* Leather-like using dark carpet logic */}
        <CarpetMaterial color="#302015" roughness={0.7} />
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, 0.75, -0.225]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <WoodMaterial />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.2, 0.225, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.45, 0.04]} />
        <WoodMaterial />
      </mesh>
      <mesh position={[0.2, 0.225, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.45, 0.04]} />
        <WoodMaterial />
      </mesh>
      <mesh position={[-0.2, 0.225, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.45, 0.04]} />
        <WoodMaterial />
      </mesh>
      <mesh position={[0.2, 0.225, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.45, 0.04]} />
        <WoodMaterial />
      </mesh>
    </group>
  );
}
