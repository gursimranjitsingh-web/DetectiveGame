import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { registerEnemy } from './enemyRegistry';
import { hasLineOfSight, type AABB } from '@/game/collision';
import { heardSound } from '@/game/soundBus';
import { playEnemyShot } from '@/game/audio';
import type { Archetype } from '@/data/floors';

interface EnemyProps {
  id: string;
  patrol: [number, number][];
  walls: AABB[];
  type: Archetype;
}

const _to = new THREE.Vector3();
const _flat = new THREE.Vector3();
const PERIPHERAL = 3.0; // notices you point-blank regardless of facing

interface Stats {
  speed: number; sight: number; fov: number; fire: number;
  hear: number; dmg: number; acc: number; hp: number; keep: number;
}
const STATS: Record<Archetype, Stats> = {
  patrol:   { speed: 1.35, sight: 17, fov: 0.70, fire: 17, hear: 12, dmg: 5, acc: 0.50, hp: 45, keep: 6.5 },
  guard:    { speed: 0.95, sight: 17, fov: 1.00, fire: 15, hear: 10, dmg: 5, acc: 0.55, hp: 55, keep: 7.0 },
  sniper:   { speed: 0.8,  sight: 26, fov: 0.38, fire: 30, hear: 9,  dmg: 9, acc: 0.72, hp: 40, keep: 15 },
  leader:   { speed: 1.65, sight: 18, fov: 0.72, fire: 17, hear: 16, dmg: 6, acc: 0.55, hp: 60, keep: 6.0 },
  engineer: { speed: 1.25, sight: 14, fov: 0.60, fire: 13, hear: 10, dmg: 4, acc: 0.45, hp: 45, keep: 6.5 },
};
const BODY_COLOR: Record<Archetype, string> = {
  patrol: '#232630', guard: '#2a2320', sniper: '#20302a', leader: '#302028', engineer: '#25292f',
};
const FIRE_COOLDOWN = 1.35;

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export default function Enemy({ id, patrol, walls, type }: EnemyProps) {
  const s = STATS[type];
  const fovCos = Math.cos(s.fov);

  const group = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  const coneMat = useRef<THREE.MeshBasicMaterial>(null);
  const muzzle = useRef<THREE.Mesh>(null);
  const healthBar = useRef<THREE.Group>(null);
  const healthFill = useRef<THREE.Mesh>(null);

  const seed = hashSeed(id);
  const health = useRef(s.hp);
  const alive = useRef(true);
  const wp = useRef(0);
  const fireCd = useRef(seed * FIRE_COOLDOWN);
  const flash = useRef(0);
  const deadTime = useRef(0);
  const muzzleTimer = useRef(0);
  const facing = useRef(seed * Math.PI * 2);
  const investigate = useRef<{ x: number; z: number } | null>(null);
  const investigateTimer = useRef(0);

  const { camera } = useThree();
  const start = patrol[0] ?? [0, 0];
  const coneLen = s.sight;
  const coneR = useMemo(() => s.sight * Math.tan(s.fov), [s.sight, s.fov]);

  useEffect(() => {
    return registerEnemy({
      id,
      getPosition: () => group.current?.position ?? new THREE.Vector3(),
      isAlive: () => alive.current,
      takeDamage: (amount: number) => {
        if (!alive.current) return;
        health.current -= amount;
        flash.current = 0.15;
        useGameStore.getState().reportSighting();
        if (health.current <= 0) {
          alive.current = false;
          deadTime.current = 0;
          useGameStore.getState().registerKill();
        }
      },
    });
  }, [id]);

  useFrame((_, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);

    if (flash.current > 0) {
      flash.current = Math.max(0, flash.current - delta);
      if (bodyMat.current) {
        bodyMat.current.emissive.setRGB(flash.current > 0 ? 0.8 : 0, 0, 0);
        bodyMat.current.emissiveIntensity = flash.current > 0 ? 1 : 0;
      }
    }

    if (!alive.current) {
      deadTime.current += delta;
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -Math.PI / 2, 5, delta);
      g.position.y = THREE.MathUtils.damp(g.position.y, -0.5, 3, delta);
      if (coneMat.current) coneMat.current.opacity = 0;
      if (healthBar.current) healthBar.current.visible = false;
      if (deadTime.current > 1.4) g.visible = false;
      return;
    }

    const store = useGameStore.getState();
    const { gameState, missionStatus, alerted, defusing, floorStartAt } = store;
    const grace = Date.now() - floorStartAt < 6000;
    const active = gameState === 'PLAYING' && missionStatus === 'active' && !grace;

    // ── Perception ──
    _to.copy(camera.position).sub(g.position);
    _to.y = 0;
    const dist = _to.length();
    const dirToPlayer = dist > 0.0001 ? _to.clone().normalize() : new THREE.Vector3(0, 0, 1);

    let sees = false;
    if (active && dist < s.sight) {
      const facingVec = new THREE.Vector3(Math.sin(facing.current), 0, Math.cos(facing.current));
      const dot = facingVec.dot(dirToPlayer);
      const inCone = dot > fovCos || dist < PERIPHERAL;
      if (inCone && hasLineOfSight(g.position.x, g.position.z, camera.position.x, camera.position.z, walls)) {
        sees = true;
        store.reportSighting();
      }
    }

    // Hearing → investigate (only when not already hunting)
    if (active && !alerted) {
      const snd = heardSound(g.position.x, g.position.z, s.hear);
      if (snd) {
        investigate.current = snd;
        investigateTimer.current = 6;
      }
    }

    let state: 'alert' | 'investigate' | 'patrol' = 'patrol';

    // ── Movement ──
    if (active && alerted) {
      state = 'alert';
      const targetFacing = Math.atan2(dirToPlayer.x, dirToPlayer.z);
      facing.current = THREE.MathUtils.damp(facing.current, targetFacing, 8, delta);
      if (dist > s.keep) {
        _flat.copy(dirToPlayer).multiplyScalar(s.speed * 1.15 * delta);
        g.position.x += _flat.x;
        g.position.z += _flat.z;
      }
      fireCd.current -= delta;
      if (fireCd.current <= 0 && sees && dist < s.fire && !defusing) {
        fireCd.current = FIRE_COOLDOWN;
        muzzleTimer.current = 0.07;
        playEnemyShot();
        if (Math.random() < s.acc) store.damagePlayer(s.dmg);
      }
    } else if (active && investigate.current) {
      state = 'investigate';
      investigateTimer.current -= delta;
      const tx = investigate.current.x - g.position.x;
      const tz = investigate.current.z - g.position.z;
      const td = Math.hypot(tx, tz);
      if (td < 1.5 || investigateTimer.current <= 0) {
        investigate.current = null; // reached / gave up → resume patrol
      } else {
        g.position.x += (tx / td) * s.speed * delta;
        g.position.z += (tz / td) * s.speed * delta;
        facing.current = THREE.MathUtils.damp(facing.current, Math.atan2(tx, tz), 6, delta);
      }
    } else if (active) {
      const target = patrol[wp.current] ?? start;
      const tx = target[0] - g.position.x;
      const tz = target[1] - g.position.z;
      const td = Math.hypot(tx, tz);
      if (td < 0.4) {
        wp.current = (wp.current + 1) % patrol.length;
      } else {
        g.position.x += (tx / td) * s.speed * delta;
        g.position.z += (tz / td) * s.speed * delta;
        facing.current = THREE.MathUtils.damp(facing.current, Math.atan2(tx, tz), 6, delta);
      }
    }

    g.rotation.y = facing.current;

    if (coneMat.current) {
      const color = state === 'alert' ? 0xff4444 : state === 'investigate' ? 0xff8a3d : 0xffd24a;
      coneMat.current.color.setHex(color);
      coneMat.current.opacity = active ? (state === 'alert' ? 0.18 : state === 'investigate' ? 0.14 : 0.08) : 0;
    }

    if (muzzle.current) {
      muzzleTimer.current = Math.max(0, muzzleTimer.current - delta);
      (muzzle.current.material as THREE.MeshBasicMaterial).opacity = muzzleTimer.current > 0 ? 1 : 0;
    }

    if (healthBar.current && healthFill.current) {
      healthBar.current.quaternion.copy(camera.quaternion);
      const frac = Math.max(0, health.current / s.hp);
      healthFill.current.scale.x = frac;
      healthFill.current.position.x = -(1 - frac) * 0.3;
      healthBar.current.visible = health.current < s.hp && dist < s.sight + 6;
    }
  });

  return (
    <group ref={group} position={[start[0], 0.02, start[1]]} userData={{ enemyId: id }}>
      {/* Invisible, generous hitbox so center-screen shots register reliably at range */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.4, 2.3, 1.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      <mesh position={[-0.12, 0.45, 0]} castShadow>
        <boxGeometry args={[0.16, 0.9, 0.2]} />
        <meshStandardMaterial color="#14141a" roughness={0.8} />
      </mesh>
      <mesh position={[0.12, 0.45, 0]} castShadow>
        <boxGeometry args={[0.16, 0.9, 0.2]} />
        <meshStandardMaterial color="#14141a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial ref={bodyMat} color={BODY_COLOR[type]} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.68, 0]} castShadow>
        <boxGeometry args={[0.28, 0.3, 0.28]} />
        <meshStandardMaterial color="#c69a70" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.72, 0.145]}>
        <boxGeometry args={[0.29, 0.12, 0.02]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.5} />
      </mesh>
      {/* Beret/cap tinted by role so archetypes read at a glance */}
      <mesh position={[0, 1.87, 0]} castShadow>
        <boxGeometry args={[0.3, 0.08, 0.3]} />
        <meshStandardMaterial color={type === 'sniper' ? '#2f7d4f' : type === 'leader' ? '#b04a5a' : type === 'guard' ? '#8a6a2a' : '#3a3f4a'} roughness={0.6} />
      </mesh>
      <mesh position={[0.28, 1.2, 0.18]} castShadow>
        <boxGeometry args={[0.1, 0.1, type === 'sniper' ? 0.75 : 0.5]} />
        <meshStandardMaterial color="#1a1a20" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh ref={muzzle} position={[0.28, 1.2, type === 'sniper' ? 0.6 : 0.45]}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshBasicMaterial color="#ffd27f" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>

      <mesh position={[0, 1.0, coneLen / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[coneR, coneLen, 20, 1, true]} />
        <meshBasicMaterial ref={coneMat} color="#ffd24a" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <group ref={healthBar} position={[0, 2.2, 0]} visible={false}>
        <mesh>
          <planeGeometry args={[0.64, 0.1]} />
          <meshBasicMaterial color="#0a0a0a" transparent opacity={0.7} depthWrite={false} />
        </mesh>
        <mesh ref={healthFill} position={[0, 0, 0.001]}>
          <planeGeometry args={[0.6, 0.06]} />
          <meshBasicMaterial color="#ff3b3b" toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
