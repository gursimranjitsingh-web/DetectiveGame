import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-bold text-white text-xs">
    {children}
  </kbd>
);

/**
 * First-mission tutorial. Renders in-game (over the crime scene) the first time the
 * player enters Case 01, and stays out of the way afterwards. Releases the pointer
 * lock so the player can click "Got it", then re-captures the mouse on dismiss.
 */
export default function HowToPlayOverlay() {
  const gameState = useGameStore((state) => state.gameState);
  const activeCaseId = useGameStore((state) => state.activeCaseId);
  // runEpoch bumps on every fresh case start (resetCase), so a new Case 01 playthrough
  // gets a new epoch and the tutorial shows again — no reset-in-effect needed.
  const runEpoch = useGameStore((state) => state.runEpoch);
  const [dismissedEpoch, setDismissedEpoch] = useState<number | null>(null);

  const shouldShow =
    gameState === 'PLAYING' && activeCaseId === 'case-01' && dismissedEpoch !== runEpoch;

  // Free the cursor while the tutorial is up so the button is clickable.
  useEffect(() => {
    if (!shouldShow) return;
    Promise.resolve(document.exitPointerLock?.()).catch(() => {});
  }, [shouldShow]);

  if (!shouldShow) return null;

  const dismiss = () => {
    setDismissedEpoch(runEpoch);
    // Re-capture the mouse so look works immediately (this click is the user gesture).
    Promise.resolve(document.querySelector('canvas')?.requestPointerLock?.()).catch(() => {});
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto text-white p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-black/70 border border-white/15 rounded-xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-serif text-red-500 mb-1">How to Play</h2>
        <p className="text-sm text-gray-400 mb-6">Welcome, detective. Here&rsquo;s how to work the crime scene.</p>

        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-wider text-blue-300/80 mb-3">Controls</p>
          <ul className="flex flex-col gap-2 text-sm text-gray-300">
            <li className="flex items-center gap-3">
              <span className="flex gap-1 shrink-0">
                <Key>W</Key><Key>A</Key><Key>S</Key><Key>D</Key>
              </span>
              <span>Move around the crime scene</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="shrink-0"><Key>Mouse</Key></span>
              <span>Look around — <Key>Esc</Key> to release the cursor</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="shrink-0"><Key>Shift</Key></span>
              <span>Sprint</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="shrink-0"><Key>E</Key></span>
              <span>Inspect the highlighted clue you&rsquo;re looking at</span>
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-wider text-blue-300/80 mb-3">The investigation</p>
          <ol className="flex flex-col gap-2.5 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold shrink-0">1.</span>
              <span>Walk the room and look for clues. Your crosshair turns <span className="text-red-400 font-semibold">red</span> when a clue is in view — press <Key>E</Key> to collect it.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold shrink-0">2.</span>
              <span>Find <span className="text-white font-semibold">all 3 clues</span> (tracked at the top of the screen) to unlock the interrogation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold shrink-0">3.</span>
              <span>Question each suspect and present evidence to catch them in a lie.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold shrink-0">4.</span>
              <span>When the story falls apart, accuse the killer to close the case.</span>
            </li>
          </ol>
        </div>

        <button
          onClick={dismiss}
          className="w-full px-6 py-3 bg-red-900/50 hover:bg-red-800/80 border border-red-500/50 rounded-md text-lg transition-all"
        >
          Got it — Start Investigating
        </button>
      </div>
    </div>
  );
}
