import React from 'react';
import Desk from './furniture/Desk';
import Chair from './furniture/Chair';
import Monitor from './furniture/Monitor';
import { Plant, Whiteboard, ServerRack, WaterCooler } from './OfficeDecor';
import type { FurnitureSpec } from '@/data/floors';

// New lightweight furniture pieces (boxes/primitives, themed) plus reuse of the
// existing furniture library. Keeps draw calls modest for a full office.

function Sofa() {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.4, 0.7]} />
        <meshStandardMaterial color="#2f3a4a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[1.6, 0.5, 0.15]} />
        <meshStandardMaterial color="#374559" roughness={0.9} />
      </mesh>
      <mesh position={[-0.78, 0.5, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.7]} />
        <meshStandardMaterial color="#374559" roughness={0.9} />
      </mesh>
      <mesh position={[0.78, 0.5, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.7]} />
        <meshStandardMaterial color="#374559" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Cabinet() {
  return (
    <group>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.5, 0.45]} />
        <meshStandardMaterial color="#8a8f98" roughness={0.5} metalness={0.4} />
      </mesh>
      {[1.15, 0.75, 0.35].map((y) => (
        <mesh key={y} position={[0, y, 0.24]}>
          <boxGeometry args={[0.7, 0.02, 0.02]} />
          <meshStandardMaterial color="#5b5f66" metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Locker() {
  return (
    <group>
      {[-0.24, 0.24].map((x) => (
        <mesh key={x} position={[x, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.44, 1.8, 0.45]} />
          <meshStandardMaterial color="#3f6d8a" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Reception() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 1.1, 0.7]} />
        <meshStandardMaterial color="#4a5568" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.12, 0.05]} castShadow>
        <boxGeometry args={[2.8, 0.08, 0.9]} />
        <meshStandardMaterial color="#1f2733" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[1.5, 0.55, 0.4]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.0, 1.1, 0.5]} />
        <meshStandardMaterial color="#4a5568" roughness={0.6} />
      </mesh>
    </group>
  );
}

function ConferenceTable() {
  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.1, 1.3]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[2.6, 0.72, 0.4]} />
        <meshStandardMaterial color="#2a1e14" roughness={0.7} />
      </mesh>
      {[-1.1, 0, 1.1].map((x) => (
        <React.Fragment key={x}>
          <Chair position={[x, 0, 1.0]} rotation={[0, Math.PI, 0]} />
          <Chair position={[x, 0, -1.0]} rotation={[0, 0, 0]} />
        </React.Fragment>
      ))}
    </group>
  );
}

function CoffeeMachine() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.8, 0.5]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.45]} />
        <meshStandardMaterial color="#1f2733" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.92, 0.23]}>
        <planeGeometry args={[0.2, 0.12]} />
        <meshStandardMaterial color="#8fe3ff" emissive="#3ba9d0" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Bookshelf() {
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.8, 0.35]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.7} />
      </mesh>
      {[1.5, 1.1, 0.7, 0.3].map((y, r) => (
        <mesh key={y} position={[0, y, 0.05]}>
          <boxGeometry args={[1.0, 0.28, 0.22]} />
          <meshStandardMaterial color={['#6b3f3f', '#3f5b6b', '#5b6b3f', '#5b3f6b'][r % 4]} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function TVScreen() {
  return (
    <group>
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[1.8, 1.0, 0.08]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.7, 0.05]}>
        <planeGeometry args={[1.7, 0.9]} />
        <meshStandardMaterial color="#12324f" emissive="#1f5f9c" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Crate() {
  return (
    <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshStandardMaterial color="#8a6a3f" roughness={0.9} />
    </mesh>
  );
}

function Counter() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.9, 0.6]} />
        <meshStandardMaterial color="#5b6470" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[2.1, 0.06, 0.66]} />
        <meshStandardMaterial color="#20262f" roughness={0.35} metalness={0.3} />
      </mesh>
    </group>
  );
}

function DeskPod() {
  return (
    <group>
      <Desk position={[0, 0, 0]} />
      <Chair position={[0, 0, 0.9]} rotation={[0, Math.PI, 0]} />
      <Monitor position={[0, 0.85, -0.2]} state="code" />
    </group>
  );
}

function Item({ spec }: { spec: FurnitureSpec }) {
  const [x, z] = spec.pos;
  const rot: [number, number, number] = [0, spec.rot ?? 0, 0];
  const p: [number, number, number] = [x, 0, z];

  switch (spec.type) {
    case 'desk': return <Desk position={p} rotation={rot} />;
    case 'chair': return <Chair position={p} rotation={rot} />;
    case 'monitor': return <group position={[x, 0.85, z]} rotation={rot}><Monitor state="code" /></group>;
    case 'deskPod': return <group position={p} rotation={rot}><DeskPod /></group>;
    case 'plant': return <Plant position={p} />;
    case 'whiteboard': return <group position={[x, 1.5, z]} rotation={rot}><Whiteboard position={[0, 0, 0]} /></group>;
    case 'serverRack': return <ServerRack position={p} rotation={rot} />;
    case 'waterCooler': return <WaterCooler position={p} />;
    case 'sofa': return <group position={p} rotation={rot}><Sofa /></group>;
    case 'cabinet': return <group position={p} rotation={rot}><Cabinet /></group>;
    case 'locker': return <group position={p} rotation={rot}><Locker /></group>;
    case 'reception': return <group position={p} rotation={rot}><Reception /></group>;
    case 'conference': return <group position={p} rotation={rot}><ConferenceTable /></group>;
    case 'coffee': return <group position={p} rotation={rot}><CoffeeMachine /></group>;
    case 'bookshelf': return <group position={p} rotation={rot}><Bookshelf /></group>;
    case 'tv': return <group position={p} rotation={rot}><TVScreen /></group>;
    case 'crate': return <group position={p} rotation={rot}><Crate /></group>;
    case 'counter': return <group position={p} rotation={rot}><Counter /></group>;
    case 'printer': return <group position={p} rotation={rot}><Cabinet /></group>;
    default: return null;
  }
}

export default function Furniture({ items }: { items: FurnitureSpec[] }) {
  return (
    <group>
      {items.map((spec, i) => (
        <Item key={i} spec={spec} />
      ))}
    </group>
  );
}
