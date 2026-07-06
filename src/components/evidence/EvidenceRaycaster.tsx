import { useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

const CENTER_SCREEN = new THREE.Vector2(0, 0);
const PICKUP_DISTANCE = 4.5;
const evidenceRaycaster = new THREE.Raycaster(undefined, undefined, 0, PICKUP_DISTANCE);

function findClueId(object: THREE.Object3D | null): string | null {
  let current = object;

  while (current) {
    if (typeof current.userData?.clueId === 'string') {
      return current.userData.clueId;
    }

    current = current.parent;
  }

  return null;
}

export default function EvidenceRaycaster() {
  const { camera, scene } = useThree();
  const setTargetedClue = useGameStore((state) => state.setTargetedClue);

  const collectTargetedClue = useCallback(() => {
    const { targetedClueId, cluesFound, addClue, setInspecting, isInspecting } = useGameStore.getState();
    if (!targetedClueId || isInspecting || cluesFound.includes(targetedClueId)) return;

    addClue(targetedClueId);
    setTargetedClue(null);
    setInspecting(true, targetedClueId);
  }, [setTargetedClue]);

  useFrame(() => {
    const { cluesFound, isInspecting, targetedClueId } = useGameStore.getState();

    if (isInspecting) {
      if (targetedClueId) setTargetedClue(null);
      return;
    }

    evidenceRaycaster.setFromCamera(CENTER_SCREEN, camera);

    const hits = evidenceRaycaster.intersectObjects(scene.children, true);
    const hit = hits.find((intersection) => {
      const clueId = findClueId(intersection.object);
      return clueId && !cluesFound.includes(clueId);
    });

    const nextTarget = hit ? findClueId(hit.object) : null;
    if (targetedClueId !== nextTarget) {
      setTargetedClue(nextTarget);
    }
  });

  useEffect(() => {
    // Collection is on E only — left-click is reserved for the weapon in Case 02,
    // and E keeps behaviour consistent across cases.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE' || event.repeat) return;
      collectTargetedClue();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [collectTargetedClue]);

  return null;
}
