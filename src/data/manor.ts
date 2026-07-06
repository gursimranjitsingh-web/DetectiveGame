import type { WallSegment } from '@/game/collision';

// Blackwood Manor floor plan: a 3×3 grand-manor grid. Grand Hall at the centre, eight
// rooms around it, connected by wide archways so the player can roam the whole house.

export interface ManorRoom {
  id: string;
  name: string;
  cx: number;
  cz: number;
  w: number;
  d: number;
  accent: string;
}

export const MANOR = {
  size: { w: 44, d: 34 },
  wallHeight: 3.6,
  spawn: [0, 2.6] as [number, number],
  theme: { floor: '#4a4038', wall: '#6b5f52', ceiling: '#2a2824', ambient: '#f2e6cc' },
};

export const MANOR_ROOMS: ManorRoom[] = [
  { id: 'library', name: 'Library', cx: -14.5, cz: -11.25, w: 13.5, d: 10.5, accent: '#8b5e34' },
  { id: 'study', name: 'Study', cx: 0, cz: -11.25, w: 12.5, d: 10.5, accent: '#a83232' },
  { id: 'kitchen', name: 'Kitchen', cx: 14.5, cz: -11.25, w: 13.5, d: 10.5, accent: '#3f7d7d' },
  { id: 'dining', name: 'Dining Room', cx: -14.5, cz: 0, w: 13.5, d: 9.5, accent: '#9a6a2f' },
  { id: 'hall', name: 'Grand Hall', cx: 0, cz: 0, w: 12.5, d: 9.5, accent: '#b08d3c' },
  { id: 'bedroom', name: 'Master Bedroom', cx: 14.5, cz: 0, w: 13.5, d: 9.5, accent: '#6b4a8a' },
  { id: 'basement', name: 'Basement', cx: -14.5, cz: 11.25, w: 13.5, d: 10.5, accent: '#556070' },
  { id: 'greenhouse', name: 'Greenhouse', cx: 0, cz: 11.25, w: 12.5, d: 10.5, accent: '#3f8f4f' },
  { id: 'foyer', name: 'Foyer', cx: 14.5, cz: 11.25, w: 13.5, d: 10.5, accent: '#7a7a86' },
];

// Where the six living suspects stand in the grand hall, plus Eleanor's body.
export const MANOR_SUSPECT_SPOTS: Record<string, [number, number]> = {
  victor: [-4.5, -3],
  clara: [4.5, -3],
  daniel: [-4.5, 3.2],
  martha: [4.5, 3.2],
  reed: [-1.5, 4.3],
  oliver: [1.8, 4.3],
};
export const MANOR_BODY: [number, number] = [0, 0.2];

// ── Wall generation ────────────────────────────────────────────────────────
function hWall(z: number, x1: number, x2: number, gaps: { at: number; w: number }[] = [], t = 0.3): WallSegment[] {
  const segs: WallSegment[] = [];
  let c = x1;
  for (const g of [...gaps].sort((a, b) => a.at - b.at)) {
    const gs = g.at - g.w / 2;
    const ge = g.at + g.w / 2;
    if (gs > c) segs.push({ x1: c, z1: z, x2: gs, z2: z, thickness: t });
    c = Math.max(c, ge);
  }
  if (c < x2) segs.push({ x1: c, z1: z, x2: x2, z2: z, thickness: t });
  return segs;
}
function vWall(x: number, z1: number, z2: number, gaps: { at: number; w: number }[] = [], t = 0.3): WallSegment[] {
  const segs: WallSegment[] = [];
  let c = z1;
  for (const g of [...gaps].sort((a, b) => a.at - b.at)) {
    const gs = g.at - g.w / 2;
    const ge = g.at + g.w / 2;
    if (gs > c) segs.push({ x1: x, z1: c, x2: x, z2: gs, thickness: t });
    c = Math.max(c, ge);
  }
  if (c < z2) segs.push({ x1: x, z1: c, x2: x, z2: z2, thickness: t });
  return segs;
}

const halfW = MANOR.size.w / 2; // 22
const halfD = MANOR.size.d / 2; // 17
const DOOR = 3.4;
const rowCenters = [-11.25, 0, 11.25];
const colCenters = [-14.5, 0, 14.5];

export const MANOR_WALLS: WallSegment[] = [
  // Perimeter
  { x1: -halfW, z1: -halfD, x2: halfW, z2: -halfD, thickness: 0.5 },
  { x1: -halfW, z1: halfD, x2: halfW, z2: halfD, thickness: 0.5 },
  { x1: -halfW, z1: -halfD, x2: -halfW, z2: halfD, thickness: 0.5 },
  { x1: halfW, z1: -halfD, x2: halfW, z2: halfD, thickness: 0.5 },
  // Vertical partitions between the 3 columns, archways at each row centre
  ...vWall(-7, -halfD, halfD, rowCenters.map((z) => ({ at: z, w: DOOR }))),
  ...vWall(7, -halfD, halfD, rowCenters.map((z) => ({ at: z, w: DOOR }))),
  // Horizontal partitions between the 3 rows, archways at each column centre
  ...hWall(-5.5, -halfW, halfW, colCenters.map((x) => ({ at: x, w: DOOR }))),
  ...hWall(5.5, -halfW, halfW, colCenters.map((x) => ({ at: x, w: DOOR }))),
];
