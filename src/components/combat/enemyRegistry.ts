import * as THREE from 'three';

// A tiny module-level registry so the shooting raycaster can deal damage to enemies
// without routing every frame through React state. Enemies register on mount.
export interface EnemyHandle {
  id: string;
  getPosition: () => THREE.Vector3;
  isAlive: () => boolean;
  takeDamage: (amount: number) => void;
}

const enemies = new Map<string, EnemyHandle>();

export function registerEnemy(handle: EnemyHandle): () => void {
  enemies.set(handle.id, handle);
  return () => {
    enemies.delete(handle.id);
  };
}

export function getEnemy(id: string): EnemyHandle | undefined {
  return enemies.get(id);
}

export function livingEnemyCount(): number {
  let n = 0;
  enemies.forEach((e) => {
    if (e.isAlive()) n += 1;
  });
  return n;
}

export function enemyPositions(): { x: number; z: number; alive: boolean }[] {
  const out: { x: number; z: number; alive: boolean }[] = [];
  enemies.forEach((e) => {
    const p = e.getPosition();
    out.push({ x: p.x, z: p.z, alive: e.isAlive() });
  });
  return out;
}
