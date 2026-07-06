import React, { useMemo } from 'react';
import { WallMaterial, CarpetMaterial, WoodMaterial, MetalMaterial } from '../materials/ProceduralMaterials';
import { createBloodStainTexture } from '../../utils/textureGenerator';

interface RoomProps {
  width: number;
  length: number;
  height: number;
  wallThickness?: number;
}

export default function Room({ width, length, height, wallThickness = 0.2 }: RoomProps) {
  const halfW = width / 2;
  const halfL = length / 2;
  const halfH = height / 2;
  const bloodTexture = useMemo(() => createBloodStainTexture(), []);

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -wallThickness / 2, 0]} receiveShadow>
        <boxGeometry args={[width, wallThickness, length]} />
        <CarpetMaterial />
      </mesh>

      {/* Blood pooling near the body outline - a single irregular stain texture (not stacked
          shiny discs, which read as a reflective table/plate) with a matte, non-metallic finish.
          Kept small and offset from the outline's center so the chalk marking stays visible. */}
      <mesh position={[1.85, 0.012, -0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.85, 0.75]} />
        <meshStandardMaterial
          map={bloodTexture}
          transparent
          roughness={0.85}
          metalness={0}
          emissive="#2a0000"
          emissiveMap={bloodTexture}
          emissiveIntensity={0.15}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, height + wallThickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, wallThickness, length]} />
        <WallMaterial />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, halfH, -halfL - wallThickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <WallMaterial />
      </mesh>

      {/* Front Wall (Optional - usually leave open or with door depending on layout) */}
      <mesh position={[0, halfH, halfL + wallThickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <WallMaterial />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-halfW - wallThickness / 2, halfH, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness, height, length + wallThickness * 2]} />
        <WallMaterial />
      </mesh>

      {/* Right Wall */}
      <mesh position={[halfW + wallThickness / 2, halfH, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness, height, length + wallThickness * 2]} />
        <WallMaterial />
      </mesh>

      {/* Door - set into the right wall */}
      <group position={[halfW - 0.03, 0, 2.5]}>
        {/* Frame */}
        <mesh position={[0, 1.15, -0.65]} castShadow>
          <boxGeometry args={[0.1, 2.3, 0.1]} />
          <meshStandardMaterial color="#3b2a1d" roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.15, 0.65]} castShadow>
          <boxGeometry args={[0.1, 2.3, 0.1]} />
          <meshStandardMaterial color="#3b2a1d" roughness={0.75} />
        </mesh>
        <mesh position={[0, 2.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.1, 1.4]} />
          <meshStandardMaterial color="#3b2a1d" roughness={0.75} />
        </mesh>

        {/* Door panel */}
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.06, 2.2, 1.1]} />
          <WoodMaterial color="#5c3a21" roughness={0.65} />
        </mesh>

        {/* Doorknob */}
        <mesh position={[0.06, 1.05, 0.42]} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <MetalMaterial color="#c9a24a" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
