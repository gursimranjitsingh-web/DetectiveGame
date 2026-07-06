import { create } from 'zustand';
import { TOTAL_FLOORS } from '@/data/floors';
import { playAlarm, playBlip, playDefuseOk, playExplosion } from '@/game/audio';

export type GameState = 'SPLASH' | 'MAIN_MENU' | 'CASE_INTRO' | 'PLAYING' | 'INTERROGATION' | 'END_SCREEN';
export type MissionStatus = 'idle' | 'active' | 'failed' | 'complete';

const SOLVED_CASES_KEY = 'detective_solved_cases';

function loadSolvedCases(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SOLVED_CASES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface GameStore {
  gameState: GameState;
  setGameState: (state: GameState) => void;

  activeCaseId: string;
  setActiveCaseId: (caseId: string) => void;

  cluesFound: string[];
  addClue: (clueId: string) => void;
  targetedClueId: string | null;
  setTargetedClue: (clueId: string | null) => void;

  notebookOpen: boolean;
  toggleNotebook: () => void;

  isInspecting: boolean;
  inspectedObjectId: string | null;
  setInspecting: (isInspecting: boolean, objectId?: string | null) => void;

  interactables: Record<string, boolean>;
  targetedInteractId: string | null;
  setTargetedInteract: (interactId: string | null) => void;
  toggleInteractable: (interactId: string) => void;

  score: number;
  timeElapsed: number;
  incrementTime: (amount: number) => void;

  // ── Combat (Case 02) ──
  playerHealth: number;
  maxHealth: number;
  damagePlayer: (amount: number) => void;
  lastHitAt: number; // timestamp (ms) of the last hit, for the damage flash
  ammo: number;
  magSize: number;
  reserveAmmo: number;
  fireWeapon: () => boolean; // returns true if a round was actually fired
  reloadWeapon: () => void;
  enemiesDefeated: number;
  registerKill: () => void;
  resetCombat: () => void;
  /** Bumped on every fresh case start so enemies remount at full health. */
  runEpoch: number;

  // ── Mission: multi-floor bomb defusal (Case 02) ──
  missionStatus: MissionStatus;
  currentFloor: number;          // 1..TOTAL_FLOORS
  floorsCleared: number;
  missionTimer: number;          // seconds left for the ENTIRE mission (never resets)
  bombFound: boolean;            // player has located the bomb on this floor
  floorDefused: boolean;         // current bomb defused → elevator unlocked
  defusing: boolean;             // the defuse minigame overlay is open
  alerted: boolean;              // enemies currently hunting the player
  lastSeenAt: number;            // ms timestamp of the last enemy sighting
  floorStartAt: number;          // ms when the current floor began (spawn grace)
  failReason: string;            // shown on the mission-failed overlay
  readingClue: { label: string; text: string } | null;
  setReadingClue: (clue: { label: string; text: string } | null) => void;
  interactPrompt: { label: string; verb: string } | null;
  setInteractPrompt: (p: { label: string; verb: string } | null) => void;

  // Investigation layer (M3)
  investigationMode: boolean;
  toggleInvestigation: () => void;
  radioLog: { id: number; text: string; tone: 'info' | 'warn' | 'good' }[];
  pushRadio: (text: string, tone?: 'info' | 'warn' | 'good') => void;
  missionNotes: string[];
  addNote: (note: string) => void;
  searchedIds: string[];
  markSearched: (id: string) => void;
  bombRevealed: boolean;
  revealBomb: () => void;
  hostagesSaved: number;
  savedHostages: string[];
  rescueHostage: (id: string, note: string) => void;
  damageTaken: number;
  strikesTaken: number;
  addStrike: () => void;
  lightsOut: boolean;         // dynamic power-flicker event
  setLightsOut: (v: boolean) => void;

  startMission: () => void;
  enterFloor: (floor: number) => void;
  tickMission: (delta: number) => void;
  penalizeTime: (seconds: number) => void;
  findBomb: () => void;
  setDefusing: (open: boolean) => void;
  defuseCurrentFloor: () => void;
  advanceFloor: () => void;      // via the elevator
  reportSighting: () => void;
  calmDown: () => void;
  failMission: (reason: string) => void;
  resetMission: () => void;

  solvedCases: string[];
  markCaseSolved: (caseId: string) => void;
  resetCase: () => void;
}

const MAG_SIZE = 12;
const MAX_HEALTH = 100;
const START_RESERVE = 60;
const MISSION_TIME = 15 * 60; // 15 minutes for the whole operation
let radioSeq = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'SPLASH',
  setGameState: (state) => set({ gameState: state }),

  activeCaseId: 'case-01',
  setActiveCaseId: (caseId) => set({ activeCaseId: caseId }),

  cluesFound: [],
  addClue: (clueId) => set((state) => ({
    cluesFound: state.cluesFound.includes(clueId) ? state.cluesFound : [...state.cluesFound, clueId]
  })),
  targetedClueId: null,
  setTargetedClue: (clueId) => set({ targetedClueId: clueId }),

  notebookOpen: false,
  toggleNotebook: () => set((state) => ({ notebookOpen: !state.notebookOpen })),

  isInspecting: false,
  inspectedObjectId: null,
  setInspecting: (isInspecting, objectId = null) => set({ isInspecting, inspectedObjectId: objectId }),

  interactables: {},
  targetedInteractId: null,
  setTargetedInteract: (interactId) => set({ targetedInteractId: interactId }),
  toggleInteractable: (interactId) => set((state) => ({
    interactables: { ...state.interactables, [interactId]: !state.interactables[interactId] }
  })),

  score: 0,
  timeElapsed: 0,
  incrementTime: (amount) => set((state) => ({ timeElapsed: state.timeElapsed + amount })),

  playerHealth: MAX_HEALTH,
  maxHealth: MAX_HEALTH,
  lastHitAt: 0,
  damagePlayer: (amount) => set((state) => ({
    playerHealth: Math.max(0, state.playerHealth - amount),
    lastHitAt: Date.now(),
    damageTaken: state.damageTaken + amount,
  })),
  ammo: MAG_SIZE,
  magSize: MAG_SIZE,
  reserveAmmo: START_RESERVE,
  fireWeapon: () => {
    const { ammo } = useGameStore.getState();
    if (ammo <= 0) return false;
    set((state) => ({ ammo: state.ammo - 1 }));
    return true;
  },
  reloadWeapon: () => set((state) => {
    if (state.ammo >= state.magSize || state.reserveAmmo <= 0) return state;
    const needed = state.magSize - state.ammo;
    const taken = Math.min(needed, state.reserveAmmo);
    return { ammo: state.ammo + taken, reserveAmmo: state.reserveAmmo - taken };
  }),
  enemiesDefeated: 0,
  registerKill: () => set((state) => ({ enemiesDefeated: state.enemiesDefeated + 1 })),
  runEpoch: 0,
  resetCombat: () => set((state) => ({
    playerHealth: MAX_HEALTH,
    lastHitAt: 0,
    ammo: MAG_SIZE,
    reserveAmmo: START_RESERVE,
    enemiesDefeated: 0,
    runEpoch: state.runEpoch + 1,
  })),

  // ── Mission ──
  missionStatus: 'idle',
  currentFloor: 1,
  floorsCleared: 0,
  missionTimer: MISSION_TIME,
  bombFound: false,
  floorDefused: false,
  defusing: false,
  alerted: false,
  lastSeenAt: 0,
  floorStartAt: 0,
  failReason: '',

  startMission: () => {
    set((state) => ({
      missionStatus: 'active',
      currentFloor: 1,
      floorsCleared: 0,
      missionTimer: MISSION_TIME,
      bombFound: false,
      floorDefused: false,
      defusing: false,
      alerted: false,
      lastSeenAt: 0,
      floorStartAt: Date.now(),
      failReason: '',
      searchedIds: [],
      bombRevealed: false,
      investigationMode: false,
      radioLog: [],
      missionNotes: [],
      hostagesSaved: 0,
      savedHostages: [],
      damageTaken: 0,
      strikesTaken: 0,
      lightsOut: false,
      cluesFound: [],
      playerHealth: MAX_HEALTH,
      lastHitAt: 0,
      ammo: MAG_SIZE,
      reserveAmmo: START_RESERVE,
      enemiesDefeated: 0,
      runEpoch: state.runEpoch + 1,
    }));
    get().pushRadio('HQ: You\'re in. Two floors, two bombs, fifteen minutes. Move fast, stay dark.', 'warn');
  },

  // Advancing a floor does NOT reset the clock — it's one 15-minute run.
  enterFloor: (floor) => {
    set((state) => ({
      currentFloor: floor,
      bombFound: false,
      floorDefused: false,
      defusing: false,
      alerted: false,
      lastSeenAt: 0,
      floorStartAt: Date.now(),
      searchedIds: [],
      bombRevealed: false,
      investigationMode: false,
      lightsOut: false,
      cluesFound: [],
      playerHealth: MAX_HEALTH, // patched up between floors
      ammo: Math.max(state.ammo, MAG_SIZE),
      runEpoch: state.runEpoch + 1,
    }));
    get().pushRadio('HQ: New floor. Sweep for the device — clock\'s still running.', 'info');
  },

  tickMission: (delta) => {
    const { missionStatus, missionTimer } = get();
    if (missionStatus !== 'active') return;
    const next = missionTimer - delta;
    if (next <= 0) {
      playExplosion();
      set({ missionTimer: 0, missionStatus: 'failed', defusing: false, failReason: 'Out of time — the bombs detonated across the tower.' });
      return;
    }
    // Time-warning radio calls when crossing thresholds.
    for (const th of [300, 120, 60]) {
      if (missionTimer > th && next <= th) {
        const m = Math.round(th / 60);
        get().pushRadio(`HQ: ${m} minute${m === 1 ? '' : 's'} to detonation. Move.`, 'warn');
      }
    }
    set({ missionTimer: next });
  },

  penalizeTime: (seconds) => set((state) => {
    const next = state.missionTimer - seconds;
    if (next <= 0) {
      return { missionTimer: 0, missionStatus: 'failed', defusing: false, failReason: 'Out of time — the bombs detonated across the tower.' };
    }
    return { missionTimer: next };
  }),

  findBomb: () => set({ bombFound: true }),
  setDefusing: (open) => set({ defusing: open }),

  defuseCurrentFloor: () => {
    set((state) => ({
      floorDefused: true,
      defusing: false,
      floorsCleared: Math.max(state.floorsCleared, state.currentFloor),
    }));
    playDefuseOk();
    get().pushRadio('HQ: Device neutralized. Outstanding — get to the elevator.', 'good');
  },

  advanceFloor: () => {
    const { currentFloor } = get();
    if (currentFloor >= TOTAL_FLOORS) {
      set({ missionStatus: 'complete' });
    } else {
      get().enterFloor(currentFloor + 1);
    }
  },

  readingClue: null,
  setReadingClue: (clue) => set({ readingClue: clue }),
  interactPrompt: null,
  setInteractPrompt: (p) => set({ interactPrompt: p }),

  investigationMode: false,
  toggleInvestigation: () => set((s) => ({ investigationMode: !s.investigationMode })),
  radioLog: [],
  pushRadio: (text, tone = 'info') => set((s) => {
    if (s.radioLog[0]?.text === text) return s; // de-dupe repeats
    radioSeq += 1;
    playBlip(tone === 'warn' ? 380 : tone === 'good' ? 720 : 560, 0.07);
    return { radioLog: [{ id: radioSeq, text, tone }, ...s.radioLog].slice(0, 8) };
  }),
  missionNotes: [],
  addNote: (note) => set((s) => (s.missionNotes.includes(note) ? s : { missionNotes: [...s.missionNotes, note] })),
  searchedIds: [],
  markSearched: (id) => set((s) => (s.searchedIds.includes(id) ? s : { searchedIds: [...s.searchedIds, id] })),
  bombRevealed: false,
  revealBomb: () => set({ bombRevealed: true, bombFound: true }),
  hostagesSaved: 0,
  savedHostages: [],
  rescueHostage: (id, note) => {
    const { savedHostages } = get();
    if (savedHostages.includes(id)) return;
    set((s) => ({ hostagesSaved: s.hostagesSaved + 1, savedHostages: [...s.savedHostages, id] }));
    get().addNote(note);
    get().setReadingClue({ label: 'Hostage freed', text: note });
    get().pushRadio('HQ: Hostage secured. Keep going — get them all out.', 'good');
  },
  damageTaken: 0,
  strikesTaken: 0,
  addStrike: () => set((s) => ({ strikesTaken: s.strikesTaken + 1 })),
  lightsOut: false,
  setLightsOut: (v) => set({ lightsOut: v }),

  reportSighting: () => {
    const now = Date.now();
    const { alerted } = get();
    if (!alerted) {
      set({ alerted: true, lastSeenAt: now });
      playAlarm();
      get().pushRadio('HQ: You\'ve been made — hostiles engaging your position!', 'warn');
    } else {
      set({ lastSeenAt: now });
    }
  },
  calmDown: () => {
    if (get().alerted) get().pushRadio('HQ: You\'ve lost them. Stay quiet.', 'good');
    set({ alerted: false });
  },

  failMission: (reason) => {
    playExplosion();
    set({ missionStatus: 'failed', defusing: false, failReason: reason });
  },

  resetMission: () => set((state) => {
    return {
      missionStatus: 'active',
      currentFloor: 1,
      floorsCleared: 0,
      missionTimer: MISSION_TIME,
      bombFound: false,
      floorDefused: false,
      defusing: false,
      alerted: false,
      lastSeenAt: 0,
      floorStartAt: Date.now(),
      failReason: '',
      searchedIds: [],
      bombRevealed: false,
      investigationMode: false,
      radioLog: [],
      missionNotes: [],
      hostagesSaved: 0,
      savedHostages: [],
      damageTaken: 0,
      strikesTaken: 0,
      lightsOut: false,
      cluesFound: [],
      playerHealth: MAX_HEALTH,
      lastHitAt: 0,
      ammo: MAG_SIZE,
      reserveAmmo: START_RESERVE,
      enemiesDefeated: 0,
      runEpoch: state.runEpoch + 1,
    };
  }),

  solvedCases: loadSolvedCases(),
  markCaseSolved: (caseId) => set((state) => {
    if (state.solvedCases.includes(caseId)) return state;
    const solvedCases = [...state.solvedCases, caseId];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SOLVED_CASES_KEY, JSON.stringify(solvedCases));
    }
    return { solvedCases };
  }),
  resetCase: () => set({
    cluesFound: [],
    targetedClueId: null,
    notebookOpen: false,
    isInspecting: false,
    inspectedObjectId: null,
    interactables: {},
    targetedInteractId: null,
    playerHealth: MAX_HEALTH,
    lastHitAt: 0,
    ammo: MAG_SIZE,
    reserveAmmo: START_RESERVE,
    enemiesDefeated: 0,
    // Clear any leftover mission state so non-mission cases (01/03) aren't blocked by
    // a stale 'failed'/'complete' status from a previous Case 02 session.
    missionStatus: 'idle',
    defusing: false,
    floorDefused: false,
    bombFound: false,
    bombRevealed: false,
    alerted: false,
    readingClue: null,
    interactPrompt: null,
    runEpoch: get().runEpoch + 1,
  }),
}));
