import { useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

const CENTER_SCREEN = new THREE.Vector2(0, 0);
const REACH_DISTANCE = 3.5;
const interactionRaycaster = new THREE.Raycaster(undefined, undefined, 0, REACH_DISTANCE);

function findInteractId(object: THREE.Object3D | null): string | null {
  let current = object;

  while (current) {
    if (typeof current.userData?.interactId === 'string') {
      return current.userData.interactId;
    }
    current = current.parent;
  }

  return null;
}

// Handles doors and drawers - a separate raycaster from EvidenceRaycaster since these toggle
// open/closed instead of being collected, and can be targeted even after nearby clues are found.
export default function InteractionRaycaster() {
  const { camera, scene } = useThree();
  const setTargetedInteract = useGameStore((state) => state.setTargetedInteract);

  const triggerInteraction = useCallback(() => {
    const { targetedInteractId, isInspecting, toggleInteractable } = useGameStore.getState();
    if (!targetedInteractId || isInspecting) return;
    toggleInteractable(targetedInteractId);
  }, []);

  useFrame(() => {
    const { isInspecting, targetedInteractId, targetedClueId } = useGameStore.getState();

    if (isInspecting || targetedClueId) {
      if (targetedInteractId) setTargetedInteract(null);
      return;
    }

    interactionRaycaster.setFromCamera(CENTER_SCREEN, camera);

    const hits = interactionRaycaster.intersectObjects(scene.children, true);
    const hit = hits.find((intersection) => findInteractId(intersection.object));

    const nextTarget = hit ? findInteractId(hit.object) : null;
    if (targetedInteractId !== nextTarget) {
      setTargetedInteract(nextTarget);
    }
  });

  useEffect(() => {
    // Doors/drawers open on E only — left-click is the weapon in Case 02.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE' || event.repeat) return;
      triggerInteraction();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerInteraction]);

  return null;
}
