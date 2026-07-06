/* eslint-disable react-hooks/immutability */
import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useGameStore } from '@/store/useGameStore';
import { getCaseDefinition } from '@/data/cases';
import { getFloor } from '@/data/floors';
import { MANOR, MANOR_WALLS } from '@/data/manor';
import { resolveMove, segmentToAABB, type AABB } from '@/game/collision';
import { playerPose } from '@/game/playerPose';
import { emitSound } from '@/game/soundBus';

const WALK_SPEED = 2.3;
const SPRINT_SPEED = 3.8;
const PLAYER_RADIUS = 0.5;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export default function PlayerController() {
  const { camera, gl } = useThree();
  const keys = useKeyboard();
  const isInspecting = useGameStore((state) => state.isInspecting);
  const activeCaseId = useGameStore((state) => state.activeCaseId);
  const currentFloor = useGameStore((state) => state.currentFloor);
  const runEpoch = useGameStore((state) => state.runEpoch);
  const defusing = useGameStore((state) => state.defusing);
  const notebookOpen = useGameStore((state) => state.notebookOpen);
  const missionStatus = useGameStore((state) => state.missionStatus);
  const gameState = useGameStore((state) => state.gameState);
  const readingClue = useGameStore((state) => state.readingClue);
  const velocity = useRef(new THREE.Vector3());

  const isMission = activeCaseId === 'case-02';
  const isManor = activeCaseId === 'case-03';
  const useCollision = isMission || isManor;

  // Release the mouse whenever an overlay is open, we're inspecting a clue, or the
  // mission ends — so the cursor is free to click UI (inspect card, defuser, notebook, buttons).
  useEffect(() => {
    const freeMouse = isInspecting || !!readingClue || defusing || notebookOpen || gameState !== 'PLAYING' || missionStatus === 'failed' || missionStatus === 'complete';
    if (freeMouse && document.pointerLockElement) document.exitPointerLock?.();
  }, [isInspecting, readingClue, defusing, notebookOpen, gameState, missionStatus]);

  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const footstep = useRef(0);

  const caseDefinition = getCaseDefinition(activeCaseId);

  // Current floor's wall colliders (mission only).
  const walls = useMemo<AABB[]>(() => {
    if (isMission) return getFloor(currentFloor).walls.map(segmentToAABB);
    if (isManor) return MANOR_WALLS.map(segmentToAABB);
    return [];
  }, [isMission, isManor, currentFloor]);

  // Spawn / reset camera on case or floor change.
  useEffect(() => {
    if (isMission) {
      const floor = getFloor(currentFloor);
      camera.position.set(floor.spawn[0], 1.7, floor.spawn[1]);
      // Face into the building (down +x from the elevator on the left wall)
      euler.current.set(0, -Math.PI / 2, 0);
    } else if (isManor) {
      camera.position.set(MANOR.spawn[0], 1.7, MANOR.spawn[1]);
      euler.current.set(0, 0, 0); // face the hall (-z)
    } else {
      camera.position.set(...caseDefinition.cameraStart);
      euler.current.set(0, 0, 0);
    }
    camera.quaternion.setFromEuler(euler.current);
    velocity.current.set(0, 0, 0);
    // runEpoch is included so a same-floor mission restart also re-spawns the player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCaseId, currentFloor, runEpoch, camera]);

  useEffect(() => {
    const canvas = gl.domElement;

    const applyLook = (dx: number, dy: number) => {
      euler.current.y -= dx;
      euler.current.x -= dy;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    // All cases now use pointer-lock look (click to capture → full 360°).
    const handlePointerDown = () => {
      const store = useGameStore.getState();
      if (store.gameState === 'PLAYING' && !store.isInspecting && !store.readingClue && !store.defusing && !store.notebookOpen && document.pointerLockElement !== canvas) {
        // May reject in embedded/iframe contexts — swallow it (works in a normal tab).
        Promise.resolve(canvas.requestPointerLock?.()).catch(() => {});
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (document.pointerLockElement !== canvas) return;
      const store = useGameStore.getState();
      if (store.isInspecting || store.defusing || store.notebookOpen) return;
      applyLook((e.movementX || 0) * 0.0022, (e.movementY || 0) * 0.0022);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [camera, gl.domElement]);

  useFrame((_, rawDelta) => {
    if (isInspecting || defusing || notebookOpen) return;
    const delta = Math.min(rawDelta, 0.05);

    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    const forward = (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0);
    const right = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const speed = keys.sprint ? SPRINT_SPEED : WALK_SPEED;

    frontVector.set(0, 0, -forward);
    sideVector.set(right, 0, 0);
    direction
      .addVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed * delta);

    const movementEuler = new THREE.Euler(0, euler.current.y, 0, 'YXZ');
    direction.applyEuler(movementEuler);

    velocity.current.x += direction.x;
    velocity.current.z += direction.z;

    // No input + almost stopped → snap to a dead stop (kills any residual drift).
    if (forward === 0 && right === 0 && Math.hypot(velocity.current.x, velocity.current.z) < 0.02) {
      velocity.current.x = 0;
      velocity.current.z = 0;
    }

    if (useCollision) {
      // Collide + slide against the level's walls.
      const [nx, nz] = resolveMove(
        camera.position.x,
        camera.position.z,
        velocity.current.x,
        velocity.current.z,
        walls,
        PLAYER_RADIUS
      );
      // Kill velocity on the blocked axis so we don't tunnel next frame.
      if (Math.abs(nx - camera.position.x) < Math.abs(velocity.current.x) - 1e-4) velocity.current.x = 0;
      if (Math.abs(nz - camera.position.z) < Math.abs(velocity.current.z) - 1e-4) velocity.current.z = 0;
      camera.position.x = nx;
      camera.position.z = nz;
    } else {
      camera.position.x += velocity.current.x;
      camera.position.z += velocity.current.z;
      const { x: boundX, z: boundZ } = caseDefinition.playerBounds;
      camera.position.x = Math.max(-boundX, Math.min(boundX, camera.position.x));
      camera.position.z = Math.max(-boundZ, Math.min(boundZ, camera.position.z));
    }

    camera.position.y = 1.7;

    // Publish pose for the minimap (no React re-render).
    playerPose.x = camera.position.x;
    playerPose.z = camera.position.z;
    playerPose.angle = euler.current.y;

    // Footstep sounds — sprinting is louder and carries to nearby guards.
    if (isMission) {
      const speedMag = Math.hypot(velocity.current.x, velocity.current.z);
      if (speedMag > 0.008) {
        footstep.current -= delta;
        if (footstep.current <= 0) {
          footstep.current = keys.sprint ? 0.32 : 0.55;
          emitSound(camera.position.x, camera.position.z, keys.sprint ? 11 : 4.5);
        }
      }
    }
  });

  return null;
}
