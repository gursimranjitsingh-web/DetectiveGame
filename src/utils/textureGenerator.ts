import * as THREE from 'three';

// Simple pseudo-random number generator
function random(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// 2D Perlin-like noise using canvas
function generateNoiseTexture(width: number, height: number, scale: number = 10, octaves: number = 4) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Extremely basic noise just to give texture
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let noiseVal = 0;
      let amplitude = 1;
      let frequency = scale;
      let maxValue = 0;
      
      for(let i=0; i<octaves; i++) {
        noiseVal += random((x * frequency) + (y * frequency * width)) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      
      noiseVal = noiseVal / maxValue;
      const val = Math.floor(noiseVal * 255);
      
      const index = (x + y * width) * 4;
      data[index] = val;
      data[index + 1] = val;
      data[index + 2] = val;
      data[index + 3] = 255;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Fill base color
  ctx.fillStyle = '#4a2f1d';
  ctx.fillRect(0, 0, 512, 512);
  
  // Draw wood grain lines
  ctx.lineWidth = 2;
  for(let i = 0; i < 200; i++) {
    ctx.beginPath();
    const xBase = Math.random() * 512;
    ctx.moveTo(xBase, 0);
    let x = xBase;
    for(let y = 0; y <= 512; y += 20) {
      x += (Math.random() - 0.5) * 10;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(40, 20, 10, ${Math.random() * 0.3})`;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 0, 512, 512);
  
  // Draw veins
  ctx.lineWidth = 1;
  for(let i = 0; i < 50; i++) {
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = Math.random() * 512;
    ctx.moveTo(x, y);
    for(let step = 0; step < 50; step++) {
      x += (Math.random() - 0.2) * 20;
      y += (Math.random() - 0.2) * 20;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(50, 50, 50, ${Math.random() * 0.4})`;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createCarpetTexture() {
  const canvas = generateNoiseTexture(512, 512, 44, 3);
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const fiber = data[i] / 255;
    data[i] = 118 + fiber * 80;
    data[i + 1] = 124 + fiber * 80;
    data[i + 2] = 104 + fiber * 70;
  }

  ctx.putImageData(imgData, 0, 0);

  for (let i = 0; i < 120; i++) {
    const y = Math.random() * 512;
    ctx.strokeStyle = `rgba(225, 220, 196, ${0.05 + Math.random() * 0.08})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y + (Math.random() - 0.5) * 8);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// A woven-fabric look for chairs and acoustic partitions.
export function createFabricTexture(base: string = '#3a3f4d') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);

  // Cross-hatched weave
  for (let y = 0; y < 256; y += 3) {
    ctx.strokeStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  for (let x = 0; x < 256; x += 3) {
    ctx.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.04})`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// A monitor screen. 'code' = editor, 'error' = the RATE LIMIT banner, 'dashboard' = a usage graph.
export function createScreenTexture(kind: 'code' | 'error' | 'dashboard' = 'code') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  if (kind === 'error') {
    ctx.fillStyle = '#2a0c0c';
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = '#ff5b5b';
    ctx.font = 'bold 34px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ RATE LIMIT', 256, 140);
    ctx.fillText('EXCEEDED', 256, 185);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#ff9a9a';
    ctx.fillText('quota resets in 26 days', 256, 230);
  } else if (kind === 'dashboard') {
    ctx.fillStyle = '#0d1526';
    ctx.fillRect(0, 0, 512, 320);
    // grid
    ctx.strokeStyle = 'rgba(120,160,255,0.12)';
    for (let x = 0; x <= 512; x += 42) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 320); ctx.stroke();
    }
    for (let y = 0; y <= 320; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    // rising step line that flatlines (the drained quota)
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, 300);
    let y = 300;
    for (let x = 10; x < 360; x += 22) {
      y -= 16 + Math.random() * 4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(500, y); // flatline at the top = quota gone
    ctx.stroke();
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TOKEN USAGE', 16, 30);
  } else {
    // code editor
    ctx.fillStyle = '#12151c';
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = '#1b2430';
    ctx.fillRect(0, 0, 44, 320); // gutter
    const colors = ['#c586c0', '#9cdcfe', '#ce9178', '#dcdcaa', '#4ec9b0', '#569cd6'];
    ctx.font = '13px monospace';
    for (let i = 0; i < 18; i++) {
      const y = 22 + i * 16;
      ctx.fillStyle = '#3a4453';
      ctx.textAlign = 'right';
      ctx.fillText(String(i + 1), 38, y);
      ctx.textAlign = 'left';
      const indent = 52 + (i % 4) * 14;
      const width = 60 + Math.random() * 260;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(indent, y - 10, Math.min(width, 500 - indent), 8);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// A whiteboard covered in the sort of diagrams an engineering team leaves behind.
export function createWhiteboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f4f6f8';
  ctx.fillRect(0, 0, 512, 320);

  const pens = ['#2b6cb0', '#c53030', '#2f855a', '#6b46c1'];
  // boxes + arrows (an architecture doodle)
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = pens[i % pens.length];
    ctx.lineWidth = 2;
    const x = 40 + Math.random() * 380;
    const y = 40 + Math.random() * 220;
    ctx.strokeRect(x, y, 60 + Math.random() * 40, 30 + Math.random() * 20);
  }
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = pens[i % pens.length];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, Math.random() * 320);
    ctx.lineTo(Math.random() * 512, Math.random() * 320);
    ctx.stroke();
  }
  // scribbled title
  ctx.strokeStyle = '#c53030';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 28);
  ctx.lineTo(230, 26);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// A simple framed poster. Variants give the office some wall personality.
export function createPosterTexture(variant: 'ship' | 'coffee' | 'alert' = 'ship') {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  const palettes: Record<string, [string, string, string]> = {
    ship: ['#0f2a43', '#38bdf8', 'SHIP IT'],
    coffee: ['#3b2417', '#d9a066', 'BUT FIRST,\nCOFFEE'],
    alert: ['#3a0d0d', '#ff6b6b', 'HAVE YOU\nTRIED\nA RATE LIMIT?'],
  };
  const [bg, fg, text] = palettes[variant];
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 300, 400);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 268, 368);
  ctx.fillStyle = fg;
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  text.split('\n').forEach((line, i) => ctx.fillText(line, 150, 180 + i * 46));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// A crisp text label on a solid plate — used for desk nameplates and room signs.
export function createLabelTexture(
  text: string,
  opts: { bg?: string; fg?: string; sub?: string; accent?: string } = {}
) {
  const { bg = '#1b1e26', fg = '#f4f4f5', sub, accent } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = sub ? 200 : 140;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (accent) {
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 16, canvas.height);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fg;
  // Auto-fit: shrink the font until the text fits the plate width.
  const avail = canvas.width - 48;
  let size = 72;
  ctx.font = `bold ${size}px sans-serif`;
  while (ctx.measureText(text).width > avail && size > 24) {
    size -= 3;
    ctx.font = `bold ${size}px sans-serif`;
  }
  ctx.fillText(text, canvas.width / 2 + (accent ? 8 : 0), sub ? 78 : canvas.height / 2);

  if (sub) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '34px sans-serif';
    ctx.fillText(sub, canvas.width / 2 + (accent ? 7 : 0), 140);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createBloodStainTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  const cx = size * 0.5;
  const cy = size * 0.5;
  const baseRadius = size * 0.3;

  // One irregular silhouette (layered sine noise around a single center) so the pool
  // reads as one puddle instead of several overlapping discs with their own highlights
  const points = 28;
  const radii = Array.from({ length: points }, (_, i) => {
    const angle = (i / points) * Math.PI * 2;
    const n1 = Math.sin(angle * 3 + Math.random() * 0.6) * 0.18;
    const n2 = Math.sin(angle * 7 + Math.random() * 1.4) * 0.09;
    return baseRadius * (1 + n1 + n2);
  });
  const pointAt = (i: number) => {
    const angle = (i / points) * Math.PI * 2;
    const r = radii[((i % points) + points) % points];
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };

  ctx.beginPath();
  const [sx, sy] = pointAt(0);
  ctx.moveTo(sx, sy);
  for (let i = 1; i <= points; i++) {
    const [px, py] = pointAt(i - 1);
    const [nx, ny] = pointAt(i);
    ctx.quadraticCurveTo(px, py, (px + nx) / 2, (py + ny) / 2);
  }
  ctx.closePath();

  // Single coherent gradient fill for the whole puddle - one hue family throughout
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.3);
  gradient.addColorStop(0, 'rgba(124, 10, 10, 0.95)');
  gradient.addColorStop(0.45, 'rgba(100, 8, 8, 0.93)');
  gradient.addColorStop(0.8, 'rgba(66, 5, 5, 0.88)');
  gradient.addColorStop(1, 'rgba(40, 3, 3, 0)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Subtle clotting/texture variation clipped to the same silhouette and hue family,
  // so it reads as internal detail rather than a second distinct blob
  ctx.save();
  ctx.clip();
  for (let i = 0; i < 8; i++) {
    const ox = cx + (Math.random() - 0.5) * baseRadius * 1.1;
    const oy = cy + (Math.random() - 0.5) * baseRadius * 1.1;
    const r = baseRadius * (0.15 + Math.random() * 0.25);
    const clotGradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
    const darker = Math.random() > 0.5;
    clotGradient.addColorStop(0, darker ? 'rgba(35, 2, 2, 0.3)' : 'rgba(140, 18, 18, 0.2)');
    clotGradient.addColorStop(1, 'rgba(60, 4, 4, 0)');
    ctx.fillStyle = clotGradient;
    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Small satellite droplets outside the main pool
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = baseRadius * (1.05 + Math.random() * 0.35);
    const dx = cx + Math.cos(angle) * dist;
    const dy = cy + Math.sin(angle) * dist;
    const r = size * (0.012 + Math.random() * 0.02);
    const dropGradient = ctx.createRadialGradient(dx, dy, 0, dx, dy, r);
    dropGradient.addColorStop(0, 'rgba(120, 10, 10, 0.85)');
    dropGradient.addColorStop(1, 'rgba(60, 4, 4, 0)');
    ctx.fillStyle = dropGradient;
    ctx.beginPath();
    ctx.arc(dx, dy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
