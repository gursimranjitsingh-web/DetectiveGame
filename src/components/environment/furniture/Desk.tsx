import React from 'react';
import { WoodMaterial, MetalMaterial } from '../../materials/ProceduralMaterials';

interface DeskProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function Desk({ position = [0, 0, 0], rotation = [0, 0, 0] }: DeskProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Top - thicker and wider */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.1, 1.0]} />
        <WoodMaterial />
      </mesh>
      
      {/* Front panel (modesty panel) */}
      <mesh position={[0, 0.45, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.6, 0.05]} />
        <WoodMaterial />
      </mesh>

      {/* Legs (Thicker, metal) */}
      <mesh position={[-0.9, 0.4, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <MetalMaterial color="#222" />
      </mesh>
      <mesh position={[0.9, 0.4, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <MetalMaterial color="#222" />
      </mesh>
      <mesh position={[-0.9, 0.4, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <MetalMaterial color="#222" />
      </mesh>
      <mesh position={[0.9, 0.4, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <MetalMaterial color="#222" />
      </mesh>

      {/* Drawer Cabinet on right side */}
      <mesh position={[0.6, 0.4, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.7, 0.8]} />
        <WoodMaterial />
      </mesh>
      
      {/* Drawer Handles */}
      <mesh position={[0.6, 0.6, 0.51]} castShadow>
        <boxGeometry args={[0.2, 0.02, 0.02]} />
        <MetalMaterial color="#c0c0c0" />
      </mesh>
      <mesh position={[0.6, 0.3, 0.51]} castShadow>
        <boxGeometry args={[0.2, 0.02, 0.02]} />
        <MetalMaterial color="#c0c0c0" />
      </mesh>
    </group>
  );
}
