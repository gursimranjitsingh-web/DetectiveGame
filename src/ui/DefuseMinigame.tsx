import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getFloor } from '@/data/floors';
import { playBlip, playDefuseErr } from '@/game/audio';
import { Scissors, Delete, Check, X, ShieldAlert } from 'lucide-react';

const WIRE_HEX: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e',
  yellow: '#eab308', white: '#e5e7eb', black: '#374151',
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(Math.max(0, s) % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Isolated so the per-frame countdown only re-renders this number, not the whole puzzle.
function DefuseTimer() {
  const missionTimer = useGameStore((s) => s.missionTimer);
  const low = missionTimer <= 120;
  return (
    <p className={`text-4xl font-mono font-bold ${low ? 'text-red-500 animate-pulse' : 'text-red-300'}`}>
      {formatTime(missionTimer)}
    </p>
  );
}

export default function DefuseMinigame() {
  const currentFloor = useGameStore((s) => s.currentFloor);
  const cluesFound = useGameStore((s) => s.cluesFound);
  const floor = useMemo(() => getFloor(currentFloor), [currentFloor]);
  const cfg = floor.defuse;

  const [cut, setCut] = useState<number[]>([]);       // wire indices cut so far
  const [cutProgress, setCutProgress] = useState(0);  // position in cutSequence
  const [wiresDone, setWiresDone] = useState(false);
  const [entry, setEntry] = useState('');
  const [codeDone, setCodeDone] = useState(false);
  const [switches, setSwitches] = useState<boolean[]>(() => new Array(cfg.switchCount).fill(false));
  const [switchesDone, setSwitchesDone] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [message, setMessage] = useState('Solve all three modules before the timer hits zero.');

  const clueTexts = floor.clues.filter((c) => cluesFound.includes(c.id)).map((c) => c.text);
  const missingClues = floor.clues.length - clueTexts.length;

  const allDone = wiresDone && codeDone && switchesDone;

  const addStrike = (reason: string) => {
    const next = strikes + 1;
    setStrikes(next);
    setMessage(`${reason} (−15s)`);
    playDefuseErr();
    useGameStore.getState().addStrike();
    useGameStore.getState().penalizeTime(15);
    if (next >= 3) {
      useGameStore.getState().failMission('Three strikes — the tamper trigger blew the bomb.');
    }
  };

  const cutWire = (i: number) => {
    if (wiresDone || cut.includes(i)) return;
    if (i === cfg.cutSequence[cutProgress]) {
      const np = cutProgress + 1;
      playBlip(640, 0.06);
      setCut([...cut, i]);
      setCutProgress(np);
      if (np >= cfg.cutSequence.length) {
        setWiresDone(true);
        setMessage('Wires disarmed. ✓');
      } else {
        setMessage('Correct. Keep going…');
      }
    } else {
      setCut([...cut, i]);
      addStrike('Wrong wire! Strike.');
    }
  };

  const pressKey = (k: string) => {
    if (codeDone) return;
    if (k === 'del') { setEntry(entry.slice(0, -1)); return; }
    if (k === 'ok') {
      if (entry === cfg.code) {
        setCodeDone(true);
        playBlip(760, 0.1);
        setMessage('Keypad accepted. ✓');
      } else {
        addStrike('Wrong code! Strike.');
        setEntry('');
      }
      return;
    }
    if (entry.length < cfg.code.length) setEntry(entry + k);
  };

  const toggleSwitch = (i: number) => {
    if (switchesDone) return;
    const ns = switches.slice();
    ns[i] = !ns[i];
    setSwitches(ns);
  };

  const confirmSwitches = () => {
    if (switchesDone) return;
    if (switches.every((v, i) => v === cfg.switchTarget[i])) {
      setSwitchesDone(true);
      playBlip(720, 0.1);
      setMessage('Switch array set. ✓');
    } else {
      addStrike('Wrong switch pattern! Strike.');
    }
  };

  const finish = () => useGameStore.getState().defuseCurrentFloor();

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/92 backdrop-blur-md text-white p-4 pointer-events-auto">
      <div className="w-full max-w-5xl bg-neutral-950/90 border border-white/15 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-400" /> BOMB DEFUSAL
            </h2>
            <p className="text-xs text-gray-400 mt-1">Floor {currentFloor} · three modules, all must be armed-down</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Detonation in</p>
            <DefuseTimer />
            <div className="flex gap-1 justify-end mt-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`w-3 h-3 rounded-full ${i < strikes ? 'bg-red-500' : 'bg-white/15'}`} />
              ))}
              <span className="text-[10px] text-gray-500 ml-1">strikes</span>
            </div>
          </div>
        </div>

        {/* Clue hints */}
        <div className="bg-amber-950/20 border border-amber-500/25 rounded-lg p-3 mb-4">
          <p className="text-[11px] uppercase tracking-widest text-amber-300/80 mb-1">Intel from clues</p>
          {clueTexts.length === 0 ? (
            <p className="text-sm text-gray-400">No clues collected. Explore the floor to find the solution — or guess and risk a strike.</p>
          ) : (
            <ul className="text-sm text-amber-100/90 space-y-0.5">
              {clueTexts.map((t, i) => <li key={i}>• {t}</li>)}
            </ul>
          )}
          {missingClues > 0 && clueTexts.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{missingClues} more clue(s) still out there.</p>
          )}
        </div>

        {/* Modules */}
        <div className="grid grid-cols-3 gap-4">
          {/* Wires */}
          <div className={`rounded-xl border p-4 ${wiresDone ? 'border-green-500/50 bg-green-950/20' : 'border-white/10 bg-white/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-1.5"><Scissors className="w-4 h-4" /> Wires</h3>
              {wiresDone && <Check className="w-4 h-4 text-green-400" />}
            </div>
            <div className="flex flex-col gap-2">
              {cfg.wireColors.map((color, i) => {
                const isCut = cut.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => cutWire(i)}
                    disabled={wiresDone || isCut}
                    className="flex items-center gap-2 group disabled:opacity-50"
                  >
                    <span className="w-6 text-[10px] text-gray-500">{i + 1}</span>
                    <span
                      className={`flex-1 h-2.5 rounded-full transition-all ${isCut ? 'opacity-30 line-through' : 'group-hover:h-3.5'}`}
                      style={{ backgroundColor: WIRE_HEX[color] ?? '#888', border: color === 'white' ? '1px solid #999' : 'none' }}
                    />
                    <span className="text-[10px] uppercase w-10 text-gray-400">{isCut ? 'cut' : color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keypad */}
          <div className={`rounded-xl border p-4 ${codeDone ? 'border-green-500/50 bg-green-950/20' : 'border-white/10 bg-white/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Keypad</h3>
              {codeDone && <Check className="w-4 h-4 text-green-400" />}
            </div>
            <div className="bg-black/60 rounded-md h-9 flex items-center justify-center font-mono text-xl tracking-[0.3em] mb-2 border border-white/10">
              {codeDone ? '✓' : entry.padEnd(cfg.code.length, '·')}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                <button key={n} onClick={() => pressKey(n)} disabled={codeDone}
                  className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded font-mono disabled:opacity-40">{n}</button>
              ))}
              <button onClick={() => pressKey('del')} disabled={codeDone} className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded flex justify-center disabled:opacity-40"><Delete className="w-4 h-4" /></button>
              <button onClick={() => pressKey('0')} disabled={codeDone} className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded font-mono disabled:opacity-40">0</button>
              <button onClick={() => pressKey('ok')} disabled={codeDone} className="py-2 bg-red-800 hover:bg-red-700 rounded flex justify-center disabled:opacity-40"><Check className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Switches */}
          <div className={`rounded-xl border p-4 ${switchesDone ? 'border-green-500/50 bg-green-950/20' : 'border-white/10 bg-white/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Switches</h3>
              {switchesDone && <Check className="w-4 h-4 text-green-400" />}
            </div>
            <div className="flex flex-col gap-2 mb-3">
              {switches.map((on, i) => (
                <button key={i} onClick={() => toggleSwitch(i)} disabled={switchesDone}
                  className="flex items-center gap-3 disabled:opacity-60">
                  <span className="text-[10px] text-gray-500 w-4">{i + 1}</span>
                  <span className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors ${on ? 'bg-green-600 justify-end' : 'bg-neutral-700 justify-start'}`}>
                    <span className="w-5 h-5 bg-white rounded-full" />
                  </span>
                  <span className="text-[10px] uppercase text-gray-400">{on ? 'on' : 'off'}</span>
                </button>
              ))}
            </div>
            {!switchesDone && (
              <button onClick={confirmSwitches} className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm">Confirm</button>
            )}
          </div>
        </div>

        {/* Status + actions */}
        <p className="text-center text-sm text-gray-300 mt-4 min-h-5">{message}</p>
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => useGameStore.getState().setDefusing(false)}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Back away (timer keeps running)
          </button>
          <button
            onClick={finish}
            disabled={!allDone}
            className={`flex-1 py-3 rounded-lg font-bold tracking-widest border flex items-center justify-center gap-2 ${
              allDone ? 'bg-green-600 hover:bg-green-500 border-green-300' : 'bg-neutral-800 border-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" /> CUT THE MAIN LINE
          </button>
        </div>
      </div>
    </div>
  );
}
