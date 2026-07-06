// Registry of interactable mission objects (hostages, clues, cabinets, the bomb, the
// elevator). A single targeting system picks the one the player is looking at and shows
// ONE HUD prompt for it — replacing the old per-object world-space HTML labels that
// blew up huge and overlapped when several were nearby.

export interface InteractEntry {
  id: string;
  pos: [number, number, number];
  label: string;
  verb: string;         // e.g. 'Free', 'Search', 'Read', 'Inspect', 'Defuse', 'Use'
  isActive: () => boolean;
  interact: () => void;
}

const entries = new Map<string, InteractEntry>();

export function registerInteract(entry: InteractEntry): () => void {
  entries.set(entry.id, entry);
  return () => {
    entries.delete(entry.id);
  };
}

export function interactEntries(): InteractEntry[] {
  return [...entries.values()];
}
