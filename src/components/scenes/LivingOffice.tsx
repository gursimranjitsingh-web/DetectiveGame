import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/useGameStore';
import { startAmbient, stopAmbient, playTick, playExplosion, playBlip } from '@/game/audio';

// Makes the building feel alive: ambient drone, the bomb's ticking (faster near zero),
// and periodic dynamic events (power flickers, distant explosions on other floors).
export default function LivingOffice() {
  const started = useRef(false);
  const tickAcc = useRef(0);
  const eventTimer = useRef(16);
  const flickerTimer = useRef(0);

  useEffect(() => () => stopAmbient(), []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = useGameStore.getState();
    const live = s.gameState === 'PLAYING' && s.missionStatus === 'active';

    // Ambient bed follows the active state.
    if (live && !started.current) { startAmbient(); started.current = true; }
    else if (!live && started.current) { stopAmbient(); started.current = false; }
    if (!live) return;

    // Bomb ticking — speeds up under a minute.
    const fast = s.missionTimer <= 60;
    tickAcc.current += delta;
    if (tickAcc.current >= (fast ? 0.5 : 1.0)) {
      tickAcc.current = 0;
      playTick(fast);
    }

    // Restore a power flicker.
    if (flickerTimer.current > 0) {
      flickerTimer.current -= delta;
      if (flickerTimer.current <= 0) s.setLightsOut(false);
    }

    // Random dynamic events.
    eventTimer.current -= delta;
    if (eventTimer.current <= 0) {
      eventTimer.current = 22 + Math.random() * 22;
      if (Math.random() < 0.5) {
        // Power flicker
        s.setLightsOut(true);
        flickerTimer.current = 0.5 + Math.random() * 0.4;
        playBlip(90, 0.25);
      } else {
        // Distant explosion on another floor
        playExplosion();
        s.pushRadio('HQ: Detonation on another floor — the tower won\'t hold long. Move!', 'warn');
      }
    }
  });

  return null;
}
