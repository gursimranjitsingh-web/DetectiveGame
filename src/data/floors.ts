import type { WallSegment } from '@/game/collision';

// ── The building ────────────────────────────────────────────────────────────
// Four hand-authored floors. Each is a set of real departments (rooms) of varied
// size arranged around a central corridor spine, with cross-corridor gaps between
// some rooms. Walls are generated per room with a door gap onto the spine, giving
// enclosed, stealth-friendly, collision-correct spaces that differ floor to floor.

export interface RoomInfo {
  index: number;
  cx: number;
  cz: number;
  w: number;
  d: number;
  row: 'top' | 'bottom';
  dept: string;
  accent: string;
}

// A distinct colour per department so rooms read differently at a glance.
export function deptColor(dept: string): string {
  const k = dept.toLowerCase();
  if (/reception/.test(k)) return '#3b82f6';
  if (/wait|lounge/.test(k)) return '#8b5cf6';
  if (/security/.test(k)) return '#ef4444';
  if (/front/.test(k)) return '#06b6d4';
  if (/back/.test(k)) return '#f59e0b';
  if (/meeting|conf|board/.test(k)) return '#a855f7';
  if (/pantry|coffee/.test(k)) return '#22c55e';
  if (/store|archive|cold/.test(k)) return '#94a3b8';
  if (/\bhr\b/.test(k)) return '#ec4899';
  if (/finance/.test(k)) return '#eab308';
  if (/qa|lab/.test(k)) return '#14b8a6';
  if (/server|network|devops|elec/.test(k)) return '#34d399';
  if (/cto|ceo|manager|exec/.test(k)) return '#f97316';
  return '#64748b';
}

export interface ClueSpot {
  id: string;
  pos: [number, number];
  label: string;
  text: string;
}

export type Archetype = 'patrol' | 'guard' | 'sniper' | 'leader' | 'engineer';

export interface EnemySpawn {
  id: string;
  patrol: [number, number][];
  type: Archetype;
}

export interface HostageSpot {
  id: string;
  pos: [number, number];
  name: string;
  role: string;
  intel: string;
}

export type FurnitureType =
  | 'desk' | 'chair' | 'monitor' | 'sofa' | 'cabinet' | 'locker' | 'reception'
  | 'conference' | 'coffee' | 'bookshelf' | 'plant' | 'printer' | 'serverRack'
  | 'whiteboard' | 'tv' | 'waterCooler' | 'crate' | 'counter' | 'deskPod';

export interface FurnitureSpec {
  type: FurnitureType;
  pos: [number, number];
  rot?: number;
}

export interface RoomSign {
  pos: [number, number];
  label: string;
  accent: string;
}

export type InteractKind = 'search' | 'computer' | 'bomb';

export interface Interactable {
  id: string;
  kind: InteractKind;
  pos: [number, number];
  label: string;
  /** For 'search'/'computer': text revealed. Undefined = empty (wastes time). */
  note?: string;
}

export interface DefuseConfig {
  wireColors: string[];
  cutSequence: number[];
  code: string;
  switchCount: number;
  switchTarget: boolean[];
}

export interface FloorTheme {
  floor: string;
  wall: string;
  accent: string;
  ambient: string;
  ceiling: string;
}

export interface FloorDef {
  id: number;
  name: string;
  theme: FloorTheme;
  size: { w: number; d: number };
  spawn: [number, number];
  elevator: [number, number];
  bomb: [number, number];
  walls: WallSegment[];
  rooms: RoomInfo[];
  clues: ClueSpot[];
  enemies: EnemySpawn[];
  defuse: DefuseConfig;
  furniture: FurnitureSpec[];
  signs: RoomSign[];
  interactables: Interactable[];
  hostages: HostageSpot[];
}

// ── Wall helpers (axis-aligned, with door gaps) ───────────────────────────────
function hWall(z: number, xStart: number, xEnd: number, gaps: { at: number; w: number }[] = [], t = 0.26): WallSegment[] {
  const segs: WallSegment[] = [];
  let cursor = xStart;
  for (const g of [...gaps].sort((a, b) => a.at - b.at)) {
    const gs = g.at - g.w / 2;
    const ge = g.at + g.w / 2;
    if (gs > cursor) segs.push({ x1: cursor, z1: z, x2: gs, z2: z, thickness: t });
    cursor = Math.max(cursor, ge);
  }
  if (cursor < xEnd) segs.push({ x1: cursor, z1: z, x2: xEnd, z2: z, thickness: t });
  return segs;
}

