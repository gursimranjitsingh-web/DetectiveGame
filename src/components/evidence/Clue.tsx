import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Html } from '@react-three/drei';

interface ClueProps {
  id: string;
  name: string;
  description: string;
  type: 'knife' | 'note' | 'usb' | 'document' | 'laptop' | 'cans' | 'badge' | 'phone' | 'mug';
  position: [number, number, number];
  rotation?: [number, number, number];
}

export default function Clue({ id, name, description, type, position, rotation = [0, 0, 0] }: ClueProps) {
  const { cluesFound, targetedClueId } = useGameStore();
  const isFound = cluesFound.includes(id);
  const isTargeted = targetedClueId === id;

  if (isFound) return null; // Hide once collected

  return (
    <group 
      position={position} 
      rotation={rotation}
      userData={{ clueId: id }}
    >
      {/* Geometry based on type */}
      {type === 'knife' && (
        <group scale={0.5}>
          {/* Blade */}
          <mesh position={[0, 0.2, 0]} castShadow>
             <boxGeometry args={[0.02, 0.4, 0.08]} />
             <meshStandardMaterial color={isTargeted ? '#d9e8ff' : '#888'} emissive={isTargeted ? '#355b8f' : '#000000'} emissiveIntensity={isTargeted ? 0.25 : 0} metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, -0.15, 0]} castShadow>
             <boxGeometry args={[0.04, 0.2, 0.1]} />
             <meshStandardMaterial color={isTargeted ? '#5a2d10' : '#301500'} emissive={isTargeted ? '#3a1d0a' : '#000000'} emissiveIntensity={isTargeted ? 0.3 : 0} roughness={0.9} />
          </mesh>
        </group>
      )}

      {type === 'note' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color={isTargeted ? '#fff7b3' : '#ffffe0'} emissive={isTargeted ? '#5d4b12' : '#000000'} emissiveIntensity={isTargeted ? 0.25 : 0} roughness={0.9} />
        </mesh>
      )}

      {type === 'usb' && (
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.04, 0.2]} />
          <meshStandardMaterial color={isTargeted ? '#36415c' : '#222'} emissive={isTargeted ? '#1f3b78' : '#000000'} emissiveIntensity={isTargeted ? 0.35 : 0} metalness={0.5} roughness={0.5} />
        </mesh>
      )}

      {type === 'document' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <planeGeometry args={[0.28, 0.36]} />
          <meshStandardMaterial color={isTargeted ? '#ffffff' : '#f2f2ee'} emissive={isTargeted ? '#3a3a2f' : '#000000'} emissiveIntensity={isTargeted ? 0.2 : 0} roughness={0.9} />
        </mesh>
      )}

      {type === 'laptop' && (
        <group scale={0.6}>
          {/* Base */}
          <mesh position={[0, 0.02, 0.1]} castShadow>
            <boxGeometry args={[0.5, 0.03, 0.35]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.4} />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 0.2, -0.06]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.5, 0.34, 0.02]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.4} />
          </mesh>
          {/* Glowing display */}
          <mesh position={[0, 0.2, -0.049]} rotation={[-0.3, 0, 0]}>
            <planeGeometry args={[0.42, 0.26]} />
            <meshStandardMaterial
              color={isTargeted ? '#ffdede' : '#ff8a8a'}
              emissive={isTargeted ? '#ff4d4d' : '#b32222'}
              emissiveIntensity={isTargeted ? 1.1 : 0.7}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}

      {type === 'cans' && (
        <group scale={0.7}>
          {[-0.12, 0, 0.12].map((offset, i) => (
            <mesh key={offset} position={[offset, 0.06, i % 2 === 0 ? 0 : 0.05]} rotation={[0, 0, i === 1 ? Math.PI / 2 : 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.12, 16]} />
              <meshStandardMaterial
                color={isTargeted ? '#8fe0c8' : '#3f8f74'}
                emissive={isTargeted ? '#2f8f6f' : '#000000'}
                emissiveIntensity={isTargeted ? 0.3 : 0}
                metalness={0.6}
                roughness={0.35}
              />
            </mesh>
          ))}
        </group>
      )}

      {type === 'badge' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <planeGeometry args={[0.14, 0.2]} />
          <meshStandardMaterial color={isTargeted ? '#dce8ff' : '#c7d6f0'} emissive={isTargeted ? '#3a5a9f' : '#000000'} emissiveIntensity={isTargeted ? 0.3 : 0} roughness={0.6} />
        </mesh>
      )}

      {type === 'phone' && (
        <group scale={0.9}>
          {/* Body */}
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.02, 0.16]} />
            <meshStandardMaterial color="#111318" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Screen glow (recovered Slack post) */}
          <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.066, 0.14]} />
            <meshStandardMaterial
              color={isTargeted ? '#eaf3ff' : '#9ec9ff'}
              emissive={isTargeted ? '#4a90ff' : '#2f6fd0'}
              emissiveIntensity={isTargeted ? 1.0 : 0.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}

      {type === 'mug' && (
        <group scale={0.9}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.045, 0.11, 20]} />
            <meshStandardMaterial color={isTargeted ? '#ffffff' : '#e8e4dc'} emissive={isTargeted ? '#3a3a2f' : '#000000'} emissiveIntensity={isTargeted ? 0.2 : 0} roughness={0.5} />
          </mesh>
          {/* Handle */}
          <mesh position={[0.055, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.028, 0.008, 8, 16, Math.PI]} />
            <meshStandardMaterial color={isTargeted ? '#ffffff' : '#e8e4dc'} roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* Crosshair target UI */}
      {isTargeted && (
        <Html position={[0, 0.3, 0]} center>
          <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/20 whitespace-nowrap pointer-events-none">
            <p className="font-bold">{name}</p>
            <p className="max-w-56 truncate text-xs text-gray-300">{description}</p>
            <p className="text-xs text-gray-500">Press E to Inspect</p>
          </div>
        </Html>
      )}
    </group>
  );
}
