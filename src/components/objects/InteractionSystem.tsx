import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { interactEntries, type InteractEntry } from '@/game/interactRegistry';

const MAX_RANGE = 7.5;   // prompts appear from well across a room
const CONE_DOT = 0.55;   // must be roughly looking at it (~57° half-angle)
const _fwd = new THREE.Vector3();
const _dir = new THREE.Vector3();

// Every frame, find the single interactable the player is looking at (within range +
// view cone) and publish it to the HUD. One prompt, no overlap. E triggers it.
export default function InteractionSystem() {
  const { camera } = useThree();
  const currentId = useRef<string | null>(null);
  const currentEntry = useRef<InteractEntry | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE' || e.repeat) return;
      const s = useGameStore.getState();
      // Blocked during overlays / when a mission has ended (idle is fine — that's Case 03).
      if (s.gameState !== 'PLAYING' || s.defusing || s.notebookOpen || s.isInspecting || s.missionStatus === 'failed' || s.missionStatus === 'complete') return;
      const entry = currentEntry.current;
      if (entry && entry.isActive()) entry.interact();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useFrame(() => {
    const s = useGameStore.getState();
    const blocked = s.gameState !== 'PLAYING' || s.defusing || s.notebookOpen || s.isInspecting || s.missionStatus === 'failed' || s.missionStatus === 'complete';
    if (blocked) {
      if (currentId.current !== null) {
        currentId.current = null;
        currentEntry.current = null;
        s.setInteractPrompt(null);
      }
      return;
    }

    camera.getWorldDirection(_fwd);
    let best: InteractEntry | null = null;
    let bestScore = -Infinity;

    for (const entry of interactEntries()) {
      if (!entry.isActive()) continue;
      _dir.set(entry.pos[0] - camera.position.x, entry.pos[1] - camera.position.y, entry.pos[2] - camera.position.z);
      const dist = _dir.length();
      if (dist > MAX_RANGE) continue;
      _dir.normalize();
      const dot = _dir.dot(_fwd);
      if (dot < CONE_DOT) continue;
      // Prefer what you're most directly looking at, then nearest.
      const score = dot - dist * 0.02;
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }

    currentEntry.current = best;
    const nextId = best?.id ?? null;
    if (nextId !== currentId.current) {
      currentId.current = nextId;
      s.setInteractPrompt(best ? { label: best.label, verb: best.verb } : null);
    }
  });

  return null;
}