function vWall(x: number, zStart: number, zEnd: number, gaps: { at: number; w: number }[] = [], t = 0.26): WallSegment[] {
  const segs: WallSegment[] = [];
  let cursor = zStart;
  for (const g of [...gaps].sort((a, b) => a.at - b.at)) {
    const gs = g.at - g.w / 2;
    const ge = g.at + g.w / 2;
    if (gs > cursor) segs.push({ x1: x, z1: cursor, x2: x, z2: gs, thickness: t });
    cursor = Math.max(cursor, ge);
  }
  if (cursor < zEnd) segs.push({ x1: x, z1: cursor, x2: x, z2: zEnd, thickness: t });
  return segs;
}

// ── Furnishing ────────────────────────────────────────────────────────────────
// Places department-appropriate furniture inside a room. `inward` points away from
// the corridor (the door side), so desks sit at the back and the sign hangs by the door.
function furnishRoom(r: RoomInfo): { items: FurnitureSpec[]; sign: RoomSign } {
  const items: FurnitureSpec[] = [];
  const inward = r.row === 'top' ? -1 : 1;
  const backRel = inward * (r.d / 2 - 1.8);          // near the far wall (relative z)
  const corridorWallZ = r.cz - inward * (r.d / 2);   // wall the door sits in
  const faceCorridor = r.row === 'top' ? Math.PI : 0;
  const key = r.dept.toLowerCase();
  const add = (type: FurnitureType, dx: number, dzRel: number, rot = 0) =>
    items.push({ type, pos: [r.cx + dx, r.cz + dzRel], rot });

  if (/reception/.test(key)) {
    add('reception', 0, backRel, faceCorridor);
    add('plant', r.w / 2 - 1.4, backRel);
    add('plant', -r.w / 2 + 1.4, backRel);
    add('sofa', -r.w / 2 + 1.8, -inward * 0.5, Math.PI / 2);
  } else if (/wait|lounge/.test(key)) {
    add('sofa', -1.6, backRel, faceCorridor);
    add('sofa', 1.6, backRel, faceCorridor);
    add('counter', 0, -inward * 0.8);
    add('plant', r.w / 2 - 1.3, backRel);
    add('tv', 0, backRel + inward * 0.05);
  } else if (/security/.test(key)) {
    add('desk', 0, backRel, faceCorridor);
    add('chair', 0, backRel - inward * 0.9);
    add('tv', 0, backRel + inward * 0.05);
    add('cabinet', r.w / 2 - 1, backRel);
    add('monitor', -0.5, backRel, faceCorridor);
  } else if (/conference|boardroom|meeting/.test(key)) {
    add('conference', 0, 0);
    add('tv', 0, backRel);
    add('plant', -r.w / 2 + 1.3, backRel);
  } else if (/pantry|coffee/.test(key)) {
    add('counter', 0, backRel, 0);
    add('coffee', -1.2, backRel);
    add('waterCooler', r.w / 2 - 1.3, backRel);
    add('plant', -r.w / 2 + 1.3, backRel);
  } else if (/server|network/.test(key)) {
    add('serverRack', -2, backRel);
    add('serverRack', -0.7, backRel);
    add('serverRack', 0.6, backRel);
    add('serverRack', 1.9, backRel);
    add('serverRack', -1.4, backRel + inward * 1.5);
    add('serverRack', 0, backRel + inward * 1.5);
  } else if (/electrical/.test(key)) {
    add('cabinet', -1.2, backRel);
    add('cabinet', 0, backRel);
    add('cabinet', 1.2, backRel);
    add('serverRack', r.w / 2 - 1.4, backRel);
  } else if (/storage|archive|cold/.test(key)) {
    add('crate', -1.6, backRel);
    add('crate', -0.5, backRel);
    add('crate', -1.1, backRel + inward * 1.1);
    add('locker', r.w / 2 - 0.9, backRel);
    add('locker', r.w / 2 - 1.7, backRel);
    add('cabinet', 1.4, backRel);
  } else if (/cto|ceo|manager|exec/.test(key)) {
    add('desk', 0, backRel, faceCorridor);
    add('chair', 0, backRel - inward * 0.9);
    add('monitor', 0, backRel + inward * 0.05, faceCorridor);
    add('sofa', -r.w / 2 + 1.8, -inward * 0.3, Math.PI / 2);
    add('bookshelf', r.w / 2 - 0.8, backRel);
    add('plant', r.w / 2 - 1.3, -inward * (r.d / 2 - 1.6));
  } else {
    // Engineering / general workspace — a cubicle cluster.
    const span = Math.min(r.w / 4, 3);
    add('deskPod', -span, backRel, faceCorridor);
    add('deskPod', span, backRel, faceCorridor);
    add('deskPod', 0, backRel + inward * 2.6, faceCorridor);
    add('whiteboard', -r.w / 2 + 0.5, 0, Math.PI / 2);
    add('cabinet', r.w / 2 - 0.9, backRel);
    add('plant', r.w / 2 - 1.2, -inward * (r.d / 2 - 1.5));
  }

  return { items, sign: { pos: [r.cx, corridorWallZ], label: r.dept, accent: r.accent } };
}

