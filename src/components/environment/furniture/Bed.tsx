import React from 'react';
import { WoodMaterial } from '../../materials/ProceduralMaterials';
import * as THREE from 'three';

interface BedProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function Bed({ position = [0, 0, 0], rotation = [0, 0, 0] }: BedProps) {
  return (
    <group position={position} rotation={rotation}>
      
      {/* Bed Frame */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.2, 3.2]} />
        <WoodMaterial />
      </mesh>

      {/* Headboard */}
      <mesh position={[0, 0.8, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.2, 0.2]} />
        <WoodMaterial />
      </mesh>

      {/* Footboard */}
      <mesh position={[0, 0.45, 1.5]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.5, 0.2]} />
        <WoodMaterial />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.3, 3.0]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.9} />
      </mesh>

      {/* Pillows */}
      <mesh position={[-0.5, 0.65, -1.1]} rotation={[Math.PI / 16, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.15, 0.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.65, -1.1]} rotation={[Math.PI / 16, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.15, 0.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>

      {/* Blanket */}
      <mesh position={[0, 0.62, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[2.05, 0.05, 2.2]} />
        <meshStandardMaterial color="#6b2f2f" roughness={1.0} />
      </mesh>

    </group>
  );
}
