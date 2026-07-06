import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/useGameStore';
import { getFloor } from '@/data/floors';
import { segmentToAABB } from '@/game/collision';
import Floor from '../environment/Floor';
import Furniture from '../environment/Furniture';
import { RoomSign } from '../environment/OfficeDecor';
import Bomb from '../objects/Bomb';
import Elevator from '../objects/Elevator';
import MissionClue from '../objects/MissionClue';
import MissionInteractable from '../objects/MissionInteractable';
import Hostage from '../objects/Hostage';
import InteractionSystem from '../objects/InteractionSystem';
import Enemy from '../combat/Enemy';
import PlayerController from '../player/PlayerController';
import PlayerCombat from '../combat/PlayerCombat';
import LivingOffice from './LivingOffice';

// Ticks the bomb countdown and lets enemies lose track of the player over time.
function MissionSystems() {
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const store = useGameStore.getState();
    if (store.gameState !== 'PLAYING' || store.missionStatus !== 'active') return;
    store.tickMission(delta);
    if (store.alerted && Date.now() - store.lastSeenAt > 6000) store.calmDown();
  });
  return null;
}

export default function BuildingScene() {
  const currentFloor = useGameStore((s) => s.currentFloor);
  const runEpoch = useGameStore((s) => s.runEpoch);

  const lightsOut = useGameStore((s) => s.lightsOut);
  const def = useMemo(() => getFloor(currentFloor), [currentFloor]);
  const walls = useMemo(() => def.walls.map(segmentToAABB), [def]);
  const t = def.theme;
  const dark = def.id === 3 || lightsOut; // Floor 3 is on emergency power; flicker drops the rest
  const spineLights = useMemo(() => {
    const out: number[] = [];
    for (let x = -def.size.w / 2 + 5; x < def.size.w / 2; x += 8) out.push(x);
    return out;
  }, [def.size.w]);

  return (
    <>
      <color attach="background" args={['#05070a']} />
      <fog attach="fog" args={['#05070a', dark ? 10 : 16, dark ? 34 : 55]} />

      {/* Moody base fill; the real light comes from the ceiling-fixture pools below */}
      <ambientLight intensity={dark ? 0.16 : 0.34} color={t.ambient} />
      <hemisphereLight args={[t.ceiling, t.floor, dark ? 0.18 : 0.36]} />
      <directionalLight position={[8, 14, 6]} intensity={dark ? 0.15 : 0.4} color={t.ambient} />

      {/* Corridor spine light pools */}
      {spineLights.map((x, i) => (
        <pointLight key={`s${i}`} position={[x, 3.0, 0]} intensity={dark ? 0.5 : 1.0} distance={12} color={dark ? t.accent : '#ffffff'} />
      ))}
      {/* One warm pool per room */}
      {def.rooms.map((r, i) => (
        <pointLight key={`r${i}`} position={[r.cx, 2.9, r.cz]} intensity={dark ? 0.4 : 0.85} distance={11} color={dark ? t.accent : t.ambient} />
      ))}

      {/* Floor + gameplay objects — remount fresh on floor change / mission restart */}
      <group key={`${currentFloor}-${runEpoch}`}>
        <Floor def={def} />
        <Furniture items={def.furniture} />
        {def.signs.map((s, i) => (
          <RoomSign
            key={i}
            position={[s.pos[0], 2.92, s.pos[1] + (s.pos[1] < 0 ? 0.32 : -0.32)]}
            rotation={[0, s.pos[1] < 0 ? 0 : Math.PI, 0]}
            label={s.label}
            accent={s.accent}
          />
        ))}
        <Elevator position={def.elevator} accent={t.accent} />
        <Bomb position={def.bomb} />
        {def.interactables.map((it) => (
          <MissionInteractable key={it.id} item={it} />
        ))}
        {def.clues.map((c) => (
          <MissionClue key={c.id} id={c.id} position={c.pos} label={c.label} text={c.text} />
        ))}
        {def.hostages.map((h) => (
          <Hostage key={h.id} id={h.id} position={h.pos} name={h.name} role={h.role} intel={h.intel} />
        ))}
        {def.enemies.map((e) => (
          <Enemy key={e.id} id={e.id} patrol={e.patrol} walls={walls} type={e.type} />
        ))}
      </group>

      <PlayerController />
      <PlayerCombat />
      <MissionSystems />
      <InteractionSystem />
      <LivingOffice />
    </>
  );
}
