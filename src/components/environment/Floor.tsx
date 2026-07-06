import React, { useMemo } from 'react';
import type { FloorDef } from '@/data/floors';

const WALL_HEIGHT = 3.3;

// Renders one floor's shell — floor slab, ceiling, walls, baseboards and ceiling light
// fixtures — in the floor's theme colours. Geometry only; lights live in the scene.
export default function Floor({ def }: { def: FloorDef }) {
  const { size, theme, walls, rooms, signs } = def;

  const wallBoxes = useMemo(
    () =>
      walls.map((seg, i) => {
        const t = seg.thickness ?? 0.26;
        const horizontal = Math.abs(seg.z2 - seg.z1) < Math.abs(seg.x2 - seg.x1);
        const length = horizontal ? Math.abs(seg.x2 - seg.x1) : Math.abs(seg.z2 - seg.z1);
        const cx = (seg.x1 + seg.x2) / 2;
        const cz = (seg.z1 + seg.z2) / 2;
        const w = horizontal ? length : t;
        const d = horizontal ? t : length;
        return { key: i, cx, cz, w, d, horizontal, length };
      }),
    [walls]
  );

  // Ceiling light fixtures: strung along the corridor spine + one per room.
  const fixtures = useMemo(() => {
    const list: { x: number; z: number }[] = [];
    const step = 6;
    for (let x = -size.w / 2 + step; x < size.w / 2; x += step) list.push({ x, z: 0 });
    rooms.forEach((r) => list.push({ x: r.cx, z: r.cz }));
    return list;
  }, [size.w, rooms]);

  return (
    <group>
      {/* Floor slab */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[size.w + 1, 0.1, size.d + 1]} />
        <meshStandardMaterial color={theme.floor} roughness={0.92} metalness={0.04} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, WALL_HEIGHT + 0.05, 0]} receiveShadow>
        <boxGeometry args={[size.w + 1, 0.1, size.d + 1]} />
        <meshStandardMaterial color={theme.ceiling} roughness={0.9} />
      </mesh>

      {/* Walls with a dark baseboard for grounding */}
      {wallBoxes.map((b) => (
        <group key={b.key}>
          <mesh position={[b.cx, WALL_HEIGHT / 2, b.cz]} castShadow receiveShadow>
            <boxGeometry args={[b.w, WALL_HEIGHT, b.d]} />
            <meshStandardMaterial color={theme.wall} roughness={0.85} metalness={0.03} />
          </mesh>
          <mesh position={[b.cx, 0.12, b.cz]}>
            <boxGeometry args={[b.w + 0.02, 0.24, b.d + 0.02]} />
            <meshStandardMaterial color="#1c2027" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Recessed ceiling light fixtures (emissive panels) */}
      {fixtures.map((f, i) => (
        <mesh key={i} position={[f.x, WALL_HEIGHT - 0.02, f.z]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 0.5]} />
          <meshStandardMaterial color="#ffffff" emissive={theme.ambient} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}

      {/* Per-room accent wall on the far side, so every department reads as its own colour */}
      {rooms.map((r, i) => {
        const inward = r.row === 'top' ? -1 : 1;
        const farZ = r.cz + inward * (r.d / 2 - 0.16);
        return (
          <mesh key={`acc${i}`} position={[r.cx, 1.7, farZ]} rotation={[0, r.row === 'top' ? 0 : Math.PI, 0]}>
            <planeGeometry args={[Math.max(2, r.w - 1.2), 2.4]} />
            <meshStandardMaterial color={r.accent} emissive={r.accent} emissiveIntensity={0.28} roughness={0.7} toneMapped={false} />
          </mesh>
        );
      })}

      {/* Doorframes, tinted per-room so each doorway is colour-coded to its department */}
      {signs.map((s, i) => (
        <group key={i} position={[s.pos[0], 0, s.pos[1]]}>
          <mesh position={[-1.4, 1.15, 0]} castShadow>
            <boxGeometry args={[0.16, 2.3, 0.4]} />
            <meshStandardMaterial color={s.accent} roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[1.4, 1.15, 0]} castShadow>
            <boxGeometry args={[0.16, 2.3, 0.4]} />
            <meshStandardMaterial color={s.accent} roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[0, 2.4, 0]} castShadow>
            <boxGeometry args={[2.96, 0.2, 0.4]} />
            <meshStandardMaterial color={s.accent} roughness={0.5} metalness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
