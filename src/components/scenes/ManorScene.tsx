import React, { useMemo } from 'react';
import PlayerController from '../player/PlayerController';
import GLBModel from '../models/GLBModel';
import ManorClue from '../objects/ManorClue';
import InteractionSystem from '../objects/InteractionSystem';
import { RoomSign } from '../environment/OfficeDecor';
import { case03 } from '@/data/cases/case03';
import { MANOR, MANOR_ROOMS, MANOR_WALLS, MANOR_BODY, type ManorRoom } from '@/data/manor';

const WH = MANOR.wallHeight;
const FURN = '/models/furniture/';
const FSCALE = 2.3; // Kenney furniture kit is modelled small; scale up to human size

type Vec3 = [number, number, number];

// A Kenney furniture model. `scale` is a multiplier on the global FSCALE.
function F({ file, pos, rot = 0, scale = 1, fb }: { file: string; pos: Vec3; rot?: number; scale?: number; fb?: React.ReactNode }) {
  return <GLBModel url={`${FURN}${file}`} position={pos} rotation={[0, rot, 0]} scale={FSCALE * scale} fallback={fb} />;
}

function Walls() {
  const boxes = useMemo(
    () =>
      MANOR_WALLS.map((seg, i) => {
        const t = seg.thickness ?? 0.3;
        const horizontal = Math.abs(seg.z2 - seg.z1) < Math.abs(seg.x2 - seg.x1);
        const len = horizontal ? Math.abs(seg.x2 - seg.x1) : Math.abs(seg.z2 - seg.z1);
        return { key: i, cx: (seg.x1 + seg.x2) / 2, cz: (seg.z1 + seg.z2) / 2, w: horizontal ? len : t, d: horizontal ? t : len };
      }),
    []
  );
  return (
    <group>
      {boxes.map((b) => (
        <mesh key={b.key} position={[b.cx, WH / 2, b.cz]} castShadow receiveShadow>
          <boxGeometry args={[b.w, WH, b.d]} />
          <meshStandardMaterial color={MANOR.theme.wall} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function RoomFurniture({ room }: { room: ManorRoom }) {
  const { id, cx, cz } = room;
  const P = (dx: number, dz: number, y = 0): Vec3 => [cx + dx, y, cz + dz];
  switch (id) {
    case 'library':
      return (
        <group>
          <F file="bookcaseClosedWide.glb" pos={P(-4, -4)} rot={0} />
          <F file="bookcaseClosedWide.glb" pos={P(0, -4)} rot={0} />
          <F file="bookcaseClosedWide.glb" pos={P(4, -4)} rot={0} />
          <F file="loungeChair.glb" pos={P(-3, 2)} rot={Math.PI} />
          <F file="loungeChair.glb" pos={P(3, 2)} rot={Math.PI} />
          <F file="tableCoffee.glb" pos={P(0, 2)} />
          <F file="lampRoundFloor.glb" pos={P(5, 3)} />
        </group>
      );
    case 'study':
      return (
        <group>
          <F file="desk.glb" pos={P(-1, -0.5)} rot={Math.PI} />
          <F file="chairDesk.glb" pos={P(-1, 1)} />
          <F file="computerScreen.glb" pos={P(-1, -0.5, 0.75)} rot={Math.PI} />
          <F file="bookcaseClosed.glb" pos={P(4, -4)} />
          <F file="trashcan.glb" pos={P(-4, 2)} />
          {/* Safe (no model provided) */}
          <mesh position={P(2.4, -3.6, 0.4)} castShadow><boxGeometry args={[0.9, 0.9, 0.7]} /><meshStandardMaterial color="#2a2f36" roughness={0.5} metalness={0.4} /></mesh>
        </group>
      );
    case 'kitchen':
      return (
        <group>
          <F file="kitchenStove.glb" pos={P(-3, -4)} />
          <F file="kitchenCabinet.glb" pos={P(-1.5, -4)} />
          <F file="kitchenSink.glb" pos={P(0, -4)} />
          <F file="kitchenFridge.glb" pos={P(3.5, -4)} />
          <F file="kitchenBar.glb" pos={P(0, 1.5)} />
          <F file="stoolBar.glb" pos={P(-1, 3)} rot={Math.PI} />
          <F file="stoolBar.glb" pos={P(1, 3)} rot={Math.PI} />
        </group>
      );
    case 'dining':
      return (
        <group>
          <F file="tableCloth.glb" pos={P(0, 0)} scale={1.2} />
          <F file="chair.glb" pos={P(-1.4, 1.4)} rot={Math.PI} />
          <F file="chair.glb" pos={P(0, 1.4)} rot={Math.PI} />
          <F file="chair.glb" pos={P(1.4, 1.4)} rot={Math.PI} />
          <F file="chair.glb" pos={P(-1.4, -1.4)} />
          <F file="chair.glb" pos={P(0, -1.4)} />
          <F file="chair.glb" pos={P(1.4, -1.4)} />
        </group>
      );
    case 'hall':
      return (
        <group>
          <F file="lampSquareCeiling.glb" pos={P(0, 0, WH - 0.1)} />
          <F file="loungeSofa.glb" pos={P(-4, -3)} rot={0} />
          <F file="loungeSofa.glb" pos={P(4, -3)} rot={0} />
          <F file="tableCoffee.glb" pos={P(0, -3)} />
          <F file="pottedPlant.glb" pos={P(-5, 3)} />
          <F file="pottedPlant.glb" pos={P(5, 3)} />
        </group>
      );
    case 'bedroom':
      return (
        <group>
          <F file="bedDouble.glb" pos={P(0, -2)} rot={0} scale={1.1} />
          <F file="sideTableDrawers.glb" pos={P(-2.2, -3.5)} />
          <F file="lampSquareTable.glb" pos={P(-2.2, -3.5, 0.7)} />
          <F file="cabinetTelevisionDoors.glb" pos={P(0, 3.5)} rot={Math.PI} />
        </group>
      );
    case 'basement':
      return (
        <group>
          <F file="cardboardBoxClosed.glb" pos={P(-3, -3)} />
          <F file="cardboardBoxOpen.glb" pos={P(-2, -3.5)} />
          <F file="cardboardBoxClosed.glb" pos={P(-2.3, -2.4)} />
          <F file="washerDryerStacked.glb" pos={P(3, -4)} />
          {/* Security console (footage deleted here) */}
          <mesh position={P(4.5, 3, 0.6)} castShadow><boxGeometry args={[1.2, 1.2, 0.5]} /><meshStandardMaterial color="#20262e" roughness={0.4} /></mesh>
          <F file="computerScreen.glb" pos={P(4.5, 3, 1.2)} rot={Math.PI} />
        </group>
      );
    case 'greenhouse':
      return (
        <group>
          <F file="pottedPlant.glb" pos={P(-4, -3)} scale={1.3} />
          <F file="pottedPlant.glb" pos={P(4, -3)} scale={1.3} />
          <F file="plantSmall1.glb" pos={P(-4, 3)} />
          <F file="plantSmall2.glb" pos={P(0, 3)} />
          <F file="plantSmall3.glb" pos={P(4, 3)} />
          <F file="benchCushion.glb" pos={P(0, 0)} rot={Math.PI} />
        </group>
      );
    case 'foyer':
      return (
        <group>
          <F file="coatRackStanding.glb" pos={P(-4, -3)} />
          <F file="bench.glb" pos={P(0, -3)} />
          <F file="sideTable.glb" pos={P(4, -3)} />
          <F file="lampRoundTable.glb" pos={P(4, -3, 0.7)} />
          <F file="rugRound.glb" pos={P(0, 2)} />
        </group>
      );
    default:
      return null;
  }
}

function RoomLabels() {
  const halfW = MANOR.size.w / 2;
  const halfD = MANOR.size.d / 2;
  return (
    <>
      {MANOR_ROOMS.filter((r) => r.id !== 'hall').map((r) => {
        let pos: Vec3;
        let rot: Vec3;
        if (r.cz < -1) { pos = [r.cx, 2.7, -halfD + 0.3]; rot = [0, 0, 0]; }
        else if (r.cz > 1) { pos = [r.cx, 2.7, halfD - 0.3]; rot = [0, Math.PI, 0]; }
        else if (r.cx < 0) { pos = [-halfW + 0.3, 2.7, r.cz]; rot = [0, Math.PI / 2, 0]; }
        else { pos = [halfW - 0.3, 2.7, r.cz]; rot = [0, -Math.PI / 2, 0]; }
        return (
          <group key={r.id}>
            <RoomSign position={pos} rotation={rot} label={r.name} accent={r.accent} />
            <mesh position={[r.cx, 0.02, r.cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[r.w * 0.6, r.d * 0.6]} />
              <meshStandardMaterial color={r.accent} roughness={0.95} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export default function ManorScene() {
  const t = MANOR.theme;
  return (
    <>
      <color attach="background" args={['#0a0a10']} />
      <fog attach="fog" args={['#0a0a10', 16, 48]} />

      <ambientLight intensity={0.75} color={t.ambient} />
      <hemisphereLight args={[t.ceiling, t.floor, 0.55]} />
      <directionalLight position={[10, 16, -8]} intensity={0.5} color="#9fb4d8" />
      {MANOR_ROOMS.map((r) => (
        <pointLight key={r.id} position={[r.cx, WH - 0.6, r.cz]} intensity={r.id === 'hall' ? 3.0 : 2.2} distance={18} color="#ffe2b0" />
      ))}

      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[MANOR.size.w + 1, 0.1, MANOR.size.d + 1]} />
        <meshStandardMaterial color={t.floor} roughness={0.9} />
      </mesh>
      <mesh position={[0, WH + 0.05, 0]} receiveShadow>
        <boxGeometry args={[MANOR.size.w + 1, 0.1, MANOR.size.d + 1]} />
        <meshStandardMaterial color={t.ceiling} roughness={0.95} />
      </mesh>
      <Walls />
      <RoomLabels />
      {MANOR_ROOMS.map((r) => (
        <RoomFurniture key={r.id} room={r} />
      ))}

      {/* Eleanor's body + chalk outline */}
      <group position={[MANOR_BODY[0], 0, MANOR_BODY[1]]}>
        <mesh position={[0, 0.12, 0]} rotation={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.5, 0.24, 1.7]} />
          <meshStandardMaterial color="#3a2a34" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.25, 24]} />
          <meshBasicMaterial color="#e8e8e8" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* (Suspect characters removed — Quaternius base bodies are undressed and the idle
          clip looked wrong. Interrogation still lists all suspects via the UI.) */}

      {/* Clues via the shared interaction system */}
      {case03.evidenceItems.map((item) => (
        <ManorClue key={item.id} id={item.id} name={item.name} type={item.type} position={item.position} rotation={item.rotation} />
      ))}

      <InteractionSystem />
      <PlayerController />
    </>
  );
}
