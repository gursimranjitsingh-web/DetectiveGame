import { useMemo } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import { createWoodTexture, createMarbleTexture, createCarpetTexture, createFabricTexture } from '@/utils/textureGenerator';

type MaterialProps = ThreeElements['meshStandardMaterial'];

export function WoodMaterial(props: MaterialProps) {
  const texture = useMemo(() => createWoodTexture(), []);
  return (
    <meshStandardMaterial 
      map={texture} 
      roughness={0.8} 
      metalness={0.1} 
      color="#cc9966"
      {...props} 
    />
  );
}

export function MarbleMaterial(props: MaterialProps) {
  const texture = useMemo(() => createMarbleTexture(), []);
  return (
    <meshStandardMaterial 
      map={texture} 
      roughness={0.1} 
      metalness={0.1} 
      {...props} 
    />
  );
}

export function MetalMaterial(props: MaterialProps) {
  return (
    <meshStandardMaterial 
      color="#888888" 
      roughness={0.3} 
      metalness={0.8} 
      {...props} 
    />
  );
}

export function CarpetMaterial(props: MaterialProps) {
  const texture = useMemo(() => createCarpetTexture(), []);
  return (
    <meshStandardMaterial
      map={texture}
      roughness={0.92}
      metalness={0.0}
      color="#e4ded0"
      {...props}
    />
  );
}

export function FabricMaterial({ color = '#3a3f4d', ...props }: MaterialProps) {
  const texture = useMemo(() => createFabricTexture(typeof color === 'string' ? color : '#3a3f4d'), [color]);
  return (
    <meshStandardMaterial
      map={texture}
      roughness={0.95}
      metalness={0.0}
      color={color}
      {...props}
    />
  );
}

export function WallMaterial(props: MaterialProps) {
  return (
    <meshStandardMaterial 
      color="#d1c7b7" 
      roughness={0.86} 
      metalness={0.0} 
      {...props} 
    />
  );
}
