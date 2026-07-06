// Procedural audio via the Web Audio API — no asset files. Everything is synthesised
// from oscillators + noise. The context is created lazily and resumed on the first
// user gesture (browser autoplay policy).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let ambient: { osc: OscillatorNode[]; gain: GainNode; hum: AudioBufferSourceNode } | null = null;

export function ensureAudio(): void {
  if (typeof window === 'undefined') return;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);

    // One second of white noise, reused for shots/explosions/hum.
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

function now() { return ctx ? ctx.currentTime : 0; }

function noiseSource(): AudioBufferSourceNode | null {
  if (!ctx || !noiseBuffer) return null;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  return src;
}

function envBlip(osc: OscillatorNode, gain: GainNode, dur: number, peak: number) {
  if (!ctx) return;
  const t = now();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playShot(): void {
  if (!ctx || !master) return;
  const src = noiseSource();
  if (!src) return;
  const g = ctx.createGain();
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1600;
  const t = now();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  src.connect(bp); bp.connect(g); g.connect(master);
  src.start(t); src.stop(t + 0.14);
}

export function playEnemyShot(): void {
  if (!ctx || !master) return;
  const src = noiseSource();
  if (!src) return;
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  const t = now();
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  src.connect(lp); lp.connect(g); g.connect(master);
  src.start(t); src.stop(t + 0.12);
}

export function playExplosion(): void {
  if (!ctx || !master) return;
  const src = noiseSource();
  if (!src) return;
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(700, now());
  lp.frequency.exponentialRampToValueAtTime(80, now() + 0.8);
  const t = now();
  g.gain.setValueAtTime(0.6, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
  src.connect(lp); lp.connect(g); g.connect(master);
  src.start(t); src.stop(t + 1.3);
}

export function playBlip(freq = 660, dur = 0.08): void {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  osc.connect(g); g.connect(master);
  envBlip(osc, g, dur, 0.18);
}

export function playDefuseOk(): void {
  playBlip(520, 0.1);
  window.setTimeout(() => playBlip(780, 0.14), 90);
}

export function playDefuseErr(): void {
  playBlip(200, 0.18);
}

export function playAlarm(): void {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sawtooth';
  const t = now();
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.linearRampToValueAtTime(880, t + 0.18);
  osc.frequency.linearRampToValueAtTime(440, t + 0.36);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.22, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  osc.connect(g); g.connect(master);
  osc.start(t); osc.stop(t + 0.52);
}

export function playTick(fast = false): void {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = fast ? 1400 : 1000;
  osc.connect(g); g.connect(master);
  envBlip(osc, g, 0.03, 0.06);
}

export function startAmbient(): void {
  if (!ctx || !master || ambient) return;
  const gain = ctx.createGain();
  gain.gain.value = 0.06;
  gain.connect(master);
  // Two detuned low drones
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  o1.type = 'sine'; o1.frequency.value = 55;
  o2.type = 'sine'; o2.frequency.value = 55.6;
  o1.connect(gain); o2.connect(gain);
  o1.start(); o2.start();
  // Filtered noise "air handling" hum
  const hum = noiseSource()!;
  hum.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 220;
  const hg = ctx.createGain(); hg.gain.value = 0.04;
  hum.connect(lp); lp.connect(hg); hg.connect(master);
  hum.start();
  ambient = { osc: [o1, o2], gain, hum };
}

export function stopAmbient(): void {
  if (!ambient) return;
  try {
    ambient.osc.forEach((o) => o.stop());
    ambient.hum.stop();
  } catch { /* already stopped */ }
  ambient = null;
}
