import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getCaseDefinition } from '@/data/cases';
import { Crosshair, Search } from 'lucide-react';
import MissionHUD from './MissionHUD';

export default function UIOverlay() {
  const gameState = useGameStore((state) => state.gameState);
  const activeCaseId = useGameStore((state) => state.activeCaseId);
  const cluesFound = useGameStore((state) => state.cluesFound);
  const isInspecting = useGameStore((state) => state.isInspecting);
  const inspectedObjectId = useGameStore((state) => state.inspectedObjectId);
  const targetedClueId = useGameStore((state) => state.targetedClueId);
  const targetedInteractId = useGameStore((state) => state.targetedInteractId);
  const interactPrompt = useGameStore((state) => state.interactPrompt);

  const caseDefinition = useMemo(() => getCaseDefinition(activeCaseId), [activeCaseId]);

  // Track mouse capture for the "click to look" hint (all cases use pointer-lock now).
  const [pointerLocked, setPointerLocked] = useState(false);
  useEffect(() => {
    const onChange = () => setPointerLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  // Press Enter to close the evidence inspect box (and re-capture the mouse).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Enter' && e.code !== 'NumpadEnter') return;
      const s = useGameStore.getState();
      if (s.isInspecting) {
        s.setInspecting(false, null);
        Promise.resolve(document.querySelector('canvas')?.requestPointerLock?.()).catch(() => {});
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Case 02 is the multi-floor bomb-defusal mission — its own HUD.
  if (activeCaseId === 'case-02') return <MissionHUD />;

  if (gameState !== 'PLAYING') return null;

  const totalClues = caseDefinition.evidenceItems.length;
  const currentClue = inspectedObjectId
    ? caseDefinition.evidenceItems.find((item) => item.id === inspectedObjectId)
    : null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
      {/* Top Bar: Clues Tracker */}
      <div className="w-full flex justify-center">
        <div className="bg-black/60 backdrop-blur-md text-white px-8 py-3 rounded-full border border-white/20 shadow-2xl flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-semibold tracking-wide">
              CLUES FOUND: {cluesFound.length} / {totalClues}
            </span>
          </div>
          {cluesFound.length === totalClues && (
            <button
              onClick={() => useGameStore.getState().setGameState('INTERROGATION')}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm pointer-events-auto transition-colors"
            >
              Start Interrogation
            </button>
          )}
        </div>
      </div>

      {/* Inspection overlay */}
      {isInspecting && currentClue && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 pointer-events-auto cursor-pointer"
          onClick={() => useGameStore.getState().setInspecting(false, null)}
        >
          <div
            className="bg-black/80 text-white p-8 rounded-xl border border-white/20 max-w-md text-center shadow-2xl cursor-default"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-3xl font-serif mb-3 text-red-500">{currentClue.name}</h2>
            {currentClue.foundAt && (
              <p className="text-xs uppercase tracking-widest text-amber-300/80 mb-4">Found at {currentClue.foundAt}</p>
            )}
            <p className="text-lg text-gray-300 italic mb-8">&ldquo;{currentClue.desc}&rdquo;</p>
            <p className="text-sm text-gray-500 mb-4">Added to your evidence file.</p>
            <button
              onClick={() => useGameStore.getState().setInspecting(false, null)}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-colors"
            >
              Close <span className="opacity-70">(Enter)</span>
            </button>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {!isInspecting && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-colors ${
            targetedClueId
              ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.95)]'
              : targetedInteractId
              ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.9)]'
              : 'text-white/50'
          }`}
        >
          <Crosshair className={`w-7 h-7 ${targetedClueId || targetedInteractId ? 'scale-110' : ''}`} />
        </div>
      )}

      {/* Shared interaction prompt (Case 03 clues) */}
      {!isInspecting && interactPrompt && (
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/75 border border-amber-400/40 rounded-lg px-4 py-2 shadow-xl">
          <span className="text-amber-100 font-semibold text-sm whitespace-nowrap">{interactPrompt.label}</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-300">
            <kbd className="px-1.5 py-0.5 rounded bg-white/15 border border-white/25 font-bold text-white">E</kbd>
            {interactPrompt.verb}
          </span>
        </div>
      )}

      {/* Click-to-look hint */}
      {!isInspecting && !pointerLocked && (
        <div className="absolute top-[54%] left-1/2 -translate-x-1/2 bg-black/70 border border-white/20 rounded-full px-4 py-2 text-sm text-white/90 animate-pulse">
          Click to look around · turn a full 360° · Esc to release
        </div>
      )}

      {/* Controls hint */}
      {!isInspecting && (
        <div className="self-end bg-black/50 backdrop-blur-md text-white/70 p-4 rounded-xl border border-white/10 shadow-2xl text-sm">
          <p>[W,A,S,D] Move · [Shift] Sprint</p>
          <p>[Mouse] Look 360° (click to capture)</p>
          <p>[E] Inspect Evidence</p>
        </div>
      )}
    </div>
  );
}
