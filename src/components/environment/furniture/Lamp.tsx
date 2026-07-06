import React from 'react';
import { MetalMaterial } from '../../materials/ProceduralMaterials';

interface LampProps {
  position?: [number, number, number];
  color?: string;
  intensity?: number;
}

export default function Lamp({ position = [0, 0, 0], color = "#ffeedd", intensity = 2.0 }: LampProps) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.05, 32]} />
        <MetalMaterial color="#111" roughness={0.4} />
      </mesh>
      
      {/* Stand (tapered) */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.04, 1.5, 16]} />
        <MetalMaterial color="#333" />
      </mesh>
      
      {/* Shade (larger, more elegant) */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.4, 0.4, 32, 1, true]} />
        {/* Soft fabric-like material for shade */}
        <meshStandardMaterial color="#f0ead6" side={2} roughness={1.0} />
      </mesh>
      
      {/* Inner Shade (blocking light leak) */}
      <mesh position={[0, 1.6, 0]}>
         <cylinderGeometry args={[0.14, 0.39, 0.39, 32, 1, true]} />
         <meshStandardMaterial color="#ffffff" side={1} roughness={1.0} emissive="#ffddaa" emissiveIntensity={0.2} />
      </mesh>

      {/* Light Bulb */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} toneMapped={false} />
      </mesh>

      {/* Actual Light Source */}
      <pointLight position={[0, 1.45, 0]} color={color} intensity={intensity} distance={15} castShadow shadow-bias={-0.001} />
    </group>
  );
}
