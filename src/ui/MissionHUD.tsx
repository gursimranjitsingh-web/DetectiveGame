import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getFloor, TOTAL_FLOORS } from '@/data/floors';
import { playerPose } from '@/game/playerPose';
import { enemyPositions } from '@/components/combat/enemyRegistry';
import DefuseMinigame from './DefuseMinigame';
import Notebook from './Notebook';
import { Crosshair, Heart, Eye, EyeOff, Skull, ShieldCheck, Radio, ScanEye } from 'lucide-react';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(Math.max(0, s) % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Isolated so the per-frame timer tick only re-renders this badge, not the whole HUD.
function TimerBadge() {
  const missionTimer = useGameStore((s) => s.missionTimer);
  const currentFloor = useGameStore((s) => s.currentFloor);
  const timerLow = missionTimer <= 120;
  const timerCrit = missionTimer <= 30;
  return (
    <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/15 flex items-center gap-4">
      <span className="text-xs uppercase tracking-widest text-gray-400">Floor {currentFloor}/{TOTAL_FLOORS}</span>
      <span className="text-gray-600">|</span>
      <span className="text-[10px] uppercase tracking-widest text-gray-500">Mission</span>
      <span className={`text-2xl font-mono font-bold ${timerCrit ? 'text-red-500 animate-pulse' : timerLow ? 'text-orange-400' : 'text-white'}`}>
        {formatTime(missionTimer)}
      </span>
    </div>
  );
}

function Minimap() {
  const currentFloor = useGameStore((s) => s.currentFloor);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const def = useMemo(() => getFloor(currentFloor), [currentFloor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    const pad = 10;
    const scale = Math.min((W - pad * 2) / def.size.w, (H - pad * 2) / def.size.d);
    const toX = (x: number) => W / 2 + x * scale;
    const toY = (z: number) => H / 2 + z * scale;
    let raf = 0;

    const draw = () => {
      const store = useGameStore.getState();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(10,12,16,0.85)';
      ctx.fillRect(0, 0, W, H);

      // Walls
      ctx.strokeStyle = 'rgba(160,180,210,0.75)';
      ctx.lineWidth = 1.5;
      for (const seg of def.walls) {
        ctx.beginPath();
        ctx.moveTo(toX(seg.x1), toY(seg.z1));
        ctx.lineTo(toX(seg.x2), toY(seg.z2));
        ctx.stroke();
      }

      // Elevator
      ctx.fillStyle = store.floorDefused ? '#34d399' : '#9aa0a8';
      ctx.fillRect(toX(def.elevator[0]) - 3, toY(def.elevator[1]) - 3, 6, 6);

      // Clues (not yet collected)
      for (const c of def.clues) {
        if (store.cluesFound.includes(c.id)) continue;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(toX(c.pos[0]), toY(c.pos[1]), 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bomb (once located)
      if (store.bombFound) {
        ctx.fillStyle = store.floorDefused ? '#34d399' : '#ef4444';
        ctx.beginPath();
        ctx.arc(toX(def.bomb[0]), toY(def.bomb[1]), 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Enemies (only when alerted — stealth reward)
      if (store.alerted) {
        for (const e of enemyPositions()) {
          if (!e.alive) continue;
          ctx.fillStyle = '#f87171';
          ctx.beginPath();
          ctx.arc(toX(e.x), toY(e.z), 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Player (triangle facing angle)
      const px = toX(playerPose.x);
      const py = toY(playerPose.z);
      const a = playerPose.angle;
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(px + Math.sin(a) * 6, py + Math.cos(a) * 6);
      ctx.lineTo(px + Math.sin(a + 2.5) * 4, py + Math.cos(a + 2.5) * 4);
      ctx.lineTo(px + Math.sin(a - 2.5) * 4, py + Math.cos(a - 2.5) * 4);
      ctx.closePath();
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [def]);

  return (
    <div className="bg-black/50 backdrop-blur-md rounded-xl border border-white/15 p-2 shadow-2xl">
      <canvas ref={canvasRef} width={190} height={150} className="rounded" />
    </div>
  );
}

export default function MissionHUD() {
  const gameState = useGameStore((s) => s.gameState);
  const currentFloor = useGameStore((s) => s.currentFloor);
  const bombFound = useGameStore((s) => s.bombFound);
  const floorDefused = useGameStore((s) => s.floorDefused);
  const defusing = useGameStore((s) => s.defusing);
  const alerted = useGameStore((s) => s.alerted);
  const missionStatus = useGameStore((s) => s.missionStatus);
  const failReason = useGameStore((s) => s.failReason);
  const playerHealth = useGameStore((s) => s.playerHealth);
  const maxHealth = useGameStore((s) => s.maxHealth);
  const ammo = useGameStore((s) => s.ammo);
  const reserveAmmo = useGameStore((s) => s.reserveAmmo);
  const lastHitAt = useGameStore((s) => s.lastHitAt);
  const cluesFound = useGameStore((s) => s.cluesFound);
  const hostagesSaved = useGameStore((s) => s.hostagesSaved);
  const readingClue = useGameStore((s) => s.readingClue);
  const investigationMode = useGameStore((s) => s.investigationMode);
  const notebookOpen = useGameStore((s) => s.notebookOpen);
  const radioLog = useGameStore((s) => s.radioLog);
  const interactPrompt = useGameStore((s) => s.interactPrompt);

  const def = useMemo(() => getFloor(currentFloor), [currentFloor]);

  // Track mouse-capture so we can prompt the player to click for 360° look.
  const [pointerLocked, setPointerLocked] = useState(false);
  useEffect(() => {
    const onChange = () => setPointerLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  // N = notebook, F = investigation mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'KeyN') useGameStore.getState().toggleNotebook();
      else if (e.code === 'KeyF') useGameStore.getState().toggleInvestigation();
      else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        const s = useGameStore.getState();
        if (s.readingClue) {
          s.setReadingClue(null);
          Promise.resolve(document.querySelector('canvas')?.requestPointerLock?.()).catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Death → mission failed
  useEffect(() => {
    if (playerHealth <= 0 && missionStatus === 'active') {
      useGameStore.getState().failMission('You were gunned down by the intruders.');
    }
  }, [playerHealth, missionStatus]);

  // Auto-restart after failure
  const restarting = useRef(false);
  useEffect(() => {
    if (missionStatus === 'failed' && !restarting.current) {
      restarting.current = true;
      const t = setTimeout(() => {
        useGameStore.getState().resetMission();
        restarting.current = false;
      }, 3400);
      return () => clearTimeout(t);
    }
  }, [missionStatus]);

  if (gameState !== 'PLAYING') return null;

  const healthFrac = Math.max(0, playerHealth / maxHealth);
  const lowHealth = healthFrac <= 0.3;
  const cluesTotal = def.clues.length;

  const objective = floorDefused
    ? 'Bomb defused — reach the elevator (E)'
    : bombFound
    ? 'Defuse the bomb (press E at the device)'
    : "Find the bomb hidden on this floor";

  // Mission complete — tally the score & rank.
  if (missionStatus === 'complete') {
    const st = useGameStore.getState();
    const timeBonus = Math.floor(Math.max(0, st.missionTimer)) * 6;
    const hostageBonus = st.hostagesSaved * 400;
    const damagePenalty = Math.round(st.damageTaken) * 4;
    const strikePenalty = st.strikesTaken * 150;
    const score = Math.max(0, 3000 + timeBonus + hostageBonus - damagePenalty - strikePenalty);
    const rank = score >= 6500 ? 'S' : score >= 5000 ? 'A' : score >= 3500 ? 'B' : 'C';
    const rankColor = rank === 'S' ? 'text-amber-300' : rank === 'A' ? 'text-green-300' : rank === 'B' ? 'text-sky-300' : 'text-gray-300';
    const row = (label: string, val: string, cls = 'text-gray-200') => (
      <div className="flex justify-between gap-8"><span className="text-gray-400">{label}</span><span className={cls}>{val}</span></div>
    );

    return (
      <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black/92 text-center pointer-events-auto p-6">
        <ShieldCheck className="w-16 h-16 text-green-400 mb-3" />
        <h1 className="text-5xl font-serif tracking-widest text-green-400 mb-2">HOSTAGES RESCUED</h1>
        <p className="text-gray-300 max-w-lg mb-6">Every bomb defused, every floor cleared. Your colleagues walk out alive.</p>

        <div className="bg-white/5 border border-white/15 rounded-xl p-6 w-[380px] mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-sm uppercase tracking-widest text-gray-400">Rank</span>
            <span className={`text-6xl font-serif font-bold ${rankColor}`}>{rank}</span>
          </div>
          <div className="flex flex-col gap-1.5 text-sm">
            {row('Time remaining bonus', `+${timeBonus}`)}
            {row('Hostages freed', `+${hostageBonus}`, 'text-cyan-200')}
            {row('Damage taken', `-${damagePenalty}`, 'text-red-300')}
            {row('Defuse strikes', `-${strikePenalty}`, 'text-red-300')}
            <div className="border-t border-white/15 my-1.5" />
            {row('FINAL SCORE', `${score}`, 'text-white font-bold text-base')}
          </div>
        </div>

        <button
          onClick={() => {
            const s = useGameStore.getState();
            s.markCaseSolved('case-02');
            s.setGameState('MAIN_MENU');
          }}
          className="px-8 py-3 bg-green-700 hover:bg-green-600 border border-green-400 rounded-md text-xl transition-colors"
        >
          Back to Case Files
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Damage flash */}
      {lastHitAt > 0 && (
        <div key={lastHitAt} className="absolute inset-0" style={{ animation: 'damageFlash 0.4s ease-out forwards', background: 'radial-gradient(ellipse at center, rgba(180,0,0,0) 35%, rgba(180,0,0,0.9) 100%)' }} />
      )}
      {lowHealth && missionStatus === 'active' && (
        <div className="absolute inset-0 animate-pulse" style={{ background: 'radial-gradient(ellipse at center, rgba(140,0,0,0) 55%, rgba(140,0,0,0.5) 100%)' }} />
      )}

      {/* Investigation Mode cinematic tint + evidence-lens vignette */}
      {investigationMode && !defusing && (
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 220px rgba(30,90,150,0.75)', background: 'rgba(18,40,70,0.14)' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-24 text-sky-300/80 text-xs uppercase tracking-[0.3em] flex items-center gap-2">
            <ScanEye className="w-4 h-4" /> Investigation Mode
          </div>
        </div>
      )}

      {/* Defuse overlay */}
      {defusing && <DefuseMinigame />}

      {/* Notebook */}
      {notebookOpen && <Notebook />}

      {/* HQ radio feed */}
      {!defusing && !notebookOpen && radioLog.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-[520px] max-w-[80vw]">
          {radioLog.slice(0, 3).map((m, i) => (
            <div
              key={m.id}
              className={`px-3 py-1.5 rounded-md border text-sm text-center backdrop-blur-md ${
                m.tone === 'warn' ? 'bg-red-950/60 border-red-500/40 text-red-100'
                : m.tone === 'good' ? 'bg-green-950/60 border-green-500/40 text-green-100'
                : 'bg-black/55 border-white/15 text-sky-100'
              }`}
              style={{ opacity: 1 - i * 0.32 }}
            >
              <Radio className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{m.text}
            </div>
          ))}
        </div>
      )}

      {/* Fail overlay */}
      {missionStatus === 'failed' && (
        <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black/88 text-center pointer-events-auto">
          <Skull className="w-16 h-16 text-red-600 mb-4" />
          <h1 className="text-5xl font-serif tracking-widest text-red-500 mb-3">MISSION FAILED</h1>
          <p className="text-gray-400 max-w-md mb-2">{failReason}</p>
          <p className="text-gray-500 text-sm">Restarting from Floor 1…</p>
        </div>
      )}

      {/* Clue popup */}
      {readingClue && (
        <div
          className="absolute inset-0 z-[65] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto cursor-pointer"
          onClick={() => useGameStore.getState().setReadingClue(null)}
        >
          <div className="bg-neutral-950/90 border border-amber-500/40 rounded-xl p-7 max-w-md text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs uppercase tracking-widest text-amber-300/80 mb-2">Clue found</p>
            <h3 className="text-2xl font-serif text-amber-200 mb-3">{readingClue.label}</h3>
            <p className="text-lg text-gray-200 italic mb-6">&ldquo;{readingClue.text}&rdquo;</p>
            <button onClick={() => useGameStore.getState().setReadingClue(null)} className="px-6 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg text-sm font-semibold">Got it <span className="opacity-70">(Enter)</span></button>
          </div>
        </div>
      )}

      {/* Top center: timer + objective */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <TimerBadge />
        <div className="bg-black/50 px-4 py-1.5 rounded-full text-sm text-amber-100 border border-amber-500/20">
          ◈ {objective}
        </div>
      </div>

      {/* Alert state */}
      <div className="absolute top-6 left-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${alerted ? 'bg-red-950/70 border-red-500 text-red-200 animate-pulse' : 'bg-black/50 border-white/15 text-gray-300'}`}>
          {alerted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span className="text-sm font-semibold">{alerted ? 'SPOTTED — under fire' : 'Hidden'}</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-1 pl-1">
          Clues {cluesFound.length}/{cluesTotal} · Hostages freed {hostagesSaved}
        </p>
      </div>

      {/* Minimap */}
      <div className="absolute top-6 right-6">
        <Minimap />
      </div>

      {/* Crosshair */}
      {!defusing && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${alerted ? 'text-red-400' : 'text-white/70'}`}>
          <Crosshair className="w-7 h-7" />
        </div>
      )}

      {/* Single interaction prompt for whatever you're looking at (shown from range) */}
      {!defusing && !notebookOpen && missionStatus === 'active' && interactPrompt && (
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/75 border border-cyan-400/40 rounded-lg px-4 py-2 shadow-xl">
          <span className="text-cyan-100 font-semibold text-sm whitespace-nowrap">{interactPrompt.label}</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-300">
            <kbd className="px-1.5 py-0.5 rounded bg-white/15 border border-white/25 font-bold text-white">E</kbd>
            {interactPrompt.verb}
          </span>
        </div>
      )}

      {/* Click-to-look prompt (mouse not captured) */}
      {!defusing && !notebookOpen && missionStatus === 'active' && !pointerLocked && (
        <div className="absolute top-[54%] left-1/2 -translate-x-1/2 bg-black/70 border border-white/20 rounded-full px-4 py-2 text-sm text-white/90 animate-pulse">
          Click to look around · turn a full 360° · Esc to release
        </div>
      )}

      {/* Bottom-left: health + ammo */}
      {!defusing && (
        <div className="absolute bottom-6 left-6 bg-black/55 backdrop-blur-md rounded-xl border border-white/10 px-4 py-3 min-w-[220px]">
          <div className="flex items-center gap-2 mb-1.5">
            <Heart className={`w-4 h-4 ${lowHealth ? 'text-red-500' : 'text-red-400'}`} />
            <span className="text-xs uppercase tracking-widest text-gray-400">Health</span>
            <span className="ml-auto text-sm font-bold">{Math.ceil(playerHealth)}</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-200 ${lowHealth ? 'bg-red-600' : 'bg-red-500'}`} style={{ width: `${healthFrac * 100}%` }} />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs uppercase tracking-widest text-gray-400">Ammo</span>
            <span className="ml-auto text-sm font-mono">
              <span className={ammo === 0 ? 'text-red-500 font-bold' : 'text-white'}>{ammo}</span>
              <span className="text-gray-500"> / {reserveAmmo}</span>
            </span>
          </div>
          {ammo === 0 && <p className="text-[11px] text-red-400 mt-1">Press R to reload</p>}
        </div>
      )}

      {/* Controls */}
      {!defusing && (
        <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white/70 p-3 rounded-xl border border-white/10 text-xs">
          <p>[W,A,S,D] Move · [Shift] Sprint</p>
          <p>[Mouse] Look 360° (click to capture) · [Q] Fire · [R] Reload</p>
          <p>[E] Search / Defuse / Elevator</p>
          <p>[F] Investigation · [N] Notebook</p>
        </div>
      )}
    </div>
  );
}
