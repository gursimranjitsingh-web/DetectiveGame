import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { getEnemy } from './enemyRegistry';
import { emitSound } from '@/game/soundBus';
import { playShot } from '@/game/audio';

const CENTER = new THREE.Vector2(0, 0);
const SHOT_RANGE = 120; // reach clear across any floor
const SHOT_DAMAGE = 20;
const raycaster = new THREE.Raycaster(undefined, undefined, 0, SHOT_RANGE);
const _impact = new THREE.Vector3();

function findEnemyId(object: THREE.Object3D | null): string | null {
  let current = object;
  while (current) {
    if (typeof current.userData?.enemyId === 'string') return current.userData.enemyId;
    current = current.parent;
  }
  return null;
}

function isViewmodel(object: THREE.Object3D | null): boolean {
  let current = object;
  while (current) {
    if (current.userData?.viewmodel) return true;
    current = current.parent;
  }
  return false;
}

// The player's sidearm: a camera-locked viewmodel plus hitscan shooting.
// Left-click (a tap, not a look-drag) fires; R reloads. Evidence/doors are on E.
export default function PlayerCombat() {
  const { camera, scene } = useThree();
  const gun = useRef<THREE.Group>(null);
  const muzzleFlash = useRef<THREE.Mesh>(null);
  const muzzleLight = useRef<THREE.PointLight>(null);
  const impact = useRef<THREE.Mesh>(null);

  const recoil = useRef(0);
  const muzzleTimer = useRef(0);
  const impactTimer = useRef(0);

  const shoot = () => {
    const { gameState, isInspecting, defusing, notebookOpen, missionStatus, fireWeapon } = useGameStore.getState();
    if (gameState !== 'PLAYING' || isInspecting || defusing || notebookOpen || missionStatus === 'failed' || missionStatus === 'complete') return;
    if (!fireWeapon()) return; // empty magazine

    recoil.current = 1;
    muzzleTimer.current = 0.06;
    playShot();
    // Gunfire is loud — nearby guards will investigate / be alerted.
    emitSound(camera.position.x, camera.position.z, 32);

    raycaster.setFromCamera(CENTER, camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    let impactPoint: THREE.Vector3 | null = null;
    for (const hit of hits) {
      if (isViewmodel(hit.object)) continue;
      const enemyId = findEnemyId(hit.object);
      if (enemyId) {
        const enemy = getEnemy(enemyId);
        if (enemy && enemy.isAlive()) {
          enemy.takeDamage(SHOT_DAMAGE);
          impactPoint = hit.point.clone();
        }
        break;
      }
      // First solid non-enemy surface — spark on the wall/desk.
      impactPoint = hit.point.clone();
      break;
    }

    if (impactPoint && impact.current) {
      _impact.copy(impactPoint);
      impact.current.position.copy(_impact);
      impactTimer.current = 0.12;
    }
  };

  useEffect(() => {
    // Q fires, R reloads. Left-drag is look-only (handled by PlayerController).
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'KeyQ') shoot();
      else if (e.code === 'KeyR') useGameStore.getState().reloadWeapon();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, scene]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const g = gun.current;
    const playing = useGameStore.getState().gameState === 'PLAYING';

    if (g) {
      g.visible = playing;
      // Lock the viewmodel to the camera, offset to lower-right.
      g.position.copy(camera.position);
      g.quaternion.copy(camera.quaternion);
      g.translateX(0.22);
      g.translateY(-0.2);
      g.translateZ(-0.55 + recoil.current * 0.08);
      g.rotateX(recoil.current * 0.15);
      recoil.current = Math.max(0, recoil.current - delta * 6);
    }

    if (muzzleFlash.current) {
      muzzleTimer.current = Math.max(0, muzzleTimer.current - delta);
      const m = muzzleFlash.current.material as THREE.MeshBasicMaterial;
      m.opacity = muzzleTimer.current > 0 ? 1 : 0;
      muzzleFlash.current.rotation.z += 0.5;
    }
    if (muzzleLight.current) {
      muzzleLight.current.intensity = muzzleTimer.current > 0 ? 6 : 0;
    }
    if (impact.current) {
      impactTimer.current = Math.max(0, impactTimer.current - delta);
      const m = impact.current.material as THREE.MeshBasicMaterial;
      m.opacity = impactTimer.current > 0 ? impactTimer.current / 0.12 : 0;
    }
  });

  return (
    <>
      {/* Camera-locked gun viewmodel */}
      <group ref={gun} userData={{ viewmodel: true }}>
        {/* Slide / body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.09, 0.34]} />
          <meshStandardMaterial color="#1b1c22" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Barrel */}
        <mesh position={[0, 0.015, -0.22]}>
          <boxGeometry args={[0.035, 0.045, 0.16]} />
          <meshStandardMaterial color="#0e0e12" roughness={0.35} metalness={0.8} />
        </mesh>
        {/* Grip */}
        <mesh position={[0, -0.13, 0.1]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.055, 0.18, 0.08]} />
          <meshStandardMaterial color="#26130c" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Muzzle flash */}
        <mesh ref={muzzleFlash} position={[0, 0.015, -0.32]}>
          <planeGeometry args={[0.16, 0.16]} />
          <meshBasicMaterial color="#ffd98a" transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
        <pointLight ref={muzzleLight} position={[0, 0.02, -0.34]} intensity={0} distance={4} color="#ffce7a" />
      </group>

      {/* Bullet impact spark (world-space, moved to the hit point) */}
      <mesh ref={impact} position={[0, -100, 0]} userData={{ viewmodel: true }}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshBasicMaterial color="#fff1c2" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </>
  );
}
