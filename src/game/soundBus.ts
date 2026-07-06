// A tiny world-sound bus. The player emits sounds (gunfire is loud, footsteps quiet)
// and enemies poll it to decide whether to investigate. Kept out of React state.

interface WorldSound {
  x: number;
  z: number;
  loud: number; // effective radius the sound carries
  t: number;    // ms timestamp (performance.now)
}

const sounds: WorldSound[] = [];

export function emitSound(x: number, z: number, loud: number): void {
  sounds.push({ x, z, loud, t: performance.now() });
  if (sounds.length > 24) sounds.shift();
}

/**
 * The most recent audible sound within both the listener's hearing range and the
 * sound's own carry radius, in the last `sinceMs` ms. Returns its position or null.
 */
export function heardSound(
  lx: number,
  lz: number,
  hearRange: number,
  sinceMs = 1600
): { x: number; z: number } | null {
  const now = performance.now();
  for (let i = sounds.length - 1; i >= 0; i--) {
    const s = sounds[i];
    if (now - s.t > sinceMs) return null; // older entries are only older
    const d = Math.hypot(s.x - lx, s.z - lz);
    if (d < Math.min(hearRange, s.loud)) return { x: s.x, z: s.z };
  }
  return null;
}
