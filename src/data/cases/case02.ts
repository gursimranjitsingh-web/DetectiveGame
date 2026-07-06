import type { CaseDefinition } from '../caseTypes';

/*
 * CASE 02 — "Zero Hour" (multi-floor bomb-defusal rescue)
 *
 * This case is not an interrogation mystery — it runs on the building/floor system
 * (see src/data/floors.ts and BuildingScene). This definition only supplies the menu
 * card and the pre-mission briefing; gameplay state lives in the mission store slice.
 */
export const case02: CaseDefinition = {
  id: 'case-02',
  number: '02',
  title: 'Zero Hour',
  synopsis:
    "9:14 PM. Lookfinity Tower goes dark. An armed crew has seized both floors, herded the night staff — your colleagues — into locked rooms, and wired a bomb to each level. Two bombs. Two timers. One of you on the outside who can still get in.\n\nThe police can't breach in time. You can. Go up floor by floor: stay out of the intruders' sightlines, scavenge the notes and codes they left lying around, find each bomb, and defuse it before the clock hits zero. Get spotted and they open fire — so move smart, and shoot only when you have to.\n\nClear both floors and every hostage walks out. Miss one timer, and the tower comes down.",
  introDialogue:
    "Move: W/A/S/D, Shift to sprint, drag to look. Fire: Q. Reload: R. Interact (read clues, open the defuser, call the elevator): E. Find the bomb on each floor, gather the clues that reveal its defuse sequence, and disarm it before the timer runs out. The elevator only unlocks once the floor is clear.",
  objectives: [
    'Ascend both floors of Lookfinity Tower.',
    'On each floor: avoid detection, collect the clues, and locate the bomb.',
    'Solve the multi-step defuse (wires · keypad · switches) before the timer hits zero.',
    'Clear every floor to free the hostages. Any bomb that detonates fails the mission.',
  ],
  // The mission does not use the evidence/interrogation systems.
  playerBounds: { x: 0, z: 0 },
  cameraStart: [0, 1.7, 0],
  questionLabels: {},
  evidenceItems: [],
  suspects: [],
  resolveAccusation: () => ({ outcome: 'lose', dialogue: '' }),
};
