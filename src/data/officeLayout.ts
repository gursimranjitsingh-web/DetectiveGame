// Single source of truth for the Lookfinity office floor plan. Both the 3D scene
// (OfficeScene) and the case data (case02) read from this so that a piece of evidence
// found "on Mahi's desk" is physically sitting on the desk with Mahi's nameplate.

export type MonitorState = 'code' | 'error' | 'dashboard' | 'off';
export type DeskClutter = 'drinks' | 'papers' | 'cricket' | 'plant' | 'clean';

export interface DeskSpot {
  id: string;
  owner: string;
  short: string;        // short name for the nameplate
  role: string;
  x: number;
  z: number;
  accent: string;       // hex accent colour, ties a desk to its owner
  monitor: MonitorState;
  clutter: DeskClutter;
}

export interface CabinSpot {
  id: string;
  doorId: string;
  label: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  wallColor: string;
  accent: string;
}

// Two rows of desks in the open engineering bay. Row A sits nearer the back rooms.
export const DESKS: DeskSpot[] = [
  { id: 'mahi',    owner: 'Mahi Vijay',    short: 'M. VIJAY',    role: 'Assoc. SWE',      x: -6, z: 1.5, accent: '#2dd4bf', monitor: 'error',     clutter: 'drinks'  },
  { id: 'deepak',  owner: 'Deepak',        short: 'DEEPAK',      role: 'Full Stack',      x: -2, z: 1.5, accent: '#fb923c', monitor: 'code',      clutter: 'papers'  },
  { id: 'keshav',  owner: 'Keshav Singh',  short: 'K. SINGH',    role: 'Tech',            x:  2, z: 1.5, accent: '#22c55e', monitor: 'off',       clutter: 'cricket' },
  { id: 'prateek', owner: 'Prateek',       short: 'PRATEEK',     role: 'SDE II',          x:  6, z: 1.5, accent: '#a78bfa', monitor: 'code',      clutter: 'clean'   },
  { id: 'nitya',   owner: 'Nitya Oberoi',  short: 'N. OBEROI',   role: 'Assoc. SWE',      x: -6, z: 4.5, accent: '#f472b6', monitor: 'code',      clutter: 'plant'   },
  { id: 'manish',  owner: 'Manish Kumar',  short: 'M. KUMAR',    role: 'Shopify Dev',     x: -2, z: 4.5, accent: '#facc15', monitor: 'dashboard', clutter: 'papers'  },
  { id: 'ayush',   owner: 'Ayush Kaushik', short: 'A. KAUSHIK',  role: 'SDE II',          x:  2, z: 4.5, accent: '#38bdf8', monitor: 'code',      clutter: 'clean'   },
  { id: 'gourav',  owner: 'The Gouravs',   short: 'GOURAV ×2',   role: 'SDE',             x:  6, z: 4.5, accent: '#f87171', monitor: 'off',       clutter: 'clean'   },
];

export const CABINS: CabinSpot[] = [
  { id: 'manager', doorId: 'door-manager', label: "Gagan's Cabin",  x: -9, z: -8, width: 5, depth: 4, wallColor: '#3b4b63', accent: '#60a5fa' },
  { id: 'devops',  doorId: 'door-devops',  label: 'DevOps',         x: -3, z: -8, width: 5, depth: 4, wallColor: '#2f4740', accent: '#34d399' },
  { id: 'cto',     doorId: 'door-cto',     label: "CTO — S. Rai",   x:  3, z: -8, width: 5, depth: 4, wallColor: '#4a3a2a', accent: '#f59e0b' },
  { id: 'meeting', doorId: 'door-meeting', label: 'Meeting Room',   x:  9, z: -8, width: 5, depth: 4, wallColor: '#3a3550', accent: '#c084fc' },
];

export function getDesk(id: string): DeskSpot | undefined {
  return DESKS.find((d) => d.id === id);
}
