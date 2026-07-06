// Lightweight 2D (XZ-plane) collision + line-of-sight used by the building floors.
// Walls are axis-aligned boxes (AABBs). The same list powers player wall-sliding and
// enemy line-of-sight, so there is one source of truth per floor.

export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface WallSegment {
  // Axis-aligned wall from (x1,z1) to (x2,z2) with a thickness.
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  thickness?: number;
}

export function segmentToAABB(seg: WallSegment): AABB {
  const t = (seg.thickness ?? 0.24) / 2;
  return {
    minX: Math.min(seg.x1, seg.x2) - t,
    maxX: Math.max(seg.x1, seg.x2) + t,
    minZ: Math.min(seg.z1, seg.z2) - t,
    maxZ: Math.max(seg.z1, seg.z2) + t,
  };
}

/** True if the point (x,z), grown by `radius`, overlaps any wall box. */
export function collidesAt(x: number, z: number, walls: AABB[], radius = 0.35): boolean {
  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    if (x > w.minX - radius && x < w.maxX + radius && z > w.minZ - radius && z < w.maxZ + radius) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve a desired move with wall sliding. Tries the X axis and Z axis
 * independently so the player slides along walls instead of sticking.
 * Returns the accepted position.
 */
export function resolveMove(
  fromX: number,
  fromZ: number,
  dx: number,
  dz: number,
  walls: AABB[],
  radius = 0.35
): [number, number] {
  let x = fromX;
  let z = fromZ;
  if (!collidesAt(x + dx, z, walls, radius)) x += dx;
  if (!collidesAt(x, z + dz, walls, radius)) z += dz;
  return [x, z];
}

// Slab method: does the segment (ax,az)->(bx,bz) intersect the box?
function segmentIntersectsAABB(ax: number, az: number, bx: number, bz: number, box: AABB): boolean {
  const dx = bx - ax;
  const dz = bz - az;
  let tmin = 0;
  let tmax = 1;

  // X slab
  if (Math.abs(dx) < 1e-8) {
    if (ax < box.minX || ax > box.maxX) return false;
  } else {
    let t1 = (box.minX - ax) / dx;
    let t2 = (box.maxX - ax) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  // Z slab
  if (Math.abs(dz) < 1e-8) {
    if (az < box.minZ || az > box.maxZ) return false;
  } else {
    let t1 = (box.minZ - az) / dz;
    let t2 = (box.maxZ - az) / dz;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

/** True if nothing blocks the straight line between the two points. */
export function hasLineOfSight(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  walls: AABB[]
): boolean {
  for (let i = 0; i < walls.length; i++) {
    if (segmentIntersectsAABB(ax, az, bx, bz, walls[i])) return false;
  }
  return true;
}
