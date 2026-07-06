import React, { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getFloor, TOTAL_FLOORS } from '@/data/floors';
import { getCaseDefinition } from '@/data/cases';
import { BookOpen, Check, Radio, MapPin, FileText, X } from 'lucide-react';

export default function Notebook() {
  const currentFloor = useGameStore((s) => s.currentFloor);
  const cluesFound = useGameStore((s) => s.cluesFound);
  const missionNotes = useGameStore((s) => s.missionNotes);
  const radioLog = useGameStore((s) => s.radioLog);
  const bombRevealed = useGameStore((s) => s.bombRevealed);
  const floorDefused = useGameStore((s) => s.floorDefused);
  const floorsCleared = useGameStore((s) => s.floorsCleared);
  const hostagesSaved = useGameStore((s) => s.hostagesSaved);

  const def = useMemo(() => getFloor(currentFloor), [currentFloor]);
  const objectives = getCaseDefinition('case-02').objectives ?? [];

  const bombStatus = floorDefused ? 'Defused ✓' : bombRevealed ? 'Located — defuse it' : 'Not yet located';

  return (
    <div
      className="absolute inset-0 z-[62] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto"
      onClick={() => useGameStore.getState().toggleNotebook()}
    >
      <div
        className="w-full max-w-4xl h-[80vh] bg-[#1a1712] border border-amber-900/40 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '100% 28px' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-black/20">
          <h2 className="text-2xl font-serif text-amber-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Field Notebook
          </h2>
          <button onClick={() => useGameStore.getState().toggleNotebook()} className="text-amber-200/70 hover:text-white flex items-center gap-1 text-sm">
            <X className="w-4 h-4" /> Close (N)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5 p-6 overflow-y-auto text-amber-50/90">
          {/* Objectives + progress */}
          <section>
            <h3 className="text-sm uppercase tracking-widest text-amber-300/70 mb-2 flex items-center gap-1.5"><Check className="w-4 h-4" /> Objectives</h3>
            <ul className="space-y-1.5 text-sm">
              {objectives.map((o, i) => (
                <li key={i} className="flex gap-2"><span className="text-amber-500">›</span><span>{o}</span></li>
              ))}
            </ul>
            <div className="mt-4 text-sm space-y-1 text-amber-100/80">
              <p><span className="text-amber-300/70">Floor:</span> {currentFloor} / {TOTAL_FLOORS} — {def.name}</p>
              <p><span className="text-amber-300/70">Floors cleared:</span> {floorsCleared} / {TOTAL_FLOORS}</p>
              <p><span className="text-amber-300/70">Hostages freed:</span> {hostagesSaved} (this floor holds {def.hostages.length})</p>
              <p><span className="text-amber-300/70">Bomb:</span> {bombStatus}</p>
            </div>
          </section>

          {/* Clues this floor */}
          <section>
            <h3 className="text-sm uppercase tracking-widest text-amber-300/70 mb-2 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Defuse Clues (this floor)</h3>
            <ul className="space-y-2 text-sm">
              {def.clues.map((c) => {
                const found = cluesFound.includes(c.id);
                return (
                  <li key={c.id} className={`rounded-md border p-2.5 ${found ? 'border-amber-600/40 bg-amber-950/20' : 'border-white/10 bg-black/20 text-amber-100/40'}`}>
                    <p className="font-semibold">{found ? c.label : '??? — not yet found'}</p>
                    {found && <p className="italic text-amber-100/80 mt-0.5">&ldquo;{c.text}&rdquo;</p>}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Intel notes */}
          <section>
            <h3 className="text-sm uppercase tracking-widest text-amber-300/70 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Intel Gathered</h3>
            {missionNotes.length === 0 ? (
              <p className="text-sm text-amber-100/40">Nothing yet. Search cabinets and workstations.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {missionNotes.map((n, i) => <li key={i} className="flex gap-2"><span className="text-amber-500">•</span><span>{n}</span></li>)}
              </ul>
            )}
          </section>

          {/* Radio log */}
          <section>
            <h3 className="text-sm uppercase tracking-widest text-amber-300/70 mb-2 flex items-center gap-1.5"><Radio className="w-4 h-4" /> HQ Radio Log</h3>
            {radioLog.length === 0 ? (
              <p className="text-sm text-amber-100/40">Radio silent.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {radioLog.map((m) => (
                  <li key={m.id} className={m.tone === 'warn' ? 'text-red-300' : m.tone === 'good' ? 'text-green-300' : 'text-sky-200'}>▸ {m.text}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