// ── Floor authoring ───────────────────────────────────────────────────────────
interface RoomRect {
  label: string;
  dept: string;
  x0: number;
  x1: number;
  side: 'top' | 'bottom';
  doorW?: number;
}

interface FloorSpec {
  id: number;
  name: string;
  theme: FloorTheme;
  W: number;
  D: number;
  sc: number; // corridor half-width
  rooms: RoomRect[];
  bombRoom: string;
  clues: { room: string; label: string; text: string; corner?: number }[];
  enemyRooms: string[];
  defuse: DefuseConfig;
  /** The floor's key informant hostage — reveals the bomb location + keypad code. */
  informant: { name: string; role: string };
}

function makeFloor(spec: FloorSpec): FloorDef {
  const halfW = spec.W / 2;
  const halfD = spec.D / 2;
  const sc = spec.sc;
  const walls: WallSegment[] = [];

  // Perimeter
  walls.push({ x1: -halfW, z1: -halfD, x2: halfW, z2: -halfD, thickness: 0.5 });
  walls.push({ x1: -halfW, z1: halfD, x2: halfW, z2: halfD, thickness: 0.5 });
  walls.push({ x1: -halfW, z1: -halfD, x2: -halfW, z2: halfD, thickness: 0.5 });
  walls.push({ x1: halfW, z1: -halfD, x2: halfW, z2: halfD, thickness: 0.5 });

  const rooms: RoomInfo[] = [];
  const byLabel = new Map<string, RoomInfo>();

  spec.rooms.forEach((rr) => {
    const top = rr.side === 'top';
    const zOuter = top ? -halfD : halfD;
    const zSpine = top ? -sc : sc;
    const cx = (rr.x0 + rr.x1) / 2;
    const cz = (zOuter + zSpine) / 2;
    const w = rr.x1 - rr.x0;
    const d = Math.abs(zOuter - zSpine);
    const info: RoomInfo = { index: rooms.length, cx, cz, w, d, row: rr.side, dept: rr.dept, accent: deptColor(rr.dept) };
    rooms.push(info);
    byLabel.set(rr.label, info);

    // Spine-facing wall with a door gap
    walls.push(...hWall(zSpine, rr.x0, rr.x1, [{ at: cx, w: rr.doorW ?? 2.6 }]));
    // Side walls (full depth). Overlaps with neighbours/perimeter are harmless.
    walls.push(...vWall(rr.x0, Math.min(zOuter, zSpine), Math.max(zOuter, zSpine)));
    walls.push(...vWall(rr.x1, Math.min(zOuter, zSpine), Math.max(zOuter, zSpine)));
  });

  // Furniture + signs
  const furniture: FurnitureSpec[] = [];
  const signs: RoomSign[] = [];
  rooms.forEach((r) => {
    const { items, sign } = furnishRoom(r);
    furniture.push(...items);
    signs.push(sign);
  });

  const roomAt = (label: string): RoomInfo => byLabel.get(label) ?? rooms[rooms.length - 1];

  const bombRoom = roomAt(spec.bombRoom);
  const bomb: [number, number] = [bombRoom.cx + (bombRoom.w / 2 - 1.4), bombRoom.cz];

  // Interactables: a searchable object per room, plus the concealed bomb in the bomb room.
  const emptyLines = [
    'Just office supplies. Nothing useful.',
    'Empty. A waste of precious seconds.',
    'Old paperwork, nothing that helps.',
    'Locked, then empty. Great.',
  ];
  const computerLines = [
    'Email: "IT — the badge system is down on our floor since 9PM."',
    'Chat: "did you hear that noise near the server room??"',
    'Email: "All-hands moved to the boardroom. Stay at your desks."',
    'Sticky on monitor: "back in 5" — the seat is still warm.',
  ];
  const interactables: Interactable[] = [];
  rooms.forEach((r, i) => {
    const cornerX = r.cx + (r.w / 2 - 1.3); // right side (clue sits on the left)
    if (r === bombRoom) {
      interactables.push({ id: `f${spec.id}-bomb`, kind: 'bomb', pos: bomb, label: 'Suspicious Object' });
      return;
    }
    const kind: InteractKind = i % 3 === 1 ? 'computer' : 'search';
    // A couple of rooms hold intel pointing at the bomb's department.
    const intel = i % 4 === 2 ? `Overheard: "they were rigging something in ${bombRoom.dept}."` : undefined;
    interactables.push({
      id: `f${spec.id}-int-${i}`,
      kind,
      pos: [cornerX, r.cz],
      label: kind === 'computer' ? 'Workstation' : 'Cabinet',
      note: intel ?? (kind === 'computer' ? computerLines[i % computerLines.length] : (i % 2 === 0 ? emptyLines[i % emptyLines.length] : `Report: guard rotation covers ${r.dept} every few minutes.`)),
    });
  });

  const clues: ClueSpot[] = spec.clues.map((c, i) => {
    const r = roomAt(c.room);
    const cornerX = (c.corner ?? -1) * (r.w / 2 - 1.4);
    return { id: `f${spec.id}-clue-${i}`, pos: [r.cx + cornerX, r.cz], label: c.label, text: c.text };
  });

  // Guards patrol around their own room + the corridor stretch in front of it —
  // never all the way back to the elevator/spawn. Personalities cycle for variety.
  const archetypes: Archetype[] = ['patrol', 'guard', 'sniper', 'leader', 'engineer'];
  const enemies: EnemySpawn[] = spec.enemyRooms.map((label, i) => {
    const r = roomAt(label);
    const left = Math.max(r.cx - r.w / 2 + 1, -halfW + 8);
    const right = Math.min(r.cx + r.w / 2 - 1, halfW - 2);
    const type = archetypes[i % archetypes.length];
    // Guards hold their post; snipers watch the corridor; others rove.
    const patrol: [number, number][] =
      type === 'guard'
        ? [[r.cx, r.cz], [r.cx + 1.5, r.cz], [r.cx - 1.5, r.cz]]
        : type === 'sniper'
        ? [[r.cx, 0], [right, 0]]
        : [[r.cx, r.cz * 0.5], [r.cx, r.cz], [right, 0], [left, 0]];
    return { id: `f${spec.id}-guard-${i}`, patrol, type };
  });

  // Hostages: named office staff zip-tied in rooms that aren't the bomb room. The first
  // one on each floor is the key informant, who names the bomb's room and the keypad code.
  const staff = [
    { name: 'Mahi', role: 'Frontend Developer' },
    { name: 'Deepak', role: 'Backend Developer' },
    { name: 'Nitya', role: 'QA Engineer' },
    { name: 'Prateek', role: 'Designer' },
    { name: 'Keshav', role: 'IT Support' },
    { name: 'Dimple', role: 'DevOps Engineer' },
  ];
  const flavor = [
    'They came in through the service stairwell — there are more of them below.',
    'One of them had a long rifle. Careful in the open corridors.',
    'The leader never stops talking on his radio.',
    'They cut the badge readers first. That\'s how they took the whole floor.',
  ];
  const enemyRoomSet = new Set(spec.enemyRooms.map((l) => roomAt(l)));
  const hostageRooms = rooms.filter((r) => r !== bombRoom && !enemyRoomSet.has(r)).filter((_, i) => i % 2 === 0).slice(0, 3);
  const hostages: HostageSpot[] = hostageRooms.map((r, i) => {
    const pos: [number, number] = [r.cx - (r.w / 2 - 1.4), r.cz];
    if (i === 0) {
      // The informant — provides the actual defuse input.
      return {
        id: `f${spec.id}-hostage-${i}`,
        pos,
        name: spec.informant.name,
        role: spec.informant.role,
        intel: `"${spec.informant.name} (${spec.informant.role}): The bomb's in the ${bombRoom.dept}. And the keypad code is ${spec.defuse.code} — I watched them arm it."`,
      };
    }
    const s = staff[(spec.id * 2 + i) % staff.length];
    return {
      id: `f${spec.id}-hostage-${i}`,
      pos,
      name: s.name,
      role: s.role,
      intel: `"${s.name} (${s.role}): ${flavor[(spec.id + i) % flavor.length]}"`,
    };
  });

  return {
    id: spec.id,
    name: spec.name,
    theme: spec.theme,
    size: { w: spec.W, d: spec.D },
    spawn: [-halfW + 3.6, 0],
    elevator: [-halfW + 1.7, 0],
    bomb,
    walls,
    rooms,
    clues,
    enemies,
    defuse: spec.defuse,
    furniture,
    signs,
    interactables,
    hostages,
  };
}

export const FLOORS: FloorDef[] = [
  // ── Floor 1: small development office (tutorial) ──
  makeFloor({
    id: 1,
    name: 'Ground Floor — Reception & Dev Office',
    theme: { floor: '#3a3f47', wall: '#c9cdd6', accent: '#60a5fa', ambient: '#eef3ff', ceiling: '#e7e9ee' },
    W: 42, D: 28, sc: 2.6,
    rooms: [
      { label: 'rec', dept: 'Reception', x0: -21, x1: -11, side: 'top' },
      { label: 'fe', dept: 'Frontend Team', x0: -9, x1: 1, side: 'top' },
      { label: 'be', dept: 'Backend Team', x0: 3, x1: 13, side: 'top' },
      { label: 'sec', dept: 'Security', x0: 15, x1: 21, side: 'top' },
      { label: 'wait', dept: 'Waiting Lounge', x0: -21, x1: -13, side: 'bottom' },
      { label: 'meet', dept: 'Meeting Room', x0: -9, x1: 1, side: 'bottom' },
      { label: 'pantry', dept: 'Pantry', x0: 4, x1: 12, side: 'bottom' },
      { label: 'store', dept: 'Storage', x0: 14, x1: 21, side: 'bottom' },
    ],
    bombRoom: 'sec',
    clues: [
      { room: 'rec', label: 'Reception Log', text: 'Snip GREEN, then RED. Ignore the rest.', corner: -1 },
      { room: 'fe', label: 'Sticky Note', text: 'Vault keypad: 3 - 3 - 9 - 1', corner: 1 },
      { room: 'pantry', label: 'Fire Panel Card', text: 'Arming switch: LEFT up, RIGHT down.', corner: -1 },
    ],
    enemyRooms: ['fe', 'be', 'meet', 'sec'],
    informant: { name: 'Gagan', role: 'Project Manager' },
    defuse: { wireColors: ['red', 'blue', 'green', 'yellow'], cutSequence: [2, 0], code: '3391', switchCount: 2, switchTarget: [true, false] },
  }),

  // ── Floor 2: conference / finance / HR — bigger ──
  makeFloor({
    id: 2,
    name: 'Floor 2 — Finance, HR & Conference',
    theme: { floor: '#2b3340', wall: '#b3bccb', accent: '#38bdf8', ambient: '#e6efff', ceiling: '#d7deea' },
    W: 54, D: 30, sc: 2.8,
    rooms: [
      { label: 'rec', dept: 'Reception', x0: -27, x1: -18, side: 'top' },
      { label: 'hr', dept: 'HR', x0: -16, x1: -7, side: 'top' },
      { label: 'fin', dept: 'Finance', x0: -5, x1: 5, side: 'top' },
      { label: 'conf', dept: 'Conference Room', x0: 7, x1: 18, side: 'top' },
      { label: 'net', dept: 'Network Ops', x0: 20, x1: 27, side: 'top' },
      { label: 'fe', dept: 'Frontend Team', x0: -27, x1: -17, side: 'bottom' },
      { label: 'be', dept: 'Backend Team', x0: -15, x1: -4, side: 'bottom' },
      { label: 'qa', dept: 'QA Lab', x0: -2, x1: 8, side: 'bottom' },
      { label: 'meet', dept: 'Meeting Room', x0: 10, x1: 18, side: 'bottom' },
      { label: 'lounge', dept: 'Lounge', x0: 20, x1: 27, side: 'bottom' },
    ],
    bombRoom: 'fin',
    clues: [
      { room: 'hr', label: 'HR Memo', text: 'Cut BLUE, then WHITE, then RED.', corner: -1 },
      { room: 'conf', label: 'Projector Note', text: 'Server PIN: 7 - 0 - 4 - 2', corner: 1 },
      { room: 'be', label: 'Runbook Page', text: 'Switches ON: 1 and 3. Others OFF.', corner: -1 },
    ],
    enemyRooms: ['fin', 'qa', 'conf', 'hr', 'be'],
    informant: { name: 'Ayush', role: 'Engineering Manager' },
    defuse: { wireColors: ['red', 'blue', 'green', 'yellow', 'white'], cutSequence: [1, 4, 0], code: '7042', switchCount: 3, switchTarget: [true, false, true] },
  }),
];

export function getFloor(id: number): FloorDef {
  return FLOORS.find((f) => f.id === id) ?? FLOORS[0];
}

export const TOTAL_FLOORS = FLOORS.length;
